-- ====================================================================
-- PRODIGIA — FIX 42702 real, confirmado en vivo contra producción
-- (verificado con llamadas RPC reales vía la cuenta QA1, 2026-09-12).
--
-- HISTORIA DE ESTE ARCHIVO (honesta): la primera versión de esta
-- migración solo cambiaba la línea
--   update public.world_progress set nivel_mundo = v_nivel
--     where user_id = v_user and world = p_world;
-- a una forma calificada. Ese fix era INCOMPLETO — el propietario del
-- proyecto corrió 0125 después y encontró el MISMO error 42702 dentro
-- de recalcular_progreso_mundo, en el INSERT/ON CONFLICT, no en un
-- UPDATE. Diagnóstico correcto esta vez:
--
-- `returns table (world text, puntos_mundo integer, nivel_mundo
-- integer, ...)` crea 3 variables de salida con nombres IDÉNTICOS a 3
-- columnas reales de world_progress (world, puntos_mundo, nivel_mundo).
-- PL/pgSQL escanea el texto completo de cada sentencia embebida
-- buscando coincidencias con nombres de variable ANTES de que el
-- planner sepa que una posición es "lista de columnas de un INSERT" o
-- "conflict target de ON CONFLICT" — ahí igual puede ser ambiguo,
-- aunque en SQL puro esas posiciones nunca deberían serlo. La única
-- forma robusta de cerrar esto de una vez es que la función NO tenga
-- ninguna variable de salida (ni local) con el mismo nombre que una
-- columna real de world_progress usada en cualquier INSERT/UPDATE/ON
-- CONFLICT dentro de su cuerpo — no alcanza con calificar una sola
-- línea, porque el conflicto puede reaparecer en cualquier otra.
--
-- ALCANCE DEL BUG: la misma línea sin alias del UPDATE apareció
-- copiada tal cual desde 0033_nivel_de_mundo.sql hasta
-- 0131_fix_42702_columnas_ambiguas.sql — 11 migraciones, nunca
-- corregida en ninguna versión de este proyecto, ni antes ni durante
-- opencode. El patrón del INSERT/ON CONFLICT (mismo problema, otra
-- sentencia) es nuevo de recalcular_progreso_mundo (0125).
--
-- IMPACTO: cualquier práctica normal (los 8 mundos) llama
-- registrar_progreso_mundo al terminar un sprint. Con el bug activo,
-- la función completa aborta ahí — respuestaError lo traduce a un
-- mensaje genérico en el cliente, así que nunca se vio el código de
-- error real. Esto le da una causa raíz concreta (no una sospecha) al
-- síntoma reportado de "cientos de problemas resueltos en Numeria y el
-- mundo se queda en nivel 1": world_progress.nivel_mundo probablemente
-- nunca se actualizó, para NADIE, en ninguna versión de esta función.
--
-- FIX: se renombran las 3 columnas de salida que colisionan
-- (world→mundo_out, puntos_mundo→puntos_mundo_out,
-- nivel_mundo→nivel_mundo_out) — nadie fuera de esta función lee el
-- resultado por nombre salvo registrar_puntos_mundo (el wrapper viejo,
-- 0109), que se actualiza abajo para seguir devolviendo exactamente
-- las mismas columnas de siempre (world/puntos_mundo/nivel_mundo/
-- nivel_anterior) — su contrato externo no cambia. `nivel_anterior` no
-- es columna real de world_progress: nunca fue parte del conflicto, se
-- deja como estaba.
-- ====================================================================

-- Postgres no deja cambiar el tipo de retorno de una función existente
-- con CREATE OR REPLACE cuando cambian los nombres/tipos de las
-- columnas de un RETURNS TABLE (42P13) — hay que borrarla primero. Acá
-- es seguro: nada depende de registrar_progreso_mundo a nivel de
-- catálogo (ni vistas ni otras funciones SQL/plpgsql registran esa
-- dependencia en su creación), solo se la llama en tiempo de
-- ejecución — se recrea en el mismo archivo, sin ventana real donde
-- falte.
drop function if exists public.registrar_progreso_mundo(text, integer);

