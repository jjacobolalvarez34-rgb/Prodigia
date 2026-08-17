-- ============================================================
-- Prodigia — separar secuencia y pregunta en los acertijos de Memoria
-- sembrados (Fase W2)
-- Correr después de 0029_ranking_por_mundo.sql
-- Estas 6 filas (sembradas en 0020_enigmia_categorias.sql) tenían la
-- secuencia a memorizar Y la pregunta en el mismo `enunciado`, mostradas
-- junto con las opciones — anulaba el ejercicio. Se identifican por
-- tipo='memoria' + dificultad (única por fila en el seed original).
-- ============================================================

update public.logic_puzzles
set contenido = '{"enunciado": "¿Cuál fue el segundo?", "opciones": ["Perro", "Gato", "Pájaro", "Pez"], "secuencia": ["Perro", "Gato", "Pájaro"]}'
where tipo = 'memoria' and dificultad = 1;

update public.logic_puzzles
set contenido = '{"enunciado": "¿Cuál número fue el tercero?", "opciones": ["7", "2", "9", "4"], "secuencia": ["7", "2", "9", "4"]}'
where tipo = 'memoria' and dificultad = 2;

update public.logic_puzzles
set contenido = '{"enunciado": "¿Cuál fue el primero?", "opciones": ["Lunes", "Miércoles", "Viernes", "Domingo"], "secuencia": ["Lunes", "Miércoles", "Viernes"]}'
where tipo = 'memoria' and dificultad = 3;

update public.logic_puzzles
set contenido = '{"enunciado": "¿Cuál fue el cuarto?", "opciones": ["Rojo", "Verde", "Amarillo", "Violeta"], "secuencia": ["Rojo", "Azul", "Verde", "Amarillo", "Violeta"]}'
where tipo = 'memoria' and dificultad = 4;

update public.logic_puzzles
set contenido = '{"enunciado": "¿Qué número acompañaba a la C?", "opciones": ["3", "7", "1", "9"], "secuencia": ["A-3", "B-7", "C-1", "D-9"]}'
where tipo = 'memoria' and dificultad = 5;

update public.logic_puzzles
set contenido = '{"enunciado": "¿Cuál fue el quinto número?", "opciones": ["9", "1", "6", "2"], "secuencia": ["5", "8", "2", "9", "1", "6"]}'
where tipo = 'memoria' and dificultad = 6;
