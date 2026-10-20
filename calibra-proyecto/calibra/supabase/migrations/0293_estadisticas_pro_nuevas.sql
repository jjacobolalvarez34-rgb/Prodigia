-- ============================================================
-- Prodigia — Estadísticas Pro nuevas (0293).
--
-- Rediseño aprobado el 2026-10-19 (galería: estadisticas-pro): un solo llamado que
-- devuelve todo el panel en un jsonb:
--   indice / indice_antes / top_pct : «Índice Prodigia» de 0 a 1000 de los últimos 7
--       días (55 % precisión, 25 % velocidad, 20 % constancia), el de la semana anterior
--       y en qué top estás entre quienes jugaron esa semana.
--   precision / tiempo_ms / dias_7 : los números de la semana.
--   dias    : intentos por día, últimos 84 días (la constancia).
--   horas   : intentos y aciertos por hora del día (hora local con p_tz_min).
--   mundos  : por ciudad (30 días): intentos, aciertos, tiempo medio y qué % de los
--             jugadores de esa ciudad es más lento que tú.
--   semanas : precisión por semana, últimas 12.
--   debiles : los 3 tipos de pregunta con menos aciertos (al menos 15 intentos, 30 días).
--   records : respuesta más rápida acertada, mejor día (precisión con 20+ intentos) y
--             ELO más alto conocido.
-- Solo Pro (mismo criterio que 0149/0151). Incluye Enigmia (logic_attempts).
-- Requiere mundo_de_problem_type. Idempotente.
-- ============================================================

