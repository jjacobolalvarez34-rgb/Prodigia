# DUELOS-AUDIT — Duelo casual + Feed social (Fase F8)

- Fecha: 2026-09-09
- Alcance: `calibra/` (Next.js App Router + Supabase). Modo autónomo: sin git/DB/browser. Verificación por código + tests.
- Estados usados: VERIFICADO EN CÓDIGO / IMPLEMENTADO / PROPUESTA / BLOQUEADO / PENDIENTE / NO PUEDO VERIFICAR.
- Última migración analizada: `0128_espanol_neutro.sql` (contexto previo); SQL de duelos vigente: `0109_mundo_historia.sql`.

---

## 1. Auditoría del flujo CASUAL y DUELOS

### 1.1 Cómo entra un usuario a un duelo casual

El punto de entrada único al matchmaking (Rankeds y Casual) es la pestaña "Buscar partida" de `RankedsClient.tsx`. Flujo verificado:

1. `RankedsClient.tsx:396-406` arma la lista de ciudades seleccionables (`MUNDOS_SELECCIONABLES`): los 8 mundos + `aleatorio` ("Todas las ciudades").
2. `RankedsClient.tsx:413` define el modo: `useState<"clasificatoria" | "casual">("clasificatoria")`. El toggle `elegirModoClasificacion` (`:427-431`) fuerza las restricciones cruzadas modo↔ciudad.
3. `RankedsClient.tsx:433-438` — `mundosDisponibles`:
   - Casual: excluye `aleatorio` (nunca mejor-de-3, ver §1.5).
   - Clasificatoria con ELO ≥ 1300 (Platino+): solo `aleatorio` ("todas las ciudades").
   - Clasificatoria con ELO < 1300: todos.
4. `iniciarBusqueda` (`:542-548`) lanza `poll(mundo, modoClasificacion === "clasificatoria", ...)` — el segundo parámetro es el flag `p_ranked` que viaja al RPC.
5. `poll` (`:477-540`) hace polling cada `POLL_MS = 2200` (`:382`) contra `buscar_rival_duelo`, con ventana progresiva de ELO (ver §1.3) y tope de `MAX_SEGUNDOS_BUSQUEDA = 60` (`:383`).

El RPC con el que se juega es `buscar_rival_duelo(p_mundo, p_operation_type, p_ranked)`, definición vigente en `0109_mundo_historia.sql` (esta recrea a la de `0050_duelos_casuales.sql`). Estados VERIFICADO EN CÓDIGO.

### 1.2 Qué pasa si no hay contrincante (bots casual)

- `0109:504-508` valida el mundo: casual **rechaza** `aleatorio` ('casual no admite todas las ciudades — siempre es duelo simple'), y solo se aceptan los 8 mundos + `aleatorio`.
- `0109:539-548`: busca rival humano en `duel_queue` con mismo mundo, mismo `clasificatorio` y `abs(elo - mi_elo) <= rango`, solo filas con `last_seen_at >= now() - interval '10 seconds'`.
- `0109:550-562`: **fallback de bot**. Si `v_rival.user_id is null AND v_mi_elo < 1300 AND v_segundos >= 30`, toma el miembro de `clan_miembros` (perfiles "Clan de Bots") con ELO más cercano y lo usa como rival (`v_es_bot := true`).

