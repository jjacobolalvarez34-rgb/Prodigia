# STORE-ECONOMY-AUDIT — Auditoría F5 de Tienda + Trastienda (docs vs código)

**Fecha:** 2026-09-09 · **Agente:** store-economy+orchestrator · **Fase:** F5 del mega-sprint
**Método:** verificación de código real (migraciones SQL, `src/`, `messages/`). Sin acceso a DB/browser: todo lo de runtime queda marcado `PENDIENTE usuario`.
**Cruce con docs:** `docs/audits/TRASTIENDA-ECONOMIA.md`, `docs/audits/TRASTIENDA-VISUAL-2026-09-09.md`, `docs/audits/TIENDA-EXPANSION-2026-09-09.md`, `docs/audits/REQUIREMENTS-CHECKLIST.md`, `docs/audits/SECURITY-BASIC-AUDIT.md`.

> Nota de ruta: el prompt original citaba `docs/TRASTIENDA-ECONOMIA.md`. En el repo **no existe** ese archivo en la raíz de `docs/`; la ruta real es `docs/audits/TRASTIENDA-ECONOMIA.md`. `docs/PROYECTO-GENERAL.md` tampoco existe (el análogo es `docs/PROJECT-STATE.md`). Todas las referencias de este audit usan las rutas reales.

---

## 1. RESUMEN

| Área | Estado | Evidencia clave |
|---|---|---|
| Economía Tienda (catálogo real) | VERIFICADO POR CÓDIGO | `src/lib/tienda/costos.ts:21-70` |
| Trastienda M1 (apuestas a duelo ajeno) | IMPLEMENTADO (solo `duels`) | `0123_trastienda_mecanicas_123.sql` líneas 5-11, 121-155, 310-360 |
| Trastienda M2 (predicción ranking semanal) | IMPLEMENTADO (self-heal) | `0123` M2 + `0126` (`ventana_predicciones`) + `cobrar_predicciones_pendientes` |
| Trastienda M3 (títulos) | IMPLEMENTADO (8 de 9) | `0123` rama `titulo` de `girar_ruleta`; `src/lib/titulos/catalogo.ts:107-116` |
| Trastienda M4 (ruleta) | REEMPLAZADO por mesa casino | `0127_trastienda_ruleta_casino.sql`; ruleta clásica = legacy sin uso en UI |
| Trastienda M5 (minijuegos) | 3 activos; 2 eliminados a propósito | `0124` creó 4; `0126` eliminó Acertijos/El Reloj |
| RLS/seguridad Trastienda | 2 hallazgos BAJO (T-01/T-02) latentes | `SECURITY-BASIC-AUDIT.md`; decisión "no parchear sin repro en DB" |
| i18n es/en | Paridad 555/555 (F3); 4 strings voseo "Revisá" en TIENDA | `messages/es.json:203,205,207,209` |

**Backlog resultante:** 2 ítems quedan DIFERIDOS-POR-DECISIÓN (M1 rankeds/reto_semanal, job semanal M2), 1 CERRADO (ruleta clásica), 2 CORRECCIONES DE DOC/COMENTARIO aplicadas, 1 PROPUESTA de texto (voseo "Revisá") reportada sin tocar, 1 hallazgo nuevo de EV en comentario de 0127.

---

## 2. TIENDA — AUDITORÍA DE CATÁLOGO (docs vs código)

### 2.1. Catálogo real (verificado)

`src/lib/tienda/costos.ts:21-70` = 24 ítems comprables:

| Grupo | Ítems | Costo | Subtotal |
|---|---|---|---|
| Utilidad | escudo, congelamiento, boost | 350/450/600 | 1.400 |
| Fuentes (6) | mono, serif, manuscrita, impacto, script, futurista | 1.000–5.000 | 12.900 |
| Marcos de rango (6) | bronce→prodigio | 1.000–5.000 | 14.400 |
| Marcos de mundo (8) | numeria, enigmia, geografia, quimia, anatomia, melodia, trigonometria, historia | 2.400 c/u | 19.200 |
| Paquete | paquete_marcos_mundo | 14.500 | — |

**Total "completar todo" sin paquete: 47.900 Chispas (~400 partidas). Con paquete: 62.400.**

### 2.2. Divergencias docs vs código (Tienda)

