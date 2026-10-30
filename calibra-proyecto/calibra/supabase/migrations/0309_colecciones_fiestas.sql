-- ============================================================
-- Prodigia — Colecciones y minieventos de las fiestas de noviembre a enero (0309).
--
-- Como Halloween (0289/0292), cada fiesta trae su colección (se gana con sus Fichas o se
-- compra con Cometas; no se vende en el Bazar) y su minievento propio
-- (src/lib/temas/celebracion.ts y minieventos.ts):
--   - Día de Muertos (1 – 2 nov, ficha: Cempasúchil) — «La ofrenda»: una pregunta de
--     Historia por día; acertarla enciende una vela y da 4 Fichas (responder_ofrenda).
--   - Diwali (ficha: Diyas) — «Enciende 100 lámparas»: cada acierto del evento enciende
--     una; con 100, la ciudad se ilumina y da 10 Fichas (lamparas_evento).
--   - Viernes Estelar (ficha: Estrellas fugaces) — «Estrella fugaz»: cada día cae una
--     oferta de la colección a mitad de precio por 2 horas (eventos_ofertas; solo se ve
--     cuando ya cayó; canjear_pieza_evento cobra el precio de la oferta).
--   - Navidad (ficha: Regalos) — «Calendario de adviento»: del 1 al 24, una casilla por
--     día: 3 Fichas; los domingos, una cápsula del evento (abrir_casilla_adviento).
--   - Año Nuevo (ficha: Campanadas) — «Reto 2027»: entre toda la comunidad, 2027
--     operaciones de Numeria bien resueltas en un día; si se llega, cápsula del evento
--     para todos (reto_comunidad, reclamar_reto_comunidad).
--   Las Fichas de los minieventos se guardan en minievento_premios y _fichas_ganadas
--   las suma (además de la Exp, las rankeds y los dulces de 0292).
--   Muertos, Viernes Estelar, Diwali y Año Nuevo tienen ahora día de cierre (calendario.ts).
--
-- La parte de datos (piezas, catálogo, eventos, ofertas y anuncios) se GENERA desde
-- colecciones.ts y minieventos.ts (eventos.test.ts comprueba que coincida). Las
-- funciones redefinidas parten de su última versión: _fichas_ganadas (0292) y
-- canjear_pieza_evento (0290). Requiere 0289, 0290, 0291 y 0292. Idempotente.
-- ============================================================

-- ---------- Tablas de los minieventos ----------
create table if not exists public.eventos_ofertas (
  evento text not null references public.eventos(slug) on delete cascade,
  item text not null references public.catalogo_cosmeticos(slug) on delete cascade,
  desde timestamptz not null,
  hasta timestamptz not null,
  fichas integer not null check (fichas > 0),
  cometas integer not null check (cometas > 0),
  primary key (evento, desde)
);
alter table public.eventos_ofertas enable row level security;
-- Sin vista previa: una oferta se ve recién cuando cae.
drop policy if exists "ofertas que ya cayeron" on public.eventos_ofertas;
create policy "ofertas que ya cayeron" on public.eventos_ofertas for select using (desde <= now());
grant select on public.eventos_ofertas to anon, authenticated;

create table if not exists public.minievento_premios (
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  clave text not null,
  fichas integer not null default 0 check (fichas >= 0),
  creado_at timestamptz not null default now(),
  primary key (user_id, evento, clave)
);
alter table public.minievento_premios enable row level security;
drop policy if exists "mis premios de minievento" on public.minievento_premios;
create policy "mis premios de minievento" on public.minievento_premios for select using (auth.uid() = user_id);
grant select on public.minievento_premios to authenticated;

create table if not exists public.ofrenda_respuestas (
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  dia date not null,
  opcion integer not null check (opcion between 0 and 3),
  acierto boolean not null,
  creado_at timestamptz not null default now(),
  primary key (user_id, evento, dia)
);
alter table public.ofrenda_respuestas enable row level security;
drop policy if exists "mi ofrenda" on public.ofrenda_respuestas;
create policy "mi ofrenda" on public.ofrenda_respuestas for select using (auth.uid() = user_id);
grant select on public.ofrenda_respuestas to authenticated;

create table if not exists public.adviento_casillas (
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  dia date not null,
  premio text not null check (premio in ('fichas', 'capsula')),
  cantidad integer not null,
  creado_at timestamptz not null default now(),
  primary key (user_id, evento, dia)
);
alter table public.adviento_casillas enable row level security;
drop policy if exists "mi calendario" on public.adviento_casillas;
create policy "mi calendario" on public.adviento_casillas for select using (auth.uid() = user_id);
grant select on public.adviento_casillas to authenticated;

