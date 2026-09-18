-- ============================================================
-- Prodigia — Mundo nuevo: Calculia (mundo 9, #4338CA índigo). Mismo
-- criterio que 0108_mundo_trigonometria.sql/0109_mundo_historia.sql:
-- todo junto desde el día uno (calibración + Aprender + world_progress
-- + duelos), nada diferido a una fase posterior.
--
-- 4 modos: derivadas (potencia/producto/cociente/cadena, opción
-- múltiple), integrales (potencia/1÷x/exponencial/seno-coseno/
-- sustitución simple, opción múltiple), series (suma geométrica y
-- criterio de la razón numéricos, clasificación de convergencia de
-- opción múltiple) y multivariable y EDOs (derivada parcial y EDO
-- separable, opción múltiple) — ver src/lib/practica/calculia.ts para
-- el generador real. Nunca se parsea/simplifica una expresión simbólica
-- libre — cada respuesta se construye desde coeficientes enteros
-- conocidos, igual que Trigonometría.
--
-- IMPORTANTE (a diferencia de simplemente copiar 0108/0109 tal cual):
-- entre esa tanda y esta se corrieron muchas más migraciones que YA
-- reescribieron varias de las funciones que un mundo nuevo necesita
-- tocar (registrar_progreso_mundo pasó a llamarse así en 0132,
-- detalle_nivel_mundo/sincronizar_progreso_mundo son de 0125,
-- xp_real_por_mundo es de 0129, ranking_semanal_filtrado con
-- animacion_nombre es de 0142). Esta migración parte de la versión
-- REAL más reciente de cada una (no de la copia vieja de 0108/0109),
-- para no pisar ningún fix posterior.
-- Correr después de 0164_mas_acertijos_deduccion.sql.
-- ============================================================

-- ---------- 1) Onboarding: columna + grant ----------
alter table public.profiles add column if not exists onboarding_calculia_completado boolean not null default false;

revoke update on public.profiles from authenticated;
grant update (
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  onboarding_quimia_completado,
  onboarding_anatomia_completado,
  onboarding_melodia_completado,
  onboarding_trigonometria_completado,
  onboarding_historia_completado,
  onboarding_calculia_completado,
  interes_inicial,
  avatar_url,
  ocultar_doble_o_nada
) on public.profiles to authenticated;

-- ---------- 2) Calibración (skill_levels / attempts) ----------
alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
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
    'calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable'
  ));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
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
    'calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable'
  ));

-- ---------- 3) Lecciones (mismo problem_type genérico = nombre del mundo) ----------
alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'geografia', 'algebra', 'quimia',
    'geometria', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia'
  ));

-- ---------- 4) world_progress (nivel de mundo) ----------
alter table public.world_progress drop constraint if exists world_progress_world_check;
alter table public.world_progress add constraint world_progress_world_check
  check (world in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia'));

-- ---------- 5) xp_real_por_mundo (0129): + rama calculia ----------
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
      where a.user_id = p_user_id and a.problem_type = 'geografia'
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

-- ---------- 6) registrar_progreso_mundo (0132): + rama dominio calculia ----------
-- Reescritura completa (nombre real vigente desde 0132 — NO
-- registrar_puntos_mundo, que es solo un wrapper de compatibilidad que
-- no cambia). Copiada de 0132 + la rama 'calculia' nueva.
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

-- registrar_puntos_mundo (wrapper de compatibilidad, 0132): sin cambios
-- de código — sigue leyendo las columnas renombradas de
-- registrar_progreso_mundo, que ya incluye la rama calculia de arriba.
-- Se re-declara igual (create or replace) solo para dejar constancia;
-- sería un no-op si Postgres permitiera "no tocarla".
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

-- ---------- 7) detalle_nivel_mundo / sincronizar_progreso_mundo (0125): + calculia ----------
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
    v_temas_totales := 1;
    select greatest(0.0, least(1.0, (coalesce(nivel,1) - 4)::numeric / 6))
      into v_suma_dominio
      from public.skill_levels
      where user_id = p_user_id and problem_type = 'geografia';
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
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'enigmia' then
    v_temas_totales := 1;
    select greatest(0.0, least(1.0, (coalesce(nivel,1) - 4)::numeric / 6))
      into v_suma_dominio
      from public.logic_skill_levels
      where user_id = p_user_id;
    v_suma_dominio := coalesce(v_suma_dominio, 0);
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

