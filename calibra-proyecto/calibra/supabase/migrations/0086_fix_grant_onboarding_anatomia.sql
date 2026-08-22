-- ============================================================
-- Prodigia — fix urgente: Anatomía queda inaccesible (loop de
-- diagnóstico). Mismo bug exacto que 0057 con Quimia: columna nueva
-- (onboarding_anatomia_completado, agregada en 0081) nunca se sumó al
-- grant column-level de "profiles" — el UPDATE directo que hace
-- DiagnosticoAnatomiaClient.guardar() devuelve 42501 "permission
-- denied for table profiles", el flag nunca se persiste, y
-- requireMundoAnatomia() en src/lib/auth/guard.ts redirige de nuevo a
-- /anatomia/diagnostico en cada visita — loop infinito, mundo entero
-- inaccesible.
--
-- La lista de columnas de acá abajo es la vigente de 0070 (la última
-- que tocó este grant — nótese que 0070 ya había sacado
-- meta_xp_diaria de la lista de 0057/0036, así que no se reintroduce
-- acá) más onboarding_anatomia_completado.
-- ============================================================

revoke update on public.profiles from authenticated;
grant update (
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  onboarding_quimia_completado,
  onboarding_anatomia_completado,
  interes_inicial,
  avatar_url,
  ocultar_doble_o_nada
) on public.profiles to authenticated;