create table if not exists public.reto_comunidad_reclamos (
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  dia date not null,
  creado_at timestamptz not null default now(),
  primary key (user_id, evento, dia)
);
alter table public.reto_comunidad_reclamos enable row level security;
drop policy if exists "mis reclamos del reto" on public.reto_comunidad_reclamos;
create policy "mis reclamos del reto" on public.reto_comunidad_reclamos for select using (auth.uid() = user_id);
grant select on public.reto_comunidad_reclamos to authenticated;

-- Para contar las operaciones de toda la comunidad en un día (Reto de Año Nuevo).
create index if not exists attempts_created_at_idx on public.attempts (created_at);

-- ---------- Datos: piezas, catálogo, eventos, ofertas y anuncios ----------
-- >>> generado desde src/lib/temas/colecciones.ts y minieventos.ts (eventos.test.ts) >>>
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in ('ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'neon_violeta', 'neon_cian', 'neon_magenta', 'temporada_aurora', 'temporada_brasas', 'temporada_escarcha', 'temporada_cosmos', 'coleccion_numeria', 'coleccion_enigmia', 'coleccion_geografia', 'coleccion_quimia', 'coleccion_anatomia', 'coleccion_melodia', 'coleccion_trigonometria', 'coleccion_historia', 'coleccion_calculia', 'coleccion_circuitia', 'coleccion_estadistica', 'coleccion_naipia', 'coleccion_codia', 'coleccion_dinamia', 'coleccion_vitalia', 'pionero', 'estilo_artico', 'estilo_medianoche', 'estilo_menta', 'estilo_sakura', 'estilo_oceano', 'estilo_esmeralda', 'estilo_rubi', 'estilo_zafiro', 'estilo_amatista', 'estilo_atardecer', 'estilo_oro_rosa', 'estilo_fenix', 'estilo_lava', 'estilo_obsidiana', 'estilo_cyberpunk', 'estilo_galaxia', 'estilo_arcoiris', 'estilo_holograma', 'evento_calabaza', 'evento_esqueleto', 'evento_papel_picado', 'evento_calavera', 'evento_diya', 'evento_rangoli', 'evento_cometa', 'evento_constelacion', 'evento_baston', 'evento_luces', 'evento_fuegos', 'evento_medianoche'));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in ('ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque', 'personalizado', 'prodigio', 'ciudad_numeria', 'ciudad_enigmia', 'ciudad_geografia', 'ciudad_quimia', 'ciudad_anatomia', 'ciudad_melodia', 'ciudad_trigonometria', 'ciudad_historia', 'ciudad_calculia', 'ciudad_circuitia', 'ciudad_estadistica', 'ciudad_naipia', 'ciudad_codia', 'ciudad_dinamia', 'ciudad_vitalia', 'artico', 'selva', 'desierto', 'medianoche', 'atardecer', 'sakura', 'lava', 'caramelo', 'tormenta', 'coral', 'galaxia', 'neon', 'evento_noche_luna', 'evento_ofrenda', 'evento_luces_diwali', 'evento_noche_estelar', 'evento_pueblo_nevado', 'evento_medianoche'));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
  ('emote_evento_cempasuchil', 'emote', 'evento_cempasuchil', '🌼 ¡Te recuerdo!', 'comun', 400, false, false, null, null),
  ('estela_evento_vela', 'estela', 'evento_vela', 'Estela Vela', 'raro', 1200, false, false, null, null),
  ('efecto_evento_papel_picado', 'efecto', 'evento_papel_picado', 'Papel picado', 'raro', 1200, false, false, null, null),
  ('fondo_evento_ofrenda', 'fondo', 'evento_ofrenda', 'Fondo Ofrenda', 'raro', 1200, false, false, null, null),
  ('titulo_evento_memoria_viva', 'titulo', 'evento-memoria-viva', 'Memoria viva', 'epico', 3000, false, false, null, null),
  ('marco_evento_papel_picado', 'marco', 'evento_papel_picado', 'Marco Papel picado', 'epico', 3000, false, false, null, null),
  ('marco_evento_calavera', 'marco', 'evento_calavera', 'Marco Calavera de azúcar', 'legendario', 6000, false, false, null, null),
  ('emote_evento_diya', 'emote', 'evento_diya', '🪔 ¡Que brille!', 'comun', 400, false, false, null, null),
  ('estela_evento_bengala', 'estela', 'evento_bengala', 'Estela Bengala', 'raro', 1200, false, false, null, null),
  ('efecto_evento_fuegos_colores', 'efecto', 'evento_fuegos_colores', 'Fuegos de colores', 'raro', 1200, false, false, null, null),
  ('fondo_evento_luces_diwali', 'fondo', 'evento_luces_diwali', 'Fondo Noche de diyas', 'raro', 1200, false, false, null, null),
  ('titulo_evento_portador_luz', 'titulo', 'evento-portador-luz', 'Portador de luz', 'epico', 3000, false, false, null, null),
  ('marco_evento_diya', 'marco', 'evento_diya', 'Marco Diya', 'epico', 3000, false, false, null, null),
  ('marco_evento_rangoli', 'marco', 'evento_rangoli', 'Marco Rangoli', 'legendario', 6000, false, false, null, null),
  ('emote_evento_estelar', 'emote', 'evento_estelar', '⭐ ¡Estelar!', 'comun', 400, false, false, null, null),
  ('efecto_evento_estrella_fugaz', 'efecto', 'evento_estrella_fugaz', 'Lluvia de estrellas', 'raro', 1200, false, false, null, null),
  ('fondo_evento_noche_estelar', 'fondo', 'evento_noche_estelar', 'Fondo Noche estelar', 'raro', 1200, false, false, null, null),
  ('titulo_evento_cazaofertas', 'titulo', 'evento-cazaofertas', 'Cazaofertas', 'epico', 3000, false, false, null, null),
  ('marco_evento_cometa', 'marco', 'evento_cometa', 'Marco Cometa', 'epico', 3000, false, false, null, null),
  ('marco_evento_constelacion', 'marco', 'evento_constelacion', 'Marco Constelación', 'legendario', 6000, false, false, null, null),
  ('emote_evento_jojojo', 'emote', 'evento_jojojo', '🎅 ¡Jo jo jo!', 'comun', 400, false, false, null, null),
  ('estela_evento_nieve', 'estela', 'evento_nieve', 'Estela Nieve', 'raro', 1200, false, false, null, null),
  ('efecto_evento_copos', 'efecto', 'evento_copos', 'Copos', 'raro', 1200, false, false, null, null),
  ('fondo_evento_pueblo_nevado', 'fondo', 'evento_pueblo_nevado', 'Fondo Pueblo nevado', 'raro', 1200, false, false, null, null),
  ('titulo_evento_duende', 'titulo', 'evento-duende', 'Duende de Santa', 'epico', 3000, false, false, null, null),
  ('marco_evento_baston', 'marco', 'evento_baston', 'Marco Bastón de caramelo', 'epico', 3000, false, false, null, null),
  ('marco_evento_luces', 'marco', 'evento_luces', 'Marco Luces que titilan', 'legendario', 6000, false, false, null, null),
  ('emote_evento_salud', 'emote', 'evento_salud', '🥂 ¡Salud!', 'comun', 400, false, false, null, null),
  ('estela_evento_serpentina', 'estela', 'evento_serpentina', 'Estela Serpentina', 'raro', 1200, false, false, null, null),
  ('efecto_evento_bengalas', 'efecto', 'evento_bengalas', 'Bengalas', 'raro', 1200, false, false, null, null),
  ('fondo_evento_medianoche', 'fondo', 'evento_medianoche', 'Fondo Medianoche', 'raro', 1200, false, false, null, null),
  ('titulo_evento_primera_luz', 'titulo', 'evento-primera-luz', 'Primera luz del año', 'epico', 3000, false, false, null, null),
  ('marco_evento_fuegos', 'marco', 'evento_fuegos', 'Marco Fuegos artificiales', 'epico', 3000, false, false, null, null),
  ('marco_evento_medianoche', 'marco', 'evento_medianoche', 'Marco Medianoche dorada', 'legendario', 6000, false, false, null, null)
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

insert into public.eventos (slug, tema, desde, hasta, cierre, inicio) values
  ('muertos-2026', 'muertos', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-01 00:00:00+00'),
  ('viernes_estelar-2026', 'viernes_estelar', '2026-11-27', '2026-11-30', '2026-12-01', '2026-11-27 00:00:00+00'),
  ('navidad-2026', 'navidad', '2026-12-01', '2026-12-26', '2026-12-27', '2026-12-01 00:00:00+00'),
  ('anio_nuevo-2026', 'anio_nuevo', '2026-12-31', '2027-01-02', '2027-01-03', '2026-12-31 00:00:00+00'),
  ('diwali-2026', 'diwali', '2026-11-08', '2026-11-12', '2026-11-13', '2026-11-08 00:00:00+00'),
  ('muertos-2027', 'muertos', '2027-11-01', '2027-11-02', '2027-11-03', '2027-11-01 00:00:00+00'),
  ('viernes_estelar-2027', 'viernes_estelar', '2027-11-26', '2027-11-29', '2027-11-30', '2027-11-26 00:00:00+00'),
  ('navidad-2027', 'navidad', '2027-12-01', '2027-12-26', '2027-12-27', '2027-12-01 00:00:00+00'),
  ('anio_nuevo-2027', 'anio_nuevo', '2027-12-31', '2028-01-02', '2028-01-03', '2027-12-31 00:00:00+00'),
  ('diwali-2027', 'diwali', '2027-10-29', '2027-11-02', '2027-11-03', '2027-10-29 00:00:00+00')
on conflict (slug) do update set tema = excluded.tema, desde = excluded.desde, hasta = excluded.hasta, cierre = excluded.cierre, inicio = excluded.inicio;

insert into public.eventos_piezas (evento, item, fichas, cometas) values
  ('muertos-2026', 'emote_evento_cempasuchil', 4, 60),
  ('muertos-2026', 'estela_evento_vela', 8, 120),
  ('muertos-2026', 'efecto_evento_papel_picado', 8, 120),
  ('muertos-2026', 'fondo_evento_ofrenda', 9, 140),
  ('muertos-2026', 'titulo_evento_memoria_viva', 12, 220),
  ('muertos-2026', 'marco_evento_papel_picado', 14, 300),
  ('muertos-2026', 'marco_evento_calavera', 20, 600),
  ('viernes_estelar-2026', 'emote_evento_estelar', 5, 60),
  ('viernes_estelar-2026', 'efecto_evento_estrella_fugaz', 10, 120),
  ('viernes_estelar-2026', 'fondo_evento_noche_estelar', 11, 140),
  ('viernes_estelar-2026', 'titulo_evento_cazaofertas', 15, 220),
  ('viernes_estelar-2026', 'marco_evento_cometa', 18, 300),
  ('viernes_estelar-2026', 'marco_evento_constelacion', 28, 600),
  ('navidad-2026', 'emote_evento_jojojo', 10, 60),
  ('navidad-2026', 'estela_evento_nieve', 20, 120),
  ('navidad-2026', 'efecto_evento_copos', 20, 120),
  ('navidad-2026', 'fondo_evento_pueblo_nevado', 22, 140),
  ('navidad-2026', 'titulo_evento_duende', 34, 220),
  ('navidad-2026', 'marco_evento_baston', 40, 300),
  ('navidad-2026', 'marco_evento_luces', 60, 600),
  ('anio_nuevo-2026', 'emote_evento_salud', 5, 60),
  ('anio_nuevo-2026', 'estela_evento_serpentina', 9, 120),
  ('anio_nuevo-2026', 'efecto_evento_bengalas', 9, 120),
  ('anio_nuevo-2026', 'fondo_evento_medianoche', 10, 140),
  ('anio_nuevo-2026', 'titulo_evento_primera_luz', 14, 220),
  ('anio_nuevo-2026', 'marco_evento_fuegos', 16, 300),
  ('anio_nuevo-2026', 'marco_evento_medianoche', 24, 600),
  ('diwali-2026', 'emote_evento_diya', 6, 60),
  ('diwali-2026', 'estela_evento_bengala', 12, 120),
  ('diwali-2026', 'efecto_evento_fuegos_colores', 12, 120),
  ('diwali-2026', 'fondo_evento_luces_diwali', 13, 140),
  ('diwali-2026', 'titulo_evento_portador_luz', 18, 220),
  ('diwali-2026', 'marco_evento_diya', 22, 300),
  ('diwali-2026', 'marco_evento_rangoli', 34, 600),
  ('muertos-2027', 'emote_evento_cempasuchil', 4, 60),
  ('muertos-2027', 'estela_evento_vela', 8, 120),
  ('muertos-2027', 'efecto_evento_papel_picado', 8, 120),
  ('muertos-2027', 'fondo_evento_ofrenda', 9, 140),
  ('muertos-2027', 'titulo_evento_memoria_viva', 12, 220),
  ('muertos-2027', 'marco_evento_papel_picado', 14, 300),
  ('muertos-2027', 'marco_evento_calavera', 20, 600),
  ('viernes_estelar-2027', 'emote_evento_estelar', 5, 60),
  ('viernes_estelar-2027', 'efecto_evento_estrella_fugaz', 10, 120),
  ('viernes_estelar-2027', 'fondo_evento_noche_estelar', 11, 140),
  ('viernes_estelar-2027', 'titulo_evento_cazaofertas', 15, 220),
  ('viernes_estelar-2027', 'marco_evento_cometa', 18, 300),
  ('viernes_estelar-2027', 'marco_evento_constelacion', 28, 600),
  ('navidad-2027', 'emote_evento_jojojo', 10, 60),
  ('navidad-2027', 'estela_evento_nieve', 20, 120),
  ('navidad-2027', 'efecto_evento_copos', 20, 120),
  ('navidad-2027', 'fondo_evento_pueblo_nevado', 22, 140),
  ('navidad-2027', 'titulo_evento_duende', 34, 220),
  ('navidad-2027', 'marco_evento_baston', 40, 300),
  ('navidad-2027', 'marco_evento_luces', 60, 600),
  ('anio_nuevo-2027', 'emote_evento_salud', 5, 60),
  ('anio_nuevo-2027', 'estela_evento_serpentina', 9, 120),
  ('anio_nuevo-2027', 'efecto_evento_bengalas', 9, 120),
  ('anio_nuevo-2027', 'fondo_evento_medianoche', 10, 140),
  ('anio_nuevo-2027', 'titulo_evento_primera_luz', 14, 220),
  ('anio_nuevo-2027', 'marco_evento_fuegos', 16, 300),
  ('anio_nuevo-2027', 'marco_evento_medianoche', 24, 600),
  ('diwali-2027', 'emote_evento_diya', 6, 60),
  ('diwali-2027', 'estela_evento_bengala', 12, 120),
  ('diwali-2027', 'efecto_evento_fuegos_colores', 12, 120),
  ('diwali-2027', 'fondo_evento_luces_diwali', 13, 140),
  ('diwali-2027', 'titulo_evento_portador_luz', 18, 220),
  ('diwali-2027', 'marco_evento_diya', 22, 300),
  ('diwali-2027', 'marco_evento_rangoli', 34, 600)
on conflict (evento, item) do update set fichas = excluded.fichas, cometas = excluded.cometas;

insert into public.eventos_ofertas (evento, item, desde, hasta, fichas, cometas) values
  ('viernes_estelar-2026', 'marco_evento_constelacion', '2026-11-27 23:00:00+00', '2026-11-28 01:00:00+00', 14, 300),
  ('viernes_estelar-2026', 'fondo_evento_noche_estelar', '2026-11-28 16:00:00+00', '2026-11-28 18:00:00+00', 6, 70),
  ('viernes_estelar-2026', 'marco_evento_cometa', '2026-11-30 01:00:00+00', '2026-11-30 03:00:00+00', 9, 150),
  ('viernes_estelar-2026', 'efecto_evento_estrella_fugaz', '2026-11-30 20:00:00+00', '2026-11-30 22:00:00+00', 5, 60),
  ('viernes_estelar-2027', 'marco_evento_constelacion', '2027-11-26 23:00:00+00', '2027-11-27 01:00:00+00', 14, 300),
  ('viernes_estelar-2027', 'fondo_evento_noche_estelar', '2027-11-27 16:00:00+00', '2027-11-27 18:00:00+00', 6, 70),
  ('viernes_estelar-2027', 'marco_evento_cometa', '2027-11-29 01:00:00+00', '2027-11-29 03:00:00+00', 9, 150),
  ('viernes_estelar-2027', 'efecto_evento_estrella_fugaz', '2027-11-29 20:00:00+00', '2027-11-29 22:00:00+00', 5, 60)
on conflict (evento, desde) do update set item = excluded.item, hasta = excluded.hasta, fichas = excluded.fichas, cometas = excluded.cometas;

insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: La ofrenda', 'Día de Muertos: la ofrenda. Juega en cualquier mundo para ganar Cempasúchil y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 02/11.', '2026-11-01'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: La ofrenda' and a.fecha = '2026-11-01');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Viernes Estelar', 'Viernes Estelar: ofertas en el Bazar. Juega en cualquier mundo para ganar Estrellas fugaces y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 30/11.', '2026-11-27'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Viernes Estelar' and a.fecha = '2026-11-27');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Navidad en las ciudades', 'Navidad en las ciudades. Juega en cualquier mundo para ganar Regalos y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 26/12.', '2026-12-01'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Navidad en las ciudades' and a.fecha = '2026-12-01');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Cuenta regresiva', '¡Feliz año nuevo!. Juega en cualquier mundo para ganar Campanadas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 02/01.', '2026-12-31'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Cuenta regresiva' and a.fecha = '2026-12-31');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Fiesta de las luces', 'Diwali: enciende las ciudades. Juega en cualquier mundo para ganar Diyas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 12/11.', '2026-11-08'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Fiesta de las luces' and a.fecha = '2026-11-08');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: La ofrenda', 'Día de Muertos: la ofrenda. Juega en cualquier mundo para ganar Cempasúchil y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 02/11.', '2027-11-01'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: La ofrenda' and a.fecha = '2027-11-01');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Viernes Estelar', 'Viernes Estelar: ofertas en el Bazar. Juega en cualquier mundo para ganar Estrellas fugaces y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 29/11.', '2027-11-26'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Viernes Estelar' and a.fecha = '2027-11-26');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Navidad en las ciudades', 'Navidad en las ciudades. Juega en cualquier mundo para ganar Regalos y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 26/12.', '2027-12-01'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Navidad en las ciudades' and a.fecha = '2027-12-01');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Cuenta regresiva', '¡Feliz año nuevo!. Juega en cualquier mundo para ganar Campanadas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 02/01.', '2027-12-31'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Cuenta regresiva' and a.fecha = '2027-12-31');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Fiesta de las luces', 'Diwali: enciende las ciudades. Juega en cualquier mundo para ganar Diyas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 02/11.', '2027-10-29'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Fiesta de las luces' and a.fecha = '2027-10-29');
-- <<< generado <<<

