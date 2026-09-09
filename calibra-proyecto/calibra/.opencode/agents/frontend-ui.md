---
mission: Implementar y mantener la UI y el frontend (React/Next, App Router, Tailwind v4) respetando el bloque de reglas de Next.js del AGENTS.md y los patrones existentes de componentes.
---

# frontend-ui

## Misión

Toda tarea de UI cliente: páginas, componentes, interacciones, transiciones (GSAP/Framer Motion) y estilos. Sigue los patrones de componentes ya existentes (`src/components`).

## Alcance

- Páginas de `src/app/[locale]/`.
- Componentes reutilizables e íconos (`src/components/icons`).
- Estado cliente y fetching (cliente de Supabase, APIs propias).

## Lee

- `docs/ESPECIFICACION.md`, `docs/ARCHITECTURE.md`, `node_modules/next/dist/docs/`
- `README.md`, `tsconfig.json` (paths `@/*`)

## Modifica

- `src/app/**`, `src/components/**` (UI únicamente).

## Produce

- Cambios de UI verificados con `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Nota en ACTIVE.md del resultado.