-- ============================================================
-- Prodigia — Mensajes: responder a un mensaje concreto (como en WhatsApp o
-- Instagram) y avisos de mensajes nuevos, en los mensajes directos y en el
-- chat de clan (pedido del usuario, 2026-09-25).
--
-- 1) RESPONDER A UN MENSAJE
--    `mensajes_directos.responde_a` y `clan_mensajes.responde_a` guardan el id
--    del mensaje citado (on delete set null: si el original desaparece, la
--    respuesta se queda como mensaje normal). Las funciones de enviar y leer se
--    recrean con el dato extra; el mensaje citado se devuelve ya resuelto
--    (texto recortado a 140 caracteres y quién lo escribió), así el cliente no
--    necesita otro viaje. Solo se puede responder a un mensaje de la MISMA
--    conversación (o del mismo clan): se valida en el servidor.
--    Las 3 redes de seguridad (filtro de palabras, reporte, 20 por minuto) y el
--    tope de 500 caracteres quedan idénticos a 0198 / 0135.
--
-- 2) AVISOS DE MENSAJES NUEVOS
--    - Directos: `mis_conversaciones()` (0198) ya cuenta los no leídos; se agrega
--      `marcar_conversacion_leida()` para marcar como leído lo que llegó EN VIVO
--      mientras el chat estaba abierto (antes solo se marcaba al abrirlo, así que
--      esos mensajes seguirían contando como no leídos).
--    - Clan: no había estado de lectura. Se agrega `clan_chat_lectura` (hasta
--      cuándo leyó cada persona) con `clan_chat_resumen()` (clan y cantidad de
--      mensajes ajenos sin leer) y `marcar_chat_clan_leido()`. La primera vez que
--      alguien consulta el resumen se toma "ahora" como punto de partida: no
--      aparece de golpe un montón de mensajes viejos como "nuevos".
--
-- Como en 0198/0092, la tabla nueva no tiene ninguna policy: todo pasa por
-- funciones security definer. Los nombres de las columnas de salida de las
-- funciones nuevas NO coinciden con columnas de tablas (lección del error
-- 42702 de 0100/0135); en las recreadas se califica cada columna con su alias.
--
-- Cambian firmas, así que van con drop + create (y sus grants). Idempotente
-- salvo por el orden: correr después de 0198.
-- ============================================================

-- ---------- 1) columnas de respuesta ----------
alter table public.mensajes_directos
  add column if not exists responde_a uuid references public.mensajes_directos(id) on delete set null;
alter table public.clan_mensajes
  add column if not exists responde_a uuid references public.clan_mensajes(id) on delete set null;

-- ---------- 2) mensajes directos: enviar (con respuesta) ----------
drop function if exists public.enviar_mensaje_directo(uuid, text);

create function public.enviar_mensaje_directo(p_destinatario_id uuid, p_texto text, p_responde_a uuid default null)
returns table (id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_texto text := trim(p_texto);
  v_mensajes_ultimo_minuto integer;
  v_id uuid;
  v_created_at timestamptz;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_destinatario_id = v_user then
    raise exception 'no puedes mandarte mensajes a ti mismo';
  end if;
  if char_length(v_texto) < 1 or char_length(v_texto) > 500 then
    raise exception 'el mensaje tiene que tener entre 1 y 500 caracteres';
  end if;
  if not public.son_amigos(v_user, p_destinatario_id) then
    raise exception 'solo puedes mandar mensajes a tus amigos';
  end if;

  -- Solo se responde a un mensaje de ESTA conversación.
  if p_responde_a is not null and not exists (
    select 1 from public.mensajes_directos o
    where o.id = p_responde_a
      and ((o.remitente_id = v_user and o.destinatario_id = p_destinatario_id)
        or (o.remitente_id = p_destinatario_id and o.destinatario_id = v_user))
  ) then
    raise exception 'el mensaje al que respondes no existe';
  end if;

  select count(*) into v_mensajes_ultimo_minuto
  from public.mensajes_directos md
  where md.remitente_id = v_user and md.created_at >= now() - interval '1 minute';
  if v_mensajes_ultimo_minuto >= 20 then
    raise exception 'estás mandando mensajes muy rápido — espera un momento';
  end if;

  if public.contiene_termino_prohibido(v_texto) then
    raise exception 'el mensaje contiene un término no permitido';
  end if;

  insert into public.mensajes_directos (remitente_id, destinatario_id, texto, responde_a)
  values (v_user, p_destinatario_id, v_texto, p_responde_a)
  returning mensajes_directos.id, mensajes_directos.created_at into v_id, v_created_at;

  return query select v_id, v_created_at;
end;
$$;

grant execute on function public.enviar_mensaje_directo(uuid, text, uuid) to authenticated;

-- ---------- 3) mensajes directos: leer una conversación (con el mensaje citado) ----------
drop function if exists public.mi_conversacion(uuid);