-- ---------- Fichas: todo junto (0292 + los premios de los minieventos) ----------
create or replace function public._fichas_ganadas(p_user uuid, p_evento text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with e as (select * from public.eventos where slug = p_evento),
  x as (
    select a.created_at, a.xp, a.problem_type as tipo from public.attempts a, e
    where a.user_id = p_user and a.created_at >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
    union all
    select la.created_at, la.xp, 'enigmia' as tipo from public.logic_attempts la, e
    where la.user_id = p_user and la.created_at >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
  ),
  dias as (
    select (x.created_at at time zone 'UTC')::date as dia,
      sum(x.xp * case when (x.created_at at time zone 'UTC')::date = e.dia_doble and x.tipo like e.mundo_doble || '%' then 2 else 1 end) as xp
    from x, e
    where (x.created_at at time zone 'UTC')::date <= e.hasta
    group by 1
  )
  select coalesce((
    select coalesce((select sum(least(case when d.dia = e2.dia_doble then 24 else 12 end, floor(d.xp / 40.0)::integer)) from dias d, e e2), 0)
      + 3 * public._ranked_ganadas_evento(p_user, p_evento)
      + coalesce((select count(*) from public.dulces_amigos da where da.de = p_user and da.evento = p_evento), 0)
      + coalesce((select sum(least(5, r.n)) from (select count(*) as n from public.dulces_amigos da where da.para = p_user and da.evento = p_evento group by da.dia) r), 0)
      + coalesce((select sum(mp.fichas) from public.minievento_premios mp where mp.user_id = p_user and mp.evento = p_evento), 0)
    from e
  ), 0)::integer;
$$;
revoke execute on function public._fichas_ganadas(uuid, text) from public, anon, authenticated;

-- Saldo de Fichas de un evento (lo que devuelven los minieventos).
create or replace function public._saldo_fichas(p_user uuid, p_evento text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(0, public._fichas_ganadas(p_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = p_user and c.evento = p_evento), 0))::integer;
$$;
revoke execute on function public._saldo_fichas(uuid, text) from public, anon, authenticated;

-- ---------- Canje (0290) con el precio de la Estrella fugaz si está cayendo ----------
create or replace function public.canjear_pieza_evento(p_evento text, p_item text, p_con_cometas boolean)
returns table (saldo integer, cometas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_p public.eventos_piezas%rowtype;
  v_saldo integer;
  v_cometas integer;
  v_precio_fichas integer;
  v_precio_cometas integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_e from public.eventos e where e.slug = p_evento;
  if not found then
    raise exception 'evento invalido';
  end if;
  if now() < coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC') or current_date > v_e.cierre then
    raise exception 'el evento no esta abierto';
  end if;
  select * into v_p from public.eventos_piezas ep where ep.evento = p_evento and ep.item = p_item;
  if not found then
    raise exception 'pieza invalida';
  end if;
  if public._tiene_cosmetico(v_user, p_item) then
    raise exception 'ya tienes esta pieza';
  end if;
  v_precio_fichas := v_p.fichas;
  v_precio_cometas := v_p.cometas;
  select o.fichas, o.cometas into v_precio_fichas, v_precio_cometas
  from public.eventos_ofertas o
  where o.evento = p_evento and o.item = p_item and now() >= o.desde and now() < o.hasta
  limit 1;
  if not found then
    v_precio_fichas := v_p.fichas;
    v_precio_cometas := v_p.cometas;
  end if;
  select pr.cometas into v_cometas from public.profiles pr where pr.id = v_user for update;
  if p_con_cometas then
    if coalesce(v_cometas, 0) < v_precio_cometas then
      raise exception 'te faltan Cometas para esta pieza';
    end if;
    insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia) values (v_user, -v_precio_cometas, 'evento', 'evento:' || p_evento || ':' || p_item);
    update public.profiles as pr set cometas = pr.cometas - v_precio_cometas where pr.id = v_user;
    insert into public.fichas_canjes (user_id, evento, item, fichas, cometas) values (v_user, p_evento, p_item, 0, v_precio_cometas);
  else
    v_saldo := public._fichas_ganadas(v_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento), 0);
    if v_saldo < v_precio_fichas then
      raise exception 'te faltan fichas para esta pieza';
    end if;
    insert into public.fichas_canjes (user_id, evento, item, fichas, cometas) values (v_user, p_evento, p_item, v_precio_fichas, 0);
  end if;
  perform public._dar_cosmetico(v_user, p_item);
  return query select greatest(0, public._fichas_ganadas(v_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento), 0))::integer,
    pr.cometas from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.canjear_pieza_evento(text, text, boolean) from public, anon;
