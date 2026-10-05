-- ============================================================
-- Prodigia — Tienda ampliada (docs/economy/PROPUESTA_TIENDA_Y_RECOMPENSAS.md §2,
-- aprobada por el usuario el 2026-10-05). Va en la web y en la app a la vez
-- (docs/PARIDAD_APP_WEB.md).
--
-- 1) Columnas nuevas del perfil: estela de racha, efecto y sonido de acierto,
--    emotes de duelo, ciudad de la Placa, pistas, segundas oportunidades y el
--    contador de la garantía de las cápsulas. Sin GRANT UPDATE: solo las tocan
--    las funciones security definer de abajo.
-- 2) catalogo_cosmeticos: UNA tabla con todos los cosméticos (los de antes y
--    los nuevos) con su categoría, rareza y precio. La usan comprar_item_tienda
--    (precios de lo nuevo), las cápsulas (0249, qué puede salir de cada rareza)
--    y las colecciones por ciudad. src/lib/recompensas/catalogo.ts es su espejo
--    en TypeScript (un test compara los precios).
-- 3) paquetes_tienda: juegos temáticos con −25 % sobre la suma.
-- 4) comprar_item_tienda (base VIGENTE: 0202_marcos_neon.sql, sin redefinir
--    después): mismo cuerpo + lo nuevo del catálogo, los paquetes, los marcos
--    de temporada (solo en su mes) y 3 utilidades (pista, segunda oportunidad,
--    cofre de 3 hielos). Misma forma de salida: create or replace alcanza.
-- 5) equipar_cosmetico: estela, efecto, sonido y ciudad de la Placa.
-- 6) usar_ayuda_partida: gasta una pista o una segunda oportunidad.
-- 7) Checks de marco_perfil (+ temporada y colección) y fondo_perfil (+ los
--    13 fondos de ciudad).
--
-- Requiere 0202 (marcos neón), 0148 (consumibles), 0043 (títulos). Idempotente.
-- ============================================================

-- ---------- 1) columnas del perfil ----------
alter table public.profiles
  add column if not exists estela_racha text not null default 'clasica',
  add column if not exists estelas_desbloqueadas text[] not null default '{}',
  add column if not exists efecto_acierto text not null default 'chispas',
  add column if not exists efectos_desbloqueados text[] not null default '{}',
  add column if not exists sonido_acierto text not null default 'clasico',
  add column if not exists sonidos_desbloqueados text[] not null default '{}',
  add column if not exists emotes_desbloqueados text[] not null default array['bien_jugado', 'hola'],
  add column if not exists ciudad_placa text,
  add column if not exists ciudades_placa_desbloqueadas text[] not null default '{}',
  add column if not exists pistas_disponibles smallint not null default 0,
  add column if not exists segundas_oportunidades_disponibles smallint not null default 0,
  add column if not exists capsulas_sin_raro smallint not null default 0,
  add column if not exists capsulas_nivel_base integer not null default 1;

alter table public.profiles drop constraint if exists profiles_pistas_no_negativas;
alter table public.profiles add constraint profiles_pistas_no_negativas
  check (pistas_disponibles >= 0 and segundas_oportunidades_disponibles >= 0);

-- Las cápsulas de nivel cuentan desde el nivel que cada uno tiene hoy (no se
-- regalan de golpe todos los niveles ya subidos). Solo la primera vez.
update public.profiles
set capsulas_nivel_base = greatest(coalesce(nivel_cuenta, 1), 1)
where capsulas_nivel_base = 1 and coalesce(nivel_cuenta, 1) > 1;

-- ---------- 7) checks de marco y fondo ----------
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (
    'ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio',
    'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia',
    'neon_violeta', 'neon_cian', 'neon_magenta',
    'temporada_aurora', 'temporada_brasas', 'temporada_escarcha', 'temporada_cosmos',
    'coleccion_numeria', 'coleccion_enigmia', 'coleccion_geografia', 'coleccion_quimia', 'coleccion_anatomia', 'coleccion_melodia',
    'coleccion_trigonometria', 'coleccion_historia', 'coleccion_calculia', 'coleccion_circuitia', 'coleccion_estadistica', 'coleccion_naipia', 'coleccion_codia'
  ));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in (
    'ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque', 'personalizado', 'prodigio',
    'ciudad_numeria', 'ciudad_enigmia', 'ciudad_geografia', 'ciudad_quimia', 'ciudad_anatomia', 'ciudad_melodia',
    'ciudad_trigonometria', 'ciudad_historia', 'ciudad_calculia', 'ciudad_circuitia', 'ciudad_estadistica', 'ciudad_naipia', 'ciudad_codia'
  ));

