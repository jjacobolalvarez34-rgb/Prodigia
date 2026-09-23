-- ============================================================
-- Prodigia — Geografía: calibración por continente (américa/europa/
-- áfrica/asia_oceania), como el resto de los mundos multi-modo.
--
-- Geografía era el único mundo original con UN solo `skill_levels`
-- global (`problem_type = 'geografia'`) pese a tener 4 continentes
-- jugables reales con datos ya separados (src/lib/practica/geografia.ts,
-- `type Continente`) — documentado como gap real (no bug de wiring) en
-- docs/PARIDAD_MUNDOS.md, sección "Gaps reales que quedan abiertos".
--
-- A diferencia de Enigmia (0205_enigmia_niveles_por_categoria.sql), acá
-- NO hace falta tocar el esquema de la tabla: `skill_levels` ya nació
-- multi-mundo/multi-problem_type con PK compuesta `(user_id,
-- problem_type)` (0002_mecanica_v1.sql) — el mismo mecanismo simple que
-- ya usan Estadística/Naipia/Codia (varios problem_type dentro de la
-- tabla genérica). No hace falta `alter table`, soltar ninguna PK, ni
-- una columna `categoria` nueva: insertar 4 filas nuevas con problem_type
-- distinto ya es válido contra el esquema actual.
--
-- Migración de datos: cada usuario que ya tenía una fila
-- (problem_type='geografia', nivel único) pasa a tener 4 filas nuevas —
-- una por continente — heredando el MISMO nivel/racha_actual que ya
-- tenía (no se resetea a nadie a nivel 1, sería peor experiencia que la
-- actual — mismo criterio que se usó para Enigmia).
--
-- Ejemplo concreto: un usuario con una sola fila
--   (user_id=U, problem_type='geografia', nivel=7, racha_actual=1)
-- termina, después de esta migración, con 4 filas nuevas:
--   (U, 'geografia_america',      7, 1)
--   (U, 'geografia_europa',       7, 1)
--   (U, 'geografia_africa',       7, 1)
--   (U, 'geografia_asia_oceania', 7, 1)
-- — cada continente sigue su propio camino de ahí en adelante (sube/baja
-- de forma independiente con cada intento, vía el RPC genérico
-- insertar_intento, sin cambios de firma — ver más abajo).
--
-- Decisión sobre la fila vieja (problem_type='geografia'): se BORRA
-- después de expandirla (a diferencia de la opción de dejarla huérfana
-- que también era válida acá, sin PK que obligue a tocarla) — mismo
-- criterio final que terminó usando Enigmia, para no dejar un valor de
-- calibración que ya nadie actualiza dando vueltas y que alguien pueda
-- leer por error en el futuro. La tabla `attempts` (historial de
-- partidas jugadas) NO se toca: sus filas viejas con
-- problem_type='geografia' son historial real, se quedan como están
-- para siempre (igual que pasa con 'fracciones'/'decimales'/'potencias'/
-- 'algebra' sin sufijo, valores vestigiales que siguen en el check de
-- attempts desde 0079_practicar_subtemas.sql) — por eso 'geografia'
-- SIGUE en attempts_problem_type_check (no se puede sacar: hay filas
-- reales con ese valor y `alter table ... add constraint check` valida
-- TODAS las filas existentes al agregarse). En skill_levels sí se puede
-- sacar en teoría (no van a quedar filas con ese valor), pero se deja
-- en el check por las dudas / consistencia con el resto de valores
-- vestigiales del mismo check — no hace daño mantenerlo permitido.
--
-- Orden de operaciones (pensado dos veces, ver nota real de 0205 sobre
-- el bug de orden "23505 duplicate key" — acá no hay PK que romper,
-- pero el insert/delete sí necesita ir en el orden correcto):
--   1) INSERT ... SELECT ... FROM skill_levels, unnest(...) WHERE
--      problem_type = 'geografia' — el SELECT corre sobre el snapshot
--      de ANTES de este INSERT (semántica estándar de una sola sentencia
--      en Postgres), así que nunca expande las 4 filas que el propio
--      INSERT genera. `on conflict (user_id, problem_type) do nothing`
--      por si esta migración se reintenta ANTES de que corra el DELETE
--      del paso 2 (no debería pasar en una corrida normal, pero deja la
--      sentencia seguypra de reintentar sola).
--   2) DELETE FROM skill_levels WHERE problem_type = 'geografia' — solo
--      después del INSERT, para no perder el nivel/racha de origen.
-- Reintentar esta migración completa una segunda vez no hace nada: el
-- paso 1 ya no encuentra filas con problem_type = 'geografia' (las borró
-- el paso 2 la primera vez), así que no expande ni inserta nada.
--
-- ⚠️ Regla de docs/PARIDAD_MUNDOS.md seguida al pie de la letra: antes de
-- tocar cualquier función cross-cutting se buscó con grep cuál migración
-- la redefinió por última vez y se partió de esa versión, no de una
-- copia vieja. Bases reales:
--   - skill_levels_problem_type_check / attempts_problem_type_check /
--     xp_real_por_mundo / ranking_semanal_filtrado: 0189_mundos_estadistica_naipia_codia.sql
--     (última que las toca; 0190-0206 no las tocaron).
--   - registrar_progreso_mundo / detalle_nivel_mundo: 0205_enigmia_niveles_por_categoria.sql
--     (más nueva que 0189 — fue la última tanda que las redefinió, para
--     el fix de Enigmia; ninguna migración 0206 las tocó). El resto de
--     las ramas (numeria/quimia/enigmia/anatomia/melodia/trigonometria/
--     historia/calculia/circuitia/estadistica/naipia/codia) queda
--     IDÉNTICO a esa versión — solo cambia la rama 'geografia' en cada
--     una.
--   - estadisticas_pro_perfil / estadisticas_pro_subtemas /
--     estadisticas_pro_subtemas_grupo: 0190_trece_mundos.sql (más nueva
--     que 0187; ninguna migración 0191-0206 las tocó). Se corrigen acá
--     mismo porque, si no, las 4 nuevas problem_type de Geografía caen
--     en el "else null" de esas 3 funciones y sus intentos se filtran en
--     silencio de TODA estadística Pro — el mismo bug real que tuvieron
--     Calculia/Circuitia (0187) y que docs/PARIDAD_MUNDOS.md fila 21
--     pide revisar en cada mundo nuevo.
--
-- Correr después de 0206_enigmia_mas_contenido.sql
-- ============================================================