create or replace function public._intentos_unificados(p_desde timestamptz)
returns table (user_id uuid, mundo text, tipo text, correct boolean, time_ms integer, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select a.user_id, public.mundo_de_problem_type(a.problem_type), a.problem_type, a.correct, a.time_ms, a.created_at
  from public.attempts a where a.created_at >= p_desde
  union all
  select la.user_id, 'enigmia', 'enigmia', la.correct, la.time_ms, la.created_at
  from public.logic_attempts la where la.created_at >= p_desde;
$$;
revoke execute on function public._intentos_unificados(timestamptz) from public, anon, authenticated;

create or replace function public._indice_prodigia(p_precision numeric, p_tiempo_ms numeric, p_dias integer)
returns integer
language sql
immutable
as $$
  select round(1000 * (
    0.55 * coalesce(p_precision, 0)
    + 0.25 * greatest(0, least(1, 1 - (coalesce(p_tiempo_ms, 10000) - 2000) / 8000.0))
    + 0.20 * least(1, coalesce(p_dias, 0) / 7.0)
  ))::integer;
$$;

create or replace function public.estadisticas_pro_v2(p_tz_min integer default -300)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_plan text;
  v_tz interval := make_interval(mins => coalesce(p_tz_min, -300));
  v_res jsonb;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
  if v_plan is distinct from 'pro' then
    raise exception 'estadisticas avanzadas exclusivas de Prodigia Pro';
  end if;

  with
  todos7 as (
    select u.user_id, avg(u.correct::int)::numeric as p, avg(u.time_ms)::numeric as t, count(distinct (u.created_at + v_tz)::date)::int as d
    from public._intentos_unificados(now() - interval '7 days') u
    group by u.user_id
  ),
  indices as (select t7.user_id, public._indice_prodigia(t7.p, t7.t, t7.d) as i from todos7 t7),
  mio7 as (select * from todos7 where user_id = v_user),
  antes as (
    select avg(u.correct::int)::numeric as p, avg(u.time_ms)::numeric as t, count(distinct (u.created_at + v_tz)::date)::int as d
    from public._intentos_unificados(now() - interval '14 days') u
    where u.user_id = v_user and u.created_at < now() - interval '7 days'
  ),
  mios84 as (select * from public._intentos_unificados(now() - interval '84 days') u where u.user_id = v_user),
  dias as (
    select (m.created_at + v_tz)::date as fecha, count(*)::int as intentos
    from mios84 m group by 1 order by 1
  ),
  horas as (
    select extract(hour from (m.created_at + v_tz))::int as hora, count(*)::int as intentos, sum(m.correct::int)::int as correctos
    from mios84 m group by 1 order by 1
  ),
  semanas as (
    select date_trunc('week', m.created_at + v_tz)::date as semana, count(*)::int as intentos, sum(m.correct::int)::int as correctos
    from mios84 m group by 1 order by 1
  ),
  todos30 as (
    select u.user_id, u.mundo, count(*)::int as intentos, sum(u.correct::int)::int as correctos, avg(u.time_ms)::numeric as t
    from public._intentos_unificados(now() - interval '30 days') u
    group by u.user_id, u.mundo
  ),
  mundos as (
    select m.mundo, m.intentos, m.correctos, round(m.t)::int as tiempo_ms,
      round(100.0 * (select count(*) from todos30 o where o.mundo = m.mundo and o.user_id <> m.user_id and o.t > m.t)
        / greatest(1, (select count(*) from todos30 o where o.mundo = m.mundo and o.user_id <> m.user_id)))::int as mas_lentos_pct
    from todos30 m where m.user_id = v_user
    order by (m.correctos::numeric / greatest(1, m.intentos)) desc
  ),
  debiles as (
    select m.mundo, m.tipo, count(*)::int as intentos, sum(m.correct::int)::int as correctos
    from mios84 m where m.created_at >= now() - interval '30 days'
    group by m.mundo, m.tipo having count(*) >= 15
    order by (sum(m.correct::int)::numeric / count(*)) asc
    limit 3
  ),
  mejor_dia as (
    select (m.created_at + v_tz)::date as fecha, avg(m.correct::int)::numeric as p, count(*) as n
    from mios84 m group by 1 having count(*) >= 20 order by 2 desc, 3 desc limit 1
  )
  select jsonb_build_object(
    'indice', coalesce((select public._indice_prodigia(p, t, d) from mio7), 0),
    'indice_antes', coalesce((select public._indice_prodigia(p, t, d) from antes where p is not null), 0),
    'top_pct', (
      select greatest(1, round(100.0 * (select count(*) from indices x where x.i > i0.i) / greatest(1, (select count(*) from indices))))::int
      from indices i0 where i0.user_id = v_user
    ),
    'precision', (select round(p * 100) from mio7),
    'tiempo_ms', (select round(t) from mio7),
    'dias_7', coalesce((select d from mio7), 0),
    'dias', coalesce((select jsonb_agg(jsonb_build_object('fecha', fecha, 'intentos', intentos)) from dias), '[]'::jsonb),
    'horas', coalesce((select jsonb_agg(jsonb_build_object('hora', hora, 'intentos', intentos, 'correctos', correctos)) from horas), '[]'::jsonb),
    'semanas', coalesce((select jsonb_agg(jsonb_build_object('semana', semana, 'intentos', intentos, 'correctos', correctos)) from semanas), '[]'::jsonb),
    'mundos', coalesce((select jsonb_agg(jsonb_build_object('mundo', mundo, 'intentos', intentos, 'correctos', correctos, 'tiempo_ms', tiempo_ms, 'mas_lentos_pct', mas_lentos_pct)) from mundos), '[]'::jsonb),
    'debiles', coalesce((select jsonb_agg(jsonb_build_object('mundo', mundo, 'tipo', tipo, 'intentos', intentos, 'correctos', correctos)) from debiles), '[]'::jsonb),
    'records', jsonb_build_object(
      'mas_rapida_ms', (select min(a.time_ms) from public.attempts a where a.user_id = v_user and a.correct),
      'mejor_dia', (select jsonb_build_object('fecha', fecha, 'precision', round(p * 100)) from mejor_dia),
      'elo', (select pr.elo_rating from public.profiles pr where pr.id = v_user)
    )
  ) into v_res;
  return v_res;
end;
$$;
revoke execute on function public.estadisticas_pro_v2(integer) from public, anon;
grant execute on function public.estadisticas_pro_v2(integer) to authenticated;
