-- ============================================================
-- Prodigia — mundo Geografía, alcance América (Fase LL)
-- Correr después de 0021_amigos.sql
-- Reutiliza skill_levels/attempts (mismo patrón que Fracciones) — el
-- "problem_type" para este mundo es 'geografia', nivel único 1-10.
-- ============================================================

alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia'));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia'));