-- ---------- 2) catálogo ----------
create table if not exists public.catalogo_cosmeticos (
  slug text primary key,
  categoria text not null check (categoria in ('marco', 'fuente', 'animacion', 'fondo', 'estela', 'efecto', 'sonido', 'emote', 'ciudad_placa', 'titulo')),
  valor text not null,
  nombre text not null,
  rareza text not null check (rareza in ('comun', 'raro', 'epico', 'legendario')),
  -- Precio en Chispas; en lo que no se vende es el valor de referencia para
  -- convertir un repetido en Chispas (precio ÷ 3).
  precio integer not null check (precio > 0),
  vendible boolean not null default true,
  en_capsulas boolean not null default true,
  mundo text,
  -- Marcos de temporada: se venden solo en los meses con ((mes − 1) % 4) + 1 = temporada.
  temporada smallint check (temporada between 1 and 4)
);

alter table public.catalogo_cosmeticos enable row level security;
drop policy if exists "catalogo visible para todos" on public.catalogo_cosmeticos;
create policy "catalogo visible para todos" on public.catalogo_cosmeticos for select using (true);
grant select on public.catalogo_cosmeticos to anon, authenticated;

-- Rareza de lo que ya existía: mismos cortes que rarezaDe() de la tienda
-- (≥ 5000 legendario, ≥ 2400 épico, ≥ 1400 raro).
insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
  ('fuente_mono', 'fuente', 'mono', 'Fuente Monoespaciada', 'comun', 1000, true, true, null, null),
  ('fuente_serif', 'fuente', 'serif', 'Fuente Elegante', 'raro', 1400, true, true, null, null),
  ('fuente_manuscrita', 'fuente', 'manuscrita', 'Fuente Manuscrita', 'legendario', 5000, true, true, null, null),
  ('fuente_impacto', 'fuente', 'impacto', 'Fuente Impacto', 'comun', 1200, true, true, null, null),
  ('fuente_script', 'fuente', 'script', 'Fuente Script', 'raro', 1800, true, true, null, null),
  ('fuente_futurista', 'fuente', 'futurista', 'Fuente Futurista', 'epico', 2500, true, true, null, null),
  ('fuente_urbana', 'fuente', 'urbana', 'Fuente Urbana', 'comun', 1200, true, true, null, null),
  ('fuente_elegante', 'fuente', 'elegante', 'Fuente Caligrafía', 'raro', 1800, true, true, null, null),
  ('marco_bronce', 'marco', 'bronce', 'Marco Bronce', 'comun', 1000, true, true, null, null),
  ('marco_plata', 'marco', 'plata', 'Marco Plata', 'comun', 1300, true, true, null, null),
  ('marco_oro', 'marco', 'oro', 'Marco Oro', 'raro', 1700, true, true, null, null),
  ('marco_platino', 'marco', 'platino', 'Marco Platino', 'raro', 2200, true, true, null, null),
  ('marco_diamante', 'marco', 'diamante', 'Marco Diamante', 'epico', 3200, true, true, null, null),
  ('marco_prodigio', 'marco', 'prodigio', 'Marco Prodigio', 'legendario', 5000, true, true, null, null),
  ('marco_neon_violeta', 'marco', 'neon_violeta', 'Neón violeta', 'legendario', 6000, true, true, null, null),
  ('marco_neon_cian', 'marco', 'neon_cian', 'Neón cian', 'legendario', 6000, true, true, null, null),
  ('marco_neon_magenta', 'marco', 'neon_magenta', 'Neón magenta', 'legendario', 6000, true, true, null, null),
  ('animacion_ondulante', 'animacion', 'ondulante', 'Nombre Ondulante', 'comun', 1200, true, true, null, null),
  ('animacion_brillo', 'animacion', 'brillo', 'Nombre con Brillo', 'raro', 1400, true, true, null, null),
  ('animacion_arcoiris', 'animacion', 'arcoiris', 'Nombre Arcoíris', 'raro', 1800, true, true, null, null),
  ('animacion_neon', 'animacion', 'neon', 'Nombre Neón', 'raro', 2200, true, true, null, null),
  ('animacion_glitch', 'animacion', 'glitch', 'Nombre Glitch', 'raro', 2000, true, true, null, null),
  ('animacion_glitch_intenso', 'animacion', 'glitch_intenso', 'Nombre Glitch intenso', 'epico', 2600, true, true, null, null),
  ('animacion_deconstruccion', 'animacion', 'deconstruccion', 'Nombre Deconstrucción', 'epico', 2400, true, true, null, null),
  ('animacion_shuffle', 'animacion', 'shuffle', 'Nombre Shuffle', 'epico', 2800, true, true, null, null),
  ('animacion_decrypted', 'animacion', 'decrypted', 'Nombre Decrypted', 'epico', 2800, true, true, null, null),
  ('fondo_oceano', 'fondo', 'oceano', 'Fondo Azul', 'raro', 1600, true, true, null, null),
  ('fondo_bosque', 'fondo', 'bosque', 'Fondo Verde', 'raro', 1600, true, true, null, null),
  ('fondo_aurora', 'fondo', 'aurora', 'Fondo Multicolor', 'raro', 1600, true, true, null, null),
  ('fondo_dorado', 'fondo', 'dorado', 'Fondo Dorado', 'raro', 1800, true, true, null, null),
  ('fondo_nebulosa', 'fondo', 'nebulosa', 'Fondo Púrpura', 'raro', 2000, true, true, null, null),
  -- Estelas de racha (la llama del sprint)
  ('estela_azul', 'estela', 'azul', 'Estela Azul', 'comun', 1200, true, true, null, null),
  ('estela_esmeralda', 'estela', 'esmeralda', 'Estela Esmeralda', 'raro', 1600, true, true, null, null),
  ('estela_violeta', 'estela', 'violeta', 'Estela Violeta', 'raro', 2000, true, true, null, null),
  ('estela_dorada', 'estela', 'dorada', 'Estela Dorada', 'epico', 2800, true, true, null, null),
  ('estela_arcoiris', 'estela', 'arcoiris', 'Estela Arcoíris', 'epico', 3500, true, true, null, null),
  -- Efectos de acierto
  ('efecto_confeti', 'efecto', 'confeti', 'Confeti', 'comun', 900, true, true, null, null),
  ('efecto_burbujas', 'efecto', 'burbujas', 'Burbujas', 'comun', 1200, true, true, null, null),
  ('efecto_notas', 'efecto', 'notas', 'Notas musicales', 'raro', 1600, true, true, null, null),
  ('efecto_pixeles', 'efecto', 'pixeles', 'Píxeles', 'raro', 2000, true, true, null, null),
  ('efecto_estrellas', 'efecto', 'estrellas', 'Estrellas', 'epico', 2400, true, true, null, null),
  -- Sonidos de acierto
  ('sonido_campanitas', 'sonido', 'campanitas', 'Campanitas', 'comun', 800, true, true, null, null),
  ('sonido_ochobits', 'sonido', 'ochobits', '8 bits', 'comun', 1200, true, true, null, null),
  ('sonido_marimba', 'sonido', 'marimba', 'Marimba', 'raro', 1500, true, true, null, null),
  -- Emotes de duelo (👏 ¡Bien jugado! y 👋 ¡Hola! vienen gratis)
  ('emote_fuego', 'emote', 'fuego', '🔥 ¡Qué ritmo!', 'comun', 400, true, true, null, null),
  ('emote_uy', 'emote', 'uy', '😅 ¡Uy!', 'comun', 400, true, true, null, null),
  ('emote_gg', 'emote', 'gg', '🤝 GG', 'comun', 400, true, true, null, null),
  ('emote_cerebro', 'emote', 'cerebro', '🧠 ¡A pensar!', 'comun', 600, true, true, null, null),
  ('emote_rayo', 'emote', 'rayo', '⚡ ¡Rapidísimo!', 'comun', 600, true, true, null, null),
  ('emote_corona', 'emote', 'corona', '👑 ¡Reinado!', 'comun', 900, true, true, null, null),
  -- Títulos cosméticos (los de logros siguen sin venderse)
  ('titulo_mente_veloz', 'titulo', 'tienda-mente-veloz', 'Mente Veloz', 'raro', 1500, true, true, null, null),
  ('titulo_curiosidad', 'titulo', 'tienda-curiosidad', 'Curiosidad Infinita', 'raro', 1500, true, true, null, null),
  ('titulo_alma_estratega', 'titulo', 'tienda-alma-estratega', 'Alma Estratega', 'raro', 1500, true, true, null, null),
  ('titulo_corazon_valiente', 'titulo', 'tienda-corazon-valiente', 'Corazón Valiente', 'raro', 1500, true, true, null, null),
  ('titulo_luz_ciudad', 'titulo', 'tienda-luz-ciudad', 'Luz de la Ciudad', 'raro', 1500, true, true, null, null),
  -- Marcos de temporada: uno por mes, rotan cada 4 meses
  ('marco_temporada_aurora', 'marco', 'temporada_aurora', 'Marco Aurora', 'epico', 4500, true, false, null, 1),
  ('marco_temporada_brasas', 'marco', 'temporada_brasas', 'Marco Brasas', 'epico', 4500, true, false, null, 2),
  ('marco_temporada_escarcha', 'marco', 'temporada_escarcha', 'Marco Escarcha', 'epico', 4500, true, false, null, 3),
  ('marco_temporada_cosmos', 'marco', 'temporada_cosmos', 'Marco Cosmos', 'epico', 4500, true, false, null, 4)
