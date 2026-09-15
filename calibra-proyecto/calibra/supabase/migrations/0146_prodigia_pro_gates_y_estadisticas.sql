-- ====================================================================
-- Prodigia — Infraestructura de pagos, Fase 4: Prodigia Pro deja de
-- ser vaporware. profiles.plan (existe desde 0001, nunca aplicado)
-- ahora lo escribe aplicar_suscripcion() (0145) y ahora también lo
-- LEE código real:
--   1) 2 cosméticos exclusivos de Pro en la Tienda (animacion_prisma,
--      fondo_prodigio) — gateados por plan = 'pro', además de costar
--      Chispas como cualquier otro ítem (no son gratis, son "acceso a
--      comprar", mismo criterio que ya usan los marcos temáticos con
--      su gate de nivel_mundo >= 40).
--   2) estadisticas_pro_perfil(): agregados por mundo (intentos,
--      correctos, precisión) para la página /perfil/estadisticas
--      (Pro-only) — mismo agrupamiento por prefijo de problem_type que
--      ya usa ranking_semanal_filtrado (0119), no se reinventa.
-- ====================================================================

-- ---------- 1) animacion_nombre / fondo_perfil: 2 valores nuevos ----------
alter table public.profiles drop constraint if exists profiles_animacion_nombre_check;
alter table public.profiles add constraint profiles_animacion_nombre_check
  check (animacion_nombre in ('ninguna', 'arcoiris', 'brillo', 'ondulante', 'neon', 'prisma'));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in ('ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque', 'personalizado', 'prodigio'));

-- ---------- 2) comprar_item_tienda: 2 ítems nuevos + gate de Pro ----------
-- Mismo return shape que 0143 (no agrega columnas) — alcanza con
-- create or replace, sin drop.
create or replace function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  fuentes_desbloqueadas text[],
  marcos_desbloqueados text[],
  animaciones_desbloqueadas text[],
  fondos_desbloqueados text[]
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
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_items_pro constant text[] := array['animacion_prisma', 'fondo_prodigio'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_costo_base := case p_item
    when 'escudo' then 350
    when 'congelamiento' then 450
    when 'boost' then 600
    when 'fuente_mono' then 1000
    when 'fuente_serif' then 1400
    when 'fuente_manuscrita' then 5000
    when 'fuente_impacto' then 1200
    when 'fuente_script' then 1800
    when 'fuente_futurista' then 2500
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
    when 'paquete_marcos_mundo' then 14500
    when 'animacion_ondulante' then 1200
    when 'animacion_brillo' then 1400
    when 'animacion_arcoiris' then 1800
    when 'animacion_neon' then 2200
    when 'fondo_oceano' then 1600
    when 'fondo_bosque' then 1600
    when 'fondo_aurora' then 1600
    when 'fondo_dorado' then 1800
    when 'fondo_nebulosa' then 2000
    when 'fondo_personalizado' then 4000
    -- Fase 4 (pagos): exclusivos de Pro, un escalón arriba del resto
    -- de animaciones/fondos — Pro ya viene con +10.000 Chispas/mes, así
    -- que el precio en Chispas sigue existiendo, el gate es aparte.
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

  if p_item in ('marco_numeria', 'marco_enigmia', 'marco_geografia', 'marco_quimia', 'marco_anatomia', 'marco_melodia', 'marco_trigonometria', 'marco_historia') then
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
      raise exception 'todavia no alcanzaste nivel 40 en los 8 mundos';
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

  return query
    select pr.puntos_total, pr.escudos_extra_pendientes, pr.congelamientos_disponibles,
      pr.boost_multiplicador_pendiente, pr.fuentes_desbloqueadas, pr.marcos_desbloqueados,
      pr.animaciones_desbloqueadas, pr.fondos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;

-- ---------- 3) estadisticas_pro_perfil: agregados por mundo (Pro-only) ----------
-- Mismo agrupamiento por prefijo de problem_type que ranking_semanal_
-- filtrado (0119) — una sola fuente de verdad de "qué problem_type
-- pertenece a qué mundo" habría sido ideal, pero esa abstracción no
-- existe en el proyecto (documentado como riesgo aceptado en varias
-- migraciones anteriores) así que se repite el mismo patrón ya
-- establecido, no se inventa uno nuevo.
-- "precision" solo (sin calificar) revienta con 42601 dentro de una
-- lista de columnas de RETURNS TABLE — Postgres lo trata como palabra
-- reservada de tipo justo en esa posición (confirmado en vivo,
-- 2026-09-14: "ERROR: 42601: syntax error at or near 'precision'").
-- Se renombra a precision_pct, sin tocar nada más de la función.
create or replace function public.estadisticas_pro_perfil()
returns table (mundo text, intentos bigint, correctos bigint, precision_pct numeric)
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
          when a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra') then 'numeria'
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
      union all
      select 'enigmia' as m, la.correct
      from public.logic_attempts la
      where la.user_id = v_user
    )
    select b.m, count(*)::bigint, count(*) filter (where b.correct)::bigint,
      round(count(*) filter (where b.correct)::numeric / count(*), 4)
    from base b
    where b.m is not null
    group by b.m
    order by count(*) desc;
end;
$$;

grant execute on function public.estadisticas_pro_perfil() to authenticated;

notify pgrst, 'reload schema';
