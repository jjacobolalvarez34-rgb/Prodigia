-- ============================================================
-- Prodigia — Cierre cross-cutting de los mundos 11-13 (Estadística,
-- Naipia y Codia): las funciones que enumeran los mundos a mano
-- (elegir_mundos_iniciales, desbloquear_mundo, comprar_item_tienda, el
-- paquete de marcos, el banner de afinidad y las 3 funciones de
-- estadísticas Pro) pasan de 10 a 13.
-- Correr después de 0189_mundos_estadistica_naipia_codia.sql.
--
-- ⚠️ REGLA de docs/PARIDAD_MUNDOS.md, seguida acá al pie de la letra:
-- cada función se toma de su definición VIGENTE (la de la última
-- migración que la redefine, verificado con grep), nunca de una vieja:
--   - elegir_mundos_iniciales / desbloquear_mundo / comprar_item_tienda /
--     profiles_marco_perfil_check: 0168_diez_mundos.sql.
--   - guardar_afinidad_banner: 0144_banner_afinidad_ciudades_reales.sql.
--   - estadisticas_pro_perfil / estadisticas_pro_subtemas: 0187.
--   - estadisticas_pro_subtemas_grupo (docentes): 0169.
-- Alias `pr.` en TODA referencia a `profiles` dentro de
-- elegir_mundos_iniciales/desbloquear_mundo/comprar_item_tienda
-- (bug 42702 de columna ambigua, recurrente en este proyecto), incluido
-- el primer SELECT ... INTO.
--
-- No hace falta migración de "Explorador Total" (10 -> 13 mundos): el
-- título se calcula en src/lib/titulos/verificar.ts, no hay nada en SQL.
-- ============================================================

-- ---------- 1) elegir_mundos_iniciales (base real: 0168): + estadistica/naipia/codia ----------
create or replace function public.elegir_mundos_iniciales(p_mundos text[])
returns table (mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actuales text[];
  v_validos constant text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia'];
  v_mundo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if cardinality(p_mundos) <> 2 then
    raise exception 'elegí exactamente 2 mundos';
  end if;
  if p_mundos[1] = p_mundos[2] then
    raise exception 'elegí 2 mundos distintos';
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

grant execute on function public.elegir_mundos_iniciales(text[]) to authenticated;

-- ---------- 2) desbloquear_mundo (base real: 0168, cuerpo ya con alias pr.): + estadistica/naipia/codia ----------
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
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia') then
    raise exception 'mundo invalido';
  end if;

  select pr.puntos_total, pr.mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles pr where pr.id = v_user;

  if p_mundo = any(v_actuales) then
    raise exception 'ya tenés ese mundo desbloqueado';
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

grant execute on function public.desbloquear_mundo(text) to authenticated;

-- ---------- 3) profiles.marco_perfil: + estadistica/naipia/codia ----------
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (
    'ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio',
    'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia'
  ));