create or replace function public.sincronizar_progreso_mundo(p_world text)
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
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_world not in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia') then
    raise exception 'mundo desconocido';
  end if;
  perform public.recalcular_progreso_mundo(v_user, p_world);
  return query
    select d.puntos_mundo, d.nivel_mundo, d.frac_volumen, d.frac_dominio, d.frac_lecciones
    from public.detalle_nivel_mundo(v_user, p_world) d;
end;
$$;

grant execute on function public.sincronizar_progreso_mundo(text) to authenticated;

-- ---------- 8) Ranking semanal por mundo (0142): + rama calculia ----------
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
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia') then
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
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date) and a.problem_type = 'geografia'
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

-- ---------- 9) lecciones_completadas_por_mundo (0109): + rama calculia ----------
create or replace function public.lecciones_completadas_por_mundo()
returns table (mundo text, completadas bigint, total bigint)
language sql
security definer
set search_path = public
as $$
  with totales as (
    select
      case
        when problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria') then 'numeria'
        when problem_type = 'geografia' then 'geografia'
        when problem_type = 'quimia' then 'quimia'
        when problem_type = 'anatomia' then 'anatomia'
        when problem_type = 'melodia' then 'melodia'
        when problem_type = 'trigonometria' then 'trigonometria'
        when problem_type = 'historia' then 'historia'
        when problem_type = 'calculia' then 'calculia'
      end as mundo,
      id
    from public.techniques
    where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia')
  )
  select t.mundo, count(tp.technique_id) filter (where tp.dominado), count(t.id)
  from totales t
  left join public.technique_progress tp on tp.technique_id = t.id and tp.user_id = auth.uid()
  where t.mundo is not null
  group by t.mundo
  union all
  select 'enigmia',
    (select count(*) from public.logic_technique_progress ltp where ltp.user_id = auth.uid() and ltp.dominado),
    (select count(*) from public.logic_techniques);
$$;

grant execute on function public.lecciones_completadas_por_mundo() to authenticated;

-- ---------- 10) Logros de Calculia ----------
alter table public.achievements drop constraint achievements_categoria_check;
alter table public.achievements add constraint achievements_categoria_check
  check (categoria in ('racha', 'volumen', 'precision', 'dominio', 'duelos', 'enigmia', 'quimia', 'mundo', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia'));

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('calculia-explorador', 'Explorador de Calculia', 'Probaste los 4 modos de Calculia — derivadas, integrales, series y multivariable/EDOs.', 'calculia', '{"tipo": "calculia_modos_variados", "valor": 4}'),
('calculia-nivel-5', 'Pendiente Bajo Control', 'Alcanzaste nivel 5 de mundo en Calculia.', 'calculia', '{"tipo": "calculia_nivel_mundo", "valor": 5}'),
('calculia-100', 'Cien Derivadas', 'Resolviste 100 problemas en Calculia.', 'calculia', '{"tipo": "calculia_problemas_totales", "valor": 100}')
on conflict (slug) do nothing;

-- ---------- 11) 5 lecciones de Calculia ("Aprender") ----------
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
('calculia-reconocer-regla-derivacion', 'Reconocer de un vistazo la regla de derivación correcta',
  'Antes de derivar nada, mirá la FORMA de la expresión — eso ya te dice qué regla usar, sin tener que probar varias.',
  'calculia',
  '{"pasos": [
    "¿Es una sola potencia de x (como 5x⁴)? Es la regla de la potencia: bajá el exponente como factor y restale 1 al exponente.",
    "¿Son dos expresiones MULTIPLICADAS entre sí (como (2x)(3x²))? Es la regla del producto — nunca multipliques las derivadas por separado.",
    "¿Es una división de dos expresiones? Es la regla del cociente — el orden de la resta en el numerador importa (alto por bajo, menos bajo por alto).",
    "¿Hay algo elevado a una potencia, y adentro del paréntesis no es solo x (como (3x+2)⁴)? Es la regla de la cadena — nunca te olvides de multiplicar por la derivada de adentro."
  ]}',
  1),
