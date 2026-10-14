-- ============================================================
-- Prodigia — Ajustes de la revisión del 2026-10-14 (0285).
--
--   1) La tienda cobra el precio exacto: el precio base o el del descuento del día,
--      calculado en la base igual que src/lib/descuentoDiario.ts (antes aceptaba
--      cualquier precio desde el 50 %, y llamando a la función a mano salía a mitad).
--   2) Pack Noche: el marco Neón violeta es legendario (solo con Cometas, 0280); en el
--      paquete se cambia por la animación Neón del nombre. Precio = −25 % de la suma.
--   3) mis_constelaciones mostraba 300/450 Chispas y 0280 paga 120/180.
-- Requiere 0280. Idempotente.
-- ============================================================

-- ---------- 1) Descuento del día (espejo de src/lib/descuentoDiario.ts) ----------
-- Hash de la fecha "YYYY-MM-DD" como el de JavaScript (Math.imul(31, h) + código, en
-- 32 bits con signo) y su valor absoluto.
create or replace function public.hash_fecha_descuento(p_fecha date)
returns bigint
language plpgsql
immutable
as $$
declare
  v_txt text := to_char(p_fecha, 'YYYY-MM-DD');
  v_h bigint := 0;
  v_i integer;
begin
  for v_i in 1..length(v_txt) loop
    v_h := (31 * v_h + ascii(substr(v_txt, v_i, 1))) & 4294967295;
    if v_h >= 2147483648 then
      v_h := v_h - 4294967296;
    end if;
  end loop;
  return abs(v_h);
end;
$$;

create or replace function public.descuento_del_dia(p_fecha date)
returns table (item text, porcentaje integer)
language sql
immutable
as $$
  with l as (select array['escudo', 'congelamiento', 'boost', 'fuente_mono', 'fuente_serif', 'fuente_impacto', 'fuente_script', 'fuente_futurista', 'marco_bronce', 'marco_plata', 'marco_oro', 'marco_platino', 'marco_diamante']::text[] as items)
  select l.items[(public.hash_fecha_descuento(p_fecha) % cardinality(l.items))::integer + 1],
         (array[20, 30, 40, 50])[((public.hash_fecha_descuento(p_fecha) / cardinality(l.items)) % 4)::integer + 1]
  from l;
$$;
grant execute on function public.descuento_del_dia(date) to anon, authenticated;

create or replace function public.precio_con_descuento(p_base integer, p_item text, p_fecha date)
returns integer
language sql
immutable
as $$
  select case when d.item = p_item then round(p_base * (1 - d.porcentaje / 100.0))::integer else p_base end
  from public.descuento_del_dia(p_fecha) d;
