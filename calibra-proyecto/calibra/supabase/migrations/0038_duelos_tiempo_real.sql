-- ============================================================
-- Prodigia — duelos en tiempo real vía Supabase Realtime (Fase T3),
-- con la ventana de ELO progresiva de matchmaking ajustada (Fase S3)
-- Correr después de 0037_nombre_unico.sql
--
-- Este proyecto no usaba Realtime en NINGÚN lado hasta esta migración
-- (confirmado con grep sobre todo src/ antes de escribir esto) — es
-- integración nueva de punta a punta, no hay nada previo que migrar ni
-- con qué chocar.
-- ============================================================

-- ------------------------------------------------------------
-- Parte 1 (Fase S3) — ventana de ELO progresiva: ±30 al empezar,
-- +30 cada 10 segundos esperando (antes era ±15 / +15 cada 8s). Mismo
-- cuerpo de función, solo cambian las 2 constantes de la fórmula —
-- create or replace alcanza, no cambia el shape de salida así que no
-- hace falta drop.
-- ------------------------------------------------------------

create or replace function public.buscar_rival_duelo(p_operation_type text)
returns table (duel_id uuid, encontrado boolean, rango_actual integer, segundos_esperando integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_elo integer;
  v_entered timestamptz;
  v_rango integer;
  v_segundos integer;
  v_rival record;
  v_duel_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  insert into public.duel_queue (user_id, operation_type, elo_rating, entered_at)
  values (v_user, p_operation_type, v_mi_elo, now())
  on conflict (user_id) do update
    set operation_type = excluded.operation_type, elo_rating = excluded.elo_rating, entered_at = now()
    where public.duel_queue.operation_type <> excluded.operation_type;

  select entered_at into v_entered from public.duel_queue where user_id = v_user;
  v_segundos := greatest(0, extract(epoch from (now() - v_entered))::integer);

  -- ±30 al empezar, +30 cada 10 segundos esperando, tope en ±300.
  v_rango := least(300, 30 + (v_segundos / 10) * 30);

  select * into v_rival
  from public.duel_queue q
  where q.user_id <> v_user
    and q.operation_type = p_operation_type
    and abs(q.elo_rating - v_mi_elo) <= v_rango
  order by abs(q.elo_rating - v_mi_elo) asc
  for update skip locked
  limit 1;

  if v_rival.user_id is null then
    return query select null::uuid, false, v_rango, v_segundos;
    return;
  end if;

  delete from public.duel_queue where user_id in (v_user, v_rival.user_id);

  insert into public.duels (retador_id, retado_id, semilla_problemas, operation_type)
  values (v_user, v_rival.user_id, floor(random() * 1000000000)::bigint, p_operation_type)
  returning id into v_duel_id;

  return query select v_duel_id, true, v_rango, v_segundos;
end;
$$;

-- El GRANT ya existe de 0031 (create or replace no lo toca), se repite
-- igual por las dudas de que esta migración se corra en un proyecto que
-- no pasó por 0031 tal cual.
grant execute on function public.buscar_rival_duelo(text) to authenticated;

-- ------------------------------------------------------------
-- Parte 2 (Fase T3) — invitación de duelo amistoso por link compartible.
-- No requiere ser amigos: cualquiera con el link se puede unir. Es una
-- tabla aparte de "duels" porque, a diferencia de un reto entre amigos o
-- de un match de Rankeds, todavía no hay un segundo participante cuando
-- se crea — recién se crea la fila de "duels" cuando alguien se une.
-- ------------------------------------------------------------

create table public.duel_invites (
  id uuid primary key default gen_random_uuid(),
  creador_id uuid not null references public.profiles(id) on delete cascade,
  operation_type text not null check (operation_type in ('suma', 'resta', 'multiplicacion', 'division')),
  estado text not null default 'esperando' check (estado in ('esperando', 'usada', 'cancelada')),
  duel_id uuid references public.duels(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.duel_invites enable row level security;

-- Cualquiera autenticado puede leer una invitación por id — hace falta
-- para que quien recibe el link (sin ser amigo, sin que el sistema lo
-- conozca de antes) pueda abrirlo y ver de qué se trata antes de
-- unirse. Mismo patrón que "techniques"/"logic_puzzles" en 0001_init.sql
-- (contenido no sensible, lectura abierta a cualquier cuenta real).
create policy "cualquiera autenticado lee invitaciones de duelo"
  on public.duel_invites for select
  using (auth.role() = 'authenticated');

-- Nunca insert/update directo del cliente — todo pasa por las funciones
-- de abajo, mismo patrón que el resto del proyecto.

create function public.crear_invitacion_duelo(p_operation_type text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  -- Cancela cualquier invitación propia que haya quedado abierta antes
  -- de crear una nueva — evita que un usuario acumule links viejos
  -- "esperando" sin límite.
  update public.duel_invites set estado = 'cancelada'
  where creador_id = v_user and estado = 'esperando';

  insert into public.duel_invites (creador_id, operation_type)
  values (v_user, p_operation_type)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.crear_invitacion_duelo(text) to authenticated;

create function public.unirse_invitacion_duelo(p_invite_id uuid)
returns table (duel_id uuid, operation_type text, ya_unido boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_invite record;
  v_duel_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_invite from public.duel_invites where id = p_invite_id for update;
  if v_invite.id is null then
    raise exception 'invitacion no encontrada';
  end if;

  if v_invite.estado = 'usada' then
    -- Quien creó el duelo (o el propio invitado) recarga la página
    -- después de unirse — se le devuelve el mismo duelo en vez de
    -- fallar con un error confuso.
    if v_invite.duel_id is not null and (v_invite.creador_id = v_user or exists (
      select 1 from public.duels d where d.id = v_invite.duel_id and (d.retador_id = v_user or d.retado_id = v_user)
    )) then
      return query select v_invite.duel_id, v_invite.operation_type, true;
      return;
    end if;
    raise exception 'invitacion ya usada';
  end if;

  if v_invite.estado <> 'esperando' then
    raise exception 'invitacion no disponible';
  end if;

  if v_invite.creador_id = v_user then
    raise exception 'no podes unirte a tu propia invitacion';
  end if;

  insert into public.duels (retador_id, retado_id, semilla_problemas, operation_type)
  values (v_invite.creador_id, v_user, floor(random() * 1000000000)::bigint, v_invite.operation_type)
  returning id into v_duel_id;

  update public.duel_invites set estado = 'usada', duel_id = v_duel_id where id = p_invite_id;

  return query select v_duel_id, v_invite.operation_type, false;
end;
$$;

grant execute on function public.unirse_invitacion_duelo(uuid) to authenticated;

create function public.cancelar_invitacion_duelo(p_invite_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.duel_invites set estado = 'cancelada'
  where id = p_invite_id and creador_id = auth.uid() and estado = 'esperando';
$$;

grant execute on function public.cancelar_invitacion_duelo(uuid) to authenticated;

-- ------------------------------------------------------------
-- Parte 2b (Fase T3) — "duelos pendientes contra mí". Hallazgo al
-- construir esto: la policy de SELECT de "profiles" (0001_init.sql) solo
-- deja ver la fila propia (auth.uid() = id) — un select directo del
-- cliente para el nombre del retador de otra cuenta simplemente no
-- devuelve nada bajo RLS. Mismo patrón que el resto del proyecto para
-- este problema (obtener_duelo, mi_historial_duelos): security definer.
-- ------------------------------------------------------------

create function public.mis_duelos_pendientes()
returns table (duel_id uuid, operation_type text, creado_at timestamptz, retador_nombre text, retador_elo integer)
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
    select d.id, d.operation_type, d.creado_at,
      (select display_name from public.profiles where id = d.retador_id),
      (select elo_rating from public.profiles where id = d.retador_id)
    from public.duels d
    where d.retado_id = v_user
      and d.estado = 'pendiente'
      and not exists (select 1 from public.duel_results r where r.duel_id = d.id and r.user_id = v_user)
    order by d.creado_at desc;
end;
$$;

grant execute on function public.mis_duelos_pendientes() to authenticated;

-- ------------------------------------------------------------
-- Parte 3 (Fase T3) — habilitar Supabase Realtime (Postgres Changes)
-- sobre las tablas que hacen falta:
--  - duels: para que el retado se entere en vivo de un reto nuevo
--    (amigos, feed, o el "encontré rival" de matchmaking que hoy solo
--    le llega a quien hizo la llamada de buscar_rival_duelo que
--    encontró match — el otro lado se entera por acá).
--  - duel_invites: para que quien generó el link de invitación se
--    entere en vivo de que alguien se unió, sin tener que hacer polling.
-- Envuelto en un chequeo de "ya está" para que correr esto dos veces
-- (o en un proyecto donde ya se haya habilitado a mano desde el
-- dashboard) no tire error de "ya existe en la publicación".
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'duels'
  ) then
    alter publication supabase_realtime add table public.duels;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'duel_invites'
  ) then
    alter publication supabase_realtime add table public.duel_invites;
  end if;
end $$;

-- ⚠️ Si el bloque de arriba falla con algo como "publication
-- supabase_realtime does not exist": el proyecto no tiene la
-- publicación default de Supabase Realtime creada (poco común, pero
-- puede pasar en proyectos viejos). En ese caso, andá a Supabase
-- Dashboard → Database → Replication, y activá "duels" y
-- "duel_invites" a mano ahí — es la única parte de toda esta tanda que
-- podría necesitar un toque manual en el dashboard además de correr
-- este archivo.