('calculia-tabla-integrales-comunes', 'Tabla mental de las 5 integrales más comunes',
  'Cinco formas que aparecen todo el tiempo — memorizadas de memoria, ahorran tener que derivar al revés cada vez.',
  'calculia',
  '{"pasos": [
    "∫xⁿ dx = xⁿ⁺¹/(n+1) + C — subí el exponente uno y dividí por el exponente nuevo (nunca el viejo).",
    "∫(1/x) dx = ln|x| + C — el único caso donde la potencia no funciona (n=-1 haría dividir por cero).",
    "∫eˣ dx = eˣ + C — la única función que es su propia integral; con eᵏˣ se agrega un factor 1/k adelante.",
    "∫cos(x) dx = sen(x) + C y ∫sen(x) dx = -cos(x) + C — el signo negativo va SOLO en la integral del seno, nunca en la del coseno.",
    "Si dudás el signo de una trigonométrica, derivá la respuesta mentalmente y fijate si te devuelve el integrando original."
  ]}',
  2),
('calculia-identificar-tipo-serie', 'Identificar el tipo de serie por su forma antes de aplicar un criterio',
  'Cada serie tiene una "pinta" característica — reconocerla de entrada ahorra probar criterios al azar.',
  'calculia',
  '{"pasos": [
    "¿Cada término se multiplica por la misma razón r para llegar al siguiente (como 3, 6, 12, 24...)? Es geométrica — converge si y solo si |r|<1.",
    "¿Es 1 sobre n elevado a una potencia p (como ∑1/n²)? Es una serie p — converge si y solo si p>1.",
    "¿La razón entre un término y el anterior tiende a un número fijo cuando n crece? Ahí aplica el criterio de la razón — el límite de ese cociente decide.",
    "Para una serie geométrica, la suma infinita es siempre primer término dividido por (1 menos la razón) — solo tiene sentido si ya sabés que converge."
  ]}',
  3),
('calculia-separar-variables-edo', 'Separar variables en una EDO: reconocer cuándo es inmediato',
  'No toda ecuación diferencial se separa fácil — pero cuando dy/dx es un producto de "algo con x" por "algo con y", siempre se puede.',
  'calculia',
  '{"pasos": [
    "Mirá si podés reescribir dy/dx = f(x)·g(y) — si es así, la ecuación es separable, sin excepción.",
    "Pasá todo lo de y (incluido dy) a un lado, y todo lo de x (incluido dx) al otro: dy/g(y) = f(x) dx.",
    "Integrá cada lado por separado, con su propia constante — las dos constantes se juntan en una sola al final.",
    "Si aparece ln|y| de un lado, despejar y significa aplicar exponencial en ambos lados — ahí es donde nace el factor eᶜ que se vuelve la constante A."
  ]}',
  4),
('calculia-derivar-parciales', 'Derivar parciales: congelar las otras variables como constantes',
  'La derivada parcial es exactamente la misma regla de siempre — el único cambio de hábito es tratar la otra letra como si fuera un número fijo.',
  'calculia',
  '{"pasos": [
    "Si te piden ∂f/∂x, todo lo que sea potencia de y (incluida y sola) se comporta como si fuera un coeficiente constante — no se deriva ni desaparece.",
    "Un término como 3x²y se deriva respecto de x igual que 3y·x² (con 3y como si fuera \"el número 3y\"): queda 6xy.",
    "El error más común es derivar las DOS variables a la vez — si te piden ∂/∂x, la potencia de y del resultado tiene que quedar IGUAL que en el original.",
    "Truco rápido: tapá con un dedo la letra que no te pidieron, derivá lo que queda visible como si fuera una sola variable, después destapá."
  ]}',
  5)
on conflict (slug) do nothing;

