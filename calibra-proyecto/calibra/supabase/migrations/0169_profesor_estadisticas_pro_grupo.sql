-- ============================================================
-- Prodigia — Fase D: desglose por mundo/sub-tema del grupo, para el
-- dashboard del profesor (/profesor/[groupId]). Mismo principio que el
-- beneficio individual "estadísticas avanzadas" de Prodigia Pro
-- (0146/0149/0151, /perfil/estadisticas), llevado a nivel de grupo:
--
--   1) resumen_grupo_mundos(p_group_id): GRATIS para cualquier profesor
--      — nivel_mundo (1-100, world_progress) por alumno y por mundo,
--      para la sección nueva "Nivel por mundo" en la tabla que YA ve
--      todo profesor hoy (junto al nivel 1-10 por operación aritmética
--      que ya existía). Un alumno sin fila en world_progress para un
--      mundo puntual (nunca lo jugó) simplemente no aparece — el cliente
--      lo trata como nivel 0/sin empezar, mismo criterio que
--      `?? 0` ya usado con nivel_suma/resta/etc. en este archivo.
--
--   2) estadisticas_pro_subtemas_grupo(p_group_id): EXCLUSIVA Prodigia
--      Pro (gateada en la página con requirePro, no acá — a diferencia
--      de las RPCs individuales de 0146/0149/0151, esta función NO
--      puede chequear profiles.plan del CALLER contra auth.uid()=a.user_id,
--      porque quien llama es el PROFESOR viendo datos de OTROS usuarios
--      (sus alumnos) — el gate de plan vive en el guard de la página
--      (requirePro), acá solo se re-verifica la pertenencia real del
--      grupo al profesor que llama, igual que resumen_grupo/
--      resumen_grupo_daily_progress de 0014). Mismo mapeo
--      problem_type → mundo que estadisticas_pro_subtemas() (0151),
--      extendido con calculia_%/circuitia_% (mundos 9 y 10, no existían
--      cuando se escribió 0151) y con Enigmia incluida esta vez vía
--      logic_attempts (con problem_type sintético 'enigmia') — la
--      versión individual la dejaba afuera a propósito porque
--      logic_puzzles no tiene sub-tema por fila, pero acá SÍ hace falta
--      para que "estancado" cubra los 10 mundos, no 9.
--
--      estancado: por (alumno, problem_type) con >= 20 intentos
--      totales, compara precisión de los últimos 10 intentos vs. los 10
--      inmediatos anteriores (row_number() sobre created_at desc, con
--      el id como desempate determinístico). estancado = true si la
--      precisión reciente es <= la anterior. Con menos de 20 intentos,
--      estancado = null (NO false) — a propósito, para no poder
--      confundir nunca "no hay suficiente data" con "no está
--      estancado": un profesor que vea `estancado = false` debe poder
--      confiar en que es una lectura real, no la ausencia de una.
-- Correr después de 0168_diez_mundos.sql.
-- ============================================================

-- ---------- 1) resumen_grupo_mundos: gratis, nivel por mundo (1-100) ----------
create or replace function public.resumen_grupo_mundos(p_group_id uuid)
returns table (user_id uuid, mundo text, nivel_mundo integer)
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
  select wp.user_id, wp.world, wp.nivel_mundo
  from public.group_members gm
  join public.world_progress wp on wp.user_id = gm.user_id
  where gm.group_id = p_group_id;
end;
$$;

grant execute on function public.resumen_grupo_mundos(uuid) to authenticated;

-- ---------- 2) estadisticas_pro_subtemas_grupo: Pro, sub-tema + estancado, por alumno ----------
create or replace function public.estadisticas_pro_subtemas_grupo(p_group_id uuid)
returns table (
  user_id uuid,
  mundo text,
  problem_type text,
  intentos bigint,
  correctos bigint,
  precision_pct numeric,
  estancado boolean
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
    with base as (
      select
        a.user_id,
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
        a.correct,
        a.created_at,
        a.id::bigint as attempt_id
      from public.attempts a
      join public.group_members gm on gm.user_id = a.user_id and gm.group_id = p_group_id
      union all
      select
        la.user_id,
        'enigmia'::text as problem_type,
        'enigmia'::text as m,
        la.correct,
        la.created_at,
        la.id::bigint as attempt_id
      from public.logic_attempts la
      join public.group_members gm on gm.user_id = la.user_id and gm.group_id = p_group_id
    ),
    ranked as (
      select
        b.*,
        row_number() over (partition by b.user_id, b.problem_type order by b.created_at desc, b.attempt_id desc) as rn
      from base b
      where b.m is not null
    ),
    agg as (
      select
        r.user_id,
        r.m,
        r.problem_type,
        count(*)::bigint as intentos,
        count(*) filter (where r.correct)::bigint as correctos,
        round(count(*) filter (where r.correct)::numeric / count(*), 4) as precision_pct
      from ranked r
      group by r.user_id, r.m, r.problem_type
      having count(*) >= 5
    ),
    stagnation as (
      select
        r.user_id,
        r.problem_type,
        count(*) as n_total,
        count(*) filter (where r.rn <= 10) as n_reciente,
        count(*) filter (where r.rn <= 10 and r.correct) as c_reciente,
        count(*) filter (where r.rn > 10 and r.rn <= 20) as n_anterior,
        count(*) filter (where r.rn > 10 and r.rn <= 20 and r.correct) as c_anterior
      from ranked r
      group by r.user_id, r.problem_type
    )
    select
      agg.user_id,
      agg.m as mundo,
      agg.problem_type,
      agg.intentos,
      agg.correctos,
      agg.precision_pct,
      (case
        when s.n_total >= 20 and s.n_reciente = 10 and s.n_anterior = 10 then
          (s.c_reciente::numeric / s.n_reciente) <= (s.c_anterior::numeric / s.n_anterior)
        else null
      end) as estancado
    from agg
    join stagnation s on s.user_id = agg.user_id and s.problem_type = agg.problem_type
    order by agg.user_id, agg.precision_pct asc;
end;
$$;

grant execute on function public.estadisticas_pro_subtemas_grupo(uuid) to authenticated;

notify pgrst, 'reload schema';
