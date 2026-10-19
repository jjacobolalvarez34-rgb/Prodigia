-- ============================================================
-- Prodigia — Paquetes de cápsulas con Cometas (0291).
--
-- Pedido del 2026-10-19: «microtransacciones» con paquetes de cápsulas, solo con
-- Cometas (nada se paga directo con dinero), también por temporada.
--   1) Paquetes fijos: Lote Estelar (5 por 500, en vez de 600) y Lote Supernova (3 por
--      750, en vez de 900).
--   2) Paquetes de temporada, solo mientras su evento está abierto (desde la hora de
--      apertura hasta el último día): la Cápsula de temporada (Halloween: 1 por 150 o 5
--      por 600). Trae una pieza de la colección del evento que te falte (45 %), un
--      cosmético épico (35 %) o legendario (20 %). Se ven las probabilidades antes de
--      pagar (contenido_capsula), igual que todas.
--   Las cápsulas compradas quedan en Recompensas › Por abrir. El catálogo de paquetes
--   vive en la base (paquetes_capsulas): el precio y lo que trae los decide el servidor.
-- Requiere 0287, 0289 y 0290. Idempotente.
-- ============================================================

-- ---------- 1) Tipo nuevo: cápsula de temporada ----------
-- En las de temporada, `mundo` guarda la fiesta (p. ej. 'halloween', para sus colores)
-- y `detalle.evento` el evento de donde salen las piezas (p. ej. 'halloween-2026').
alter table public.capsulas_usuario drop constraint if exists capsulas_usuario_tipo_check;
alter table public.capsulas_usuario add constraint capsulas_usuario_tipo_check
  check (tipo in ('diaria', 'misiones', 'racha', 'nivel', 'ciudad', 'liga', 'liga_bronce', 'liga_plata', 'liga_oro', 'coleccion', 'pro', 'estelar', 'supernova', 'plata', 'oro', 'prisma', 'alineacion', 'temporada'));

create or replace function public.contenido_capsula(p_tipo text)
returns table (premio text, peso integer, minimo integer, maximo integer)
language sql
immutable
as $$
  select t.premio, t.peso, t.minimo, t.maximo
  from (values
    ('diaria', 'chispas', 70, 100, 140),
    ('diaria', 'hielo', 10, 1, 1),
    ('diaria', 'tiempo_extra', 10, 1, 1),
    ('diaria', 'escudo', 10, 1, 1),
    ('misiones', 'chispas', 70, 100, 140),
    ('misiones', 'hielo', 10, 1, 1),
    ('misiones', 'tiempo_extra', 10, 1, 1),
    ('misiones', 'escudo', 10, 1, 1),
    ('racha', 'chispas', 60, 120, 220),
    ('racha', 'cosmetico_comun', 25, 1, 1),
    ('racha', 'cosmetico_raro', 15, 1, 1),
    ('nivel', 'chispas', 80, 100, 160),
    ('nivel', 'cosmetico_raro', 20, 1, 1),
    ('ciudad', 'coleccion', 100, 1, 1),
    ('liga', 'chispas', 100, 100, 180),
    ('liga_bronce', 'chispas', 60, 150, 260),
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
    ('supernova', 'cosmetico_legendario', 40, 1, 1),
    ('plata', 'chispas', 40, 150, 260),
    ('plata', 'cosmetico_comun', 30, 1, 1),
    ('plata', 'cosmetico_raro', 30, 1, 1),
    ('oro', 'cosmetico_raro', 50, 1, 1),
    ('oro', 'cosmetico_epico', 35, 1, 1),
    ('oro', 'chispas', 15, 250, 400),
    ('prisma', 'cosmetico_epico', 60, 1, 1),
    ('prisma', 'cosmetico_legendario', 40, 1, 1),
    ('alineacion', 'cosmetico_epico', 70, 1, 1),
    ('alineacion', 'cosmetico_legendario', 30, 1, 1),
    ('temporada', 'pieza_evento', 45, 1, 1),
    ('temporada', 'cosmetico_epico', 35, 1, 1),
    ('temporada', 'cosmetico_legendario', 20, 1, 1)
  ) as t(tipo, premio, peso, minimo, maximo)
  where t.tipo = p_tipo;
$$;
grant execute on function public.contenido_capsula(text) to anon, authenticated;

