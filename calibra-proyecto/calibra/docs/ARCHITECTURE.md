# ARCHITECTURE — Mapa de la aplicación

> Estado: VERIFICADO POR CÓDIGO (2026-09-07). Si el código cambia, actualizar acá por `repo-architect`.

## Flujo en una línea

`usuario → route [locale] → (server) profile/sesión → página → (cliente) Supabase RPC/select → RLS en Postgres → datos → UI + animaciones (GSAP/Framer) → persistencia (chispas, intentos, duelos, retos, tienda)`.

## Árbol de carpetas (real)

### `src/app/[locale]/` — páginas por idioma (next-intl)
Rutas públicas: `login`, `registro`, `recuperar`, `privacidad`, `terminos`, `greeting`.
Rutas de gameplay: `practica`, `numeria` (worlds vía `page.tsx` home), `find...` → cada mundo `[mundo]` en home; `geografia`, `enigmia`, `quimia`, `anatomia`, `melodia`, `trigonometria`, `historia`.
Social/competitivo: `amigos`, `duelo`, `rankeds`, `clanes`, `feed`, `leaderboard`, `social`.
Avance/prof: `perfil`, `logros` (en perfil), `reto-diario`, `reto-semanal`, `tienda`, `pro`, `administrativo`: `admin`, `profesor`.
Flujo: `onboarding`, `invitado-bloqueado`, `mundo-bloqueado`, `demo`, `ajustes`, `loading.tsx`, `error.tsx`, `template.tsx`.

### `src/app/api/` — rutas server (intermediario cliente→Supabase, validan sesión)
`attempts/`, `retos/**` (`reto-diario/completar`, `reto-semanal/completar`), `amigos/retar` (duelo realtime), etc. Patrón común: `createClient()` (server) → `getUser()` → RPC → `respuestaError()` si falla.

### `src/components/` — UI compartida
`reto/` (RetoClient), `duelos/`, `landing/` (VisitanteLanding, FlujoElegirMundos, FlujoTour, HeaderFlujo, FlujoPromoPro, FlujoResultado), `reactbits/` (biblioteca de componentes), `icons/` (íconos por mundo), `Boton`, `ConvertirCuenta`, etc. (59 entradas).

### `src/lib/` — lógica
- `supabase/` — client.ts (cliente), server.ts (server, cookies).
- `practica/` — generación/fuentes: `racha.ts` (racha diaria/semanal, `lunesDeEstaSemanaIso`).
- `retoDiario.ts` + `retoDiario.test.ts` — generador de retos (5 diario / 45 semanal).
- `mundos/` — `precios.ts` (slugs/nombres/colores `MundoPago`), configuración por mundo.
- `logros/` — `verificar.ts` (criterios elegibles vs cumplidos, ej. `reto_diario_total`).
- `titulos/` — `catalogo.ts`, `verificar.ts` (criterios tipo `racha_retos_diarios`).
- `persistencia` por dominio: `anatomia/ auth/ clanes/ duelos/ enigmia/ geografia/ historia/ melodia/ perfil/ presencia/ pro/ quimia/ tienda/ trigonometria/ aprender/ api/`.
- `proxy.ts` (utilidades) y `types/` (`.ts` de tipos Supabase → `database.ts`).

### `supabase/`
- `migrations/` — 0001→0114 SQL versionado (esquema + RLS + triggers + funciones). *Unico lugar donde existe el esquema.*
- `functions/` — Edge Functions: `notify-duelo`, `notify-clan-mensaje`, `racha-en-riesgo`, `_shared/`.
- `.temp/` (generado).

### `scripts/`
- `crear-usuario-qa.mjs`, `login-qa.mjs` (cuentas QA con `.env.test.local`), `compensacion-jacobo-fase1.mjs`.

## Puntos únicos de verdad (fuentes de negocio)

| Dato | Fuente | Dónde |
|---|---|---|
| Slugs/nombres/colores de mundos | `src/lib/mundos/precios.ts` | cliente |
| Precio real de mundo | SQL de `desbloquear_mundo()` (`0097`) | servidor |
| Desbloqueo inicial de 2 mundos | RPC `elegir_mundos_iniciales` (`0112`) | servidor |
| Retos diario/semanal + ranking + logros | `0113` | servidor |
| Racha diaria/semanal | `src/lib/practica/racha.ts` (criterio UTC igual a Postgres) | cliente |
| ELO/rankeds | migraciones 0016, 0031, 0050, 0058, 0072-0074 | servidor |
| Qué mundo está desbloqueado | `profiles.mundos_desbloqueados` | servidor |

## Decisiones de diseño clave

- **UTC es el criterio de fecha** en retos y rachas (coincide con `current_date`/`date_trunc('week',...)` de Postgres). Cuidado con `new Date().toISOString().slice(0,10)` (usa UTC): para usuarios en Argentina puede haber desfase de "día".
- **`security definer` con `search_path=public`** en funciones de negocio (ej. ranking) que requieren cruzar tablas protegidas por RLS.
- **Server-first:** el flujo data-básico se resuelve en el server component; la UI muta vía API routes/RPC con sesión verificada.
- **Dos flujos de onboarding:** `[locale]/onboarding` (cuenta ya creada) y `landing/FlujoElegirMundos` (invitado antes de cuenta). Ambos llaman `elegir_mundos_iniciales` UNA vez con los 2 slugs.

## Gráfico de dependencias típico

```
page ([locale]) ──> requireUsuario() ──> createClient(server) ──> Supabase (RLS)
     │
     ├─ data inicial (server): profile, progreso, config del mundo
     └─ <ClientComponent> ──> fetch /api/... ──> RPC ──> verificarLogros/verificarTitulos
```
Para retos: `zona` live a `reto-diario/page` → `RetoClient` → POST `/api/reto-diario/completar` → RPC `completar_reto_diario` + `ranking_reto_diario` + logros + títulos.

## Pendientes de arquitectura (detalle en TECH-DEBT.md)

- README.md desactualizado (Next 15, "pantalla de práctica a construir", rutas que ya no existen).
- docs de ESPECIFICACIÓN y MECÁNICA desactualizadas respecto del código (8 mundos, retos, etc.).