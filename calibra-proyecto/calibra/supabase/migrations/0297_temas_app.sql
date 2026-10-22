-- ============================================================
-- Prodigia — Temas de la app (0297).
--
-- Pedido del 2026-10-20/21: los 12 temas de la app (src/lib/recompensas/temas.ts)
-- dejan de ser «Próximamente». Son SOLO piel visual (colores de fondo, tarjetas,
-- bordes, textos y botones); el contenido y las pantallas no cambian.
--   1) Categoría nueva 'tema' en el catálogo: columnas profiles.tema_app (el puesto;
--      'clasico' = Noche de Prodigia, el de siempre) y profiles.temas_app_desbloqueados.
--      Las filas no se venden con Chispas ni salen en las cápsulas comunes
--      (vendible = false, en_capsulas = false): el precio en Chispas es el de su rareza
--      (0280) y sirve solo para convertir un repetido. _tiene_cosmetico,
--      _dar_cosmetico y equipar_cosmetico (base: 0294) aprenden la categoría.
--   2) Se compran con Cometas: comprar_tema_app(p_tema), precio según la rareza
--      (común 200, raro 350, épico 500, legendario 750; columna precio_cometas).
--   3) Salen en las cápsulas más poderosas (prisma, supernova, Alineación y Pro):
--      premio nuevo 'tema_app' en contenido_capsula y su rama en abrir_capsula (base:
--      0291). Trae un tema que no tengas (los más baratos más seguido); si ya los
--      tienes todos, se convierte en Chispas como un repetido. Cuenta como algo raro
--      para la garantía de 10 seguidas.
-- Mismos datos que TEMAS_APP (temas.ts) y CONTENIDO_CAPSULAS (contenidoCapsulas.ts);
-- temas.test.ts y contenidoCapsulas.test.ts los comparan con este archivo.
-- Requiere 0280, 0291 y 0294. Idempotente.
-- ============================================================

-- ---------- 1) Columnas y categoría ----------
alter table public.profiles add column if not exists tema_app text not null default 'clasico';
alter table public.profiles add column if not exists temas_app_desbloqueados text[] not null default '{}';

alter table public.catalogo_cosmeticos drop constraint if exists catalogo_cosmeticos_categoria_check;
alter table public.catalogo_cosmeticos add constraint catalogo_cosmeticos_categoria_check
  check (categoria in ('marco', 'fuente', 'animacion', 'fondo', 'estela', 'efecto', 'sonido', 'emote', 'ciudad_placa', 'titulo', 'fuente_puntos', 'tema'));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada, precio_cometas) values
  ('tema_roguelike', 'tema', 'roguelike', 'Tema Mesa de cartas', 'epico', 3000, false, false, null, null, 500),
  ('tema_rpg', 'tema', 'rpg', 'Tema Reino', 'epico', 3000, false, false, null, null, 500),
  ('tema_cozy', 'tema', 'cozy', 'Tema Huerto', 'raro', 1200, false, false, null, null, 350),
  ('tema_portatil', 'tema', 'portatil', 'Tema Portátil', 'comun', 400, false, false, null, null, 200),
  ('tema_academia', 'tema', 'academia', 'Tema Biblioteca', 'epico', 3000, false, false, null, null, 500),
  ('tema_mitologia', 'tema', 'mitologia', 'Tema Olimpo', 'legendario', 6000, false, false, null, null, 750),
  ('tema_suizo', 'tema', 'suizo', 'Tema Imprenta', 'comun', 400, false, false, null, null, 200),
  ('tema_papeleria', 'tema', 'papeleria', 'Tema Cuaderno', 'comun', 400, false, false, null, null, 200),
  ('tema_espacial', 'tema', 'espacial', 'Tema Misión', 'raro', 1200, false, false, null, null, 350),
  ('tema_geometria', 'tema', 'geometria', 'Tema Atardecer', 'raro', 1200, false, false, null, null, 350),
  ('tema_arcade', 'tema', 'arcade', 'Tema Recreativa', 'legendario', 6000, false, false, null, null, 750),
  ('tema_atlas', 'tema', 'atlas', 'Tema Atlas', 'raro', 1200, false, false, null, null, 350)
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas, precio_cometas = excluded.precio_cometas;

