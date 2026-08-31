-- ============================================================
-- Prodigia — Separar el reto diario (vuelve a 5 preguntas, de
-- cualquier ciudad desbloqueada) del reto semanal nuevo (45 preguntas,
-- una vez por semana — el tamaño que el reto diario tenía desde
-- 0095_reto_diario_45_multi_mundo.sql, ahora reservado para la versión
-- semanal). Más Chispas en los dos, ranking público de quién lo
-- completó cada día/semana, y logros nuevos de constancia.
-- Correr después de 0112_flujo_bienvenida.sql.
-- ============================================================

-- ---------- 1) Reto diario: vuelve a 0-5, más Chispas por acierto ----------
-- Filas viejas (de cuando el reto diario tenía 45 preguntas, entre
-- 0095 y esta migración) pueden tener correctos > 5 — el nuevo check
-- rompería contra esos datos históricos. Se acotan a 5 en vez de
-- borrar la fila: lo único que le importa a la racha/logros es que ESE
-- día quedó completado, no cuántas de las 45 acertó en su momento.
update public.retos_diarios_completados set correctos = least(correctos, 5) where correctos > 5;

alter table public.retos_diarios_completados drop constraint retos_diarios_completados_correctos_check;
alter table public.retos_diarios_completados add constraint retos_diarios_completados_correctos_check
  check (correctos between 0 and 5);

create or replace function public.completar_reto_diario(p_fecha date, p_correctos smallint)
returns table (puntos_bonus integer, puntos_total integer, ya_completado boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_bonus integer;
  v_existe boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_fecha <> current_date then
    raise exception 'fecha invalida';
  end if;

  select exists(
    select 1 from public.retos_diarios_completados where user_id = v_user and fecha = p_fecha
  ) into v_existe;

  if v_existe then
    return query select 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user), true;
    return;
  end if;

  -- 20 Chispas por acierto, tope 100 (antes: 5/acierto, tope 225 con
  -- las 45 preguntas viejas) — un reto más corto, pero mejor pagado por
  -- pregunta.
  v_bonus := greatest(0, least(5, p_correctos)) * 20;

  insert into public.retos_diarios_completados (user_id, fecha, correctos, puntos_bonus)
  values (v_user, p_fecha, p_correctos, v_bonus);

  update public.profiles as pr set puntos_total = pr.puntos_total + v_bonus where pr.id = v_user;

  return query select v_bonus, (select pr.puntos_total from public.profiles pr where pr.id = v_user), false;
end;
$$;

grant execute on function public.completar_reto_diario(date, smallint) to authenticated;

-- ---------- 2) Reto semanal: tabla nueva, mismo patrón que retos_diarios_completados ----------
create table public.retos_semanales_completados (
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Lunes de la semana ISO (date_trunc('week', ...)) — mismo criterio
  -- que ranking_semanal_filtrado y las semanas de clanes.
  semana_inicio date not null,
  correctos smallint not null check (correctos between 0 and 45),
  puntos_bonus integer not null default 0,
  completado_at timestamptz not null default now(),
  primary key (user_id, semana_inicio)
);

alter table public.retos_semanales_completados enable row level security;

create policy "usuarios ven sus retos semanales"
  on public.retos_semanales_completados for select
  using (auth.uid() = user_id);

create function public.completar_reto_semanal(p_semana date, p_correctos smallint)
returns table (puntos_bonus integer, puntos_total integer, ya_completado boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_bonus integer;
  v_existe boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_semana <> date_trunc('week', current_date)::date then
    raise exception 'semana invalida';
  end if;

  select exists(
    select 1 from public.retos_semanales_completados where user_id = v_user and semana_inicio = p_semana
  ) into v_existe;

  if v_existe then
    return query select 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user), true;
    return;
  end if;

  -- 10 Chispas por acierto, tope 450 — bastante más que el diario (100
  -- tope), acorde a que es un compromiso semanal de 45 preguntas.
  v_bonus := greatest(0, least(45, p_correctos)) * 10;

  insert into public.retos_semanales_completados (user_id, semana_inicio, correctos, puntos_bonus)
  values (v_user, p_semana, p_correctos, v_bonus);

  update public.profiles as pr set puntos_total = pr.puntos_total + v_bonus where pr.id = v_user;

  return query select v_bonus, (select pr.puntos_total from public.profiles pr where pr.id = v_user), false;
end;
$$;

grant execute on function public.completar_reto_semanal(date, smallint) to authenticated;

-- ---------- 3) Ranking público de cada reto — security definer porque la RLS de arriba solo deja ver las filas propias ----------
create function public.ranking_reto_diario(p_fecha date)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  marco_perfil text,
  correctos smallint,
  completado_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select r.user_id, p.display_name, p.avatar_url, p.marco_perfil, r.correctos, r.completado_at
  from public.retos_diarios_completados r
  join public.profiles p on p.id = r.user_id
  where r.fecha = p_fecha
  order by r.correctos desc, r.completado_at asc
  limit 100;
$$;

grant execute on function public.ranking_reto_diario(date) to authenticated;

create function public.ranking_reto_semanal(p_semana date)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  marco_perfil text,
  correctos smallint,
  completado_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select r.user_id, p.display_name, p.avatar_url, p.marco_perfil, r.correctos, r.completado_at
  from public.retos_semanales_completados r
  join public.profiles p on p.id = r.user_id
  where r.semana_inicio = p_semana
  order by r.correctos desc, r.completado_at asc
  limit 100;
$$;

grant execute on function public.ranking_reto_semanal(date) to authenticated;

-- ---------- 4) Logros nuevos de constancia (categoría 'racha'/'volumen', ya permitidas) ----------
insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('reto-diario-total-20', 'Maratonista diario', 'Completaste 20 retos diarios en total.', 'volumen', '{"tipo": "reto_diario_total", "valor": 20}'),
('reto-semanal-total-5', 'Constancia semanal', 'Completaste 5 retos semanales en total.', 'volumen', '{"tipo": "reto_semanal_total", "valor": 5}'),
('reto-semanal-total-20', 'Veterano semanal', 'Completaste 20 retos semanales en total.', 'volumen', '{"tipo": "reto_semanal_total", "valor": 20}'),
('racha-retos-semanales-4', 'Un mes seguido', '4 semanas seguidas completando el reto semanal.', 'racha', '{"tipo": "racha_retos_semanales", "valor": 4}');
