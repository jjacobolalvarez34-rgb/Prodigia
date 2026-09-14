-- ====================================================================
-- PRODIGIA — Invitar amigos al clan (pedido del propietario).
--
-- Hoy no existe ningún concepto de "invitación a un clan": la única
-- vía de ingreso es buscar_clanes + unirse_a_clan (abierto a
-- cualquiera, sin aprobación — ver ClanesClient.tsx). Esta migración
-- agrega una vía nueva y separada: un fundador o guía invita
-- directamente a un amigo suyo, que puede aceptar o rechazar.
--
-- Mismo criterio que el resto de clanes (0068): toda escritura pasa
-- por funciones security definer, la tabla no tiene policies de
-- insert/update/delete (solo select, para poder usar Realtime desde
-- la campanita de notificaciones).
-- ====================================================================

create table if not exists public.clan_invitaciones (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clanes(id) on delete cascade,
  invitador_id uuid not null references public.profiles(id) on delete cascade,
  invitado_id uuid not null references public.profiles(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aceptada', 'rechazada', 'cancelada')),
  creado_at timestamptz not null default now(),
  constraint clan_invitaciones_no_autoinvitacion check (invitador_id <> invitado_id)
);

-- Como máximo una invitación PENDIENTE por (clan, invitado) — evita
-- spamear al mismo amigo con invitaciones repetidas mientras la
-- anterior sigue sin responder.
create unique index if not exists clan_invitaciones_pendiente_unica
  on public.clan_invitaciones (clan_id, invitado_id)
  where estado = 'pendiente';

create index if not exists clan_invitaciones_invitado_idx
  on public.clan_invitaciones (invitado_id) where estado = 'pendiente';

alter table public.clan_invitaciones enable row level security;

create policy "clan_invitaciones: lectura propia" on public.clan_invitaciones
  for select using (auth.uid() = invitado_id or auth.uid() = invitador_id);

-- Habilita Realtime sobre esta tabla (para que la campanita de
-- notificaciones pueda avisar sin polling) — mismo patrón guardado
-- que ya usan duels/duel_invites desde 0038.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'clan_invitaciones'
  ) then
    alter publication supabase_realtime add table public.clan_invitaciones;
  end if;
end $$;

