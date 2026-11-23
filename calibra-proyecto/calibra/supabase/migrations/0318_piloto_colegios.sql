-- 0318: piloto para colegios (2026-11-23).
--
-- Qué agrega:
--  1) Licencia de colegio: la crea el admin (crear_licencia_colegio) y le da el código
--     al colegio. El docente la activa en /profesor (activar_licencia_colegio). Desde
--     ahí, todo estudiante que esté o entre a un curso de ese docente recibe Pro hasta
--     que la licencia venza, con tope de cupos. El Pro va como una suscripción
--     'colegio' más (provider de subscriptions), así que vence solo por el mismo
--     camino de siempre (0276: revisar_mi_pro y vencer_pro_vencidos) y deja el aviso
--     «tu Pro terminó». Si el estudiante ya pagaba Pro, su suscripción sigue intacta.
--  2) Tareas: el docente asigna una ciudad, cuántos ejercicios y hasta cuándo. El
--     avance sale de los intentos reales (attempts y logic_attempts), igual en la web
--     y en la app.
--  3) Panel del curso: actividad de los últimos 7 días, total, última vez, ciudad más
--     jugada, y la actividad diaria del curso.
--  4) El estudiante: ver sus tareas y sus cursos, y salir de un curso. El docente:
--     quitar a un estudiante del curso (libera su cupo).
--
-- Base de unirse_a_grupo: 0014 (misma firma; solo agrega el Pro de la licencia).
-- Las tablas nuevas no tienen políticas de lectura: todo pasa por funciones que
-- revisan quién llama. Idempotente.

-- ---------- 1) licencias ----------
alter table public.subscriptions drop constraint if exists subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider in ('mercadopago', 'paddle', 'lanzamiento', 'colegio'));

