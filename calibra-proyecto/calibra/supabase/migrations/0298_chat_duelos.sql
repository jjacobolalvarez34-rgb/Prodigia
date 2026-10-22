-- ============================================================
-- Prodigia — Retar a duelo desde el chat entre amigos (pedido del usuario,
-- 2026-10-21).
--
-- El duelo se crea con el flujo de siempre (/api/amigos/retar en la web,
-- retarAmigo en la app: fila de «duels» en estado 'pendiente', amistoso). Después,
-- quien retó llama a enviar_reto_chat(duelo) y aparece en la conversación un
-- mensaje especial con el reto y su estado:
--   pendiente  → enviado, esperando respuesta (vence con el reto: 2 minutos)
--   aceptada   → el retado lo aceptó (o el duelo ya se jugó)
--   rechazada  → el retado lo rechazó
--   cancelada  → quien retó lo canceló (o salió de la sala)
--   vencida    → nadie respondió a tiempo
--
-- Los retos se borran de «duels» al rechazarlos o al vencer (0047, 0256), así que
-- el estado se guarda aparte, en mensajes_duelo. Un trigger sobre «duels» lo
-- actualiza cuando el duelo se borra por cualquier camino (el aviso flotante, la
-- sala que se cansa de esperar, la limpieza de vencidos), sin redefinir ninguna
-- función existente.
--
-- El mensaje en sí es una fila normal de mensajes_directos con un texto fijo
-- («Te reto a un duelo»): las versiones viejas de la web y la app lo muestran como
-- texto y la lista de conversaciones lo usa de vista previa.
--
-- Idempotente: se puede correr más de una vez. Requiere 0245 (hay_bloqueo) y
-- 0256 (vigencia_invitacion_duelo).
-- ============================================================

