-- ====================================================================
-- PRODIGIA — MIGRACION UNIFICADA DEL RESTO DEL SPRINT (0120→0128)
-- Generado: 2026-09-09 desde las migraciones individuales.
--
-- QUE INCLUYE (en este orden):
--   0120 (CORREGIDA)  cierre familia S0-S4/S8: crea los RPC security
--                     definer insertar_intento / insertar_intento_logica
--                     / registrar_xp_diario / registrar_progreso_mundo /
--                     registrar_puntos_mundo / xp_real_por_mundo.
--                     FIX: los 5 "drop policy" ahora usan "if exists"
--                     (antes rompian con ERROR 42704 si la policy no
--                     existia con ese nombre en la base).
--   0121-0128         trastienda (economia/pizarra/mecanicas/minijuegos/
--                     limpieza/casino) + espanol neutro de funciones RPC.
--
-- NOTAS:
--   * Correr la SENTENCIA COMPLETA una sola vez, en el SQL editor.
--   * Es idempotente en los puntos fragiles (drops y create table).
--   * Los seeds de tablas NO son idempotentes: no re-ejecutar este
--     archivo entero.
--   * NOTA SEGURIDAD: si en tu base las policies amplias de
--     attempts/logic_attempts/skill_levels/logic_skill_levels/
--     daily_progress existen con OTRO nombre, no se dropearan aqui;
--     revisar manualmente la familia S0-S4/S8 (docs/audits/
--     SECURITY-BASIC-AUDIT.md).
-- ====================================================================

-- ######### INICIO: 0120_cerrar_s0_s1.sql #########
-- ============================================================
-- Prodigia — Cierre de la familia S0/S1 (auditoría 2026-09-07,
-- docs/audits/MASTER-AUDIT.md). Correr después de 0119_*.sql.
--
-- PRINCIPIO: todo valor de economía/XP que antes entraba verbatim
-- por parámetro ahora se DERIVA de la base. Los finish de práctica
-- siguen mandando p_xp / p_puntos (firma intacta), pero las funciones
-- de acreditación ignoran el valor del cliente y calculan el monto
-- real a partir de attempts/logic_attempts REALES (que a su vez ya
-- solo pueden insertarse con XP calculado server-side).
--
-- Hallazgos que cierra esta migración (misma familia de "el cliente
-- fabrica progreso escribiendo valores directo"):
--   S0 (CRÍTICO): registrar_xp_diario(p_xp) acreditaba p_xp verbatim
--      → Chispas/XP infinitas, nivel_cuenta y XP de clan fabricables.
--   S1 (CRÍTICO): registrar_puntos_mundo / registrar_progreso_mundo
--      acreditaban p_puntos verbatim → nivel_mundo fabricable.
--   S2 (ALTO): policies "for all" en skill_levels/logic_skill_levels
--      → el cliente podía escribir su nivel de calibración directo.
--   S3 (ALTO): policy INSERT en attempts → el cliente podía insertar
--      intentos con xp arbitrario (base de S0/S1).
--   S4 (ALTO): policy "for all" en daily_progress → el cliente podía
--      fabricar xp_ganado del día.
--   S8 (MEDIO): policy INSERT en logic_attempts → mismo grifo que S3.
--
-- Para que la derivación sea sólida hay que sellar TODA la familia a
-- la vez: derivar "desde attempts.xp" no sirve si el cliente todavía
-- puede insertar attempts con el xp que quiera.
-- ============================================================

-- ---------- 1) Sellado de policies: los intentos y la calibración
-- entran SOLO por las funciones security definer de abajo ----------
drop policy if exists "usuarios insertan sus propios intentos" on public.attempts;

drop policy if exists "usuarios insertan sus propios intentos de logica" on public.logic_attempts;

drop policy if exists "usuarios actualizan su propio nivel por operacion" on public.skill_levels;

drop policy if exists "usuarios escriben su propio nivel de logica" on public.logic_skill_levels;

drop policy if exists "usuarios actualizan su propio progreso diario" on public.daily_progress;

-- ---------- 2) XP real por mundo (helper compartido) ----------
-- Devuelve el XP TOTAL real ganado por el usuario dentro de un mundo,
-- derivado de attempts/logic_attempts (el único lugar donde se guarda
-- progreso real). Los sub-temas son los mismos que usa 0117 para el
-- eje dominio y que la ruta /api/practica/finish para mundoDeProblemType.
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

grant execute on function public.xp_real_por_mundo(uuid, text) to authenticated;

-- ---------- 3) registrar_xp_diario: deriva del XP real del día ----------
-- Ya no acredita p_xp. Calcula cuánto XP REAL ganó el usuario en el día
-- (suma de attempts + logic_attempts desde la medianoche), le resta lo
-- que ya quedó registrado en daily_progress y acredita solo esa
-- diferencia:
--   * idempotente: repetir el finish (o doble-finish del mismo sprint)
--     no duplica — la segunda pasada ve diferencia 0.
--   * no fabricable: con S3/S8 cerrados, attempts.xp solo puede salir
--     de insertar_intento/insertar_intento_logica (server-side).
--   * sin importar cuánto mande el cliente, jamás se acredita más que
--     lo que los intentos reales ya ganaron.
-- Nota: el corte es por día natural (medianoche). Un sprint que cruza
-- la medianoche acredita la parte caída en el día nuevo — el front ya
-- contaba con que registrar_xp_diario usa current_date.
create or replace function public.registrar_xp_diario(p_xp integer)
returns table (
  xp_total integer,
  xp_ganado_hoy integer,
  meta_alcanzada boolean,
  meta_xp_diaria integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_meta integer;
  v_xp_hoy integer;
  v_meta_alcanzada boolean;
  v_real_hoy integer;
  v_ya_hoy integer;
  v_por_acreditar integer;
  v_puntos_total integer;
  v_desde timestamptz := date_trunc('day', now());
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_real_hoy :=
    (select coalesce(sum(a.xp)::integer, 0) from public.attempts a
      where a.user_id = v_user and a.created_at >= v_desde)
    + (select coalesce(sum(la.xp)::integer, 0) from public.logic_attempts la
      where la.user_id = v_user and la.created_at >= v_desde);

  select coalesce(xp_ganado, 0) into v_ya_hoy
  from public.daily_progress where user_id = v_user and fecha = current_date;

  v_por_acreditar := greatest(0, v_real_hoy - v_ya_hoy);

  if v_por_acreditar > 0 then
    insert into public.daily_progress (user_id, fecha, xp_ganado)
    values (v_user, current_date, v_por_acreditar)
    on conflict (user_id, fecha)
    do update set xp_ganado = public.daily_progress.xp_ganado + excluded.xp_ganado
    returning public.daily_progress.xp_ganado into v_xp_hoy;

    perform public.acreditar_chispas(v_user, v_por_acreditar);
  else
    select coalesce(xp_ganado, 0) into v_xp_hoy
    from public.daily_progress where user_id = v_user and fecha = current_date;
  end if;

  select p.meta_xp_diaria into v_meta from public.profiles p where p.id = v_user;
  v_meta_alcanzada := v_xp_hoy >= v_meta;

  update public.daily_progress
  set meta_alcanzada = v_meta_alcanzada
  where user_id = v_user and fecha = current_date;

  select puntos_total into v_puntos_total from public.profiles where id = v_user;

  return query select v_puntos_total, v_xp_hoy, v_meta_alcanzada, v_meta;
end;
$$;

grant execute on function public.registrar_xp_diario(integer) to authenticated;

-- ---------- 4) registrar_progreso_mundo: deriva del XP real del mundo ----------
-- Acredita solo la diferencia entre el XP real acumulado del mundo y lo
-- que world_progress ya registró. Idempotente y no fabricable (mismo
-- argumento que registrar_xp_diario).
-- Un usuario con historial previo del mundo que nunca se acreditó (p. ej.
-- mundo agregado después de que jugaba) recibe ese XP real atrasado de
-- una pasada — es XP legítimo que ya estaba en attempts, no fabricable.
create or replace function public.registrar_progreso_mundo(p_world text, p_puntos integer)
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

  -- (b) dominio: promedio por sub-tema de clamp((nivel_i - 4)/6, 0, 1).
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

  update public.world_progress set nivel_mundo = v_nivel where user_id = v_user and world = p_world;

  return query select p_world, v_puntos, v_nivel, v_nivel_anterior;
end;
$$;

grant execute on function public.registrar_progreso_mundo(text, integer) to authenticated;

-- ---------- 5) registrar_puntos_mundo (0109): camino viejo, mismo cierre ----------
-- Los finish ya usan registrar_progreso_mundo, pero esta función sigue
-- expuesta con grant y aceptaba p_puntos verbatim (S1 vigente). Ahora
-- delega en registrar_progreso_mundo, que ya deriva de la base.
create or replace function public.registrar_puntos_mundo(p_world text, p_puntos integer)
returns table (world text, puntos_mundo integer, nivel_mundo integer, nivel_anterior integer)
language sql
security definer
set search_path = public
as $$
  select w.world, w.puntos_mundo, w.nivel_mundo, w.nivel_anterior
  from public.registrar_progreso_mundo(p_world, p_puntos) w;
$$;

grant execute on function public.registrar_puntos_mundo(text, integer) to authenticated;

-- ---------- 6) insertar_intento: el ÚNICO camino para insertar attempts ----------
-- Reemplaza al INSERT directo de /api/attempts. Calcula XP y anti-apuro
-- server-side (espejo de src/lib/practica/formulas.ts y de la vieja
-- ruta), inserta el intento y, si corresponde (p_calibrar, según la
-- lista tipCalibrables que decide la ruta), actualiza skill_levels con
-- la misma lógica de racha que calcularNuevoNivel. Devuelve lo que la
-- ruta esperaba para responder al front sin cambios.
create or replace function public.insertar_intento(
  p_problem_type text,
  p_level integer,
  p_correct boolean,
  p_time_ms integer,
  p_protegido boolean default false,
  p_calibrar boolean default false
)
returns table (
  xp integer,
  sospechoso boolean,
  nivel smallint,
  racha_actual smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_esperado integer;
  v_piso numeric;
  v_sospechoso boolean;
  v_mult numeric;
  v_factor numeric;
  v_bonus numeric;
  v_boost numeric;
  v_xp integer;
  v_nivel smallint;
  v_racha smallint;
  v_actual record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_esperado := 6000 - (p_level - 1) * 350;
  v_piso := greatest(150, v_esperado * 0.12);
  v_sospechoso := p_time_ms < v_piso;

  v_mult := 1 + (p_level - 1) * 0.15;
  v_factor := 1.5 - 0.5 * (p_time_ms::numeric / v_esperado::numeric);
  v_bonus := greatest(1.0, least(1.5, v_factor));

  select coalesce(b.boost_multiplicador_pendiente, 1) into v_boost
  from public.profiles b where b.id = v_user;

  v_xp := case
    when p_correct and not v_sospechoso then round(round(10 * v_mult * v_bonus) * v_boost)::integer
    else 0
  end;

  insert into public.attempts (user_id, problem_type, level, correct, time_ms, xp)
  values (v_user, p_problem_type, p_level, p_correct, p_time_ms, v_xp);

  v_nivel := null;
  v_racha := null;
  if p_calibrar and not v_sospechoso then
    select sl.nivel, sl.racha_actual into v_actual
    from public.skill_levels sl where sl.user_id = v_user and sl.problem_type = p_problem_type;
    v_nivel := coalesce(v_actual.nivel, 1);
    v_racha := coalesce(v_actual.racha_actual, 0);

    if p_correct then
      v_racha := v_racha + 1;
      if v_racha >= 3 then
        v_nivel := least(10, v_nivel + 1);
        v_racha := 0;
      end if;
    else
      v_racha := 0;
      if not p_protegido then
        v_nivel := greatest(1, v_nivel - 1);
      end if;
    end if;

    insert into public.skill_levels (user_id, problem_type, nivel, racha_actual, updated_at)
    values (v_user, p_problem_type, v_nivel, v_racha, now())
    on conflict (user_id, problem_type)
    do update set nivel = excluded.nivel, racha_actual = excluded.racha_actual, updated_at = now();
  end if;

  return query select v_xp, v_sospechoso, v_nivel, v_racha;
end;
$$;

grant execute on function public.insertar_intento(text, integer, boolean, integer, boolean, boolean) to authenticated;

-- ---------- 7) insertar_intento_logica: el ÚNICO camino para logic_attempts ----------
-- Equivalente de insertar_intento para Enigmia: nivel único global
-- (logic_skill_levels), misma fórmula de XP y anti-apuro.
create or replace function public.insertar_intento_logica(
  p_puzzle_id uuid,
  p_dificultad integer,
  p_correct boolean,
  p_time_ms integer,
  p_protegido boolean default false
)
returns table (
  xp integer,
  sospechoso boolean,
  nivel smallint,
  racha_actual smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_esperado integer;
  v_piso numeric;
  v_sospechoso boolean;
  v_mult numeric;
  v_factor numeric;
  v_bonus numeric;
  v_boost numeric;
  v_xp integer;
  v_nivel smallint;
  v_racha smallint;
  v_actual record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_esperado := 6000 - (p_dificultad - 1) * 350;
  v_piso := greatest(150, v_esperado * 0.12);
  v_sospechoso := p_time_ms < v_piso;

  v_mult := 1 + (p_dificultad - 1) * 0.15;
  v_factor := 1.5 - 0.5 * (p_time_ms::numeric / v_esperado::numeric);
  v_bonus := greatest(1.0, least(1.5, v_factor));

  select coalesce(b.boost_multiplicador_pendiente, 1) into v_boost
  from public.profiles b where b.id = v_user;

  v_xp := case
    when p_correct and not v_sospechoso then round(round(10 * v_mult * v_bonus) * v_boost)::integer
    else 0
  end;

  insert into public.logic_attempts (user_id, puzzle_id, correct, time_ms, xp)
  values (v_user, p_puzzle_id, p_correct, p_time_ms, v_xp);

  v_nivel := null;
  v_racha := null;
  if not v_sospechoso then
    select sl.nivel, sl.racha_actual into v_actual
    from public.logic_skill_levels sl where sl.user_id = v_user;
    v_nivel := coalesce(v_actual.nivel, 1);
    v_racha := coalesce(v_actual.racha_actual, 0);

    if p_correct then
      v_racha := v_racha + 1;
      if v_racha >= 3 then
        v_nivel := least(10, v_nivel + 1);
        v_racha := 0;
      end if;
    else
      v_racha := 0;
      if not p_protegido then
        v_nivel := greatest(1, v_nivel - 1);
      end if;
    end if;

    insert into public.logic_skill_levels (user_id, nivel, racha_actual, updated_at)
    values (v_user, v_nivel, v_racha, now())
    on conflict (user_id)
    do update set nivel = excluded.nivel, racha_actual = excluded.racha_actual, updated_at = now();
  end if;

  return query select v_xp, v_sospechoso, v_nivel, v_racha;
end;
$$;

grant execute on function public.insertar_intento_logica(uuid, integer, boolean, integer, boolean) to authenticated;
-- ######### FIN: 0120_cerrar_s0_s1.sql #########

-- ######### INICIO: 0121_trastienda_economia.sql #########
-- 0121: Trastienda — economía server (ruleta, volado, pizarra, historial)
-- + fix resiliente del "doble o nada" (este proyecto: 0120 era la última).
--
-- Implementa el primer corte de TRASTIENDA-ECONOMIA.md, server-authoritative:
--   - Mecánica 4 (ruleta): EV ~0.92, límite 5 giros/día, 1er giro 120 (descuento
--     20%), pity en 3 "sin premio" seguidos.
--   - Mecánica 5 cortada a los 2 minijuegos 100% validables en server SIN que el
--     cliente tenga que pasarle un resultado: Volado (RNG server-side, cara/cruz
--     cosmético sobre una tirada 50/50) y La Pizarra (el server guarda el número,
--     nunca se lo muestra al cliente — solo pistas mayor/menor).
--     La Calcu / Acertijos / El Reloj quedan como corte siguiente (PENDIENTE en
--     TECH-DEBT): requieren sessiones propias o validación server de la expresión.
--   - Historial reciente (últimas 8 interacciones).
--   - Mecánica 1 (apostar a partida de otro) y Mecánica 2 (predicción de ranking)
--     y Mecánica 3 (títulos de Trastienda): NO son parte de esta migración —
--     dependen de la máquina de estados de duels/rankeds y del job semanal de
--     ranking (ver DECISIONS.md 2026-09-09). El segmento 'titulo' de la ruleta
--     entrega un escudo (placeholder) hasta que exista esa mecánica.
--
-- FIX doble o nada (roots): apostar_doble_o_nada (0054) contaba actividad con
-- logic_attempts y duel_results. Si en prod esas tablas no existían al momento de
-- aplicar 0054 (o la migración no se aplicó completa), la función rompe con 42P01
-- (relación no existe) — un código != P0001, así que respuestaError la traduce al
-- genérico "Algo salió mal. Probá de nuevo." (lo que vio el PO). Se recrea acá
-- RESILIENTE: suma logic_attempts/duel_results solo si existen (to_regclass) y
-- garantiza las columnas apuesta_monto/apuesta_umbral.

-- ---------- 1) Garantías de columnas del doble o nada ----------
alter table public.profiles add column if not exists apuesta_monto integer not null default 0;
alter table public.profiles add column if not exists apuesta_umbral numeric;

-- ---------- 2) Tablas ----------
create table if not exists public.trastienda_ruleta (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  fecha date not null default current_date,
  segmento text not null,
  premio_tipo text,
  premio_detalle jsonb,
  giro_numero integer not null check (giro_numero between 1 and 5),
  pity_counter integer not null default 0,
  costo_aplicado integer not null check (costo_aplicado in (120, 150)),
  creado_at timestamptz not null default now(),
  constraint trastienda_ruleta_solo_propia check (user_id = auth.uid())
);

create table if not exists public.trastienda_minijuegos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  juego text not null,
  entrada integer not null,
  salida integer not null default 0,
  resultado jsonb,
  mejor_racha integer not null default 0,
  racha_actual integer not null default 0,
  creado_at timestamptz not null default now(),
  constraint trastienda_mini_solo_propia check (user_id = auth.uid())
);

-- La Pizarra guarda el secreto: NUNCA se le da SELECT al cliente ni a
-- authenticated. Solo las funciones security definer la tocan.
create table if not exists public.trastienda_pizarra (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  minijuego_id uuid not null references public.trastienda_minijuegos(id),
  fecha date not null default current_date,
  secreto integer not null check (secreto between 1 and 100),
  intentos integer not null default 0,
  estado text not null default 'jugando' check (estado in ('jugando', 'ganado', 'perdido')),
  resuelto_at timestamptz,
  creado_at timestamptz not null default now(),
  constraint trastienda_pizarra_solo_propia check (user_id = auth.uid())
);