| # | Doc dice | Código real | Veredicto |
|---|---|---|---|
| T-01 | `costos.ts:13` comentario "el catálogo completo suma ~23.200" | La suma real con `COSTOS` es **47.900** (o 62.400 con paquete) | **COMENTARIO DESACTUALIZADO** — corregir (ver §7). |
| T-02 | `TIENDA-EXPANSION-2026-09-09.md:10` "26 ítems estáticos (8 marcos de rango, ...)" | 24 ítems; **6** marcos de rango (bronce→prodigio, `costos.ts:37-42`) | **DOC FUERA DE RANGO** — el propio §1.3 del doc suma 6 (línea 58). Corregir línea 10. |
| T-03 | `TIENDA-EXPANSION.md:14` y `TRASTIENDA-ECONOMIA.md:17` "catálogo actual (23.200)" | 47.900 sin paquete | Dato viejo heredado de `costos.ts`; el mismo `TIENDA-EXPANSION.md:70` recalcula 47.900. Corregir resumen. |
| T-04 | `TIENDA-EXPANSION.md:424` "Opción A recomendada (sección dentro de la Tienda)" | Se implementó **Opción B**: ruta propia `/trastienda` (`src/app/[locale]/trastienda/page.tsx`) | Decisión de implementación divergente documentada en PROGRESO corte 2. No es bug — actualizar doc. |

---

## 3. TRASTIENDA — ESTADO DE CADA MECÁNICA

### 3.1. M1 — Apuestas a partida de otro jugador

**Spec:** `TRASTIENDA-ECONOMIA.md:28-133` (tabla `trastienda_apuestas`, límites, odds por ΔELO).
**Código:** `0123_trastienda_mecanicas_123.sql`:
- `multiplier_apuesta_partida` (líneas 124-156): tabla de cuotas idéntica a la spec (1.85/1.85/3.50 · 1.50/2.30/4.00 · 1.30/3.00/5.00 · 1.15/4.00/6.00).
- `preview_apuesta_partida` + `apostar_partida` (líneas 213-360): límites diarios **10 apuestas** y **500 Chispas** verificados (líneas 325-328), deducción atómica, elección `a|b|empate`.
- Resolución automática por trigger sobre `duel_results` (líneas 470-474).
- **Solo `duels`**: comentario de la migración (línea 11) — `rankeds/reto_semanal quedan para un corte futuro`.

**Estado:** VERIFICADO POR CÓDIGO. **DIFERIDO-POR-DECISIÓN:** cubrir `rankeds` y `reto_semanal` (requiere auditar su clausura y tipos antes).

### 3.2. M2 — Predicción de ranking semanal

**Spec:** `TRASTIENDA-ECONOMIA.md:135-222` (tabla, ventana lunes→miércoles, buckets, ±2 posiciones = 50%).
**Código:** `0123` M2:
- `multiplier_prediccion` (líneas 476-489): 6.00 / 4.00 / 3.00 / 2.20 / 1.65 / 1.30 / 1.12 — **exactamente la tabla "AJUSTADO" de la spec** (líneas 192-200).
- `apostar_prediccion_ranking` (líneas 491-555): ventana lunes→miércoles (`current_date > v_semana + 2` → rechaza), **1 por semana** (`UNIQUE(user_id, semana_inicio)` + check `exists`), montos 25/50/100/200, **self-heal**: al apostar resuelve la semana pasada (`perfom resolver_prediccion_ranking(v_semana - 7)`), explícito en comentario "no hay job semanal garantizado".
- `0126`: `ventana_predicciones()` server-authoritative (evita desfase de ventana cliente-UTC) + `cobrar_predicciones_pendientes` en el GET de `/api/trastienda/predicciones`.

**Estado:** VERIFICADO POR CÓDIGO. **DIFERIDO-POR-DECISIÓN:** job semanal automático de resolución (hoy solo self-heal al apostar) — documentado como tal en el código.

### 3.3. M3 — Títulos exclusivos de Trastienda

**Spec:** `TRASTIENDA-ECONOMIA.md:226-273` (9 títulos, del `tronado` al `gniñardo`).
**Código:** `src/lib/titulos/catalogo.ts:107-116` = **8 títulos** (tronado, farolero, profeta-minor, uja, ardilla, profeta-mayor, ecualizador, sentenciador). **Falta `gniñardo`** (Mitológico, top 3 del ranking semanal 3 semanas seguidas + predicción acertada) — no declarado en `catalogo.ts`.
- Los 4 títulos base de la ruleta (`titulos_trastienda_base()`, SQL `0113`) **redundan (idempotente)** con los del catálogo TS (comentario en `catalogo.ts:107`).
- `0123` reescribió `girar_ruleta` con rama `titulo` real vía `titulos_trastienda_base()` + `desbloquear_titulo_propio(p_slug, p_nombre, 'trastienda')`; `0126` la recreó en español neutro. **El premio "título" ya NO es escudo placeholder** (ver §5, hallazgo H-02).