-- ---------- 1) Migración de datos ----------
insert into public.skill_levels (user_id, problem_type, nivel, racha_actual, updated_at)
select user_id, pt, nivel, racha_actual, updated_at
from public.skill_levels, unnest(array['geografia_america', 'geografia_europa', 'geografia_africa', 'geografia_asia_oceania']) as pt
where problem_type = 'geografia'
on conflict (user_id, problem_type) do nothing;

delete from public.skill_levels where problem_type = 'geografia';

-- ---------- 2) Check constraints: sumar los 4 problem_type nuevos ----------
alter table public.skill_levels drop constraint if exists skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'geografia_america', 'geografia_europa', 'geografia_africa', 'geografia_asia_oceania',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
    'anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso',
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto',
    'trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes',
    'historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas',
    'calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable',
    'circuitia_serie', 'circuitia_paralelo', 'circuitia_mixto', 'circuitia_cualitativo',
    'estadistica_central', 'estadistica_dispersion', 'estadistica_probabilidad', 'estadistica_datos', 'estadistica_graficos',
    'naipia_hilo', 'naipia_ko', 'naipia_hiopt2', 'naipia_omega2', 'naipia_verdadero',
    'codia_sintaxis', 'codia_salida', 'codia_error', 'codia_estructuras'
  ));

alter table public.attempts drop constraint if exists attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'geografia_america', 'geografia_europa', 'geografia_africa', 'geografia_asia_oceania',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
    'anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso',
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto',
    'trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes',
    'historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas',
    'calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable',
    'circuitia_serie', 'circuitia_paralelo', 'circuitia_mixto', 'circuitia_cualitativo',
    'estadistica_central', 'estadistica_dispersion', 'estadistica_probabilidad', 'estadistica_datos', 'estadistica_graficos',
    'naipia_hilo', 'naipia_ko', 'naipia_hiopt2', 'naipia_omega2', 'naipia_verdadero',
    'codia_sintaxis', 'codia_salida', 'codia_error', 'codia_estructuras'
  ));

