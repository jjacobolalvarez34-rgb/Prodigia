-- ============================================================
-- Prodigia — plan académico: grupos de profesor
-- Correr después de 0013_feed_social.sql
-- ============================================================

alter table public.profiles add column es_profesor boolean not null default false;

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  profesor_id uuid not null references public.profiles(id) on delete cascade,
  nombre text not null,
  codigo_invitacion text unique not null,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create policy "profesores ven sus propios grupos"
  on public.groups for select
  using (auth.uid() = profesor_id);

create policy "miembros ven los grupos a los que pertenecen"
  on public.groups for select
  using (exists (
    select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid()
  ));

create policy "profesores crean sus propios grupos"
  on public.groups for insert
  with check (
    auth.uid() = profesor_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.es_profesor)
  );

create policy "usuarios ven a que grupos pertenecen"
  on public.group_members for select
  using (auth.uid() = user_id);

create policy "profesores ven miembros de sus grupos"
  on public.group_members for select
  using (exists (
    select 1 from public.groups g where g.id = group_members.group_id and g.profesor_id = auth.uid()
  ));

-- ---------- unirse con código ----------
-- Un alumno no puede leer la tabla groups todavía (no es miembro ni
-- profesor), así que necesita esta función security definer para
-- resolver el código sin exponer toda la tabla.
create function public.unirse_a_grupo(p_codigo text)
returns table (group_id uuid, nombre text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_group_id uuid;
  v_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select g.id, g.nombre into v_group_id, v_nombre
  from public.groups g
  where g.codigo_invitacion = p_codigo;

  if v_group_id is null then
    raise exception 'código inválido';
  end if;

  insert into public.group_members (group_id, user_id)
  values (v_group_id, v_user)
  on conflict (group_id, user_id) do nothing;

  return query select v_group_id, v_nombre;
end;
$$;

grant execute on function public.unirse_a_grupo(text) to authenticated;

-- ---------- resumen del grupo para el profesor ----------
-- El profesor necesita ver precisión/nivel/última actividad de SUS
-- alumnos, que normalmente RLS le esconde (cada attempt es privado del
-- alumno). Estas dos funciones son la única grieta deliberada: chequean
-- que quien llama sea profesor_id del grupo antes de devolver nada.
create function public.resumen_grupo(p_group_id uuid)
returns table (
  user_id uuid,
  display_name text,
  puntos_total integer,
  precision_promedio numeric,
  nivel_suma smallint,
  nivel_resta smallint,
  nivel_multiplicacion smallint,
  nivel_division smallint,
  ultima_actividad timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid()
  ) then
    raise exception 'no autorizado';
  end if;

  return query
  select
    p.id,
    p.display_name,
    p.puntos_total,
    (
      select case when count(*) = 0 then null else sum((a.correct)::int)::numeric / count(*) end
      from public.attempts a where a.user_id = p.id
    ),
    (select sl.nivel from public.skill_levels sl where sl.user_id = p.id and sl.problem_type = 'suma'),
    (select sl.nivel from public.skill_levels sl where sl.user_id = p.id and sl.problem_type = 'resta'),
    (select sl.nivel from public.skill_levels sl where sl.user_id = p.id and sl.problem_type = 'multiplicacion'),
    (select sl.nivel from public.skill_levels sl where sl.user_id = p.id and sl.problem_type = 'division'),
    (select max(a.created_at) from public.attempts a where a.user_id = p.id)
  from public.group_members gm
  join public.profiles p on p.id = gm.user_id
  where gm.group_id = p_group_id;
end;
$$;

grant execute on function public.resumen_grupo(uuid) to authenticated;

create function public.resumen_grupo_daily_progress(p_group_id uuid)
returns table (user_id uuid, fecha date, meta_alcanzada boolean, congelado boolean)
language sql
security definer
set search_path = public
as $$
  select dp.user_id, dp.fecha, dp.meta_alcanzada, dp.congelado
  from public.daily_progress dp
  join public.group_members gm on gm.user_id = dp.user_id and gm.group_id = p_group_id
  where exists (
    select 1 from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid()
  );
$$;

grant execute on function public.resumen_grupo_daily_progress(uuid) to authenticated;