on conflict (slug) do update set
  categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza,
  precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas,
  mundo = excluded.mundo, temporada = excluded.temporada;

-- Colecciones por ciudad (6 piezas cada una): marco del mundo (ya existía, nivel
-- 40), fondo y emote (se compran), estela, efecto y título (solo en cápsulas de
-- ciudad o de liga). Completarla da el marco animado de colección. Además, la
-- ciudad de la Placa (un skyline detrás del avatar), que se vende aparte.
insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada)
select x.slug, x.categoria, x.valor, x.nombre, x.rareza, x.precio, x.vendible, x.en_capsulas, x.mundo, null
from (
  select 'marco_' || m.slug as slug, 'marco' as categoria, m.slug as valor, 'Marco ' || m.nombre as nombre, 'epico' as rareza, 2400 as precio, true as vendible, false as en_capsulas, m.slug as mundo from (values
    ('numeria', 'Numeria'), ('enigmia', 'Enigmia'), ('geografia', 'Geografía'), ('quimia', 'Quimia'), ('anatomia', 'Anatomía'), ('melodia', 'Melodía'), ('trigonometria', 'Trigonometría'),
    ('historia', 'Historia'), ('calculia', 'Calculia'), ('circuitia', 'Circuitia'), ('estadistica', 'Estadística'), ('naipia', 'Naipia'), ('codia', 'Codia')) as m(slug, nombre)
  union all
  select 'fondo_ciudad_' || m.slug, 'fondo', 'ciudad_' || m.slug, 'Fondo ' || m.nombre, 'raro', 1600, true, true, m.slug from (values
    ('numeria', 'Numeria'), ('enigmia', 'Enigmia'), ('geografia', 'Geografía'), ('quimia', 'Quimia'), ('anatomia', 'Anatomía'), ('melodia', 'Melodía'), ('trigonometria', 'Trigonometría'),
    ('historia', 'Historia'), ('calculia', 'Calculia'), ('circuitia', 'Circuitia'), ('estadistica', 'Estadística'), ('naipia', 'Naipia'), ('codia', 'Codia')) as m(slug, nombre)
  union all
  select 'emote_ciudad_' || m.slug, 'emote', 'ciudad_' || m.slug, '¡Viva ' || m.nombre || '!', 'comun', 700, true, true, m.slug from (values
    ('numeria', 'Numeria'), ('enigmia', 'Enigmia'), ('geografia', 'Geografía'), ('quimia', 'Quimia'), ('anatomia', 'Anatomía'), ('melodia', 'Melodía'), ('trigonometria', 'Trigonometría'),
    ('historia', 'Historia'), ('calculia', 'Calculia'), ('circuitia', 'Circuitia'), ('estadistica', 'Estadística'), ('naipia', 'Naipia'), ('codia', 'Codia')) as m(slug, nombre)
  union all
  select 'estela_ciudad_' || m.slug, 'estela', 'ciudad_' || m.slug, 'Estela de ' || m.nombre, 'raro', 1600, false, true, m.slug from (values
    ('numeria', 'Numeria'), ('enigmia', 'Enigmia'), ('geografia', 'Geografía'), ('quimia', 'Quimia'), ('anatomia', 'Anatomía'), ('melodia', 'Melodía'), ('trigonometria', 'Trigonometría'),
    ('historia', 'Historia'), ('calculia', 'Calculia'), ('circuitia', 'Circuitia'), ('estadistica', 'Estadística'), ('naipia', 'Naipia'), ('codia', 'Codia')) as m(slug, nombre)
  union all
  select 'efecto_ciudad_' || m.slug, 'efecto', 'ciudad_' || m.slug, 'Destellos de ' || m.nombre, 'raro', 1600, false, true, m.slug from (values
    ('numeria', 'Numeria'), ('enigmia', 'Enigmia'), ('geografia', 'Geografía'), ('quimia', 'Quimia'), ('anatomia', 'Anatomía'), ('melodia', 'Melodía'), ('trigonometria', 'Trigonometría'),
    ('historia', 'Historia'), ('calculia', 'Calculia'), ('circuitia', 'Circuitia'), ('estadistica', 'Estadística'), ('naipia', 'Naipia'), ('codia', 'Codia')) as m(slug, nombre)
  union all
  select 'titulo_ciudad_' || m.slug, 'titulo', 'habitante-' || m.slug, 'Habitante de ' || m.nombre, 'epico', 3000, false, true, m.slug from (values
    ('numeria', 'Numeria'), ('enigmia', 'Enigmia'), ('geografia', 'Geografía'), ('quimia', 'Quimia'), ('anatomia', 'Anatomía'), ('melodia', 'Melodía'), ('trigonometria', 'Trigonometría'),
    ('historia', 'Historia'), ('calculia', 'Calculia'), ('circuitia', 'Circuitia'), ('estadistica', 'Estadística'), ('naipia', 'Naipia'), ('codia', 'Codia')) as m(slug, nombre)
  union all
  select 'marco_coleccion_' || m.slug, 'marco', 'coleccion_' || m.slug, 'Marco de colección ' || m.nombre, 'legendario', 9000, false, false, m.slug from (values
    ('numeria', 'Numeria'), ('enigmia', 'Enigmia'), ('geografia', 'Geografía'), ('quimia', 'Quimia'), ('anatomia', 'Anatomía'), ('melodia', 'Melodía'), ('trigonometria', 'Trigonometría'),
    ('historia', 'Historia'), ('calculia', 'Calculia'), ('circuitia', 'Circuitia'), ('estadistica', 'Estadística'), ('naipia', 'Naipia'), ('codia', 'Codia')) as m(slug, nombre)
  union all
  select 'ciudad_placa_' || m.slug, 'ciudad_placa', m.slug, 'Ciudad de ' || m.nombre || ' en tu Placa', 'raro', 2000, true, true, m.slug from (values
    ('numeria', 'Numeria'), ('enigmia', 'Enigmia'), ('geografia', 'Geografía'), ('quimia', 'Quimia'), ('anatomia', 'Anatomía'), ('melodia', 'Melodía'), ('trigonometria', 'Trigonometría'),
    ('historia', 'Historia'), ('calculia', 'Calculia'), ('circuitia', 'Circuitia'), ('estadistica', 'Estadística'), ('naipia', 'Naipia'), ('codia', 'Codia')) as m(slug, nombre)
) x
on conflict (slug) do update set
  categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza,
  precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas,
  mundo = excluded.mundo, temporada = excluded.temporada;

