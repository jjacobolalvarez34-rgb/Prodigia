-- ============================================================
-- Prodigia — Clanes, Fase 9.1-9.4 (tanda nocturna): clanes reales
-- creables por jugadores, sobre la base ya construida del Clan de
-- Bots (0066_clan_de_bots.sql). Explícitamente EXCLUIDO de esta
-- migración: el mapa 2.5D animado de territorios — eso es un proyecto
-- de diseño técnico aparte, no se toca acá.
-- Correr después de 0067_quimia_nomenclatura_organica.sql
--
-- clan_miembros (0066) es SOLO para el roster del Clan de Bots (tiene
-- columnas de gameplay de bot: velocidad_ms_min/max, tasa_acierto) —
-- a propósito no se reutiliza para humanos. La membresía humana vive
-- en clan_membresias, tabla nueva.
-- ============================================================

-- ---------- Fase 9.1: esquema de clanes reales ----------
alter table public.clanes drop constraint clanes_tipo_check;
alter table public.clanes add constraint clanes_tipo_check check (tipo in ('bots', 'jugadores'));
alter table public.clanes add column if not exists owner_id uuid references public.profiles(id) on delete set null;
alter table public.clanes add column if not exists tag text check (tag is null or (length(tag) between 2 and 5));
alter table public.clanes add column if not exists color_estandarte text not null default '#6C4CF1';
-- Nombre único entre clanes reales (no entre el Clan de Bots, que es
-- uno solo) — evita confusión al buscar/unirse.
create unique index if not exists clanes_nombre_unico_jugadores on public.clanes (lower(nombre)) where tipo = 'jugadores';

create table if not exists public.clan_membresias (
  clan_id uuid not null references public.clanes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rol text not null default 'miembro' check (rol in ('lider', 'miembro')),
  unido_at timestamptz not null default now(),
  primary key (clan_id, user_id)
);
-- Un usuario real está en un solo clan a la vez — simplifica todo
-- (misiones, guerra semanal, estandarte en el perfil) sin perder nada
-- pedido explícitamente (no se pidió multi-clan).
create unique index if not exists clan_membresias_un_clan_por_usuario on public.clan_membresias (user_id);

alter table public.clan_membresias enable row level security;
create policy "cualquier autenticado ve las membresías (para listar miembros de un clan)"
  on public.clan_membresias for select
  using (auth.uid() is not null);
-- Sin policy de insert/update/delete directa — todo pasa por las
-- funciones de abajo (crear_clan / unirse_a_clan / salir_del_clan),
-- mismo criterio que el resto del proyecto.

-- ---------- Fase 9.2: misiones de clan ----------
create table if not exists public.clan_misiones (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clanes(id) on delete cascade,
  objetivo_tipo text not null check (objetivo_tipo = 'problemas_resueltos'), -- único tipo por ahora, extensible
  objetivo_cantidad integer not null check (objetivo_cantidad > 0),
  progreso_actual integer not null default 0,
  recompensa_chispas integer not null check (recompensa_chispas > 0),
  semana_inicio date not null, -- lunes de la semana en curso — mismo reset que el ranking semanal
  completada boolean not null default false,
  recompensa_repartida boolean not null default false,
  creado_at timestamptz not null default now(),
  unique (clan_id, semana_inicio)
);

alter table public.clan_misiones enable row level security;
create policy "cualquier autenticado ve las misiones (transparencia del progreso del clan)"
  on public.clan_misiones for select
  using (auth.uid() is not null);

-- ---------- Fase 9.1: crear / unirse / salir / buscar ----------
create or replace function public.crear_clan(p_nombre text, p_tag text, p_color text, p_descripcion text)
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
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — salí del actual antes de crear uno nuevo';
  end if;
  if length(trim(p_nombre)) < 3 then
    raise exception 'el nombre del clan necesita al menos 3 caracteres';
  end if;

  insert into public.clanes (nombre, descripcion, tipo, owner_id, tag, color_estandarte)
  values (trim(p_nombre), coalesce(nullif(trim(p_descripcion), ''), 'Sin descripción todavía.'), 'jugadores', v_user, nullif(trim(p_tag), ''), coalesce(p_color, '#6C4CF1'))
  returning id into v_id;

  insert into public.clan_membresias (clan_id, user_id, rol) values (v_id, v_user, 'lider');

  return v_id;
end;
$$;

create or replace function public.unirse_a_clan(p_clan_id uuid)
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
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — salí del actual antes de unirte a otro';
  end if;
  if not exists (select 1 from public.clanes where id = p_clan_id and tipo = 'jugadores') then
    raise exception 'clan no encontrado';
  end if;

  insert into public.clan_membresias (clan_id, user_id, rol) values (p_clan_id, v_user, 'miembro');
