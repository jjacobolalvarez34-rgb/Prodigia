-- ====================================================================
-- Prodigia — Dashboard Pro, ronda 2 (pedido en vivo, 2026-09-15):
-- "afinidad de ciudad, que es lo que mas se me dificulta, en que me
-- equivoco mas por ciudad".
--
--   1) BUG real encontrado al construir esto: el "case" que clasifica
--      problem_type -> mundo (en estadisticas_pro_perfil, 0146/0149, y
--      copiado del mismo patrón de ranking_semanal_filtrado 0119)
--      buscaba los valores SUELTOS 'fracciones', 'decimales', 'potencias'
--      y 'algebra' — pero esos sub-modos en realidad guardan el
--      problem_type con PREFIJO ("fracciones_simplificar",
--      "decimales_convertir", "potencias_raiz", "algebra_despejar",
--      "geometria_area", confirmado leyendo cada *PracticaClient.tsx).
--      Ningún intento de Fracciones/Decimales/Potencias/Álgebra/
--      Geometría hacía match nunca — se perdían en silencio del total
--      de Numeria en las estadísticas Pro. Se corrige acá con "like"
--      sobre el prefijo real, y de paso se agrega 'geometria_%' que
--      directamente no estaba contemplado. estadisticas_pro_perfil()
--      no cambia de columnas, así que va con create or replace.
--   2) estadisticas_pro_subtemas(): mismo agrupamiento pero por
--      problem_type EXACTO (no por mundo entero) — la base del "en qué
--      te cuesta más" dentro de cada ciudad. Enigmia queda afuera (sus
--      acertijos procedurales ni tienen fila en logic_puzzles), sigue
--      cubierta a nivel de mundo por estadisticas_pro_perfil.
-- ====================================================================

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
