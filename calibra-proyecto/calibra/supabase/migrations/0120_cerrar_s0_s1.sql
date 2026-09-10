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
drop policy "usuarios insertan sus propios intentos" on public.attempts;

drop policy "usuarios insertan sus propios intentos de logica" on public.logic_attempts;

drop policy "usuarios actualizan su propio nivel por operacion" on public.skill_levels;

drop policy "usuarios escriben su propio nivel de logica" on public.logic_skill_levels;

drop policy "usuarios actualizan su propio progreso diario" on public.daily_progress;

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