# PROJECT-STATE — Estado del proyecto

> Fuente de verdad del estado ACTUAL (verificado). Última actualización: 2026-09-27.
> Reescrito completo (DOC-01 de `docs/audits/REVISION-GENERAL-2026-09-26.md`): la versión anterior
> quedó congelada en 2026-09-08, con 8 mundos y 120 migraciones — historial completo en `docs/PROGRESO.md`
> (no se borra). Método: cada afirmación trae estado válido (§1 de `docs/AGENT-RULES.md`).

## Identidad

| | |
|---|---|
| Nombre | Prodigia (package `prodigia`, v0.1.0) |
| Qué es | Práctica adaptativa en **13 mundos** (Numeria, Calculia, Estadística, Circuitia, Enigmia, Codia, Naipia, Geografía, Historia, Melodía, Anatomía, Química, Trigonometría): duelos, clanes, rankeds, retos, Trastienda (minijuegos/apuestas), tienda de cosméticos, Pro |
| Idioma | **Español neutro, "tú" — nunca voseo** (ver `docs/marketing/TERMINOLOGY.md`); i18n es/en con next-intl (`[locale]`). Las lecciones de Aprender de los 13 mundos tienen versión en inglés (migraciones 0225–0238, 0242). |
| Raíz | `D:\Repositorios\Prodigia\calibra-proyecto\calibra` (raíz del repo git: `D:\Repositorios\Prodigia`) |

## Stack (VERIFICADO POR CÓDIGO)

- Next.js (App Router) + React + TypeScript estricto + Tailwind v4. Rutas con segmento `[locale]`.
- Supabase (Postgres + Auth + RLS). Clientes: `src/lib/supabase/client.ts`, `server.ts`. Edge Functions: `supabase/functions/` (notify-duelo, notify-clan-mensaje, racha-en-riesgo).
- Android: contenedor Capacitor que carga la web en vivo (WebView) — **propuesta de reemplazo por app nativa Expo/React Native sin aprobar**, ver `docs/app-nativa/`.
- ~350 módulos de lógica pura en `src/lib` con más de 90 archivos de test.
- Verificación estándar: `npx tsc --noEmit`, `npm run lint`, `npm test` (vitest), `npm run build`.
- **Git sí está disponible** en este entorno; el asistente hace los commits (el usuario no pide push salvo que lo indique explícitamente).

## Migraciones

242 archivos (`0001_init.sql` a `0242_enigmia_tecnicas_historicas_en.sql`) a 2026-09-27. **No hay registro confiable de qué migraciones están aplicadas en producción** (SEG-09 de la revisión general): se pegan a mano en el SQL Editor de Supabase; el usuario confirmó tener aplicado hasta la 0221 el 2026-09-25, el resto de lo escrito después (0222→0242) sigue sin correr al momento de este registro. Antes de dar cualquier cosa por "andando en producción", preguntar o verificar.

Bloques recientes grandes:
- **0225–0238, 0242**: Aprender en inglés de los 13 mundos (`nombre_en`/`descripcion_en`/`contenido_en`), generadas desde `src/lib/i18n-lecciones/`.
- **0222–0224**: ranking del perfil por experiencia histórica (no Chispas), recálculo de dominio, mensajes con respuestas y notificados de no leídos.
- **0239–0241**: misión semanal de clan por Experiencia conjunta con botón de reclamar; **Trastienda con Monedas propias no comprables** (`monedas_trastienda`, separada de las Chispas) + `resolver_apuesta_si_activa` ya no confía en la precisión que manda el cliente (SEG-02) + gate de edad server-side en toda la Trastienda (SEG-03) — ver el propio encabezado de `0241_trastienda_monedas_y_seguridad.sql`.

## Seguridad — abierto y cerrado (ver `docs/audits/REVISION-GENERAL-2026-09-26.md` para el detalle completo)