-- Marco de temporada de un mes (1..4).
create or replace function public.temporada_actual(p_fecha date default current_date)
returns smallint
language sql
immutable
as $$
  select (((extract(month from p_fecha)::integer - 1) % 4) + 1)::smallint;
$$;

grant execute on function public.temporada_actual(date) to anon, authenticated;

-- ---------- 3) paquetes ----------
create table if not exists public.paquetes_tienda (
  slug text primary key,
  nombre text not null,
  items text[] not null,
  precio integer not null check (precio > 0)
);

alter table public.paquetes_tienda enable row level security;
drop policy if exists "paquetes visibles para todos" on public.paquetes_tienda;
create policy "paquetes visibles para todos" on public.paquetes_tienda for select using (true);
grant select on public.paquetes_tienda to anon, authenticated;

-- precio = suma de los items con −25 % (redondeado hacia abajo).
insert into public.paquetes_tienda (slug, nombre, items, precio) values
  ('pack_noche', 'Pack Noche', array['fondo_nebulosa', 'marco_neon_violeta', 'estela_violeta'], 7500),
  ('pack_fuego', 'Pack Fuego', array['fondo_dorado', 'estela_dorada', 'efecto_estrellas'], 5250),
  ('pack_sonidos', 'Pack Sonidos', array['sonido_campanitas', 'sonido_ochobits', 'sonido_marimba'], 2625),
  ('pack_emotes', 'Pack Emotes', array['emote_fuego', 'emote_uy', 'emote_gg', 'emote_cerebro', 'emote_rayo', 'emote_corona'], 2475)
