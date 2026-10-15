-- ============================================================
-- Prodigia — Cometas y dinero: reparar racha, cápsulas, mundo suelto y
-- paquetes (0287).
--
-- Pedido del 2026-10-14 (PLAN_ECONOMIA.md §4.2 y §4.3):
--   1) Reparar la racha con Cometas: 50 Cometas, una vez por semana. Rellena los días
--      perdidos (hasta 3) para que la racha anterior vuelva. estado_racha_reparable()
--      dice si hay algo para reparar; reparar_racha_con_cometas() lo hace.
--   2) Cápsulas con Cometas: 'estelar' (120: raro 50 %, épico 40 %, legendario 10 %)
--      y 'supernova' (300: épico 60 %, legendario 40 %). Las probabilidades se ven
--      antes de pagar (contenido_capsula), igual que todas. Se compran y se abren
--      con la animación de siempre.
--   3) Paquetes cuando ya tienes parte: el precio en Chispas es solo el de lo que te
--      falta (proporcional al valor de cada cosa). precios_paquetes_para_mi() lo
--      calcula para mostrarlo; comprar_item_tienda cobra eso mismo.
--   4) Con dinero real (Paddle, la web lo cobra): mundo suelto (US$2.99) y paquetes
--      de cosméticos. Los entrega el webhook con otorgar_mundo_comprado y
--      otorgar_paquete_comprado (solo service_role, idempotentes).
-- Requiere 0279, 0280, 0283 y 0285. Idempotente.
-- ============================================================

-- ---------- 1) Reparar la racha con Cometas ----------
-- Días cubiertos (meta o congelado) y el hueco que cortó la racha. Mismo criterio
-- que calcularRachaDiaria (src/lib/practica/racha.ts): si hoy todavía no se jugó, se
-- mira desde ayer.
create or replace function public._racha_reparable(p_user uuid)
returns table (perdida integer, dias date[])
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_hoy date := current_date;
  v_cursor date;
  v_hueco date[] := array[]::date[];
  v_racha integer := 0;
  v_max_hueco constant integer := 3;
begin
  -- El hueco empieza ayer: hoy, si no se jugó, todavía se puede jugar.
  v_cursor := v_hoy - 1;
  while cardinality(v_hueco) <= v_max_hueco
    and not exists (select 1 from public.daily_progress d where d.user_id = p_user and d.fecha = v_cursor and (d.meta_alcanzada or d.congelado)) loop
    v_hueco := array_append(v_hueco, v_cursor);
    v_cursor := v_cursor - 1;
  end loop;
  if cardinality(v_hueco) = 0 or cardinality(v_hueco) > v_max_hueco then
    return;
  end if;
  while exists (select 1 from public.daily_progress d where d.user_id = p_user and d.fecha = v_cursor and (d.meta_alcanzada or d.congelado)) loop
    v_racha := v_racha + 1;
    v_cursor := v_cursor - 1;
  end loop;
  if v_racha < 2 then
    return;
  end if;
  return query select v_racha, v_hueco;
end;
$$;
revoke execute on function public._racha_reparable(uuid) from public, anon, authenticated;

