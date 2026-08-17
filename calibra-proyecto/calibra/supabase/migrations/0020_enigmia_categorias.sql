-- ============================================================
-- Prodigia — Enigmia: categorías + memoria/programación (Fase KK)
-- Correr después de 0019_fracciones.sql
-- ============================================================

alter table public.logic_puzzles drop constraint logic_puzzles_tipo_check;
alter table public.logic_puzzles add constraint logic_puzzles_tipo_check
  check (tipo in ('secuencia', 'patron', 'deduccion', 'memoria', 'programacion'));

-- Categoría de exhibición en /enigmia: agrupa los 5 `tipo` de acertijo en
-- las 4 categorías que pide la Fase KK (secuencia y patron comparten
-- "Patrones" — son ambos reconocimiento de patrón, solo cambia el formato).
alter table public.logic_techniques add column categoria text
  check (categoria in ('memoria', 'patrones', 'deduccion', 'computacional'));

update public.logic_techniques set categoria = 'patrones' where slug in ('patron-numerico', 'encontrar-intruso', 'analogias');
update public.logic_techniques set categoria = 'deduccion' where slug = 'condicional-si-entonces';

alter table public.logic_techniques alter column categoria set not null;

-- ---------- acertijos nuevos: memoria y pensamiento computacional ----------
insert into public.logic_puzzles (tipo, dificultad, contenido, respuesta) values
('memoria', 1, '{"enunciado": "Memorizá esta lista: Perro, Gato, Pájaro. ¿Cuál fue el segundo?", "opciones": ["Perro", "Gato", "Pájaro", "Pez"]}', 'Gato'),
('memoria', 2, '{"enunciado": "Memorizá: 7, 2, 9, 4. ¿Cuál número fue el tercero?", "opciones": ["7", "2", "9", "4"]}', '9'),
('memoria', 3, '{"enunciado": "Memorizá: Lunes, Miércoles, Viernes. ¿Cuál fue el primero?", "opciones": ["Lunes", "Miércoles", "Viernes", "Domingo"]}', 'Lunes'),
('memoria', 4, '{"enunciado": "Memorizá: Rojo, Azul, Verde, Amarillo, Violeta. ¿Cuál fue el cuarto?", "opciones": ["Rojo", "Verde", "Amarillo", "Violeta"]}', 'Amarillo'),
('memoria', 5, '{"enunciado": "Memorizá: A-3, B-7, C-1, D-9. ¿Qué número acompañaba a la C?", "opciones": ["3", "7", "1", "9"]}', '1'),
('memoria', 6, '{"enunciado": "Memorizá esta secuencia: 5, 8, 2, 9, 1, 6. ¿Cuál fue el quinto número?", "opciones": ["9", "1", "6", "2"]}', '1'),
('programacion', 5, '{"enunciado": "x=5. Si x es mayor que 3, x=x+2. Si no, x=x-2. ¿Cuánto vale x al final?", "opciones": ["3", "7", "5", "2"]}', '7'),
('programacion', 6, '{"enunciado": "Un robot avanza 2 pasos y gira. Repite esto 3 veces. ¿Cuántos pasos caminó en total?", "opciones": ["2", "4", "6", "8"]}', '6'),
('programacion', 7, '{"enunciado": "x=2. Repetí 3 veces: x=x×2. ¿Cuánto vale x al final?", "opciones": ["6", "8", "16", "12"]}', '16'),
('programacion', 8, '{"enunciado": "Si llueve, el robot no sale. Si no llueve y hace frío, el robot sale con abrigo. Hoy no llueve y hace frío. ¿Qué hace el robot?", "opciones": ["No sale", "Sale sin abrigo", "Sale con abrigo", "No se sabe"]}', 'Sale con abrigo'),
('programacion', 9, '{"enunciado": "x=1. Repetí 4 veces: x=x+x. ¿Cuánto vale x al final?", "opciones": ["8", "16", "12", "4"]}', '16'),
('programacion', 10, '{"enunciado": "Una caja empieza vacía. Por cada número par del 1 al 10 se guarda una ficha; por cada impar, se saca una si hay. ¿Cuántas fichas quedan al final?", "opciones": ["0", "1", "2", "5"]}', '1');

-- ---------- lecciones nuevas: al menos una por categoría ----------
insert into public.logic_techniques (slug, nombre, descripcion, orden, categoria, contenido) values
(
  'tecnicas-de-memoria',
  'Agrupar para memorizar',
  'Es más fácil recordar una lista larga si la partís en grupos chicos en vez de memorizarla de corrido.',
  5,
  'memoria',
  '{
    "pasos": [
      "Partí la lista en grupos de 2 o 3 elementos.",
      "Repetí cada grupo por separado antes de juntarlos.",
      "Al final, recorré los grupos en orden para reconstruir la lista completa."
    ],
    "ejemplo": { "enunciado": "Memorizá: 7, 2, 9, 4. ¿Cuál número fue el tercero?", "opciones": ["7", "2", "9", "4"], "respuesta": "9" }
  }'
),
(
  'pensar-como-algoritmo',
  'Pensar paso a paso como un algoritmo',
  'Un problema de "pensamiento computacional" se resuelve simulando cada paso en orden, uno a la vez, sin saltarse ninguno.',
  6,
  'computacional',
  '{
    "pasos": [
      "Anotá el valor inicial de la variable.",
      "Aplicá cada instrucción en el orden exacto en que aparece, actualizando el valor.",
      "El valor final después de la última instrucción es la respuesta."
    ],
    "ejemplo": { "enunciado": "x=2. Repetí 3 veces: x=x×2. ¿Cuánto vale x al final?", "opciones": ["6", "8", "16", "12"], "respuesta": "16" }
  }'
);