- **CERRADO 2026-09-27**: SEG-02 (doble o nada farmeable con `p_precision` inventado) y SEG-03 (gate de edad de la Trastienda solo en la página, `null` pasaba como adulto) — migración `0241`.
- **CERRADO 2026-09-27**: PROD-01 parcial — la Trastienda ya no cobra ni paga en Chispas (comprables con dinero real), sino en Monedas propias ganadas solo practicando. Sigue pendiente la decisión de PO sobre si la app Android sale sin Trastienda y sobre el umbral de edad real.
- **CERRADO 2026-09-25/27**: key de fal.ai que estaba versionada en texto plano en `calibra-proyecto/opencode.json` — sacada del archivo actual (sustitución `{env:FAL_KEY}`); **sigue en el historial de git, rotarla en el panel de fal.ai es una acción pendiente del usuario**. `.gitignore` agregado en la raíz del repo (no existía); `node_modules`, `__pycache__`, logs de desarrollo y `.claude/settings.local.json` destraqueados.
- **ABIERTO**: SEG-04 (Edge Functions sin validar secreto), SEG-05 (`/api/leads-colegios` sin rate limit/captcha), SEG-06 (sin headers de seguridad en `next.config.ts`), SEG-07 (sin rate limit en rutas de economía/social), SEG-08 (higiene RLS de tablas de Trastienda), SEG-09 (sin CLI de Supabase / registro de migraciones aplicadas).
- **HALLAZGO NUEVO (2026-09-27, revisando la Trastienda para el fix de SEG-02)**: `resolver_apuesta_partida` y `resolver_prediccion_ranking` (las funciones que PAGAN las apuestas a partidas ajenas y a predicciones de ranking) **no las llama ningún código de la app** — ni ruta, ni cron, ni trigger. Un usuario puede apostar Monedas vía `apostar_partida`/`apostar_prediccion_ranking` (rutas `/api/trastienda/apuestas`, `/api/trastienda/predicciones`, componentes `ApostarPartida.tsx`/`PrediccionRanking.tsx`, sí están en la UI) y esa apuesta queda "pendiente" para siempre — nunca se resuelve ni se paga. PENDIENTE: o se agenda `resolver_apuesta_partida`/`resolver_prediccion_ranking` (falta un disparador: al completarse el duelo / al cerrar la semana del ranking), o se saca esa mecánica de la UI hasta tenerlo.

## Traducción de Aprender

Los 13 mundos tienen sus Técnicas y Clases en inglés (ver arriba). Salvedades: el texto lo tradujo un modelo, no lo revisó una persona; algunos textos que las animaciones sacan de tablas del código pueden seguir en español. Detalle por mundo en `docs/marketing/TECNICAS-Y-CLASES-POR-MUNDO.md` §5.

## Docs de referencia

- `docs/PROGRESO.md` — historial completo de sesiones anteriores (vivo, no borrar; es grande, 2026-09-27 son ~4000 líneas — leer con `grep`/rango de fechas, no entero).
- `docs/audits/REVISION-GENERAL-2026-09-26.md` — auditoría más reciente y completa (seguridad, producto/legal, UX, docs, repo), con orden sugerido de trabajo.
- `docs/app-nativa/` — propuesta (sin aprobar) de app Android nativa.
- `docs/ESPECIFICACION.md`, `docs/ARCHITECTURE.md`, `docs/TECH-DEBT.md`, `docs/PARIDAD_MUNDOS.md` — pueden tener cantidades de mundos/migraciones desactualizadas; verificar contra el código antes de citarlas (mismo criterio que arriba).
- `docs/EMAIL-PENDIENTE.md` — SMTP/magic-link genérico pendiente.

## Lectura recomendada de entrada

1. `AGENTS.md` → 2. `docs/AGENT-RULES.md` → 3. `docs/ARCHITECTURE.md` → 4. este archivo → 5. `docs/audits/REVISION-GENERAL-2026-09-26.md` → 6. `docs/PROGRESO.md` (últimas entradas).
