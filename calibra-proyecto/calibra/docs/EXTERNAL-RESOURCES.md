# EXTERNAL-RESOURCES — Recursos externos y dependencias

> Registro de servicios/librerías externas que usa el proyecto y de por qué están. Para agregar una nueva librería: anotar acá + justificar (AGENTS.md). No instalar libs sin esto.

## Servicios externos

| Recurso | Uso | Dónde configurado | Estado |
|---|---|---|---|
| Supabase (proyecto real) | Postgres + Auth + RLS + Edge Functions | `.env.local` (`SUPABASE_URL`, keys), `supabase/config.toml` (functions) | VERIFICADO POR CÓDIGO (config); dashboard sin acceso en esta sesión |
| Vercel | Hosting recomendado | README (sin config concreta verificada) | PENDIENTE |

## Librerías de runtime (verificadas en `package.json`)

| Librería | Uso | Nota |
|---|---|---|
| @supabase/ssr + @supabase/supabase-js | Clientes Supabase server/client | — |
| next-intl | i18n (segmento `[locale]`) | `next.config.ts` plugin; `src/i18n/request.ts` |
| gsap | Animaciones | usa .0.x? — ver `src/components` (reactbits/duelos) |
| framer-motion | Animaciones React | en componentes de UI/landing |
| three + ogl | 3D (OpenGL/WebGL) | — |
| react-simple-maps + world-atlas | Mapas de geografía | — |
| @capacitor/android + @capacitor/push-notifications | Android + push | `0114` |
| typescript, tailwindcss v4, eslint | Tooling | — |
| vitest + playwright | Tests (dev) | `npm test` (vitest); e2e sin browser confirmado |

## Edge Functions (Supabase)

| Function | Push/topic | Estado |
|---|---|---|
| notify-duelo | Notificar reto de duelo | VERIFICADO POR CÓDIGO (definición) |
| notify-clan-mensaje | Notificar chat de clan | VERIFICADO POR CÓDIGO |
| racha-en-riesgo | Avisar racha en riesgo | VERIFICADO POR CÓDIGO |
| _shared | Utilidades compartidas | VERIFICADO POR CÓDIGO |

## Convenciones de URL/redirect (email)

- `docs/EMAIL-PENDIENTE.md`: SMTP + magic-link genérico pendiente. Plantillas HTML en `docs/`.
- Redirects de auth a validar contra allowlist (auth-security).

## Notas de instalación

- No instalar deps sin: (1) justificación en `docs/DECISIONS.md` o TECH-DEBT, (2) entrada en esta tabla, (3) revisión de `package.json` actual (evitar duplicados).