-- 0159: Estadísticas Pro — Tienda y Trastienda, pedido en vivo (2026-09-15):
-- "que haya estadisticas de la tienda y la trastienda tambien" (mismo panel
-- de /perfil/estadisticas que ya cubre precisión/tiempo/actividad por mundo,
-- gateado a Prodigia Pro — ver 0146/0149/0151).
--
-- Dos piezas:
--   1) public.tienda_compras: NO existía ningún ledger histórico de compras
--      de la Tienda (comprar_item_tienda solo actualiza columnas/arrays en
--      profiles, nunca dejó rastro con fecha+costo). Se crea la tabla y se
--      inserta en ella de forma ADITIVA, en el único punto de salida
--      exitoso de comprar_item_tienda (después del if/elsif de todas las
--      categorías, antes del "return query" final) — no se toca ninguna
--      otra línea de esa función. Consecuencia real: el GASTO TOTAL en
--      estadísticas solo cuenta compras hechas DESDE esta migración en
--      adelante, no es retroactivo (no hay forma de reconstruir compras
--      pasadas, no quedó rastro). La firma de comprar_item_tienda no cambia
--      (mismas columnas de salida) así que va con create or replace, no
--      hace falta drop.
--   2) public.estadisticas_pro_tienda_trastienda(): RPC nueva, mismo patrón
--      security definer + re-chequeo de auth.uid()/profiles.plan='pro' que
--      estadisticas_pro_perfil/estadisticas_pro_subtemas/estadisticas_pro_
--      actividad_diaria (defensa en profundidad: la página server-side ya
--      gatea con requirePro, pero cada RPC de esta familia se cuida sola).
--      - gasto_tienda_total: sum(costo) de tienda_compras (ver nota arriba,
--        NO retroactivo).
--      - items_desbloqueados: SÍ es retroactivo y completo — se lee del
--        estado actual real (profiles.fuentes_desbloqueadas/marcos_
--        desbloqueados/animaciones_desbloqueadas/fondos_desbloqueados +
--        fondos_galeria_desbloqueados), no del ledger nuevo. Cubre incluso
--        ítems obtenidos gratis (ej. 0153 arcoiris gratis al hacerse Pro) o
--        comprados antes de que existiera tienda_compras.
--      - apostado_total / ganado_total: suma de las 5 fuentes de actividad
--        de Trastienda que YA existen (mismas que agrega
--        fetch_trastienda_historial, 0129): trastienda_ruleta
--        (costo_aplicado / premio_detalle->>'chispas'), trastienda_
--        minijuegos (entrada/salida — cubre volado, la_pizarra, la_calcu,
--        acertijos y el_reloj, todos comparten esa tabla vía minijuego_id),
--        trastienda_casino (monto/pago — cubre la ruleta elemental de una
--        y de varias zonas, 0127/0137), trastienda_apuestas y trastienda_
--        predicciones_ranking (monto/payout, EXCLUYENDO estado='pendiente'
--        — una apuesta o predicción todavía sin resolver no es ganancia ni
--        pérdida, se cuenta cuando el trigger la resuelve).
--      - perdido_total: greatest(apostado_total - ganado_total, 0) — lo que
--        de lo apostado nunca volvió. balance_neto: ganado_total -
--        apostado_total (puede ser negativo). Deliberadamente simple (sin
--        desglose por juego), mismo criterio de "no muy avanzado
--        estadísticamente" que pidió el dueño para el resto del panel.

-- ---------- 1) Ledger de compras de Tienda ----------
create table public.tienda_compras (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_slug text not null,
  categoria text not null check (categoria in ('fuente', 'marco', 'animacion', 'fondo', 'consumible')),
  costo integer not null check (costo >= 0),
  creado_at timestamptz not null default now()
);

create index if not exists tienda_compras_user_id_idx on public.tienda_compras (user_id);

alter table public.tienda_compras enable row level security;

drop policy if exists "tienda_compras: lectura propia" on public.tienda_compras;
create policy "tienda_compras: lectura propia" on public.tienda_compras
  for select using (auth.uid() = user_id);

grant select on public.tienda_compras to authenticated;

-- ---------- 2) comprar_item_tienda: agrega el insert al ledger ----------
-- Copia exacta de la versión vigente (0155_animaciones_pesadas_shuffle_
-- decrypted.sql) — el ÚNICO cambio es declarar v_categoria y agregar el
-- insert a public.tienda_compras justo antes del "return query" final.
-- Ninguna otra línea se tocó.
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
    when 'animacion_shuffle' then 2800
    when 'animacion_decrypted' then 2800
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

  -- ---------- Ledger de compras (0159, aditivo, no cambia nada de arriba) ----------
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

-- ---------- 3) estadisticas_pro_tienda_trastienda: agregado Tienda + Trastienda (Pro-only) ----------
create function public.estadisticas_pro_tienda_trastienda()
returns table (
  gasto_tienda_total bigint,
  items_desbloqueados integer,
  apostado_total bigint,
  ganado_total bigint,
  perdido_total bigint,
  balance_neto bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_plan text;
  v_gasto_tienda bigint;
  v_items integer;
  v_apostado bigint;
  v_ganado bigint;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
  if v_plan is distinct from 'pro' then
    raise exception 'estadisticas avanzadas exclusivas de Prodigia Pro';
  end if;

  select coalesce(sum(tc.costo), 0)
  into v_gasto_tienda
  from public.tienda_compras tc
  where tc.user_id = v_user;

  select
    coalesce(cardinality(pr.fuentes_desbloqueadas), 0)
    + coalesce(cardinality(pr.marcos_desbloqueados), 0)
    + coalesce(cardinality(pr.animaciones_desbloqueadas), 0)
    + coalesce(cardinality(pr.fondos_desbloqueados), 0)
    + coalesce((select count(*) from public.fondos_galeria_desbloqueados fg where fg.user_id = v_user), 0)
  into v_items
  from public.profiles pr
  where pr.id = v_user;

  select
    coalesce((select sum(r.costo_aplicado) from public.trastienda_ruleta r where r.user_id = v_user), 0)
    + coalesce((select sum(m.entrada) from public.trastienda_minijuegos m where m.user_id = v_user), 0)
    + coalesce((select sum(c.monto) from public.trastienda_casino c where c.user_id = v_user), 0)
    + coalesce((select sum(a.monto) from public.trastienda_apuestas a where a.user_id = v_user and a.estado <> 'pendiente'), 0)
    + coalesce((select sum(p.monto) from public.trastienda_predicciones_ranking p where p.user_id = v_user and p.estado <> 'pendiente'), 0)
  into v_apostado;

  select
    coalesce((select sum(coalesce((r.premio_detalle->>'chispas')::integer, 0)) from public.trastienda_ruleta r where r.user_id = v_user), 0)
    + coalesce((select sum(m.salida) from public.trastienda_minijuegos m where m.user_id = v_user), 0)
    + coalesce((select sum(c.pago) from public.trastienda_casino c where c.user_id = v_user), 0)
    + coalesce((select sum(a.payout) from public.trastienda_apuestas a where a.user_id = v_user and a.estado <> 'pendiente'), 0)
    + coalesce((select sum(p.payout) from public.trastienda_predicciones_ranking p where p.user_id = v_user and p.estado <> 'pendiente'), 0)
  into v_ganado;

  return query select
    v_gasto_tienda,
    v_items,
    v_apostado,
    v_ganado,
    greatest(v_apostado - v_ganado, 0),
    v_ganado - v_apostado;
end;
$$;

grant execute on function public.estadisticas_pro_tienda_trastienda() to authenticated;

notify pgrst, 'reload schema';