-- ---------- 12) Duelos: columna de nivel + constraints de mundo ----------
alter table public.duels add column if not exists nivel_calculia smallint;

alter table public.duels drop constraint if exists duels_mundo_check;
alter table public.duels add constraint duels_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia'));

alter table public.duel_queue drop constraint if exists duel_queue_mundo_check;
alter table public.duel_queue add constraint duel_queue_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'aleatorio'));

alter table public.duel_invites drop constraint if exists duel_invites_mundo_check;
alter table public.duel_invites add constraint duel_invites_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia'));

alter table public.feed_posts drop constraint if exists feed_posts_mundo_check;
alter table public.feed_posts add constraint feed_posts_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'aleatorio'));

-- ---------- 13) Pools por rango: Calculia ----------
-- 4 modos, orden de dificultad real (mismo orden que el currículum de
-- Aprender y que las bandas autorales del generador): derivadas
-- siempre disponible, cada rango más alto suma el siguiente modo.
create or replace function public.modo_calculia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1700 then
    v_opciones := array['derivadas', 'integrales', 'series', 'multivariable'];
  elsif p_elo_promedio >= 1500 then
    v_opciones := array['derivadas', 'integrales', 'series'];
  elsif p_elo_promedio >= 900 then
    v_opciones := array['derivadas', 'integrales'];
  else
    v_opciones := array['derivadas'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

create or replace function public.nivel_calculia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when p_elo_promedio >= 1700 then 10::smallint
    when p_elo_promedio >= 1500 then (8 + floor(random() * 2))::smallint
    when p_elo_promedio >= 1300 then (6 + floor(random() * 2))::smallint
    when p_elo_promedio >= 1100 then (4 + floor(random() * 2))::smallint
    when p_elo_promedio >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- ---------- 14) buscar_rival_duelo(): + calculia ----------
drop function if exists public.buscar_rival_duelo(text, text, boolean);

