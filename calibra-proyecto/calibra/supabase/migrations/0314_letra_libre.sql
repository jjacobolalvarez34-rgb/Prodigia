-- ============================================================
-- Prodigia — Letra libre (0314).
--
-- Pedido del 2026-11-06: «poder cambiar la fuente de TODA la app, como un token que
-- vendemos». La Letra libre es un desbloqueo único y solo cosmético (sin ventaja): con
-- ella eliges la letra de títulos de toda la app (web y teléfono) entre las letras de
-- los temas (LETRAS_APP en src/lib/recompensas/temas.ts). Gana sobre la letra del tema.
--   1) Categoría nueva 'letra_app' en el catálogo, con una sola fila: letra_libre
--      (épica; 400 Cometas; vendible = false y en_capsulas = false, igual que los
--      temas: no se vende con Chispas ni sale en las cápsulas comunes). Columnas
--      profiles.letra_libre (si la tienes) y profiles.letra_app (la elegida; null = la
--      del tema). _tiene_cosmetico y _dar_cosmetico (base: 0297) aprenden la categoría.
--      Las columnas nuevas no se pueden escribir desde el cliente (profiles solo da
--      permiso de update por columna): se cambian con las funciones de abajo.
--   2) Se compra con Cometas: comprar_letra_libre(), mismo camino que comprar_tema_app.
--   3) Sale en las cápsulas que traen temas (prisma, supernova, Alineación y Pro): el
--      premio 'tema_app' de abrir_capsula (base: 0297) sortea entre los temas y la
--      Letra libre que no tengas.
--   4) elegir_letra_app(p_letra): guarda la letra elegida si tienes la Letra libre.
-- Mismos datos que LETRA_LIBRE y LETRAS_APP (temas.ts); temas.test.ts los compara.
-- Requiere 0279 y 0297. Idempotente.
-- ============================================================

-- ---------- 1) Columnas, categoría y fila del catálogo ----------
alter table public.profiles add column if not exists letra_libre boolean not null default false;
alter table public.profiles add column if not exists letra_app text;

alter table public.catalogo_cosmeticos drop constraint if exists catalogo_cosmeticos_categoria_check;
alter table public.catalogo_cosmeticos add constraint catalogo_cosmeticos_categoria_check
  check (categoria in ('marco', 'fuente', 'animacion', 'fondo', 'estela', 'efecto', 'sonido', 'emote', 'ciudad_placa', 'titulo', 'fuente_puntos', 'tema', 'letra_app'));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada, precio_cometas) values
  ('letra_libre', 'letra_app', 'libre', 'Letra libre', 'epico', 3000, false, false, null, null, 400)
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
    when 'letra_app' then v_p.letra_libre
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
  elsif v_c.categoria = 'letra_app' then
    update public.profiles as pr set letra_libre = true where pr.id = p_user;
  end if;
  return true;
end;
$$;
revoke execute on function public._dar_cosmetico(uuid, text) from public, anon, authenticated;

-- ---------- 2) Comprar la Letra libre con Cometas ----------
create or replace function public.comprar_letra_libre()
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
  select * into v_item from public.catalogo_cosmeticos c where c.slug = 'letra_libre';
  if not found or v_item.precio_cometas is null then
    raise exception 'la Letra libre no esta a la venta';
  end if;
  -- Un pedido a la vez por persona (la web y el teléfono al mismo tiempo).
  select pr.cometas into v_saldo from public.profiles pr where pr.id = v_user for update;
  if public._tiene_cosmetico(v_user, v_item.slug) then
    raise exception 'ya tienes la Letra libre';
  end if;
  if coalesce(v_saldo, 0) < v_item.precio_cometas then
    raise exception 'te faltan Cometas: la Letra libre cuesta % Cometas', v_item.precio_cometas;
  end if;
  insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia)
  values (v_user, -v_item.precio_cometas, 'letra', 'letra:' || v_item.valor);
  update public.profiles as pr set cometas = pr.cometas - v_item.precio_cometas where pr.id = v_user;
  perform public._dar_cosmetico(v_user, v_item.slug);
  return query select pr.cometas from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.comprar_letra_libre() from public, anon;
grant execute on function public.comprar_letra_libre() to authenticated;

-- ---------- 3) Cápsulas: la Letra libre junto a los temas ----------
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

  -- Tema de la app (0297) o la Letra libre (0314): uno que no tengas, los más baratos
  -- más seguido (peso 1/precio en Cometas). Si ya los tienes todos, uno al azar
  -- convertido en Chispas, igual que un cosmético repetido (un tercio del precio de su
  -- rareza).
  if v_premio = 'tema_app' then
    select c.* into v_item from public.catalogo_cosmeticos c
    where c.categoria in ('tema', 'letra_app') and not public._tiene_cosmetico(v_user, c.slug)
    order by -ln(1 - random()) * coalesce(c.precio_cometas, 500)
    limit 1;
    if found then
      v_slug := v_item.slug;
      v_nombre := v_item.nombre;
      v_rareza := v_item.rareza;
      perform public._dar_cosmetico(v_user, v_item.slug);
    else
      select c.* into v_item from public.catalogo_cosmeticos c where c.categoria in ('tema', 'letra_app') order by random() limit 1;
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

-- ---------- 4) Elegir la letra ----------
-- p_letra null = la del tema. Las letras válidas son las de LETRAS_APP (temas.ts).
create or replace function public.elegir_letra_app(p_letra text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_tiene boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.letra_libre into v_tiene from public.profiles pr where pr.id = v_user;
  if not coalesce(v_tiene, false) then
    raise exception 'necesitas la Letra libre';
  end if;
  if p_letra is not null and p_letra not in ('siempre', 'cartel', 'aventura', 'redonda', 'pixel', 'maquina', 'romana', 'imprenta', 'marcador', 'consola', 'retro', 'arcade', 'cursiva') then
    raise exception 'letra invalida';
  end if;
  update public.profiles as pr set letra_app = p_letra where pr.id = v_user;
end;
$$;
revoke execute on function public.elegir_letra_app(text) from public, anon;
grant execute on function public.elegir_letra_app(text) to authenticated;
