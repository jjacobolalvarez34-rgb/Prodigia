-- ============================================================
-- Prodigia — Colecciones y minieventos de las fiestas de febrero a septiembre (0311).
--
-- Como 0309: cada fiesta trae su colección (se gana con sus Fichas o se compra con
-- Cometas; no se vende en el Bazar), su día de cierre y su minievento propio
-- (src/lib/temas/celebracion.ts y minieventos.ts):
--   - Año Nuevo Lunar (ficha: Monedas de la suerte) — «Sobres rojos»: 3 sobres por día,
--     se abren con 5, 15 y 30 aciertos del día (metas, reclamar_meta_minievento).
--   - Amor y amistad (ficha: Cartas) — «Dúo de la amistad»: un duelo amistoso terminado
--     con un amigo da 3 Fichas a cada uno, hasta 5 amigos (duo_amistad).
--   - Carnaval (ficha: Máscaras) — «Comparsa»: aciertos de Melodía del evento (20, 50 y
--     100, metas) y tabla de la comparsa (tabla_comparsa).
--   - Noches de linternas (ficha: Lunas) — «Noches de luna»: una pregunta por noche;
--     acertarla sube una linterna y da 4 Fichas (responder_pregunta_dia).
--   - Día de π (ficha: Dígitos) — «Dígitos de π» (0295) ahora da Fichas con 10, 20 y 31
--     dígitos (premios_digitos_pi).
--   - Holi (ficha: Polvos de color) — «Ciudad de colores»: 60 aciertos del evento (meta).
--   - Pascua (ficha: Huevos) — «Huevos escondidos»: un huevo por día en otra pantalla;
--     4 Fichas cada uno y 6 más con todos (encontrar_huevo).
--   - Día de la Tierra (ficha: Semillas) — «Bosque compartido»: cada 5 aciertos de la
--     comunidad plantan un árbol; con 400, 6 Fichas a quien plantó (bosque_compartido,
--     reclamar_bosque).
--   - Día de la Música (ficha: Notas) — «Melodía al doble»: ese día la Exp de Melodía
--     cuenta doble para las Fichas (eventos.dia_doble, 0292) y 16 aciertos de Melodía
--     completan la melodía (meta).
--   - Vuelta a clases (ficha: Lápices) — «Semana de repaso»: 10 aciertos del día llenan
--     una página del cuaderno (meta por día).
--   Todos los premios van a minievento_premios (0309), que _fichas_ganadas ya suma: no
--   hace falta redefinirla, ni canjear_pieza_evento (sus últimas versiones son las de
--   0309).
--
-- La parte de datos (piezas, catálogo, eventos 2027 y 2028, metas y anuncios) se GENERA
-- desde colecciones.ts y minieventos.ts (eventos.test.ts comprueba que coincida):
-- EVENTOS_ESCRIBIR_SQL=1 npx vitest run src/lib/temas/eventos.test.ts
-- Requiere 0289, 0291, 0292, 0295 y 0309. Idempotente.
-- ============================================================

-- ---------- Tablas ----------
create table if not exists public.minievento_metas (
  tema text not null,
  clave text not null,
  mundo text,
  por_dia boolean not null default false,
  meta integer not null check (meta > 0),
  fichas integer not null check (fichas > 0),
  primary key (tema, clave)
);
alter table public.minievento_metas enable row level security;
drop policy if exists "metas visibles" on public.minievento_metas;
create policy "metas visibles" on public.minievento_metas for select using (true);
grant select on public.minievento_metas to anon, authenticated;

create table if not exists public.pregunta_dia_respuestas (
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  dia date not null,
  opcion integer not null check (opcion between 0 and 3),
  acierto boolean not null,
  creado_at timestamptz not null default now(),
  primary key (user_id, evento, dia)
);
alter table public.pregunta_dia_respuestas enable row level security;
drop policy if exists "mis respuestas del dia" on public.pregunta_dia_respuestas;
create policy "mis respuestas del dia" on public.pregunta_dia_respuestas for select using (auth.uid() = user_id);
grant select on public.pregunta_dia_respuestas to authenticated;

