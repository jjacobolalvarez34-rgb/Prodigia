-- ============================================================
-- Prodigia — activar Álgebra básica en Numeria (Fase EE2)
-- Correr después de 0031_matchmaking_duelos.sql
-- Mismo criterio que 0019/0026 (fracciones, decimales/potencias):
-- reutiliza skill_levels/attempts/techniques ampliando los check
-- constraints, sin tablas nuevas.
-- ============================================================

alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra'));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra'));

alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'geografia', 'algebra'));

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
(
  'que-es-una-variable',
  'Qué es una variable',
  'x no es un misterio: es un número que todavía no conocés, con un valor fijo que podés encontrar.',
  'algebra',
  '{"pasos": [
    "Una variable (casi siempre la letra x) representa un número desconocido, pero que tiene un valor fijo y único.",
    "En x + 5 = 12, x no puede ser cualquier cosa: solo hay un número que hace que la cuenta cierre.",
    "Resolver la ecuación es, ni más ni menos, encontrar ese número."
  ]}',
  1
),
(
  'despejar-paso-a-paso',
  'Despejar paso a paso',
  'Para encontrar x, deshacé las operaciones en orden inverso — lo último que se le hizo a x es lo primero que se deshace.',
  'algebra',
  '{"pasos": [
    "Tomá 2x + 3 = 11. A x primero se la multiplicó por 2, después se le sumó 3.",
    "Deshacé en orden inverso: primero restá 3 en los dos lados → 2x = 8.",
    "Después dividí los dos lados por 2 → x = 4."
  ]}',
  2
),
(
  'verificar-sustituyendo',
  'Verificar tu respuesta sustituyendo',
  'Una vez que despejaste x, siempre podés comprobar si está bien reemplazándola de nuevo en la ecuación original.',
  'algebra',
  '{"pasos": [
    "Si despejaste x = 4 en 2x + 3 = 11, reemplazá x por 4 en la ecuación original: 2(4) + 3.",
    "Resolvé: 2×4 = 8, 8 + 3 = 11.",
    "Como da 11 (el mismo número del otro lado), x = 4 es correcto — si no coincide, hay que revisar el despeje."
  ]}',
  3
);
