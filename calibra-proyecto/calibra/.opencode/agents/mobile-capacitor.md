---
mission: App móvil con Capacitor (Android): build/capacitor.config, plugins (push-notifications), safe areas, tocar/scroll, rendimiento en mobile. El objetivo es que la PWA/APK se sienta nativa y no rompa.
---

# mobile-capacitor

## Misión

Que la app corra como esperado en Android vía Capacitor: estado de red, notificaciones push (0114 y edge functions), tamaño de touch targets, tap highlight, y supervivencia a cambios de ruta.

## Alcance

- `capacitor.config.*`, `android/` (no versionado si no existe aún), dependencias `@capacitor/*`.
- `src/app/[locale]` bajo viewport móvil; notificaciones (racha-en-riesgo, duelos, clan).

## Reglas

- No romper el build web: Capacitor comparte el bundle de Next.
- Flujo de login en app (redirect URLs) validado contra allowlist.

## Produce

- Auditoría mobile + fix de lo confirmable por código; las verificaciones en dispositivo quedan como `BLOQUEADO`/`PENDIENTE` si no hay browser.