$$;

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
  v_catalogo public.catalogo_cosmeticos%rowtype;
  v_paquete public.paquetes_tienda%rowtype;
  v_es_catalogo boolean := false;
  v_es_paquete boolean := false;
  v_item_paquete text;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
  v_items_pro constant text[] := array['animacion_prisma', 'fondo_prodigio'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  -- Precios de 0280 (PLAN_ECONOMIA.md §4.2). Los cosméticos ya no están acá: salen
  -- de su rareza en catalogo_cosmeticos (ver precio_chispas_rareza).
  v_costo_base := case p_item
    when 'escudo' then 120
    when 'congelamiento' then 150
    when 'boost' then 150
    when 'hielo' then 60
    when 'tiempo_extra' then 50
    when 'pista' then 60
    when 'segunda_oportunidad' then 100
    when 'cofre_hielos' then 150
    when 'paquete_marcos_mundo' then 33750
    when 'fondo_personalizado' then 3000
    when 'color_nombre_personalizado' then 1200
    when 'animacion_prisma' then 3000
    when 'fondo_prodigio' then 3000
    else null
  end;

  -- Lo nuevo (0248): precio del catálogo o del paquete.
  if v_costo_base is null then
    select * into v_catalogo from public.catalogo_cosmeticos c where c.slug = p_item and c.vendible;
    if found then
      if v_catalogo.rareza = 'legendario' then
        raise exception 'lo legendario se compra con Cometas';
      end if;
      v_es_catalogo := true;
      v_costo_base := v_catalogo.precio;
      if v_catalogo.temporada is not null and v_catalogo.temporada <> public.temporada_actual() then
        raise exception 'este marco de temporada no esta a la venta este mes';
      end if;
    else
      select * into v_paquete from public.paquetes_tienda pq where pq.slug = p_item;
      if found then
        v_es_paquete := true;
        v_costo_base := v_paquete.precio;
      end if;
    end if;
  end if;

  if v_costo_base is null then
    raise exception 'item invalido';
  end if;
  -- Precio exacto (revisión 2026-10-14: antes aceptaba cualquier precio desde el 50 %).
  -- Vale el precio base o el del descuento del día (hoy, ayer o mañana, por si la
  -- compra cae justo en el cambio de día).
  if p_costo <> v_costo_base
     and p_costo <> public.precio_con_descuento(v_costo_base, p_item, current_date)
     and p_costo <> public.precio_con_descuento(v_costo_base, p_item, current_date - 1)
     and p_costo <> public.precio_con_descuento(v_costo_base, p_item, current_date + 1) then
    raise exception 'precio invalido';
  end if;

  if p_item = any(v_items_pro) then
    select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
    if v_plan is distinct from 'pro' then
      raise exception 'este cosmetico es exclusivo de Prodigia Pro';
    end if;
  end if;

  if p_item in ('marco_numeria', 'marco_enigmia', 'marco_geografia', 'marco_quimia', 'marco_anatomia', 'marco_melodia', 'marco_trigonometria', 'marco_historia', 'marco_calculia', 'marco_circuitia', 'marco_estadistica', 'marco_naipia', 'marco_codia', 'marco_dinamia', 'marco_vitalia') then
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
      raise exception 'todavia no alcanzaste nivel 40 en los 15 mundos';
    end if;
  end if;

  if v_es_catalogo and public._tiene_cosmetico(v_user, p_item) then
    raise exception 'ya tienes este articulo';
  end if;
  if v_es_paquete and not exists (select 1 from unnest(v_paquete.items) i where not public._tiene_cosmetico(v_user, i)) then
    raise exception 'ya tienes todo lo de este paquete';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_costo then
    raise exception 'te faltan Chispas para comprar esto';
  end if;

  if v_es_catalogo then
    update public.profiles as pr set puntos_total = pr.puntos_total - p_costo where pr.id = v_user;
    perform public._dar_cosmetico(v_user, p_item);
  elsif v_es_paquete then
    update public.profiles as pr set puntos_total = pr.puntos_total - p_costo where pr.id = v_user;
    foreach v_item_paquete in array v_paquete.items loop
      perform public._dar_cosmetico(v_user, v_item_paquete);
    end loop;
  elsif p_item = 'pista' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        pistas_disponibles = pr.pistas_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'segunda_oportunidad' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        segundas_oportunidades_disponibles = pr.segundas_oportunidades_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'cofre_hielos' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        hielos_disponibles = pr.hielos_disponibles + 3
    where pr.id = v_user;
  elsif p_item = 'escudo' then
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

  -- tienda_compras.categoria solo admite estas 5 (0159): lo nuevo cae en la más cercana.
  v_categoria := case
    when v_es_catalogo and v_catalogo.categoria in ('fuente', 'marco', 'animacion', 'fondo') then v_catalogo.categoria
    when v_es_catalogo or v_es_paquete then 'consumible'
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

-- ---------- 2) Pack Noche sin legendario ----------
update public.paquetes_tienda
set items = array['fondo_nebulosa', 'animacion_neon', 'estela_violeta']
where slug = 'pack_noche';
update public.paquetes_tienda pq
set precio = floor((select sum(c.precio) from public.catalogo_cosmeticos c where c.slug = any(pq.items)) * 0.75)::integer
where pq.slug = 'pack_noche';

-- ---------- 3) Premio de constelación que se muestra (= lo que paga 0280) ----------
create or replace function public.mis_constelaciones()
returns table (mundo text, estrellas integer, completadas integer, de_noche boolean, alineacion boolean, chispas_premio integer, falta_pieza boolean, favorita boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fav text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  v_fav := public._ciudad_favorita(v_user);
  return query
    select m.mundo,
           coalesce(cu.estrellas, 0)::integer,
           coalesce(cu.completadas, 0)::integer,
           public.ciudad_de_noche(m.mundo),
           public.en_gran_alineacion(),
           round((case when x.falta then 120 else 180 end)
                 * (case when public.en_gran_alineacion() then 2 else 1 end)
                 * (case when public.ciudad_de_noche(m.mundo) then 1.2 else 1 end))::integer,
           x.falta,
           m.mundo = v_fav
    from unnest(array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia']) with ordinality as m(mundo, orden)
    left join public.constelaciones_usuario cu on cu.user_id = v_user and cu.mundo = m.mundo
    cross join lateral (
      select exists (
        select 1 from public.catalogo_cosmeticos c
        where c.mundo = m.mundo and not c.vendible and c.en_capsulas and not public._tiene_cosmetico(v_user, c.slug)
      ) as falta
    ) x
    order by m.orden;
end;
$$;

notify pgrst, 'reload schema';
