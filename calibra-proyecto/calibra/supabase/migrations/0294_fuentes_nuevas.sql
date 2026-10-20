-- ============================================================
-- Prodigia — Fuentes nuevas (0294).
--
-- Diseño aprobado el 2026-10-19 (galería «fuentes»):
--   1) 16 fuentes de nombre nuevas (se suman a las 9 de siempre), en el catálogo como
--      categoría 'fuente' (las compra comprar_item_tienda y las entrega _dar_cosmetico,
--      que ya sabe de fuentes; se equipan con elegir_fuente_nombre).
--   2) Cosmético nuevo: FUENTES DE PUNTOS, cómo se ve el «+N» al acertar. Categoría
--      'fuente_puntos', columnas profiles.fuente_puntos ('clasica' = la de siempre) y
--      profiles.fuentes_puntos_desbloqueadas. Se equipa con equipar_cosmetico.
-- Mismos datos que FUENTES_NOMBRE_NUEVAS y FUENTES_PUNTOS de
-- src/lib/recompensas/catalogoAmpliado.ts. Requiere 0248. Idempotente.
-- ============================================================

alter table public.profiles add column if not exists fuente_puntos text not null default 'clasica';
alter table public.profiles add column if not exists fuentes_puntos_desbloqueadas text[] not null default '{}';

alter table public.profiles drop constraint if exists profiles_fuente_nombre_check;
alter table public.profiles add constraint profiles_fuente_nombre_check
  check (fuente_nombre in ('default', 'mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista', 'urbana', 'elegante',
    'letrero', 'retro', 'deportiva', 'pixel', 'neon', 'cursiva_gruesa', 'marcador', 'romana', 'comic', 'redonda', 'espacial', 'estencil', 'glitch', 'pantalla', 'caricatura', 'maquina'));

alter table public.catalogo_cosmeticos drop constraint if exists catalogo_cosmeticos_categoria_check;
alter table public.catalogo_cosmeticos add constraint catalogo_cosmeticos_categoria_check
  check (categoria in ('marco', 'fuente', 'animacion', 'fondo', 'estela', 'efecto', 'sonido', 'emote', 'ciudad_placa', 'titulo', 'fuente_puntos'));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
  ('fuente_letrero', 'fuente', 'letrero', 'Fuente Letrero', 'comun', 400, true, true, null, null),
  ('fuente_retro', 'fuente', 'retro', 'Fuente Retro', 'comun', 400, true, true, null, null),
  ('fuente_deportiva', 'fuente', 'deportiva', 'Fuente Deportiva', 'comun', 400, true, true, null, null),
  ('fuente_pixel', 'fuente', 'pixel', 'Fuente Pixel', 'comun', 400, true, true, null, null),
  ('fuente_neon', 'fuente', 'neon', 'Fuente Neón', 'comun', 400, true, true, null, null),
  ('fuente_cursiva_gruesa', 'fuente', 'cursiva_gruesa', 'Fuente Cursiva gruesa', 'comun', 400, true, true, null, null),
  ('fuente_marcador', 'fuente', 'marcador', 'Fuente Marcador', 'raro', 700, true, true, null, null),
  ('fuente_romana', 'fuente', 'romana', 'Fuente Romana', 'raro', 700, true, true, null, null),
  ('fuente_comic', 'fuente', 'comic', 'Fuente Cómic', 'raro', 700, true, true, null, null),
  ('fuente_redonda', 'fuente', 'redonda', 'Fuente Redonda', 'raro', 700, true, true, null, null),
  ('fuente_espacial', 'fuente', 'espacial', 'Fuente Espacial', 'raro', 700, true, true, null, null),
  ('fuente_estencil', 'fuente', 'estencil', 'Fuente Esténcil', 'raro', 700, true, true, null, null),
  ('fuente_glitch', 'fuente', 'glitch', 'Fuente Glitch', 'epico', 1000, true, true, null, null),
  ('fuente_pantalla', 'fuente', 'pantalla', 'Fuente Pantalla', 'epico', 1000, true, true, null, null),
  ('fuente_caricatura', 'fuente', 'caricatura', 'Fuente Caricatura', 'epico', 1000, true, true, null, null),
  ('fuente_maquina', 'fuente', 'maquina', 'Fuente Máquina de escribir', 'epico', 1000, true, true, null, null),
  ('puntos_arcade', 'fuente_puntos', 'arcade', 'Puntos Arcade', 'comun', 300, true, true, null, null),
  ('puntos_comic', 'fuente_puntos', 'comic', 'Puntos Cómic', 'comun', 300, true, true, null, null),
  ('puntos_pizarra', 'fuente_puntos', 'pizarra', 'Puntos Pizarra', 'comun', 300, true, true, null, null),
  ('puntos_caramelo', 'fuente_puntos', 'caramelo', 'Puntos Caramelo', 'raro', 600, true, true, null, null),
  ('puntos_pixel', 'fuente_puntos', 'pixel', 'Puntos Pixel', 'raro', 600, true, true, null, null),
  ('puntos_neon', 'fuente_puntos', 'neon', 'Puntos Neón', 'epico', 1200, true, true, null, null),
  ('puntos_fuego', 'fuente_puntos', 'fuego', 'Puntos Fuego', 'epico', 1200, true, true, null, null),
  ('puntos_glitch', 'fuente_puntos', 'glitch', 'Puntos Glitch', 'epico', 1200, true, true, null, null),
  ('puntos_dorada', 'fuente_puntos', 'dorada', 'Puntos Dorada', 'legendario', 6000, true, true, null, null)
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

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
  else
    raise exception 'categoria invalida';
  end if;
end;
$$;
revoke execute on function public.equipar_cosmetico(text, text) from public, anon;
grant execute on function public.equipar_cosmetico(text, text) to authenticated;
