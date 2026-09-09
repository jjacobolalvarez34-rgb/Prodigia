# AUDIT-MAPA-2026-09-07 — Auditoría del mapa (rutas / RPC / migraciones)

> Autor: repo-architect (orquestada 2026-09-07). Método: verificación contra CÓDIGO real (next-intl, `src/proxy.ts`, `src/app/**`, `supabase/migrations/0001..0115`). Estados según `docs/AGENT-RULES.md` §1.
> Contexto: inventario completo de la superficie; sin navegador ni base real → flujo en vivo NO VERIFICADO (ver estados).

## Total de la superficie (VERIFICADO POR CÓDIGO)

| Área | Cantidad | Fuente |
|---|---|---|
| Migraciones SQL | **115** (0001..0115) | `supabase/migrations/` (glob) |
| Páginas (App Router) | **111** `page.tsx` bajo `src/app/[locale]/` | glob + lectura |
| API routes | **31** en `src/app/api/**/route.ts` | glob + lectura |
| Route handler fuera de /api | **1** (`/auth/callback` GET) | `src/app/auth/callback/route.ts` |
| Funciones Postgres únicas | **122** (250 definiciones contando `create or replace`) | inventario por migración |
| Middleware/proxy | **1** (`src/proxy.ts`; el proyecto usa `proxy`, no `middleware.ts`, en Next 16) | lectura |

## Rutas dinámicas (sin catch-all)

- `[slug]`: `/aprender/[slug]` + una por mundo (`/trigonometria/aprender/[slug]`, `/quimia/...`, `/melodia/...`, `/historia/...`, `/geografia/...`, `/enigmia/...`, `/anatomia/...`).
- `[userId]`: `/perfil/[userId]`. `[inviteId]`: `/duelo/invitacion/[inviteId]`. `[serieId]`: `/rankeds/serie/[serieId]`.
- `[groupId]` y `[groupId]/[studentId]`: `/profesor/*`.

## Páginas (agrupadas por sección)

- **Raíz/auth**: `/`, `/login`, `/registro`, `/recuperar`, `/auth/actualizar-password`, `/onboarding`, `/onboarding/diagnostico`.
- **Bloqueos**: `/invitado-bloqueado`, `/mundo-bloqueado`, `/rankeds-bloqueado`.
- **Perfil/ajustes**: `/ajustes`, `/perfil`, `/perfil/[userId]`, `/pro`, `/terminos`, `/privacidad`.
- **Social**: `/amigos`, `/social`, `/feed`, `/clanes`, `/clanes/mundo`, `/leaderboard`.
- **Duelos/rankeds/retos**: `/duelo/invitacion/[inviteId]`, `/rankeds`, `/rankeds/serie/[serieId]`, `/reto-diario`, `/reto-semanal`.
- **Tienda**: `/tienda`.
- **Profesor/admin**: `/profesor`, `/profesor/[groupId]`, `/profesor/[groupId]/[studentId]`, `/admin/anuncios`.
- **Aprender/práctica base**: `/aprender`, `/aprender/[slug]`, `/practica`, `/practica/temas`, `/practica/{algebra,decimales,fracciones,geometria,potencias}`.
- **Mundos (8)**: `/numeria`, `/trigonometria`, `/quimia`, `/melodia`, `/historia`, `/geografia`, `/enigmia`, `/anatomia`, cada uno con `/aprender[/slug]`, `/practica`, subtemas (`/practica/<subtema>`); `/elegir` y `/diagnostico` según mundo.
- **Demo**: `/demo/{numeria,trigonometria,quimia,melodia,historia,geografia,enigmia,anatomia}`.

## API routes (método + operación de datos)

| Ruta | Método | Operación |
|---|---|---|
| `/api/attempts` | POST | insert `attempts` (anti-cheat server-side; RLS de cliente igualmente abierta — ver AUDIT-RLS S3) |
| `/api/logic-attempts` | POST | insert `logic_attempts` (idem, S8) |
| `/api/amigos/{solicitar,retar,responder}` | POST | insert/select/update `friendships` / `duels` |
| `/api/aprender/completar` | POST | upsert `technique_progress` + `technique_modifiers` + `unlocked_modifiers` |
| `/api/duelos/{resultado,rendirse,reclamar-abandono,finalizar-serie}` | POST | RPC `registrar_resultado_duelo`, `rendirse_duelo`, `reclamar_victoria_por_abandono`, `finalizar_serie_si_corresponde` |
| `/api/enigmia/{finish,completar-leccion}` | POST | select/insert `logic_attempts`; RPC `registrar_xp_diario`, `registrar_puntos_mundo`, `resolver_apuesta_si_activa`, `consumir_boost_pendiente`; upsert `logic_technique_progress` |
| `/api/feed/{crear-desafio,crear-problema-personalizado,responder-personalizado,retar,reaccionar}` | POST | insert `feed_posts`/`duels`/`feed_reactions`; RPC `crear_problema_personalizado`, `responder_problema_personalizado` |
| `/api/leaderboard/posicion` | GET | RPC `ranking_semanal` |
| `/api/mundos/desbloquear` | POST | RPC `desbloquear_mundo` (3000 Chispas, server-side) |
| `/api/perfil/{eliminar-cuenta,idioma}` | POST | delete cuenta (sus), RPC `elegir_idioma` |
| `/api/practica/finish` | POST | select `attempts`/`daily_progress`; RPC `registrar_xp_diario`, `registrar_puntos_mundo`, `resolver_apuesta_si_activa`, `consumir_boost_pendiente`; insert `feed_posts` |
| `/api/profesor/{unirse,crear-grupo,borrar-grupo}` | POST | RPC `unirse_a_grupo`; insert/delete `groups` |
| `/api/reto-{diario,semanal}/completar` | POST | RPC `completar_reto_*` + `ranking_reto_*` |
| `/api/tienda/{comprar,apostar,elegir-marco,elegir-fuente}` | POST | RPC `comprar_item_tienda`, `apostar_doble_o_nada`, `elegir_marco_perfil`, `elegir_fuente_nombre` |
| `/auth/callback` | GET | manejo de OAuth + `conectar_por_invitacion` |

