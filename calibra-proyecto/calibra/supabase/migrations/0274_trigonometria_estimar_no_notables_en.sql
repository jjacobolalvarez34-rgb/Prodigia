-- ============================================================
-- Prodigia — Trigonometría: la lección suelta de 0147 en inglés.
--
-- «trigonometria-estimar-no-notables» (0147) vive solo en la base: nunca pasó
-- a la fuente TS de Trigonometría (src/lib/trigonometria/lecciones), así que
-- el generador de src/lib/i18n-lecciones no la ve. Igual que 0242 con las
-- técnicas históricas de Enigmia, se traduce a mano. Solo tiene `pasos` (sin
-- quiz ni visuales) y no hay fórmulas $…$ que deban coincidir.
--
-- La encontró la prueba «toda lección de las migraciones tiene inglés»
-- (src/lib/i18n-lecciones/traducciones.test.ts), que lee todas las migraciones.
-- Requiere 0225_lecciones_en_columnas.sql. Solo UPDATE por slug.
-- ============================================================

update public.techniques set
  nombre_en = 'Estimate angles that aren''t special ones in your head',
  descripcion_en = 'There''s no exact trick for something like 20° — but with the special angles you already know, you can estimate it in your head quite accurately.',
  contenido_en = contenido || jsonb_build_object(
    'pasos', jsonb_build_array(
      'Don''t look for a mental formula for just any angle (e.g. 20°) — there isn''t one, those values are irrational with no simple form. What you can do is ESTIMATE, relying on the special angles you already know (0°, 30°, 45°, 60°, 90° — lesson 2)',
      'Step 1: find which 2 special angles yours falls between. For 20°: it''s between 0° (tan=0) and 30° (tan=√3/3≈0.577)',
      'Step 2: see how close you are to each end. 20° is 2/3 of the way from 0° to 30° (20 of the 30 degrees). Multiply that fraction by the difference: 2/3 × 0.577 ≈ 0.38',
      'That 0.38 is already a useful estimate of tan(20°) — the real value is 0.364, very close. It works the same for sine and cosine, and with any other angle: always interpolating between the 2 nearest special angles',
      'Watch the accuracy: near 0°-45° this interpolation is very tight because the curves are almost straight there. Near 90° the tangent shoots up (it grows faster and faster) and the same technique gives a looser estimate — for that, it''s better to just place yourself relative to the nearest special angle, without interpolating so far'
    )
  )
where slug = 'trigonometria-estimar-no-notables';

notify pgrst, 'reload schema';
