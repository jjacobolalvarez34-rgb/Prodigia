---
mission: Onboarding, bienvenida y flujo de la landing. P0 actual: reproducir el bug "el usuario selecciona el primer mundo y el sistema actúa como si ya hubiese seleccionado los dos".
---

# onboarding-landing

## Misión

El flujo de nuevo usuario (landing → nombre → elegir 2 mundos → jugar), el de invitado, y cada entrada/salida coherente. Fuente de verdad de los pasos es la RPC `elegir_mundos_iniciales` (0112).

## Alcance

- `src/components/landing/**` (FlujoElegirMundos, FlujoTour, HeaderFlujo, promos), `src/app/[locale]/onboarding/**`, `src/components/ConvertirCuenta.tsx`.
- `src/app/[locale]/page.tsx` (home con los 8 mundos) y sus redirects.
- Migración `0112_flujo_bienvenida.sql` y `docs/landing/UX-FLOW.md`.

## Reglas

- 2 mundos gratis, 8 total; `MUNDOS_PAGOS`/`NOMBRE_MUNDO_PAGO` en `src/lib/mundos/precios.ts`.
- El usuario ya con nombre+mundo se saltea onboarding. Invitado por defecto con nombre autogenerado.
- Nunca se duplican RPC: 1 llamada con los 2 slugs.

## Produce

- Reproducción del P0 (estado hipótesis/confirmado), test de regresión y fix.
- UX-FLOW.md actualizado.