-- ---------- Datos: piezas, catálogo, eventos, metas y anuncios ----------
-- >>> generado desde src/lib/temas/colecciones.ts y minieventos.ts (eventos.test.ts) >>>
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in ('ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'neon_violeta', 'neon_cian', 'neon_magenta', 'temporada_aurora', 'temporada_brasas', 'temporada_escarcha', 'temporada_cosmos', 'coleccion_numeria', 'coleccion_enigmia', 'coleccion_geografia', 'coleccion_quimia', 'coleccion_anatomia', 'coleccion_melodia', 'coleccion_trigonometria', 'coleccion_historia', 'coleccion_calculia', 'coleccion_circuitia', 'coleccion_estadistica', 'coleccion_naipia', 'coleccion_codia', 'coleccion_dinamia', 'coleccion_vitalia', 'pionero', 'estilo_artico', 'estilo_medianoche', 'estilo_menta', 'estilo_sakura', 'estilo_oceano', 'estilo_esmeralda', 'estilo_rubi', 'estilo_zafiro', 'estilo_amatista', 'estilo_atardecer', 'estilo_oro_rosa', 'estilo_fenix', 'estilo_lava', 'estilo_obsidiana', 'estilo_cyberpunk', 'estilo_galaxia', 'estilo_arcoiris', 'estilo_holograma', 'evento_calabaza', 'evento_esqueleto', 'evento_papel_picado', 'evento_calavera', 'evento_diya', 'evento_rangoli', 'evento_cometa', 'evento_constelacion', 'evento_baston', 'evento_luces', 'evento_fuegos', 'evento_medianoche', 'evento_farol', 'evento_dragon', 'evento_cupido', 'evento_lazo', 'evento_antifaz', 'evento_carnaval', 'evento_linterna', 'evento_luna', 'evento_pi', 'evento_espiral', 'evento_gulal', 'evento_holi', 'evento_huevo', 'evento_conejo', 'evento_hoja', 'evento_planeta', 'evento_vinilo', 'evento_pentagrama', 'evento_cuaderno', 'evento_birrete'));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in ('ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque', 'personalizado', 'prodigio', 'ciudad_numeria', 'ciudad_enigmia', 'ciudad_geografia', 'ciudad_quimia', 'ciudad_anatomia', 'ciudad_melodia', 'ciudad_trigonometria', 'ciudad_historia', 'ciudad_calculia', 'ciudad_circuitia', 'ciudad_estadistica', 'ciudad_naipia', 'ciudad_codia', 'ciudad_dinamia', 'ciudad_vitalia', 'artico', 'selva', 'desierto', 'medianoche', 'atardecer', 'sakura', 'lava', 'caramelo', 'tormenta', 'coral', 'galaxia', 'neon', 'evento_noche_luna', 'evento_ofrenda', 'evento_luces_diwali', 'evento_noche_estelar', 'evento_pueblo_nevado', 'evento_medianoche', 'evento_faroles', 'evento_atardecer_rosa', 'evento_comparsa', 'evento_luna_creciente', 'evento_circulo', 'evento_ciudad_pintada', 'evento_prado', 'evento_planeta', 'evento_escenario', 'evento_pizarron'));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
  ('emote_evento_prosperidad', 'emote', 'evento_prosperidad', '🧧 ¡Prosperidad!', 'comun', 400, false, false, null, null),
  ('estela_evento_dragon', 'estela', 'evento_dragon', 'Estela Dragón', 'raro', 1200, false, false, null, null),
  ('efecto_evento_faroles', 'efecto', 'evento_faroles', 'Faroles', 'raro', 1200, false, false, null, null),
  ('fondo_evento_faroles', 'fondo', 'evento_faroles', 'Fondo Faroles rojos', 'raro', 1200, false, false, null, null),
  ('titulo_evento_danza_dragon', 'titulo', 'evento-danza-dragon', 'Danza del dragón', 'epico', 3000, false, false, null, null),
  ('marco_evento_farol', 'marco', 'evento_farol', 'Marco Farol', 'epico', 3000, false, false, null, null),
  ('marco_evento_dragon', 'marco', 'evento_dragon', 'Marco Dragón dorado', 'legendario', 6000, false, false, null, null),
  ('emote_evento_para_ti', 'emote', 'evento_para_ti', '💌 ¡Para ti!', 'comun', 400, false, false, null, null),
  ('estela_evento_corazones', 'estela', 'evento_corazones', 'Estela Corazones', 'raro', 1200, false, false, null, null),
  ('efecto_evento_corazones', 'efecto', 'evento_corazones', 'Lluvia de corazones', 'raro', 1200, false, false, null, null),
  ('fondo_evento_atardecer_rosa', 'fondo', 'evento_atardecer_rosa', 'Fondo Atardecer rosa', 'raro', 1200, false, false, null, null),
  ('titulo_evento_amigo_fiel', 'titulo', 'evento-amigo-fiel', 'Amigo fiel', 'epico', 3000, false, false, null, null),
  ('marco_evento_cupido', 'marco', 'evento_cupido', 'Marco Cupido', 'epico', 3000, false, false, null, null),
  ('marco_evento_lazo', 'marco', 'evento_lazo', 'Marco Lazo de amistad', 'legendario', 6000, false, false, null, null),
  ('emote_evento_tambor', 'emote', 'evento_tambor', '🥁 ¡Que suene!', 'comun', 400, false, false, null, null),
  ('estela_evento_plumas', 'estela', 'evento_plumas', 'Estela Plumas', 'raro', 1200, false, false, null, null),
  ('efecto_evento_confeti_carnaval', 'efecto', 'evento_confeti_carnaval', 'Confeti de carnaval', 'raro', 1200, false, false, null, null),
  ('fondo_evento_comparsa', 'fondo', 'evento_comparsa', 'Fondo Comparsa', 'raro', 1200, false, false, null, null),
  ('titulo_evento_alma_comparsa', 'titulo', 'evento-alma-comparsa', 'Alma de la comparsa', 'epico', 3000, false, false, null, null),
  ('marco_evento_antifaz', 'marco', 'evento_antifaz', 'Marco Antifaz', 'epico', 3000, false, false, null, null),
  ('marco_evento_carnaval', 'marco', 'evento_carnaval', 'Marco Plumas de carnaval', 'legendario', 6000, false, false, null, null),
  ('emote_evento_buenas_noches', 'emote', 'evento_buenas_noches', '🌙 ¡Buenas noches!', 'comun', 400, false, false, null, null),
  ('efecto_evento_linternas', 'efecto', 'evento_linternas', 'Linternas que suben', 'raro', 1200, false, false, null, null),
  ('fondo_evento_luna_creciente', 'fondo', 'evento_luna_creciente', 'Fondo Luna creciente', 'raro', 1200, false, false, null, null),
  ('titulo_evento_guardian_luna', 'titulo', 'evento-guardian-luna', 'Guardián de la luna', 'epico', 3000, false, false, null, null),
  ('marco_evento_linterna', 'marco', 'evento_linterna', 'Marco Linterna', 'epico', 3000, false, false, null, null),
  ('marco_evento_luna', 'marco', 'evento_luna', 'Marco Luna creciente', 'legendario', 6000, false, false, null, null),
  ('emote_evento_pi', 'emote', 'evento_pi', '🥧 ¡3,14!', 'comun', 400, false, false, null, null),
  ('efecto_evento_pi', 'efecto', 'evento_pi', 'Dígitos de π', 'raro', 1200, false, false, null, null),
  ('fondo_evento_circulo', 'fondo', 'evento_circulo', 'Fondo Círculo perfecto', 'raro', 1200, false, false, null, null),
  ('titulo_evento_calculador_pi', 'titulo', 'evento-calculador-pi', 'Calculador de π', 'epico', 3000, false, false, null, null),
  ('marco_evento_pi', 'marco', 'evento_pi', 'Marco π', 'epico', 3000, false, false, null, null),
  ('marco_evento_espiral', 'marco', 'evento_espiral', 'Marco Espiral de dígitos', 'legendario', 6000, false, false, null, null),
  ('emote_evento_colores', 'emote', 'evento_colores', '🎨 ¡Colores!', 'comun', 400, false, false, null, null),
  ('estela_evento_arcoiris', 'estela', 'evento_arcoiris', 'Estela Arcoíris', 'raro', 1200, false, false, null, null),
  ('efecto_evento_polvo_color', 'efecto', 'evento_polvo_color', 'Polvo de colores', 'raro', 1200, false, false, null, null),
  ('fondo_evento_ciudad_pintada', 'fondo', 'evento_ciudad_pintada', 'Fondo Ciudad pintada', 'raro', 1200, false, false, null, null),
  ('titulo_evento_pintor', 'titulo', 'evento-pintor', 'Pintor de ciudades', 'epico', 3000, false, false, null, null),
  ('marco_evento_gulal', 'marco', 'evento_gulal', 'Marco Gulal', 'epico', 3000, false, false, null, null),
  ('marco_evento_holi', 'marco', 'evento_holi', 'Marco Arcoíris de Holi', 'legendario', 6000, false, false, null, null),
  ('emote_evento_encontrado', 'emote', 'evento_encontrado', '🐣 ¡Lo encontré!', 'comun', 400, false, false, null, null),
  ('estela_evento_pastel', 'estela', 'evento_pastel', 'Estela Pastel', 'raro', 1200, false, false, null, null),
  ('efecto_evento_huevos', 'efecto', 'evento_huevos', 'Huevos de colores', 'raro', 1200, false, false, null, null),
  ('fondo_evento_prado', 'fondo', 'evento_prado', 'Fondo Prado de primavera', 'raro', 1200, false, false, null, null),
  ('titulo_evento_buscador', 'titulo', 'evento-buscador', 'Buscador de huevos', 'epico', 3000, false, false, null, null),
  ('marco_evento_huevo', 'marco', 'evento_huevo', 'Marco Huevo pintado', 'epico', 3000, false, false, null, null),
  ('marco_evento_conejo', 'marco', 'evento_conejo', 'Marco Conejo de primavera', 'legendario', 6000, false, false, null, null),
  ('emote_evento_plantar', 'emote', 'evento_plantar', '🌱 ¡A plantar!', 'comun', 400, false, false, null, null),
  ('estela_evento_hojas', 'estela', 'evento_hojas', 'Estela Hojas', 'raro', 1200, false, false, null, null),
  ('fondo_evento_planeta', 'fondo', 'evento_planeta', 'Fondo Planeta verde', 'raro', 1200, false, false, null, null),
  ('titulo_evento_guardian_bosque', 'titulo', 'evento-guardian-bosque', 'Guardián del bosque', 'epico', 3000, false, false, null, null),
  ('marco_evento_hoja', 'marco', 'evento_hoja', 'Marco Hoja', 'epico', 3000, false, false, null, null),
  ('marco_evento_planeta', 'marco', 'evento_planeta', 'Marco Planeta azul', 'legendario', 6000, false, false, null, null),
  ('emote_evento_suena', 'emote', 'evento_suena', '🎵 ¡Suena bien!', 'comun', 400, false, false, null, null),
  ('efecto_evento_notas', 'efecto', 'evento_notas', 'Notas al aire', 'raro', 1200, false, false, null, null),
  ('fondo_evento_escenario', 'fondo', 'evento_escenario', 'Fondo Escenario', 'raro', 1200, false, false, null, null),
  ('titulo_evento_musico', 'titulo', 'evento-musico', 'Músico de la ciudad', 'epico', 3000, false, false, null, null),
  ('marco_evento_vinilo', 'marco', 'evento_vinilo', 'Marco Vinilo', 'epico', 3000, false, false, null, null),
  ('marco_evento_pentagrama', 'marco', 'evento_pentagrama', 'Marco Pentagrama dorado', 'legendario', 6000, false, false, null, null),
  ('emote_evento_presente', 'emote', 'evento_presente', '✏️ ¡Presente!', 'comun', 400, false, false, null, null),
  ('estela_evento_tiza', 'estela', 'evento_tiza', 'Estela Tiza', 'raro', 1200, false, false, null, null),
  ('efecto_evento_formulas', 'efecto', 'evento_formulas', 'Fórmulas', 'raro', 1200, false, false, null, null),
  ('fondo_evento_pizarron', 'fondo', 'evento_pizarron', 'Fondo Pizarrón', 'raro', 1200, false, false, null, null),
  ('titulo_evento_primero_clase', 'titulo', 'evento-primero-clase', 'Primero de la clase', 'epico', 3000, false, false, null, null),
  ('marco_evento_cuaderno', 'marco', 'evento_cuaderno', 'Marco Cuaderno', 'epico', 3000, false, false, null, null),
  ('marco_evento_birrete', 'marco', 'evento_birrete', 'Marco Birrete', 'legendario', 6000, false, false, null, null)
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

insert into public.eventos (slug, tema, desde, hasta, cierre, inicio) values
  ('dia_pi-2027', 'dia_pi', '2027-03-14', '2027-03-14', '2027-03-15', '2027-03-14 02:00:00+00'),
  ('dia_tierra-2027', 'dia_tierra', '2027-04-22', '2027-04-22', '2027-04-23', '2027-04-22 00:00:00+00'),
  ('dia_musica-2027', 'dia_musica', '2027-06-21', '2027-06-21', '2027-06-22', '2027-06-21 00:00:00+00'),
  ('amor_amistad-2027', 'amor_amistad', '2027-02-12', '2027-02-15', '2027-02-16', '2027-02-12 00:00:00+00'),
  ('carnaval-2027', 'carnaval', '2027-02-06', '2027-02-09', '2027-02-10', '2027-02-06 00:00:00+00'),
  ('pascua-2027', 'pascua', '2027-03-26', '2027-03-29', '2027-03-30', '2027-03-26 00:00:00+00'),
  ('vuelta_clases-2027', 'vuelta_clases', '2027-09-01', '2027-09-07', '2027-09-08', '2027-09-01 00:00:00+00'),
  ('anio_nuevo_lunar-2027', 'anio_nuevo_lunar', '2027-02-06', '2027-02-12', '2027-02-13', '2027-02-06 00:00:00+00'),
  ('holi-2027', 'holi', '2027-03-22', '2027-03-23', '2027-03-24', '2027-03-22 00:00:00+00'),
  ('linternas-2027', 'linternas', '2027-03-10', '2027-03-12', '2027-03-13', '2027-03-10 00:00:00+00'),
  ('dia_pi-2028', 'dia_pi', '2028-03-14', '2028-03-14', '2028-03-15', '2028-03-14 00:00:00+00'),
  ('dia_tierra-2028', 'dia_tierra', '2028-04-22', '2028-04-22', '2028-04-23', '2028-04-22 00:00:00+00'),
  ('dia_musica-2028', 'dia_musica', '2028-06-21', '2028-06-21', '2028-06-22', '2028-06-21 00:00:00+00'),
  ('amor_amistad-2028', 'amor_amistad', '2028-02-12', '2028-02-15', '2028-02-16', '2028-02-13 02:00:00+00'),
  ('carnaval-2028', 'carnaval', '2028-02-26', '2028-02-29', '2028-03-01', '2028-02-26 00:00:00+00'),
  ('pascua-2028', 'pascua', '2028-04-14', '2028-04-17', '2028-04-18', '2028-04-14 00:00:00+00'),
  ('vuelta_clases-2028', 'vuelta_clases', '2028-09-01', '2028-09-07', '2028-09-08', '2028-09-01 00:00:00+00'),
  ('anio_nuevo_lunar-2028', 'anio_nuevo_lunar', '2028-01-26', '2028-02-01', '2028-02-02', '2028-01-26 00:00:00+00'),
  ('holi-2028', 'holi', '2028-03-11', '2028-03-12', '2028-03-13', '2028-03-12 02:00:00+00'),
  ('linternas-2028', 'linternas', '2028-02-27', '2028-02-29', '2028-03-01', '2028-02-27 00:00:00+00')
on conflict (slug) do update set tema = excluded.tema, desde = excluded.desde, hasta = excluded.hasta, cierre = excluded.cierre, inicio = excluded.inicio;

insert into public.eventos_piezas (evento, item, fichas, cometas) values
  ('dia_pi-2027', 'emote_evento_pi', 2, 60),
  ('dia_pi-2027', 'efecto_evento_pi', 4, 120),
  ('dia_pi-2027', 'fondo_evento_circulo', 4, 140),
  ('dia_pi-2027', 'titulo_evento_calculador_pi', 5, 220),
  ('dia_pi-2027', 'marco_evento_pi', 6, 300),
  ('dia_pi-2027', 'marco_evento_espiral', 9, 600),
  ('dia_tierra-2027', 'emote_evento_plantar', 2, 60),
  ('dia_tierra-2027', 'estela_evento_hojas', 4, 120),
  ('dia_tierra-2027', 'fondo_evento_planeta', 4, 140),
  ('dia_tierra-2027', 'titulo_evento_guardian_bosque', 5, 220),
  ('dia_tierra-2027', 'marco_evento_hoja', 6, 300),
  ('dia_tierra-2027', 'marco_evento_planeta', 9, 600),
  ('dia_musica-2027', 'emote_evento_suena', 3, 60),
  ('dia_musica-2027', 'efecto_evento_notas', 5, 120),
  ('dia_musica-2027', 'fondo_evento_escenario', 6, 140),
  ('dia_musica-2027', 'titulo_evento_musico', 8, 220),
  ('dia_musica-2027', 'marco_evento_vinilo', 10, 300),
  ('dia_musica-2027', 'marco_evento_pentagrama', 14, 600),
  ('amor_amistad-2027', 'emote_evento_para_ti', 5, 60),
  ('amor_amistad-2027', 'estela_evento_corazones', 10, 120),
  ('amor_amistad-2027', 'efecto_evento_corazones', 10, 120),
  ('amor_amistad-2027', 'fondo_evento_atardecer_rosa', 11, 140),
  ('amor_amistad-2027', 'titulo_evento_amigo_fiel', 15, 220),
  ('amor_amistad-2027', 'marco_evento_cupido', 18, 300),
  ('amor_amistad-2027', 'marco_evento_lazo', 28, 600),
  ('carnaval-2027', 'emote_evento_tambor', 5, 60),
  ('carnaval-2027', 'estela_evento_plumas', 10, 120),
  ('carnaval-2027', 'efecto_evento_confeti_carnaval', 10, 120),
  ('carnaval-2027', 'fondo_evento_comparsa', 11, 140),
  ('carnaval-2027', 'titulo_evento_alma_comparsa', 15, 220),
  ('carnaval-2027', 'marco_evento_antifaz', 18, 300),
  ('carnaval-2027', 'marco_evento_carnaval', 28, 600),
  ('pascua-2027', 'emote_evento_encontrado', 5, 60),
  ('pascua-2027', 'estela_evento_pastel', 10, 120),
  ('pascua-2027', 'efecto_evento_huevos', 10, 120),
  ('pascua-2027', 'fondo_evento_prado', 11, 140),
  ('pascua-2027', 'titulo_evento_buscador', 15, 220),
  ('pascua-2027', 'marco_evento_huevo', 18, 300),
  ('pascua-2027', 'marco_evento_conejo', 28, 600),
  ('vuelta_clases-2027', 'emote_evento_presente', 7, 60),
  ('vuelta_clases-2027', 'estela_evento_tiza', 14, 120),
  ('vuelta_clases-2027', 'efecto_evento_formulas', 14, 120),
  ('vuelta_clases-2027', 'fondo_evento_pizarron', 16, 140),
  ('vuelta_clases-2027', 'titulo_evento_primero_clase', 21, 220),
  ('vuelta_clases-2027', 'marco_evento_cuaderno', 26, 300),
  ('vuelta_clases-2027', 'marco_evento_birrete', 40, 600),
  ('anio_nuevo_lunar-2027', 'emote_evento_prosperidad', 7, 60),
  ('anio_nuevo_lunar-2027', 'estela_evento_dragon', 14, 120),
  ('anio_nuevo_lunar-2027', 'efecto_evento_faroles', 14, 120),
  ('anio_nuevo_lunar-2027', 'fondo_evento_faroles', 16, 140),
  ('anio_nuevo_lunar-2027', 'titulo_evento_danza_dragon', 21, 220),
  ('anio_nuevo_lunar-2027', 'marco_evento_farol', 26, 300),
  ('anio_nuevo_lunar-2027', 'marco_evento_dragon', 40, 600),
  ('holi-2027', 'emote_evento_colores', 4, 60),
  ('holi-2027', 'estela_evento_arcoiris', 8, 120),
  ('holi-2027', 'efecto_evento_polvo_color', 8, 120),
  ('holi-2027', 'fondo_evento_ciudad_pintada', 9, 140),
  ('holi-2027', 'titulo_evento_pintor', 12, 220),
  ('holi-2027', 'marco_evento_gulal', 14, 300),
  ('holi-2027', 'marco_evento_holi', 20, 600),
  ('linternas-2027', 'emote_evento_buenas_noches', 5, 60),
  ('linternas-2027', 'efecto_evento_linternas', 9, 120),
  ('linternas-2027', 'fondo_evento_luna_creciente', 10, 140),
  ('linternas-2027', 'titulo_evento_guardian_luna', 13, 220),
  ('linternas-2027', 'marco_evento_linterna', 16, 300),
  ('linternas-2027', 'marco_evento_luna', 24, 600),
  ('dia_pi-2028', 'emote_evento_pi', 2, 60),
  ('dia_pi-2028', 'efecto_evento_pi', 4, 120),
  ('dia_pi-2028', 'fondo_evento_circulo', 4, 140),
  ('dia_pi-2028', 'titulo_evento_calculador_pi', 5, 220),
  ('dia_pi-2028', 'marco_evento_pi', 6, 300),
  ('dia_pi-2028', 'marco_evento_espiral', 9, 600),
  ('dia_tierra-2028', 'emote_evento_plantar', 2, 60),
  ('dia_tierra-2028', 'estela_evento_hojas', 4, 120),
  ('dia_tierra-2028', 'fondo_evento_planeta', 4, 140),
  ('dia_tierra-2028', 'titulo_evento_guardian_bosque', 5, 220),
  ('dia_tierra-2028', 'marco_evento_hoja', 6, 300),
  ('dia_tierra-2028', 'marco_evento_planeta', 9, 600),
  ('dia_musica-2028', 'emote_evento_suena', 3, 60),
  ('dia_musica-2028', 'efecto_evento_notas', 5, 120),
  ('dia_musica-2028', 'fondo_evento_escenario', 6, 140),
  ('dia_musica-2028', 'titulo_evento_musico', 8, 220),
  ('dia_musica-2028', 'marco_evento_vinilo', 10, 300),
  ('dia_musica-2028', 'marco_evento_pentagrama', 14, 600),
  ('amor_amistad-2028', 'emote_evento_para_ti', 5, 60),
  ('amor_amistad-2028', 'estela_evento_corazones', 10, 120),
  ('amor_amistad-2028', 'efecto_evento_corazones', 10, 120),
  ('amor_amistad-2028', 'fondo_evento_atardecer_rosa', 11, 140),
  ('amor_amistad-2028', 'titulo_evento_amigo_fiel', 15, 220),
  ('amor_amistad-2028', 'marco_evento_cupido', 18, 300),
  ('amor_amistad-2028', 'marco_evento_lazo', 28, 600),
  ('carnaval-2028', 'emote_evento_tambor', 5, 60),
  ('carnaval-2028', 'estela_evento_plumas', 10, 120),
  ('carnaval-2028', 'efecto_evento_confeti_carnaval', 10, 120),
  ('carnaval-2028', 'fondo_evento_comparsa', 11, 140),
  ('carnaval-2028', 'titulo_evento_alma_comparsa', 15, 220),
  ('carnaval-2028', 'marco_evento_antifaz', 18, 300),
  ('carnaval-2028', 'marco_evento_carnaval', 28, 600),
  ('pascua-2028', 'emote_evento_encontrado', 5, 60),
  ('pascua-2028', 'estela_evento_pastel', 10, 120),
  ('pascua-2028', 'efecto_evento_huevos', 10, 120),
  ('pascua-2028', 'fondo_evento_prado', 11, 140),
  ('pascua-2028', 'titulo_evento_buscador', 15, 220),
  ('pascua-2028', 'marco_evento_huevo', 18, 300),
  ('pascua-2028', 'marco_evento_conejo', 28, 600),
  ('vuelta_clases-2028', 'emote_evento_presente', 7, 60),
  ('vuelta_clases-2028', 'estela_evento_tiza', 14, 120),
  ('vuelta_clases-2028', 'efecto_evento_formulas', 14, 120),
  ('vuelta_clases-2028', 'fondo_evento_pizarron', 16, 140),
  ('vuelta_clases-2028', 'titulo_evento_primero_clase', 21, 220),
  ('vuelta_clases-2028', 'marco_evento_cuaderno', 26, 300),
  ('vuelta_clases-2028', 'marco_evento_birrete', 40, 600),
  ('anio_nuevo_lunar-2028', 'emote_evento_prosperidad', 7, 60),
  ('anio_nuevo_lunar-2028', 'estela_evento_dragon', 14, 120),
  ('anio_nuevo_lunar-2028', 'efecto_evento_faroles', 14, 120),
  ('anio_nuevo_lunar-2028', 'fondo_evento_faroles', 16, 140),
  ('anio_nuevo_lunar-2028', 'titulo_evento_danza_dragon', 21, 220),
  ('anio_nuevo_lunar-2028', 'marco_evento_farol', 26, 300),
  ('anio_nuevo_lunar-2028', 'marco_evento_dragon', 40, 600),
  ('holi-2028', 'emote_evento_colores', 4, 60),
  ('holi-2028', 'estela_evento_arcoiris', 8, 120),
  ('holi-2028', 'efecto_evento_polvo_color', 8, 120),
  ('holi-2028', 'fondo_evento_ciudad_pintada', 9, 140),
  ('holi-2028', 'titulo_evento_pintor', 12, 220),
  ('holi-2028', 'marco_evento_gulal', 14, 300),
  ('holi-2028', 'marco_evento_holi', 20, 600),
  ('linternas-2028', 'emote_evento_buenas_noches', 5, 60),
  ('linternas-2028', 'efecto_evento_linternas', 9, 120),
  ('linternas-2028', 'fondo_evento_luna_creciente', 10, 140),
  ('linternas-2028', 'titulo_evento_guardian_luna', 13, 220),
  ('linternas-2028', 'marco_evento_linterna', 16, 300),
  ('linternas-2028', 'marco_evento_luna', 24, 600)
on conflict (evento, item) do update set fichas = excluded.fichas, cometas = excluded.cometas;

insert into public.minievento_metas (tema, clave, mundo, por_dia, meta, fichas) values
  ('anio_nuevo_lunar', 'sobre1', null, true, 5, 2),
  ('anio_nuevo_lunar', 'sobre2', null, true, 15, 3),
  ('anio_nuevo_lunar', 'sobre3', null, true, 30, 4),
  ('carnaval', 'comparsa1', 'melodia', false, 20, 3),
  ('carnaval', 'comparsa2', 'melodia', false, 50, 4),
  ('carnaval', 'comparsa3', 'melodia', false, 100, 6),
  ('holi', 'colores', null, false, 60, 8),
  ('dia_musica', 'melodia', 'melodia', true, 16, 6),
  ('vuelta_clases', 'pagina', null, true, 10, 3)
on conflict (tema, clave) do update set mundo = excluded.mundo, por_dia = excluded.por_dia, meta = excluded.meta, fichas = excluded.fichas;

insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Día de Pi', 'Día de Pi: 3,14 minutos de reto. Juega en cualquier mundo para ganar Dígitos y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 14/03.', '2027-03-14'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Día de Pi' and a.fecha = '2027-03-14');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Día de la Tierra', 'Día de la Tierra: planta árboles jugando. Juega en cualquier mundo para ganar Semillas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 22/04.', '2027-04-22'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Día de la Tierra' and a.fecha = '2027-04-22');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Día de la Música', 'Día de la Música: Melodía al doble. Juega en cualquier mundo para ganar Notas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 21/06.', '2027-06-21'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Día de la Música' and a.fecha = '2027-06-21');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Amor y amistad', 'Amor y amistad: regala a tus amigos. Juega en cualquier mundo para ganar Cartas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 15/02.', '2027-02-12'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Amor y amistad' and a.fecha = '2027-02-12');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Carnaval', '¡Carnaval!. Juega en cualquier mundo para ganar Máscaras y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 09/02.', '2027-02-06'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Carnaval' and a.fecha = '2027-02-06');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Huevos escondidos', 'Pascua: encuentra los huevos escondidos. Juega en cualquier mundo para ganar Huevos y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 29/03.', '2027-03-26'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Huevos escondidos' and a.fecha = '2027-03-26');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Vuelta a clases', 'Vuelta a clases: misiones más fáciles. Juega en cualquier mundo para ganar Lápices y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 07/09.', '2027-09-01'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Vuelta a clases' and a.fecha = '2027-09-01');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Faroles y dragones', 'Año Nuevo Lunar. Juega en cualquier mundo para ganar Monedas de la suerte y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 12/02.', '2027-02-06'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Faroles y dragones' and a.fecha = '2027-02-06');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Festival de colores', 'Holi: el festival de colores. Juega en cualquier mundo para ganar Polvos de color y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 23/03.', '2027-03-22'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Festival de colores' and a.fecha = '2027-03-22');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Noches de linternas', 'Noches de linternas. Juega en cualquier mundo para ganar Lunas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 12/03.', '2027-03-10'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Noches de linternas' and a.fecha = '2027-03-10');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Día de Pi', 'Día de Pi: 3,14 minutos de reto. Juega en cualquier mundo para ganar Dígitos y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 14/03.', '2028-03-14'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Día de Pi' and a.fecha = '2028-03-14');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Día de la Tierra', 'Día de la Tierra: planta árboles jugando. Juega en cualquier mundo para ganar Semillas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 22/04.', '2028-04-22'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Día de la Tierra' and a.fecha = '2028-04-22');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Día de la Música', 'Día de la Música: Melodía al doble. Juega en cualquier mundo para ganar Notas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 21/06.', '2028-06-21'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Día de la Música' and a.fecha = '2028-06-21');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Amor y amistad', 'Amor y amistad: regala a tus amigos. Juega en cualquier mundo para ganar Cartas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 15/02.', '2028-02-12'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Amor y amistad' and a.fecha = '2028-02-12');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Carnaval', '¡Carnaval!. Juega en cualquier mundo para ganar Máscaras y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 29/02.', '2028-02-26'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Carnaval' and a.fecha = '2028-02-26');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Huevos escondidos', 'Pascua: encuentra los huevos escondidos. Juega en cualquier mundo para ganar Huevos y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 17/04.', '2028-04-14'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Huevos escondidos' and a.fecha = '2028-04-14');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Vuelta a clases', 'Vuelta a clases: misiones más fáciles. Juega en cualquier mundo para ganar Lápices y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 07/09.', '2028-09-01'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Vuelta a clases' and a.fecha = '2028-09-01');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Faroles y dragones', 'Año Nuevo Lunar. Juega en cualquier mundo para ganar Monedas de la suerte y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 01/02.', '2028-01-26'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Faroles y dragones' and a.fecha = '2028-01-26');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Festival de colores', 'Holi: el festival de colores. Juega en cualquier mundo para ganar Polvos de color y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 12/03.', '2028-03-11'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Festival de colores' and a.fecha = '2028-03-11');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Noches de linternas', 'Noches de linternas. Juega en cualquier mundo para ganar Lunas y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 29/02.', '2028-02-27'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Noches de linternas' and a.fecha = '2028-02-27');
-- <<< generado <<<

