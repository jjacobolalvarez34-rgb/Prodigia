-- ============================================================
-- Prodigia — pedido del usuario 2026-09-20: los mundos nuevos y los
-- beneficios Pro nuevos se anuncian en pantalla (regla vinculante de
-- PARIDAD_MUNDOS.md). Se reutiliza el sistema de anuncios existente
-- (0065_anuncios.sql, AnunciosModal.tsx). Dos anuncios SEPARADOS:
-- 1) Los tres mundos nuevos (11 Estadística, 12 Naipia, 13 Codia).
-- 2) La pestaña "Clases" de Aprender (beneficio Pro; reemplaza al
--    "Curso estructurado" anunciado en 0188).
-- ============================================================

insert into public.anuncios (tipo, titulo, descripcion) values
(
  'actualizacion',
  'Nuevos mundos: Estadística, Naipia y Codia',
  'Tres ciudades nuevas para practicar: Estadística (medidas, probabilidad, datos y lectura de gráficos), Naipia (deporte mental de memoria: cinco sistemas de conteo de cartas, de Hi-Lo a conteo verdadero) y Codia (leer y razonar código en Python, Java, JavaScript y TypeScript). Se desbloquean con Chispas desde la Tienda, y en Rankeds se puede jugar cualquiera.'
),
(
  'actualizacion',
  'Nuevo en Pro: pestaña Clases',
  'Aprender ahora tiene dos pestañas: Técnicas (gratis, atajos y trucos) y Clases, con lecciones progresivas que enseñan el tema desde cero, ejemplos resueltos paso a paso y un quiz entre lección y lección. La primera clase de cada mundo es gratis para probarla; el resto es de Prodigia Pro. Ya disponible en Calculia, Circuitia, Estadística, Naipia y Codia.'
);
