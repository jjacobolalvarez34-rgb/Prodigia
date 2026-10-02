-- ============================================================
-- 0245 — App Android: práctica sin conexión, controles por edad (PROD-02)
-- y bloqueo de jugadores.
--
-- 1) Práctica sin conexión: la app guarda en el teléfono los intentos que no
--    pudo mandar y los sube al volver la conexión. Cada intento lleva un
--    client_id (uuid generado en el teléfono); las funciones *_sincronizado lo
--    reclaman en intentos_sincronizados y recién ahí llaman a la función de
--    siempre, en la MISMA transacción: si la respuesta se pierde y la app
--    reintenta, el intento no se duplica. El XP se calcula igual que en línea
--    (insertar_intento / insertar_intento_logica) y cuenta para el día en que
--    se sincroniza. registrar_xp_diario y registrar_progreso_mundo ya son
--    idempotentes (suman el XP real de los intentos), así que no necesitan
--    versión nueva.
--
-- 2) Edad: profiles.fecha_nacimiento (mes y año, el día se guarda como 1). Se
--    registra una sola vez con registrar_fecha_nacimiento (el cliente no tiene
--    UPDATE sobre la columna, así que no se puede cambiar después). Menores de
--    13: en mensajes directos y en el chat del clan solo se mandan frases
--    rápidas (es_frase_rapida, la misma lista que mobile/src/lib/edad.ts); un
--    mensaje directo con un menor, en cualquiera de los dos sentidos, también;
--    y al leer el chat del clan un menor ve ocultos los mensajes de texto libre.
--    Sin fecha registrada no cambia nada (las cuentas viejas siguen igual
--    hasta que la app les pregunte).
--
-- 3) Bloqueos: bloquear a alguien rompe la amistad, impide nuevas solicitudes
--    en los dos sentidos y los mensajes directos.
-- ============================================================

-- ---------- 1) intentos sin conexión ----------
create table if not exists public.intentos_sincronizados (
  client_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.intentos_sincronizados enable row level security;
revoke all on public.intentos_sincronizados from anon, authenticated;

create or replace function public.insertar_intento_sincronizado(
  p_client_id uuid,
  p_problem_type text,
  p_level integer,
  p_correct boolean,
  p_time_ms integer,
  p_protegido boolean default false,
  p_calibrar boolean default false
)
returns table (xp integer, sospechoso boolean, nivel smallint, racha_actual smallint)
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
  insert into public.intentos_sincronizados (client_id, user_id)
  values (p_client_id, v_user)
  on conflict (client_id) do nothing;
  if not found then
    -- Ya se había subido: no se repite.
    return;
  end if;
  return query
    select i.xp, i.sospechoso, i.nivel, i.racha_actual
    from public.insertar_intento(p_problem_type, p_level, p_correct, p_time_ms, p_protegido, p_calibrar) i;
end;
$$;

grant execute on function public.insertar_intento_sincronizado(uuid, text, integer, boolean, integer, boolean, boolean) to authenticated;

create or replace function public.insertar_intento_logica_sincronizado(
  p_client_id uuid,
  p_puzzle_id text,
  p_dificultad integer,
  p_correct boolean,
  p_time_ms integer,
  p_categoria text,
  p_protegido boolean default false
)
returns table (xp integer, sospechoso boolean, nivel smallint, racha_actual smallint)
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
  insert into public.intentos_sincronizados (client_id, user_id)
  values (p_client_id, v_user)
  on conflict (client_id) do nothing;
  if not found then
    return;
  end if;
  return query
    select i.xp, i.sospechoso, i.nivel, i.racha_actual
    from public.insertar_intento_logica(p_puzzle_id, p_dificultad, p_correct, p_time_ms, p_categoria, p_protegido) i;
end;
$$;

grant execute on function public.insertar_intento_logica_sincronizado(uuid, text, integer, boolean, integer, text, boolean) to authenticated;

-- ---------- 2) edad ----------
alter table public.profiles add column if not exists fecha_nacimiento date;

-- Misma lista que FRASES_RAPIDAS de mobile/src/lib/edad.ts.
create or replace function public.es_frase_rapida(p_texto text)
returns boolean
language sql
immutable
as $$
  select trim(coalesce(p_texto, '')) = any (array[
    '¡Hola!', '¡Buena partida!', '¡Bien hecho!', '¡Gracias!', '¿Jugamos un duelo?',
    '¡Vamos, equipo!', '¡Lo logramos!', '¡Casi!', '¡Sigamos!', '¡Nos vemos!',
    '👍', '🔥', '🎉', '😂', '💪', '👏'
  ]);
$$;

grant execute on function public.es_frase_rapida(text) to authenticated;

-- Solo para uso interno de otras funciones (no se expone: diría la edad de otro).
create or replace function public.es_menor_13(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select pr.fecha_nacimiento > (current_date - interval '13 years')::date
     from public.profiles pr where pr.id = p_user),
    false
  );
$$;

revoke execute on function public.es_menor_13(uuid) from public, anon, authenticated;

