-- ============================================================
-- Prodigia — Sección 5: 2 modos nuevos de Quimia (Nomenclatura,
-- Química orgánica), más el escalón nuevo de Tabla periódica
-- (número atómico / estado de oxidación) — ese último no necesita SQL,
-- ya usa 'quimia_tabla' que ya estaba permitido.
-- Correr después de 0066_clan_de_bots.sql
--
-- Mismo criterio que 0019/0022/0026/0032/0056: ampliar los 2 checks
-- existentes en vez de tocar nada más. 'quimia_nomenclatura' y
-- 'quimia_organica' son los nuevos problem_type que ya usa el código
-- (ver src/lib/practica/quimia.ts, quimicaOrganica.ts) para
-- attempts/skill_levels.
-- ============================================================

alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica'
  ));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica'
  ));