**Estado:** VERIFICADO POR CÓDIGO. `gniñardo` = **PENDIENTE-DECISIÓN** (requiere lógica multi-semana; evaluar si el mundo Mitológico merece un DIFERIDO explícito).

### 3.4. M4 — Ruleta (reemplazada por mesa casino)

**Spec original:** rueda de 10 segmentos con EV 0.923 (`TRASTIENDA-ECONOMIA.md:276-369`).
**Implementación inicial:** `0121` (`girar_ruleta`, límite 5/día, 120→150, pity 3) + `ruleta.ts` + `/api/trastienda/girar-ruleta` + `Ruleta.tsx`.
**Estado actual:**
1. `0127` creó la **mesa casino** (`apostar_casino_elementos`, 118 elementos, fichas 100/250/500/1000, límite 20/día, factor 0.88, premio raro ~5%).
2. `Ruleta.tsx` fue reescrita como mesa casino; `TrastiendaClient.tsx:34,168-204` tiene sub-pestañas `ruleta` / `juegos`.
3. La ruleta clásica (`src/lib/trastienda/ruleta.ts` + `/api/trastienda/girar-ruleta`) **sigue existiendo pero no se referencia desde la UI** (grep: solo su route y su test).

**Estado:** CERRADO por reemplazo de diseño aprobado por PO el 2026-09-09 (PROGRESO 0127). La propuesta P4 (tómbola vertical) queda anulada por la mesa. **Legacy intacta sin uso** — decisión: conservarla como respaldo o borrarla (PROPUESTA).

### 3.5. M5 — Minijuegos

| Minijuego (spec `TRASTIENDA-ECONOMIA.md:372-563`) | Spec | Código 2026-09-09 | Estado real |
|---|---|---|---|
| La Calcu | costo 50, salida 125 (+200 ≤10s), EV 0.875 | `0124`, `LaCalcu.tsx`, `/api/trastienda/la-calcu` | **ACTIVO** |
| Volado | costo 30, rondas 55/110/220, EV 0.91 | `0121`, `Volado.tsx`, `/api/trastienda/volado` | **ACTIVO** |
| La Pizarra | costo 30+, salidas 170/100/50/0, EV 0.96 | `0121`, `Pizarra.tsx`, `/api/trastienda/pizarra` | **ACTIVO** |
| Acertijos de Enigmia | costo 100, salidas 60/100/170 (EV 0.944) | `0124` lo creó | **ELIMINADO en `0126`** (limpieza, a propósito) |
| El Reloj | costo 60, salidas 160/95/55/0 (EV 0.896) | `0124` lo creó | **ELIMINADO en `0126`** |

El tab `juegos` de `TrastiendaClient.tsx:196-204` muestra **Volado + Pizarra + LaCalcu** (3 activos). `HistorialTrastienda.tsx:41` sigue mapeando minijuegos por `titulo` (`volado`/`la_calcu`/`pizarra`).

**Estado:** VERIFICADO POR CÓDIGO. Acertijos/El Reloj = **CERRADO por decisión** (eliminados en 0126; "La Calcu sola entre los de 0124" — junto a Volado/Pizarra de 0121). La spec sigue listando los 5 minijuegos → **doc a actualizar** (ver §7).

### 3.6. EV agregado de Trastienda (spot-check)

| Mecánica | EV por interacción (código) | Contraste con spec |
|---|---|---|
| Apuesta duelo (mult 1.85/1.15…) | House edge ~6% | Coincide (§1: 0.94) |
| Predicción ranking | Multipliers ajustados (EV ~0.47 ponderado) | Coincide (§2 ajustado, EV bajo aceptado a propósito) |
| Mesa casino | factor 0.88 → **EV del jugador ≈ 0.88** | **Desvía del target 0.92-0.96** → hallazgo H-01 |
| Volado / Pizarra | EV ~0.88-0.96 | Coincide (§5) |
| Ruleta clásica (legacy) | EV ~0.92 (pity incluido) | Coincide (§4) — ya no está en la UI |

**Drenaje típico:** la spec estima ~102 Chispas pérdida/sesión (§6). Con la mesa casino (factor 0.88, fichas altas, 20/día) el drenaje por jugador activo puede superar ese valor — **métrica a monitorear en vivo**, sin acciones sin datos.

