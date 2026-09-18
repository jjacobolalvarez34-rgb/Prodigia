-- ============================================================
-- Prodigia — corrige un bug real de contenido encontrado durante el
-- Proceso 1 (ver migración 0177 y docs/PLAN_REVISION_CONTENIDO.md):
-- la lección 'trigonometria-truco-mano-circulo' (0108) tenía la
-- dirección de conteo invertida y las etiquetas de seno/coseno
-- cruzadas — aplicado literal al pulgar daba sen(0°)=√5/2≈1.118,
-- imposible (el seno nunca supera 1).
--
-- Fórmula real, verificada a mano contra los 5 ángulos notables
-- (pulgar=0°, índice=30°, medio=45°, anular=60°, meñique=90°,
-- numerados k=0..4): sen(dedo_k) = √k/2, cos(dedo_k) = √(4-k)/2.
-- Con esto: sen(pulgar)=0, sen(índice)=√1/2=1/2, sen(medio)=√2/2,
-- sen(anular)=√3/2, sen(meñique)=√4/2=1 — y de forma simétrica para
-- coseno. Coincide con el ejemplo que la propia lección ya traía
-- (anular/60°: sen=√3/2, cos=1/2), que era el único dato
-- numéricamente correcto del texto viejo.
--
-- No se toca el quiz agregado en 0177 (jsonb_set solo reemplaza la
-- clave "pasos", "quiz" queda intacto) — nunca se edita una migración
-- vieja, esto es una migración nueva sobre la fila existente.
-- Se agrega además un diagrama interactivo (ManoCirculoSVG.tsx, mano
-- con dedos que se colorean al elegir uno) — pedido explícito del
-- usuario 2026-09-18 ("sería increíble, explicaciones gráficas").
-- ============================================================

update public.techniques
set contenido = jsonb_set(contenido, '{pasos}', '[
  "Los 5 ángulos notables (0°, 30°, 45°, 60°, 90°) se asocian a los 5 dedos de una mano: pulgar=0°, índice=30°, medio=45°, anular=60°, meñique=90°.",
  "Para el SENO: contá los dedos desde el pulgar (SIN contarlo a él) hasta el dedo elegido (SÍ contándolo a él) — llamá k a esa cantidad. sen(ángulo) = √k / 2.",
  "Para el COSENO: contá los dedos desde el dedo elegido (SIN contarlo a él) hasta el meñique (SÍ contándolo a él) — llamá m a esa cantidad. cos(ángulo) = √m / 2.",
  "Ejemplo con el anular (60°): del pulgar al anular, sin contar el pulgar, hay 3 dedos (índice, medio, anular) → sen(60°) = √3/2. Del anular al meñique, sin contar el anular, hay 1 dedo (el meñique) → cos(60°) = √1/2 = 1/2.",
  "Usá el dibujo de arriba: tocá cualquier dedo y mirá cómo se colorean en azul los que cuentan para el seno y en naranja los que cuentan para el coseno — así no hay que memorizar la dirección, se ve."
]'::jsonb)
where slug = 'trigonometria-truco-mano-circulo';