create or replace function public.estado_racha_reparable()
returns table (perdida integer, dias_perdidos integer, costo integer, disponible_en timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_ultima timestamptz;
  v_r record;
begin
  if v_user is null then
    return;
  end if;
  select * into v_r from public._racha_reparable(v_user);
  if v_r.perdida is null then
    return;
  end if;
  select max(m.creado_at) into v_ultima from public.cometas_movimientos m where m.user_id = v_user and m.motivo = 'reparar_racha';
  return query select v_r.perdida, cardinality(v_r.dias), 50,
    case when v_ultima is not null and v_ultima > now() - interval '7 days' then v_ultima + interval '7 days' else null end;
end;
$$;
revoke execute on function public.estado_racha_reparable() from public, anon;
grant execute on function public.estado_racha_reparable() to authenticated;

create or replace function public.reparar_racha_con_cometas()
returns table (cometas integer, racha integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_r record;
  v_dia date;
  v_costo constant integer := 50;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.cometas into v_saldo from public.profiles pr where pr.id = v_user for update;
  select * into v_r from public._racha_reparable(v_user);
  if v_r.perdida is null then
    raise exception 'no hay una racha para reparar';
  end if;
  if exists (select 1 from public.cometas_movimientos m where m.user_id = v_user and m.motivo = 'reparar_racha' and m.creado_at > now() - interval '7 days') then
    raise exception 'ya reparaste una racha esta semana';
  end if;
  if coalesce(v_saldo, 0) < v_costo then
    raise exception 'te faltan Cometas: reparar la racha cuesta % Cometas', v_costo;
  end if;

  insert into public.cometas_movimientos (user_id, cantidad, motivo) values (v_user, -v_costo, 'reparar_racha');
  update public.profiles as pr set cometas = pr.cometas - v_costo where pr.id = v_user;
  foreach v_dia in array v_r.dias loop
    insert into public.daily_progress (user_id, fecha, congelado)
    values (v_user, v_dia, true)
    on conflict (user_id, fecha) do update set congelado = true;
  end loop;

  return query select pr.cometas, v_r.perdida + cardinality(v_r.dias)
    from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.reparar_racha_con_cometas() from public, anon;
grant execute on function public.reparar_racha_con_cometas() to authenticated;

-- ---------- 2) Cápsulas con Cometas ----------
alter table public.capsulas_usuario drop constraint if exists capsulas_usuario_tipo_check;
alter table public.capsulas_usuario add constraint capsulas_usuario_tipo_check
  check (tipo in ('diaria', 'misiones', 'racha', 'nivel', 'ciudad', 'liga', 'liga_bronce', 'liga_plata', 'liga_oro', 'coleccion', 'pro', 'estelar', 'supernova'));

create or replace function public.contenido_capsula(p_tipo text)
returns table (premio text, peso integer, minimo integer, maximo integer)
language sql
immutable
as $$
  select t.premio, t.peso, t.minimo, t.maximo
  from (values
    ('diaria', 'chispas', 70, 15, 40),
    ('diaria', 'hielo', 10, 1, 1),
    ('diaria', 'tiempo_extra', 10, 1, 1),
    ('diaria', 'escudo', 10, 1, 1),
    ('misiones', 'chispas', 70, 15, 40),
    ('misiones', 'hielo', 10, 1, 1),
    ('misiones', 'tiempo_extra', 10, 1, 1),
    ('misiones', 'escudo', 10, 1, 1),
    ('racha', 'chispas', 60, 60, 160),
    ('racha', 'cosmetico_comun', 25, 1, 1),
    ('racha', 'cosmetico_raro', 15, 1, 1),
    ('nivel', 'chispas', 80, 20, 60),
    ('nivel', 'cosmetico_raro', 20, 1, 1),
    ('ciudad', 'coleccion', 100, 1, 1),
    ('liga', 'chispas', 100, 40, 100),
    ('liga_bronce', 'chispas', 60, 80, 200),
    ('liga_bronce', 'cosmetico_raro', 40, 1, 1),
    ('liga_plata', 'cosmetico_raro', 60, 1, 1),
    ('liga_plata', 'cosmetico_epico', 40, 1, 1),
    ('liga_oro', 'cosmetico_epico', 60, 1, 1),
    ('liga_oro', 'cosmetico_legendario', 40, 1, 1),
    ('coleccion', 'marco_coleccion', 100, 1, 1),
    ('pro', 'cosmetico_epico', 55, 1, 1),
    ('pro', 'cosmetico_legendario', 30, 1, 1),
    ('pro', 'chispas', 15, 150, 300),
    ('estelar', 'cosmetico_raro', 50, 1, 1),
    ('estelar', 'cosmetico_epico', 40, 1, 1),
    ('estelar', 'cosmetico_legendario', 10, 1, 1),
    ('supernova', 'cosmetico_epico', 60, 1, 1),
    ('supernova', 'cosmetico_legendario', 40, 1, 1)
  ) as t(tipo, premio, peso, minimo, maximo)
  where t.tipo = p_tipo;
$$;

create or replace function public.comprar_capsula_con_cometas(p_tipo text)
returns table (id uuid, cometas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_costo integer;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  v_costo := case p_tipo when 'estelar' then 120 when 'supernova' then 300 else null end;
  if v_costo is null then
    raise exception 'capsula invalida';
  end if;
  select pr.cometas into v_saldo from public.profiles pr where pr.id = v_user for update;
  if coalesce(v_saldo, 0) < v_costo then
    raise exception 'te faltan Cometas: esta capsula cuesta % Cometas', v_costo;
  end if;

  insert into public.capsulas_usuario (user_id, tipo, mundo, origen)
  values (v_user, p_tipo, null, 'cometas:' || gen_random_uuid())
  returning capsulas_usuario.id into v_id;
  insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia)
  values (v_user, -v_costo, 'capsula', 'capsula:' || v_id);
  update public.profiles as pr set cometas = pr.cometas - v_costo where pr.id = v_user;

  return query select v_id, pr.cometas from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.comprar_capsula_con_cometas(text) from public, anon;
grant execute on function public.comprar_capsula_con_cometas(text) to authenticated;

-- ---------- 3) Paquetes: pagas solo lo que te falta ----------
-- Precio del paquete para alguien que ya tiene parte: el precio del paquete por la
-- fracción (en valor) de lo que le falta, redondeado hacia arriba de a 5. Si algún
-- artículo no tiene precio en el catálogo, la fracción se cuenta por cantidad.
create or replace function public._fraccion_paquete_faltante(p_user uuid, p_slug text)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_items text[];
  v_total numeric := 0;
  v_falta numeric := 0;
  v_n integer := 0;
  v_n_falta integer := 0;
  v_sin_precio boolean := false;
  v_item text;
  v_precio integer;