end;
$$;

create or replace function public.salir_del_clan()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_clan_id uuid;
  v_era_lider boolean;
  v_siguiente uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select clan_id, (rol = 'lider') into v_clan_id, v_era_lider from public.clan_membresias where user_id = v_user;
  if v_clan_id is null then
    raise exception 'no estás en ningún clan';
  end if;

  delete from public.clan_membresias where user_id = v_user;

  -- Si el líder se va y quedan más miembros, el más antiguo pasa a
  -- liderar — nunca queda un clan activo sin líder.
  if v_era_lider then
    select user_id into v_siguiente from public.clan_membresias where clan_id = v_clan_id order by unido_at asc limit 1;
    if v_siguiente is not null then
      update public.clan_membresias set rol = 'lider' where clan_id = v_clan_id and user_id = v_siguiente;
    end if;
  end if;
end;
$$;

create or replace function public.buscar_clanes(p_query text default '')
returns table (id uuid, nombre text, tag text, color_estandarte text, descripcion text, cantidad_miembros bigint)
language sql
security definer
set search_path = public
as $$
  select c.id, c.nombre, c.tag, c.color_estandarte, c.descripcion, count(cm.user_id)
  from public.clanes c
  left join public.clan_membresias cm on cm.clan_id = c.id
  where c.tipo = 'jugadores'
    and (p_query = '' or c.nombre ilike '%' || p_query || '%')
  group by c.id
  order by count(cm.user_id) desc, c.nombre asc
  limit 30;
$$;

-- Mi clan (o null) + estadísticas básicas — usado por /perfil y por el
-- link del header ("Clanes" pasa a mostrar la página del propio clan
-- si ya estás en uno, o el buscador si no).
create or replace function public.mi_clan()
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text, descripcion text,
  rol text, cantidad_miembros bigint, nivel_clan integer
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
    select c.id, c.nombre, c.tag, c.color_estandarte, c.descripcion, cm.rol,
      (select count(*) from public.clan_membresias where clan_id = c.id),
      public.nivel_clan(c.id)
    from public.clan_membresias cm
    join public.clanes c on c.id = cm.clan_id
    where cm.user_id = v_user;
end;
$$;