## Proxy (`src/proxy.ts`)

1. i18n (`createIntlMiddleware`, `localePrefix: "always"`) + header `X-NEXT-INTL-LOCALE`.
2. Refresh de sesión (createServerClient + `getUser()`).
3. **Redirect por idioma del perfil** (`profiles.idioma`, cookie `NEXT_LOCALE`).
4. **Guard de invitado**: `rutaBloqueadaParaInvitado()` (de `src/lib/auth/rutasInvitado`) → `/{locale}/invitado-bloqueado?seccion=...`.
5. Excluye del proxy: `_next/static|image`, `favicon.ico`, `/api/*`, `/auth/callback`, `/data/*`, `manifest.webmanifest`, `sw.js`, `robots.txt`, `sitemap.xml`, imágenes (svg/png/jpg/jpeg/gif/webp).

## RPC: inventario y postura

- 122 funciones únicas; cadenas largas de `create or replace` (las más grandes: `registrar_resultado_duelo` 9 versiones, `comprar_item_tienda` 10, `obtener_duelo` 10, `buscar_rival_duelo` 13, `registrar_puntos_mundo` 7).
- Mutadoras: casi todas security definer + `set search_path = public`. Helpers internos: security invoker (uso interno; correctos).
- Solo 3 revokes explícitos: `desbloquear_titulo` (0102/0103, reemplazada por `desbloquear_titulo_propio`), `otorgar_marco_mundo` (0104, reemplazada por `..._propio`).
- **Tandas de auditoría previas confirmadas**: 0031 (RLS partida), 0035 (permisos/auditoria lanzamiento), 0060 (RLS 2), 0102/0103 (huecos seguridad fase 4), 0115 (fase 5: S6/S7/S10).
- Overloads que conviven: `buscar_rival_duelo(text)` (0031/0038 legacy), `(text,text)` (0043-0048), `(text,text,boolean)` vigente (app usa la de 3 args en `RankedsClient.tsx:479`); `crear_invitacion_duelo(text)` legacy vs `(text,text,text)` vigente.

## Cruzamiento de consistencia (M4)

| Check | Resultado |
|---|---|
| RPC llamados desde la app existen en migraciones | OK — sin huérfanos hacia atrás |
| RPC revocados se usan desde la app | OK — `desbloquear_titulo`/`otorgar_marco_mundo` NO se llaman; se usa `*_propio` (`src/lib/titulos/verificar.ts:225,230`) |
| Funciones Postgres sin uso en la app | **F-M1 (LEGACY)**: `elegir_mundo_inicial(text)` (0111:12-43) nunca llamada desde `src/`; onboarding usa `elegir_mundos_iniciales(text[])` (0112). Guard interna (cardinality=0) hace una sola llamada; no explota pero es superficie muerta aún grantada |
| Ruta sin handler de sesión | OK — todas las /api validan `getUser()`; proxy exime a /api por diseño |
| Docs citando cantidades | **F-M2 (DOCS)**: `AGENTS.md` dice "70 rutas"; real = 111 páginas + 32 route handlers. `docs/ARCHITECTURE.md`/PROJECT-STATE a revisar por separado |
| Cobertura de guard de invitado | Pendiente de revisar lista completa de `rutasInvitado` vs 111 páginas (item de seguimiento) |

## Hallazgos

- **F-M1 (LEGACY / BAJO)**: `elegir_mundo_inicial` huérfana, aún con grant authenticated y DDL en 0097/0106/0110/0111. No es explotable por el guard, pero convendría marcarla obsoleta o revocarle el grant en una tanda futura (coexistencia con `elegir_mundos_iniciales` confunde el mapa). Estado: CONFIRMADO POR CÓDIGO / NO VERIFICADO en vivo.
- **F-M2 (DOCS / BAJO)**: el recuento de rutas citado en AGENTS.md (70) es de una sesión anterior; el real es 111/32. Documentar en la actualización de docs (Fase G).
- **F-M3 (ARQUITECTURA / MEDIO, observación)**: el alta de `attempts`/`logic_attempts` se hace por API route (anti-cheat espacial) pero la policy de cliente de la tabla sigue abierta; el control en la ruta no es la frontera (ver AUDIT-RLS S3/S8). No es un bug nuevo, es un dato del mapa: la frontera lógica de confianza para "intentos" está repartida entre 2 tablas, 2 rutas y ninguna restricción de tabla.
- **F-M4 (OBSERVACIÓN)**: `procesar_cierre_semana_clanes()` se invoca desde `src/app/[locale]/clanes/page.tsx:20` en cada visita de cualquier miembro; el cierre por clan queda así dependiente del tráfico de usuarios (semáforo en `clan_semanas_procesadas`). Riesgo consolidado: **BAJO** (esa semana no se cierra si nadie entra; nunca se gana en falso). Documentar como decisión de diseño o pasar a scheduled job en una tanda futura.

## Totales para docs (Fase G)

- 111 páginas, 32 route handlers, 1 proxy, 122 funciones únicas / 250 definiciones, 115 migraciones.

## Estado

- Inventario y cruce: **VERIFICADO POR CÓDIGO**.
- Flujo en vivo (proxy × rutas, guard de invitado completo, onboarding de 2 mundos): **NO VERIFICADO** (sin browser/DB).
- Seguimiento: F-M1 (revoke/marcado legacy), F-M2 (docs), F-M4 (scheduled job opcional).