create function public.buscar_rival_duelo(p_mundo text, p_operation_type text default null, p_ranked boolean default true)
returns table (duel_id uuid, encontrado boolean, rango_actual integer, segundos_esperando integer, mundo_encontrado text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_elo integer;
  v_entered timestamptz;
  v_rango integer;
  v_segundos integer;
  v_rival record;
  v_es_bot boolean := false;
  v_velocidad_min_bot integer;
  v_velocidad_max_bot integer;
  v_tasa_bot numeric;
  v_duel_id uuid;
  v_this_duel_id uuid;
  v_elo_promedio numeric;
  v_serie_id uuid;
  v_mundos text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia'];
  v_i int;
  v_j int;
  v_tmp text;
  v_mundo_encontrado text;
  v_nivel_num smallint;
  v_nivel_enig smallint;
  v_nivel_quim smallint;
  v_nivel_anat smallint;
  v_nivel_melo smallint;
  v_nivel_trig smallint;
  v_nivel_hist smallint;
  v_nivel_calc smallint;
  v_nivel_ronda smallint;
  v_sim record;
  v_bot_id uuid;
  v_bot_elo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'aleatorio') then
    raise exception 'mundo invalido';
  end if;
  if p_mundo = 'aleatorio' and not p_ranked then
    raise exception 'casual no admite todas las ciudades — siempre es duelo simple';
  end if;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  if p_ranked and p_mundo <> 'aleatorio' and v_mi_elo >= 1300 then
    raise exception 'desde Platino solo se puede jugar "Todas las ciudades" en clasificatoria';
  end if;

  delete from public.duel_queue where last_seen_at < now() - interval '2 minutes';

  insert into public.duel_queue (user_id, operation_type, elo_rating, mundo, clasificatorio, entered_at, last_seen_at)
  values (v_user, p_operation_type, v_mi_elo, p_mundo, p_ranked, now(), now())
  on conflict (user_id) do update
    set operation_type = excluded.operation_type,
        elo_rating = excluded.elo_rating,
        mundo = excluded.mundo,
        clasificatorio = excluded.clasificatorio,
        entered_at = case
          when public.duel_queue.mundo <> excluded.mundo
            or public.duel_queue.clasificatorio <> excluded.clasificatorio
            or coalesce(public.duel_queue.operation_type, '') <> coalesce(excluded.operation_type, '')
          then now()
          else public.duel_queue.entered_at
        end,
        last_seen_at = now();

  select entered_at into v_entered from public.duel_queue where user_id = v_user;
  v_segundos := greatest(0, extract(epoch from (now() - v_entered))::integer);
  v_rango := least(300, 30 + (v_segundos / 10) * 30);

  select * into v_rival
  from public.duel_queue q
  where q.user_id <> v_user
    and q.mundo = p_mundo
    and q.clasificatorio = p_ranked
    and abs(q.elo_rating - v_mi_elo) <= v_rango
    and q.last_seen_at >= now() - interval '10 seconds'
  order by abs(q.elo_rating - v_mi_elo) asc
  for update skip locked
  limit 1;

  if v_rival.user_id is null and v_mi_elo < 1300 and v_segundos >= 30 then
    select p.id, p.elo_rating, m.velocidad_ms_min, m.velocidad_ms_max, m.tasa_acierto
      into v_bot_id, v_bot_elo, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot
    from public.clan_miembros m
    join public.profiles p on p.id = m.perfil_id
    order by abs(p.elo_rating - v_mi_elo) asc
    limit 1;
    if v_bot_id is not null then
      v_rival.user_id := v_bot_id;
      v_rival.elo_rating := v_bot_elo;
      v_es_bot := true;
    end if;
  end if;

  if v_rival.user_id is null then
    return query select null::uuid, false, v_rango, v_segundos, null::text;
    return;
  end if;

  delete from public.duel_queue where user_id in (v_user, v_rival.user_id);

  v_elo_promedio := (v_mi_elo + v_rival.elo_rating) / 2.0;

  if p_mundo = 'aleatorio' then
    v_serie_id := gen_random_uuid();
    for v_i in reverse array_length(v_mundos, 1)..2 loop
      v_j := 1 + floor(random() * v_i)::int;
      v_tmp := v_mundos[v_i];
      v_mundos[v_i] := v_mundos[v_j];
      v_mundos[v_j] := v_tmp;
    end loop;

    -- "Mejor de 3": siempre 3 rondas aunque v_mundos tenga más
    -- elementos después del shuffle.
    for v_i in 1..3 loop
      v_nivel_num := case when v_mundos[v_i] = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end;
      v_nivel_enig := case when v_mundos[v_i] = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end;
      v_nivel_quim := case when v_mundos[v_i] = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end;
      v_nivel_anat := case when v_mundos[v_i] = 'anatomia' then public.nivel_anatomia_por_rango(v_elo_promedio) else null end;
      v_nivel_melo := case when v_mundos[v_i] = 'melodia' then public.nivel_melodia_por_rango(v_elo_promedio) else null end;
      v_nivel_trig := case when v_mundos[v_i] = 'trigonometria' then public.nivel_trigonometria_por_rango(v_elo_promedio) else null end;
      v_nivel_hist := case when v_mundos[v_i] = 'historia' then public.nivel_historia_por_rango(v_elo_promedio) else null end;
      v_nivel_calc := case when v_mundos[v_i] = 'calculia' then public.nivel_calculia_por_rango(v_elo_promedio) else null end;

      insert into public.duels (
        retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo,
        modo, serie_id, ronda_numero, ronda_total,
        nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, nivel_calculia, clasificatorio
      ) values (
        v_user, v_rival.user_id, floor(random() * 1000000000)::bigint,
        case when v_mundos[v_i] = 'numeria'
          then (array['suma', 'resta', 'multiplicacion', 'division'])[1 + floor(random() * 4)::int]
          else null end,
        v_mundos[v_i],
        case
          when v_mundos[v_i] = 'geografia' then public.continente_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'enigmia' then public.categoria_aleatoria_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'quimia' then public.modo_quimia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'anatomia' then public.modo_anatomia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'melodia' then public.modo_melodia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'trigonometria' then public.modo_trigonometria_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'historia' then public.modo_historia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'calculia' then public.modo_calculia_aleatorio_por_rango(v_elo_promedio)
          else null
        end,
        'mejor_de_3', v_serie_id, v_i, 3,
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc,
        true
      )
      returning id into v_this_duel_id;

      if v_es_bot then
        v_nivel_ronda := coalesce(
          v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc,
          greatest(1, least(10, round(3 + (v_elo_promedio - 1200) / 100)))::smallint
        );
        select * into v_sim from public.simular_resultado_bot(v_nivel_ronda, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot);
        insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
        values (v_this_duel_id, v_rival.user_id, v_sim.acierto, v_sim.tiempo_promedio, v_sim.puntaje, v_sim.respuestas);
      end if;
    end loop;

    select id, mundo into v_duel_id, v_mundo_encontrado from public.duels where serie_id = v_serie_id and ronda_numero = 1;
  else
    v_nivel_num := case when p_mundo = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end;
    v_nivel_enig := case when p_mundo = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end;
    v_nivel_quim := case when p_mundo = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end;
    v_nivel_anat := case when p_mundo = 'anatomia' then public.nivel_anatomia_por_rango(v_elo_promedio) else null end;
    v_nivel_melo := case when p_mundo = 'melodia' then public.nivel_melodia_por_rango(v_elo_promedio) else null end;
    v_nivel_trig := case when p_mundo = 'trigonometria' then public.nivel_trigonometria_por_rango(v_elo_promedio) else null end;
    v_nivel_hist := case when p_mundo = 'historia' then public.nivel_historia_por_rango(v_elo_promedio) else null end;
    v_nivel_calc := case when p_mundo = 'calculia' then public.nivel_calculia_por_rango(v_elo_promedio) else null end;

    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo,
      nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, nivel_calculia, clasificatorio
    ) values (
      v_user, v_rival.user_id, floor(random() * 1000000000)::bigint,
      case when p_mundo = 'numeria'
        then (array['suma', 'resta', 'multiplicacion', 'division'])[1 + floor(random() * 4)::int]
        else null end,
      p_mundo,
      case
        when p_mundo = 'geografia' then public.continente_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'enigmia' then public.categoria_aleatoria_por_rango(v_elo_promedio)
        when p_mundo = 'quimia' then public.modo_quimia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'anatomia' then public.modo_anatomia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'melodia' then public.modo_melodia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'trigonometria' then public.modo_trigonometria_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'historia' then public.modo_historia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'calculia' then public.modo_calculia_aleatorio_por_rango(v_elo_promedio)
        else null
      end,
      'simple',
      v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc,
      p_ranked
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;

    if v_es_bot then
      v_nivel_ronda := coalesce(
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc,
        greatest(1, least(10, round(3 + (v_elo_promedio - 1200) / 100)))::smallint
      );
      select * into v_sim from public.simular_resultado_bot(v_nivel_ronda, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot);
      insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
      values (v_duel_id, v_rival.user_id, v_sim.acierto, v_sim.tiempo_promedio, v_sim.puntaje, v_sim.respuestas);
    end if;
  end if;

  return query select v_duel_id, true, v_rango, v_segundos, v_mundo_encontrado;
end;
$$;

grant execute on function public.buscar_rival_duelo(text, text, boolean) to authenticated;

-- ---------- 15) obtener_duelo(): + calculia ----------
drop function if exists public.obtener_duelo(uuid);

