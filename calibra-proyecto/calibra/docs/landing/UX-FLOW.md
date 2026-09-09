# docs/landing — Flujo de la landing / onboarding

> Documento vivo del flujo público→jugador y del onboarding de 2 mundos.

## Flujo actual (VERIFICADO POR CÓDIGO, 2026-09-07)

1. Visitante → `/` → `page.tsx` de `[locale]` (home).
2. Home detecta perfil: si no hay sesión/perfil con email → componente de landing pública (`VisitanteLanding`) o redirección según estado.
3. Landing → `onboarding` → `OnboardingForm` (si ya hay cuenta) o `FlujoElegirMundos` (invitado).
4. Ambos pasos llaman UNA vez a RPC `elegir_mundos_iniciales(text[])` con los 2 slugs → `router.push("/")` + `router.refresh()`.
5. Home ahora muestra los 8 mundos con `bloqueado` según `profiles.mundos_desbloqueados`.

> ⚠️ Para confirmar qué pasa exactamente en `/` sin sesión y los redirects, falta leer `page.tsx` completo (Fase D). Estado actual: HIPÓTESIS conservadora.

## Reglas del onboarding

- 2 mundos gratis, 8 total (`MUNDOS_PAGOS`).
- Si el usuario ya tiene nombre + mundo → se saltea (redirect).
- Si es invitado: nombre autogenerado, nunca se le pregunta.
- "Crear cuenta real" es opcional y no bloquea seguir como invitado.

## UX tokens a mantener

- Estados: antes (sin selección), a 1 mundo ("Elegí 1 más"), a 2 (habilitado "Empezar a jugar").
- Deshabilitar botones >2 selección. Sin doble envío (`enviando`).