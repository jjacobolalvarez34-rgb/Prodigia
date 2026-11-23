-- 0319: estudio del curso para el docente (2026-11-23: «las estadísticas son pocas,
-- no dan un estudio real; que sean datos útiles y que haya estudios de cómo mejorar»).
--
-- Dos funciones de lectura, solo para el docente del curso (mismo chequeo que
-- panel_grupo de 0318). Con esto el panel arma, en el cliente (lib/docentes/estudio.ts):
-- los temas que más le cuestan al curso y si mejoran o empeoran, el perfil de cada
-- estudiante (fortalezas, debilidades, velocidad, constancia, tendencia) y
-- recomendaciones concretas.
--
--  1) estudio_grupo: por estudiante y por tema (problem_type; Enigmia es un tema solo),
--     en las últimas p_dias semanas: intentos y aciertos totales, de los últimos 14 días
--     y de los 14 anteriores (para la tendencia), tiempo mediano de respuesta y nivel.
--  2) habitos_grupo: por estudiante, día y hora (hora de Colombia): ejercicios, aciertos
--     y minutos de práctica (suma de los tiempos de respuesta).
-- Requiere 0318. Idempotente.

create or replace function public.estudio_grupo(p_group_id uuid, p_dias integer default 56)
returns table (
  user_id uuid, mundo text, tema text,
  intentos integer, correctos integer,
  intentos_rec integer, correctos_rec integer,
  intentos_ant integer, correctos_ant integer,
  tiempo_mediano_ms integer, nivel_max integer, nivel_rec numeric,
  ultimo timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_desde timestamptz := now() - make_interval(days => least(greatest(coalesce(p_dias, 56), 14), 180));
begin
  if not exists (select 1 from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid()) then
    raise exception 'no autorizado';
  end if;

  return query
    with base as (
      select a.user_id as uid, public.mundo_de_problem_type(a.problem_type) as m, a.problem_type as tp,
        a.correct as ok, a.time_ms as ms, a.level::integer as nv, a.created_at as cuando
      from public.attempts a
      join public.group_members gm on gm.user_id = a.user_id and gm.group_id = p_group_id
      where a.created_at >= v_desde
      union all
      select la.user_id, 'enigmia', 'enigmia', la.correct, la.time_ms, null::integer, la.created_at
      from public.logic_attempts la
      join public.group_members gm on gm.user_id = la.user_id and gm.group_id = p_group_id
      where la.created_at >= v_desde
    )
    select b.uid, b.m, b.tp,
      count(*)::integer,
      (count(*) filter (where b.ok))::integer,
      (count(*) filter (where b.cuando >= now() - interval '14 days'))::integer,
      (count(*) filter (where b.cuando >= now() - interval '14 days' and b.ok))::integer,
      (count(*) filter (where b.cuando < now() - interval '14 days' and b.cuando >= now() - interval '28 days'))::integer,
      (count(*) filter (where b.cuando < now() - interval '14 days' and b.cuando >= now() - interval '28 days' and b.ok))::integer,
      (percentile_cont(0.5) within group (order by b.ms))::integer,
      max(b.nv),
      round(avg(b.nv) filter (where b.cuando >= now() - interval '14 days'), 1),
      max(b.cuando)
    from base b
    group by b.uid, b.m, b.tp;
end;
$$;
grant execute on function public.estudio_grupo(uuid, integer) to authenticated;

create or replace function public.habitos_grupo(p_group_id uuid, p_dias integer default 28)
returns table (user_id uuid, fecha date, hora integer, ejercicios integer, correctos integer, minutos numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_desde timestamptz := now() - make_interval(days => least(greatest(coalesce(p_dias, 28), 7), 90));
begin
  if not exists (select 1 from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid()) then
    raise exception 'no autorizado';
  end if;

  return query
    with base as (
      select a.user_id as uid, a.created_at as cuando, a.correct as ok, a.time_ms as ms
      from public.attempts a
      join public.group_members gm on gm.user_id = a.user_id and gm.group_id = p_group_id
      where a.created_at >= v_desde
      union all
      select la.user_id, la.created_at, la.correct, la.time_ms
      from public.logic_attempts la
      join public.group_members gm on gm.user_id = la.user_id and gm.group_id = p_group_id
      where la.created_at >= v_desde
    )
    select b.uid,
      (b.cuando at time zone 'America/Bogota')::date,
      extract(hour from (b.cuando at time zone 'America/Bogota'))::integer,
      count(*)::integer,
      (count(*) filter (where b.ok))::integer,
      round(sum(least(b.ms, 120000))::numeric / 60000, 1)
    from base b
    group by 1, 2, 3;
end;
$$;
grant execute on function public.habitos_grupo(uuid, integer) to authenticated;