-- ---------- invitar_a_clan: fundador o guía invita a un amigo ----------
create or replace function public.invitar_a_clan(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_clan uuid;
  v_mi_rol text;
  v_capacidad integer;
  v_cantidad integer;
  v_invitacion_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_user_id = v_user then
    raise exception 'no te podés invitar a vos mismo';
  end if;

  select clan_id, rol into v_mi_clan, v_mi_rol from public.clan_membresias where user_id = v_user;
  if v_mi_clan is null then
    raise exception 'no estás en ningún clan';
  end if;
  if v_mi_rol not in ('fundador', 'guia') then
    raise exception 'solo el fundador o los guías pueden invitar';
  end if;

  if not exists (
    select 1 from public.friendships
    where estado = 'aceptada'
      and ((user_id = v_user and friend_id = p_user_id) or (user_id = p_user_id and friend_id = v_user))
  ) then
    raise exception 'solo podés invitar a amigos';
  end if;

  if exists (select 1 from public.clan_membresias where user_id = p_user_id) then
    raise exception 'esa persona ya está en un clan';
  end if;

  select count(*) into v_cantidad from public.clan_membresias where clan_id = v_mi_clan;
  v_capacidad := public.capacidad_clan(public.nivel_clan(v_mi_clan));
  if v_cantidad >= v_capacidad then
    raise exception 'tu clan está lleno — no hay casas libres';
  end if;

  if exists (
    select 1 from public.clan_invitaciones
    where clan_id = v_mi_clan and invitado_id = p_user_id and estado = 'pendiente'
  ) then
    raise exception 'ya tiene una invitación pendiente a tu clan';
  end if;

  insert into public.clan_invitaciones (clan_id, invitador_id, invitado_id)
  values (v_mi_clan, v_user, p_user_id)
  returning id into v_invitacion_id;

  return v_invitacion_id;
end;
$$;

grant execute on function public.invitar_a_clan(uuid) to authenticated;

-- ---------- responder_invitacion_clan: el invitado acepta o rechaza ----------
create or replace function public.responder_invitacion_clan(p_invitacion_id uuid, p_aceptar boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_inv public.clan_invitaciones%rowtype;
  v_capacidad integer;
  v_cantidad integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_inv from public.clan_invitaciones where id = p_invitacion_id;
  if not found or v_inv.invitado_id <> v_user then
    raise exception 'esa invitación no existe';
  end if;
  if v_inv.estado <> 'pendiente' then
    raise exception 'esa invitación ya se respondió';
  end if;

  if not p_aceptar then
    update public.clan_invitaciones set estado = 'rechazada' where id = p_invitacion_id;
    return;
  end if;

  -- Puede haber cambiado desde que se mandó la invitación: re-chequeo
  -- todo igual que unirse_a_clan antes de aceptar de verdad.
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — salí del actual antes de unirte a otro';
  end if;

  select count(*) into v_cantidad from public.clan_membresias where clan_id = v_inv.clan_id;
  v_capacidad := public.capacidad_clan(public.nivel_clan(v_inv.clan_id));
  if v_cantidad >= v_capacidad then
    update public.clan_invitaciones set estado = 'cancelada' where id = p_invitacion_id;
    raise exception 'ese clan ya está lleno';
  end if;

  insert into public.clan_membresias (clan_id, user_id, rol) values (v_inv.clan_id, v_user, 'miembro');
  update public.clan_invitaciones set estado = 'aceptada' where id = p_invitacion_id;

  -- Cualquier otra invitación pendiente a otros clanes queda sin
  -- sentido apenas te uniste a uno — se cancelan solas.
  update public.clan_invitaciones
  set estado = 'cancelada'
  where invitado_id = v_user and estado = 'pendiente' and id <> p_invitacion_id;
end;
$$;

grant execute on function public.responder_invitacion_clan(uuid, boolean) to authenticated;

-- ---------- cancelar_invitacion_clan: el invitador se arrepiente ----------
create or replace function public.cancelar_invitacion_clan(p_invitacion_id uuid)
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

  update public.clan_invitaciones
  set estado = 'cancelada'
  where id = p_invitacion_id and invitador_id = v_user and estado = 'pendiente';
end;
$$;

grant execute on function public.cancelar_invitacion_clan(uuid) to authenticated;

-- ---------- mis_invitaciones_clan: para la campanita ----------
create or replace function public.mis_invitaciones_clan()
returns table (
  invitacion_id uuid,
  clan_id uuid,
  nombre text,
  tag text,
  color_estandarte text,
  nivel_clan integer,
  invitador_nombre text,
  creado_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select ci.id, c.id, c.nombre, c.tag, c.color_estandarte, public.nivel_clan(c.id), p.display_name, ci.creado_at
  from public.clan_invitaciones ci
  join public.clanes c on c.id = ci.clan_id
  join public.profiles p on p.id = ci.invitador_id
  where ci.invitado_id = auth.uid() and ci.estado = 'pendiente'
  order by ci.creado_at desc;
$$;

grant execute on function public.mis_invitaciones_clan() to authenticated;

-- ---------- amigos_invitables_a_mi_clan: para el selector de invitar ----------
-- Mis amigos que todavía no están en ningún clan y no tienen ya una
-- invitación pendiente al MÍO — así el fundador/guía no pierde tiempo
-- mostrando gente que ya no se puede invitar.
create or replace function public.amigos_invitables_a_mi_clan()
returns table (user_id uuid, display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_clan uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select clan_id into v_mi_clan from public.clan_membresias where user_id = v_user;
  if v_mi_clan is null then
    return;
  end if;

  return query
    select a.friend_id, a.display_name
    from public.mis_amigos() a
    where not exists (select 1 from public.clan_membresias cm where cm.user_id = a.friend_id)
      and not exists (
        select 1 from public.clan_invitaciones ci
        where ci.clan_id = v_mi_clan and ci.invitado_id = a.friend_id and ci.estado = 'pendiente'
      );
end;
$$;

grant execute on function public.amigos_invitables_a_mi_clan() to authenticated;

notify pgrst, 'reload schema';
