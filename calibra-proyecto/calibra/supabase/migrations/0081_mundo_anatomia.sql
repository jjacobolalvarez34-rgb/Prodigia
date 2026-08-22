-- ============================================================
-- Prodigia — Fase 5 de la tanda "Numeria: Geometría, Practicar
-- estandarizado, nivel de mundo, Anatomía": nuevo mundo Anatomía.
-- Mismo patrón que Quimia (0056/0067): 4 modos, cada uno su propio
-- problem_type en skill_levels/attempts, lecciones bajo un solo
-- problem_type ('anatomia') en techniques, onboarding propio, entrada
-- en world_progress.
-- Correr después de 0080_nivel_mundo_dominio_real.sql.
-- ============================================================

alter table public.profiles add column if not exists onboarding_anatomia_completado boolean not null default false;

alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
    'anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso'
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
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
    'anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso'
  ));

alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'geografia', 'algebra', 'quimia',
    'geometria', 'anatomia'
  ));

alter table public.world_progress drop constraint if exists world_progress_world_check;
alter table public.world_progress add constraint world_progress_world_check
  check (world in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia'));

-- ---------- Fase 5: 5 lecciones de Anatomía (técnicas de
-- memorización, no de cómputo — mismo espíritu que Geografía) ----------
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
('anatomia-craneo-por-zona', 'Huesos del cráneo: agrupalos por zona',
  'En vez de memorizar los 10 sueltos, dividilos en 3 grupos: la bóveda (frontal, parietal ×2, temporal ×2, occipital), la cara (maxilar, mandíbula, cigomático ×2, nasal) y los internos (esfenoides, etmoides).',
  'anatomia',
  '{"pasos": [
    "Bóveda (arriba y atrás): frontal, parietal, temporal, occipital",
    "Cara (adelante, los que se ven): maxilar, mandíbula, cigomático, nasal",
    "Internos (no se tocan desde afuera): esfenoides, etmoides",
    "3 grupos de 3-4 en vez de 10 sueltos — mucho más fácil de retener"
  ]}',
  1),
('anatomia-nombre-del-musculo', 'El nombre del músculo ya te dice dónde está',
  'Muchos nombres de músculos de la cara son literales: "orbicular" rodea una órbita (ojo o boca), "temporal" está en la sien (la zona del tiempo/las canas), "occipital" en la nuca (occipucio). Leé el nombre antes de memorizarlo de memoria.',
  'anatomia',
  '{"pasos": [
    "Orbicular de los ojos: forma un círculo (órbita) alrededor del ojo",
    "Orbicular de la boca: mismo patrón, alrededor de la boca",
    "Cigomático mayor: se ancla en el hueso cigomático (el pómulo)",
    "El nombre casi nunca es arbitrario — leelo como una pista, no como una etiqueta"
  ]}',
  2),
('anatomia-nervios-por-funcion', 'Pares craneales: agrupalos por función, no por número',
  'En vez de memorizar los 12 en fila, separalos en 3 grupos según qué hacen: sensoriales puros (I olfatorio, II óptico, VIII vestibulococlear), motores puros (III oculomotor, IV troclear, VI abducens, XI accesorio, XII hipogloso) y mixtos (V trigémino, VII facial, IX glosofaríngeo, X vago).',
  'anatomia',
  '{"pasos": [
    "Sensoriales puros (solo mandan información): olfatorio, óptico, vestibulococlear",
    "Motores puros (solo mueven algo): oculomotor, troclear, abducens, accesorio, hipogloso",
    "Mixtos (las dos cosas): trigémino, facial, glosofaríngeo, vago",
    "3 categorías de 3-5 en vez de una lista de 12 — el número de cada uno ya sigue el orden en que salen del tronco encefálico, no hace falta memorizarlo aparte"
  ]}',
  3),
('anatomia-simple-a-compuesto', 'De lo simple a lo compuesto: primero el cuerpo, después la cara',
  'Los músculos "grandes" (bíceps, cuádriceps, pectoral, trapecio...) son los que ya usás en el día a día para hablar de ejercicio — arrancá por esos. Los de la cara son un grupo aparte, más chico y más fino, dejalos para cuando el primer grupo ya esté firme.',
  'anatomia',
  '{"pasos": [
    "Grupo 1 (grande, cotidiano): bíceps, tríceps, cuádriceps, pectoral, trapecio, glúteos...",
    "Dominá ese grupo primero — son los que más se repiten en cualquier contexto",
    "Grupo 2 (cara, más fino): frontal, temporal, masetero, buccinador...",
    "Mismo truco que con países en Geografía: lo grande y conocido primero, lo específico después"
  ]}',
  4),
('anatomia-organos-por-cavidad', 'Los órganos, por cavidad',
  'Los 10 órganos principales viven en 4 "cajones" del cuerpo: torácico (corazón, pulmones), abdominal (hígado, estómago, riñones, intestino, páncreas, bazo), pélvico (vejiga) y craneal (cerebro). Ubicalos por cajón, no como una lista suelta.',
  'anatomia',
  '{"pasos": [
    "Torácico (pecho): corazón, pulmones",
    "Abdominal (panza): hígado, estómago, riñones, intestino, páncreas, bazo",
    "Pélvico (más abajo): vejiga",
    "Craneal (cabeza): cerebro — el único que vive fuera del tronco"
  ]}',
  5);