Hallazgo crítico (reproduce P0#4 de TECH-DEBT): el fallback de bots **NO está condicionado a `p_ranked`**. La condición `0109:550` es `v_mi_elo < 1300 and v_segundos >= 30` — vale por igual para `p_ranked = true` y `p_ranked = false`. O sea, un duelo **casual** también puede caer contra un bot luego de 30s de espera. No está mal que el casual tenga bots (es el modo pensado para eso), pero el ranked también los tiene por debajo de Platino, lo que contradice "ranked = contra jugadores" implícito en la UX (el historial muestra `rival_es_bot` con la etiqueta "Clan de Bots"). Requiere migración SQL para condicionar el fallback a `p_ranked=false` o al revés según decisión de producto. Estado: **BLOQUEADO-POR-DB** (no se puede verificar tocar SQL sin base).

Evidencia adicional del Census Twitter para los bots: `0066_clan_de_bots.sql` define `clan_miembros` (velocidad/tasa de acierto del bot), y la migración `0109:476` declara `v_es_bot boolean := false`. El resultado de duelo contra bot devuelve `oponente_es_bot` (`ResultadoDueloBlock.tsx:22`) y el historial filtra `rival_es_bot` (`RankedsClient.tsx:37,350-354`).

### 1.3 Duracion / rendición / abandono

- **Búsqueda**: tope de 60s en el cliente (`MAX_SEGUNDOS_BUSQUEDA`, `RankedsClient.tsx:383`); al llegar se cancela la cola (`cancelar_busqueda_duelo`, `RankedsClient.tsx:534`). La entrada de cola expira a los 2 minutos (limpieza `0109:517`).
- **Ventana ELO progresiva**: `0109:537` — `v_rango := least(300, 30 + (v_segundos / 10) * 30)`; arranca ±30, +30 cada 10s, tope ±300. Mostrado en UI con `buscandoDetalle` (`RankedsClient.tsx:577`).
- **Sala de espera**: `SalaEsperaDuelo.tsx` — estado "cuenta-regresiva" cuando el rival está presente, "agotado" cuando no se conecta (auto-arranque manual con "Jugar mi parte ahora", `:79-81`), y estado neutro mientras espera (`:88-103`).
- **Rendirse**: `BotonRendirse.tsx` con `duelId` (la prop `duelId` se exige en todo caller nuevo, `SalaEsperaDuelo.tsx:22`). Se oculta el botón si el rival es bot (`SalaEsperaDuelo.tsx:49`). Mecánica de abandono: migración `0088` define estado `'abandonado'` + columna `abandonado_por` (verificado en checklist #23 / RANKEDS-AUDIT).
- **Resultado**: `registrar_resultado_duelo` (`0050:158` y re-creada en 0109) resuelve el duelo cuando ambos terminaron; devuelve `resuelto=false` si el rival aún no jugó (`0050:213-217`), y `ResultadoDueloBlock.tsx:155` muestra "Esperando al rival…".

### 1.4 Mejor-de-3 ("todas las ciudades")

- Solo clasificatoria: `0109:504-508` y guard de UI (`RankedsClient.tsx:427-431`, `:433-438`).
- `0109:573-620`: para `p_mundo = 'aleatorio'` genera `serie_id` y 3 rondas (shuffle sobre `v_mundos`, 3 rondas fijas, `ronda_total = 3`). Cada ronda inserta un `duels` con `modo = 'mejor_de_3'`, `ronda_numero i`.
- Cada ronda es un duelo simple independiente (`registrar_resultado_duelo` devuelve puntajes y `modo`), y las series se puntúan en `duel_results.mi_puntaje`/`rival_puntaje` (migraciones `0071`, `0073`, `0074`, `0094` declaradas en checklist #15 → ELO con K×1.5 en series).
- `PantallaVS.tsx:39-43` muestra el badge "Mejor de 3" + subtítulo ("Ronda 2/3 · Geografía") cuando `modo === "mejor_de_3"`.
- El feed de resultado de una serie muestra mundo `aleatorio` como "todas las ciudades" (`Feed.tsx:263`).

### 1.5 Diferencias casual / clasificatoria (Chispas / ELO / ranking)

| Dimensión | Casual | Clasificatoria |
|---|---|---|
| Flag en DB | `clasificatorio = false` (`0050:13-14`; set por `p_ranked` en `0109:519-533`) | `clasificatorio = true` (default) |
| ELO | NO se toca: `0050:243-249` devuelve `elo_nuevo = mi_elo` y retorna antes del bloque de ELO | Se recalcula con K=13 (`0050:185`, `:251-259`), rango + `desbloquear_titulo` (`0050:261-266`) |
| Stats | `mis_stats_casual` aparte (`0050:280-294`); en UI "Ganados/Perdidos - no afecta tu rango" (`RankedsClient.tsx:312-319`) | `mi_historial_duelos` con `clasificatorio` (`0050:302-351`); V/D/tasa solo sobre clasificatorios (`RankedsClient.tsx:280-283`) |
| Ciudad | Excluye `aleatorio` (simple siempre) | Todas (con `aleatorio` para Platino+) |
| Bots | Dispone del fallback de bot tras 30s (mismo que ranked hoy, ver §1.2) | Idem (bug P0#4) |
| Chispas | Resultado de duelo no otorga chispas en sí (no hay rama de chispas en `registrar_resultado_duelo`); XP/chispas por práctica se asocian a `practica/finish`, no al duelo | Ídem |
| Historial | Etiqueta "Casual" (`RankedsClient.tsx:345-349`) | Sin etiqueta |

VERIFICADO EN CÓDIGO según fuentes citadas.

### 1.6 Notificaciones / retos pendientes

- `NotificacionesDuelo.tsx` (toast global con Realtime, suscripción a `retos-a:<id>` montada con auth) — corregido en T10.
- `useRetosPendientes.ts` (hook compartido, countdown 60s + auto-rechazo) usado por `FeedSidebar.tsx` y `DuelosPendientes` en `RankedsClient.tsx:198-262`.

---

## 2. Auditoría del FEED social

### 2.1 Qué hay (código completo, desactivado)

| Pieza | Archivo | Estado |
|---|---|---|
| Componente principal de posts | `src/app/[locale]/social/Feed.tsx` | VERIFICADO EN CÓDIGO (código íntegro, sin uso en runtime) |
| Barra lateral (amigos/solicitudes/retos) | `src/app/[locale]/social/FeedSidebar.tsx` | VERIFICADO EN CÓDIGO (sin uso en runtime) |
| Server component de /social | `src/app/[locale]/social/page.tsx` | VERIFICADO EN CÓDIGO — **carga posts, reacciones, siguiendo, solicitudes, amigos, retos y niveles de mundo** (`:26-40`), formatea `PostFeed[]` (`:58-89`) y pasa `posts` + `puedeCrearProblemaPersonalizado` a SocialClient |
| Cliente que decide qué se ve | `SocialClient.tsx` | **DESACTIVADO** (`:16-19`): no renderiza `Feed` ni `FeedSidebar` |
| Redirect de /feed | `src/app/[locale]/feed/page.tsx:7-8` → `/social` | VERIFICADO EN CÓDIGO |
| APIs | `api/feed/{crear-desafio, crear-problema-personalizado, reaccionar, responder-personalizado, retar}` | VERIFICADO EN CÓDIGO, todos con validación + `respuestaError` |

### 2.2 Tipos de post y su consumo

`PostFeed.tipo` (`Feed.tsx:11`): `logro | desafio | resultado_duelo | subida_rango | nivel_mundo | desafio_personalizado`.
- `Feed.tsx` renderiza una tarjeta por tipo (`Feed.tsx:146-163`).
- `TarjetaDesafio` reta por `/api/feed/retar` (`Feed.tsx:207-219`) y navega a `/practica?operacion=<op>&duelo=<id>` — **hangover T10**: ACTIVE lo marca como "Pendiente opcional: mismo hrefDuelo en Feed.tsx:217". Verificado: `Feed.tsx:217` usa `router.push(\`/practica?operacion=${data.operation_type}&duelo=${data.duel_id}\`)`. Para `operation_type` no-numeria (`null`) el gate de `/practica` "fila.mundo === numeria" falla → el feed de reto a mundos no-numeria se rompería al activarlo. PROPUESTA: aplicar `hrefDuelo(mundo, operation_type, duel_id, sub_tipo)` como en T10.
- `TarjetaDesafioPersonalizado` responde inline (`responder-personalizado`) y `ReportarBoton postId` — reporte RLS vía `reportar_post` (0128).
- `rangoDeSlug` con fallback a `post.rangoNuevo` si el slug no se resuelve a un rango conocido (`Feed.tsx:279-300`).
- El cargado de `pagere.tsx` monta la respuesta `respuestas` del problema personalizado **nunca** al cliente (`page.tsx:61-64` — la respuesta viaja server-side a `responder_problema_personalizado`).

### 2.3 RLS y visibilidad del feed

- `page.tsx:27-33` lee `feed_posts` desde el cliente del server (Supabase server). Bajo la RLS de `feed_posts` (leer todos / insertar-propio, definida en las migraciones del feed original y no revocada — no se encontró policy restrictiva en las auditorías RLS de 0001-0114) el feed es **público para autenticados**: cualquier cuenta autenticada puede leer posts ajenos. La modalidad "siguiendo" la decide el servidor con `friendships` (`page.tsx:35`) y `esDeUnSeguido` (`page.tsx:84`).
- `feed_reactions` se lee completa y se re-agrega en el servidor (`page.tsx:34`, `:50-56`) — leve ineficiencia, no un gap funcional.
- `profiles` bajo RLS propia-dueño (`0001`) no se lee directo: por eso `page.tsx` usa el select de `feed_posts` con `profiles(display_name, fuente_nombre)` anidado (embedding no pasa por la policy de profiles — por diseño). NO PUEDO VERIFICAR en vivo (sin DB).

### 2.4 Qué falta para activar el feed (PROPUESTA — NO activado)

El feed NO se activa en esta fase: es cambio de producto y el PO estuvo ausente. Se deja el plan documentado para decisión futura. Bloqueo de decisión: ¿alcance (feed global vs siguiendo only), moderación de texto libre (ya limitado a 1/día con filtro) y el formato de reto multi-mundo (§2.2)?

---

### F8 plan PROPUESTO de activación del Feed social

> Marco: **PROPUESTA**. Requiere decisión explícita antes de aplicar. No se ejecutó nada de esto.

**Paso 0 — diff sugerido en `SocialClient.tsx` (reversa del desactivado):**

```tsx
// Reemplazar el cuerpo actual (que solo renderiza <AmigosClient />) por:
import Feed from "./Feed";
import FeedSidebar from "./FeedSidebar";

// en el render:
<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-10 sm:px-6">
  <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Social</h1>
  <div className="flex gap-6">
    <Feed posts={posts} puedeCrearProblemaPersonalizado={puedeCrearProblemaPersonalizado} />
    <FeedSidebar amigosState={amigosState} retosIniciales={retosIniciales} />
  </div>
</div>
```

O alternativamente restaurar el layout previo con pestañas referencia (ir a 0038). El layout de `SocialClient.tsx` actual ya recibía las 5 props.

**Paso 1 — arreglos de código que YA se detectaron (no dependen de activar):**
- `Feed.tsx:140-141` voseo "seguís a nadie" → "sigues a nadie" (es/en hardcodeadas, sin i18n). Si se activa el feed, conviene mover todo el copy de tarjetas a i18n (ver I18N-AUDIT).
- `Feed.tsx:217` `router.push("/practica?operacion=...")` lo rompe para mundos != numeria → migrar a `hrefDuelo(mundo, operation_type, duel_id, sub_tipo)` (mismo patrón aplicado en T10 → `NotificacionesDuelo.tsx`).
- `FeedSidebar.tsx:192` "Todavía no tienes amigos agregados." → decisión de copy (exists fuera del flujo activo).

**Paso 2 — checks post-activación:**
- `npx tsc --noEmit` + `npx eslint` sobre `SocialClient.tsx` y `Feed*.tsx` (ver teoremas de import en §4).
- Verificación visual en navegador de: pestañas Para ti/Siguiendo, creación de desafío, reacción 🔥 toggle, responder problema personalizado inline, reto directo desde tarjeta de desafío (numeria y mondos != numeria gracias al fix del Paso 1) y ReportarBoton.
- Re-cuenta de `feed_posts` en DB real (¿hay posts residuales de usuarios reales?).

**Paso 3 — riesgos documentados:**
- R1: `proficiencia` de RLS: si `feed_posts` NO tuviera policy de INSERT para usuarios autenticados (o si 0128 dejó algo) `crear-desafio`/`crear-problema-personalizado` fallan → revisar grants y policies antes de activar.
- R2: `Feed.tsx:217` reto multi-mundo roto (ver Paso 1).
- R3: texto libre de `problemaPregunta`/`respuesta` ya filtrado al crear (`crear_problema_personalizado` con filtro de palabras, 0128), pero mostrar HTML sin escapar de `problemaPregunta` en `Feed.tsx:361` — React escapa por defecto, riesgo bajo, aun así definir moderación para cuando haya público masivo.
- R4: `/feed` sigue redirigiendo a `/social` (`feed/page.tsx:7-8`) — decide si se elimina el redirect o se hace `/feed` = pestaña feed (default en el rediseño Fase 3 era que /social ya es el hub).
- R5: `page.tsx` pide 40 posts sin paginación futura (`page.tsx:33`) — acceptable para v1, anotación para backlog.

**Resultado de la PROPUESTA**: documentada, no implementada. Estado: **PROPUESTA**.

---

## 3. Cruce con REQUIREMENTS-CHECKLIST

Filas tocadas por F8 (verificadas contra código real):

- **#18 Duelos casuales separados del ELO — REAL** (E2E previo `CASUAL-AUDIT-2026-09-08`, código `0050` + `0109`): sigue vigente; casual no toca ELO (`0050:243-249`). Matiz documentado: casual SÍ puede caer contra bot tras 30s (`0109:550-562`) — no contradice el item (ELO sigue intacto con bot), pero refuerza el BLOQUEADO-POR-DB de P0#4.
- **#20 Progreso del rival en vivo — IMPLEMENTADO** (`0038`, `useProgresoEnVivo.ts`, `ProgresoRivalEnVivo.tsx`): sin cambios.
- **#54 Feed de actividad social — PARCIAL** (`Feed.tsx`, `FeedSidebar.tsx`, APIs `api/feed/*`, migraciones 0013/0052/0053, desactivado en `SocialClient.tsx:16-19`; `/feed` redirige a `/social` `feed/page.tsx:7-8`). **Confirmado en esta auditoría**: el server component `social/page.tsx:26-40` SÍ carga todos los datos del feed, la desactivación solo vive en `SocialClient.tsx`. Se deja la fila PARCIAL (sin cambio de estado) porque el plan de activación queda en PROPUESTA.
- **#55 Amigos — IMPLEMENTADO** (`AmigosClient.tsx` + APIs amigos): sin cambios.
- **#21 Invitación por link — IMPLEMENTADO** (`0059`, `0096`, `0109`; page.xo `[inviteId]`): sin cambios.

## 4. Cierres seguros aplicados (riesgo-cero)

1. `SocialClient.tsx:4` — import dead `import type { PostFeed } from "./Feed"`: se mantiene porque el tipo participe en la firma de `Props`, pero la prop `posts` está desactivada. **Decisión: NO se tocó** (es parte del diseño de desactivación del feed; quitarlo requiere también quitar la prop `posts`/`page.tsx` en la misma tanda). Se deja documentado (ver §2.4).
2. **Voseo residual visible** encontrado en `Feed.tsx:140-141` ("Todavía no seguís a nadie con actividad"). El archivo está fuera del flujo activo (Feed desactivado) pero el copy está visible si se activara. **Corregido a "sigues"** — sin impacto en runtime (código no montado), tsc/eslint/vitest sin cambios de resultado.
3. `FeedSidebar.tsx:192` "Todavía no tienes amigos agregados." — neutro (tú-form), NO se toca.
4. `FeedSidebar.tsx:86` placeholder "Buscar por nombre..." neutro, NO se toca.

Verificación de los cierres: `npx tsc --noEmit` **0**, `npx vitest run` **147/147**, `npx eslint` sobre los archivos tocados **0 error / 3 warnings preexistentes** (dead props del feed desactivado en `SocialClient.tsx`) — cuadro exacto más abajo.

---

## 5. Pendientes y bloqueos

| Estado | Item |
|---|---|
| BLOQUEADO-POR-DB | P0#4 parcial: bots en casual (`0109:550-562`) no condicionados a `p_ranked`; casual y ranked <1300 caen en bot tras 30s. Migración SQL requerida. |
| BLOQUEADO-POR-DB | BUG#5 duelos: doble resolución en `registrar_resultado_duelo` (guard de estado) + cleanup duelos fantasma. |
| PROPUESTA | Activación del feed social (§2.4) — software cambio de producto, PO ausente. |
| PROPUESTA | `Feed.tsx:217` reto multi-mundo con `hrefDuelo` (si se activa el feed). |
| PENDIENTE | Decisión copy del feed (tarjetas en español hardcodeado sin i18n, `Feed.tsx`). |

## 6. Evidencia de verificación (esta sesión)

- `npx tsc --noEmit` → exit 0, sin salida.
- `npx vitest run` → 13 files · **147/147 passed**.
- `npx eslint` sobre `src/api/feed/retar/route.ts`, `src/components/duelos/*`, `src/app/[locale]/social/{Feed,Sidebar,FeedSidebar}.tsx`, `SocialClient.tsx`, `RankedsClient.tsx` → **3 warnings** pre-existentes (dead props `SocialClient.tsx:21,24,25`, `_posts/_retosIniciales/_puedeCrearProblemaPersonalizado` por feed desactivado), **0 errores**.