---

## 4. SEGURIDAD / RLS (menciones de la familia S)

- **T-01** `trastienda_casino_elementos` y **T-02** `trastienda_calcu` **sin RLS ni grants** (catálogo espejado en cliente: `casino.ts:1-10`; la Calcu: secreto en server, tabla sin grants). Documentados como **BAJO/latente** en `SECURITY-BASIC-AUDIT.md` con decisión previa "no parchear sin repro en DB" → **BLOQUEADO-POR-DB**.
- **S5** `resolver_apuesta_si_activa` (doble-o-nada, `p_precision` del cliente): X en el audit de seguridad 2026-09-09; fuera de alcance F5 salvo como nota: la mecánica de apuestas de Trastienda usa tabla/RPC propios y **no depende** de S5 (`TRASTIENDA-ECONOMIA.md:604` confirmado en `0123`).
- Sin cambios de seguridad en este audit (ninguno autorizado sin reproducción en DB).

---

## 5. HALLAZGOS (con file:line)

| # | Severidad | Hallazgo | Decision propuesta |
|---|---|---|---|
| H-01 | Baja (comentario) | `0127_trastienda_ruleta_casino.sql:17` (y `:342`) dicen "EV de casa ~ 0.92" pero el factor aplicado (`× 0.88`) da **EV del jugador ~0.88** (house edge 12%). `casino.ts:173-174` usa 0.88 correctamente. | Corregir comentario del SQL para no dejar ambigüedad (PROPUESTA, no se toca SQL sin OK). |
| H-02 | Baja (docs desactualizadas) | `REQUIREMENTS-CHECKLIST.md:90` y `:102` y ruleta.ts:52 dicen que el premio "título" de la ruleta entrega **escudo placeholder**. Desde `0123` entrega **título real** (y desde `0127` la UI usa la mesa casino). | Corregir notas del checklist + comentario de `ruleta.ts` (aplicado, ver §7). |
| H-03 | Info (voseo residual) | `messages/es.json:203,205,207,209` "Revisá tu conexión." = **voseo visible en TIENDA** que F3 no normalizó (tokens capitalizados quedaron fuera del script). F3 confirmó solo "más"/"estás" como residuales — estos 4 son omisión real. | **Reportar, NO corregir a ciegas** (regla de la tarea). Recomendación: `Revisa` en las 4 claves. |
| H-04 | Info (key voseo) | `es.json:231` la **clave** se llama `tenes` (valor neutro "Tienes: {n}"). No es texto visible — solo convención. | Cosmética; sin impacto. |
| H-05 | Info (ini) | `es.json:120` "Todavía no estás en ningún clan" — "estás" es **neutro**, no voseo. OK. | Nada. |

---

## 6. INVENTARIO DE RUTAS / COMPONENTES / CLAVES (F5)

**Rutas API Trastienda** (`src/app/api/trastienda/`): `apuestas`, `casino`, `girar-ruleta` (legacy), `historial`, `la-calcu`, `pizarra`, `predicciones`, `volado`. Todos usan patrón `respuestaError`.

**Componentes** (`src/components/trastienda/`): `TrastiendaClient`, `Ruleta` (mesa casino), `ApostarPartida`, `PrediccionRanking`, `LaCalcu`, `Volado`, `Pizarra`, `HistorialTrastienda`. **No existen** `Acertijos`/`ElReloj` (eliminados).

**i18n:** claves `Tienda.trastienda.*` espejadas es/en (F3: 555/555 global; casino verificado por script en 0127). El subárbol de trastienda (8 claves de primer nivel: `apuestasPartida`, `predicciones`, `ruletaCasino`/mesa, `juegos`, `historial`, etc.) sin diferenciales es/en en el spot-check.

**Página:** `/tienda` (`page.tsx`, 48 líneas) ya no lee `apuesta_monto`/`ocultar_doble_o_nada` del `select` de `profiles` (refactor corte 2). Trastienda vive en su ruta propia `/trastienda` con su `TrastiendaClient`.

---

## 7. CAMBIOS APLICADOS EN ESTA FASE (código-safe, verificables)