on conflict (slug) do update set nombre = excluded.nombre, items = excluded.items, precio = excluded.precio;

-- ---------- ¿lo tiene? / dar ----------
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
    else false
  end;
end;
$$;

revoke execute on function public._tiene_cosmetico(uuid, text) from public, anon, authenticated;

-- Agrega un cosmético del catálogo al perfil (sin cobrar). Devuelve false si ya lo tenía.
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
  end if;
  return true;
end;
$$;

revoke execute on function public._dar_cosmetico(uuid, text) from public, anon, authenticated;

-- ---------- 4) comprar_item_tienda (base real: 0202) ----------
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
    when 'pista' then 300
    when 'segunda_oportunidad' then 500
    when 'cofre_hielos' then 800
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
    when 'marco_neon_violeta' then 6000
    when 'marco_neon_cian' then 6000
    when 'marco_neon_magenta' then 6000
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

  -- Lo nuevo (0248): precio del catálogo o del paquete.
  if v_costo_base is null then
    select * into v_catalogo from public.catalogo_cosmeticos c where c.slug = p_item and c.vendible;
    if found then
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

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;

-- ---------- 5) equipar estela / efecto / sonido / ciudad de la Placa ----------
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
  else
    raise exception 'categoria invalida';
  end if;
end;
$$;

