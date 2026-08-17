-- ============================================================
-- Prodigia — diagnóstico inicial (nivel de arranque por operación)
-- Correr después de 0007_contenido_tecnicas.sql
-- ============================================================

alter table public.profiles
  add column onboarding_completado boolean not null default false;