-- insertar_intento (RPC genérico security definer que escribe attempts +
-- skill_levels para TODOS los mundos que calibran por problem_type, ver
-- 0131_fix_42702_columnas_ambiguas.sql) no tiene ninguna lista propia de
-- problem_type válidos adentro del cuerpo — solo confía en los 2 checks
-- de arriba. No hace falta re-declararlo.

-- ---------- 3) xp_real_por_mundo (base real: 0189): rama 'geografia' pasa a sumar los 4 sub-tipos + el histórico bare 'geografia' ----------
-- `like 'geografia%'` (sin guion bajo) matchea TANTO el valor histórico
-- 'geografia' (attempts viejos, de antes de esta migración) COMO los 4
-- nuevos ('geografia_america', ...) — necesario para que el XP de mundo
-- acumulado no se "resetee" de golpe para usuarios existentes (si solo
-- sumara los 4 nuevos, xp_real_por_mundo caería a un número menor al ya
-- acreditado en world_progress.puntos_mundo, y el greatest(0, ...) de
-- registrar_progreso_mundo dejaría de sumar puntos nuevos hasta que el
-- XP nuevo superara todo el histórico viejo).
create or replace function public.xp_real_por_mundo(p_user_id uuid, p_world text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select case p_world
    when 'enigmia' then (
      select coalesce(sum(la.xp), 0) from public.logic_attempts la where la.user_id = p_user_id
    )
    when 'geografia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type like 'geografia%'
    )
    when 'quimia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica')
    )
    when 'anatomia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso')
    )
    when 'melodia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto')
    )
    when 'trigonometria' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes')
    )
    when 'historia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas')
    )
    when 'calculia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable')
    )
    when 'circuitia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('circuitia_serie', 'circuitia_paralelo', 'circuitia_mixto', 'circuitia_cualitativo')
    )
    when 'estadistica' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('estadistica_central', 'estadistica_dispersion', 'estadistica_probabilidad', 'estadistica_datos', 'estadistica_graficos')
    )
    when 'naipia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('naipia_hilo', 'naipia_ko', 'naipia_hiopt2', 'naipia_omega2', 'naipia_verdadero')
    )
    when 'codia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('codia_sintaxis', 'codia_salida', 'codia_error', 'codia_estructuras')
    )
    when 'numeria' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('suma', 'resta', 'multiplicacion', 'division',
         'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
         'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
         'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
         'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
         'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas')
    )
    else 0::bigint
  end;
$$;

-- Sin grant: helper interno, revocado de authenticated desde 0133
-- (solo lo llaman otras funciones security definer).

-- ---------- 4) registrar_progreso_mundo (base real: 0205): rama 'geografia' pasa a loop de 4 sub-tipos ----------
create or replace function public.registrar_progreso_mundo(p_world text, p_puntos integer)
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
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('geografia_america'), ('geografia_europa'), ('geografia_africa'), ('geografia_asia_oceania')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
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
    v_temas_totales := 4;
    for v_rec in
      select cat as categoria, coalesce(sl.nivel, 1) as nivel
      from (values ('memoria'), ('patrones'), ('deduccion'), ('computacional')) as t(cat)
      left join public.logic_skill_levels sl
        on sl.user_id = v_user and sl.categoria = t.cat
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
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
  elsif p_world = 'calculia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('calculia_derivadas'), ('calculia_integrales'),
        ('calculia_series'), ('calculia_multivariable')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'circuitia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('circuitia_serie'), ('circuitia_paralelo'),
        ('circuitia_mixto'), ('circuitia_cualitativo')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'estadistica' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('estadistica_central'), ('estadistica_dispersion'), ('estadistica_probabilidad'),
        ('estadistica_datos'), ('estadistica_graficos')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'naipia' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('naipia_hilo'), ('naipia_ko'), ('naipia_hiopt2'),
        ('naipia_omega2'), ('naipia_verdadero')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'codia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('codia_sintaxis'), ('codia_salida'), ('codia_error'),
        ('codia_estructuras')
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