create or replace function public.abrir_capsula(p_id uuid)
returns table (premio text, slug text, nombre text, rareza text, cantidad integer, convertido boolean, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cap public.capsulas_usuario%rowtype;
  v_sin_raro smallint;
  v_total integer;
  v_r numeric;
  v_acum integer := 0;
  v_fila record;
  v_premio text;
  v_min integer := 0;
  v_max integer := 0;
  v_item public.catalogo_cosmeticos%rowtype;
  v_slug text;
  v_nombre text;
  v_rareza text;
  v_cantidad integer := 0;
  v_convertido boolean := false;
  v_nuevo_raro boolean := false;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_cap from public.capsulas_usuario c where c.id = p_id and c.user_id = v_user for update;
  if not found then
    raise exception 'capsula no encontrada';
  end if;
  if v_cap.abierta_at is not null then
    raise exception 'esta capsula ya se abrio';
  end if;

  select pr.capsulas_sin_raro into v_sin_raro from public.profiles pr where pr.id = v_user for update;

  -- Sorteo con los pesos de contenido_capsula().
  select sum(cc.peso) into v_total from public.contenido_capsula(v_cap.tipo) cc;
  v_r := random() * v_total;
  for v_fila in select * from public.contenido_capsula(v_cap.tipo) loop
    v_acum := v_acum + v_fila.peso;
    if v_r < v_acum then
      v_premio := v_fila.premio;
      v_min := v_fila.minimo;
      v_max := v_fila.maximo;
      exit;
    end if;
  end loop;

  -- Garantía: 10 seguidas sin nada raro → la siguiente trae un cosmético raro.
  if coalesce(v_sin_raro, 0) >= 10 and v_premio not in ('cosmetico_raro', 'cosmetico_epico', 'cosmetico_legendario', 'coleccion', 'marco_coleccion', 'pieza_evento') then
    v_premio := 'cosmetico_raro';
  end if;

  -- Cápsula de temporada (0291): una pieza de la colección de su evento que te falte,
  -- las más baratas más seguido (peso 1/precio en Cometas). Si ya tienes todas, un
  -- cosmético legendario.
  if v_premio = 'pieza_evento' then
    select c.* into v_item from public.catalogo_cosmeticos c
    join public.eventos_piezas ep on ep.item = c.slug
    where ep.evento = v_cap.detalle ->> 'evento' and not public._tiene_cosmetico(v_user, c.slug)
    order by -ln(1 - random()) * ep.cometas
    limit 1;
    if found then
      v_slug := v_item.slug;
      v_nombre := v_item.nombre;
      v_rareza := v_item.rareza;
      perform public._dar_cosmetico(v_user, v_item.slug);
      v_nuevo_raro := true;
    else
      v_premio := 'cosmetico_legendario';
    end if;
  end if;

  if v_premio = 'chispas' then
    v_cantidad := v_min + (floor(random() * (((v_max - v_min) / 5) + 1))::integer * 5);
    perform public._dar_chispas(v_user, v_cantidad);
  elsif v_premio = 'hielo' then
    v_cantidad := 1;
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + 1 where pr.id = v_user;
  elsif v_premio = 'tiempo_extra' then
    v_cantidad := 1;
    update public.profiles as pr set tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1 where pr.id = v_user;
  elsif v_premio = 'escudo' then
    v_cantidad := 1;
    update public.profiles as pr set escudos_extra_pendientes = pr.escudos_extra_pendientes + 1 where pr.id = v_user;
  elsif v_premio like 'cosmetico_%' then
    select * into v_item from public.catalogo_cosmeticos c
    where c.en_capsulas and c.rareza = replace(v_premio, 'cosmetico_', '')
    order by random() limit 1;
    v_slug := v_item.slug;
    v_nombre := v_item.nombre;
    v_rareza := v_item.rareza;
    if public._tiene_cosmetico(v_user, v_item.slug) then
      v_convertido := true;
      v_cantidad := greatest(100, v_item.precio / 3);
      perform public._dar_chispas(v_user, v_cantidad);
    else
      perform public._dar_cosmetico(v_user, v_item.slug);
      v_nuevo_raro := v_item.rareza <> 'comun';
    end if;
  elsif v_premio = 'coleccion' then
    -- Una pieza de la colección de esa ciudad que todavía no tengas
    -- (estela y efecto pesan 40, el título 20). Si ya tienes todas: Chispas.
    select * into v_item from public.catalogo_cosmeticos c
    where c.mundo = v_cap.mundo and not c.vendible and c.en_capsulas and not public._tiene_cosmetico(v_user, c.slug)
    order by -ln(1 - random()) / (case c.categoria when 'titulo' then 20 else 40 end)
    limit 1;
    if found then
      v_slug := v_item.slug;
      v_nombre := v_item.nombre;
      v_rareza := v_item.rareza;
      perform public._dar_cosmetico(v_user, v_item.slug);
      v_nuevo_raro := true;
    else
      v_premio := 'chispas';
      v_cantidad := 300 + (floor(random() * 61)::integer * 5);
      perform public._dar_chispas(v_user, v_cantidad);
    end if;
  elsif v_premio = 'marco_coleccion' then
    select * into v_item from public.catalogo_cosmeticos c where c.slug = 'marco_coleccion_' || v_cap.mundo;
    v_slug := v_item.slug;
    v_nombre := v_item.nombre;
    v_rareza := v_item.rareza;
    perform public._dar_cosmetico(v_user, v_item.slug);
    v_nuevo_raro := true;
  end if;

  update public.profiles as pr
  set capsulas_sin_raro = case when v_nuevo_raro then 0 else least(pr.capsulas_sin_raro + 1, 100) end
  where pr.id = v_user;

  update public.capsulas_usuario as c
  set abierta_at = now(),
      premio = jsonb_build_object('premio', v_premio, 'slug', v_slug, 'nombre', v_nombre, 'rareza', v_rareza, 'cantidad', v_cantidad, 'convertido', v_convertido)
  where c.id = p_id;

  return query select v_premio, v_slug, v_nombre, v_rareza, v_cantidad, v_convertido, pr.puntos_total
    from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.abrir_capsula(uuid) from public, anon;
grant execute on function public.abrir_capsula(uuid) to authenticated;

-- ---------- 2) Catálogo de paquetes ----------
create table if not exists public.paquetes_capsulas (
  slug text primary key,
  tipo text not null,
  cantidad integer not null check (cantidad between 1 and 20),
  cometas integer not null check (cometas > 0),
  -- Sin tema: siempre a la venta. Con tema: solo mientras su evento está abierto.
  tema text,
  orden integer not null default 0,
  activo boolean not null default true
);
alter table public.paquetes_capsulas enable row level security;
drop policy if exists "paquetes visibles" on public.paquetes_capsulas;
create policy "paquetes visibles" on public.paquetes_capsulas for select using (true);

