-- ====================================================================
-- Prodigia — Dashboard de estadísticas avanzadas (Pro), pedido en vivo
-- (2026-09-15): "buenas estadisticas de CADA ciudad, mostrar tiempo
-- jugado, estadisticas descriptivas, graficos... que no sea muy
-- avanzado estadisticamente, completo". Dos cambios:
--
--   1) estadisticas_pro_perfil() gana una columna: tiempo_ms (suma de
--      time_ms de esa ciudad) — mismo agrupamiento por prefijo de
--      problem_type que ya tenía (0146), cambia el "shape" de salida
--      así que va con drop + create (42P13), no create or replace.
--   2) estadisticas_pro_actividad_diaria(): últimos 30 días de
--      actividad (fecha, intentos, correctos, tiempo_ms) combinando
--      attempts + logic_attempts — la base del gráfico de barras diario
--      del dashboard. Mismo gate de Pro (auth.uid() + profiles.plan)
--      que estadisticas_pro_perfil.
-- ====================================================================

drop function if exists public.estadisticas_pro_perfil();

create function public.estadisticas_pro_perfil()
returns table (mundo text, intentos bigint, correctos bigint, precision_pct numeric, tiempo_ms bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_plan text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
  if v_plan is distinct from 'pro' then
    raise exception 'estadisticas avanzadas exclusivas de Prodigia Pro';
  end if;

  return query
    with base as (
      select
        (case
          when a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra') then 'numeria'
          when a.problem_type = 'geografia' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          else null
        end) as m,
        a.correct,
        a.time_ms
      from public.attempts a
      where a.user_id = v_user
      union all
      select 'enigmia' as m, la.correct, la.time_ms
      from public.logic_attempts la
      where la.user_id = v_user
    )
    select b.m, count(*)::bigint, count(*) filter (where b.correct)::bigint,
      round(count(*) filter (where b.correct)::numeric / count(*), 4),
      coalesce(sum(b.time_ms), 0)::bigint
    from base b
    where b.m is not null
    group by b.m
    order by count(*) desc;
end;
$$;

grant execute on function public.estadisticas_pro_perfil() to authenticated;

create or replace function public.estadisticas_pro_actividad_diaria()
returns table (fecha date, intentos bigint, correctos bigint, tiempo_ms bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_plan text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
  if v_plan is distinct from 'pro' then
    raise exception 'estadisticas avanzadas exclusivas de Prodigia Pro';
  end if;

  return query
    with base as (
      select a.created_at, a.correct, a.time_ms
      from public.attempts a
      where a.user_id = v_user and a.created_at >= now() - interval '30 days'
      union all
      select la.created_at, la.correct, la.time_ms
      from public.logic_attempts la
      where la.user_id = v_user and la.created_at >= now() - interval '30 days'
    )
    select (b.created_at at time zone 'utc')::date as fecha, count(*)::bigint,
      count(*) filter (where b.correct)::bigint, coalesce(sum(b.time_ms), 0)::bigint
    from base b
    group by fecha
    order by fecha asc;
end;
$$;

grant execute on function public.estadisticas_pro_actividad_diaria() to authenticated;

notify pgrst, 'reload schema';
