-- 0313: marcos animados de verdad (aprobados el 2026-11-05, docs/rediseno/marcos-animados.html).
-- Ocho marcos que son una animación encima del avatar (fuego, hielo, rayos, órbita,
-- enredadera, corona, agua y glitch), en vez del aro de colores que gira. Se venden en
-- la Herrería y salen en las cápsulas como cualquier marco. Las imágenes están en
-- public/marcos (scripts/marcos). Requiere 0311 (lista de marcos).

alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in ('ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'neon_violeta', 'neon_cian', 'neon_magenta', 'temporada_aurora', 'temporada_brasas', 'temporada_escarcha', 'temporada_cosmos', 'coleccion_numeria', 'coleccion_enigmia', 'coleccion_geografia', 'coleccion_quimia', 'coleccion_anatomia', 'coleccion_melodia', 'coleccion_trigonometria', 'coleccion_historia', 'coleccion_calculia', 'coleccion_circuitia', 'coleccion_estadistica', 'coleccion_naipia', 'coleccion_codia', 'coleccion_dinamia', 'coleccion_vitalia', 'pionero', 'estilo_artico', 'estilo_medianoche', 'estilo_menta', 'estilo_sakura', 'estilo_oceano', 'estilo_esmeralda', 'estilo_rubi', 'estilo_zafiro', 'estilo_amatista', 'estilo_atardecer', 'estilo_oro_rosa', 'estilo_fenix', 'estilo_lava', 'estilo_obsidiana', 'estilo_cyberpunk', 'estilo_galaxia', 'estilo_arcoiris', 'estilo_holograma', 'evento_calabaza', 'evento_esqueleto', 'evento_papel_picado', 'evento_calavera', 'evento_diya', 'evento_rangoli', 'evento_cometa', 'evento_constelacion', 'evento_baston', 'evento_luces', 'evento_fuegos', 'evento_medianoche', 'evento_farol', 'evento_dragon', 'evento_cupido', 'evento_lazo', 'evento_antifaz', 'evento_carnaval', 'evento_linterna', 'evento_luna', 'evento_pi', 'evento_espiral', 'evento_gulal', 'evento_holi', 'evento_huevo', 'evento_conejo', 'evento_hoja', 'evento_planeta', 'evento_vinilo', 'evento_pentagrama', 'evento_cuaderno', 'evento_birrete', 'animado_fenix', 'animado_corona', 'animado_escarcha', 'animado_tormenta', 'animado_orbita', 'animado_glitch', 'animado_enredadera', 'animado_marea'));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
  ('marco_animado_fenix', 'marco', 'animado_fenix', 'Marco Fénix vivo', 'legendario', 6500, true, true, null, null),
  ('marco_animado_corona', 'marco', 'animado_corona', 'Marco Corona', 'legendario', 6500, true, true, null, null),
  ('marco_animado_escarcha', 'marco', 'animado_escarcha', 'Marco Escarcha', 'epico', 3400, true, true, null, null),
  ('marco_animado_tormenta', 'marco', 'animado_tormenta', 'Marco Tormenta', 'epico', 3400, true, true, null, null),
  ('marco_animado_orbita', 'marco', 'animado_orbita', 'Marco Órbita', 'epico', 3400, true, true, null, null),
  ('marco_animado_glitch', 'marco', 'animado_glitch', 'Marco Glitch', 'epico', 3400, true, true, null, null),
  ('marco_animado_enredadera', 'marco', 'animado_enredadera', 'Marco Enredadera', 'raro', 2000, true, true, null, null),
  ('marco_animado_marea', 'marco', 'animado_marea', 'Marco Marea', 'raro', 2000, true, true, null, null)
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;
