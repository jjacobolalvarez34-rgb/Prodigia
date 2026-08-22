-- ============================================================
-- Prodigia — Fase 3 de la tanda "Numeria: Geometría, Practicar
-- estandarizado, nivel de mundo, Anatomía": redefine cómo se calcula
-- el nivel de mundo.
--
-- Auditoría (causa real de "no avanza"): registrar_puntos_mundo() y su
-- fórmula (0033/0034) están bien conectadas — las 4 rutas de finish la
-- llaman, se guarda y se muestra bien. El problema real es doble:
--   1) la fórmula vieja (curva RPG solo por Puntos acumulados) no
--      tenía techo en 100 pese a que el diseño original lo pedía —
--      podía seguir subiendo sin límite.
--   2) esa curva es empinada y el pool de Puntos es COMPARTIDO entre
--      todos los sub-temas de un mundo (en Numeria, los 6 temas
--      alimentan el mismo contador) — con XP típico de ~100-300 por
--      partida, se siente estancado durante muchas sesiones aunque
--      técnicamente sí esté subiendo.
--
-- Fórmula nueva: combinación de 3 ejes, no solo Puntos.
--   (a) volumen: Puntos acumulados en el mundo, normalizado a un techo
--       (30% del peso — importa, pero no es lo único).
--   (b) dominio: fracción de los sub-temas del mundo en calibración
--       nivel 10 (50% del peso — el eje más pesado, es la señal más
--       real de "domina el mundo").
--   (c) lecciones: fracción de lecciones de Aprender del mundo ya
--       dominadas (20% del peso).
-- nivel_mundo = round(100 * (0.3*volumen + 0.5*dominio + 0.2*lecciones)),
-- con techo real en 100 (antes no lo tenía).
-- ============================================================

drop function if exists public.registrar_puntos_mundo(text, integer);

create function public.registrar_puntos_mundo(p_world text, p_puntos integer)
returns table (world text, puntos_mundo integer, nivel_mundo integer, nivel_anterior integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_puntos integer;
  v_nivel integer;
  v_nivel_anterior integer;
  v_temas_totales integer := 1;
  v_temas_en_10 integer := 0;
  v_lecciones_totales integer := 0;
  v_lecciones_completadas integer := 0;
  v_frac_volumen numeric;
  v_frac_dominio numeric;
  v_frac_lecciones numeric;
  v_umbral_volumen constant integer := 50000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select w.nivel_mundo into v_nivel_anterior
  from public.world_progress w where w.user_id = v_user and w.world = p_world;
  v_nivel_anterior := coalesce(v_nivel_anterior, 1);

  if p_puntos > 0 then
    insert into public.world_progress (user_id, world, puntos_mundo, nivel_mundo, updated_at)
    values (v_user, p_world, p_puntos, 1, now())
    on conflict (user_id, world) do update
      set puntos_mundo = public.world_progress.puntos_mundo + excluded.puntos_mundo,
          updated_at = now()
    returning public.world_progress.puntos_mundo into v_puntos;
  else
    select w.puntos_mundo into v_puntos from public.world_progress w where w.user_id = v_user and w.world = p_world;
    v_puntos := coalesce(v_puntos, 0);
  end if;

  -- (b) dominio: el total esperado es FIJO por mundo (no "cuántas filas
  -- existan en skill_levels") — si nunca tocaste un tema, cuenta como
  -- "no dominado", no como si no existiera.
  if p_world = 'numeria' then
    v_temas_totales := 20;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in (
        'suma', 'resta', 'multiplicacion', 'division',
        'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
        'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
        'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
        'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
        'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas'
      );
  elsif p_world = 'geografia' then
    v_temas_totales := 1;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and problem_type = 'geografia' and nivel = 10;
  elsif p_world = 'quimia' then
    v_temas_totales := 5;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica');
  elsif p_world = 'enigmia' then
    v_temas_totales := 1;
    select count(*) into v_temas_en_10 from public.logic_skill_levels
      where user_id = v_user and nivel = 10;
  elsif p_world = 'anatomia' then
    v_temas_totales := 4;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso');
  end if;

  -- (c) lecciones de Aprender dominadas sobre el total del mundo.
  -- Enigmia tiene su propio catálogo (logic_techniques), separado del
  -- resto (techniques, compartida por los demás mundos).
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
    -- geografia / quimia / anatomia: un solo problem_type de lección,
    -- igual al nombre del mundo.
    select count(*) into v_lecciones_totales from public.techniques where problem_type = p_world;
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = v_user and tp.dominado and t.problem_type = p_world;
  end if;

  v_frac_volumen := least(1.0, v_puntos::numeric / v_umbral_volumen);
  v_frac_dominio := case when v_temas_totales > 0 then v_temas_en_10::numeric / v_temas_totales else 0 end;
  v_frac_lecciones := case when v_lecciones_totales > 0 then v_lecciones_completadas::numeric / v_lecciones_totales else 1 end;

  v_nivel := greatest(1, least(100, round(100 * (0.3 * v_frac_volumen + 0.5 * v_frac_dominio + 0.2 * v_frac_lecciones))::integer));

  update public.world_progress set nivel_mundo = v_nivel where user_id = v_user and world = p_world;

  return query select p_world, v_puntos, v_nivel, v_nivel_anterior;
end;
$$;

grant execute on function public.registrar_puntos_mundo(text, integer) to authenticated;