revoke execute on function public.equipar_cosmetico(text, text) from public, anon;
grant execute on function public.equipar_cosmetico(text, text) to authenticated;

-- ---------- 6) gastar una pista o una segunda oportunidad en una partida ----------
-- Igual que usar_consumible_partida (0148): el "no vale en duelos" lo hace la UI
-- (el botón no existe en un duelo).
create or replace function public.usar_ayuda_partida(p_item text)
returns table (pistas_disponibles smallint, segundas_oportunidades_disponibles smallint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_item = 'pista' then
    update public.profiles as pr set pistas_disponibles = pr.pistas_disponibles - 1
    where pr.id = v_user and pr.pistas_disponibles > 0;
    if not found then
      raise exception 'no tienes pistas';
    end if;
  elsif p_item = 'segunda_oportunidad' then
    update public.profiles as pr set segundas_oportunidades_disponibles = pr.segundas_oportunidades_disponibles - 1
    where pr.id = v_user and pr.segundas_oportunidades_disponibles > 0;
    if not found then
      raise exception 'no tienes segundas oportunidades';
    end if;
  else
    raise exception 'item invalido';
  end if;
  return query select pr.pistas_disponibles, pr.segundas_oportunidades_disponibles from public.profiles pr where pr.id = v_user;
end;
$$;

revoke execute on function public.usar_ayuda_partida(text) from public, anon;
grant execute on function public.usar_ayuda_partida(text) to authenticated;

notify pgrst, 'reload schema';

-- Ciudad de la Placa de cualquier jugador (la Placa pública la muestra).
create or replace function public.ciudad_placa_de(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select pr.ciudad_placa from public.profiles pr where pr.id = p_user_id;
$$;

grant execute on function public.ciudad_placa_de(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