create table if not exists public.licencias_colegio (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  colegio text not null check (char_length(colegio) between 2 and 120),
  ciudad text,
  contacto text,
  cupos integer not null default 40 check (cupos between 1 and 5000),
  inicia_at timestamptz not null default now(),
  vence_at timestamptz not null,
  docente_id uuid references public.profiles(id) on delete set null,
  notas text,
  creada_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.licencias_colegio enable row level security;
revoke all on public.licencias_colegio from anon, authenticated;
create index if not exists licencias_colegio_docente_idx on public.licencias_colegio (docente_id);

-- Quién ocupa un cupo de cada licencia.
create table if not exists public.licencia_alumnos (
  licencia_id uuid not null references public.licencias_colegio(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  desde timestamptz not null default now(),
  primary key (licencia_id, user_id)
);
alter table public.licencia_alumnos enable row level security;
revoke all on public.licencia_alumnos from anon, authenticated;

alter table public.groups add column if not exists licencia_id uuid references public.licencias_colegio(id) on delete set null;

-- Un curso nuevo hereda la licencia vigente de su docente. El cliente inserta los
-- grupos directo (crear-grupo), así que el valor que mande se ignora siempre.
create or replace function public._grupo_hereda_licencia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.licencia_id := (
    select l.id from public.licencias_colegio l
    where l.docente_id = new.profesor_id and l.vence_at > now()
    order by l.vence_at desc
    limit 1
  );
  return new;
end;
$$;
drop trigger if exists grupo_hereda_licencia on public.groups;
create trigger grupo_hereda_licencia
  before insert on public.groups
  for each row execute function public._grupo_hereda_licencia();

-- Da (o renueva) el Pro de la licencia a un estudiante. false si no se pudo: licencia
-- vencida, sin cupos o cuenta de invitado.
create or replace function public._dar_pro_colegio(p_user_id uuid, p_licencia_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lic public.licencias_colegio%rowtype;
  v_usados integer;
begin
  if p_user_id is null or p_licencia_id is null then
    return false;
  end if;
  if exists (select 1 from auth.users u where u.id = p_user_id and coalesce(u.is_anonymous, false)) then
    return false;
  end if;

  -- Bloquea la licencia para que dos estudiantes entrando a la vez no pasen el tope.
  select * into v_lic from public.licencias_colegio where id = p_licencia_id for update;
  if v_lic.id is null or v_lic.vence_at <= now() then
    return false;
  end if;
  -- El docente no ocupa cupo (si quiere Pro, lo tiene por su cuenta).
  if v_lic.docente_id = p_user_id then
    return false;
  end if;

  if not exists (select 1 from public.licencia_alumnos la where la.licencia_id = p_licencia_id and la.user_id = p_user_id) then
    select count(*) into v_usados from public.licencia_alumnos la where la.licencia_id = p_licencia_id;
    if v_usados >= v_lic.cupos then
      return false;
    end if;
    insert into public.licencia_alumnos (licencia_id, user_id) values (p_licencia_id, p_user_id);
  end if;

  insert into public.subscriptions (user_id, provider, provider_subscription_id, status, plan_interval, current_period_end, cancel_at_period_end)
  values (p_user_id, 'colegio', 'colegio-' || p_licencia_id::text || '-' || p_user_id::text, 'active', 'anual', v_lic.vence_at, true)
  on conflict (provider, provider_subscription_id) do update
    set status = 'active', current_period_end = excluded.current_period_end, updated_at = now();

  update public.profiles as pr
  set plan = 'pro', pro_termino_aviso = false
  where pr.id = p_user_id;
  return true;
end;
$$;
revoke all on function public._dar_pro_colegio(uuid, uuid) from public, anon, authenticated;

-- Libera el cupo y apaga el Pro si no le queda otra suscripción vigente.
create or replace function public._quitar_pro_colegio(p_user_id uuid, p_licencia_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.licencia_alumnos la where la.licencia_id = p_licencia_id and la.user_id = p_user_id;
  update public.subscriptions sub
  set status = 'canceled', current_period_end = now(), updated_at = now()
  where sub.provider = 'colegio'
    and sub.provider_subscription_id = 'colegio-' || p_licencia_id::text || '-' || p_user_id::text;
  if exists (select 1 from public.profiles pr where pr.id = p_user_id and pr.plan = 'pro')
     and not public._suscripcion_vigente(p_user_id) then
    perform public._apagar_pro(p_user_id);
  end if;
end;
$$;
revoke all on function public._quitar_pro_colegio(uuid, uuid) from public, anon, authenticated;

-- Si el estudiante sigue en otro curso con la misma licencia, conserva el cupo.
create or replace function public._revisar_cupo_al_salir(p_user_id uuid, p_licencia_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_licencia_id is null then
    return;
  end if;
  if not exists (
    select 1 from public.group_members gm
    join public.groups g on g.id = gm.group_id
    where gm.user_id = p_user_id and g.licencia_id = p_licencia_id
  ) then
    perform public._quitar_pro_colegio(p_user_id, p_licencia_id);
  end if;
end;
$$;
revoke all on function public._revisar_cupo_al_salir(uuid, uuid) from public, anon, authenticated;

-- Borrar un curso con licencia libera los cupos de sus estudiantes (si no siguen en
-- otro curso de la misma licencia).
create or replace function public._grupo_libera_cupos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if old.licencia_id is null then
    return old;
  end if;
  for v_user in
    delete from public.group_members gm where gm.group_id = old.id returning gm.user_id
  loop
    perform public._revisar_cupo_al_salir(v_user, old.licencia_id);
  end loop;
  return old;
end;
$$;
drop trigger if exists grupo_libera_cupos on public.groups;
create trigger grupo_libera_cupos
  before delete on public.groups
  for each row execute function public._grupo_libera_cupos();

-- ---------- admin: crear, listar y extender licencias ----------
create or replace function public.crear_licencia_colegio(
  p_colegio text, p_ciudad text, p_contacto text, p_cupos integer, p_dias integer, p_notas text default null
)
returns table (id uuid, codigo text, vence_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
  v_alfabeto text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_id uuid;
  v_vence timestamptz;
  i integer;
begin
  if not exists (select 1 from public.profiles where profiles.id = auth.uid() and es_admin) then
    raise exception 'no autorizado';
  end if;
  if p_dias is null or p_dias < 1 or p_dias > 800 then
    raise exception 'duración inválida';
  end if;

  loop
    v_codigo := 'COL-';
    for i in 1..6 loop
      v_codigo := v_codigo || substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::integer, 1);
    end loop;
    exit when not exists (select 1 from public.licencias_colegio l where l.codigo = v_codigo);
  end loop;

  v_vence := date_trunc('day', now() at time zone 'America/Bogota') at time zone 'America/Bogota'
             + make_interval(days => p_dias + 1) - interval '1 second';

  insert into public.licencias_colegio (codigo, colegio, ciudad, contacto, cupos, vence_at, notas, creada_por)
  values (v_codigo, trim(p_colegio), nullif(trim(coalesce(p_ciudad, '')), ''), nullif(trim(coalesce(p_contacto, '')), ''),
          coalesce(p_cupos, 40), v_vence, nullif(trim(coalesce(p_notas, '')), ''), auth.uid())
  returning licencias_colegio.id into v_id;

  return query select v_id, v_codigo, v_vence;
end;
$$;
grant execute on function public.crear_licencia_colegio(text, text, text, integer, integer, text) to authenticated;

create or replace function public.listar_licencias_admin()
returns table (
  id uuid, codigo text, colegio text, ciudad text, contacto text, cupos integer, usados integer,
  cursos integer, vence_at timestamptz, docente_nombre text, notas text, created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where profiles.id = auth.uid() and es_admin) then
    raise exception 'no autorizado';
  end if;
  return query
    select l.id, l.codigo, l.colegio, l.ciudad, l.contacto, l.cupos,
      (select count(*)::integer from public.licencia_alumnos la where la.licencia_id = l.id),
      (select count(*)::integer from public.groups g where g.licencia_id = l.id),
      l.vence_at,
      (select p.display_name from public.profiles p where p.id = l.docente_id),
      l.notas, l.created_at
    from public.licencias_colegio l
    order by l.created_at desc;
end;
$$;
grant execute on function public.listar_licencias_admin() to authenticated;

-- Pasar de piloto a pagado (o dar más tiempo/cupos): mueve el vencimiento y renueva
-- el Pro de quienes ya ocupan cupo.
create or replace function public.extender_licencia_colegio(p_licencia_id uuid, p_dias integer, p_cupos integer default null)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vence timestamptz;
  v_user uuid;
begin
  if not exists (select 1 from public.profiles where profiles.id = auth.uid() and es_admin) then
    raise exception 'no autorizado';
  end if;
  if p_dias is null or p_dias < 0 or p_dias > 800 then
    raise exception 'duración inválida';
  end if;

  update public.licencias_colegio l
  set vence_at = greatest(l.vence_at, now()) + make_interval(days => p_dias),
      cupos = coalesce(p_cupos, l.cupos)
  where l.id = p_licencia_id
  returning l.vence_at into v_vence;
  if v_vence is null then
    raise exception 'licencia no encontrada';
  end if;

  -- Los cursos del docente que hubieran quedado sin licencia la recuperan.
  update public.groups g
  set licencia_id = p_licencia_id
  from public.licencias_colegio l
  where l.id = p_licencia_id and g.profesor_id = l.docente_id and g.licencia_id is null;

  for v_user in select la.user_id from public.licencia_alumnos la where la.licencia_id = p_licencia_id loop
    perform public._dar_pro_colegio(v_user, p_licencia_id);
  end loop;
  return v_vence;
end;
$$;
grant execute on function public.extender_licencia_colegio(uuid, integer, integer) to authenticated;

-- ---------- docente: activar y ver su licencia ----------
create or replace function public.activar_licencia_colegio(p_codigo text)
returns table (colegio text, vence_at timestamptz, cupos integer, usados integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_lic public.licencias_colegio%rowtype;
  v_alumno uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if exists (select 1 from auth.users u where u.id = v_user and coalesce(u.is_anonymous, false)) then
    raise exception 'necesitas una cuenta';
  end if;

  select * into v_lic from public.licencias_colegio l where l.codigo = upper(trim(p_codigo));
  if v_lic.id is null then
    raise exception 'código inválido';
  end if;
  if v_lic.docente_id is not null and v_lic.docente_id <> v_user then
    raise exception 'licencia de otro docente';
  end if;
  if v_lic.vence_at <= now() then
    raise exception 'licencia vencida';
  end if;

  update public.licencias_colegio l set docente_id = v_user where l.id = v_lic.id;
  update public.profiles pr set es_profesor = true where pr.id = v_user;
  update public.groups g set licencia_id = v_lic.id where g.profesor_id = v_user;
  -- Si el docente era estudiante de su propia licencia (probando), deja el cupo.
  delete from public.licencia_alumnos la where la.licencia_id = v_lic.id and la.user_id = v_user;

  for v_alumno in
    select distinct gm.user_id from public.group_members gm
    join public.groups g on g.id = gm.group_id
    where g.profesor_id = v_user
    order by gm.user_id
  loop
    perform public._dar_pro_colegio(v_alumno, v_lic.id);
  end loop;

  return query
    select l.colegio, l.vence_at, l.cupos,
      (select count(*)::integer from public.licencia_alumnos la where la.licencia_id = l.id)
    from public.licencias_colegio l where l.id = v_lic.id;
end;
$$;
grant execute on function public.activar_licencia_colegio(text) to authenticated;

create or replace function public.mi_licencia_docente()
returns table (id uuid, colegio text, codigo text, vence_at timestamptz, cupos integer, usados integer, vigente boolean)
language sql
stable
security definer
set search_path = public
as $$
  select l.id, l.colegio, l.codigo, l.vence_at, l.cupos,
    (select count(*)::integer from public.licencia_alumnos la where la.licencia_id = l.id),
    l.vence_at > now()
  from public.licencias_colegio l
  where l.docente_id = auth.uid()
  order by l.vence_at desc
  limit 1;
$$;
grant execute on function public.mi_licencia_docente() to authenticated;

-- ---------- unirse / salir / quitar ----------
create or replace function public.unirse_a_grupo(p_codigo text)
returns table (group_id uuid, nombre text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_group_id uuid;
  v_nombre text;
  v_licencia uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select g.id, g.nombre, g.licencia_id into v_group_id, v_nombre, v_licencia
  from public.groups g
  where g.codigo_invitacion = p_codigo;

  if v_group_id is null then
    raise exception 'código inválido';
  end if;

  insert into public.group_members (group_id, user_id)
  values (v_group_id, v_user)
  on conflict (group_id, user_id) do nothing;

  perform public._dar_pro_colegio(v_user, v_licencia);

  return query select v_group_id, v_nombre;
end;
$$;
grant execute on function public.unirse_a_grupo(text) to authenticated;

create or replace function public.salir_de_grupo(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_licencia uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select g.licencia_id into v_licencia from public.groups g where g.id = p_group_id;
  delete from public.group_members gm where gm.group_id = p_group_id and gm.user_id = v_user;
  perform public._revisar_cupo_al_salir(v_user, v_licencia);
end;
$$;
grant execute on function public.salir_de_grupo(uuid) to authenticated;

create or replace function public.quitar_alumno_grupo(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_licencia uuid;
begin
  select g.licencia_id into v_licencia
  from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid();
  if not found then
    raise exception 'no autorizado';
  end if;
  delete from public.group_members gm where gm.group_id = p_group_id and gm.user_id = p_user_id;
  perform public._revisar_cupo_al_salir(p_user_id, v_licencia);
end;
$$;
grant execute on function public.quitar_alumno_grupo(uuid, uuid) to authenticated;

-- Los cursos del estudiante (web y app: «Mi curso»).
create or replace function public.mis_grupos()
returns table (group_id uuid, nombre text, docente_nombre text, colegio text, con_licencia boolean, unido_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select g.id, g.nombre,
    (select p.display_name from public.profiles p where p.id = g.profesor_id),
    l.colegio,
    l.id is not null and l.vence_at > now(),
    gm.joined_at
  from public.group_members gm
  join public.groups g on g.id = gm.group_id
  left join public.licencias_colegio l on l.id = g.licencia_id
  where gm.user_id = auth.uid()
  order by gm.joined_at desc;
$$;
grant execute on function public.mis_grupos() to authenticated;

-- ---------- 2) tareas ----------
create table if not exists public.tareas_grupo (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  mundo text not null check (mundo in ('numeria','enigmia','geografia','quimia','anatomia','melodia','trigonometria','historia','calculia','circuitia','estadistica','naipia','codia','dinamia','vitalia')),
  titulo text not null check (char_length(titulo) between 2 and 80),
  instrucciones text check (instrucciones is null or char_length(instrucciones) <= 400),
  meta_ejercicios integer not null check (meta_ejercicios between 5 and 300),
  inicia_at timestamptz not null default now(),
  vence_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (vence_at > inicia_at)
);
alter table public.tareas_grupo enable row level security;
revoke all on public.tareas_grupo from anon, authenticated;
create index if not exists tareas_grupo_grupo_idx on public.tareas_grupo (group_id, vence_at desc);

-- Ejercicios de un estudiante en una ciudad dentro de una ventana de tiempo.
create or replace function public._ejercicios_en_mundo(p_user_id uuid, p_mundo text, p_desde timestamptz, p_hasta timestamptz)
returns table (hechos integer, correctos integer)
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer, (count(*) filter (where x.correct))::integer
  from (
    select a.correct from public.attempts a
    where p_mundo <> 'enigmia' and a.user_id = p_user_id
      and a.created_at >= p_desde and a.created_at < p_hasta
      and public.mundo_de_problem_type(a.problem_type) = p_mundo
    union all
    select la.correct from public.logic_attempts la
    where p_mundo = 'enigmia' and la.user_id = p_user_id
      and la.created_at >= p_desde and la.created_at < p_hasta
  ) x;
$$;
revoke all on function public._ejercicios_en_mundo(uuid, text, timestamptz, timestamptz) from public, anon, authenticated;

create or replace function public.crear_tarea_grupo(
  p_group_id uuid, p_mundo text, p_titulo text, p_instrucciones text, p_meta integer, p_vence_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid()) then
    raise exception 'no autorizado';
  end if;
  if p_vence_at <= now() then
    raise exception 'la fecha límite ya pasó';
  end if;
  insert into public.tareas_grupo (group_id, mundo, titulo, instrucciones, meta_ejercicios, vence_at)
  values (p_group_id, p_mundo, trim(p_titulo), nullif(trim(coalesce(p_instrucciones, '')), ''), p_meta, p_vence_at)
  returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.crear_tarea_grupo(uuid, text, text, text, integer, timestamptz) to authenticated;

create or replace function public.borrar_tarea_grupo(p_tarea_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.tareas_grupo t
  using public.groups g
  where t.id = p_tarea_id and g.id = t.group_id and g.profesor_id = auth.uid();
  if not found then
    raise exception 'no autorizado';
  end if;
end;
$$;
grant execute on function public.borrar_tarea_grupo(uuid) to authenticated;

-- Docente: cada tarea del curso con el avance de cada estudiante.
create or replace function public.progreso_tareas_grupo(p_group_id uuid)
returns table (
  tarea_id uuid, mundo text, titulo text, instrucciones text, meta_ejercicios integer,
  inicia_at timestamptz, vence_at timestamptz, user_id uuid, hechos integer, correctos integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid()) then
    raise exception 'no autorizado';
  end if;
  return query
    select t.id, t.mundo, t.titulo, t.instrucciones, t.meta_ejercicios, t.inicia_at, t.vence_at,
      gm.user_id, e.hechos, e.correctos
    from public.tareas_grupo t
    join public.group_members gm on gm.group_id = t.group_id
    cross join lateral public._ejercicios_en_mundo(gm.user_id, t.mundo, t.inicia_at, t.vence_at) e
    where t.group_id = p_group_id
    order by t.vence_at desc, t.id, gm.user_id;
end;
$$;
grant execute on function public.progreso_tareas_grupo(uuid) to authenticated;

-- Estudiante: sus tareas vigentes (y las vencidas hace menos de 7 días).
create or replace function public.mis_tareas()
returns table (
  tarea_id uuid, grupo text, mundo text, titulo text, instrucciones text, meta_ejercicios integer,
  inicia_at timestamptz, vence_at timestamptz, hechos integer, correctos integer
)
language sql
stable
security definer
set search_path = public
as $$
  select t.id, g.nombre, t.mundo, t.titulo, t.instrucciones, t.meta_ejercicios, t.inicia_at, t.vence_at,
    e.hechos, e.correctos
  from public.group_members gm
  join public.groups g on g.id = gm.group_id
  join public.tareas_grupo t on t.group_id = gm.group_id
  cross join lateral public._ejercicios_en_mundo(gm.user_id, t.mundo, t.inicia_at, t.vence_at) e
  where gm.user_id = auth.uid()
    and t.inicia_at <= now()
    and t.vence_at > now() - interval '7 days'
  order by t.vence_at asc;
$$;
grant execute on function public.mis_tareas() to authenticated;

-- ---------- 3) panel del curso ----------
create or replace function public.panel_grupo(p_group_id uuid)
returns table (
  user_id uuid, display_name text, avatar_url text, unido_at timestamptz,
  ejercicios_7d integer, correctos_7d integer, ejercicios_total integer, correctos_total integer,
  ultima_actividad timestamptz, mundo_top_7d text, pro_colegio boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_licencia uuid;
begin
  select g.licencia_id into v_licencia
  from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid();
  if not found then
    raise exception 'no autorizado';
  end if;

  return query
    with miembros as (
      select gm.user_id, gm.joined_at from public.group_members gm where gm.group_id = p_group_id
    ),
    intentos as (
      select a.user_id, public.mundo_de_problem_type(a.problem_type) as mundo, a.correct, a.created_at
      from public.attempts a join miembros m on m.user_id = a.user_id
      union all
      select la.user_id, 'enigmia'::text, la.correct, la.created_at
      from public.logic_attempts la join miembros m on m.user_id = la.user_id
    ),
    agg as (
      select i.user_id,
        count(*) filter (where i.created_at >= now() - interval '7 days')::integer as e7,
        count(*) filter (where i.created_at >= now() - interval '7 days' and i.correct)::integer as c7,
        count(*)::integer as et,
        count(*) filter (where i.correct)::integer as ct,
        max(i.created_at) as ultima
      from intentos i group by i.user_id
    ),
    top as (
      select distinct on (i.user_id) i.user_id, i.mundo
      from intentos i
      where i.created_at >= now() - interval '7 days'
      group by i.user_id, i.mundo
      order by i.user_id, count(*) desc, i.mundo
    )
    select m.user_id, p.display_name, p.avatar_url, m.joined_at,
      coalesce(agg.e7, 0), coalesce(agg.c7, 0), coalesce(agg.et, 0), coalesce(agg.ct, 0),
      agg.ultima, top.mundo,
      v_licencia is not null and exists (
        select 1 from public.licencia_alumnos la where la.licencia_id = v_licencia and la.user_id = m.user_id
      )
    from miembros m
    join public.profiles p on p.id = m.user_id
    left join agg on agg.user_id = m.user_id
    left join top on top.user_id = m.user_id
    order by coalesce(agg.e7, 0) desc, p.display_name;
end;
$$;
grant execute on function public.panel_grupo(uuid) to authenticated;

-- Ejercicios y estudiantes activos por día (hora de Colombia).
create or replace function public.actividad_grupo_diaria(p_group_id uuid, p_dias integer default 14)
returns table (fecha date, ejercicios integer, activos integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dias integer := least(greatest(coalesce(p_dias, 14), 1), 60);
  v_desde timestamptz;
begin
  if not exists (select 1 from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid()) then
    raise exception 'no autorizado';
  end if;
  v_desde := (date_trunc('day', now() at time zone 'America/Bogota') - make_interval(days => v_dias - 1)) at time zone 'America/Bogota';

  return query
    with dias as (
      select (generate_series(
        (v_desde at time zone 'America/Bogota')::date,
        (now() at time zone 'America/Bogota')::date,
        interval '1 day'))::date as fecha
    ),
    intentos as (
      select a.user_id, (a.created_at at time zone 'America/Bogota')::date as fecha
      from public.attempts a
      join public.group_members gm on gm.user_id = a.user_id and gm.group_id = p_group_id
      where a.created_at >= v_desde
      union all
      select la.user_id, (la.created_at at time zone 'America/Bogota')::date
      from public.logic_attempts la
      join public.group_members gm on gm.user_id = la.user_id and gm.group_id = p_group_id
      where la.created_at >= v_desde
    )
    select d.fecha,
      (select count(*)::integer from intentos i where i.fecha = d.fecha),
      (select count(distinct i.user_id)::integer from intentos i where i.fecha = d.fecha)
    from dias d
    order by d.fecha;
end;
$$;
grant execute on function public.actividad_grupo_diaria(uuid, integer) to authenticated;
