-- ============================================================
-- Prodigia — bug real encontrado (pedido del usuario 2026-09-18: "los
-- mundos nuevos deben aparecer en el apartado de estadística"):
-- estadisticas_pro_perfil() y estadisticas_pro_subtemas() (definición
-- vigente en 0151) nunca se actualizaron cuando se agregaron Calculia
-- y Circuitia (0165-0171) — su CASE de problem_type→mundo no tenía
-- ninguna rama para 'calculia_%'/'circuitia_%', así que esos intentos
-- caían en el "else null" y se filtraban por completo
-- (`where b.m is not null`). Un usuario Pro que practica Calculia o
-- Circuitia hoy no ve NADA de esos dos mundos en /perfil/estadisticas
-- — ni en el resumen general ni en el desglose por sub-tema.
--
-- Mismo patrón ya usado (y correcto) en estadisticas_pro_subtemas_grupo
-- (0169, la versión para docentes) — se copia la misma extensión acá.
-- Ninguna de las dos funciones cambia de columnas de salida, así que
-- van con create or replace, sin drop.
-- ============================================================

create or replace function public.estadisticas_pro_perfil()
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
          when a.problem_type in ('suma', 'resta', 'multiplicacion', 'division') then 'numeria'
          when a.problem_type like 'fracciones_%' then 'numeria'
          when a.problem_type like 'decimales_%' then 'numeria'
          when a.problem_type like 'potencias_%' then 'numeria'
          when a.problem_type like 'algebra_%' then 'numeria'
          when a.problem_type like 'geometria_%' then 'numeria'
          when a.problem_type = 'geografia' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          when a.problem_type like 'calculia_%' then 'calculia'
          when a.problem_type like 'circuitia_%' then 'circuitia'
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

create or replace function public.estadisticas_pro_subtemas()
returns table (mundo text, problem_type text, intentos bigint, correctos bigint, precision_pct numeric)
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
        a.problem_type,
        (case
          when a.problem_type in ('suma', 'resta', 'multiplicacion', 'division') then 'numeria'
          when a.problem_type like 'fracciones_%' then 'numeria'
          when a.problem_type like 'decimales_%' then 'numeria'
          when a.problem_type like 'potencias_%' then 'numeria'
          when a.problem_type like 'algebra_%' then 'numeria'
          when a.problem_type like 'geometria_%' then 'numeria'
          when a.problem_type = 'geografia' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          when a.problem_type like 'calculia_%' then 'calculia'
          when a.problem_type like 'circuitia_%' then 'circuitia'
          else null
        end) as m,
        a.correct
      from public.attempts a
      where a.user_id = v_user
    )
    select b.m, b.problem_type, count(*)::bigint, count(*) filter (where b.correct)::bigint,
      round(count(*) filter (where b.correct)::numeric / count(*), 4)
    from base b
    where b.m is not null
    group by b.m, b.problem_type
    having count(*) >= 5
    order by b.m, round(count(*) filter (where b.correct)::numeric / count(*), 4) asc;
end;
$$;

grant execute on function public.estadisticas_pro_subtemas() to authenticated;

notify pgrst, 'reload schema';
