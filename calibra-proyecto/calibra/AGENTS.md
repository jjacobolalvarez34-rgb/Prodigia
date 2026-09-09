<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Prodigia — Reglas para agentes

Proyecto: **Prodigia**, app de práctica de cálculo mental con dificultad adaptativa, multijugador (duelos, clanes, rankeds, retos) y gamificación (Chispas, logros, títulos). Español rioplatense ("vos"). Next.js (App Router) + Supabase (+ RLS) + Capacitor (Android).

La documentación viva vive en `docs/`. Leéla en este orden antes de tocar código:

1. `docs/ESPECIFICACION.md` — visión y reglas generales del juego
2. `docs/PROYECTO-GENERAL.md` (si existe) y `docs/PROGRESO.md` — historial de sesiones
3. `docs/ARCHITECTURE.md` — cómo está construida la app
4. `docs/DIAGNOSTICO.md` — bugs conocidos y su caja (es quizá desactualizado: verificar en código)
5. `docs/AGENT-INDEX.md` y `docs/AGENT-RULES.md` — agentes y cómo trabajan

## Stack técnico (verificado en código, no en docs viejas)

- **Next.js** (App Router, segmento `[locale]` con next-intl). El bloque de arriba es correcto: leé `node_modules/next/dist/docs/` antes de escribir código de Next.
- **Supabase** — Postgres + Auth con RLS. Clientes: `src/lib/supabase/client.ts` y `server.ts`.
- **Tailwind** (v4). Build verificado en sesión anterior: 70 rutas.
- Tests: **vitest** (unit, `npm test`) + **playwright** (e2e, solo si podés levantarlo).
- Verificación: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`.

## Reglas duras

- **No asumas ni inventes**: si no lo verificaste, decilo con el estado `NO PUDE VERIFICAR` / `PENDIENTE`. Nunca escribas "andá a la doc" sin citar la ruta.
- **El código manda sobre docs**: `docs/` está parcialmente desactualizado (ej. `ESPECIFICACION.md` dice 5 mundos, el código maneja 8). Toda afirmación de un `.md` debe validarse contra el código real antes de usarla.
- **No rompas nada**: cambios acotados, verificables. Antes de refactorizar, entendé el problema. La prioridad es 0 daño.
- **Migraciones**: nunca destructivas sin revisar. Las migraciones nuevas se crean como `supabase/migrations/NNNN_descripcion.sql` (next number tras 0114). El código de la app no puede depender de migraciones no aplicadas a producción.
- **Seguridad**: el servidor/RLS es la fuente de verdad. El cliente jamás decide precios, desbloqueos ni xp. No guardes secretos en el repo.
- **Antes de instalar una librería** (npm): justificá por qué no alcanza lo existente y anotá en `docs/EXTERNAL-RESOURCES.md`.
- **No agregues comentarios al código salvo que el código existente ya use esa convención**; el repo ya tiene comentarios explicativos en español — respetá el estilo del archivo que toques.

## Claims (para no pisarse cuando hay varios agentes)

Antes de empezar una tarea manual: creá un claim en `docs/agent-work/ACTIVE.md` (formato: `### CLAIM: tarea · agente · fecha`), marcándolo completo o cancelado al terminar. No edites un área con claim activo de otro agente.

## Verificación (obligatoria al terminar cualquier cambio)

- `npx tsc --noEmit` sin errores
- `npm run lint` sin errores nuevos
- `npm test` pasando (o justificando por qué no corre)
- `npm run build` limpio (cuando toques rutas/server)
Registrar el resultado en `docs/PROGRESO.md` o en `docs/agent-work/ACTIVE.md` con el estado usado (CONFIRMADO / VERIFICADO POR CÓDIGO / VERIFICADO EN BROWSER / VERIFICADO CON TEST / NO VERIFICADO / BLOQUEADO / HIPÓTESIS / PENDIENTE).