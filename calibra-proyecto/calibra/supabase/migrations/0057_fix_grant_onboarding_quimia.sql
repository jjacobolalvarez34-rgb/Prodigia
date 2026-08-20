-- ============================================================
-- Prodigia — fix urgente: Quimia queda inaccesible (loop de diagnóstico)
-- Correr en cuanto sea posible, sin importar si 0056 ya corrió o no
-- (este archivo es idempotente y seguro de correr solo o junto con 0056).
--
-- Causa raíz confirmada con pruebas reales (Playwright, sesión de
-- invitado): DiagnosticoQuimiaClient.guardar() hace
-- supabase.from("profiles").update({ onboarding_quimia_completado: true })
-- — un update directo, mismo patrón que Enigmia. Pero 0035/0054
-- restringieron el UPDATE de "profiles" a un GRANT de columna
-- explícito, y onboarding_quimia_completado (agregada recién en 0056)
-- nunca se sumó a esa lista. Resultado: el update siempre devuelve
-- 42501 "permission denied for table profiles" (confirmado en la
-- consola de red, no es un fallo de RLS). Como el flag nunca se
-- persiste, requireMundoQuimia() en src/lib/auth/guard.ts redirige de
-- nuevo a /quimia/diagnostico cada vez que se visita /quimia — un loop
-- infinito. No es que el botón "Empezar" no responda: cada pantalla
-- funciona bien, pero nunca se sale del diagnóstico. Confirmado en
-- vivo: click "Continuar" tras las 8 preguntas devuelve a
-- /quimia/diagnostico, y entrar a /quimia directo hace lo mismo.
--
-- La lista de columnas de acá abajo tiene que ser la vigente de 0054
-- (sin display_name, con avatar_url/ocultar_doble_o_nada) más
-- onboarding_quimia_completado — no la de 0035, que 0054 ya había
-- reemplazado. (0056_mundo_quimia.sql ya incluye este mismo fix desde
-- esta misma tanda; este archivo queda igual, idéntico y redundante a
-- propósito, para que sirva solo aunque a alguien se le escape correr
-- 0056 completo.)
-- ============================================================

revoke update on public.profiles from authenticated;
grant update (
  meta_xp_diaria,
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  onboarding_quimia_completado,
  interes_inicial,
  avatar_url,
  ocultar_doble_o_nada
) on public.profiles to authenticated;