create function public.obtener_duelo(p_duel_id uuid)
returns table (
  operation_type text, nivel smallint, retador_id uuid, retado_id uuid, estado text,
  rival_nombre text, mi_elo integer, rival_elo integer,
  rival_ya_jugo boolean, rival_respuestas jsonb,
  mundo text, sub_tipo text, modo text, serie_id uuid, ronda_numero smallint, ronda_total smallint,
  mi_titulo_nombre text, rival_titulo_nombre text, rival_es_bot boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_rival_id uuid;
  v_mi_elo integer;
  v_rival_elo integer;
  v_promedio numeric;
  v_rival_resultado record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;

  v_rival_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;
  select elo_rating into v_rival_elo from public.profiles where id = v_rival_id;
  v_promedio := (v_mi_elo + v_rival_elo) / 2.0;

  select * into v_rival_resultado from public.duel_results where duel_id = p_duel_id and user_id = v_rival_id;

  return query
    select v_duel.operation_type,
      case
        when v_duel.mundo = 'numeria' then coalesce(v_duel.nivel_numeria, greatest(1, least(10, round(3 + (v_promedio - 1200) / 100)))::smallint)
        when v_duel.mundo = 'enigmia' then coalesce(v_duel.nivel_enigmia, 5::smallint)
        when v_duel.mundo = 'quimia' then coalesce(v_duel.nivel_quimia, 5::smallint)
        when v_duel.mundo = 'anatomia' then coalesce(v_duel.nivel_anatomia, 5::smallint)
        when v_duel.mundo = 'melodia' then coalesce(v_duel.nivel_melodia, 5::smallint)
        when v_duel.mundo = 'trigonometria' then coalesce(v_duel.nivel_trigonometria, 5::smallint)
        when v_duel.mundo = 'historia' then coalesce(v_duel.nivel_historia, 5::smallint)
        when v_duel.mundo = 'calculia' then coalesce(v_duel.nivel_calculia, 5::smallint)
        else null
      end,
      v_duel.retador_id, v_duel.retado_id, v_duel.estado,
      (select display_name from public.profiles where id = v_rival_id), v_mi_elo, v_rival_elo,
      (v_rival_resultado.user_id is not null), v_rival_resultado.respuestas,
      v_duel.mundo, v_duel.sub_tipo, v_duel.modo, v_duel.serie_id, v_duel.ronda_numero, v_duel.ronda_total,
      public.titulo_nombre_de(v_user), public.titulo_nombre_de(v_rival_id),
      (select es_bot from public.profiles where id = v_rival_id);
end;
$$;

grant execute on function public.obtener_duelo(uuid) to authenticated;

-- ---------- 16) crear_invitacion_duelo(): + calculia ----------
-- Mismo aviso que 0108/0109: la validación de Quimia se deja tal cual
-- está hoy (bug preexistente, fuera de alcance de esta tanda).
drop function if exists public.crear_invitacion_duelo(text, text, text);