begin
  select pq.items into v_items from public.paquetes_tienda pq where pq.slug = p_slug;
  if v_items is null then
    return null;
  end if;
  foreach v_item in array v_items loop
    v_n := v_n + 1;
    select c.precio into v_precio from public.catalogo_cosmeticos c where c.slug = v_item;
    if v_precio is null or v_precio <= 0 then
      v_sin_precio := true;
    end if;
    v_total := v_total + coalesce(v_precio, 0);
    if not public._tiene_cosmetico(p_user, v_item) then
      v_n_falta := v_n_falta + 1;
      v_falta := v_falta + coalesce(v_precio, 0);
    end if;
  end loop;
  if v_n_falta = 0 then
    return 0;
  end if;
  if v_sin_precio or v_total = 0 then
    return v_n_falta::numeric / v_n;
  end if;
  return v_falta / v_total;
end;
$$;
revoke execute on function public._fraccion_paquete_faltante(uuid, text) from public, anon, authenticated;

create or replace function public._precio_paquete_para(p_user uuid, p_slug text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when f is null then null
    when f >= 1 then pq.precio
    else least(pq.precio, (ceil(pq.precio * f / 5.0) * 5)::integer)
  end
  from public.paquetes_tienda pq, public._fraccion_paquete_faltante(p_user, p_slug) f
  where pq.slug = p_slug;
$$;
revoke execute on function public._precio_paquete_para(uuid, text) from public, anon, authenticated;

create or replace function public.precios_paquetes_para_mi()
returns table (slug text, precio integer, precio_para_ti integer, fraccion numeric)
language sql
stable
security definer
set search_path = public
as $$
  select pq.slug, pq.precio, public._precio_paquete_para(auth.uid(), pq.slug), public._fraccion_paquete_faltante(auth.uid(), pq.slug)
  from public.paquetes_tienda pq
  where auth.uid() is not null;
$$;
revoke execute on function public.precios_paquetes_para_mi() from public, anon;
grant execute on function public.precios_paquetes_para_mi() to authenticated;

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
        -- 0287: si ya tienes parte del paquete, pagas solo lo que te falta.
        v_costo_base := public._precio_paquete_para(v_user, p_item);
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

-- ---------- 4) Con dinero real: lo entrega el webhook de Paddle ----------
create or replace function public.otorgar_mundo_comprado(p_user uuid, p_mundo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
    raise exception 'mundo invalido';
  end if;
  update public.profiles as pr
  set mundos_desbloqueados = case when p_mundo = any(pr.mundos_desbloqueados) then pr.mundos_desbloqueados else array_append(pr.mundos_desbloqueados, p_mundo) end
  where pr.id = p_user;
end;
$$;
revoke execute on function public.otorgar_mundo_comprado(uuid, text) from public, anon, authenticated;
grant execute on function public.otorgar_mundo_comprado(uuid, text) to service_role;

create or replace function public.otorgar_paquete_comprado(p_user uuid, p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items text[];
  v_item text;
begin
  select pq.items into v_items from public.paquetes_tienda pq where pq.slug = p_slug;
  if v_items is null then
    raise exception 'paquete invalido';
  end if;
  foreach v_item in array v_items loop
    perform public._dar_cosmetico(p_user, v_item);
  end loop;
  insert into public.tienda_compras (user_id, item_slug, categoria, costo) values (p_user, p_slug, 'consumible', 0);
end;
$$;
revoke execute on function public.otorgar_paquete_comprado(uuid, text) from public, anon, authenticated;
grant execute on function public.otorgar_paquete_comprado(uuid, text) to service_role;

-- La web calcula el precio en dólares de un paquete para quien ya tiene parte.
grant execute on function public._fraccion_paquete_faltante(uuid, text) to service_role;

notify pgrst, 'reload schema';