create table if not exists public.mensajes_duelo (
  mensaje_id uuid primary key references public.mensajes_directos(id) on delete cascade,
  -- Sin FK: el duelo se borra al rechazarlo o vencer, y el mensaje queda.
  duel_id uuid not null unique,
  retador_id uuid not null references public.profiles(id) on delete cascade,
  retado_id uuid not null references public.profiles(id) on delete cascade,
  mundo text not null,
  sub_tipo text,
  operation_type text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aceptada', 'rechazada', 'cancelada', 'vencida')),
  expira_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists mensajes_duelo_par_idx
  on public.mensajes_duelo (least(retador_id, retado_id), greatest(retador_id, retado_id), created_at desc);

alter table public.mensajes_duelo enable row level security;
-- Sin policies a propósito: todo pasa por las funciones de abajo (igual que
-- mensajes_directos).

-- ---------- Estado vigente de un reto (lo guardado + lo que pasa en «duels») ----------
create or replace function public._estado_reto_chat(p_estado text, p_duel_id uuid, p_expira timestamptz)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_estado in ('rechazada', 'cancelada', 'vencida') then p_estado
    when d.id is null then
      case
        when p_estado = 'aceptada' then 'aceptada'
        when now() >= p_expira - interval '10 seconds' then 'vencida'
        else 'cancelada'
      end
    when d.estado <> 'pendiente' or exists (select 1 from public.duel_results r where r.duel_id = d.id) then 'aceptada'
    when p_estado = 'aceptada' then 'aceptada'
    when now() >= p_expira then 'vencida'
    else 'pendiente'
  end
  from (select 1) as uno
  left join public.duels d on d.id = p_duel_id;
$$;
revoke execute on function public._estado_reto_chat(text, uuid, timestamptz) from public, anon, authenticated;

-- ---------- Mandar el reto al chat (después de crear el duelo) ----------
create or replace function public.enviar_reto_chat(p_duel_id uuid)
returns table (id uuid, created_at timestamptz, texto text, expira_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duelo record;
  v_existente record;
  v_id uuid;
  v_creado timestamptz;
  v_expira timestamptz;
  v_texto text := 'Te reto a un duelo';
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duelo from public.duels d where d.id = p_duel_id;
  if v_duelo.id is null then
    raise exception 'el duelo no existe';
  end if;
  if v_duelo.retador_id <> v_user then
    raise exception 'solo quien reta puede mandar el reto';
  end if;

  -- Ya estaba en el chat: se devuelve el mismo mensaje (reintentos).
  select md.id as mid, md.created_at as creado, md.texto as txt, m.expira_at as expira
  into v_existente
  from public.mensajes_duelo m
  join public.mensajes_directos md on md.id = m.mensaje_id
  where m.duel_id = p_duel_id;
  if v_existente.mid is not null then
    return query select v_existente.mid, v_existente.creado, v_existente.txt, v_existente.expira;
    return;
  end if;

  if v_duelo.estado <> 'pendiente' then
    raise exception 'el duelo ya no está pendiente';
  end if;
  if public.hay_bloqueo(v_user, v_duelo.retado_id) then
    raise exception 'no puedes mandarle mensajes a este jugador';
  end if;
  if not public.son_amigos(v_user, v_duelo.retado_id) then
    raise exception 'solo puedes mandar mensajes a tus amigos';
  end if;

  v_expira := v_duelo.creado_at + public.vigencia_invitacion_duelo(v_duelo.retador_id, v_duelo.retado_id);

  insert into public.mensajes_directos (remitente_id, destinatario_id, texto)
  values (v_user, v_duelo.retado_id, v_texto)
  returning mensajes_directos.id, mensajes_directos.created_at into v_id, v_creado;

  insert into public.mensajes_duelo (mensaje_id, duel_id, retador_id, retado_id, mundo, sub_tipo, operation_type, expira_at)
  values (v_id, v_duelo.id, v_duelo.retador_id, v_duelo.retado_id, coalesce(v_duelo.mundo, 'numeria'), v_duelo.sub_tipo, v_duelo.operation_type, v_expira);

  return query select v_id, v_creado, v_texto, v_expira;
end;
$$;
grant execute on function public.enviar_reto_chat(uuid) to authenticated;

-- ---------- Los retos de una conversación (con su estado al día) ----------
create or replace function public.retos_de_conversacion(p_amigo uuid)
returns table (
  mensaje_id uuid,
  duel_id uuid,
  retador_id uuid,
  mundo text,
  sub_tipo text,
  operation_type text,
  estado text,
  expira_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  return query
    select m.mensaje_id, m.duel_id, m.retador_id, m.mundo, m.sub_tipo, m.operation_type,
      public._estado_reto_chat(m.estado, m.duel_id, m.expira_at),
      m.expira_at
    from public.mensajes_duelo m
    where (m.retador_id = v_user and m.retado_id = p_amigo)
       or (m.retador_id = p_amigo and m.retado_id = v_user)
    order by m.created_at desc
    limit 100;
end;
$$;
grant execute on function public.retos_de_conversacion(uuid) to authenticated;

-- ---------- Responder desde el chat: aceptar, rechazar o cancelar ----------
-- Devuelve el estado que queda. Si el reto ya no estaba pendiente, no cambia nada
-- y devuelve el estado real (por ejemplo «vencida»).
create or replace function public.responder_reto_chat(p_mensaje_id uuid, p_accion text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_reto record;
  v_actual text;
  v_nuevo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_reto from public.mensajes_duelo m where m.mensaje_id = p_mensaje_id for update;
  if v_reto.mensaje_id is null or (v_reto.retador_id <> v_user and v_reto.retado_id <> v_user) then
    raise exception 'reto no encontrado';
  end if;

  v_actual := public._estado_reto_chat(v_reto.estado, v_reto.duel_id, v_reto.expira_at);
  if v_actual <> 'pendiente' then
    if v_actual <> v_reto.estado then
      update public.mensajes_duelo m set estado = v_actual where m.mensaje_id = p_mensaje_id;
    end if;
    return v_actual;
  end if;

  if p_accion = 'aceptar' then
    if v_user <> v_reto.retado_id then
      raise exception 'solo el retado puede aceptar';
    end if;
    update public.mensajes_duelo m set estado = 'aceptada' where m.mensaje_id = p_mensaje_id;
    return 'aceptada';
  end if;

  if p_accion in ('rechazar', 'cancelar') then
    v_nuevo := case when v_user = v_reto.retado_id then 'rechazada' else 'cancelada' end;
    update public.mensajes_duelo m set estado = v_nuevo where m.mensaje_id = p_mensaje_id;
    -- Igual que rechazar_duelo: el duelo pendiente desaparece para los dos.
    delete from public.duels d
    where d.id = v_reto.duel_id
      and d.estado = 'pendiente'
      and not exists (select 1 from public.duel_results r where r.duel_id = d.id);
    return v_nuevo;
  end if;

  raise exception 'acción inválida';
end;
$$;
grant execute on function public.responder_reto_chat(uuid, text) to authenticated;

-- ---------- Si el duelo se borra por otro camino, el mensaje se entera ----------
create or replace function public._reto_chat_duelo_borrado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.estado = 'pendiente' then
    update public.mensajes_duelo m
    set estado = case
      when now() >= m.expira_at - interval '10 seconds' then 'vencida'
      when m.estado = 'pendiente' and auth.uid() = old.retado_id then 'rechazada'
      else 'cancelada'
    end
    where m.duel_id = old.id and m.estado in ('pendiente', 'aceptada');
  end if;
  return old;
end;
$$;
revoke execute on function public._reto_chat_duelo_borrado() from public, anon, authenticated;

drop trigger if exists duels_reto_chat_borrado on public.duels;
create trigger duels_reto_chat_borrado
  after delete on public.duels
  for each row execute function public._reto_chat_duelo_borrado();

notify pgrst, 'reload schema';