create function public.crear_invitacion_duelo(p_mundo text default 'numeria', p_operation_type text default null, p_sub_tipo text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia') then
    raise exception 'mundo invalido';
  end if;
  if p_mundo = 'numeria' then
    if p_operation_type not in ('suma', 'resta', 'multiplicacion', 'division') then
      raise exception 'operacion invalida';
    end if;
  elsif p_mundo = 'geografia' then
    if p_sub_tipo not in ('america', 'europa', 'africa', 'asia_oceania') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'enigmia' then
    if p_sub_tipo not in ('memoria', 'patrones', 'deduccion', 'computacional') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'quimia' then
    if p_sub_tipo not in ('simbolos', 'formulas', 'tabla') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'anatomia' then
    if p_sub_tipo not in ('oseo', 'muscular', 'organos', 'nervioso') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'melodia' then
    if p_sub_tipo not in ('fundamentos', 'lectura', 'alteraciones', 'escalas', 'acordes', 'oido_absoluto') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'trigonometria' then
    if p_sub_tipo not in ('razones', 'circulo', 'identidades', 'leyes') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'historia' then
    if p_sub_tipo not in ('cronologia', 'personajes', 'causaefecto', 'fechas') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'calculia' then
    if p_sub_tipo not in ('derivadas', 'integrales', 'series', 'multivariable') then
      raise exception 'opcion invalida';
    end if;
  end if;

  update public.duel_invites set estado = 'cancelada'
  where creador_id = v_user and estado = 'esperando';

  insert into public.duel_invites (creador_id, mundo, operation_type, sub_tipo)
  values (v_user, p_mundo, case when p_mundo = 'numeria' then p_operation_type else null end, case when p_mundo = 'numeria' then null else p_sub_tipo end)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.crear_invitacion_duelo(text, text, text) to authenticated;

notify pgrst, 'reload schema';