grant execute on function public.canjear_pieza_evento(text, text, boolean) to authenticated;

-- ---------- Día de Muertos: La ofrenda ----------
-- La pregunta del día la elige el cliente (minieventos.ts, por fecha UTC); la opción 0
-- es siempre la correcta (se muestran mezcladas). Una respuesta por día.
create or replace function public.responder_ofrenda(p_opcion integer)
returns table (acierto boolean, velas integer, saldo integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_evento text;
  v_dia date := (now() at time zone 'UTC')::date;
  v_acierto boolean := p_opcion = 0;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_opcion is null or p_opcion < 0 or p_opcion > 3 then
    raise exception 'opcion invalida';
  end if;
  v_evento := public._evento_abierto_de_tema('muertos');
  if v_evento is null then
    raise exception 'no hay un evento abierto';
  end if;
  insert into public.ofrenda_respuestas (user_id, evento, dia, opcion, acierto)
  values (v_user, v_evento, v_dia, p_opcion, v_acierto)
  on conflict do nothing;
  if not found then
    raise exception 'ya respondiste la pregunta de hoy';
  end if;
  if v_acierto then
    insert into public.minievento_premios (user_id, evento, clave, fichas)
    values (v_user, v_evento, 'ofrenda:' || v_dia, 4)
    on conflict do nothing;
  end if;
  return query select v_acierto,
    (select count(*)::integer from public.ofrenda_respuestas o where o.user_id = v_user and o.evento = v_evento and o.acierto),
    public._saldo_fichas(v_user, v_evento);
end;
$$;
revoke execute on function public.responder_ofrenda(integer) from public, anon;
grant execute on function public.responder_ofrenda(integer) to authenticated;

-- ---------- Diwali: Enciende 100 lámparas ----------
-- Cuenta los aciertos desde que abrió el evento; con 100, da 10 Fichas (una vez).
create or replace function public.lamparas_evento()
returns table (evento text, encendidas integer, premio boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_n integer;
begin
  if v_user is null then
    return;
  end if;
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema('diwali');
  if not found then
    return;
  end if;
  select
    (select count(*) from public.attempts a
      where a.user_id = v_user and a.correct
        and a.created_at >= coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC')
        and (a.created_at at time zone 'UTC')::date <= v_e.hasta)
    + (select count(*) from public.logic_attempts la
      where la.user_id = v_user and la.correct
        and la.created_at >= coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC')
        and (la.created_at at time zone 'UTC')::date <= v_e.hasta)
  into v_n;
  if v_n >= 100 then
    insert into public.minievento_premios (user_id, evento, clave, fichas)
    values (v_user, v_e.slug, 'lamparas', 10)
    on conflict do nothing;
  end if;
  return query select v_e.slug, least(v_n, 100)::integer, v_n >= 100;
end;
$$;
revoke execute on function public.lamparas_evento() from public, anon;
grant execute on function public.lamparas_evento() to authenticated;

-- ---------- Navidad: Calendario de adviento ----------
-- Solo la casilla de hoy (del 1 al 24): 3 Fichas; los domingos, una cápsula del evento.
create or replace function public.abrir_casilla_adviento()
returns table (dia date, premio text, cantidad integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_evento text;
  v_dia date := (now() at time zone 'UTC')::date;
  v_premio text;
  v_cantidad integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  v_evento := public._evento_abierto_de_tema('navidad');
  if v_evento is null then
    raise exception 'no hay un evento abierto';
  end if;
  if extract(day from v_dia) > 24 or extract(month from v_dia) <> 12 then
    raise exception 'el calendario termino';
  end if;
  if extract(isodow from v_dia) = 7 then
    v_premio := 'capsula';
    v_cantidad := 1;
  else
    v_premio := 'fichas';
    v_cantidad := 3;
  end if;
  insert into public.adviento_casillas (user_id, evento, dia, premio, cantidad)
  values (v_user, v_evento, v_dia, v_premio, v_cantidad)
  on conflict do nothing;
  if not found then
    raise exception 'ya abriste la casilla de hoy';
  end if;
  if v_premio = 'capsula' then
    insert into public.capsulas_usuario (user_id, tipo, mundo, origen, detalle)
    values (v_user, 'temporada', 'navidad', 'adviento:' || v_evento || ':' || v_dia, jsonb_build_object('evento', v_evento))
    on conflict do nothing;
  else
    insert into public.minievento_premios (user_id, evento, clave, fichas)
    values (v_user, v_evento, 'adviento:' || v_dia, v_cantidad)
    on conflict do nothing;
  end if;
  return query select v_dia, v_premio, v_cantidad;
end;
$$;
revoke execute on function public.abrir_casilla_adviento() from public, anon;
grant execute on function public.abrir_casilla_adviento() to authenticated;

-- ---------- Año Nuevo: Reto de la comunidad ----------
-- Operaciones de Numeria bien resueltas hoy por toda la comunidad; la meta es el año
-- que empieza (2027).
create or replace function public._reto_comunidad_total(p_evento text, p_dia date)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.attempts a, public.eventos e
  where e.slug = p_evento
    and a.created_at >= greatest(coalesce(e.inicio, e.desde::timestamp at time zone 'UTC'), p_dia::timestamp at time zone 'UTC')
    and a.created_at < (p_dia + 1)::timestamp at time zone 'UTC'
    and a.correct
    and a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra');
$$;
revoke execute on function public._reto_comunidad_total(text, date) from public, anon, authenticated;

create or replace function public.reto_comunidad()
returns table (evento text, dia date, total integer, meta integer, logrado boolean, reclamado boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_e public.eventos%rowtype;
  v_dia date := (now() at time zone 'UTC')::date;
  v_total integer;
  v_meta integer;
begin
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema('anio_nuevo');
  if not found then
    return;
  end if;
  v_meta := extract(year from v_e.hasta)::integer;
  v_total := public._reto_comunidad_total(v_e.slug, v_dia);
  return query select v_e.slug, v_dia, v_total, v_meta, v_total >= v_meta,
    exists (select 1 from public.reto_comunidad_reclamos r where r.user_id = auth.uid() and r.evento = v_e.slug and r.dia = v_dia);
end;
$$;
revoke execute on function public.reto_comunidad() from public, anon;
grant execute on function public.reto_comunidad() to authenticated;

create or replace function public.reclamar_reto_comunidad()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_dia date := (now() at time zone 'UTC')::date;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema('anio_nuevo');
  if not found then
    raise exception 'no hay un evento abierto';
  end if;
  if public._reto_comunidad_total(v_e.slug, v_dia) < extract(year from v_e.hasta)::integer then
    raise exception 'todavia no se llego a la meta';
  end if;
  insert into public.reto_comunidad_reclamos (user_id, evento, dia) values (v_user, v_e.slug, v_dia) on conflict do nothing;
  if not found then
    raise exception 'ya reclamaste el premio de hoy';
  end if;
  insert into public.capsulas_usuario (user_id, tipo, mundo, origen, detalle)
  values (v_user, 'temporada', 'anio_nuevo', 'reto:' || v_e.slug || ':' || v_dia, jsonb_build_object('evento', v_e.slug))
  on conflict do nothing;
end;
$$;
revoke execute on function public.reclamar_reto_comunidad() from public, anon;
grant execute on function public.reclamar_reto_comunidad() to authenticated;

notify pgrst, 'reload schema';
