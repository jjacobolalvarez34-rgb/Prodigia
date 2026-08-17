-- ============================================================
-- Prodigia — lecciones mnemotécnicas de Geografía (cierre de Fase B2)
-- Correr después de 0026_decimales_potencias.sql
-- Mismo criterio que 0019/0026: reutiliza la tabla techniques
-- ampliando el check constraint, sin tabla nueva.
-- ============================================================

alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias'));

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
(
  'dividir-en-subregiones',
  'Divide y vencerás',
  'Agrupar países en sub-regiones mentales es mucho más fácil que memorizarlos sueltos.',
  'geografia',
  '{"pasos": [
    "En vez de memorizar los países sueltos, agrupalos en sub-regiones: Centroamérica es un bloque aparte de Sudamérica, Europa del Este es distinta de Europa Occidental.",
    "Aprendé primero dónde está cada sub-región como un bloque grande en el mapa.",
    "Recién después ubicá los países dentro de cada bloque — es mucho más fácil recordar 5 países de una región que 25 sueltos."
  ]}',
  1
),
(
  'anclar-por-vecinos',
  'Ancla por vecinos',
  'Usá un país que ya ubicás sin dudar como referencia para encontrar los de al lado.',
  'geografia',
  '{"pasos": [
    "Elegí un país que ya ubicás sin dudar — tu ancla. Si ya sabés dónde está Brasil o Francia, usalo de punto de partida.",
    "Para ubicar un país nuevo, preguntate: ¿está al norte, sur, este u oeste de mi ancla?",
    "Cada país que aprendés bien se convierte en una nueva ancla — el mapa se arma en cadena, no de una sola vez."
  ]}',
  2
),
(
  'forma-caracteristica',
  'Forma característica',
  'Reconocer un país por su silueta distintiva, antes de mirar sus fronteras exactas.',
  'geografia',
  '{"pasos": [
    "Fijate en la silueta general del país antes que en los detalles de la frontera — muchos se reconocen de un vistazo.",
    "Ejemplos: Italia tiene forma de bota, Chile es una franja larga y angosta pegada a la cordillera.",
    "Practicá tapando el nombre: ¿reconocés la forma sin leer nada?"
  ]}',
  3
);