1. **`src/lib/trastienda/ruleta.ts`** — comentario del segmento `titulo` actualizado: ya no "escudo placeholder hasta Mecánica 3"; se documenta que `0123`+ entrega títulos reales y que la rueda clásica es **legacy sin uso en UI** desde el casino `0127`. Sin tocar `VALOR_SEGMENTO_CHISPAS` ni el test.
2. **`docs/audits/TRASTIENDA-ECONOMIA.md`** — estado del header + nota de implementación con las divergencias (M1 solo duels, M2 self-heal, minijuegos 3 activos + 2 eliminados, ruleta→mesa casino, ruta propia `/trastienda`, EV del factor casino).
3. **`docs/audits/REQUIREMENTS-CHECKLIST.md`** — notas de los ítems 41, 44 y 90 y el pendiente 3 actualizados (ruleta/título placeholder → títulos reales + mesa casino; Acertijos/El Reloj → ELIMINADO POR DISEÑO en 0126).

**Intencionalmente NO tocados** (requieren decisión o repro en DB): los 4 strings "Revisá" (H-03, regla de la tarea), el comentario "EV ~0.92" del SQL 0127 (H-01), el comentario "~23.200" de `costos.ts` (T-01, sugerido en PROPUESTAS).

---

## 8. BACKLOG / CLAIMS — CIERRE Y RECLASIFICACIÓN

| Ítem backlog | Estado F5 | Evidencia / decisión |
|---|---|---|
| **M1 rankeds/reto_semanal** (apuestas a esos tipos) | **DIFERIDO-POR-DECISIÓN** | `0123:11` — solo `duels` auditaron clausura; requiere auditar flujo y compuerta. |
| **M2 job semanal automático** | **DIFERIDO-POR-DECISIÓN** | `0123:497-501` self-heal cubre el caso; job = mejora, no bug. |
| **Ruleta clásica / P4 tómbola vertical** | **CERRADO** (reemplazado) | `0127` mesa casino aprobada por PO; legacy intacta sin uso. |
| **Título Mitológico `gniñardo`** | **PENDIENTE-DECISIÓN** | No está en `catalogo.ts:107-116`; requiere lógica de 3 semanas. |
| **Acertijos de Enigmia / El Reloj** | **CERRADO por decisión** | Implementados en `0124`, removidos en `0126` (limpieza). |
| **T-01 / T-02 (RLS casino/calcu)** | **BLOQUEADO-POR-DB** | `SECURITY-BASIC-AUDIT.md` BAJO latente; no parchear sin repro. |
| **S5 doble-o-nada** | **Documentado, fuera de alcance** | Crítico en audit 2026-09-09; Trastienda no depende de él. |
| **Voseo "Revisá" (4 claves TIENDA)** | **PROPUESTA** (reportado, no corregido) | `es.json:203/205/207/209`; espera decisión. |
| **Comentario `costos.ts` "~23.200"** | **PROPUESTA** (corregir comentario) | Real = 47.900 sin paquete. |
| **Comentario SQL `0127` "EV ~0.92"** | **PROPUESTA** (corregir comentario) | Factor 0.88 → EV ~0.88. |

---

## 9. VERIFICACIÓN (F5)

- **Código:** `npx tsc --noEmit` y `npx eslint src/lib/trastienda/ruleta.ts` sin errores; `npx vitest run` 147/147 (el único cambio de código es un comentario — los tests de `ruleta.test.ts` pasan sin tocarlos).
- **Docs:** aplicado en este audit; paridad es/en verificada por spot-check (555/555 heredado de F3).
- **PENDIENTE usuario (en orden):** aplicar migraciones `0123 → 0124 → 0125 → 0126 → 0127 → 0128` + `NOTIFY pgrst, 'reload schema';` y retestear por tunnel: mesa casino (fichas/límite 20/premio raro), apuestas a duelo (límites 10 y 500), predicción (ventana + self-heal), La Calcu, Volado, Pizarra.
- **NO PUEDO VERIFICAR:** nada del runtime (DB, pgrst, browser) en este entorno.

---

*Referencias: `supabase/migrations/0121..0128`, `src/lib/trastienda/*.ts`, `src/lib/tienda/costos.ts`, `src/components/trastienda/*.tsx`, `src/app/api/trastienda/*`, `src/app/[locale]/trastienda/page.tsx`, `src/app/[locale]/tienda/page.tsx`, `src/lib/titulos/catalogo.ts`, `messages/{es,en}.json`, `docs/audits/{TRASTIENDA-ECONOMIA,TRASTIENDA-VISUAL-2026-09-09,TIENDA-EXPANSION-2026-09-09,REQUIREMENTS-CHECKLIST,SECURITY-BASIC-AUDIT}.md`.*