create or replace function public.mi_estado_edad()
returns table (tiene_fecha boolean, es_menor boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fecha date;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.fecha_nacimiento into v_fecha from public.profiles pr where pr.id = v_user;
  return query select v_fecha is not null, coalesce(v_fecha > (current_date - interval '13 years')::date, false);
end;
$$;

grant execute on function public.mi_estado_edad() to authenticated;

create or replace function public.registrar_fecha_nacimiento(p_fecha date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actual date;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_fecha is null or p_fecha > current_date or p_fecha < date '1900-01-01' then
    raise exception 'fecha de nacimiento inválida';
  end if;
  select pr.fecha_nacimiento into v_actual from public.profiles pr where pr.id = v_user;
  if v_actual is not null then
    raise exception 'ya registraste tu fecha de nacimiento';
  end if;
  update public.profiles as pr set fecha_nacimiento = date_trunc('month', p_fecha)::date where pr.id = v_user;
  return date_trunc('month', p_fecha)::date > (current_date - interval '13 years')::date;
end;
$$;

grant execute on function public.registrar_fecha_nacimiento(date) to authenticated;

-- ---------- 3) bloqueos ----------
create table if not exists public.bloqueos_usuario (
  bloqueador_id uuid not null references auth.users(id) on delete cascade,
  bloqueado_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (bloqueador_id, bloqueado_id),
  check (bloqueador_id <> bloqueado_id)
);

alter table public.bloqueos_usuario enable row level security;

drop policy if exists "ves a quienes bloqueaste" on public.bloqueos_usuario;
create policy "ves a quienes bloqueaste"
  on public.bloqueos_usuario for select
  using (auth.uid() = bloqueador_id);

grant select on public.bloqueos_usuario to authenticated;

create or replace function public.hay_bloqueo(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bloqueos_usuario b
    where (b.bloqueador_id = p_a and b.bloqueado_id = p_b)
       or (b.bloqueador_id = p_b and b.bloqueado_id = p_a)
  );
$$;

revoke execute on function public.hay_bloqueo(uuid, uuid) from public, anon, authenticated;

create or replace function public.bloquear_usuario(p_user uuid)
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
  if p_user is null or p_user = v_user then
    raise exception 'no puedes bloquearte a ti mismo';
  end if;
  insert into public.bloqueos_usuario (bloqueador_id, bloqueado_id)
  values (v_user, p_user)
  on conflict do nothing;
  delete from public.friendships f
  where (f.user_id = v_user and f.friend_id = p_user) or (f.user_id = p_user and f.friend_id = v_user);
end;
$$;

grant execute on function public.bloquear_usuario(uuid) to authenticated;

create or replace function public.desbloquear_usuario(p_user uuid)
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
  delete from public.bloqueos_usuario b where b.bloqueador_id = v_user and b.bloqueado_id = p_user;
end;
$$;

grant execute on function public.desbloquear_usuario(uuid) to authenticated;

create or replace function public.mis_bloqueados()
returns table (id uuid, nombre text, avatar_url text, desde timestamptz)
language plpgsql
stable
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
    select b.bloqueado_id, p.display_name, p.avatar_url, b.created_at
    from public.bloqueos_usuario b
    join public.profiles p on p.id = b.bloqueado_id
    where b.bloqueador_id = v_user
    order by b.created_at desc;
end;
$$;

grant execute on function public.mis_bloqueados() to authenticated;

-- Ninguna solicitud de amistad entre dos jugadores con un bloqueo de por medio.
create or replace function public.friendships_sin_bloqueo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.hay_bloqueo(new.user_id, new.friend_id) then
    raise exception 'no puedes agregar a este jugador';
  end if;
  return new;
end;
$$;

drop trigger if exists friendships_sin_bloqueo on public.friendships;
create trigger friendships_sin_bloqueo
  before insert on public.friendships
  for each row execute function public.friendships_sin_bloqueo();

-- ---------- 4) mensajes: enviar con bloqueo y edad (misma firma que 0224) ----------
create or replace function public.enviar_mensaje_directo(p_destinatario_id uuid, p_texto text, p_responde_a uuid default null)
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
  if public.hay_bloqueo(v_user, p_destinatario_id) then
    raise exception 'no puedes mandarle mensajes a este jugador';
  end if;
  if not public.son_amigos(v_user, p_destinatario_id) then
    raise exception 'solo puedes mandar mensajes a tus amigos';
  end if;
  if (public.es_menor_13(v_user) or public.es_menor_13(p_destinatario_id)) and not public.es_frase_rapida(v_texto) then
    raise exception 'solo puedes mandar frases rápidas';
  end if;

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

create or replace function public.enviar_mensaje_clan(p_texto text, p_responde_a uuid default null)
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
  if public.es_menor_13(v_user) and not public.es_frase_rapida(v_texto) then
    raise exception 'solo puedes mandar frases rápidas';
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

-- ---------- 5) chat de clan: un menor ve ocultos los mensajes de texto libre ----------
create or replace function public.mensajes_de_clan(p_clan_id uuid, p_limite integer default 100)
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
  v_menor boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if not exists (select 1 from public.clan_membresias cm where cm.clan_id = p_clan_id and cm.user_id = v_user) then
    raise exception 'no eres miembro de este clan';
  end if;
  v_menor := public.es_menor_13(v_user);

  return query
    select m.id, m.autor_id, p.display_name, p.avatar_url,
      case when v_menor and not public.es_frase_rapida(m.texto) then 'Mensaje oculto' else m.texto end,
      m.created_at,
      p.fuente_nombre, p.animacion_nombre,
      m.responde_a,
      case when o.id is not null and v_menor and not public.es_frase_rapida(o.texto) then 'Mensaje oculto' else left(o.texto, 140) end,
      o.autor_id, po.display_name
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