create function public.registrar_progreso_mundo(p_world text, p_puntos integer)
returns table (mundo_out text, puntos_mundo_out integer, nivel_mundo_out integer, nivel_anterior integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_puntos integer;
  v_nivel integer;
  v_nivel_anterior integer;
  v_real_mundo integer;
  v_ya integer;
  v_por_acreditar integer;
  v_temas_totales integer := 1;
  v_temas_nivel integer;
  v_suma_dominio numeric := 0;
  v_lecciones_totales integer := 0;
  v_lecciones_completadas integer := 0;
  v_frac_volumen numeric;
  v_frac_dominio numeric;
  v_frac_lecciones numeric;
  v_umbral_volumen constant integer := 25000;
  v_rec record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select w.nivel_mundo into v_nivel_anterior
  from public.world_progress w where w.user_id = v_user and w.world = p_world;
  v_nivel_anterior := coalesce(v_nivel_anterior, 1);

  v_real_mundo := public.xp_real_por_mundo(v_user, p_world)::integer;
  select coalesce(w.puntos_mundo, 0) into v_ya
  from public.world_progress w where w.user_id = v_user and w.world = p_world;
  v_por_acreditar := greatest(0, v_real_mundo - v_ya);

  if v_por_acreditar > 0 then
    insert into public.world_progress (user_id, world, puntos_mundo, nivel_mundo, updated_at)
    values (v_user, p_world, v_por_acreditar, 1, now())
    on conflict (user_id, world) do update
      set puntos_mundo = public.world_progress.puntos_mundo + excluded.puntos_mundo,
          updated_at = now()
    returning public.world_progress.puntos_mundo into v_puntos;
  else
    select w.puntos_mundo into v_puntos from public.world_progress w where w.user_id = v_user and w.world = p_world;
    v_puntos := coalesce(v_puntos, 0);
  end if;

  if p_world = 'numeria' then
    v_temas_totales := 20;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('suma'), ('resta'), ('multiplicacion'), ('division'),
        ('fracciones_simplificar'), ('fracciones_comparar'), ('fracciones_sumar'),
        ('decimales_convertir'), ('decimales_porcentaje'), ('decimales_redondear'),
        ('potencias_potencia'), ('potencias_raiz'), ('potencias_notacion'),
        ('algebra_evaluar'), ('algebra_un-paso'), ('algebra_dos-pasos'),
        ('geometria_perimetro'), ('geometria_area'), ('geometria_angulos'), ('geometria_ternas')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'geografia' then
    v_temas_totales := 1;
    select greatest(0.0, least(1.0, (coalesce(nivel,1) - 4)::numeric / 6))
      into v_suma_dominio
      from public.skill_levels
      where user_id = v_user and problem_type = 'geografia';
    v_suma_dominio := coalesce(v_suma_dominio, 0);
  elsif p_world = 'quimia' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('quimia_simbolos'), ('quimia_formulas'), ('quimia_tabla'),
        ('quimia_nomenclatura'), ('quimia_organica')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'enigmia' then
    v_temas_totales := 1;
    select greatest(0.0, least(1.0, (coalesce(nivel,1) - 4)::numeric / 6))
      into v_suma_dominio
      from public.logic_skill_levels
      where user_id = v_user;
    v_suma_dominio := coalesce(v_suma_dominio, 0);
  elsif p_world = 'anatomia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('anatomia_oseo'), ('anatomia_muscular'), ('anatomia_organos'), ('anatomia_nervioso')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'melodia' then
    v_temas_totales := 6;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('melodia_fundamentos'), ('melodia_lectura'), ('melodia_alteraciones'),
        ('melodia_escalas'), ('melodia_acordes'), ('melodia_oido_absoluto')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'trigonometria' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('trigonometria_razones'), ('trigonometria_circulo'),
        ('trigonometria_identidades'), ('trigonometria_leyes')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'historia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('historia_cronologia'), ('historia_personajes'),
        ('historia_causaefecto'), ('historia_fechas')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  else
    v_temas_totales := 1;
  end if;

  if p_world = 'enigmia' then
    select count(*) into v_lecciones_totales from public.logic_techniques;
    select count(*) into v_lecciones_completadas
      from public.logic_technique_progress ltp
      where ltp.user_id = v_user and ltp.dominado;
  elsif p_world = 'numeria' then
    select count(*) into v_lecciones_totales from public.techniques
      where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria');
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = v_user and tp.dominado
        and t.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria');
  else
    select count(*) into v_lecciones_totales from public.techniques where problem_type = p_world;
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = v_user and tp.dominado and t.problem_type = p_world;
  end if;

  v_frac_volumen := least(1.0, v_puntos::numeric / v_umbral_volumen);
  v_frac_dominio := case when v_temas_totales > 0 then v_suma_dominio / v_temas_totales else 0 end;
  v_frac_lecciones := case when v_lecciones_totales > 0 then v_lecciones_completadas::numeric / v_lecciones_totales else 1 end;

  v_nivel := greatest(1, least(100, round(100 * (0.34 * v_frac_volumen + 0.45 * v_frac_dominio + 0.21 * v_frac_lecciones))::integer));

  update public.world_progress as wp
  set nivel_mundo = v_nivel
  where wp.user_id = v_user and wp.world = p_world;

  return query select p_world, v_puntos, v_nivel, v_nivel_anterior;
end;
$$;

grant execute on function public.registrar_progreso_mundo(text, integer) to authenticated;

-- ---------- registrar_puntos_mundo: mismo contrato externo de siempre ----------
-- Solo cambia CÓMO lee las columnas de registrar_progreso_mundo (ahora
-- con otro nombre interno) — su propia firma y nombres de salida hacia
-- afuera (world/puntos_mundo/nivel_mundo/nivel_anterior) no cambian.
create or replace function public.registrar_puntos_mundo(p_world text, p_puntos integer)
returns table (world text, puntos_mundo integer, nivel_mundo integer, nivel_anterior integer)
language sql
security definer
set search_path = public
as $$
  select w.mundo_out, w.puntos_mundo_out, w.nivel_mundo_out, w.nivel_anterior
  from public.registrar_progreso_mundo(p_world, p_puntos) w;
$$;

grant execute on function public.registrar_puntos_mundo(text, integer) to authenticated;

notify pgrst, 'reload schema';