-- ---------- 5) detalle_nivel_mundo (base real: 0205): rama 'geografia' pasa a loop de 4 sub-tipos ----------
create or replace function public.detalle_nivel_mundo(p_user_id uuid, p_world text)
returns table (
  puntos_mundo integer,
  nivel_mundo integer,
  frac_volumen numeric,
  frac_dominio numeric,
  frac_lecciones numeric
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_puntos integer;
  v_nivel integer;
  v_temas_totales integer := 1;
  v_suma_dominio numeric := 0;
  v_lecciones_totales integer := 0;
  v_lecciones_completadas integer := 0;
  v_frac_volumen numeric;
  v_frac_dominio numeric;
  v_frac_lecciones numeric;
  v_rec record;
begin
  v_puntos := coalesce(public.xp_real_por_mundo(p_user_id, p_world)::integer, 0);

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
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'geografia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('geografia_america'), ('geografia_europa'), ('geografia_africa'), ('geografia_asia_oceania')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'quimia' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('quimia_simbolos'), ('quimia_formulas'), ('quimia_tabla'),
        ('quimia_nomenclatura'), ('quimia_organica')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'enigmia' then
    v_temas_totales := 4;
    for v_rec in
      select cat as categoria, coalesce(sl.nivel, 1) as nivel
      from (values ('memoria'), ('patrones'), ('deduccion'), ('computacional')) as t(cat)
      left join public.logic_skill_levels sl
        on sl.user_id = p_user_id and sl.categoria = t.cat
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'anatomia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('anatomia_oseo'), ('anatomia_muscular'), ('anatomia_organos'), ('anatomia_nervioso')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
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
        on sl.user_id = p_user_id and sl.problem_type = t.st
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
        on sl.user_id = p_user_id and sl.problem_type = t.st
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
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'calculia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('calculia_derivadas'), ('calculia_integrales'),
        ('calculia_series'), ('calculia_multivariable')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'circuitia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('circuitia_serie'), ('circuitia_paralelo'),
        ('circuitia_mixto'), ('circuitia_cualitativo')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'estadistica' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('estadistica_central'), ('estadistica_dispersion'), ('estadistica_probabilidad'),
        ('estadistica_datos'), ('estadistica_graficos')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'naipia' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('naipia_hilo'), ('naipia_ko'), ('naipia_hiopt2'),
        ('naipia_omega2'), ('naipia_verdadero')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'codia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('codia_sintaxis'), ('codia_salida'), ('codia_error'),
        ('codia_estructuras')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
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
      where ltp.user_id = p_user_id and ltp.dominado;
  elsif p_world = 'numeria' then
    select count(*) into v_lecciones_totales from public.techniques
      where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria');
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = p_user_id and tp.dominado
        and t.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria');
  else
    select count(*) into v_lecciones_totales from public.techniques where problem_type = p_world;
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = p_user_id and tp.dominado and t.problem_type = p_world;
  end if;

  v_frac_volumen := least(1.0, v_puntos::numeric / 25000);
  v_frac_dominio := case when v_temas_totales > 0 then v_suma_dominio / v_temas_totales else 0 end;
  v_frac_lecciones := case when v_lecciones_totales > 0 then v_lecciones_completadas::numeric / v_lecciones_totales else 1 end;

  v_nivel := greatest(1, least(100, round(100 * (0.34 * v_frac_volumen + 0.45 * v_frac_dominio + 0.21 * v_frac_lecciones))::integer));

  return query select v_puntos, v_nivel, v_frac_volumen, v_frac_dominio, v_frac_lecciones;
end;
$$;

-- ---------- 6) ranking_semanal_filtrado (base real: 0189): rama 'geografia' pasa a `like` ----------
create or replace function public.ranking_semanal_filtrado(p_mundo text default null, p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text,
  animacion_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia') then
    raise exception 'mundo invalido';
  end if;

  return query
    with datos as (
      select
        p.id as uid,
        p.display_name as dn,
        (case
          when p_mundo is null then coalesce((
            select sum(dp.xp_ganado) from public.daily_progress dp
            where dp.user_id = p.id and dp.fecha >= date_trunc('week', current_date)::date and dp.fecha <= current_date
          ), 0)
          when p_mundo = 'enigmia' then coalesce((
            select sum(la.xp) from public.logic_attempts la
            where la.user_id = p.id and la.created_at >= date_trunc('week', current_date)
          ), 0)
          when p_mundo = 'geografia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date) and a.problem_type like 'geografia%'
          ), 0)
          when p_mundo = 'quimia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica')
          ), 0)
          when p_mundo = 'anatomia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso')
          ), 0)
          when p_mundo = 'melodia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto')
          ), 0)
          when p_mundo = 'trigonometria' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes')
          ), 0)
          when p_mundo = 'historia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas')
          ), 0)
          when p_mundo = 'calculia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable')
          ), 0)
          when p_mundo = 'circuitia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('circuitia_serie', 'circuitia_paralelo', 'circuitia_mixto', 'circuitia_cualitativo')
          ), 0)
          when p_mundo = 'estadistica' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('estadistica_central', 'estadistica_dispersion', 'estadistica_probabilidad', 'estadistica_datos', 'estadistica_graficos')
          ), 0)
          when p_mundo = 'naipia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('naipia_hilo', 'naipia_ko', 'naipia_hiopt2', 'naipia_omega2', 'naipia_verdadero')
          ), 0)
          when p_mundo = 'codia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('codia_sintaxis', 'codia_salida', 'codia_error', 'codia_estructuras')
          ), 0)
          else coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra')
          ), 0)
        end)::bigint as xp,
        p.avatar_url as av,
        p.elo_rating as elo,
        p.titulo_activo as ta,
        p.fuente_nombre as fn,
        p.animacion_nombre as an
      from public.profiles p
      join auth.users u on u.id = p.id
      where coalesce(u.is_anonymous, false) = false
        and not p.es_bot
        and p.display_name is not null
        and btrim(p.display_name) <> ''
        and u.email_confirmed_at is not null
        and (
          not p_solo_amigos
          or p.id = v_caller
          or exists (
            select 1 from public.friendships f
            where f.estado = 'aceptada'
              and ((f.user_id = v_caller and f.friend_id = p.id) or (f.friend_id = v_caller and f.user_id = p.id))
          )
        )
    )
    select d.uid, d.dn, d.xp, d.av, d.elo, d.ta, public.titulo_nombre_de(d.uid), d.fn, d.an
    from datos d
    where d.xp > 0
    order by d.xp desc;
