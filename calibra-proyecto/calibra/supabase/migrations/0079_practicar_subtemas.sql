-- ============================================================
-- Prodigia — Fase 1 + Fase 2 de la tanda "Numeria: Geometría,
-- Practicar estandarizado, nivel de mundo, Anatomía":
--
-- Fase 1: activa Geometría básica en Numeria (perímetro, área,
-- ángulos, ternas pitagóricas), cada sub-tema con su propia
-- calibración.
--
-- Fase 2: Fracciones/Decimales/Potencias/Álgebra pasan de UN nivel
-- compartido por tema a un nivel independiente POR SUB-TEMA — mismo
-- patrón que ya usaba Aritmética (suma/resta/multiplicacion/division)
-- y Quimia (quimia_simbolos/formulas/tabla/...). Los problem_type
-- viejos ('fracciones', 'decimales', 'potencias', 'algebra') quedan
-- en la base como datos históricos — ya no se escriben más, no hace
-- falta borrarlos ni migrarlos (no hay forma fundada de repartir un
-- nivel agregado viejo en 3 niveles nuevos).
-- ============================================================

alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos'
  ));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos'
  ));

-- Las lecciones de Aprender de Geometría quedan bajo un solo
-- problem_type 'geometria' (mismo criterio que fracciones/decimales/
-- potencias/algebra: la lección es del TEMA, no de un sub-tema
-- puntual de práctica).
alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'geografia', 'algebra', 'quimia',
    'geometria'
  ));

-- ---------- Fase 1: 4 lecciones de Geometría (técnicas mentales, no
-- cómputo) ----------
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
('geometria-ternas-pitagoricas', 'Ternas pitagóricas de memoria',
  'Memorizá 3-4-5, 5-12-13 y 8-15-17 (y sus múltiplos, como 6-8-10) — si dos lados de un triángulo rectángulo encajan en uno de estos patrones, ya sabés el tercero sin calcular ninguna raíz.',
  'geometria',
  '{"pasos": [
    "Un triángulo rectángulo tiene catetos 6 y 8",
    "6 = 2×3 y 8 = 2×4 — es la terna 3-4-5 multiplicada por 2",
    "La hipotenusa es 2×5 = 10",
    "Ninguna raíz cuadrada: solo reconocer el patrón"
  ]}',
  1),
('geometria-area-compuestas', 'Área de figuras compuestas: dividí en partes simples',
  'Una figura rara casi siempre es un rectángulo grande menos (o más) uno chico. Calculá cada parte por separado y sumá o restá al final.',
  'geometria',
  '{"pasos": [
    "Un rectángulo de 10×8 con una esquina de 3×2 recortada",
    "Área del rectángulo grande: 10×8 = 80",
    "Área del rectángulo recortado: 3×2 = 6",
    "Área final: 80 − 6 = 74"
  ]}',
  2),
('geometria-pi-fraccion', 'π ≈ 22/7 cuando el radio es múltiplo de 7, si no, 3.14',
  'Con radios múltiplos de 7, usar 22/7 en vez de 3.14 deja cuentas exactas sin decimales. Con cualquier otro radio, 3.14 sigue siendo la mejor aproximación rápida.',
  'geometria',
  '{"pasos": [
    "Círculo de radio 7: área = π × 7²",
    "Con 22/7: (22/7) × 49 = 22 × 7 = 154 (exacto, sin decimales)",
    "Círculo de radio 5: 5 no es múltiplo de 7",
    "Usá 3.14 × 25 = 78.5"
  ]}',
  3),
('geometria-angulos-complementarios', 'Ángulos complementarios y suplementarios, de un vistazo',
  'Complementarios suman 90°, suplementarios suman 180°. Restá directo del total — no hace falta plantear una ecuación para esto.',
  'geometria',
  '{"pasos": [
    "Dos ángulos suplementarios, uno mide 125°",
    "180 − 125 = 55",
    "El otro mide 55°",
    "Con complementarios es igual, pero restando de 90"
  ]}',
  4);