create function public.mi_conversacion(p_amigo_id uuid)
returns table (
  id uuid,
  remitente_id uuid,
  destinatario_id uuid,
  texto text,
  leido boolean,
  created_at timestamptz,
  responde_a uuid,
  responde_a_texto text,
  responde_a_remitente_id uuid
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
  if not public.son_amigos(v_user, p_amigo_id) then
    raise exception 'no son amigos';
  end if;

  update public.mensajes_directos md
  set leido = true
  where md.destinatario_id = v_user and md.remitente_id = p_amigo_id and md.leido = false;

  return query
    select md.id, md.remitente_id, md.destinatario_id, md.texto, md.leido, md.created_at,
      md.responde_a, left(o.texto, 140), o.remitente_id
    from public.mensajes_directos md
    left join public.mensajes_directos o on o.id = md.responde_a
    where (md.remitente_id = v_user and md.destinatario_id = p_amigo_id)
       or (md.remitente_id = p_amigo_id and md.destinatario_id = v_user)
    order by md.created_at desc
    limit 100;
end;
$$;

grant execute on function public.mi_conversacion(uuid) to authenticated;

-- ---------- 4) mensajes directos: marcar como leída (mensajes llegados en vivo) ----------
create or replace function public.marcar_conversacion_leida(p_amigo_id uuid)
returns void
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
  update public.mensajes_directos md
  set leido = true
  where md.destinatario_id = v_user and md.remitente_id = p_amigo_id and md.leido = false;
end;
$$;

grant execute on function public.marcar_conversacion_leida(uuid) to authenticated;

-- ---------- 5) chat de clan: enviar (con respuesta) ----------
drop function if exists public.enviar_mensaje_clan(text);

create function public.enviar_mensaje_clan(p_texto text, p_responde_a uuid default null)
returns table (id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_clan_id uuid;
  v_texto text := trim(p_texto);
  v_mensajes_ultimo_minuto integer;
  v_id uuid;
  v_created_at timestamptz;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if char_length(v_texto) < 1 or char_length(v_texto) > 500 then
    raise exception 'el mensaje tiene que tener entre 1 y 500 caracteres';
  end if;

  select cm.clan_id into v_clan_id from public.clan_membresias cm where cm.user_id = v_user;
  if v_clan_id is null then
    raise exception 'no estás en ningún clan';
  end if;

  if p_responde_a is not null and not exists (
    select 1 from public.clan_mensajes o where o.id = p_responde_a and o.clan_id = v_clan_id
  ) then
    raise exception 'el mensaje al que respondes no existe';
  end if;

  select count(*) into v_mensajes_ultimo_minuto
  from public.clan_mensajes m
  where m.autor_id = v_user and m.created_at >= now() - interval '1 minute';
  if v_mensajes_ultimo_minuto >= 20 then
    raise exception 'estás mandando mensajes muy rápido — espera un momento';
  end if;

  if public.contiene_termino_prohibido(v_texto) then
    raise exception 'el mensaje contiene un término no permitido';
  end if;

  insert into public.clan_mensajes (clan_id, autor_id, texto, responde_a)
  values (v_clan_id, v_user, v_texto, p_responde_a)
  returning clan_mensajes.id, clan_mensajes.created_at into v_id, v_created_at;

  return query select v_id, v_created_at;
end;
$$;

grant execute on function public.enviar_mensaje_clan(text, uuid) to authenticated;

-- ---------- 6) chat de clan: leer (con el mensaje citado) ----------
drop function if exists public.mensajes_de_clan(uuid, integer);

