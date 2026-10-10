-- ============================================================
-- Prodigia — Tienda ampliada: más cosméticos de todo tipo (0275).
--
-- Pedido del 2026-10-10: «agrega MÁS cosas a la tienda, de todo tipo». Suma
-- 18 marcos de colores, 12 fondos, estelas, efectos, sonidos,
-- emotes, títulos y 6 paquetes. Todo pasa por el catálogo de 0248: comprar
-- (comprar_item_tienda), tenerlo (_tiene_cosmetico) y darlo (_dar_cosmetico) ya
-- funcionan con cualquier fila nueva; solo hay que ampliar los valores permitidos
-- de marco_perfil y fondo_perfil.
--
-- Se GENERA desde src/lib/recompensas/catalogoAmpliado.ts y
-- catalogoAmpliado.test.ts comprueba que coincida. No editar a mano.
-- Requiere 0248 y 0263. Idempotente.
-- ============================================================

alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in ('ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'neon_violeta', 'neon_cian', 'neon_magenta', 'temporada_aurora', 'temporada_brasas', 'temporada_escarcha', 'temporada_cosmos', 'coleccion_numeria', 'coleccion_enigmia', 'coleccion_geografia', 'coleccion_quimia', 'coleccion_anatomia', 'coleccion_melodia', 'coleccion_trigonometria', 'coleccion_historia', 'coleccion_calculia', 'coleccion_circuitia', 'coleccion_estadistica', 'coleccion_naipia', 'coleccion_codia', 'coleccion_dinamia', 'coleccion_vitalia', 'pionero', 'estilo_artico', 'estilo_medianoche', 'estilo_menta', 'estilo_sakura', 'estilo_oceano', 'estilo_esmeralda', 'estilo_rubi', 'estilo_zafiro', 'estilo_amatista', 'estilo_atardecer', 'estilo_oro_rosa', 'estilo_fenix', 'estilo_lava', 'estilo_obsidiana', 'estilo_cyberpunk', 'estilo_galaxia', 'estilo_arcoiris', 'estilo_holograma'));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in ('ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque', 'personalizado', 'prodigio', 'ciudad_numeria', 'ciudad_enigmia', 'ciudad_geografia', 'ciudad_quimia', 'ciudad_anatomia', 'ciudad_melodia', 'ciudad_trigonometria', 'ciudad_historia', 'ciudad_calculia', 'ciudad_circuitia', 'ciudad_estadistica', 'ciudad_naipia', 'ciudad_codia', 'ciudad_dinamia', 'ciudad_vitalia', 'artico', 'selva', 'desierto', 'medianoche', 'atardecer', 'sakura', 'lava', 'caramelo', 'tormenta', 'coral', 'galaxia', 'neon'));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
  ('marco_estilo_artico', 'marco', 'estilo_artico', 'Marco Ártico', 'comun', 900, true, true, null, null),
  ('marco_estilo_medianoche', 'marco', 'estilo_medianoche', 'Marco Medianoche', 'comun', 900, true, true, null, null),
  ('marco_estilo_menta', 'marco', 'estilo_menta', 'Marco Menta', 'comun', 900, true, true, null, null),
  ('marco_estilo_sakura', 'marco', 'estilo_sakura', 'Marco Sakura', 'raro', 1800, true, true, null, null),
  ('marco_estilo_oceano', 'marco', 'estilo_oceano', 'Marco Océano profundo', 'raro', 1800, true, true, null, null),
  ('marco_estilo_esmeralda', 'marco', 'estilo_esmeralda', 'Marco Esmeralda real', 'raro', 1800, true, true, null, null),
  ('marco_estilo_rubi', 'marco', 'estilo_rubi', 'Marco Rubí', 'raro', 1800, true, true, null, null),
  ('marco_estilo_zafiro', 'marco', 'estilo_zafiro', 'Marco Zafiro', 'raro', 1800, true, true, null, null),
  ('marco_estilo_amatista', 'marco', 'estilo_amatista', 'Marco Amatista', 'raro', 1800, true, true, null, null),
  ('marco_estilo_atardecer', 'marco', 'estilo_atardecer', 'Marco Atardecer', 'raro', 1800, true, true, null, null),
  ('marco_estilo_oro_rosa', 'marco', 'estilo_oro_rosa', 'Marco Oro rosa', 'raro', 2000, true, true, null, null),
  ('marco_estilo_fenix', 'marco', 'estilo_fenix', 'Marco Fénix', 'epico', 3200, true, true, null, null),
  ('marco_estilo_lava', 'marco', 'estilo_lava', 'Marco Lava', 'epico', 3000, true, true, null, null),
  ('marco_estilo_obsidiana', 'marco', 'estilo_obsidiana', 'Marco Obsidiana dorada', 'epico', 3000, true, true, null, null),
  ('marco_estilo_cyberpunk', 'marco', 'estilo_cyberpunk', 'Marco Cyberpunk', 'epico', 3400, true, true, null, null),
  ('marco_estilo_galaxia', 'marco', 'estilo_galaxia', 'Marco Galaxia', 'epico', 3600, true, true, null, null),
  ('marco_estilo_arcoiris', 'marco', 'estilo_arcoiris', 'Marco Arcoíris', 'legendario', 6000, true, true, null, null),
  ('marco_estilo_holograma', 'marco', 'estilo_holograma', 'Marco Holograma', 'legendario', 6500, true, true, null, null),
  ('fondo_estilo_artico', 'fondo', 'artico', 'Fondo Ártico', 'comun', 1000, true, true, null, null),
  ('fondo_estilo_selva', 'fondo', 'selva', 'Fondo Selva', 'comun', 1000, true, true, null, null),
  ('fondo_estilo_desierto', 'fondo', 'desierto', 'Fondo Desierto', 'comun', 1000, true, true, null, null),
  ('fondo_estilo_medianoche', 'fondo', 'medianoche', 'Fondo Medianoche', 'comun', 1000, true, true, null, null),
  ('fondo_estilo_atardecer', 'fondo', 'atardecer', 'Fondo Atardecer', 'raro', 1600, true, true, null, null),
  ('fondo_estilo_sakura', 'fondo', 'sakura', 'Fondo Sakura', 'raro', 1600, true, true, null, null),
  ('fondo_estilo_lava', 'fondo', 'lava', 'Fondo Lava', 'raro', 1600, true, true, null, null),
  ('fondo_estilo_caramelo', 'fondo', 'caramelo', 'Fondo Caramelo', 'raro', 1600, true, true, null, null),
  ('fondo_estilo_tormenta', 'fondo', 'tormenta', 'Fondo Tormenta', 'raro', 1600, true, true, null, null),
  ('fondo_estilo_coral', 'fondo', 'coral', 'Fondo Arrecife', 'raro', 1600, true, true, null, null),
  ('fondo_estilo_galaxia', 'fondo', 'galaxia', 'Fondo Galaxia', 'epico', 2800, true, true, null, null),
  ('fondo_estilo_neon', 'fondo', 'neon', 'Fondo Neón', 'epico', 2800, true, true, null, null),
  ('estela_rosa', 'estela', 'rosa', 'Estela Rosa', 'comun', 1200, true, true, null, null),
  ('estela_hielo', 'estela', 'hielo', 'Estela Hielo', 'raro', 1600, true, true, null, null),
  ('estela_toxica', 'estela', 'toxica', 'Estela Tóxica', 'raro', 1600, true, true, null, null),
  ('estela_fantasma', 'estela', 'fantasma', 'Estela Fantasma', 'raro', 2000, true, true, null, null),
  ('estela_lava', 'estela', 'lava', 'Estela Lava', 'raro', 2000, true, true, null, null),
  ('estela_solar', 'estela', 'solar', 'Estela Solar', 'epico', 2400, true, true, null, null),
  ('estela_obsidiana', 'estela', 'obsidiana', 'Estela Obsidiana', 'epico', 2800, true, true, null, null),
  ('efecto_corazones', 'efecto', 'corazones', 'Corazones', 'comun', 1200, true, true, null, null),
  ('efecto_copos', 'efecto', 'copos', 'Copos de nieve', 'comun', 1200, true, true, null, null),
  ('efecto_fuegos', 'efecto', 'fuegos', 'Fuegos artificiales', 'raro', 1600, true, true, null, null),
  ('efecto_rayos', 'efecto', 'rayos', 'Rayos', 'raro', 1600, true, true, null, null),
  ('efecto_hojas', 'efecto', 'hojas', 'Hojas al viento', 'raro', 1600, true, true, null, null),
  ('efecto_dados', 'efecto', 'dados', 'Dados', 'raro', 1600, true, true, null, null),
  ('efecto_matematicas', 'efecto', 'matematicas', 'Matemáticas', 'raro', 2000, true, true, null, null),
  ('efecto_galaxia', 'efecto', 'galaxia', 'Polvo de galaxia', 'epico', 2400, true, true, null, null),
  ('sonido_xilofono', 'sonido', 'xilofono', 'Sonido Xilófono', 'comun', 1000, true, true, null, null),
  ('sonido_arcade', 'sonido', 'arcade', 'Sonido Arcade', 'comun', 1200, true, true, null, null),
  ('sonido_arpa', 'sonido', 'arpa', 'Sonido Arpa', 'raro', 1500, true, true, null, null),
  ('sonido_cristal', 'sonido', 'cristal', 'Sonido Cristal', 'raro', 1500, true, true, null, null),
  ('emote_jaja', 'emote', 'jaja', '😂 ¡Jajaja!', 'comun', 400, true, true, null, null),
  ('emote_respeto', 'emote', 'respeto', '🫡 Respeto', 'comun', 400, true, true, null, null),
  ('emote_ojos', 'emote', 'ojos', '👀 Te estoy viendo', 'comun', 400, true, true, null, null),
  ('emote_fuerza', 'emote', 'fuerza', '💪 ¡Con todo!', 'comun', 400, true, true, null, null),
  ('emote_suerte', 'emote', 'suerte', '🍀 ¡Suerte!', 'comun', 400, true, true, null, null),
  ('emote_casi', 'emote', 'casi', '😅 Uy, casi', 'comun', 400, true, true, null, null),
  ('emote_pensando', 'emote', 'pensando', '🤔 Hmm…', 'comun', 400, true, true, null, null),
  ('emote_corazon', 'emote', 'corazon', '❤️ ¡Gran partida!', 'comun', 400, true, true, null, null),
  ('emote_mente', 'emote', 'mente', '🤯 ¡Mente volada!', 'comun', 600, true, true, null, null),
  ('emote_facil', 'emote', 'facil', '😎 Muy fácil', 'comun', 600, true, true, null, null),
  ('emote_blanco', 'emote', 'blanco', '🎯 ¡En el blanco!', 'comun', 600, true, true, null, null),
  ('emote_revancha', 'emote', 'revancha', '😤 ¡Revancha!', 'comun', 600, true, true, null, null),
  ('emote_congelado', 'emote', 'congelado', '🥶 ¡Te congelé!', 'comun', 600, true, true, null, null),
  ('emote_cohete', 'emote', 'cohete', '🚀 ¡A toda velocidad!', 'comun', 600, true, true, null, null),
  ('emote_fiesta', 'emote', 'fiesta', '🎉 ¡Fiesta!', 'comun', 600, true, true, null, null),
  ('emote_sueno', 'emote', 'sueno', '😴 Zzz…', 'comun', 600, true, true, null, null),
  ('emote_goat', 'emote', 'goat', '🐐 El mejor de todos', 'raro', 900, true, true, null, null),
  ('emote_campeon', 'emote', 'campeon', '🏆 ¡Campeón!', 'raro', 900, true, true, null, null),
  ('titulo_mente_brillante', 'titulo', 'tienda-mente-brillante', 'Mente Brillante', 'raro', 1500, true, true, null, null),
  ('titulo_cazarrecords', 'titulo', 'tienda-cazarrecords', 'Cazarrécords', 'raro', 1500, true, true, null, null),
  ('titulo_maestro_zen', 'titulo', 'tienda-maestro-zen', 'Calma Zen', 'raro', 1500, true, true, null, null),
  ('titulo_viajero_saber', 'titulo', 'tienda-viajero-saber', 'Viajero del Saber', 'raro', 1500, true, true, null, null),
  ('titulo_rey_duelos', 'titulo', 'tienda-rey-duelos', 'Realeza de los Duelos', 'raro', 1500, true, true, null, null),
  ('titulo_sabio_nocturno', 'titulo', 'tienda-sabio-nocturno', 'Sabio Nocturno', 'raro', 1500, true, true, null, null),
  ('titulo_imparable', 'titulo', 'tienda-imparable', 'Imparable', 'raro', 1500, true, true, null, null),
  ('titulo_curioso', 'titulo', 'tienda-curioso', 'Curiosidad Profesional', 'raro', 1500, true, true, null, null),
  ('titulo_genio_construccion', 'titulo', 'tienda-genio-construccion', 'Genio en Construcción', 'raro', 1500, true, true, null, null),
  ('titulo_velocidad_luz', 'titulo', 'tienda-velocidad-luz', 'Velocidad Luz', 'raro', 1500, true, true, null, null),
  ('titulo_leyenda_viva', 'titulo', 'tienda-leyenda-viva', 'Leyenda Viva', 'epico', 3000, true, true, null, null),
  ('titulo_cerebro_galactico', 'titulo', 'tienda-cerebro-galactico', 'Cerebro Galáctico', 'epico', 3000, true, true, null, null)
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

insert into public.paquetes_tienda (slug, nombre, items, precio) values
  ('pack_galaxia', 'Pack Galaxia', array['marco_estilo_galaxia', 'fondo_estilo_galaxia', 'efecto_galaxia'], 6600),
  ('pack_volcan', 'Pack Volcán', array['marco_estilo_lava', 'fondo_estilo_lava', 'estela_lava', 'efecto_fuegos'], 6150),
  ('pack_invierno', 'Pack Invierno', array['marco_estilo_artico', 'fondo_estilo_artico', 'estela_hielo', 'efecto_copos'], 3525),
  ('pack_sonidos_2', 'Pack Sonidos II', array['sonido_xilofono', 'sonido_arcade', 'sonido_arpa', 'sonido_cristal'], 3900),
  ('pack_emotes_2', 'Pack Emotes II', array['emote_mente', 'emote_facil', 'emote_blanco', 'emote_revancha', 'emote_congelado', 'emote_cohete'], 2700),
  ('pack_neon_total', 'Pack Neón', array['marco_estilo_cyberpunk', 'fondo_estilo_neon', 'sonido_arcade'], 5550)
on conflict (slug) do update set nombre = excluded.nombre, items = excluded.items, precio = excluded.precio;

notify pgrst, 'reload schema';