insert into public.paquetes_capsulas (slug, tipo, cantidad, cometas, tema, orden) values
  ('lote_estelar', 'estelar', 5, 500, null, 10),
  ('lote_supernova', 'supernova', 3, 750, null, 20),
  ('halloween_x1', 'temporada', 1, 150, 'halloween', 1),
  ('halloween_x5', 'temporada', 5, 600, 'halloween', 2)
on conflict (slug) do update set tipo = excluded.tipo, cantidad = excluded.cantidad, cometas = excluded.cometas, tema = excluded.tema, orden = excluded.orden;

-- El evento abierto ahora de una fiesta (null si no hay).
create or replace function public._evento_abierto_de_tema(p_tema text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select e.slug from public.eventos e
  where e.tema = p_tema
    and now() >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
    and (now() at time zone 'UTC')::date <= e.hasta
  order by e.desde desc
  limit 1;
$$;
revoke execute on function public._evento_abierto_de_tema(text) from public, anon, authenticated;

-- Los paquetes a la venta ahora (los de temporada, con su evento).
create or replace function public.paquetes_capsulas_disponibles()
returns table (slug text, tipo text, cantidad integer, cometas integer, tema text, evento text, hasta date)
language sql
stable
security definer
set search_path = public
as $$
  select p.slug, p.tipo, p.cantidad, p.cometas, p.tema, ev.slug, ev.hasta
  from public.paquetes_capsulas p
  left join lateral (
    select e.slug, e.hasta from public.eventos e
    where e.slug = public._evento_abierto_de_tema(p.tema)
  ) ev on true
  where p.activo and (p.tema is null or ev.slug is not null)
  order by p.tema is null, p.orden;
$$;
grant execute on function public.paquetes_capsulas_disponibles() to anon, authenticated;

create or replace function public.comprar_paquete_capsulas(p_slug text)
returns table (cantidad integer, cometas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_p public.paquetes_capsulas%rowtype;
  v_evento text;
  v_saldo integer;
  v_compra uuid := gen_random_uuid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_p from public.paquetes_capsulas p where p.slug = p_slug and p.activo;
  if not found then
    raise exception 'paquete invalido';
  end if;
  if v_p.tema is not null then
    v_evento := public._evento_abierto_de_tema(v_p.tema);
    if v_evento is null then
      raise exception 'este paquete ya no esta a la venta';
    end if;
  end if;
  select pr.cometas into v_saldo from public.profiles pr where pr.id = v_user for update;
  if coalesce(v_saldo, 0) < v_p.cometas then
    raise exception 'te faltan Cometas: este paquete cuesta % Cometas', v_p.cometas;
  end if;

  insert into public.capsulas_usuario (user_id, tipo, mundo, origen, detalle)
  select v_user, v_p.tipo, v_p.tema, 'paquete:' || v_p.slug || ':' || v_compra || ':' || g,
    case when v_evento is null then null else jsonb_build_object('evento', v_evento) end
  from generate_series(1, v_p.cantidad) g;
  insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia)
  values (v_user, -v_p.cometas, 'paquete_capsulas', 'paquete:' || v_p.slug || ':' || v_compra);
  update public.profiles as pr set cometas = pr.cometas - v_p.cometas where pr.id = v_user;

  return query select v_p.cantidad, pr.cometas from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.comprar_paquete_capsulas(text) from public, anon;
grant execute on function public.comprar_paquete_capsulas(text) to authenticated;
