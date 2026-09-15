-- ====================================================================
-- Prodigia — Trigonometría: 6ta lección de Aprender, pedida en vivo
-- (2026-09-14): "agrega una lección de cómo sacar senos cos y tan
-- mentalmente, por ejemplo tan20 ¿cómo lo saco mentalmente?". Las 5
-- lecciones que ya existían (0108) enseñan los 5 ángulos notables
-- (0/30/45/60/90, "el truco de la mano") pero nunca cómo estimar un
-- ángulo CUALQUIERA — que es justo lo que preguntó. Honesto en el
-- contenido: no hay una fórmula mental exacta para un ángulo como 20°
-- (es irracional, no tiene forma cerrada simple) — lo que SÍ se puede
-- enseñar, y es una técnica real que usa cualquiera que sea bueno
-- calculando mentalmente, es ESTIMAR por interpolación entre los
-- ángulos notables más cercanos (que ya sabés de memoria por la
-- lección 2). No se promete precisión de calculadora, se entrega una
-- estimación con buen orden de magnitud, que es lo que de verdad se
-- puede hacer de cabeza.
-- ====================================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
('trigonometria-estimar-no-notables', 'Estimar mentalmente ángulos que no son notables',
  'No hay truco exacto para algo como 20° — pero con los ángulos notables que ya sabés, podés estimarlo de cabeza con bastante precisión.',
  'trigonometria',
  '{"pasos": [
    "No busques una fórmula mental para un ángulo cualquiera (ej. 20°) — no existe, esos valores son irracionales sin forma simple. Lo que sí podés hacer es ESTIMAR, apoyándote en los ángulos notables que ya sabés (0°, 30°, 45°, 60°, 90° — lección 2)",
    "Paso 1: ubicá entre qué 2 ángulos notables cae el tuyo. Para 20°: está entre 0° (tan=0) y 30° (tan=√3/3≈0,577)",
    "Paso 2: fijate qué tan cerca estás de cada extremo. 20° está a 2/3 del camino de 0° a 30° (20 de los 30 grados). Multiplicá esa fracción por la diferencia: 2/3 × 0,577 ≈ 0,38",
    "Ese 0,38 ya es una estimación útil de tan(20°) — el valor real es 0,364, muy cerca. Funciona igual para seno y coseno, y con cualquier otro ángulo: siempre interpolando entre los 2 notables más próximos",
    "Ojo con la precisión: cerca de 0°-45° esta interpolación queda muy ajustada porque las curvas son casi rectas ahí. Cerca de 90° la tangente se dispara (crece cada vez más rápido) y la misma técnica da una estimación más floja — para eso, mejor ubicarte respecto al ángulo notable más cercano nomás, sin interpolar tan lejos"
  ]}',
  6)
on conflict (slug) do nothing;

notify pgrst, 'reload schema';