end;
$$;

grant execute on function public.ranking_semanal_filtrado(text, boolean) to authenticated;

-- ---------- 7) estadisticas_pro_perfil / estadisticas_pro_subtemas / estadisticas_pro_subtemas_grupo (base real: 0190) ----------
-- Regla de docs/PARIDAD_MUNDOS.md fila 21: sin esto, los intentos con
-- problem_type='geografia_america'/etc. caen en el "else null" del CASE
-- y se filtran en silencio de TODA estadística Pro — el mismo bug real
-- que tuvieron Calculia/Circuitia (0187). `like 'geografia%'` matchea
-- tanto el histórico bare 'geografia' como los 4 nuevos.
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
          when a.problem_type like 'geografia%' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          when a.problem_type like 'calculia_%' then 'calculia'
          when a.problem_type like 'circuitia_%' then 'circuitia'
          when a.problem_type like 'estadistica_%' then 'estadistica'
          when a.problem_type like 'naipia_%' then 'naipia'
          when a.problem_type like 'codia_%' then 'codia'
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
          when a.problem_type like 'geografia%' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          when a.problem_type like 'calculia_%' then 'calculia'
          when a.problem_type like 'circuitia_%' then 'circuitia'
          when a.problem_type like 'estadistica_%' then 'estadistica'
          when a.problem_type like 'naipia_%' then 'naipia'
          when a.problem_type like 'codia_%' then 'codia'
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
          when a.problem_type like 'geografia%' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          when a.problem_type like 'calculia_%' then 'calculia'
          when a.problem_type like 'circuitia_%' then 'circuitia'
          when a.problem_type like 'estadistica_%' then 'estadistica'
          when a.problem_type like 'naipia_%' then 'naipia'
          when a.problem_type like 'codia_%' then 'codia'
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
