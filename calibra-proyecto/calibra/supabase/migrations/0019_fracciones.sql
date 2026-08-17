-- ============================================================
-- Prodigia — Fracciones como tema activo de Numeria (Fase OO)
-- Correr después de 0018_lecciones_numeria.sql
-- Reutiliza skill_levels/attempts/techniques (mismo shape que las 4
-- operaciones) en vez de crear tablas nuevas — solo hace falta ampliar
-- los check constraints para aceptar 'fracciones'.
-- ============================================================

alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones'));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones'));

alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones'));

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
(
  'sumar-fracciones-igual-denominador',
  'Sumar con el mismo denominador',
  'Cuando dos fracciones tienen el mismo denominador, sumás los numeradores y dejás el denominador igual.',
  'fracciones',
  '{"pasos": [
    "Fijate que las dos fracciones tengan el mismo denominador",
    "Sumá los numeradores: 1/5 + 2/5 → 1+2=3",
    "Dejá el denominador igual: 3/5"
  ]}',
  1
),
(
  'simplificar-con-mcd',
  'Simplificar dividiendo por el máximo común divisor',
  'Encontrá el número más grande que divide exacto al numerador y al denominador, y dividí ambos por él.',
  'fracciones',
  '{"pasos": [
    "Buscá el máximo común divisor (MCD) entre numerador y denominador: MCD(8,12)=4",
    "Dividí el numerador por el MCD: 8÷4=2",
    "Dividí el denominador por el MCD: 12÷4=3 → 8/12 simplificada es 2/3"
  ]}',
  2
),
(
  'minimo-comun-denominador',
  'Mínimo común denominador',
  'Para sumar fracciones con denominadores distintos, primero las convertís a un denominador común.',
  'fracciones',
  '{"pasos": [
    "Buscá el mínimo común múltiplo de los denominadores: mcm(4,6)=12",
    "Convertí cada fracción a ese denominador: 1/4=3/12, 1/6=2/12",
    "Ahora sumalas normal: 3/12+2/12=5/12"
  ]}',
  3
),
(
  'comparar-con-producto-cruzado',
  'Comparar fracciones con producto cruzado',
  'Para saber cuál fracción es más grande sin buscar denominador común, multiplicás en cruz.',
  'fracciones',
  '{"pasos": [
    "Multiplicá el numerador de la primera por el denominador de la segunda: 3×5=15",
    "Multiplicá el numerador de la segunda por el denominador de la primera: 4×4=16",
    "Comparás esos resultados: como 15<16, entonces 3/4 < 4/5"
  ]}',
  4
);