create or replace function public._tiene_cosmetico(p_user uuid, p_slug text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_c public.catalogo_cosmeticos%rowtype;
  v_p public.profiles%rowtype;
begin
  select * into v_c from public.catalogo_cosmeticos where slug = p_slug;
  if not found then
    return false;
  end if;
  select * into v_p from public.profiles where id = p_user;
  if not found then
    return false;
  end if;
  return case v_c.categoria
    when 'marco' then v_c.valor = any(v_p.marcos_desbloqueados)
    when 'fuente' then v_c.valor = any(v_p.fuentes_desbloqueadas)
    when 'animacion' then v_c.valor = any(v_p.animaciones_desbloqueadas)
    when 'fondo' then v_c.valor = any(v_p.fondos_desbloqueados)
    when 'estela' then v_c.valor = any(v_p.estelas_desbloqueadas)
    when 'efecto' then v_c.valor = any(v_p.efectos_desbloqueados)
    when 'sonido' then v_c.valor = any(v_p.sonidos_desbloqueados)
    when 'emote' then v_c.valor = any(v_p.emotes_desbloqueados)
    when 'ciudad_placa' then v_c.valor = any(v_p.ciudades_placa_desbloqueadas)
    when 'titulo' then exists (select 1 from public.titulos_usuario t where t.user_id = p_user and t.slug = v_c.valor)
    when 'fuente_puntos' then v_c.valor = any(v_p.fuentes_puntos_desbloqueadas)
    when 'tema' then v_c.valor = any(v_p.temas_app_desbloqueados)
    else false
  end;
end;
$$;
revoke execute on function public._tiene_cosmetico(uuid, text) from public, anon, authenticated;

create or replace function public._dar_cosmetico(p_user uuid, p_slug text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_c public.catalogo_cosmeticos%rowtype;
begin
  select * into v_c from public.catalogo_cosmeticos where slug = p_slug;
  if not found then
    raise exception 'cosmetico desconocido: %', p_slug;
  end if;
  if public._tiene_cosmetico(p_user, p_slug) then
    return false;
  end if;
  if v_c.categoria = 'marco' then
    update public.profiles as pr set marcos_desbloqueados = array_append(pr.marcos_desbloqueados, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'fuente' then
    update public.profiles as pr set fuentes_desbloqueadas = array_append(pr.fuentes_desbloqueadas, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'animacion' then
    update public.profiles as pr set animaciones_desbloqueadas = array_append(pr.animaciones_desbloqueadas, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'fondo' then
    update public.profiles as pr set fondos_desbloqueados = array_append(pr.fondos_desbloqueados, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'estela' then
    update public.profiles as pr set estelas_desbloqueadas = array_append(pr.estelas_desbloqueadas, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'efecto' then
    update public.profiles as pr set efectos_desbloqueados = array_append(pr.efectos_desbloqueados, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'sonido' then
    update public.profiles as pr set sonidos_desbloqueados = array_append(pr.sonidos_desbloqueados, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'emote' then
    update public.profiles as pr set emotes_desbloqueados = array_append(pr.emotes_desbloqueados, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'ciudad_placa' then
    update public.profiles as pr set ciudades_placa_desbloqueadas = array_append(pr.ciudades_placa_desbloqueadas, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'titulo' then
    perform public.desbloquear_titulo(p_user, v_c.valor, v_c.nombre, 'tienda');
  elsif v_c.categoria = 'fuente_puntos' then
    update public.profiles as pr set fuentes_puntos_desbloqueadas = array_append(pr.fuentes_puntos_desbloqueadas, v_c.valor) where pr.id = p_user;
  elsif v_c.categoria = 'tema' then
    update public.profiles as pr set temas_app_desbloqueados = array_append(pr.temas_app_desbloqueados, v_c.valor) where pr.id = p_user;
  end if;
  return true;
end;
$$;
revoke execute on function public._dar_cosmetico(uuid, text) from public, anon, authenticated;

create or replace function public.equipar_cosmetico(p_categoria text, p_valor text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_p public.profiles%rowtype;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_p from public.profiles where id = v_user;
  if p_categoria = 'estela' then
    if p_valor <> 'clasica' and not (p_valor = any(v_p.estelas_desbloqueadas)) then
      raise exception 'estela no desbloqueada';
    end if;
    update public.profiles set estela_racha = p_valor where id = v_user;
  elsif p_categoria = 'efecto' then
    if p_valor <> 'chispas' and not (p_valor = any(v_p.efectos_desbloqueados)) then
      raise exception 'efecto no desbloqueado';
    end if;
    update public.profiles set efecto_acierto = p_valor where id = v_user;
  elsif p_categoria = 'sonido' then
    if p_valor <> 'clasico' and not (p_valor = any(v_p.sonidos_desbloqueados)) then
      raise exception 'sonido no desbloqueado';
    end if;
    update public.profiles set sonido_acierto = p_valor where id = v_user;
  elsif p_categoria = 'ciudad_placa' then
    if p_valor is not null and not (p_valor = any(v_p.ciudades_placa_desbloqueadas)) then
      raise exception 'ciudad no desbloqueada';
    end if;
    update public.profiles set ciudad_placa = p_valor where id = v_user;
  elsif p_categoria = 'fuente_puntos' then
    if p_valor <> 'clasica' and not (p_valor = any(v_p.fuentes_puntos_desbloqueadas)) then
      raise exception 'fuente no desbloqueada';
    end if;
    update public.profiles set fuente_puntos = p_valor where id = v_user;
  elsif p_categoria = 'fuente' then
    if p_valor <> 'default' and not (p_valor = any(v_p.fuentes_desbloqueadas)) then
      raise exception 'fuente no desbloqueada';
    end if;
    update public.profiles set fuente_nombre = p_valor where id = v_user;
  elsif p_categoria = 'tema' then
    -- 'clasico' (Noche de Prodigia) siempre se puede volver a poner.
    if p_valor is null or (p_valor <> 'clasico' and not (p_valor = any(v_p.temas_app_desbloqueados))) then
      raise exception 'tema no desbloqueado';
    end if;
    update public.profiles as pr set tema_app = p_valor where pr.id = v_user;
  else
    raise exception 'categoria invalida';
  end if;
end;
$$;
revoke execute on function public.equipar_cosmetico(text, text) from public, anon;
grant execute on function public.equipar_cosmetico(text, text) to authenticated;

-- ---------- 2) Comprar un tema con Cometas ----------
create or replace function public.comprar_tema_app(p_tema text)
returns table (cometas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_item public.catalogo_cosmeticos%rowtype;
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_item from public.catalogo_cosmeticos c where c.categoria = 'tema' and c.valor = p_tema;
  if not found then
    raise exception 'tema invalido';
  end if;
  if v_item.precio_cometas is null then
    raise exception 'este tema no esta a la venta';
  end if;
  -- Un pedido a la vez por persona (la web y el teléfono al mismo tiempo).
  select pr.cometas into v_saldo from public.profiles pr where pr.id = v_user for update;
  if public._tiene_cosmetico(v_user, v_item.slug) then
    raise exception 'ya tienes este tema';
  end if;
  if coalesce(v_saldo, 0) < v_item.precio_cometas then
    raise exception 'te faltan Cometas: este tema cuesta % Cometas', v_item.precio_cometas;
  end if;
  insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia)
  values (v_user, -v_item.precio_cometas, 'tema', 'tema:' || v_item.valor);
  update public.profiles as pr set cometas = pr.cometas - v_item.precio_cometas where pr.id = v_user;
  perform public._dar_cosmetico(v_user, v_item.slug);
  return query select pr.cometas from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.comprar_tema_app(text) from public, anon;
grant execute on function public.comprar_tema_app(text) to authenticated;

-- ---------- 3) Cápsulas: el tema como premio ----------
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
    ('pro', 'cosmetico_epico', 50, 1, 1),
    ('pro', 'cosmetico_legendario', 27, 1, 1),
    ('pro', 'chispas', 15, 150, 300),
    ('pro', 'tema_app', 8, 1, 1),
    ('estelar', 'cosmetico_raro', 50, 1, 1),
    ('estelar', 'cosmetico_epico', 40, 1, 1),
    ('estelar', 'cosmetico_legendario', 10, 1, 1),
    ('supernova', 'cosmetico_epico', 55, 1, 1),
    ('supernova', 'cosmetico_legendario', 35, 1, 1),
    ('supernova', 'tema_app', 10, 1, 1),
    ('plata', 'chispas', 40, 150, 260),
    ('plata', 'cosmetico_comun', 30, 1, 1),
    ('plata', 'cosmetico_raro', 30, 1, 1),
    ('oro', 'cosmetico_raro', 50, 1, 1),
    ('oro', 'cosmetico_epico', 35, 1, 1),
    ('oro', 'chispas', 15, 250, 400),
    ('prisma', 'cosmetico_epico', 55, 1, 1),
    ('prisma', 'cosmetico_legendario', 35, 1, 1),
    ('prisma', 'tema_app', 10, 1, 1),
    ('alineacion', 'cosmetico_epico', 65, 1, 1),
    ('alineacion', 'cosmetico_legendario', 27, 1, 1),
    ('alineacion', 'tema_app', 8, 1, 1),
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
  if coalesce(v_sin_raro, 0) >= 10 and v_premio not in ('cosmetico_raro', 'cosmetico_epico', 'cosmetico_legendario', 'coleccion', 'marco_coleccion', 'pieza_evento', 'tema_app') then
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

  -- Tema de la app (0297): uno que no tengas, los más baratos más seguido (peso
  -- 1/precio en Cometas). Si ya los tienes todos, uno al azar convertido en Chispas,
  -- igual que un cosmético repetido (un tercio del precio de su rareza).
  if v_premio = 'tema_app' then
    select c.* into v_item from public.catalogo_cosmeticos c
    where c.categoria = 'tema' and not public._tiene_cosmetico(v_user, c.slug)
    order by -ln(1 - random()) * coalesce(c.precio_cometas, 500)
    limit 1;
    if found then
      v_slug := v_item.slug;
      v_nombre := v_item.nombre;
      v_rareza := v_item.rareza;
      perform public._dar_cosmetico(v_user, v_item.slug);
    else
      select c.* into v_item from public.catalogo_cosmeticos c where c.categoria = 'tema' order by random() limit 1;
      v_slug := v_item.slug;
      v_nombre := v_item.nombre;
      v_rareza := v_item.rareza;
      v_convertido := true;
      v_cantidad := greatest(100, coalesce(v_item.precio, 300) / 3);
      perform public._dar_chispas(v_user, v_cantidad);
    end if;
    v_nuevo_raro := true;
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