-- ---------- 4) comprar_item_tienda (base real: 0168): + marco_estadistica/naipia/codia + paquete a 13 mundos ----------
-- El paquete "Colección de Mundos" pasa de 18000 a 23400 Chispas (13 x 2400 =
-- 31200 sueltos, 25% de descuento, mismo criterio que 0107/0166/0168).
create or replace function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  fuentes_desbloqueadas text[],
  marcos_desbloqueados text[],
  animaciones_desbloqueadas text[],
  fondos_desbloqueados text[],
  hielos_disponibles smallint,
  tiempos_extra_disponibles smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_costo_base integer;
  v_mundo text;
  v_nivel_mundo integer;
  v_plan text;
  v_categoria text;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia'];
  v_items_pro constant text[] := array['animacion_prisma', 'fondo_prodigio'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_costo_base := case p_item
    when 'escudo' then 350
    when 'congelamiento' then 450
    when 'boost' then 600
    when 'hielo' then 300
    when 'tiempo_extra' then 250
    when 'fuente_mono' then 1000
    when 'fuente_serif' then 1400
    when 'fuente_manuscrita' then 5000
    when 'fuente_impacto' then 1200
    when 'fuente_script' then 1800
    when 'fuente_futurista' then 2500
    when 'fuente_urbana' then 1200
    when 'fuente_elegante' then 1800
    when 'marco_bronce' then 1000
    when 'marco_plata' then 1300
    when 'marco_oro' then 1700
    when 'marco_platino' then 2200
    when 'marco_diamante' then 3200
    when 'marco_prodigio' then 5000
    when 'marco_numeria' then 2400
    when 'marco_enigmia' then 2400
    when 'marco_geografia' then 2400
    when 'marco_quimia' then 2400
    when 'marco_anatomia' then 2400
    when 'marco_melodia' then 2400
    when 'marco_trigonometria' then 2400
    when 'marco_historia' then 2400
    when 'marco_calculia' then 2400
    when 'marco_circuitia' then 2400
    when 'marco_estadistica' then 2400
    when 'marco_naipia' then 2400
    when 'marco_codia' then 2400
    when 'paquete_marcos_mundo' then 23400
    when 'animacion_ondulante' then 1200
    when 'animacion_brillo' then 1400
    when 'animacion_arcoiris' then 1800
    when 'animacion_neon' then 2200
    when 'animacion_glitch' then 2000
    when 'animacion_glitch_intenso' then 2600
    when 'animacion_deconstruccion' then 2400
    when 'animacion_shuffle' then 2800
    when 'animacion_decrypted' then 2800
    when 'fondo_oceano' then 1600
    when 'fondo_bosque' then 1600
    when 'fondo_aurora' then 1600
    when 'fondo_dorado' then 1800
    when 'fondo_nebulosa' then 2000
    when 'fondo_personalizado' then 4000
    when 'color_nombre_personalizado' then 1800
    when 'animacion_prisma' then 3000
    when 'fondo_prodigio' then 3000
    else null
  end;

  if v_costo_base is null then
    raise exception 'item invalido';
  end if;
  if p_costo < ceil(v_costo_base * 0.5) then
    raise exception 'precio invalido';
  end if;

  if p_item = any(v_items_pro) then
    select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
    if v_plan is distinct from 'pro' then
      raise exception 'este cosmetico es exclusivo de Prodigia Pro';
    end if;
  end if;

  if p_item in ('marco_numeria', 'marco_enigmia', 'marco_geografia', 'marco_quimia', 'marco_anatomia', 'marco_melodia', 'marco_trigonometria', 'marco_historia', 'marco_calculia', 'marco_circuitia', 'marco_estadistica', 'marco_naipia', 'marco_codia') then
    v_mundo := replace(p_item, 'marco_', '');
    select w.nivel_mundo into v_nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = v_mundo;
    if coalesce(v_nivel_mundo, 0) < 40 then
      raise exception 'todavia no alcanzaste suficiente nivel en % para desbloquear este marco', v_mundo;
    end if;
  elsif p_item = 'paquete_marcos_mundo' then
    if exists (
      select 1 from unnest(v_mundos) m
      where coalesce((select w.nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = m), 0) < 40
    ) then
      raise exception 'todavia no alcanzaste nivel 40 en los 13 mundos';
    end if;
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_costo then
    raise exception 'te faltan Chispas para comprar esto';
  end if;

  if p_item = 'escudo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        escudos_extra_pendientes = pr.escudos_extra_pendientes + 1
    where pr.id = v_user;
  elsif p_item = 'congelamiento' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        congelamientos_disponibles = pr.congelamientos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'boost' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        boost_multiplicador_pendiente = 1.5
    where pr.id = v_user;
  elsif p_item = 'hielo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        hielos_disponibles = pr.hielos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'tiempo_extra' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'paquete_marcos_mundo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = (select array(select distinct u from unnest(pr.marcos_desbloqueados || v_mundos) as u))
    where pr.id = v_user;
  elsif p_item like 'marco_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = case
          when (replace(p_item, 'marco_', '')) = any(pr.marcos_desbloqueados)
            then pr.marcos_desbloqueados
          else array_append(pr.marcos_desbloqueados, replace(p_item, 'marco_', ''))
        end
    where pr.id = v_user;
  elsif p_item like 'animacion_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        animaciones_desbloqueadas = case
          when (replace(p_item, 'animacion_', '')) = any(pr.animaciones_desbloqueadas)
            then pr.animaciones_desbloqueadas
          else array_append(pr.animaciones_desbloqueadas, replace(p_item, 'animacion_', ''))
        end
    where pr.id = v_user;
  elsif p_item = 'color_nombre_personalizado' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        color_nombre_desbloqueado = true
    where pr.id = v_user;
  elsif p_item like 'fondo_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fondos_desbloqueados = case
          when (replace(p_item, 'fondo_', '')) = any(pr.fondos_desbloqueados)
            then pr.fondos_desbloqueados
          else array_append(pr.fondos_desbloqueados, replace(p_item, 'fondo_', ''))
        end
    where pr.id = v_user;
  else
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fuentes_desbloqueadas = case
          when (replace(p_item, 'fuente_', '')) = any(pr.fuentes_desbloqueadas)
            then pr.fuentes_desbloqueadas
          else array_append(pr.fuentes_desbloqueadas, replace(p_item, 'fuente_', ''))
        end
    where pr.id = v_user;
  end if;

  v_categoria := case
    when p_item like 'fuente_%' then 'fuente'
    when p_item like 'marco_%' or p_item = 'paquete_marcos_mundo' then 'marco'
    when p_item like 'animacion_%' then 'animacion'
    when p_item like 'fondo_%' then 'fondo'
    else 'consumible'
  end;

  insert into public.tienda_compras (user_id, item_slug, categoria, costo)
  values (v_user, p_item, v_categoria, p_costo);

  return query
    select pr.puntos_total, pr.escudos_extra_pendientes, pr.congelamientos_disponibles,
      pr.boost_multiplicador_pendiente, pr.fuentes_desbloqueadas, pr.marcos_desbloqueados,
      pr.animaciones_desbloqueadas, pr.fondos_desbloqueados, pr.hielos_disponibles, pr.tiempos_extra_disponibles
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;

-- ---------- 5) guardar_afinidad_banner (base real: 0144): ref acotado a los 13 mundos ----------
-- Bug preexistente que se corrige de paso: la versión vigente (0144)
-- solo aceptaba los 8 mundos originales como "ref" y un máximo de 8
-- items, pero BannerHabilidades.tsx ofrece TODOS los mundos de
-- MUNDOS_LANDING — elegir Calculia o Circuitia (o los 3 mundos nuevos)
-- como favorito fallaba con "item invalido". El tope de items pasa a 13
-- (= cantidad de mundos).
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
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if v_arr is null or jsonb_typeof(v_arr) <> 'array' then
    raise exception 'formato invalido';
  end if;
  if jsonb_array_length(v_arr) > 13 then
    raise exception 'demasiados items';
  end if;
  for v_item in select value as v from jsonb_array_elements(v_arr) loop
    if jsonb_typeof(v_item.v) <> 'object'
       or not (v_item.v->>'ref' = any(v_mundos))
       or v_item.v->>'nombre' is null or btrim(v_item.v->>'nombre') = ''
       or length(v_item.v->>'nombre') > 60
    then
      raise exception 'item invalido';
    end if;
  end loop;
  update public.profiles set afinidad_banner = v_arr where id = v_user;
  return v_arr;
end;
$$;

grant execute on function public.guardar_afinidad_banner(jsonb) to authenticated;

-- ---------- 6) estadisticas_pro_perfil / estadisticas_pro_subtemas (base real: 0187): + 3 ramas ----------
-- Regla de docs/PARIDAD_MUNDOS.md fila 21: un mundo sin rama en este CASE
-- cae en el "else null" y sus intentos se filtran en silencio de TODA
-- estadística Pro. Las columnas de salida no cambian: create or replace,
-- sin drop.
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
          when a.problem_type = 'geografia' then 'geografia'
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

-- ---------- 7) estadisticas_pro_subtemas_grupo (versión docentes, base real: 0169): + 3 ramas ----------
-- Mismo mapeo problem_type -> mundo que las dos funciones individuales de
-- arriba; el gate de plan vive en la página (requirePro), acá solo se
-- re-verifica la pertenencia del grupo, igual que en 0169.
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
