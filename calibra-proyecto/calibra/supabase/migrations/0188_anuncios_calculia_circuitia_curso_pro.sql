-- ============================================================
-- Prodigia — pedido del usuario 2026-09-18: los mundos nuevos (y los
-- beneficios Pro nuevos) tienen que anunciarse — se reutiliza el
-- sistema de anuncios ya existente (0065_anuncios.sql, AnunciosModal.tsx)
-- en vez de construir algo nuevo. Dos anuncios nuevos:
-- 1) Calculia y Circuitia (mundos 9 y 10).
-- 2) El Curso estructurado, nuevo beneficio de Prodigia Pro.
-- ============================================================

insert into public.anuncios (tipo, titulo, descripcion) values
(
  'actualizacion',
  'Nuevos mundos: Calculia y Circuitia',
  'Dos ciudades nuevas para practicar: Calculia (cálculo — derivadas, integrales, series y EDOs) y Circuitia (circuitos eléctricos, con diagramas interactivos que se resuelven en vivo). Ya se pueden desbloquear con Chispas desde la Tienda.'
),
(
  'actualizacion',
  'Nuevo en Pro: Curso estructurado',
  'Prodigia Pro suma un beneficio: lecciones a fondo con ejemplos resueltos paso a paso y un quiz que hay que aprobar para avanzar a la siguiente — por ahora en Calculia y Circuitia, con el primer módulo siempre gratis para probarlo.'
);
