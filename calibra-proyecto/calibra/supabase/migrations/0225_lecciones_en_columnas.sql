-- ============================================================
-- Prodigia — lecciones de Aprender en inglés (pedido del usuario, 2026-09-25:
-- "traducción de cada uno de los mundos y sus clases y técnicas").
--
-- Las Técnicas y Clases viven en `techniques` (todos los mundos salvo Enigmia) y
-- `logic_techniques` (Enigmia), en español. Se agregan tres columnas NULLABLE por
-- tabla, con el mismo significado que las originales:
--   nombre_en       nombre de la lección
--   descripcion_en  descripción corta
--   contenido_en    el `contenido` completo con los textos en inglés (pasos, quiz y
--                   los textos de los visuales), con EXACTAMENTE la misma forma que
--                   `contenido`
-- La app usa la versión en inglés cuando el idioma es inglés y la lección ya está
-- traducida; si no, muestra el español (nunca una lección vacía). El servidor de
-- /api/aprender/completar y /api/enigmia/completar-leccion acepta la respuesta
-- correcta del quiz en cualquiera de los dos idiomas (misma posición).
--
-- IMPORTANTE: correr esta migración ANTES de desplegar/usar la versión de la app que
-- pide estas columnas (los listados de Aprender las seleccionan). Los textos en
-- inglés de cada mundo llegan en migraciones siguientes (0226 en adelante), que solo
-- hacen `update` de estas columnas por slug.
-- ============================================================

alter table public.techniques
  add column if not exists nombre_en text,
  add column if not exists descripcion_en text,
  add column if not exists contenido_en jsonb;

alter table public.logic_techniques
  add column if not exists nombre_en text,
  add column if not exists descripcion_en text,
  add column if not exists contenido_en jsonb;

notify pgrst, 'reload schema';