create function public.mensajes_de_clan(p_clan_id uuid, p_limite integer default 100)
returns table (
  id uuid,
  autor_id uuid,
  autor_nombre text,
  autor_avatar_url text,
  texto text,
  created_at timestamptz,
  autor_fuente_nombre text,
  autor_animacion_nombre text,
  responde_a uuid,
  responde_a_texto text,
  responde_a_autor_id uuid,
  responde_a_autor_nombre text
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
  if not exists (select 1 from public.clan_membresias cm where cm.clan_id = p_clan_id and cm.user_id = v_user) then
    raise exception 'no eres miembro de este clan';
  end if;

  return query
    select m.id, m.autor_id, p.display_name, p.avatar_url, m.texto, m.created_at,
      p.fuente_nombre, p.animacion_nombre,
      m.responde_a, left(o.texto, 140), o.autor_id, po.display_name
    from public.clan_mensajes m
    join public.profiles p on p.id = m.autor_id
    left join public.clan_mensajes o on o.id = m.responde_a
    left join public.profiles po on po.id = o.autor_id
    where m.clan_id = p_clan_id
    order by m.created_at desc
    limit least(coalesce(p_limite, 100), 100);
end;
$$;

grant execute on function public.mensajes_de_clan(uuid, integer) to authenticated;

-- ---------- 7) chat de clan: estado de lectura ----------
create table if not exists public.clan_chat_lectura (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  clan_id uuid not null references public.clanes(id) on delete cascade,
  leido_hasta timestamptz not null default now()
);

alter table public.clan_chat_lectura enable row level security;
-- A propósito SIN ninguna policy: todo pasa por las funciones de abajo.

create or replace function public.clan_chat_resumen()
returns table (out_clan_id uuid, out_clan_nombre text, out_no_leidos bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_clan uuid;
  v_nombre text;
  v_hasta timestamptz;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select cm.clan_id, c.nombre into v_clan, v_nombre
  from public.clan_membresias cm
  join public.clanes c on c.id = cm.clan_id
  where cm.user_id = v_user;
  if v_clan is null then
    return;
  end if;

  select l.leido_hasta into v_hasta
  from public.clan_chat_lectura l
  where l.user_id = v_user and l.clan_id = v_clan;

  if v_hasta is null then
    -- Primera consulta (o cambió de clan): punto de partida = ahora.
    insert into public.clan_chat_lectura (user_id, clan_id, leido_hasta)
    values (v_user, v_clan, now())
    on conflict (user_id) do update set clan_id = excluded.clan_id, leido_hasta = excluded.leido_hasta;
    return query select v_clan, v_nombre, 0::bigint;
    return;
  end if;

  return query
    select v_clan, v_nombre, count(*)::bigint
    from public.clan_mensajes m
    where m.clan_id = v_clan and m.autor_id <> v_user and m.created_at > v_hasta;
end;
$$;

grant execute on function public.clan_chat_resumen() to authenticated;

create or replace function public.marcar_chat_clan_leido()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_clan uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select cm.clan_id into v_clan from public.clan_membresias cm where cm.user_id = v_user;
  if v_clan is null then
    return;
  end if;
  insert into public.clan_chat_lectura (user_id, clan_id, leido_hasta)
  values (v_user, v_clan, now())
  on conflict (user_id) do update set clan_id = excluded.clan_id, leido_hasta = excluded.leido_hasta;
end;
$$;

grant execute on function public.marcar_chat_clan_leido() to authenticated;

notify pgrst, 'reload schema';