-- Nivel de clan (Fase 9.4, cosmético): curva simple y propia sobre la
-- suma de Chispas TOTALES (de toda la vida, no semanal) de sus
-- miembros actuales — mismo espíritu no-lineal que nivel_mundo, curva
-- más simple a propósito (no hace falta una tabla de progreso aparte
-- para esto, se computa al leer).
create or replace function public.nivel_clan(p_clan_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select least(10, greatest(1, 1 + floor(sqrt(coalesce((
    select sum(p.puntos_total) from public.clan_membresias cm
    join public.profiles p on p.id = cm.user_id
    where cm.clan_id = p_clan_id
  ), 0) / 2000.0))))::integer;
$$;

create or replace function public.miembros_de_clan(p_clan_id uuid)
returns table (user_id uuid, display_name text, avatar_url text, rol text, chispas_semana integer, unido_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.avatar_url, cm.rol,
    coalesce((
      select sum(dp.xp_ganado)::integer from public.daily_progress dp
      where dp.user_id = p.id and dp.fecha >= date_trunc('week', current_date)::date and dp.fecha <= current_date
    ), 0) as chispas_semana,
    cm.unido_at
  from public.clan_membresias cm
  join public.profiles p on p.id = cm.user_id
  where cm.clan_id = p_clan_id
  order by cm.rol = 'lider' desc, chispas_semana desc;
$$;

grant execute on function public.crear_clan(text, text, text, text) to authenticated;
grant execute on function public.unirse_a_clan(uuid) to authenticated;
grant execute on function public.salir_del_clan() to authenticated;
grant execute on function public.buscar_clanes(text) to authenticated;
grant execute on function public.mi_clan() to authenticated;
grant execute on function public.nivel_clan(uuid) to authenticated;
grant execute on function public.miembros_de_clan(uuid) to authenticated;

-- ---------- Fase 9.2: progreso de misión semanal, enganchado a cada
-- intento real de cualquier miembro del clan ----------
create or replace function public.avanzar_mision_de_clan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clan_id uuid;
  v_mision record;
begin
  -- Solo cuenta un intento que de verdad sumó XP — descarta los
  -- marcados "sospechoso" en /api/attempts (xp=0 aunque correct=true),
  -- mismo criterio anti-abuso que ya se usa para no inflar el ranking.
  if new.correct is distinct from true or coalesce(new.xp, 0) <= 0 then
    return new;
  end if;

  select clan_id into v_clan_id from public.clan_membresias where user_id = new.user_id;
  if v_clan_id is null then
    return new;
  end if;

  select * into v_mision from public.clan_misiones
  where clan_id = v_clan_id and semana_inicio = date_trunc('week', current_date)::date
  for update;

  if v_mision.id is null or v_mision.completada then
    return new;
  end if;

  update public.clan_misiones
    set progreso_actual = progreso_actual + 1,
        completada = (progreso_actual + 1) >= objetivo_cantidad
    where id = v_mision.id;

  -- Recompensa colectiva: se reparte una sola vez, apenas se completa
  -- — cada miembro ACTUAL del clan recibe el total completo (no
  -- dividido), es un premio por el esfuerzo conjunto, no una propina.
  if (v_mision.progreso_actual + 1) >= v_mision.objetivo_cantidad then
    update public.profiles set puntos_total = puntos_total + v_mision.recompensa_chispas
    where id in (select user_id from public.clan_membresias where clan_id = v_clan_id);
    update public.clan_misiones set recompensa_repartida = true where id = v_mision.id;
  end if;

  return new;
end;
$$;

drop trigger if exists avanzar_mision_de_clan_attempts on public.attempts;
create trigger avanzar_mision_de_clan_attempts
  after insert on public.attempts
  for each row execute function public.avanzar_mision_de_clan();

drop trigger if exists avanzar_mision_de_clan_logic on public.logic_attempts;
create trigger avanzar_mision_de_clan_logic
  after insert on public.logic_attempts
  for each row execute function public.avanzar_mision_de_clan();

-- Crea la misión de la semana en curso para un clan si todavía no
-- tiene una — se llama de forma perezosa (al abrir la página del
-- clan), no con un cron, para no depender de infraestructura que este
-- proyecto no tiene (mismo criterio que se documentó para el email de
-- racha en riesgo, 0064).
create or replace function public.asegurar_mision_semanal(p_clan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lunes date := date_trunc('week', current_date)::date;
begin
  insert into public.clan_misiones (clan_id, objetivo_tipo, objetivo_cantidad, recompensa_chispas, semana_inicio)
  values (p_clan_id, 'problemas_resueltos', 500, 150, v_lunes)
  on conflict (clan_id, semana_inicio) do nothing;
end;
$$;

grant execute on function public.asegurar_mision_semanal(uuid) to authenticated;

create or replace function public.mision_actual_de_clan(p_clan_id uuid)
returns table (id uuid, objetivo_cantidad integer, progreso_actual integer, recompensa_chispas integer, completada boolean, semana_inicio date)
language sql
security definer
set search_path = public
as $$
  select id, objetivo_cantidad, progreso_actual, recompensa_chispas, completada, semana_inicio
  from public.clan_misiones
  where clan_id = p_clan_id
  order by semana_inicio desc
  limit 1;
$$;

grant execute on function public.mision_actual_de_clan(uuid) to authenticated;

-- ---------- Fase 9.3: guerra de clanes semanal ----------
create or replace function public.ranking_clanes_semanal()
returns table (clan_id uuid, nombre text, tag text, color_estandarte text, xp_semana bigint, cantidad_miembros bigint, nivel_clan integer)
language sql
security definer
set search_path = public
as $$
  select
    c.id, c.nombre, c.tag, c.color_estandarte,
    coalesce(sum(dp.xp_semana), 0)::bigint as xp_semana,
    count(distinct cm.user_id) as cantidad_miembros,
    public.nivel_clan(c.id)
  from public.clanes c
  join public.clan_membresias cm on cm.clan_id = c.id
  left join lateral (
    select sum(d.xp_ganado) as xp_semana
    from public.daily_progress d
    where d.user_id = cm.user_id and d.fecha >= date_trunc('week', current_date)::date and d.fecha <= current_date
  ) dp on true
  where c.tipo = 'jugadores'
  group by c.id
  having coalesce(sum(dp.xp_semana), 0) > 0
  order by xp_semana desc
  limit 50;
$$;

grant execute on function public.ranking_clanes_semanal() to authenticated;

-- ---------- Fase 9.5: clan visible en el perfil de CUALQUIER usuario,
-- no solo el propio ----------
create or replace function public.clan_de_usuario(p_user_id uuid)
returns table (clan_id uuid, nombre text, tag text, color_estandarte text, nivel_clan integer)
language sql
security definer
set search_path = public
as $$
  select c.id, c.nombre, c.tag, c.color_estandarte, public.nivel_clan(c.id)
  from public.clan_membresias cm
  join public.clanes c on c.id = cm.clan_id
  where cm.user_id = p_user_id;
$$;

grant execute on function public.clan_de_usuario(uuid) to authenticated;