-- Día de la Música: la Exp de Melodía cuenta doble ese día (y el tope sube a 24).
update public.eventos set dia_doble = desde, mundo_doble = 'melodia' where tema = 'dia_musica';

-- ---------- Aciertos de un jugador en un rango (todos los mundos o uno) ----------
create or replace function public._aciertos_usuario(p_user uuid, p_desde timestamptz, p_hasta timestamptz, p_mundo text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select (
    (select count(*) from public.attempts a
      where a.user_id = p_user and a.correct
        and a.created_at >= p_desde and a.created_at < p_hasta
        and (p_mundo is null or a.problem_type like p_mundo || '%'))
    + (select count(*) from public.logic_attempts la
      where la.user_id = p_user and la.correct
        and la.created_at >= p_desde and la.created_at < p_hasta
        and (p_mundo is null or p_mundo = 'enigmia'))
  )::integer;
$$;
revoke execute on function public._aciertos_usuario(uuid, timestamptz, timestamptz, text) from public, anon, authenticated;

-- ---------- Metas de aciertos (Sobres rojos, Comparsa, Holi, Música, Repaso) ----------
create or replace function public.progreso_minievento(p_tema text)
returns table (evento text, hoy integer, total integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_mundo text;
  v_inicio timestamptz;
  v_fin timestamptz;
  v_dia date := (now() at time zone 'UTC')::date;
begin
  if v_user is null then
    return;
  end if;
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema(p_tema);
  if not found then
    return;
  end if;
  select max(m.mundo) into v_mundo from public.minievento_metas m where m.tema = p_tema;
  v_inicio := coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC');
  v_fin := (v_e.hasta + 1)::timestamp at time zone 'UTC';
  return query select v_e.slug,
    public._aciertos_usuario(v_user, greatest(v_inicio, v_dia::timestamp at time zone 'UTC'), v_fin, v_mundo),
    public._aciertos_usuario(v_user, v_inicio, v_fin, v_mundo);
end;
$$;
revoke execute on function public.progreso_minievento(text) from public, anon;
grant execute on function public.progreso_minievento(text) to authenticated;

create or replace function public.reclamar_meta_minievento(p_tema text, p_clave text)
returns table (fichas integer, saldo integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_m public.minievento_metas%rowtype;
  v_e public.eventos%rowtype;
  v_dia date := (now() at time zone 'UTC')::date;
  v_inicio timestamptz;
  v_desde timestamptz;
  v_clave text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_m from public.minievento_metas m where m.tema = p_tema and m.clave = p_clave;
  if not found then
    raise exception 'meta invalida';
  end if;
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema(p_tema);
  if not found then
    raise exception 'no hay un evento abierto';
  end if;
  v_inicio := coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC');
  if v_m.por_dia then
    v_desde := greatest(v_inicio, v_dia::timestamp at time zone 'UTC');
    v_clave := 'meta:' || v_m.clave || ':' || v_dia;
  else
    v_desde := v_inicio;
    v_clave := 'meta:' || v_m.clave;
  end if;
  if public._aciertos_usuario(v_user, v_desde, (v_e.hasta + 1)::timestamp at time zone 'UTC', v_m.mundo) < v_m.meta then
    raise exception 'aun no llegas a la meta';
  end if;
  insert into public.minievento_premios (user_id, evento, clave, fichas)
  values (v_user, v_e.slug, v_clave, v_m.fichas)
  on conflict do nothing;
  if not found then
    raise exception 'ya tienes este premio';
  end if;
  return query select v_m.fichas, public._saldo_fichas(v_user, v_e.slug);
end;
$$;
revoke execute on function public.reclamar_meta_minievento(text, text) from public, anon;
grant execute on function public.reclamar_meta_minievento(text, text) to authenticated;

-- ---------- Carnaval: tabla de la comparsa (aciertos de Melodía del evento) ----------
create or replace function public.tabla_comparsa()
returns table (nombre text, aciertos integer, yo boolean)
language sql
stable
security definer
set search_path = public
as $$
  with e as (
    select coalesce(ev.inicio, ev.desde::timestamp at time zone 'UTC') as desde, (ev.hasta + 1)::timestamp at time zone 'UTC' as hasta
    from public.eventos ev
    where ev.slug = public._evento_abierto_de_tema('carnaval')
  )
  select coalesce(pr.display_name, 'Jugador'), count(*)::integer, a.user_id = auth.uid()
  from public.attempts a
  join e on a.created_at >= e.desde and a.created_at < e.hasta
  join public.profiles pr on pr.id = a.user_id
  where a.correct and a.problem_type like 'melodia%'
  group by a.user_id, pr.display_name
  order by count(*) desc, a.user_id
  limit 10;
$$;
revoke execute on function public.tabla_comparsa() from public, anon;
grant execute on function public.tabla_comparsa() to authenticated;

-- ---------- Amor y amistad: Dúo de la amistad ----------
-- Cada amigo distinto con el que terminaste un duelo amistoso (no ranked) durante el
-- evento: 3 Fichas, hasta 5 amigos. El amigo cobra lo suyo cuando abre el minievento.
create or replace function public.duo_amistad()
returns table (amigo_id uuid, nombre text, fichas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_ya integer;
begin
  if v_user is null then
    return;
  end if;
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema('amor_amistad');
  if not found then
    return;
  end if;
  select count(*)::integer into v_ya from public.minievento_premios mp
  where mp.user_id = v_user and mp.evento = v_e.slug and mp.clave like 'duo:%';
  insert into public.minievento_premios (user_id, evento, clave, fichas)
  select v_user, v_e.slug, 'duo:' || o.amigo, 3
  from (
    select distinct case when d.retador_id = v_user then d.retado_id else d.retador_id end as amigo
    from public.duels d
    where not d.clasificatorio
      and d.estado = 'completado'
      and (d.retador_id = v_user or d.retado_id = v_user)
      and d.creado_at >= coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC')
      and (d.creado_at at time zone 'UTC')::date <= v_e.hasta
  ) o
  where exists (
      select 1 from public.friendships f
      where f.estado = 'aceptada'
        and ((f.user_id = v_user and f.friend_id = o.amigo) or (f.user_id = o.amigo and f.friend_id = v_user))
    )
    and not exists (
      select 1 from public.minievento_premios mp
      where mp.user_id = v_user and mp.evento = v_e.slug and mp.clave = 'duo:' || o.amigo
    )
  order by o.amigo
  limit greatest(0, 5 - v_ya)
  on conflict do nothing;
  return query
    select pr.id, coalesce(pr.display_name, 'Jugador'), mp.fichas
    from public.minievento_premios mp
    join public.profiles pr on pr.id::text = substring(mp.clave from 5)
    where mp.user_id = v_user and mp.evento = v_e.slug and mp.clave like 'duo:%'
    order by mp.creado_at;
end;
$$;
revoke execute on function public.duo_amistad() from public, anon;
grant execute on function public.duo_amistad() to authenticated;

-- ---------- Noches de linternas: pregunta del día ----------
-- La pregunta del día la elige el cliente (minieventos.ts, por fecha UTC); la opción 0
-- es siempre la correcta (se muestran mezcladas). Una respuesta por día.
create or replace function public.responder_pregunta_dia(p_tema text, p_opcion integer)
returns table (acierto boolean, aciertos integer, saldo integer)
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
  if p_tema is distinct from 'linternas' then
    raise exception 'minievento invalido';
  end if;
  if p_opcion is null or p_opcion < 0 or p_opcion > 3 then
    raise exception 'opcion invalida';
  end if;
  v_evento := public._evento_abierto_de_tema(p_tema);
  if v_evento is null then
    raise exception 'no hay un evento abierto';
  end if;
  insert into public.pregunta_dia_respuestas (user_id, evento, dia, opcion, acierto)
  values (v_user, v_evento, v_dia, p_opcion, v_acierto)
  on conflict do nothing;
  if not found then
    raise exception 'ya respondiste la pregunta de hoy';
  end if;
  if v_acierto then
    insert into public.minievento_premios (user_id, evento, clave, fichas)
    values (v_user, v_evento, 'pregunta:' || v_dia, 4)
    on conflict do nothing;
  end if;
  return query select v_acierto,
    (select count(*)::integer from public.pregunta_dia_respuestas r where r.user_id = v_user and r.evento = v_evento and r.acierto),
    public._saldo_fichas(v_user, v_evento);
end;
$$;
revoke execute on function public.responder_pregunta_dia(text, integer) from public, anon;
grant execute on function public.responder_pregunta_dia(text, integer) to authenticated;

-- ---------- Día de π: Fichas por dígitos (la mejor marca del día, 0295) ----------
create or replace function public.premios_digitos_pi()
returns table (evento text, mejor integer, fichas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_evento text;
  v_mejor integer;
begin
  if v_user is null then
    return;
  end if;
  v_evento := public._evento_abierto_de_tema('dia_pi');
  if v_evento is null then
    return;
  end if;
  select coalesce(max(pm.digitos), 0) into v_mejor from public.pi_marcas pm
  where pm.user_id = v_user and pm.dia = (now() at time zone 'UTC')::date;
  insert into public.minievento_premios (user_id, evento, clave, fichas)
  select v_user, v_evento, 'pi:' || m.digitos, m.fichas
  from (values (10, 2), (20, 3), (31, 4)) as m (digitos, fichas)
  where v_mejor >= m.digitos
  on conflict do nothing;
  return query select v_evento, v_mejor,
    coalesce((select sum(mp.fichas) from public.minievento_premios mp where mp.user_id = v_user and mp.evento = v_evento and mp.clave like 'pi:%'), 0)::integer;
end;
$$;
revoke execute on function public.premios_digitos_pi() from public, anon;
grant execute on function public.premios_digitos_pi() to authenticated;

-- ---------- Pascua: Huevos escondidos ----------
-- Un huevo por día, cada día en otra pantalla (LUGARES_HUEVOS en minieventos.ts, en el
-- mismo orden). Solo vale el de hoy en su lugar.
create or replace function public.encontrar_huevo(p_lugar text)
returns table (fichas integer, encontrados integer, saldo integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_dia date := (now() at time zone 'UTC')::date;
  v_lugares text[] := array['tienda', 'perfil', 'recompensas', 'evento'];
  v_i integer;
  v_n integer;
  v_fichas integer := 4;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema('pascua');
  if not found then
    raise exception 'no hay un evento abierto';
  end if;
  v_i := v_dia - v_e.desde;
  if v_i < 0 or v_i >= array_length(v_lugares, 1) or v_lugares[v_i + 1] is distinct from p_lugar then
    raise exception 'aqui no hay huevo hoy';
  end if;
  insert into public.minievento_premios (user_id, evento, clave, fichas)
  values (v_user, v_e.slug, 'huevo:' || v_dia, 4)
  on conflict do nothing;
  if not found then
    raise exception 'ya encontraste el huevo de hoy';
  end if;
  select count(*)::integer into v_n from public.minievento_premios mp
  where mp.user_id = v_user and mp.evento = v_e.slug and mp.clave like 'huevo:%';
  if v_n >= array_length(v_lugares, 1) then
    insert into public.minievento_premios (user_id, evento, clave, fichas)
    values (v_user, v_e.slug, 'huevos:todos', 6)
    on conflict do nothing;
    if found then
      v_fichas := v_fichas + 6;
    end if;
  end if;
  return query select v_fichas, v_n, public._saldo_fichas(v_user, v_e.slug);
end;
$$;
revoke execute on function public.encontrar_huevo(text) from public, anon;
grant execute on function public.encontrar_huevo(text) to authenticated;

-- ---------- Día de la Tierra: Bosque compartido ----------
-- Cada 5 aciertos de toda la comunidad (desde que abrió el evento) plantan un árbol;
-- con 400 árboles, 6 Fichas para cada uno que haya plantado al menos uno.
create or replace function public._bosque_aciertos(p_evento text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.attempts a, public.eventos e
  where e.slug = p_evento
    and a.created_at >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
    and a.created_at < (e.hasta + 1)::timestamp at time zone 'UTC'
    and a.correct;
$$;
revoke execute on function public._bosque_aciertos(text) from public, anon, authenticated;

create or replace function public.bosque_compartido()
returns table (evento text, arboles integer, meta integer, mios integer, reclamado boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_e public.eventos%rowtype;
begin
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema('dia_tierra');
  if not found then
    return;
  end if;
  return query select v_e.slug,
    public._bosque_aciertos(v_e.slug) / 5,
    400,
    case when auth.uid() is null then 0 else public._aciertos_usuario(auth.uid(), coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC'), (v_e.hasta + 1)::timestamp at time zone 'UTC', null) / 5 end,
    exists (select 1 from public.minievento_premios mp where mp.user_id = auth.uid() and mp.evento = v_e.slug and mp.clave = 'bosque');
end;
$$;
revoke execute on function public.bosque_compartido() from public, anon;
grant execute on function public.bosque_compartido() to authenticated;

create or replace function public.reclamar_bosque()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_e from public.eventos e where e.slug = public._evento_abierto_de_tema('dia_tierra');
  if not found then
    raise exception 'no hay un evento abierto';
  end if;
  if public._bosque_aciertos(v_e.slug) / 5 < 400 then
    raise exception 'todavia no se llego a la meta';
  end if;
  if public._aciertos_usuario(v_user, coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC'), (v_e.hasta + 1)::timestamp at time zone 'UTC', null) < 5 then
    raise exception 'planta al menos un arbol';
  end if;
  insert into public.minievento_premios (user_id, evento, clave, fichas)
  values (v_user, v_e.slug, 'bosque', 6)
  on conflict do nothing;
  if not found then
    raise exception 'ya reclamaste el premio de hoy';
  end if;
end;
$$;
revoke execute on function public.reclamar_bosque() from public, anon;
grant execute on function public.reclamar_bosque() to authenticated;

notify pgrst, 'reload schema';
