-- ====================================================================
-- Prodigia — 2 pedidos en vivo (2026-09-15), agrupados en una misma
-- migración porque los dos tocan comprar_item_tienda:
--
--   1) Consumibles de partida: "hielo" (detiene el reloj 10s) y
--      "tiempo_extra" (+3s), usables A MITAD de una partida solo (no
--      son cosméticos ni utilidades pasivas como escudo/congelamiento/
--      boost) — mismo patrón de columna smallint "disponibles" que
--      congelamientos_disponibles (0011), consumida 1 a 1 por una RPC
--      nueva (usar_consumible_partida), nunca por comprar_item_tienda
--      directo. Prohibidos en duelos: eso se resuelve 100% client-side
--      (el botón no se renderiza si hay un duelo activo — ver
--      ConsumiblesPartida.tsx), no hace falta que la RPC sepa nada de
--      duelos: usarlos fuera de un duelo real no tiene ningún efecto
--      si el cliente no aplica la respuesta a ningún reloj.
--   2) 2 fuentes nuevas (urbana=Anton, elegante=Dancing Script) + 2
--      animaciones de nombre nuevas (glitch, deconstruccion) — a pedido
--      de "agregar más efectos, glitch o nombres que se deconstruyen,
--      igualmente más fuentes para los nombres".
--
-- comprar_item_tienda agrega 2 columnas de salida nuevas (hielos_
-- disponibles, tiempos_extra_disponibles) — mismo criterio que 0142/
-- 0146 (42P13): va con drop + create, no create or replace.
-- ====================================================================

-- ---------- 1) columnas nuevas en profiles ----------
alter table public.profiles
  add column if not exists hielos_disponibles smallint not null default 0,
  add column if not exists tiempos_extra_disponibles smallint not null default 0;

alter table public.profiles drop constraint if exists profiles_fuente_nombre_check;
alter table public.profiles add constraint profiles_fuente_nombre_check
  check (fuente_nombre in ('default', 'mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista', 'urbana', 'elegante'));

alter table public.profiles drop constraint if exists profiles_animacion_nombre_check;
alter table public.profiles add constraint profiles_animacion_nombre_check
  check (animacion_nombre in ('ninguna', 'arcoiris', 'brillo', 'ondulante', 'neon', 'prisma', 'glitch', 'deconstruccion'));

-- ---------- 2) comprar_item_tienda: 6 ítems nuevos + 2 columnas de salida ----------
drop function if exists public.comprar_item_tienda(text, integer);

create function public.comprar_item_tienda(p_item text, p_costo integer)
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
    when 'paquete_marcos_mundo' then 14500
    when 'animacion_ondulante' then 1200
    when 'animacion_brillo' then 1400
    when 'animacion_arcoiris' then 1800
    when 'animacion_neon' then 2200
    when 'animacion_glitch' then 2000
    when 'animacion_deconstruccion' then 2400
    when 'fondo_oceano' then 1600
    when 'fondo_bosque' then 1600
    when 'fondo_aurora' then 1600
    when 'fondo_dorado' then 1800
    when 'fondo_nebulosa' then 2000
    when 'fondo_personalizado' then 4000
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
      pr.animaciones_desbloqueadas, pr.fondos_desbloqueados, pr.hielos_disponibles, pr.tiempos_extra_disponibles
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;

-- ---------- 3) usar_consumible_partida: gastar 1 hielo/tiempo_extra EN una partida ----------
-- Security definer, re-deriva auth.uid() (nunca confía en un user_id
-- del cliente) — decrementa 1 unidad si hay stock, si no hay stock
-- devuelve un error claro. No sabe nada de duelos a propósito (ver
-- comment de arriba): el gate de "prohibido en multijugador" es 100%
-- de UI (el botón no existe si hay un duelo activo).
create or replace function public.usar_consumible_partida(p_item text)
returns table (hielos_disponibles smallint, tiempos_extra_disponibles smallint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_disponibles smallint;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_item not in ('hielo', 'tiempo_extra') then
    raise exception 'item invalido';
  end if;

  if p_item = 'hielo' then
    select pr.hielos_disponibles into v_disponibles from public.profiles pr where pr.id = v_user;
    if coalesce(v_disponibles, 0) <= 0 then
      raise exception 'no tenes hielos disponibles';
    end if;
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles - 1 where pr.id = v_user;
  else
    select pr.tiempos_extra_disponibles into v_disponibles from public.profiles pr where pr.id = v_user;
    if coalesce(v_disponibles, 0) <= 0 then
      raise exception 'no tenes tiempo extra disponible';
    end if;
    update public.profiles as pr set tiempos_extra_disponibles = pr.tiempos_extra_disponibles - 1 where pr.id = v_user;
  end if;

  return query
    select pr.hielos_disponibles, pr.tiempos_extra_disponibles from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.usar_consumible_partida(text) to authenticated;

notify pgrst, 'reload schema';