-- ---------- 3) RLS: lectura propia en ruleta/minijuegos; pizarra cerrada ----------
alter table public.trastienda_ruleta enable row level security;
alter table public.trastienda_minijuegos enable row level security;
alter table public.trastienda_pizarra enable row level security;

create policy "trastienda_ruleta: lectura propia" on public.trastienda_ruleta
  for select using (auth.uid() = user_id);
create policy "trastienda_minijuegos: lectura propia" on public.trastienda_minijuegos
  for select using (auth.uid() = user_id);
-- public.trastienda_pizarra no tiene policies ni grants: invisible salvo por RPC.

-- ---------- 4) Ruleta ----------
-- ORDEN DE SEGMENTOS (probabilidades acumuladas) — espejo del cliente en
-- src/lib/trastienda/ruleta.ts (mismo orden para que la aguja aterrice bien).
-- Probabilidades (non-pity) según TRASTIENDA-ECONOMIA.md §4 (EV 138.5/150 = 0.923):
--   boost 5 | escudo 8 | congelamiento 6 | 50ch 12 | 25ch 20 | 100ch 3
--   fuente 2 | marco 1.5 | titulo 0.5 | nada 42   = 100
create or replace function public.girar_ruleta()
returns table (
  segmento text,
  premio_tipo text,
  premio_detalle jsonb,
  chispas_ganadas integer,
  puntos_total integer,
  giros_hoy integer,
  pity_activo boolean,
  costo_aplicado integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_giros_hoy integer;
  v_costo integer;
  v_pity_prev integer := 0;
  v_r numeric;
  v_segmento text;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_chispas integer := 0;
  v_pity_new integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_giros_hoy
  from public.trastienda_ruleta
  where user_id = v_user and fecha = current_date;

  if v_giros_hoy >= 5 then
    raise exception 'ya giraste las 5 veces de hoy — volvé mañana';
  end if;

  v_costo := case when v_giros_hoy = 0 then 120 else 150 end;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas para girar';
  end if;

  select coalesce(r.pity_counter, 0) into v_pity_prev
  from public.trastienda_ruleta r
  where r.user_id = v_user
  order by r.creado_at desc
  limit 1;

  if v_pity_prev >= 3 then
    -- Pity: 3 sin premio seguidos -> premio menor garantizado (25+, 50+ o escudo).
    v_segmento := (array['chispas_25', 'chispas_50', 'escudo'])[1 + floor(random() * 3)::int];
  else
    v_r := random() * 100;
    if v_r < 5 then
      v_segmento := 'boost';
    elsif v_r < 13 then
      v_segmento := 'escudo';
    elsif v_r < 19 then
      v_segmento := 'congelamiento';
    elsif v_r < 31 then
      v_segmento := 'chispas_50';
    elsif v_r < 51 then
      v_segmento := 'chispas_25';
    elsif v_r < 54 then
      v_segmento := 'chispas_100';
    elsif v_r < 56 then
      v_segmento := 'fuente';
    elsif v_r < 57.5 then
      v_segmento := 'marco';
    elsif v_r < 58 then
      v_segmento := 'titulo';
    else
      v_segmento := 'nada';
    end if;
  end if;

  -- Costo: se descuenta siempre.
  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  if v_segmento = 'boost' then
    update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'boost');
  elsif v_segmento in ('escudo', 'titulo') then
    -- 'titulo' es placeholder: sin Mecánica 3 los títulos no se pueden otorgar
    -- con criterio real, así que entrega un escudo (decisión en DECISIONS.md).
    update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'escudo');
  elsif v_segmento = 'congelamiento' then
    update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'congelamiento');
  elsif v_segmento in ('chispas_25', 'chispas_50', 'chispas_100') then
    v_chispas := (string_to_array(v_segmento, '_'))[2]::int;
    update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
    v_premio_tipo := 'chispas';
    v_premio_detalle := jsonb_build_object('chispas', v_chispas);
  elsif v_segmento = 'fuente' then
    select coalesce(array_agg(f), array[]::text[]) into v_disponibles
    from unnest(v_fuentes) t(f)
    where not (
      f = any (coalesce((select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 200;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'fuente';
      v_premio_detalle := jsonb_build_object('fuente', v_elegido);
    end if;
  elsif v_segmento = 'marco' then
    select coalesce(array_agg(m), array[]::text[]) into v_disponibles
    from unnest(v_marcos) t(m)
    where not (
      m = any (coalesce((select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 300;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'marco';
      v_premio_detalle := jsonb_build_object('marco', v_elegido);
    end if;
  end if;

  v_pity_new := case when v_segmento = 'nada' then v_pity_prev + 1 else 0 end;

  insert into public.trastienda_ruleta
    (user_id, segmento, premio_tipo, premio_detalle, giro_numero, pity_counter, costo_aplicado)
  values
    (v_user, v_segmento, v_premio_tipo, v_premio_detalle, v_giros_hoy + 1, v_pity_new, v_costo);

  return query select
    v_segmento,
    v_premio_tipo,
    v_premio_detalle,
    v_chispas,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_giros_hoy + 1,
    v_pity_new >= 3,
    v_costo;
end;
$$;

-- ---------- 5) Volado ----------
-- Ronda 1: entrada 30 -> 55 (×1.83) · Ronda 2: 60 -> 110 · Ronda 3: 120 -> 220.
-- EV por ronda 0.5 × 1.83 = 0.915. Sin carryover de pozo entre rondas (corte
-- seguro): cada ronda es una apuesta independiente con la misma proporción.
create or replace function public.tirar_volado(p_ronda integer, p_eleccion boolean)
returns table (
  cara boolean,
  ganaste boolean,
  entrada integer,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_entrada integer;
  v_salida integer;
  v_cara boolean;
  v_ganaste boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_ronda not between 1 and 3 then
    raise exception 'ronda invalida';
  end if;

  v_entrada := case p_ronda when 1 then 30 when 2 then 60 else 120 end;
  v_salida := case p_ronda when 1 then 55 when 2 then 110 else 220 end;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_entrada then
    raise exception 'te faltan Chispas para esa ronda';
  end if;

  v_cara := random() < 0.5;
  v_ganaste := v_cara = p_eleccion;

  update public.profiles
  set puntos_total = puntos_total - v_entrada + case when v_ganaste then v_salida else 0 end
  where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada, salida, resultado)
  values (
    v_user, 'volado', v_entrada,
    case when v_ganaste then v_salida else 0 end,
    jsonb_build_object('ronda', p_ronda, 'cara', v_cara, 'ganaste', v_ganaste)
  );

  return query select
    v_cara,
    v_ganaste,
    v_entrada,
    case when v_ganaste then v_salida else 0 end,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

-- ---------- 6) La Pizarra ----------
-- Entrada 30; cada pregunta 10; máx 7 intentos. Pago 170 (1-3), 100 (4-5),
-- 50 (6-7). EV ≈ 0.96 según TRASTIENDA-ECONOMIA.md §5. Límite 3 sesiones/día.
create or replace function public.iniciar_la_pizarra()
returns table (
  pizarra_id uuid,
  entrada integer,
  partidas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_del_dia integer;
  v_partidas_hoy integer;
  v_numero integer;
  v_minijuego_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_partidas_hoy
  from public.trastienda_pizarra where user_id = v_user and fecha = current_date;

  if v_partidas_hoy >= 3 then
    raise exception 'ya jugaste las 3 partidas de hoy — volvé mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 30 then
    raise exception 'te faltan Chispas para entrar a la pizarra';
  end if;

  -- Una pizarra sin terminar queda cerrada como perdida al entrar a otra.
  update public.trastienda_pizarra
  set estado = 'perdido', resuelto_at = now()
  where user_id = v_user and estado = 'jugando';

  v_numero := 1 + floor(random() * 100)::int;

  update public.profiles set puntos_total = puntos_total - 30 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_pizarra', 30)
  returning id into v_minijuego_id;

  insert into public.trastienda_pizarra (user_id, minijuego_id, secreto)
  values (v_user, v_minijuego_id, v_numero)
  returning id into v_del_dia; -- reusar como variable temporal (el id de la sesión)

  return query select
    v_del_dia,
    30,
    v_partidas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

create or replace function public.adivinar_la_pizarra(p_pizarra_id uuid, p_numero integer)
returns table (
  ganaste boolean,
  terminado boolean,
  intentos integer,
  pista text,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fila public.trastienda_pizarra%rowtype;
  v_saldo integer;
  v_payout integer;
  v_pista text := null;
  v_ganaste boolean := false;
  v_terminado boolean := false;
  v_chispas integer := 0;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_numero not between 1 and 100 then
    raise exception 'número del 1 al 100';
  end if;

  select * into v_fila
  from public.trastienda_pizarra
  where id = p_pizarra_id and user_id = v_user;

  if not found or v_fila.estado <> 'jugando' then
    raise exception 'esa pizarra ya terminó';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 10 then
    raise exception 'te faltan Chispas para esa pregunta';
  end if;

  update public.profiles set puntos_total = puntos_total - 10 where id = v_user;

  v_fila.intentos := v_fila.intentos + 1;

  if p_numero = v_fila.secreto then
    v_ganaste := true;
    v_terminado := true;
    v_payout := case when v_fila.intentos <= 3 then 170 when v_fila.intentos <= 5 then 100 else 50 end;
    update public.profiles set puntos_total = puntos_total + v_payout where id = v_user;
    update public.trastienda_pizarra
    set intentos = v_fila.intentos, estado = 'ganado', resuelto_at = now()
    where id = p_pizarra_id;
    update public.trastienda_minijuegos
    set salida = v_payout,
        resultado = jsonb_build_object('intentos', v_fila.intentos, 'ganaste', true)
    where id = v_fila.minijuego_id;
    v_chispas := v_payout;
  elsif v_fila.intentos >= 7 then
    v_terminado := true;
    update public.trastienda_pizarra
    set intentos = v_fila.intentos, estado = 'perdido', resuelto_at = now()
    where id = p_pizarra_id;
    update public.trastienda_minijuegos
    set salida = 0,
        resultado = jsonb_build_object('intentos', v_fila.intentos, 'ganaste', false)
    where id = v_fila.minijuego_id;
  else
    v_pista := case when p_numero < v_fila.secreto then 'mayor' else 'menor' end;
    update public.trastienda_pizarra set intentos = v_fila.intentos where id = p_pizarra_id;
    update public.trastienda_minijuegos
    set resultado = jsonb_build_object('intentos', v_fila.intentos)
    where id = v_fila.minijuego_id;
  end if;

  return query select
    v_ganaste,
    v_terminado,
    v_fila.intentos,
    v_pista,
    v_chispas,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

-- ---------- 7) Historial reciente ----------
create or replace function public.fetch_trastienda_historial()
returns table (
  tipo text,
  titulo text,
  detalle jsonb,
  monto integer,
  creado_at timestamptz
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

  return query
    with r as (
      select 'ruleta'::text as tipo, r.segmento as titulo, r.premio_detalle as detalle,
        coalesce((r.premio_detalle->>'chispas')::integer, 0) as monto, r.creado_at
      from public.trastienda_ruleta r
      where r.user_id = v_user
    ),
    m as (
      select 'minijuego'::text as tipo, m.juego as titulo, m.resultado as detalle,
        m.salida as monto, m.creado_at
      from public.trastienda_minijuegos m
      where m.user_id = v_user
    ),
    p as (
      select 'pizarra'::text as tipo, 'la_pizarra'::text as titulo,
        jsonb_build_object('estado', p.estado, 'intentos', p.intentos) as detalle,
        case when p.estado = 'ganado'
          then case when p.intentos <= 3 then 170 when p.intentos <= 5 then 100 else 50 end
          else 0 end as monto,
        p.creado_at
      from public.trastienda_pizarra p
      where p.user_id = v_user
    )
    select * from r
    union all select * from m
    union all select * from p
    order by creado_at desc
    limit 8;
end;
$$;

-- ---------- 8) FIX doble o nada resiliente ----------
-- Recrea apostar_doble_o_nada con la lógica de 0054 pero sin depender de que
-- logic_attempts/duel_results existan: si no están, se ignora su aporte de
-- actividad (sin 42P01 -> el cliente ya no ve "Algo salió mal" genérico).
create or replace function public.apostar_doble_o_nada(p_monto integer)
returns table (umbral numeric, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuesta_previa integer;
  v_total_simple bigint := 0;
  v_correctos_simple bigint := 0;
  v_duelos bigint := 0;
  v_actividad bigint;
  v_umbral numeric;
  v_apuesta_maxima constant integer := 200;
  v_tiene_logic boolean;
  v_tiene_duelos boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto <= 0 then
    raise exception 'monto invalido';
  end if;
  if p_monto > v_apuesta_maxima then
    raise exception 'la apuesta máxima es % Chispas', v_apuesta_maxima;
  end if;

  select pr.puntos_total, pr.apuesta_monto into v_saldo, v_apuesta_previa
  from public.profiles pr where pr.id = v_user;

  if v_apuesta_previa > 0 then
    raise exception 'ya tenes una apuesta activa';
  end if;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  select count(*), count(*) filter (where correct) into v_total_simple, v_correctos_simple
  from public.attempts where user_id = v_user;

  v_tiene_logic := to_regclass('public.logic_attempts') is not null;
  if v_tiene_logic then
    select v_total_simple + count(*), v_correctos_simple + count(*) filter (where correct)
      into v_total_simple, v_correctos_simple
    from public.logic_attempts where user_id = v_user;
  end if;

  v_tiene_duelos := to_regclass('public.duel_results') is not null;
  if v_tiene_duelos then
    select count(*) into v_duelos from public.duel_results where user_id = v_user;
  end if;

  v_actividad := v_total_simple + v_duelos * 10;

  if v_actividad < 20 then
    raise exception 'jugá un poco más antes de poder apostar';
  end if;

  if v_total_simple >= 5 then
    v_umbral := v_correctos_simple::numeric / v_total_simple;
  elsif v_tiene_duelos and v_duelos > 0 then
    select avg(precision) into v_umbral from public.duel_results where user_id = v_user;
  else
    v_umbral := 0.7;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - p_monto,
      apuesta_monto = p_monto,
      apuesta_umbral = v_umbral
  where pr.id = v_user;

  return query select v_umbral, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

-- Se recrea también para garantizar presencia en prod (si 0025 no se aplicó,
-- /api/practica/finish y /api/enigmia/finish la llaman y hoy ni existiría).
create or replace function public.resolver_apuesta_si_activa(p_precision numeric)
returns table (resuelta boolean, gano boolean, monto integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_monto integer;
  v_umbral numeric;
  v_gano boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.apuesta_monto, pr.apuesta_umbral into v_monto, v_umbral
  from public.profiles pr where pr.id = v_user;

  if v_monto is null or v_monto = 0 then
    return query select false, false, 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
    return;
  end if;

  v_gano := p_precision > coalesce(v_umbral, 1);

  update public.profiles as pr
  set puntos_total = pr.puntos_total + case when v_gano then v_monto * 2 else 0 end,
      apuesta_monto = 0,
      apuesta_umbral = null
  where pr.id = v_user;

  return query
    select true, v_gano, v_monto, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

-- ---------- 9) Grants ----------
grant execute on function public.girar_ruleta() to authenticated;
grant execute on function public.tirar_volado(integer, boolean) to authenticated;
grant execute on function public.iniciar_la_pizarra() to authenticated;
grant execute on function public.adivinar_la_pizarra(uuid, integer) to authenticated;
grant execute on function public.fetch_trastienda_historial() to authenticated;
grant execute on function public.apostar_doble_o_nada(integer) to authenticated;
grant execute on function public.resolver_apuesta_si_activa(numeric) to authenticated;

grant select on public.trastienda_ruleta to authenticated;
grant select on public.trastienda_minijuegos to authenticated;
-- public.trastienda_pizarra: sin grants (el secreto no se expone nunca).
-- ######### FIN: 0121_trastienda_economia.sql #########

-- ######### INICIO: 0122_arreglo_pizarra.sql #########
-- 0122: Fix "Algo salió mal" de La Pizarra (0121).
--
-- En iniciar_la_pizarra (0121) la variable v_del_dia se declaró integer y
-- recibe el id (uuid) de la sesión insertada. PL/pgSQL falla en runtime con
-- un error no-P0001 (uuid -> integer no tiene cast) — y respuestaError lo
-- traduce al genérico "Algo salió mal. Probá de nuevo." que vio el PO en
-- todos los minijuegos.
--
-- Causa del resto de módulos (ruleta/volado/historial) confirmada por
-- diagnóstico: si apostar_doble_o_nada funciona, las RPCs y tablas existen;
-- si esos 3 fallaban y 0121 aplicó completa, era caché de PostgREST
-- (NOTIFY pgrst, 'reload schema' lo resuelve). Este archivo además
-- re-emite el reload por las dudas.

create or replace function public.iniciar_la_pizarra()
returns table (
  pizarra_id uuid,
  entrada integer,
  partidas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_partidas_hoy integer;
  v_numero integer;
  v_minijuego_id uuid;
  v_pizarra_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_partidas_hoy
  from public.trastienda_pizarra where user_id = v_user and fecha = current_date;

  if v_partidas_hoy >= 3 then
    raise exception 'ya jugaste las 3 partidas de hoy — volvé mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 30 then
    raise exception 'te faltan Chispas para entrar a la pizarra';
  end if;

  -- Una pizarra sin terminar queda cerrada como perdida al entrar a otra.
  update public.trastienda_pizarra
  set estado = 'perdido', resuelto_at = now()
  where user_id = v_user and estado = 'jugando';

  v_numero := 1 + floor(random() * 100)::int;

  update public.profiles set puntos_total = puntos_total - 30 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_pizarra', 30)
  returning id into v_minijuego_id;

  insert into public.trastienda_pizarra (user_id, minijuego_id, secreto)
  values (v_user, v_minijuego_id, v_numero)
  returning id into v_pizarra_id;

  return query select
    v_pizarra_id,
    30,
    v_partidas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.iniciar_la_pizarra() to authenticated;

-- Recarga de PostgREST: garantiza que las funciones de 0121/0122 estén en
-- el caché de schema (evita PGRST202 "function not found in schema cache").
notify pgrst, 'reload schema';
-- ######### FIN: 0122_arreglo_pizarra.sql #########

-- ######### INICIO: 0123_trastienda_mecanicas_123.sql #########
-- 0123: Trastienda — Mecánica 1 (apuestas a duelos de otros), Mecánica 2
-- (predicción de puesto en el ranking semanal) y Mecánica 3 (títulos de
-- Trastienda). Siguen a 0122_arreglo_pizarra.sql.
--
-- TRASTIENDA-ECONOMIA.md §1-§3, server-authoritative:
--   - M1: tabla trastienda_apuestas + RPCs fetch_apuestas_disponibles /
--         apostar_partida / preview_apuesta_partida / resolver_apuesta_partida.
--         Resolución automática por trigger cuando un duelo se completa.
--         Alcance inicial: SOLO duelos (la única máquina de partidas de
--         OTROS auditada completa: duels + duel_results + profiles.elo_rating).
--         rankeds/reto_semanal quedan para un corte futuro (el tipo de la
--         tabla ya los contempla en ejemplos, ver nota en DECISIONS).
--   - M2: tabla trastienda_predicciones_ranking + RPC apostar_prediccion_
--         ranking / resolver_prediccion_ranking (+ ranking_semanal_de_semana,
--         variante historizable del ranking semanal). Self-heal: al apostar la
--         semana siguiente, se resuelve la predicción de la semana pasada.
--   - M3: los títulos viven en el catálogo TS (src/lib/titulos/*). Acá solo
--         se deja de usar el placeholder: el segmento 'titulo' de la ruleta
--         pasa a desbloquear un título de Trastienda real vía
--         desbloquear_titulo_propio (cuyo slug/nombre conoce el server).
--
-- Convenciones copiadas de 0121: security definer + search_path public,
-- CHECKs en tablas, políticas de select propias, grants acotados.

-- ---------- 1) Tablas ----------
-- IDEMPOTENTE: si 0123 se corrió a medias (re-ejecutable completo sin error).
-- Apuestas a partidas de OTROS jugadores (M1). El partida_id apunta a
-- duels.id mientras partida_tipo = 'duelo'. Eleccion: 'a' (retador) | 'b'
-- (retado) | 'empate'. El multiplier se lockea al apostar (server), nunca
-- se recalcula contra el cliente.
create table if not exists public.trastienda_apuestas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  partida_id uuid not null,
  partida_tipo text not null default 'duelo' check (partida_tipo in ('duelo')),
  jugador_a_id uuid,
  jugador_b_id uuid,
  eleccion text not null check (eleccion in ('a', 'b', 'empate')),
  monto integer not null check (monto in (25, 50, 100, 200)),
  multiplier numeric(5, 2) not null,
  ganancia_potencial integer not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'ganada', 'perdida', 'empate_devuelto')),
  resultado_final text check (resultado_final in ('a', 'b', 'empate')),
  payout integer not null default 0,
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz,
  constraint trastienda_apuestas_sin_autoapuesta check (user_id <> jugador_a_id and user_id <> jugador_b_id),
  constraint trastienda_apuestas_una_por_partida unique (user_id, partida_id)
);

-- Límites diarios de M1 (10 apuestas y 500 Chispas apostadas por día).
create table if not exists public.trastienda_limites_diarios (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  fecha date not null default current_date,
  apuestas_realizadas integer not null default 0 check (apuestas_realizadas >= 0),
  monto_total_apostado integer not null default 0 check (monto_total_apostado >= 0),
  perdida_total integer not null default 0 check (perdida_total >= 0)
);

-- Predicciones de ranking semanal (M2). Una por usuario y semana (unique).
create table if not exists public.trastienda_predicciones_ranking (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  semana_inicio date not null,
  puesto_predicho text not null check (puesto_predicho in ('1', '2', '3', '4-5', '6-10', '11-20', '21+')),
  monto integer not null check (monto in (25, 50, 100, 200)),
  multiplier numeric(5, 2) not null,
  ganancia_potencial integer not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'ganada', 'parcial', 'perdida')),
  payout integer not null default 0,
  puesto_real integer,
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz,
  constraint trastienda_predicciones_una_por_semana unique (user_id, semana_inicio)
);

-- ---------- 2) RLS ----------
alter table public.trastienda_apuestas enable row level security;
alter table public.trastienda_limites_diarios enable row level security;
alter table public.trastienda_predicciones_ranking enable row level security;

drop policy if exists "trastienda_apuestas: lectura propia" on public.trastienda_apuestas;
create policy "trastienda_apuestas: lectura propia" on public.trastienda_apuestas
  for select using (auth.uid() = user_id);
drop policy if exists "trastienda_limites_diarios: lectura propia" on public.trastienda_limites_diarios;
create policy "trastienda_limites_diarios: lectura propia" on public.trastienda_limites_diarios
  for select using (auth.uid() = user_id);
drop policy if exists "trastienda_predicciones: lectura propia" on public.trastienda_predicciones_ranking;
create policy "trastienda_predicciones: lectura propia" on public.trastienda_predicciones_ranking
  for select using (auth.uid() = user_id);
-- Escrituras solo vía RPCs security definer (resuelven + pagan + deducen).

-- ---------- 3) Ranking semanal historizable (M2) ----------
-- Igual que ranking_semanal() (0006) pero para UNA semana pasada: el
-- ranking_semanal() existente siempre mira la semana ACTUAL, así que no
-- sirve para resolver la predicción de la semana que ya cerró.
create or replace function public.ranking_semanal_de_semana(p_semana date)
returns table (
  user_id uuid,
  posicion bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id as user_id,
         row_number() over (order by coalesce(sum(dp.xp_ganado), 0) desc, p.id) as posicion
  from public.profiles p
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= p_semana
    and dp.fecha < p_semana + 7
  group by p.id
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by posicion;
$$;

grant execute on function public.ranking_semanal_de_semana(date) to authenticated;

-- ---------- 4) M1 — multiplier lockeado por ΔELO (TRASTIENDA-ECONOMIA.md §1) ----------
-- Favorito = el de mayor ELO; underdog = el de menor. Si empatan, las tres
-- elecciones usan la columna de "favorito" (1.85/1.85/3.50).
create or replace function public.multiplier_apuesta_partida(p_elo_a integer, p_elo_b integer, p_eleccion text)
returns numeric
language plpgsql
stable
as $$
declare
  v_delta integer := abs(p_elo_a - p_elo_b);
  v_es_a_favorito boolean := p_elo_a >= p_elo_b;
begin
  if p_elo_a = p_elo_b then
    v_es_a_favorito := true;
  end if;
  if p_eleccion = 'empate' then
    if v_delta <= 50 then return 3.50;
    elsif v_delta <= 150 then return 4.00;
    elsif v_delta <= 300 then return 5.00;
    else return 6.00;
    end if;
  end if;
  -- eleccion 'a' o 'b': favorito si coincide con el mayor ELO.
  if (v_es_a_favorito and p_eleccion = 'a') or (not v_es_a_favorito and p_eleccion = 'b') then
    if v_delta <= 50 then return 1.85;
    elsif v_delta <= 150 then return 1.50;
    elsif v_delta <= 300 then return 1.30;
    else return 1.15;
    end if;
  end if;
  -- underdog
  if v_delta <= 50 then return 1.85;
  elsif v_delta <= 150 then return 2.30;
  elsif v_delta <= 300 then return 3.00;
  else return 4.00;
  end if;
end;
$$;

-- ---------- 5) M1 — feed de partidas disponibles ----------
-- Security definer a propósito: la RLS de duels esconde los duelos ajenos,
-- y este es el único canal (acotado) por el que el cliente los ve: solo
-- id, estado, operación, nombres de pila y ELO de duelos en curso o
-- esperando, en los que el usuario NO participa y a los que todavía NO
-- apostó. Máximo 20.
create or replace function public.fetch_apuestas_disponibles()
returns table (
  partida_id uuid,
  tipo text,
  estado text,
  operation_type text,
  jugador_a_id uuid,
  jugador_b_id uuid,
  nombre_a text,
  nombre_b text,
  elo_a integer,
  elo_b integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    d.id as partida_id,
    'duelo'::text as tipo,
    d.estado,
    d.operation_type,
    d.retador_id as jugador_a_id,
    d.retado_id as jugador_b_id,
    pa.display_name as nombre_a,
    pb.display_name as nombre_b,
    pa.elo_rating as elo_a,
    pb.elo_rating as elo_b
  from public.duels d
  join public.profiles pa on pa.id = d.retador_id
  join public.profiles pb on pb.id = d.retado_id
  where d.estado in ('pendiente', 'en_curso')
    and auth.uid() not in (d.retador_id, d.retado_id)
    and not exists (
      select 1 from public.trastienda_apuestas a
      where a.user_id = auth.uid() and a.partida_id = d.id
    )
  order by d.creado_at desc
  limit 20;
$$;

grant execute on function public.fetch_apuestas_disponibles() to authenticated;

-- ---------- 6) M1 — preview de odds (para el modal de confirmación) ----------
-- No lockea nada: es el número que el cliente muestra ANTES de confirmar.
-- El lockeo real ocurre en apostar_partida, que recalculA el mismo
-- multiplier (una sola fuente: multiplier_apuesta_partida).
create or replace function public.preview_apuesta_partida(p_partida_id uuid, p_eleccion text, p_monto integer)
returns table (multiplier numeric, ganancia_potencial integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_user uuid := auth.uid();
  v_duelo public.duels%rowtype;
  v_elo_a integer;
  v_elo_b integer;
  v_mult numeric;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_eleccion not in ('a', 'b', 'empate') then
    raise exception 'eleccion invalida';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  select * into v_duelo from public.duels where id = p_partida_id;
  if not found then
    raise exception 'esa partida no existe';
  end if;

  select elo_rating into v_elo_a from public.profiles where id = v_duelo.retador_id;
  select elo_rating into v_elo_b from public.profiles where id = v_duelo.retado_id;

  v_mult := public.multiplier_apuesta_partida(v_elo_a, v_elo_b, p_eleccion);

  return query select
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.preview_apuesta_partida(uuid, text, integer) to authenticated;

-- ---------- 7) M1 — apostar ----------
create or replace function public.apostar_partida(p_partida_id uuid, p_eleccion text, p_monto integer)
returns table (
  apuesta_id uuid,
  multiplier numeric,
  ganancia_potencial integer,
  puntos_total integer,
  apuestas_hoy integer,
  monto_apostado_hoy integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duelo public.duels%rowtype;
  v_elo_a integer;
  v_elo_b integer;
  v_mult numeric;
  v_saldo integer;
  v_apuestas_hoy integer := 0;
  v_monto_hoy integer := 0;
  v_perdida_hoy integer := 0;
  v_fila_limite public.trastienda_limites_diarios%rowtype;
  v_apuesta_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_eleccion not in ('a', 'b', 'empate') then
    raise exception 'eleccion invalida';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  select * into v_duelo from public.duels where id = p_partida_id;
  if not found then
    raise exception 'esa partida no existe';
  end if;
  if v_duelo.estado not in ('pendiente', 'en_curso') then
    raise exception 'esa partida ya cerró';
  end if;
  -- Prohibir auto-apuestas: el apostador no puede ser participante.
  if v_user in (v_duelo.retador_id, v_duelo.retado_id) then
    raise exception 'no se puede apostar a una partida propia';
  end if;
  -- Una apuesta por partida (mensaje amigable; el unique de la tabla es el respaldo).
  if exists (
    select 1 from public.trastienda_apuestas
    where user_id = v_user and partida_id = p_partida_id
  ) then
    raise exception 'ya apostaste a esa partida';
  end if;

  -- Límites diarios (fila de hoy; si la fila es de otro día, se resetea).
  select * into v_fila_limite
  from public.trastienda_limites_diarios
  where user_id = v_user;
  if found and v_fila_limite.fecha = current_date then
    v_apuestas_hoy := v_fila_limite.apuestas_realizadas;
    v_monto_hoy := v_fila_limite.monto_total_apostado;
    v_perdida_hoy := v_fila_limite.perdida_total;
  end if;

  if v_apuestas_hoy >= 10 then
    raise exception 'ya apostaste las 10 veces de hoy — volvé mañana';
  end if;
  if v_monto_hoy + p_monto > 500 then
    raise exception 'superás el tope diario de 500 Chispas apostadas';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  select elo_rating into v_elo_a from public.profiles where id = v_duelo.retador_id;
  select elo_rating into v_elo_b from public.profiles where id = v_duelo.retado_id;
  v_mult := public.multiplier_apuesta_partida(v_elo_a, v_elo_b, p_eleccion);

  -- Deducción atómica + registro de la apuesta en una transacción.
  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

  insert into public.trastienda_apuestas
    (user_id, partida_id, partida_tipo, jugador_a_id, jugador_b_id, eleccion, monto, multiplier, ganancia_potencial)
  values
    (v_user, p_partida_id, 'duelo', v_duelo.retador_id, v_duelo.retado_id,
     p_eleccion, p_monto, v_mult, floor(p_monto * v_mult)::int)
  returning id into v_apuesta_id;

  insert into public.trastienda_limites_diarios
    (user_id, fecha, apuestas_realizadas, monto_total_apostado, perdida_total)
  values (v_user, current_date, v_apuestas_hoy + 1, v_monto_hoy + p_monto, v_perdida_hoy)
  on conflict (user_id) do update set
    fecha = current_date,
    apuestas_realizadas = public.trastienda_limites_diarios.apuestas_realizadas + 1,
    monto_total_apostado = public.trastienda_limites_diarios.monto_total_apostado + p_monto;

  return query select
    v_apuesta_id,
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_apuestas_hoy + 1,
    v_monto_hoy + p_monto;
end;
$$;

grant execute on function public.apostar_partida(uuid, text, integer) to authenticated;

-- ---------- 8) M1 — resolución ----------
-- Gana quien tenga mayor puntaje_final en duel_results; empate si son
-- iguales. Demorado hasta que el duelo esté completado (lo garantiza el
-- trigger de abajo sobre duel_results).
create or replace function public.resolver_apuesta_partida(p_partida_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_duelo public.duels%rowtype;
  v_puntaje_a integer;
  v_puntaje_b integer;
  v_resultado text;
  v_monto integer;
  v_mult numeric;
  v_estado text;
  v_payout integer;
  v_record record;
begin
  select * into v_duelo from public.duels where id = p_partida_id;
  if not found or v_duelo.estado <> 'completado' then
    return;
  end if;

  select puntaje_final into v_puntaje_a
  from public.duel_results where duel_id = p_partida_id and user_id = v_duelo.retador_id;
  select puntaje_final into v_puntaje_b
  from public.duel_results where duel_id = p_partida_id and user_id = v_duelo.retado_id;

  if v_puntaje_a is null or v_puntaje_b is null then
    return;
  end if;

  if v_puntaje_a > v_puntaje_b then
    v_resultado := 'a';
  elsif v_puntaje_b > v_puntaje_a then
    v_resultado := 'b';
  else
    v_resultado := 'empate';
  end if;

  for v_record in
    select a.id as apuesta_id, a.user_id, a.eleccion, a.monto, a.multiplier, a.ganancia_potencial
    from public.trastienda_apuestas a
    where a.partida_id = p_partida_id and a.partida_tipo = 'duelo' and a.estado = 'pendiente'
  loop
    if v_record.eleccion = v_resultado then
      v_estado := 'ganada';
      v_payout := v_record.ganancia_potencial;
    elsif v_resultado = 'empate' then
      v_estado := 'empate_devuelto';
      v_payout := v_record.monto;
    else
      v_estado := 'perdida';
      v_payout := 0;
    end if;

    if v_payout > 0 then
      update public.profiles set puntos_total = puntos_total + v_payout where id = v_record.user_id;
    end if;

    update public.trastienda_apuestas
    set estado = v_estado, resultado_final = v_resultado, payout = v_payout, resuelto_at = now()
    where id = v_record.apuesta_id;

    if v_estado = 'perdida' then
      insert into public.trastienda_limites_diarios (user_id, fecha, perdida_total)
      values (v_record.user_id, current_date, v_record.monto)
      on conflict (user_id) do update set
        fecha = current_date,
        perdida_total = public.trastienda_limites_diarios.perdida_total + v_record.monto;
    end if;
  end loop;
end;
$$;

-- Trigger: cuando un duelo se completa (ambos resultados + estado), se
-- resuelven las apuestas pendientes de esa partida automáticamente.
create or replace function public.delayed_resolver_apuestas_duelo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado text;
  v_retador uuid;
  v_retado uuid;
begin
  select d.estado, d.retador_id, d.retado_id into v_estado, v_retador, v_retado
  from public.duels d where d.id = NEW.duel_id;
  if v_estado = 'completado' then
    perform public.resolver_apuesta_partida(NEW.duel_id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trastienda_resolver_apuesta_duelo on public.duel_results;
create trigger trastienda_resolver_apuesta_duelo
  after insert or update on public.duel_results
  for each row execute function public.delayed_resolver_apuestas_duelo();

-- ---------- 9) M2 — multipliers de predicción (TRASTIENDA-ECONOMIA.md §2 ajustado) ----------
create or replace function public.multiplier_prediccion(p_puesto text)
returns numeric
language plpgsql
stable
as $$
begin
  return case p_puesto
    when '1' then 6.00
    when '2' then 4.00
    when '3' then 3.00
    when '4-5' then 2.20
    when '6-10' then 1.65
    when '11-20' then 1.30
    when '21+' then 1.12
    else null
  end;
end;
$$;

-- ---------- 10) M2 — apostar predicción (con self-heal de la semana pasada) ----------
create or replace function public.apostar_prediccion_ranking(p_puesto text, p_monto integer)
returns table (
  prediccion_id uuid,
  semana_inicio date,
  multiplier numeric,
  ganancia_potencial integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_semana date := date_trunc('week', current_date)::date;
  v_mult numeric;
  v_saldo integer;
  v_existe boolean;
  v_prediccion_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  v_mult := public.multiplier_prediccion(p_puesto);
  if v_mult is null then
    raise exception 'puesto invalido';
  end if;

  -- Self-heal: si quedó una predicción sin resolver de la semana pasada
  -- (no hay job semanal garantizado), se resuelve acá — una sola fuente de
  -- verdad para cerrar la semana anterior antes de abrir la nueva.
  perform public.resolver_prediccion_ranking(v_semana - 7);

  -- Ventana de apuesta: lunes a miércoles inclusive (spec: antes de que el
  -- ranking se asiente). La semana en la DB es la ISO (lunes 00:00 UTC).
  if current_date > v_semana + 2 then
    raise exception 'ya cerró la ventana de apuesta de esta semana — la próxima abre el lunes';
  end if;

  select exists(
    select 1 from public.trastienda_predicciones_ranking
    where user_id = v_user and semana_inicio = v_semana
  ) into v_existe;
  if v_existe then
    raise exception 'ya tenés una predicción para esta semana (una por semana)';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa predicción';
  end if;

  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

  insert into public.trastienda_predicciones_ranking
    (user_id, semana_inicio, puesto_predicho, monto, multiplier, ganancia_potencial)
  values
    (v_user, v_semana, p_puesto, p_monto, v_mult, floor(p_monto * v_mult)::int)
  returning id into v_prediccion_id;

  return query select
    v_prediccion_id,
    v_semana,
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.apostar_prediccion_ranking(text, integer) to authenticated;

-- ---------- 11) M2 — resolución de una semana (paga a filas propias) ----------
create or replace function public.resolver_prediccion_ranking(p_semana date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record record;
  v_posicion bigint;
  v_puesto_rank text;
  v_estado text;
  v_payout integer;
  v_centro numeric;
  v_distancia numeric;
begin
  for v_record in
    select id, user_id, puesto_predicho, monto, multiplier, ganancia_potencial
    from public.trastienda_predicciones_ranking
    where semana_inicio = p_semana and estado = 'pendiente'
  loop
    select r.posicion into v_posicion
    from public.ranking_semanal_de_semana(p_semana) r
    where r.user_id = v_record.user_id;

    -- Ausente (cero XP esa semana): se ubica peor que el puesto 20.
    if v_posicion is null then
      v_posicion := 99;
    end if;

    v_puesto_rank := case
      when v_posicion = 1 then '1'
      when v_posicion = 2 then '2'
      when v_posicion = 3 then '3'
      when v_posicion between 4 and 5 then '4-5'
      when v_posicion between 6 and 10 then '6-10'
      when v_posicion between 11 and 20 then '11-20'
      else '21+'
    end;

    if v_puesto_rank = v_record.puesto_predicho then
      v_estado := 'ganada';
      v_payout := v_record.ganancia_potencial;
    else
      -- ±2 posiciones alrededor del centro del rango predicho → parcial 50%.
      v_centro := case v_record.puesto_predicho
        when '1' then 1.0
        when '2' then 2.0
        when '3' then 3.0
        when '4-5' then 4.5
        when '6-10' then 8.0
        when '11-20' then 15.5
        else 25.0
      end;
      v_distancia := abs(v_posicion - v_centro);
      if v_distancia <= 2 then
        v_estado := 'parcial';
        v_payout := floor(v_record.ganancia_potencial * 0.5);
      else
        v_estado := 'perdida';
        v_payout := 0;
      end if;
    end if;

    if v_payout > 0 then
      update public.profiles set puntos_total = puntos_total + v_payout where id = v_record.user_id;
    end if;

    update public.trastienda_predicciones_ranking
    set estado = v_estado, payout = v_payout, puesto_real = v_posicion, resuelto_at = now()
    where id = v_record.id;
  end loop;
end;
$$;

-- Wrapper para que el cliente "cobre" sus predicciones pendientes de
-- semanas ya cerradas (self-heal del lado de lectura, sin job).
create or replace function public.cobrar_predicciones_pendientes()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_semana_hoy date := date_trunc('week', current_date)::date;
  v_semana_pendiente date;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  -- Cosecha todas mis semanas cerradas que sigan en 'pendiente' (no solo la
  -- última): cubre al usuario que vuelve después de varias semanas.
  for v_semana_pendiente in
    select distinct semana_inicio
    from public.trastienda_predicciones_ranking
    where user_id = v_user and estado = 'pendiente' and semana_inicio < v_semana_hoy
  loop
    perform public.resolver_prediccion_ranking(v_semana_pendiente);
  end loop;
end;
$$;

grant execute on function public.cobrar_predicciones_pendientes() to authenticated;

-- ---------- 12) M3 — la ruleta pasa de escudo-placeholder a títulos reales ----------
-- Sustituye el branch 'titulo' de girar_ruleta (0121): ahora desbloquea un
-- título de Trastienda no ganado todavía, vía desbloquear_titulo_propio
-- (idempotente, respeta el "un activo a la vez"). Slugs + nombres espejo de
-- src/lib/titulos/catalogo.ts (categoria "trastienda").
create or replace function public.girar_ruleta()
returns table (
  segmento text,
  premio_tipo text,
  premio_detalle jsonb,
  chispas_ganadas integer,
  puntos_total integer,
  giros_hoy integer,
  pity_activo boolean,
  costo_aplicado integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_giros_hoy integer;
  v_costo integer;
  v_pity_prev integer := 0;
  v_r numeric;
  v_segmento text;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_chispas integer := 0;
  v_pity_new integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido text;
  v_titulo_slug text;
  v_titulo_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_giros_hoy
  from public.trastienda_ruleta
  where user_id = v_user and fecha = current_date;

  if v_giros_hoy >= 5 then
    raise exception 'ya giraste las 5 veces de hoy — volvé mañana';
  end if;

  v_costo := case when v_giros_hoy = 0 then 120 else 150 end;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas para girar';
  end if;

  select coalesce(r.pity_counter, 0) into v_pity_prev
  from public.trastienda_ruleta r
  where r.user_id = v_user
  order by r.creado_at desc
  limit 1;

  if v_pity_prev >= 3 then
    v_segmento := (array['chispas_25', 'chispas_50', 'escudo'])[1 + floor(random() * 3)::int];
  else
    v_r := random() * 100;
    if v_r < 5 then
      v_segmento := 'boost';
    elsif v_r < 13 then
      v_segmento := 'escudo';
    elsif v_r < 19 then
      v_segmento := 'congelamiento';
    elsif v_r < 31 then
      v_segmento := 'chispas_50';
    elsif v_r < 51 then
      v_segmento := 'chispas_25';
    elsif v_r < 54 then
      v_segmento := 'chispas_100';
    elsif v_r < 56 then
      v_segmento := 'fuente';
    elsif v_r < 57.5 then
      v_segmento := 'marco';
    elsif v_r < 58 then
      v_segmento := 'titulo';
    else
      v_segmento := 'nada';
    end if;
  end if;

  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  if v_segmento = 'boost' then
    update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'boost');
  elsif v_segmento = 'escudo' then
    update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'escudo');
  elsif v_segmento = 'congelamiento' then
    update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'congelamiento');
  elsif v_segmento = 'titulo' then
    -- Mecánica 3 real: título de Trastienda raro o menos que el usuario
    -- todavía no tenga. El dispenser elige del set base (tronado/farolero/
    -- uja/profeta-minor); los títulos más altos se dejan como meta de las
    -- Mecánicas 1/2 (ver catálogo en src/lib/titulos/catalogo.ts).
    select t.slug into v_titulo_slug
    from public.titulos_trastienda_base() t
    where t.slug not in (
      select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
    )
    order by random()
    limit 1;
    if v_titulo_slug is null then
      -- Ya tiene toda la base: rescate en Chispas.
      v_chispas := 200;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
      perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
      v_premio_tipo := 'titulo';
      v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
    end if;
  elsif v_segmento in ('chispas_25', 'chispas_50', 'chispas_100') then
    v_chispas := (string_to_array(v_segmento, '_'))[2]::int;
    update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
    v_premio_tipo := 'chispas';
    v_premio_detalle := jsonb_build_object('chispas', v_chispas);
  elsif v_segmento = 'fuente' then
    select coalesce(array_agg(f), array[]::text[]) into v_disponibles
    from unnest(v_fuentes) t(f)
    where not (
      f = any (coalesce((select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 200;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'fuente';
      v_premio_detalle := jsonb_build_object('fuente', v_elegido);
    end if;
  elsif v_segmento = 'marco' then
    select coalesce(array_agg(m), array[]::text[]) into v_disponibles
    from unnest(v_marcos) t(m)
    where not (
      m = any (coalesce((select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 300;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'marco';
      v_premio_detalle := jsonb_build_object('marco', v_elegido);
    end if;
  end if;

  v_pity_new := case when v_segmento = 'nada' then v_pity_prev + 1 else 0 end;

  insert into public.trastienda_ruleta
    (user_id, segmento, premio_tipo, premio_detalle, giro_numero, pity_counter, costo_aplicado)
  values
    (v_user, v_segmento, v_premio_tipo, v_premio_detalle, v_giros_hoy + 1, v_pity_new, v_costo);

  return query select
    v_segmento,
    v_premio_tipo,
    v_premio_detalle,
    v_chispas,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_giros_hoy + 1,
    v_pity_new >= 3,
    v_costo;
end;
$$;

grant execute on function public.girar_ruleta() to authenticated;

-- ---------- 13) Helpers de la ruleta (M3) ----------
-- Set base de títulos que entrega el segmento 'titulo' (raros o menos).
create or replace function public.titulos_trastienda_base()
returns table (slug text)
language sql
stable
as $$
  select slug from (values
    ('tronado'),
    ('farolero'),
    ('uja'),
    ('profeta-minor')
  ) v(slug);
$$;

create or replace function public.nombre_titulo_trastienda(p_slug text)
returns text
language plpgsql
stable
as $$
begin
  return case p_slug
    when 'tronado' then 'Tronado'
    when 'farolero' then 'Farolero'
    when 'profeta-minor' then 'Profeta Menor'
    when 'uja' then 'Uja'
    else 'Título de Trastienda'
  end;
end;
$$;

-- ---------- 14) Grants de tablas (lectura propia vía RLS + select) ----------
grant select on public.trastienda_apuestas to authenticated;
grant select on public.trastienda_limites_diarios to authenticated;
grant select on public.trastienda_predicciones_ranking to authenticated;
-- No hay grants de INSERT/UPDATE: toda escritura va por RPC security definer.

-- ---------- 15) Recarga de PostgREST ----------
-- Imprescindible tras crear/reemplazar RPCs: sin esto PostgREST responde
-- 404/PGRST202 ("function not found in schema cache") y el cliente lo
-- traduce a "Algo salió mal". Aplica a TODOS los módulos (ruleta, dados/
-- volado, pizarra y los nuevos).
notify pgrst, 'reload schema';
-- ######### FIN: 0123_trastienda_mecanicas_123.sql #########

-- ######### INICIO: 0124_trastienda_minijuegos.sql #########
-- 0124: Trastienda — Mecánica 5 (minijuegos) corte 2: La Calcu, Acertijos
-- de Enigmia y El Reloj. Sigue a 0123_trastienda_mecanicas_123.sql.
--
-- TRASTIENDA-ECONOMIA.md §5 (los tres que 0121 dejó PENDIENTE por requerir
-- sesión propia/validación server):
--   - La Calcu: el server GENERA el puzzle (4 números + meta), guarda la
--     solución, y valida la expresión que manda el cliente como AST JSON
--     (["+", num|exp, num|exp]) — sin eval de texto, sin inyección.
--     Costo 50 · salida 125 (×2.5) · bonus 200 si resuelve en ≤10s.
--   - Acertijos: el server genera la secuencia y la devuelve UNA vez (es el
--     juego de memoria: mostrarla es parte del juego); guarda la copia y
--     compara el orden que manda el cliente. Dificultad que sube con la
--     racha (3 seguidas → media, más → difícil). Costo 100 · salidas 60/100/170.
--   - El Reloj: 15 problemas de suma/resta, las respuestas viven SOLO en el
--     server (sesión sin grants ni policies). El cliente responde todo y el
--     server compara + aplica el reloj total (85s). Costo 60 · salidas 160/95/55.
--
-- Igual que en 0121: tablas de sesión SIN grants ni RLS (el secreto no se
-- expone nunca), escrituras solo por RPC security definer.

-- ---------- 1) Sesiones ----------
-- La Calcu: puzzle generado por el server; numeros = los 4 dados al jugador.
create table if not exists public.trastienda_calcu (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  minijuego_id uuid not null references public.trastienda_minijuegos(id),
  numeros integer[] not null,
  target integer not null,
  solucion jsonb not null,
  estado text not null default 'jugando' check (estado in ('jugando', 'ganado', 'perdido')),
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz
);

-- Acertijos: secuencia generada por el server (la muestra una vez).
create table if not exists public.trastienda_acertijos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  minijuego_id uuid not null references public.trastienda_minijuegos(id),
  secuencia integer[] not null,
  dificultad text not null check (dificultad in ('facil', 'media', 'dificil')),
  estado text not null default 'jugando' check (estado in ('jugando', 'ganado', 'perdido')),
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz
);

-- El Reloj: problemas con respuesta incluida — la tabla NO se grantea, el
-- cliente recibe los problemas sin 'resp' desde iniciar_el_reloj.
create table if not exists public.trastienda_reloj (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  minijuego_id uuid not null references public.trastienda_minijuegos(id),
  problemas jsonb not null,
  estado text not null default 'jugando' check (estado in ('jugando', 'terminado')),
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz
);

-- ---------- 2) Helpers de evaluación de expressiones (La Calcu) ----------
-- Evaluador seguro: recorre el AST ["+", a, b] / ["-"] / ["*"] / ["/"].
-- Devuelve NULL si la estructura no es válida o divide por cero.
create or replace function public.eval_calcu(p_node jsonb)
returns numeric
language plpgsql
immutable
as $$
declare
  v_op text;
  v_a numeric;
  v_b numeric;
begin
  if jsonb_typeof(p_node) = 'number' then
    return (p_node)::numeric;
  end if;
  if jsonb_typeof(p_node) <> 'array' or jsonb_array_length(p_node) <> 3 then
    return null;
  end if;
  if jsonb_typeof(p_node->0) <> 'string' then
    return null;
  end if;
  v_op := p_node->>0;
  if v_op not in ('+', '-', '*', '/') then
    return null;
  end if;
  v_a := public.eval_calcu(p_node->1);
  v_b := public.eval_calcu(p_node->2);
  if v_a is null or v_b is null then
    return null;
  end if;
  if v_op = '+' then return v_a + v_b; end if;
  if v_op = '-' then return v_a - v_b; end if;
  if v_op = '*' then return v_a * v_b; end if;
  if v_b = 0 then return null; end if;
  return v_a / v_b;
end;
$$;

-- Hoja de números usados por la expresión (multiset, con recursión).
create or replace function public.hojas_calcu(p_node jsonb)
returns integer[]
language plpgsql
immutable
as $$
declare
  v_left integer[];
  v_right integer[];
begin
  if jsonb_typeof(p_node) = 'number' then
    return array[(p_node)::numeric::int];
  end if;
  if jsonb_typeof(p_node) <> 'array' or jsonb_array_length(p_node) <> 3 then
    return array[]::integer[];
  end if;
  v_left := public.hojas_calcu(p_node->1);
  v_right := public.hojas_calcu(p_node->2);
  return v_left || v_right;
end;
$$;

-- Genera un puzzle resoluble: arma un árbol escondido de 4 números con
-- + - * (enteros) y devuelve (numeros, target, solucion). El jugador puede
-- usar ÷ también; la meta alcanzable con + - * siempre lo es.
create or replace function public.generar_puzzle_calcu()
returns table (numeros integer[], target integer, solucion jsonb)
language plpgsql
as $$
declare
  v_numbers integer[];
  v_lhs numeric;
  v_rhs numeric;
  v_node jsonb;
  v_node2 jsonb;
  v_root jsonb;
  v_op text;
  v_op2 text;
  v_op3 text;
  v_val12 numeric;
  v_val2 numeric;
  v_target numeric;
begin
  -- 4 números 1-13 al azar.
  v_numbers := array[
    1 + floor(random() * 12)::int,
    1 + floor(random() * 12)::int,
    1 + floor(random() * 12)::int,
    1 + floor(random() * 12)::int
  ];

-- Fusiones con forma fija izquierda: ((a op b) op c) op d. Las dos fusiones
-- internas pueden usar ÷ (el target no se vuelve entero hasta la última,
-- que es + - * — así la meta final siempre es entera, pero el jugador tiene
-- que navegar fracciones intermedias como en el "24 game").
  v_op := (array['+', '-', '*', '/'])[1 + floor(random() * 4)::int];
  v_lhs := v_numbers[1];
  v_rhs := v_numbers[2];
  if v_op = '-' and v_lhs < v_rhs then
    v_op := '+';
  end if; -- el rhs de la fusion 1 nunca es 0 (es un número 1-13): no hay div0.
  v_node := jsonb_build_array(v_op, to_jsonb(v_numbers[1]), to_jsonb(v_numbers[2]));
  v_val12 := case
    when v_op = '+' then v_lhs + v_rhs
    when v_op = '-' then v_lhs - v_rhs
    when v_op = '*' then v_lhs * v_rhs
    else v_lhs / v_rhs
  end;

  v_op2 := (array['+', '-', '*', '/'])[1 + floor(random() * 4)::int];
  v_lhs := v_val12;
  v_rhs := v_numbers[3]::numeric;
  if v_op2 = '-' and v_lhs < v_rhs then
    v_op2 := '+';
  end if; -- el rhs de la fusion 2 tampoco es 0 (número 1-13).
  v_node2 := jsonb_build_array(v_op2, v_node, to_jsonb(v_numbers[3]));
  v_val2 := case
    when v_op2 = '+' then v_lhs + v_rhs
    when v_op2 = '-' then v_lhs - v_rhs
    when v_op2 = '*' then v_lhs * v_rhs
    else v_lhs / v_rhs
  end;

  v_op3 := (array['+', '-', '*'])[1 + floor(random() * 3)::int];
  v_lhs := v_val2;
  v_rhs := v_numbers[4]::numeric;
  if v_op3 = '-' and v_lhs < v_rhs then
    v_op3 := '+';
  end if;
  v_root := jsonb_build_array(v_op3, v_node2, to_jsonb(v_numbers[4]));
  v_target := case v_op3 when '+' then v_lhs + v_rhs when '-' then v_lhs - v_rhs else v_lhs * v_rhs end;

  return query select v_numbers, v_target::int, v_root;
end;
$$;

-- ---------- 3) RPC La Calcu ----------
create or replace function public.iniciar_la_calcu()
returns table (
  calcu_id uuid,
  numeros integer[],
  target integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_puzzle record;
  v_minijuego_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 50 then
    raise exception 'te faltan Chispas para la calculadora';
  end if;

  select * into v_puzzle from public.generar_puzzle_calcu() p;

  update public.profiles set puntos_total = puntos_total - 50 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_calcu', 50)
  returning id into v_minijuego_id;

  insert into public.trastienda_calcu (user_id, minijuego_id, numeros, target, solucion)
  values (v_user, v_minijuego_id, v_puzzle.numeros, v_puzzle.target, v_puzzle.solucion);
  -- nota: el id se devuelve abajo desde la fila recién creada por el CTE del return query.

  return query select
    c.id,
    v_puzzle.numeros,
    v_puzzle.target,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user)
  from public.trastienda_calcu c
  where c.user_id = v_user and c.minijuego_id = v_minijuego_id;
end;
$$;

grant execute on function public.iniciar_la_calcu() to authenticated;

create or replace function public.resolver_la_calcu(p_calcu_id uuid, p_expresion jsonb)
returns table (
  ganaste boolean,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fila public.trastienda_calcu%rowtype;
  v_resultado numeric;
  v_hojas integer[];
  v_payout integer := 0;
  v_bonus integer := 0;
  v_resolvio boolean := false;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_fila
  from public.trastienda_calcu
  where id = p_calcu_id and user_id = v_user;

  if not found or v_fila.estado <> 'jugando' then
    raise exception 'esa partida ya terminó';
  end if;

  -- Ventana de 30 segundos según la spec de La Calcu.
  if now() - v_fila.creado_at > interval '30 seconds' then
    update public.trastienda_calcu
    set estado = 'perdido', resuelto_at = now()
    where id = p_calcu_id;
    update public.trastienda_minijuegos
    set salida = 0, resultado = jsonb_build_object('ganaste', false, 'tiempo_agotado', true)
    where id = v_fila.minijuego_id;
    return query select false, 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
    return;
  end if;

  v_resultado := public.eval_calcu(p_expresion);
  v_hojas := public.hojas_calcu(p_expresion);

  -- Solución válida: resultado exacto == target Y usa exactamente los
  -- mismos 4 números (misma multiset), cada uno una vez.
  if v_resultado is not null
     and v_resultado = v_fila.target::numeric
     and cardinality(v_hojas) = cardinality(v_fila.numeros)
     and v_hojas @> v_fila.numeros
     and v_fila.numeros @> v_hojas then
    v_resolvio := true;
    v_bonus := case when now() - v_fila.creado_at <= interval '10 seconds' then 1 else 0 end;
    v_payout := case when v_bonus = 1 then 200 else 125 end;
    update public.profiles set puntos_total = puntos_total + v_payout where id = v_user;
  end if;

  update public.trastienda_calcu
  set estado = case when v_resolvio then 'ganado' else 'perdido' end, resuelto_at = now()
  where id = p_calcu_id;

  update public.trastienda_minijuegos
  set salida = v_payout,
      resultado = jsonb_build_object('ganaste', v_resolvio, 'bonus', v_bonus = 1, 'expresion', p_expresion)
  where id = v_fila.minijuego_id;

  return query select v_resolvio, v_payout, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.resolver_la_calcu(uuid, jsonb) to authenticated;

-- ---------- 4) RPC Acertijos ----------
-- Dificultad por racha (spec: 3 seguidas suben a media; más racha → difícil).
create or replace function public.iniciar_acertijos()
returns table (
  acertijo_id uuid,
  secuencia integer[],
  dificultad text,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_racha integer := 0;
  v_dificultad text;
  v_len integer;
  v_secuencia integer[];
  v_minijuego_id uuid;
  v_ultimo boolean;
  v_usados boolean[];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 100 then
    raise exception 'te faltan Chispas para los acertijos';
  end if;

  -- Racha de victorias consecutivas en acertijos.
  for v_ultimo in
    select m.salida > 0
    from public.trastienda_minijuegos m
    where m.user_id = v_user and m.juego = 'acertijos'
    order by m.creado_at desc
    limit 20
  loop
    if v_ultimo then
      v_racha := v_racha + 1;
    else
      exit;
    end if;
  end loop;

  v_dificultad := case
    when v_racha >= 6 then 'dificil'
    when v_racha >= 3 then 'media'
    else 'facil'
  end;
  v_len := case v_dificultad when 'facil' then 4 when 'media' then 5 else 6 end;

  -- Secuencia de símbolos (1-8) TODOS distintos (un patrón bien legible).
  v_secuencia := array[]::integer[];
  v_usados := array_fill(false, array[8]);
  while cardinality(v_secuencia) < v_len loop
    declare
      v_sym integer := 1 + floor(random() * 8)::int;
    begin
      if not v_usados[v_sym] then
        v_secuencia := v_secuencia || v_sym;
        v_usados[v_sym] := true;
      end if;
    end;
  end loop;

  update public.profiles set puntos_total = puntos_total - 100 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'acertijos', 100)
  returning id into v_minijuego_id;

  insert into public.trastienda_acertijos (user_id, minijuego_id, secuencia, dificultad)
  values (v_user, v_minijuego_id, v_secuencia, v_dificultad);

  return query select
    a.id,
    v_secuencia,
    v_dificultad,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user)
  from public.trastienda_acertijos a
  where a.user_id = v_user and a.minijuego_id = v_minijuego_id;
end;
$$;

grant execute on function public.iniciar_acertijos() to authenticated;

create or replace function public.responder_acertijos(p_acertijo_id uuid, p_secuencia integer[])
returns table (
  ganaste boolean,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fila public.trastienda_acertijos%rowtype;
  v_payout integer := 0;
  v_ganado boolean := false;
  v_ok boolean;
  v_racha integer;
  v_ultimo boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_fila
  from public.trastienda_acertijos
  where id = p_acertijo_id and user_id = v_user;

  if not found or v_fila.estado <> 'jugando' then
    raise exception 'ese acertijo ya terminó';
  end if;

  if now() - v_fila.creado_at > interval '30 seconds' then
    update public.trastienda_acertijos
    set estado = 'perdido', resuelto_at = now()
    where id = p_acertijo_id;
    update public.trastienda_minijuegos
    set salida = 0, resultado = jsonb_build_object('ganaste', false, 'tiempo_agotado', true)
    where id = v_fila.minijuego_id;
    return query select false, 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
    return;
  end if;

  v_ok := cardinality(p_secuencia) = cardinality(v_fila.secuencia)
      and p_secuencia @> v_fila.secuencia
      and v_fila.secuencia @> p_secuencia;

  if v_ok then
    v_ganado := true;
    v_payout := case v_fila.dificultad
      when 'facil' then 60
      when 'media' then 100
      else 170
    end;
    update public.profiles set puntos_total = puntos_total + v_payout where id = v_user;
  end if;

  update public.trastienda_acertijos
  set estado = case when v_ganado then 'ganado' else 'perdido' end, resuelto_at = now()
  where id = p_acertijo_id;

  -- Racha previa: victorias consecutivas hasta la última derrota (mismo
  -- criterio que iniciar_acertijos para asignar dificultad).
  v_racha := 0;
  for v_ultimo in
    select (m.salida > 0)
    from public.trastienda_minijuegos m
    where m.user_id = v_user and m.juego = 'acertijos'
      and m.id <> v_fila.minijuego_id
    order by m.creado_at desc
    limit 20
  loop
    if v_ultimo then
      v_racha := v_racha + 1;
    else
      exit;
    end if;
  end loop;
  if v_ganado then v_racha := v_racha + 1; else v_racha := 0; end if;

  update public.trastienda_minijuegos
  set salida = v_payout,
      racha_actual = v_racha,
      mejor_racha = greatest(mejor_racha, v_racha),
      resultado = jsonb_build_object('ganaste', v_ganado, 'dificultad', v_fila.dificultad, 'secuencia', p_secuencia)
  where id = v_fila.minijuego_id;

  return query select v_ganado, v_payout, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.responder_acertijos(uuid, integer[]) to authenticated;

-- ---------- 5) RPC El Reloj ----------
create or replace function public.iniciar_el_reloj()
returns table (
  reloj_id uuid,
  problemas jsonb,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_i integer;
  v_a integer;
  v_b integer;
  v_op text;
  v_resp integer;
  v_problemas jsonb := '[]'::jsonb;
  v_minijuego_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 60 then
    raise exception 'te faltan Chispas para el reloj';
  end if;

  for v_i in 1..15 loop
    v_a := 10 + floor(random() * 90)::int;
    v_b := 10 + floor(random() * 90)::int;
    v_op := (array['suma', 'resta'])[1 + floor(random() * 2)::int];
    if v_op = 'resta' and v_a < v_b then
      v_a := v_a + v_b;
      v_b := v_a - v_b;
      v_a := v_a - v_b;
    end if;
    v_resp := case when v_op = 'suma' then v_a + v_b else v_a - v_b end;
    v_problemas := v_problemas || jsonb_build_object(
      'idx', v_i,
      'a', v_a,
      'b', v_b,
      'op', v_op,
      'resp', v_resp
    );
  end loop;

  update public.profiles set puntos_total = puntos_total - 60 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'el_reloj', 60)
  returning id into v_minijuego_id;

  insert into public.trastienda_reloj (user_id, minijuego_id, problemas)
  values (v_user, v_minijuego_id, v_problemas);

  -- El cliente ve los problemas SIN la respuesta.
  return query select
    r.id,
    (select jsonb_agg(jsonb_build_object('idx', (p->>'idx')::int, 'a', (p->>'a')::int, 'b', (p->>'b')::int, 'op', p->>'op'))
     from jsonb_array_elements(v_problemas) p),
    (select pr.puntos_total from public.profiles pr where pr.id = v_user)
  from public.trastienda_reloj r
  where r.user_id = v_user and r.minijuego_id = v_minijuego_id;
end;
$$;

grant execute on function public.iniciar_el_reloj() to authenticated;

create or replace function public.finalizar_el_reloj(p_reloj_id uuid, p_respuestas integer[])
returns table (
  correctas integer,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fila public.trastienda_reloj%rowtype;
  v_correctas integer := 0;
  v_payout integer := 0;
  v_esperada integer;
  v_i integer := 0;
  v_racha integer := 0;
  v_ultimo boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_fila
  from public.trastienda_reloj
  where id = p_reloj_id and user_id = v_user;

  if not found or v_fila.estado <> 'jugando' then
    raise exception 'esa sesión ya terminó';
  end if;

  -- Reloj total de 85s (spec: 75s de juego + margen).
  if now() - v_fila.creado_at > interval '85 seconds' then
    update public.trastienda_reloj set estado = 'terminado', resuelto_at = now() where id = p_reloj_id;
    update public.trastienda_minijuegos
    set salida = 0, resultado = jsonb_build_object('correctas', 0, 'tiempo_agotado', true)
    where id = v_fila.minijuego_id;
    return query select 0, 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
    return;
  end if;

  for v_esperada in
    select ((p.value->>'resp')::int)
    from jsonb_array_elements(v_fila.problemas) p
    order by (p.value->>'idx')::int
  loop
    v_i := v_i + 1;
    if v_i <= cardinality(p_respuestas) and p_respuestas[v_i] = v_esperada then
      v_correctas := v_correctas + 1;
    end if;
  end loop;

  if v_correctas >= 15 then v_payout := 160;
  elsif v_correctas >= 12 then v_payout := 95;
  elsif v_correctas >= 9 then v_payout := 55;
  else v_payout := 0;
  end if;

  if v_payout > 0 then
    update public.profiles set puntos_total = puntos_total + v_payout where id = v_user;
  end if;

  update public.trastienda_reloj set estado = 'terminado', resuelto_at = now() where id = p_reloj_id;

  -- Racha de relojes completos (15/15) consecutivos.
  for v_ultimo in
    select (m.salida > 0)
    from public.trastienda_minijuegos m
    where m.user_id = v_user and m.juego = 'el_reloj'
      and m.id <> v_fila.minijuego_id
    order by m.creado_at desc
    limit 20
  loop
    if v_ultimo then
      v_racha := v_racha + 1;
    else
      exit;
    end if;
  end loop;
  if v_correctas >= 15 then v_racha := v_racha + 1; else v_racha := 0; end if;

  update public.trastienda_minijuegos
  set salida = v_payout,
      racha_actual = v_racha,
      mejor_racha = greatest(mejor_racha, v_racha),
      resultado = jsonb_build_object('correctas', v_correctas, 'total', 15)
  where id = v_fila.minijuego_id;

  return query select v_correctas, v_payout, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.finalizar_el_reloj(uuid, integer[]) to authenticated;

-- ---------- 6) Historial: los 3 juegos entran solos vía trastienda_minijuegos ----------
-- (el union 'm' de fetch_trastienda_historial ya listaba todas las filas de
-- trastienda_minijuegos con su juego y salida; no hace falta tocarlo).

-- ---------- 7) Sin grants en las tablas de sesión ----------
-- trastienda_calcu / trastienda_acertijos / trastienda_reloj: sin RLS y sin
-- grants — el cliente solo las ve por RPC. (Si se habilitara RLS + policy de
-- select propio, el secreto de estas filas quedaría expuesto; por eso NO.)
-- ######### FIN: 0124_trastienda_minijuegos.sql #########

-- ######### INICIO: 0125_recalcular_niveles_mundo_y_saneo.sql #########
-- ============================================================
-- Prodigia — Recálculo de niveles de mundo + saneo de XP/Chispas
-- negativas + banner de afinidad del perfil.
--
-- CONTEXTO:
--   1) La curva de nivel de mundo cambió (0117/0120: 34% volumen,
--      45% dominio, 21% lecciones, umbral de volumen 25000). En
--      producción world_progress quedó con valores viejos (mundo en
--      nivel 1 con cientos de problemas resueltos). Esta migración
--      RECALCULA todos los perfiles × 8 mundos con la curva vigente.
--   2) xp_historico_total negativo (ej. -7157): imposible por código
--      legítimo — acreditar_chispas solo lo incrementa con p_monto>0
--      y exige auth. Solo puede venir de un exploit previo/datos
--      corruptos. Se sana al piso = XP real (suma de attempts +
--      logic_attempts), nunca por debajo de lo realmente ganado.
--   3) Chispas negativas también son corrupción: todo gasto
--      (comprar_item_tienda, doble o nada, volado, ruleta, pizarra)
--      chequea saldo server-side antes de restar.
--   4) Se agrega profiles.afinidad_banner (jsonb) + RPC
--      guardar_afinidad_banner para el banner editable del perfil
--      (cosmético, autodefincido, no afecta calibración ni economía).
--
-- PRINCIPIO: el nivel del mundo se DERIVA de la base (mismos insumos
-- que registrar_progreso_mundo). Nada de esto le da al cliente poder
-- de escritura directo sobre niveles.
-- ============================================================

-- ---------- 1) detalle_nivel_mundo: cálculo puro (no escribe) ----------
-- Reusa los mismos sub-temas/lecciones que 0117/0120. Exige p_user_id
-- explícito para poder recalcular en lote sin sesión autenticada.
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

  -- (b) dominio: promedio por sub-tema de clamp((nivel_i - 4)/6, 0, 1).
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
  else
    v_temas_totales := 1;
  end if;

  -- (c) lecciones de "Aprender" dominadas sobre el total del mundo.
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

-- Sin grant: helper interno (solo se llama desde definer/backend).

-- ---------- 2) recalcular_progreso_mundo: refresca world_progress ----------
-- Upsert de valores EXACTOS derivados (no acumulativos): el world_progress
-- queda coherente con la curva vigente aunque antes tuviera basura.
create or replace function public.recalcular_progreso_mundo(p_user_id uuid, p_world text)
returns table (world text, puntos_mundo integer, nivel_mundo integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_d record;
begin
  select * into v_d from public.detalle_nivel_mundo(p_user_id, p_world);
  insert into public.world_progress (user_id, world, puntos_mundo, nivel_mundo, updated_at)
  values (p_user_id, p_world, v_d.puntos_mundo, v_d.nivel_mundo, now())
  on conflict (user_id, world) do update
    set puntos_mundo = excluded.puntos_mundo,
        nivel_mundo = excluded.nivel_mundo,
        updated_at = now();
  return query select p_world, v_d.puntos_mundo, v_d.nivel_mundo;
end;
$$;

-- Sin grant: solo lo invoca el lote de abajo (y sincronizar_progreso_mundo).

-- ---------- 3) sincronizar_progreso_mundo: RPC para la UI ----------
-- El cliente entra a un mundo → recalcula su propio progreso y recibe el
-- detalle para dibujar nivel + barras + "cuánto falta para subir".
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
  if p_world not in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
    raise exception 'mundo desconocido';
  end if;
  perform public.recalcular_progreso_mundo(v_user, p_world);
  return query
    select d.puntos_mundo, d.nivel_mundo, d.frac_volumen, d.frac_dominio, d.frac_lecciones
    from public.detalle_nivel_mundo(v_user, p_world) d;
end;
$$;

grant execute on function public.sincronizar_progreso_mundo(text) to authenticated;

-- ---------- 4) Recálculo masivo: todos los perfiles × 8 mundos ----------
do $$
declare
  v_rec record;
  v_mundo text;
begin
  for v_rec in select id from public.profiles loop
    foreach v_mundo in array array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'] loop
      perform public.recalcular_progreso_mundo(v_rec.id, v_mundo);
    end loop;
  end loop;
end;
$$;

-- ---------- 5) Saneo de XP histórica negativa ----------
-- Piso = XP realmente ganado en la base (suma de attempts + logic_attempts).
-- Solo toca filas negativas; nunca baja a nadie con XP positivo.
update public.profiles pr
set xp_historico_total = (
  coalesce((select sum(a.xp) from public.attempts a where a.user_id = pr.id), 0)
  + coalesce((select sum(la.xp) from public.logic_attempts la where la.user_id = pr.id), 0)
)
where pr.xp_historico_total < 0;

-- ---------- 6) Saneo de Chispas negativas ----------
-- Todo gasto chequea saldo server-side; negativo = corrupción.
update public.profiles set puntos_total = 0 where puntos_total < 0;

-- ---------- 7) nivel_cuenta coherente (solo hacia arriba) ----------
-- Recalcula el nivel de cuenta según la curva de 0118 SIN bajarlo nunca:
-- los perfiles sanados en (5) quedan con el nivel que les corresponde a
-- su XP real; los legítimos no se tocan.
update public.profiles pr
set nivel_cuenta = greatest(pr.nivel_cuenta, public.nivel_desde_xp_cuenta(pr.xp_historico_total));

-- ---------- 8) Banner de afinidad del perfil ----------
-- jsonb: [{ ref, nombre, nivel }]. Cosmético: el usuario publica su propio
-- nivel de mundo / habilidad. El server valida forma y tamaños; no hay
-- lectura derivada de esto (no afecta calibración ni economía).
alter table public.profiles
  add column if not exists afinidad_banner jsonb not null default '[]'::jsonb;

create or replace function public.guardar_afinidad_banner(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_arr jsonb := coalesce(p_items, '[]'::jsonb);
  v_item record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if v_arr is null or jsonb_typeof(v_arr) <> 'array' then
    raise exception 'formato invalido';
  end if;
  if jsonb_array_length(v_arr) > 24 then
    raise exception 'demasiados items';
  end if;
  for v_item in select value as v from jsonb_array_elements(v_arr) loop
    if jsonb_typeof(v_item.v) <> 'object'
       or v_item.v->>'ref' is null or btrim(v_item.v->>'ref') = ''
       or v_item.v->>'nombre' is null or btrim(v_item.v->>'nombre') = ''
       or length(v_item.v->>'nombre') > 60
       or (v_item.v->>'nivel')::int < 1 or (v_item.v->>'nivel')::int > 100
    then
      raise exception 'item invalido';
    end if;
  end loop;
  update public.profiles set afinidad_banner = v_arr where id = v_user;
  return v_arr;
end;
$$;

grant execute on function public.guardar_afinidad_banner(jsonb) to authenticated;

-- ---------- 9) Recargar esquema PostgREST ----------
notify pgrst, 'reload schema';
-- ######### FIN: 0125_recalcular_niveles_mundo_y_saneo.sql #########

-- ######### INICIO: 0126_trastienda_limpieza.sql #########
-- 0126: Trastienda — limpieza, cuentas de prueba y español normalizado.
-- Sigue a 0125_recalcular_niveles_mundo_y_saneo.sql.
--
-- Tareas del backlog de la Trastienda resueltas acá:
--   1. Cuentas de prueba (QA tester, QA tester2, …) se marcan con
--      profiles.es_cuenta_prueba y se excluyen de TODOS los rankings
--      públicos, del ranking semanal historizable y del feed de mesas de
--      apuestas (fetch_apuestas_disponibles). 0119 no podía distinguirlas
--      (no existía una columna es_qa) y quedaban documentadas en el audit
--      como contaminación de datos de test.
--      Criterio de marcado: display_name que comienza en 'QA' (ilike 'qa%'),
--      que es el patrón de las cuentas de prueba. Es reversible a mano:
--      `update profiles set es_cuenta_prueba = false where id = '<id>';`
--   2. El Oráculo deja de calcular su ventana del lado del cliente: nueva
--      RPC ventana_predicciones() usa la MISMA fuente que el POST
--      (current_date del server) — evita la zona horaria del cliente.
--   3. Se ELIMINAN Acertijos de Enigmia y El Reloj del Sótano (decisión de
--      producto, 2026-09-09): tablas trastienda_acertijos/trastienda_reloj
--      y sus RPCs. La Calcu permanece.
--   4. Español normalizado (sin rioplatense) en los mensajes de negocio
--      que la Trastienda expone al cliente: se recrean girar_ruleta,
--      apostar_partida, apostar_prediccion_ranking, iniciar_la_pizarra y
--      apostar_doble_o_nada únicamente cambiando los mensajes rioplatenses
--      ('volvé', 'tenés', 'superás', 'tenes', 'jugá') por formas neutras.
--
-- Orden de aplicación recomendado: 0123 (completa) → 0124 → 0125 → 0126.
-- Idempotente salvo por el drop único de acertijos/reloj.

-- ---------- 1) Marca de cuentas de prueba ----------
alter table public.profiles add column if not exists es_cuenta_prueba boolean not null default false;

update public.profiles set es_cuenta_prueba = true
where display_name ilike 'qa%';

-- ---------- 2) Feed de mesas de apuestas: sin cuentas de prueba ----------
create or replace function public.fetch_apuestas_disponibles()
returns table (
  partida_id uuid,
  tipo text,
  estado text,
  operation_type text,
  jugador_a_id uuid,
  jugador_b_id uuid,
  nombre_a text,
  nombre_b text,
  elo_a integer,
  elo_b integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    d.id as partida_id,
    'duelo'::text as tipo,
    d.estado,
    d.operation_type,
    d.retador_id as jugador_a_id,
    d.retado_id as jugador_b_id,
    pa.display_name as nombre_a,
    pb.display_name as nombre_b,
    pa.elo_rating as elo_a,
    pb.elo_rating as elo_b
  from public.duels d
  join public.profiles pa on pa.id = d.retador_id
  join public.profiles pb on pb.id = d.retado_id
  where d.estado in ('pendiente', 'en_curso')
    and auth.uid() not in (d.retador_id, d.retado_id)
    and not pa.es_cuenta_prueba
    and not pb.es_cuenta_prueba
    and not exists (
      select 1 from public.trastienda_apuestas a
      where a.user_id = auth.uid() and a.partida_id = d.id
    )
  order by d.creado_at desc
  limit 20;
$$;

grant execute on function public.fetch_apuestas_disponibles() to authenticated;

-- ---------- 3) Rankings públicos: excluyen cuentas de prueba ----------

-- ranking_elo_global (persistente ELO competitivo, definido en 0119).
create or replace function public.ranking_elo_global(p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  elo_rating integer,
  avatar_url text,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text
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

  return query
    select p.id, p.display_name, p.elo_rating, p.avatar_url, p.titulo_activo,
      public.titulo_nombre_de(p.id), p.fuente_nombre
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
      and not p.es_bot
      and not p.es_cuenta_prueba
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
    order by p.elo_rating desc
    limit 100;
end;
$$;

grant execute on function public.ranking_elo_global(boolean) to authenticated;

-- ranking_semanal_filtrado (por mundo, definido en 0119).
create or replace function public.ranking_semanal_filtrado(p_mundo text default null, p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text
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
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
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
          else coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra')
          ), 0)
        end)::bigint as xp,
        p.avatar_url as av,
        p.elo_rating as elo,
        p.titulo_activo as ta,
        p.fuente_nombre as fn
      from public.profiles p
      join auth.users u on u.id = p.id
      where coalesce(u.is_anonymous, false) = false
        and not p.es_bot
        and not p.es_cuenta_prueba
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
    select d.uid, d.dn, d.xp, d.av, d.elo, d.ta, public.titulo_nombre_de(d.uid), d.fn
    from datos d
    where d.xp > 0
    order by d.xp desc;
end;
$$;

grant execute on function public.ranking_semanal_filtrado(text, boolean) to authenticated;

-- ranking_semanal (sin mundo, definido en 0119 con guard de autenticación).
drop function if exists public.ranking_semanal();

create function public.ranking_semanal()
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(sum(dp.xp_ganado), 0) as xp_semana,
    p.avatar_url,
    p.elo_rating,
    p.titulo_activo,
    public.titulo_nombre_de(p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  where coalesce(u.is_anonymous, false) = false
    and not p.es_bot
    and not p.es_cuenta_prueba
    and p.display_name is not null
    and btrim(p.display_name) <> ''
    and u.email_confirmed_at is not null
    and auth.uid() is not null
  group by p.id, p.display_name, p.avatar_url, p.elo_rating, p.titulo_activo
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

revoke execute on function public.ranking_semanal() from public, anon;
grant execute on function public.ranking_semanal() to authenticated;

-- posicion_ranking_puntos (para /perfil).
create or replace function public.posicion_ranking_puntos()
returns table (posicion bigint, total_jugadores bigint)
language sql
security definer
set search_path = public
as $$
  with reales as (
    select p.id, p.puntos_total, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
      and not p.es_bot
      and not p.es_cuenta_prueba
      and p.display_name is not null
      and btrim(p.display_name) <> ''
      and u.email_confirmed_at is not null
  ),
  ranking as (
    select id, row_number() over (order by puntos_total desc, created_at asc) as posicion
    from reales
  )
  select r.posicion, (select count(*) from reales) as total_jugadores
  from ranking r
  where r.id = auth.uid();
$$;

grant execute on function public.posicion_ranking_puntos() to authenticated;

-- ranking_semanal_de_semana (histórico, define la posición real del Oráculo).
create or replace function public.ranking_semanal_de_semana(p_semana date)
returns table (
  user_id uuid,
  posicion bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id as user_id,
         row_number() over (order by coalesce(sum(dp.xp_ganado), 0) desc, p.id) as posicion
  from public.profiles p
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= p_semana
    and dp.fecha < p_semana + 7
  where not p.es_cuenta_prueba
  group by p.id
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by posicion;
$$;

grant execute on function public.ranking_semanal_de_semana(date) to authenticated;

-- ---------- 4) Oráculo: ventana autoritativa del server ----------
-- La ventana de apuesta es lunes..miércoles usando current_date del server
-- (la misma de apostar_prediccion_ranking). El cliente ya no la calcula con
-- su reloj local — evita el desfase de zona horaria que cerraba/abría la
-- ventana en el momento equivocado.
create or replace function public.ventana_predicciones()
returns table (
  semana date,
  ventana_abierta boolean,
  hora_server timestamptz
)
language sql
stable
set search_path = public
as $$
  select
    date_trunc('week', current_date)::date as semana,
    current_date <= date_trunc('week', current_date)::date + 2 as ventana_abierta,
    now() as hora_server;
$$;

grant execute on function public.ventana_predicciones() to authenticated;

-- ---------- 5) Se eliminan Acertijos de Enigmia y El Reloj del Sótano ----------
drop function if exists public.iniciar_acertijos();
drop function if exists public.responder_acertijos(uuid, integer[]);
drop table if exists public.trastienda_acertijos cascade;

drop function if exists public.iniciar_el_reloj();
drop function if exists public.finalizar_el_reloj(uuid, integer[]);
drop table if exists public.trastienda_reloj cascade;

-- ---------- 6) Español normalizado en los mensajes de negocio ----------
-- Se cumplen las mismas garantías de 0121/0123 (security definer,
-- search_path public, transacciones atómicas, grants).

-- girar_ruleta (0123): 'volvé mañana' -> 'vuelve mañana'.
create or replace function public.girar_ruleta()
returns table (
  segmento text,
  premio_tipo text,
  premio_detalle jsonb,
  chispas_ganadas integer,
  puntos_total integer,
  giros_hoy integer,
  pity_activo boolean,
  costo_aplicado integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_giros_hoy integer;
  v_costo integer;
  v_pity_prev integer := 0;
  v_r numeric;
  v_segmento text;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_chispas integer := 0;
  v_pity_new integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido text;
  v_titulo_slug text;
  v_titulo_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_giros_hoy
  from public.trastienda_ruleta
  where user_id = v_user and fecha = current_date;

  if v_giros_hoy >= 5 then
    raise exception 'ya giraste las 5 veces de hoy — vuelve mañana';
  end if;

  v_costo := case when v_giros_hoy = 0 then 120 else 150 end;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas para girar';
  end if;

  select coalesce(r.pity_counter, 0) into v_pity_prev
  from public.trastienda_ruleta r
  where r.user_id = v_user
  order by r.creado_at desc
  limit 1;

  if v_pity_prev >= 3 then
    v_segmento := (array['chispas_25', 'chispas_50', 'escudo'])[1 + floor(random() * 3)::int];
  else
    v_r := random() * 100;
    if v_r < 5 then
      v_segmento := 'boost';
    elsif v_r < 13 then
      v_segmento := 'escudo';
    elsif v_r < 19 then
      v_segmento := 'congelamiento';
    elsif v_r < 31 then
      v_segmento := 'chispas_50';
    elsif v_r < 51 then
      v_segmento := 'chispas_25';
    elsif v_r < 54 then
      v_segmento := 'chispas_100';
    elsif v_r < 56 then
      v_segmento := 'fuente';
    elsif v_r < 57.5 then
      v_segmento := 'marco';
    elsif v_r < 58 then
      v_segmento := 'titulo';
    else
      v_segmento := 'nada';
    end if;
  end if;

  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  if v_segmento = 'boost' then
    update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'boost');
  elsif v_segmento = 'escudo' then
    update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'escudo');
  elsif v_segmento = 'congelamiento' then
    update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'congelamiento');
  elsif v_segmento = 'titulo' then
    select t.slug into v_titulo_slug
    from public.titulos_trastienda_base() t
    where t.slug not in (
      select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
    )
    order by random()
    limit 1;
    if v_titulo_slug is null then
      v_chispas := 200;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
      perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
      v_premio_tipo := 'titulo';
      v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
    end if;
  elsif v_segmento in ('chispas_25', 'chispas_50', 'chispas_100') then
    v_chispas := (string_to_array(v_segmento, '_'))[2]::int;
    update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
    v_premio_tipo := 'chispas';
    v_premio_detalle := jsonb_build_object('chispas', v_chispas);
  elsif v_segmento = 'fuente' then
    select coalesce(array_agg(f), array[]::text[]) into v_disponibles
    from unnest(v_fuentes) t(f)
    where not (
      f = any (coalesce((select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 200;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'fuente';
      v_premio_detalle := jsonb_build_object('fuente', v_elegido);
    end if;
  elsif v_segmento = 'marco' then
    select coalesce(array_agg(m), array[]::text[]) into v_disponibles
    from unnest(v_marcos) t(m)
    where not (
      m = any (coalesce((select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 300;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'marco';
      v_premio_detalle := jsonb_build_object('marco', v_elegido);
    end if;
  end if;

  v_pity_new := case when v_segmento = 'nada' then v_pity_prev + 1 else 0 end;

  insert into public.trastienda_ruleta
    (user_id, segmento, premio_tipo, premio_detalle, giro_numero, pity_counter, costo_aplicado)
  values
    (v_user, v_segmento, v_premio_tipo, v_premio_detalle, v_giros_hoy + 1, v_pity_new, v_costo);

  return query select
    v_segmento,
    v_premio_tipo,
    v_premio_detalle,
    v_chispas,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_giros_hoy + 1,
    v_pity_new >= 3,
    v_costo;
end;
$$;

grant execute on function public.girar_ruleta() to authenticated;

-- apostar_partida (0123): 'volvé mañana' y 'superás' -> formas neutras.
create or replace function public.apostar_partida(p_partida_id uuid, p_eleccion text, p_monto integer)
returns table (
  apuesta_id uuid,
  multiplier numeric,
  ganancia_potencial integer,
  puntos_total integer,
  apuestas_hoy integer,
  monto_apostado_hoy integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duelo public.duels%rowtype;
  v_elo_a integer;
  v_elo_b integer;
  v_mult numeric;
  v_saldo integer;
  v_apuestas_hoy integer := 0;
  v_monto_hoy integer := 0;
  v_perdida_hoy integer := 0;
  v_fila_limite public.trastienda_limites_diarios%rowtype;
  v_apuesta_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_eleccion not in ('a', 'b', 'empate') then
    raise exception 'eleccion invalida';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  select * into v_duelo from public.duels where id = p_partida_id;
  if not found then
    raise exception 'esa partida no existe';
  end if;
  if v_duelo.estado not in ('pendiente', 'en_curso') then
    raise exception 'esa partida ya cerró';
  end if;
  if v_user in (v_duelo.retador_id, v_duelo.retado_id) then
    raise exception 'no se puede apostar a una partida propia';
  end if;
  if exists (
    select 1 from public.trastienda_apuestas
    where user_id = v_user and partida_id = p_partida_id
  ) then
    raise exception 'ya apostaste a esa partida';
  end if;

  select * into v_fila_limite
  from public.trastienda_limites_diarios
  where user_id = v_user;
  if found and v_fila_limite.fecha = current_date then
    v_apuestas_hoy := v_fila_limite.apuestas_realizadas;
    v_monto_hoy := v_fila_limite.monto_total_apostado;
    v_perdida_hoy := v_fila_limite.perdida_total;
  end if;

  if v_apuestas_hoy >= 10 then
    raise exception 'ya apostaste las 10 veces de hoy — vuelve mañana';
  end if;
  if v_monto_hoy + p_monto > 500 then
    raise exception 'superas el tope diario de 500 Chispas apostadas';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  select elo_rating into v_elo_a from public.profiles where id = v_duelo.retador_id;
  select elo_rating into v_elo_b from public.profiles where id = v_duelo.retado_id;
  v_mult := public.multiplier_apuesta_partida(v_elo_a, v_elo_b, p_eleccion);

  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

  insert into public.trastienda_apuestas
    (user_id, partida_id, partida_tipo, jugador_a_id, jugador_b_id, eleccion, monto, multiplier, ganancia_potencial)
  values
    (v_user, p_partida_id, 'duelo', v_duelo.retador_id, v_duelo.retado_id,
     p_eleccion, p_monto, v_mult, floor(p_monto * v_mult)::int)
  returning id into v_apuesta_id;

  insert into public.trastienda_limites_diarios
    (user_id, fecha, apuestas_realizadas, monto_total_apostado, perdida_total)
  values (v_user, current_date, v_apuestas_hoy + 1, v_monto_hoy + p_monto, v_perdida_hoy)
  on conflict (user_id) do update set
    fecha = current_date,
    apuestas_realizadas = public.trastienda_limites_diarios.apuestas_realizadas + 1,
    monto_total_apostado = public.trastienda_limites_diarios.monto_total_apostado + p_monto;

  return query select
    v_apuesta_id,
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_apuestas_hoy + 1,
    v_monto_hoy + p_monto;
end;
$$;

grant execute on function public.apostar_partida(uuid, text, integer) to authenticated;

-- apostar_prediccion_ranking (0123): 'tenés' -> 'tienes'.
create or replace function public.apostar_prediccion_ranking(p_puesto text, p_monto integer)
returns table (
  prediccion_id uuid,
  semana_inicio date,
  multiplier numeric,
  ganancia_potencial integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_semana date := date_trunc('week', current_date)::date;
  v_mult numeric;
  v_saldo integer;
  v_existe boolean;
  v_prediccion_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  v_mult := public.multiplier_prediccion(p_puesto);
  if v_mult is null then
    raise exception 'puesto invalido';
  end if;

  perform public.resolver_prediccion_ranking(v_semana - 7);

  if current_date > v_semana + 2 then
    raise exception 'ya cerró la ventana de apuesta de esta semana — la próxima abre el lunes';
  end if;

  select exists(
    select 1 from public.trastienda_predicciones_ranking
    where user_id = v_user and semana_inicio = v_semana
  ) into v_existe;
  if v_existe then
    raise exception 'ya tienes una predicción para esta semana (una por semana)';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa predicción';
  end if;

  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

  insert into public.trastienda_predicciones_ranking
    (user_id, semana_inicio, puesto_predicho, monto, multiplier, ganancia_potencial)
  values
    (v_user, v_semana, p_puesto, p_monto, v_mult, floor(p_monto * v_mult)::int)
  returning id into v_prediccion_id;

  return query select
    v_prediccion_id,
    v_semana,
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.apostar_prediccion_ranking(text, integer) to authenticated;

-- iniciar_la_pizarra (0121): 'volvé mañana' -> 'vuelve mañana'.
create or replace function public.iniciar_la_pizarra()
returns table (
  pizarra_id uuid,
  entrada integer,
  partidas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_del_dia uuid;
  v_partidas_hoy integer;
  v_numero integer;
  v_minijuego_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_partidas_hoy
  from public.trastienda_pizarra where user_id = v_user and fecha = current_date;

  if v_partidas_hoy >= 3 then
    raise exception 'ya jugaste las 3 partidas de hoy — vuelve mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 30 then
    raise exception 'te faltan Chispas para entrar a la pizarra';
  end if;

  update public.trastienda_pizarra
  set estado = 'perdido', resuelto_at = now()
  where user_id = v_user and estado = 'jugando';

  v_numero := 1 + floor(random() * 100)::int;

  update public.profiles set puntos_total = puntos_total - 30 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_pizarra', 30)
  returning id into v_minijuego_id;

  insert into public.trastienda_pizarra (user_id, minijuego_id, secreto)
  values (v_user, v_minijuego_id, v_numero)
  returning id into v_del_dia;

  return query select
    v_del_dia,
    30,
    v_partidas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.iniciar_la_pizarra() to authenticated;

-- apostar_doble_o_nada (0121): 'tenes' y 'jugá' -> formas neutras.
create or replace function public.apostar_doble_o_nada(p_monto integer)
returns table (umbral numeric, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuesta_previa integer;
  v_total_simple bigint := 0;
  v_correctos_simple bigint := 0;
  v_duelos bigint := 0;
  v_actividad bigint;
  v_umbral numeric;
  v_apuesta_maxima constant integer := 200;
  v_tiene_logic boolean;
  v_tiene_duelos boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto <= 0 then
    raise exception 'monto invalido';
  end if;
  if p_monto > v_apuesta_maxima then
    raise exception 'la apuesta máxima es % Chispas', v_apuesta_maxima;
  end if;

  select pr.puntos_total, pr.apuesta_monto into v_saldo, v_apuesta_previa
  from public.profiles pr where pr.id = v_user;

  if v_apuesta_previa > 0 then
    raise exception 'ya tienes una apuesta activa';
  end if;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  select count(*), count(*) filter (where correct) into v_total_simple, v_correctos_simple
  from public.attempts where user_id = v_user;

  v_tiene_logic := to_regclass('public.logic_attempts') is not null;
  if v_tiene_logic then
    select v_total_simple + count(*), v_correctos_simple + count(*) filter (where correct)
      into v_total_simple, v_correctos_simple
    from public.logic_attempts where user_id = v_user;
  end if;

  v_tiene_duelos := to_regclass('public.duel_results') is not null;
  if v_tiene_duelos then
    select count(*) into v_duelos from public.duel_results where user_id = v_user;
  end if;

  v_actividad := v_total_simple + v_duelos * 10;

  if v_actividad < 20 then
    raise exception 'juega un poco más antes de poder apostar';
  end if;

  if v_total_simple >= 5 then
    v_umbral := v_correctos_simple::numeric / v_total_simple;
  elsif v_tiene_duelos and v_duelos > 0 then
    select avg(precision) into v_umbral from public.duel_results where user_id = v_user;
  else
    v_umbral := 0.7;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - p_monto,
      apuesta_monto = p_monto,
      apuesta_umbral = v_umbral
  where pr.id = v_user;

  return query select v_umbral, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.apostar_doble_o_nada(integer) to authenticated;

-- ---------- 7) Grants de tablas y recarga de PostgREST ----------
-- trastienda_acertijos/trastienda_reloj nunca tuvieron grants: los DROPs
-- de arriba no dejan réplicas. La recarga evita cache stale de PostgREST
-- tras recrear los RPCs (el "algo salió mal" de los juegos era, en parte,
-- cache sin recargar).
notify pgrst, 'reload schema';
-- ######### FIN: 0126_trastienda_limpieza.sql #########

-- ######### INICIO: 0127_trastienda_ruleta_casino.sql #########
-- 0127: Trastienda — la Ruleta del Trastiendista versión casa de apuestas.
--
-- Reemplaza la rueda de segmentos (0121/0123/0126) por una mesa estilo casino
-- sobre la tabla periódica COMPLETA (118 elementos). Server-authoritative:
-- el server elige el elemento ganador, valida la zona, cobra/debita Chispas y
-- paga con EV de casa controlado. Sin RLS directa de la tabla de apuestas.
--
-- Decisiones aprobadas por el PO (2026-09-09):
--   - Fichas con MÁS valor (se ganan muchas Chispas jugando): 100/250/500/1000.
--   - Los premios viejos de la rueda (boost, escudo, congelamiento, fuente,
--     marco, título) se CONSERVAN como ganancia rara: ~5% en cada apuesta
--     ganada, por encima de las Chispas (bono pequeño frente al multiplicador).
--   - Mesa COMPLETA (118 elementos), no la versión ligera.
--
-- Economía: el server elige un elemento entre los 118 (fair). Si cae dentro de
-- la zona apostada el jugador gana. Con n elementos en la zona:
--   payout_total = monto × (118/n) × 0.88   (EV de casa ≈ 0.92)
--   pago = round(payout_total); mínimo 1. Zonas grandes pagan poco, el
--   elemento individual paga alto (mult ≈ 104). Límite 20 apuestas/día.

-- ---------- 1) Catálogo completo de la tabla periódica ----------
-- Este catálogo es fuente de verdad del SERVER. El cliente espeja estos datos
-- en src/lib/trastienda/casino.ts (mismos 118 elementos, misma clasificación).
-- grupo NULL solo en el bloque f (Ce..Yb, Th..No); los casos La/Lu/Ac/Lr
-- pertenecen al grupo 3 junto a Sc/Y.
create table if not exists public.trastienda_casino_elementos (
  simbolo text primary key,
  numero integer not null unique check (numero between 1 and 118),
  nombre text not null,
  periodo integer not null check (periodo between 1 and 7),
  grupo integer check (grupo between 1 and 18),
  tipo text not null check (tipo in (
    'alcalino', 'alcalinoterreo', 'transicion', 'post_transicion',
    'metaloides', 'no_metal', 'halogeno', 'gas_noble',
    'lantanido', 'actinido'
  ))
);

insert into public.trastienda_casino_elementos (simbolo, numero, nombre, periodo, grupo, tipo) values
  ('H', 1, 'Hidrógeno', 1, 1, 'no_metal'),
  ('He', 2, 'Helio', 1, 18, 'gas_noble'),
  ('Li', 3, 'Litio', 2, 1, 'alcalino'),
  ('Be', 4, 'Berilio', 2, 2, 'alcalinoterreo'),
  ('B', 5, 'Boro', 2, 13, 'metaloides'),
  ('C', 6, 'Carbono', 2, 14, 'no_metal'),
  ('N', 7, 'Nitrógeno', 2, 15, 'no_metal'),
  ('O', 8, 'Oxígeno', 2, 16, 'no_metal'),
  ('F', 9, 'Flúor', 2, 17, 'halogeno'),
  ('Ne', 10, 'Neón', 2, 18, 'gas_noble'),
  ('Na', 11, 'Sodio', 3, 1, 'alcalino'),
  ('Mg', 12, 'Magnesio', 3, 2, 'alcalinoterreo'),
  ('Al', 13, 'Aluminio', 3, 13, 'post_transicion'),
  ('Si', 14, 'Silicio', 3, 14, 'metaloides'),
  ('P', 15, 'Fósforo', 3, 15, 'no_metal'),
  ('S', 16, 'Azufre', 3, 16, 'no_metal'),
  ('Cl', 17, 'Cloro', 3, 17, 'halogeno'),
  ('Ar', 18, 'Argón', 3, 18, 'gas_noble'),
  ('K', 19, 'Potasio', 4, 1, 'alcalino'),
  ('Ca', 20, 'Calcio', 4, 2, 'alcalinoterreo'),
  ('Sc', 21, 'Escandio', 4, 3, 'transicion'),
  ('Ti', 22, 'Titanio', 4, 4, 'transicion'),
  ('V', 23, 'Vanadio', 4, 5, 'transicion'),
  ('Cr', 24, 'Cromo', 4, 6, 'transicion'),
  ('Mn', 25, 'Manganeso', 4, 7, 'transicion'),
  ('Fe', 26, 'Hierro', 4, 8, 'transicion'),
  ('Co', 27, 'Cobalto', 4, 9, 'transicion'),
  ('Ni', 28, 'Níquel', 4, 10, 'transicion'),
  ('Cu', 29, 'Cobre', 4, 11, 'transicion'),
  ('Zn', 30, 'Zinc', 4, 12, 'transicion'),
  ('Ga', 31, 'Galio', 4, 13, 'post_transicion'),
  ('Ge', 32, 'Germanio', 4, 14, 'metaloides'),
  ('As', 33, 'Arsénico', 4, 15, 'metaloides'),
  ('Se', 34, 'Selenio', 4, 16, 'no_metal'),
  ('Br', 35, 'Bromo', 4, 17, 'halogeno'),
  ('Kr', 36, 'Criptón', 4, 18, 'gas_noble'),
  ('Rb', 37, 'Rubidio', 5, 1, 'alcalino'),
  ('Sr', 38, 'Estroncio', 5, 2, 'alcalinoterreo'),
  ('Y', 39, 'Itrio', 5, 3, 'transicion'),
  ('Zr', 40, 'Circonio', 5, 4, 'transicion'),
  ('Nb', 41, 'Niobio', 5, 5, 'transicion'),
  ('Mo', 42, 'Molibdeno', 5, 6, 'transicion'),
  ('Tc', 43, 'Tecnecio', 5, 7, 'transicion'),
  ('Ru', 44, 'Rutenio', 5, 8, 'transicion'),
  ('Rh', 45, 'Rodio', 5, 9, 'transicion'),
  ('Pd', 46, 'Paladio', 5, 10, 'transicion'),
  ('Ag', 47, 'Plata', 5, 11, 'transicion'),
  ('Cd', 48, 'Cadmio', 5, 12, 'transicion'),
  ('In', 49, 'Indio', 5, 13, 'post_transicion'),
  ('Sn', 50, 'Estaño', 5, 14, 'post_transicion'),
  ('Sb', 51, 'Antimonio', 5, 15, 'metaloides'),
  ('Te', 52, 'Teluro', 5, 16, 'metaloides'),
  ('I', 53, 'Yodo', 5, 17, 'halogeno'),
  ('Xe', 54, 'Xenón', 5, 18, 'gas_noble'),
  ('Cs', 55, 'Cesio', 6, 1, 'alcalino'),
  ('Ba', 56, 'Bario', 6, 2, 'alcalinoterreo'),
  ('La', 57, 'Lantano', 6, 3, 'lantanido'),
  ('Ce', 58, 'Cerio', 6, null, 'lantanido'),
  ('Pr', 59, 'Praseodimio', 6, null, 'lantanido'),
  ('Nd', 60, 'Neodimio', 6, null, 'lantanido'),
  ('Pm', 61, 'Prometio', 6, null, 'lantanido'),
  ('Sm', 62, 'Samario', 6, null, 'lantanido'),
  ('Eu', 63, 'Europio', 6, null, 'lantanido'),
  ('Gd', 64, 'Gadolinio', 6, null, 'lantanido'),
  ('Tb', 65, 'Terbio', 6, null, 'lantanido'),
  ('Dy', 66, 'Disprosio', 6, null, 'lantanido'),
  ('Ho', 67, 'Holmio', 6, null, 'lantanido'),
  ('Er', 68, 'Erbio', 6, null, 'lantanido'),
  ('Tm', 69, 'Tulio', 6, null, 'lantanido'),
  ('Yb', 70, 'Iterbio', 6, null, 'lantanido'),
  ('Lu', 71, 'Lutecio', 6, 3, 'lantanido'),
  ('Hf', 72, 'Hafnio', 6, 4, 'transicion'),
  ('Ta', 73, 'Tántalo', 6, 5, 'transicion'),
  ('W', 74, 'Wolframio', 6, 6, 'transicion'),
  ('Re', 75, 'Renio', 6, 7, 'transicion'),
  ('Os', 76, 'Osmio', 6, 8, 'transicion'),
  ('Ir', 77, 'Iridio', 6, 9, 'transicion'),
  ('Pt', 78, 'Platino', 6, 10, 'transicion'),
  ('Au', 79, 'Oro', 6, 11, 'transicion'),
  ('Hg', 80, 'Mercurio', 6, 12, 'transicion'),
  ('Tl', 81, 'Talio', 6, 13, 'post_transicion'),
  ('Pb', 82, 'Plomo', 6, 14, 'post_transicion'),
  ('Bi', 83, 'Bismuto', 6, 15, 'post_transicion'),
  ('Po', 84, 'Polonio', 6, 16, 'post_transicion'),
  ('At', 85, 'Ástato', 6, 17, 'halogeno'),
  ('Rn', 86, 'Radón', 6, 18, 'gas_noble'),
  ('Fr', 87, 'Francio', 7, 1, 'alcalino'),
  ('Ra', 88, 'Radio', 7, 2, 'alcalinoterreo'),
  ('Ac', 89, 'Actinio', 7, 3, 'actinido'),
  ('Th', 90, 'Torio', 7, null, 'actinido'),
  ('Pa', 91, 'Protactinio', 7, null, 'actinido'),
  ('U', 92, 'Uranio', 7, null, 'actinido'),
  ('Np', 93, 'Neptunio', 7, null, 'actinido'),
  ('Pu', 94, 'Plutonio', 7, null, 'actinido'),
  ('Am', 95, 'Americio', 7, null, 'actinido'),
  ('Cm', 96, 'Curio', 7, null, 'actinido'),
  ('Bk', 97, 'Berkelio', 7, null, 'actinido'),
  ('Cf', 98, 'Californio', 7, null, 'actinido'),
  ('Es', 99, 'Einstenio', 7, null, 'actinido'),
  ('Fm', 100, 'Fermio', 7, null, 'actinido'),
  ('Md', 101, 'Mendelevio', 7, null, 'actinido'),
  ('No', 102, 'Nobelio', 7, null, 'actinido'),
  ('Lr', 103, 'Laurencio', 7, 3, 'actinido'),
  ('Rf', 104, 'Rutherfordio', 7, 4, 'transicion'),
  ('Db', 105, 'Dubnio', 7, 5, 'transicion'),
  ('Sg', 106, 'Seaborgio', 7, 6, 'transicion'),
  ('Bh', 107, 'Bohrio', 7, 7, 'transicion'),
  ('Hs', 108, 'Hassio', 7, 8, 'transicion'),
  ('Mt', 109, 'Meitnerio', 7, 9, 'transicion'),
  ('Ds', 110, 'Darmstadtio', 7, 10, 'transicion'),
  ('Rg', 111, 'Roentgenio', 7, 11, 'transicion'),
  ('Cn', 112, 'Copernicio', 7, 12, 'transicion'),
  ('Nh', 113, 'Nihonio', 7, 13, 'post_transicion'),
  ('Fl', 114, 'Flerovio', 7, 14, 'post_transicion'),
  ('Mc', 115, 'Moscovio', 7, 15, 'post_transicion'),
  ('Lv', 116, 'Livermorio', 7, 16, 'post_transicion'),
  ('Ts', 117, 'Teneso', 7, 17, 'halogeno'),
  ('Og', 118, 'Oganesón', 7, 18, 'gas_noble');

-- ---------- 2) Tabla de apuestas (el log del casino) ----------
create table if not exists public.trastienda_casino (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  fecha date not null default current_date,
  zona text not null,
  apuesta_numero integer not null check (apuesta_numero between 1 and 20),
  monto integer not null,
  elegido text not null,             -- símbolo que el server eligió (fair sobre 118)
  ganaste boolean not null,
  pago integer not null default 0,   -- Chispas pagadas por la apuesta ganada
  premio_tipo text,
  premio_detalle jsonb,
  creado_at timestamptz not null default now(),
  constraint trastienda_casino_solo_propia check (user_id = auth.uid())
);

alter table public.trastienda_casino enable row level security;

create policy "trastienda_casino: lectura propia" on public.trastienda_casino
  for select using (auth.uid() = user_id);

-- ---------- 3) Miembros de una zona ----------
-- Devuelve los símbolos que pertenecen a la zona; valida la zona (raise si no).
-- NO se expone como RPC a clientes (el conteo en el cliente se espeja en TS).
-- Formas válidas: elemento:X | grupo:1..18 | grupo:transicion | periodo:1..7 |
-- tipo:<tipo> | paridad:par | paridad:impar.
create or replace function public.casino_elementos_en_zona(p_zona text)
returns table (simbolo text)
language plpgsql
stable
set search_path = public
as $$
declare
  v_valor text;
  v_num integer;
begin
  if p_zona is null then
    raise exception 'zona invalida';
  end if;

  v_valor := nullif(substring(p_zona from 'elemento:(.*)'), '');
  if v_valor is not null then
    return query select e.simbolo from public.trastienda_casino_elementos e
      where upper(e.simbolo) = upper(v_valor);
    return;
  end if;

  v_valor := nullif(substring(p_zona from 'grupo:([0-9]+)'), '');
  if v_valor is not null then
    v_num := v_valor::int;
    if v_num not between 1 and 18 then
      raise exception 'zona invalida';
    end if;
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.grupo = v_num;
    return;
  end if;

  if p_zona = 'grupo:transicion' then
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.tipo = 'transicion';
    return;
  end if;

  v_valor := nullif(substring(p_zona from 'periodo:([0-9]+)'), '');
  if v_valor is not null then
    v_num := v_valor::int;
    if v_num not between 1 and 7 then
      raise exception 'zona invalida';
    end if;
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.periodo = v_num;
    return;
  end if;

  v_valor := nullif(substring(p_zona from 'tipo:(.*)'), '');
  if v_valor is not null then
    if v_valor not in (
      'alcalino', 'alcalinoterreo', 'transicion', 'post_transicion',
      'metaloides', 'no_metal', 'halogeno', 'gas_noble',
      'lantanido', 'actinido'
    ) then
      raise exception 'zona invalida';
    end if;
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.tipo = v_valor;
    return;
  end if;

  if p_zona = 'paridad:par' then
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.numero % 2 = 0;
    return;
  end if;
  if p_zona = 'paridad:impar' then
    return query select e.simbolo from public.trastienda_casino_elementos e
      where e.numero % 2 = 1;
    return;
  end if;

  raise exception 'zona invalida';
end;
$$;

-- ---------- 4) La apuesta ----------
create or replace function public.apostar_casino_elementos(p_zona text, p_monto integer)
returns table (
  zona text,
  monto integer,
  elegido text,
  elegido_nombre text,
  ganaste boolean,
  multiplier numeric,
  chispas_ganadas integer,
  premio_tipo text,
  premio_detalle jsonb,
  apuestas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuestas_hoy integer;
  v_n integer;
  v_elegido text;
  v_elegido_nombre text;
  v_ganaste boolean := false;
  v_mult numeric := 0;
  v_pago integer := 0;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_premio_idx integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido_item text;
  v_titulo_slug text;
  v_titulo_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto not in (100, 250, 500, 1000) then
    raise exception 'monto de ficha invalido';
  end if;

  select count(*) into v_apuestas_hoy
  from public.trastienda_casino
  where user_id = v_user and fecha = current_date;

  if v_apuestas_hoy >= 20 then
    raise exception 'ya apostaste las 20 veces de hoy — vuelve mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa ficha';
  end if;

  select count(*) into v_n from public.casino_elementos_en_zona(p_zona);
  if v_n is null or v_n = 0 then
    raise exception 'zona invalida';
  end if;

  -- El croupier elige un elemento al azar entre los 118 (fair).
  select e.simbolo, e.nombre into v_elegido, v_elegido_nombre
  from public.trastienda_casino_elementos e
  order by random()
  limit 1;

  select exists (
    select 1 from public.casino_elementos_en_zona(p_zona) m where m.simbolo = v_elegido
  ) into v_ganaste;

  -- Se descuenta la ficha siempre.
  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

  if v_ganaste then
    -- payout_total = monto × (118/n) × 0.88 → EV de casa ≈ 0.92.
    v_mult := round((118.0 / v_n) * 0.88, 2);
    v_pago := greatest(round(p_monto * v_mult::numeric), 1);
    update public.profiles set puntos_total = puntos_total + v_pago where id = v_user;

    -- Ganancia rara (~5%): un premio de la rueda vieja, por ENCIMA de las Chispas.
    if random() < 0.05 then
      v_premio_idx := 1 + floor(random() * 6)::int;
      if v_premio_idx = 1 then
        update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'boost');
      elsif v_premio_idx = 2 then
        update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'escudo');
      elsif v_premio_idx = 3 then
        update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'congelamiento');
      elsif v_premio_idx = 4 then
        select coalesce(array_agg(f), array[]::text[]) into v_disponibles
        from unnest(v_fuentes) t(f)
        where not (f = any (coalesce(
          (select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user),
          array[]::text[]
        )));
        if cardinality(v_disponibles) = 0 then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 200, 'fallback', true);
          update public.profiles set puntos_total = puntos_total + 200 where id = v_user;
          v_pago := v_pago + 200;
        else
          v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
          update public.profiles
          set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido_item]
          where id = v_user;
          v_premio_tipo := 'fuente';
          v_premio_detalle := jsonb_build_object('fuente', v_elegido_item);
        end if;
      elsif v_premio_idx = 5 then
        select coalesce(array_agg(m), array[]::text[]) into v_disponibles
        from unnest(v_marcos) t(m)
        where not (m = any (coalesce(
          (select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user),
          array[]::text[]
        )));
        if cardinality(v_disponibles) = 0 then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 300, 'fallback', true);
          update public.profiles set puntos_total = puntos_total + 300 where id = v_user;
          v_pago := v_pago + 300;
        else
          v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
          update public.profiles
          set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido_item]
          where id = v_user;
          v_premio_tipo := 'marco';
          v_premio_detalle := jsonb_build_object('marco', v_elegido_item);
        end if;
      else
        -- título: de la base de Trastienda que el usuario todavía no tenga.
        select t.slug into v_titulo_slug
        from public.titulos_trastienda_base() t
        where t.slug not in (
          select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
        )
        order by random()
        limit 1;
        if v_titulo_slug is null then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 200, 'fallback', true);
          update public.profiles set puntos_total = puntos_total + 200 where id = v_user;
          v_pago := v_pago + 200;
        else
          v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
          perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
          v_premio_tipo := 'titulo';
          v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
        end if;
      end if;
    end if;
  end if;

  insert into public.trastienda_casino
    (user_id, zona, apuesta_numero, monto, elegido, ganaste, pago, premio_tipo, premio_detalle)
  values
    (v_user, p_zona, v_apuestas_hoy + 1, p_monto, v_elegido, v_ganaste, v_pago, v_premio_tipo, v_premio_detalle);

  return query select
    p_zona,
    p_monto,
    v_elegido,
    v_elegido_nombre,
    v_ganaste,
    v_mult,
    v_pago,
    v_premio_tipo,
    v_premio_detalle,
    v_apuestas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

-- ---------- 5) Historial reciente incluye el casino ----------
create or replace function public.fetch_trastienda_historial()
returns table (
  tipo text,
  titulo text,
  detalle jsonb,
  monto integer,
  creado_at timestamptz
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

  return query
    with r as (
      select 'ruleta'::text as tipo, r.segmento as titulo, r.premio_detalle as detalle,
        coalesce((r.premio_detalle->>'chispas')::integer, 0) as monto, r.creado_at
      from public.trastienda_ruleta r
      where r.user_id = v_user
    ),
    c as (
      select 'casino'::text as tipo, c.zona as titulo,
        jsonb_build_object('elegido', c.elegido, 'ganaste', c.ganaste) as detalle,
        c.pago as monto, c.creado_at
      from public.trastienda_casino c
      where c.user_id = v_user
    ),
    m as (
      select 'minijuego'::text as tipo, m.juego as titulo, m.resultado as detalle,
        m.salida as monto, m.creado_at
      from public.trastienda_minijuegos m
      where m.user_id = v_user
    ),
    p as (
      select 'pizarra'::text as tipo, 'la_pizarra'::text as titulo,
        jsonb_build_object('estado', p.estado, 'intentos', p.intentos) as detalle,
        case when p.estado = 'ganado'
          then case when p.intentos <= 3 then 170 when p.intentos <= 5 then 100 else 50 end
          else 0 end as monto,
        p.creado_at
      from public.trastienda_pizarra p
      where p.user_id = v_user
    )
    select * from r
    union all select * from c
    union all select * from m
    union all select * from p
    order by creado_at desc
    limit 8;
end;
$$;

-- ---------- 6) Grants ----------
grant execute on function public.apostar_casino_elementos(text, integer) to authenticated;
grant execute on function public.fetch_trastienda_historial() to authenticated;
grant select on public.trastienda_casino to authenticated;
-- public.trastienda_casino_elementos y casino_elementos_en_zona: sin grants
-- (el cliente espeja el catálogo en TS; el conteo se calcula allá).

notify pgrst, 'reload schema';
-- ######### FIN: 0127_trastienda_ruleta_casino.sql #########

-- ######### INICIO: 0128_espanol_neutro.sql #########
-- 0128: Español neutro latinoamericano — mensajes de negocio (RPC) sin voseo.
-- Sigue a 0127_trastienda_ruleta_casino.sql.
--
-- Recrea funciones que todavía exponían rioplatense en sus raise exception,
-- únicamente cambiando esos mensajes a formas neutras ('tenés'→'tienes',
-- 'podés'→'puedes', 'no sos'→'no eres', 'elegí'→'elige', 'probá'→'prueba',
-- 'salí'→'sal', 'a vos'→'a ti'). NINGÚN cambio de lógica; mismas firmas y
-- grants (se recrean con create or replace function).
--
-- Orden de aplicación recomendado: 0123 → 0124 → 0125 → 0126 → 0127 → 0128.
-- Idempotente.

---------- function public.reportar_usuario ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'no podes reportarte a vos mismo  →  'no puedes reportarte a ti mismo
--    'motivo invalido  →  'motivo invalido
create or replace function public.reportar_usuario(p_reportado_id uuid, p_motivo text, p_detalle text default null)
returns void
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
  if p_reportado_id = v_user then
    raise exception 'no puedes reportarte a ti mismo';
  end if;
  if p_motivo not in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'otro') then
    raise exception 'motivo invalido';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle)
  values (v_user, p_reportado_id, p_motivo, p_detalle);
end;
$$;
---------- function public.crear_problema_personalizado ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'la pregunta tiene que tener entre 3 y 200 caracteres  →  'la pregunta tiene que tener entre 3 y 200 caracteres
--    'la respuesta tiene que tener entre 1 y 100 caracteres  →  'la respuesta tiene que tener entre 1 y 100 caracteres
--    'todavia no desbloqueaste los problemas personalizados — llegá a nivel 10 en algún mundo  →  'todavia no desbloqueaste los problemas personalizados — llega a nivel 10 en algún mundo
--    'el problema contiene un término no permitido  →  'el problema contiene un término no permitido
--    'ya compartiste tu problema personalizado de hoy — probá mañana  →  'ya compartiste tu problema personalizado de hoy — prueba mañana
create or replace function public.crear_problema_personalizado(p_pregunta text, p_respuesta text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_nivel_maximo integer;
  v_creados_hoy integer;
  v_pregunta text := trim(p_pregunta);
  v_respuesta text := trim(p_respuesta);
  v_problema_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if char_length(v_pregunta) < 3 or char_length(v_pregunta) > 200 then
    raise exception 'la pregunta tiene que tener entre 3 y 200 caracteres';
  end if;
  if char_length(v_respuesta) < 1 or char_length(v_respuesta) > 100 then
    raise exception 'la respuesta tiene que tener entre 1 y 100 caracteres';
  end if;

  -- Desbloqueo: nivel 10 en al menos un mundo.
  select max(nivel_mundo) into v_nivel_maximo from public.world_progress where user_id = v_user;
  if coalesce(v_nivel_maximo, 0) < 10 then
    raise exception 'todavia no desbloqueaste los problemas personalizados — llega a nivel 10 en algún mundo';
  end if;

  -- Red de seguridad 1: filtro de palabras, pregunta Y respuesta.
  if public.contiene_termino_prohibido(v_pregunta) or public.contiene_termino_prohibido(v_respuesta) then
    raise exception 'el problema contiene un término no permitido';
  end if;

  -- Red de seguridad 3: máximo 1 por día por usuario (día calendario,
  -- no "últimas 24 horas" — más fácil de entender para quien lo mande).
  select count(*) into v_creados_hoy
  from public.problemas_personalizados
  where autor_id = v_user and created_at >= date_trunc('day', now());
  if v_creados_hoy >= 1 then
    raise exception 'ya compartiste tu problema personalizado de hoy — prueba mañana';
  end if;

  insert into public.problemas_personalizados (autor_id, pregunta, respuesta)
  values (v_user, v_pregunta, v_respuesta)
  returning id into v_problema_id;

  insert into public.feed_posts (user_id, tipo, problema_personalizado_id)
  values (v_user, 'desafio_personalizado', v_problema_id);

  return v_problema_id;
end;
$$;
---------- function public.reportar_post ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'motivo invalido  →  'motivo invalido
--    'post no encontrado  →  'post no encontrado
--    'no podes reportar tu propio contenido  →  'no puedes reportar tu propio contenido
create or replace function public.reportar_post(p_post_id uuid, p_motivo text, p_detalle text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_autor_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_motivo not in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'otro') then
    raise exception 'motivo invalido';
  end if;

  select user_id into v_autor_id from public.feed_posts where id = p_post_id;
  if v_autor_id is null then
    raise exception 'post no encontrado';
  end if;
  if v_autor_id = v_user then
    raise exception 'no puedes reportar tu propio contenido';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle, post_id)
  values (v_user, v_autor_id, p_motivo, p_detalle, p_post_id);
end;
$$;
---------- function public.unirse_invitacion_duelo ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'invitacion no encontrada  →  'invitacion no encontrada
--    'invitacion ya usada  →  'invitacion ya usada
--    'invitacion no disponible  →  'invitacion no disponible
--    'no podes unirte a tu propia invitacion  →  'no puedes unirte a tu propia invitacion
create or replace function public.unirse_invitacion_duelo(p_invite_id uuid)
returns table (duel_id uuid, mundo text, operation_type text, sub_tipo text, ya_unido boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_invite record;
  v_duel_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_invite from public.duel_invites where id = p_invite_id for update;
  if v_invite.id is null then
    raise exception 'invitacion no encontrada';
  end if;

  if v_invite.estado = 'usada' then
    -- Quien creó el duelo (o el propio invitado) recarga la página
    -- después de unirse — se le devuelve el mismo duelo en vez de
    -- fallar con un error confuso.
    if v_invite.duel_id is not null and (v_invite.creador_id = v_user or exists (
      select 1 from public.duels d where d.id = v_invite.duel_id and (d.retador_id = v_user or d.retado_id = v_user)
    )) then
      return query select v_invite.duel_id, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo, true;
      return;
    end if;
    raise exception 'invitacion ya usada';
  end if;

  if v_invite.estado <> 'esperando' then
    raise exception 'invitacion no disponible';
  end if;

  if v_invite.creador_id = v_user then
    raise exception 'no puedes unirte a tu propia invitacion';
  end if;

  insert into public.duels (retador_id, retado_id, semilla_problemas, mundo, operation_type, sub_tipo)
  values (v_invite.creador_id, v_user, floor(random() * 1000000000)::bigint, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo)
  returning id into v_duel_id;

  update public.duel_invites set estado = 'usada', duel_id = v_duel_id where id = p_invite_id;

  return query select v_duel_id, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo, false;
end;
$$;
---------- function public.crear_clan ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'ya estás en un clan — salí del actual antes de crear uno nuevo  →  'ya estás en un clan — sal del actual antes de crear uno nuevo
--    'el nombre del clan necesita al menos 3 caracteres  →  'el nombre del clan necesita al menos 3 caracteres
--    'te faltan Chispas: crear un clan cuesta % (tenés %)  →  'te faltan Chispas: crear un clan cuesta % (tienes %)
create or replace function public.crear_clan(p_nombre text, p_tag text, p_color text, p_descripcion text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_saldo integer;
  v_costo constant integer := 5000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — sal del actual antes de crear uno nuevo';
  end if;
  if length(trim(p_nombre)) < 3 then
    raise exception 'el nombre del clan necesita al menos 3 caracteres';
  end if;

  select puntos_total into v_saldo from public.profiles where id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas: crear un clan cuesta % (tienes %)', v_costo, v_saldo;
  end if;

  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  insert into public.clanes (nombre, descripcion, tipo, owner_id, tag, color_estandarte)
  values (trim(p_nombre), coalesce(nullif(trim(p_descripcion), ''), 'Sin descripción todavía.'), 'jugadores', v_user, nullif(trim(p_tag), ''), coalesce(p_color, '#6C4CF1'))
  returning id into v_id;

  insert into public.clan_membresias (clan_id, user_id, rol) values (v_id, v_user, 'fundador');

  return v_id;
end;
$$;
---------- function public.reportar_mensaje_clan ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'motivo invalido  →  'motivo invalido
--    'mensaje no encontrado  →  'mensaje no encontrado
--    'no sos miembro de este clan  →  'no eres miembro de este clan
--    'no podes reportar tu propio mensaje  →  'no puedes reportar tu propio mensaje
create or replace function public.reportar_mensaje_clan(p_mensaje_id uuid, p_motivo text, p_detalle text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_autor_id uuid;
  v_clan_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_motivo not in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'contenido_ofensivo', 'otro') then
    raise exception 'motivo invalido';
  end if;

  select autor_id, clan_id into v_autor_id, v_clan_id from public.clan_mensajes where id = p_mensaje_id;
  if v_autor_id is null then
    raise exception 'mensaje no encontrado';
  end if;
  if not exists (select 1 from public.clan_membresias where clan_id = v_clan_id and user_id = v_user) then
    raise exception 'no eres miembro de este clan';
  end if;
  if v_autor_id = v_user then
    raise exception 'no puedes reportar tu propio mensaje';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle, mensaje_clan_id)
  values (v_user, v_autor_id, p_motivo, p_detalle, p_mensaje_id);
end;
$$;
---------- function public.mensajes_de_clan ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'no sos miembro de este clan  →  'no eres miembro de este clan
create or replace function public.mensajes_de_clan(p_clan_id uuid, p_limite integer default 100)
returns table (id uuid, autor_id uuid, autor_nombre text, autor_avatar_url text, texto text, created_at timestamptz)
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
  if not exists (select 1 from public.clan_membresias where clan_id = p_clan_id and user_id = v_user) then
    raise exception 'no eres miembro de este clan';
  end if;

  return query
    select m.id, m.autor_id, p.display_name, p.avatar_url, m.texto, m.created_at
    from public.clan_mensajes m
    join public.profiles p on p.id = m.autor_id
    where m.clan_id = p_clan_id
    order by m.created_at desc
    limit least(coalesce(p_limite, 100), 100);
end;
$$;
---------- function public.desbloquear_mundo ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'mundo invalido  →  'mundo invalido
--    'ya tenés ese mundo desbloqueado  →  'ya tienes ese mundo desbloqueado
--    'te faltan Chispas — % cuesta % Chispas  →  'te faltan Chispas — % cuesta % Chispas
create or replace function public.desbloquear_mundo(p_mundo text)
returns table (puntos_total integer, mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_actuales text[];
  v_costo constant integer := 3000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
    raise exception 'mundo invalido';
  end if;

  select pr.puntos_total, pr.mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles pr where pr.id = v_user;

  if p_mundo = any(v_actuales) then
    raise exception 'ya tienes ese mundo desbloqueado';
  end if;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas — % cuesta % Chispas', p_mundo, v_costo;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - v_costo,
      mundos_desbloqueados = array_append(pr.mundos_desbloqueados, p_mundo)
  where pr.id = v_user;

  return query
    select pr.puntos_total, pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;
---------- function public.elegir_mundos_iniciales ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'elegí exactamente 2 mundos  →  'elige exactamente 2 mundos
--    'elegí 2 mundos distintos  →  'elige 2 mundos distintos
--    'mundo invalido  →  'mundo invalido
--    'ya elegiste tus mundos iniciales  →  'ya elegiste tus mundos iniciales
create or replace function public.elegir_mundos_iniciales(p_mundos text[])
returns table (mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actuales text[];
  v_validos constant text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_mundo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if cardinality(p_mundos) <> 2 then
    raise exception 'elige exactamente 2 mundos';
  end if;
  if p_mundos[1] = p_mundos[2] then
    raise exception 'elige 2 mundos distintos';
  end if;
  foreach v_mundo in array p_mundos loop
    if not (v_mundo = any(v_validos)) then
      raise exception 'mundo invalido';
    end if;
  end loop;

  select pr.mundos_desbloqueados into v_actuales from public.profiles pr where pr.id = v_user;

  -- >= 2 = ya pasó por el flujo de 2 mundos. 1 = estado heredado de la
  -- fase antigua (1 mundo gratis) → se reemplaza abajo con la elección.
  if cardinality(v_actuales) >= 2 then
    raise exception 'ya elegiste tus mundos iniciales';
  end if;

  update public.profiles as pr
  set mundos_desbloqueados = p_mundos
  where pr.id = v_user;

  return query
    select pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;
-- ######### FIN: 0128_espanol_neutro.sql #########

NOTIFY pgrst, 'reload schema';