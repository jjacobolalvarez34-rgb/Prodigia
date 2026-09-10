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