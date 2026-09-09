# AUDITORÍA D1 · DUELOS CASUALES — 2026-09-08

**Objetivo**: probar por código y por E2E que los duelos casuales son independientes del sistema
rankeds (no dependen de ELO, no lo modifican, no entran en la cola clasificatoria ni contaminan
stats/logros competitivos) y detectar bugs provables.

**Alcance**: 2 usuarios anónimos reales (signInAnonymously en Chromium) + supabase-js inyectado en
`localhost:3000/es`, clientes service_role SOLO lectura para evidencia ELO, y lectura de las
migraciones vigentes. Dev server local (localhost:3000).

---

## EVIDENCIA (casual-test.js → casual-evidence.json; evidencia-post.js)

### 1. Separación de colas y guard "aleatorio"

| Test | Resultado |
|---|---|
| Casual en mundo `aleatorio` (todas las ciudades) | **RECHAZADO**: `casual no admite todas las ciudades — siempre es duelo simple` |
| A busca Ranked `numeria`, B busca Casual `numeria`, simultáneos 10 s | Sin cruce: ambos `timeout`. Cola: A `clasificatorio=true`, B `clasificatorio=false`. Cancelación limpia (`cola_tras_cancelacion=0`) |

### 2. Duelo casual real (2 humanos) — ELO intocado

- Duelo creado: `modo=simple, mundo=numeria, clasificatorio=false, ronda_numero=1, estado=pendiente`.
- `duel_results` 2 filas; `estado → completado`, `ganador_id = A`.
- **ELO antes/después (service_role): A 800→800, B 800→800 → diff 0**.  
  `registrar_resultado_duelo` retorna en el guard `if not clasificatorio` (`0072_elo_k_factor_por_rango.sql:134-141`) ANTES del bloque ELO (l.143-153) y del update de perfiles.
- `mis_stats_casual`: A `1V-0D`, B `0V-1D` (stats separadas existen y funcionan).
- El historial se lee de la misma tabla `duels` (cualquier vista los lista), o sea las stats
  V/D/T de `MaCompetitivo` los cuentan (ver BUG #3).

### 3. Duelo casual NO entra a ranked ni a rangos

- `0119_filtro_ranking_usuarios_permanentes.sql` (vista ranking) filtra `not es_bot` y `not is_anonymous`,
  y `0109_mundo_historia.sql:286` + guard Platino `0109:513-515: if p_ranked`. El ELO tampoco se toca
  en casual (evidencia anterior). Sin puntos/Chispas de ranked se generan.
- `rutasInvitado.ts:15` + `rankeds/page.tsx` bloquean `/rankeds` para anónimos → el flujo casual
  anónimo es opcional y, cuando se usa autenticado, no pide ELO.

---

## BUGS PROBADOS

### BUG #1 — Rebirth del lado pasivo + match duplicado (race de búsqueda)
- **PROBLEMA**: con 2 usuarios entrando en simultáneo, el poll del cliente llama primero
  `buscar_rival_duelo` y recién después chequea si quedó como retado
  (`RankedsClient.tsx:476-535`). Cuando un lado matchea, borra AMBAS filas de `duel_queue`
  (`0109_mundo_historia.sql` cleanup correlacionado); el lado pasivo en su próximo poll vuelve a
  **insertar su fila (rebirth fantasma)** y puede golpear rutas de bot o crear duelo duplicado.
- **EVIDENCIA**: la corrida de 2 humanos creó **3 duelos**: 1 real (`5ae1084c`, completado),
  **1 fantasma humano-vs-humano pendiente para siempre** (`3b9e2a8d`, B→A, `estado=pendiente`)
  y **1 vs bot** (`5cbcfb37`, B→bot, `estado=pendiente`). El test de rebirth dejó al lado pasivo
  con fila en la cola (`rebirth_en_cola:true`) después de haber sido matcheado.
- Las filas fantasma solo se limpian si el dueño consulta `mis_duelos_pendientes` (`0051:34-38`),
  que no pasa en estos flujos → duelos "pendientes" que nunca se juegan.
- **CAUSA**: orden del poll (buscar → fallback) + fallback con `.eq("ronda_numero", 1)` que NO
  encuentra duelos `mode=simple` (ronda_numero NULL).
- **FIX APLICADO** (client): `RankedsClient.tsx` — el chequeo "ya matcheado" se hace ANTES de
  `buscar_rival_duelo` y la query cubre `ronda_numero.is.null,1` + `clasificatorio = modo`.
- **PROPAGACIÓN RANKED**: el mismo race aplica a ranked (mismo código). Fix client-side resuelve
  la causa raíz para ambas familias sin cambiar SQL.

### BUG #2 — Casual matchea BOTS → duelos fantasma insalvables
- **PROBLEMA**: el fallback de bot (v_segundos >= 30) en `buscar_rival_duelo` NO está condicionado
  a `p_ranked` (`0109_mundo_historia.sql:552-560`): un jugador casual esperando >30 s puede
  matchear un bot pese a que Casual es "solo humanos".
- **EVIDENCIA**: `5cbcfb37` B(anon) vs `f571ffe0` = **"Doble Hélix", `es_bot:true`** — pendiente
  para siempre (nadie registra resultado del lado bot). El otro duelo bot (`b2a38023`, sección
  rendirse) quedó `abandonado` con `ganador_id = bot`.
- **IMPACTO**: duelos pendientes fantasma en "mis duelos", bots "comprando" espera, y en el turno
  de rigurosa UX: una partida contra un bot que nunca juega.
- **FIX**: NO aplicado (cambia comportamiento de matchmaking compartido). Documentado para la
  familia de migraciones; la corrección server es: replicar el guard `if p_ranked then` sobre el
  bloque bot (`if not p_ranked then skip fallback bot`).

### BUG #3 — Stats V/D/T de la pantalla Rankeds cuentan duelos casuales
- **PROBLEMA**: `RankedsClient.tsx:280-283` (`MiCompetitivo`) calcula `jugados/victorias/derrotas/`
  `tasaVictorias` sobre TODOS los duels del historial, sin filtrar `clasificatorio`. Un jugador que
  hace muchas casuales ve inflar su "tasa de victoria" competitiva (la lista sí muestra badge
  "CASUAL" por duelo, l.344, inconsistente con el resumen).
- **EVIDENCIA**: el duelo casual quedó visible en el historial del usuario (`historial_raw_A`) y
  cuenta en la tabla `duels` común. La UI ya distingue `h.clasificatorio` en la lista.
- **FIX APLICADO** (client): filtrar `historialCompetitivo = historial.filter(h => h.clasificatorio)`
  antes de computar V/D/tasa. `statsCasual` ya se muestra aparte (l.311-318).

### BUG #4 — Logros "duelos_ganados" y "racha_duelos_ganados" cuentan casuales
- **PROBLEMA**: `src/lib/logros/verificar.ts:95-101` (duelos_ganados) y `:116-128`
  (racha_duelos_ganados) consultan `duels` SIN filtrar `clasificatorio → logros competitivos
  (primera victoria, racha) pueden desbloquearse con solo jugar casual.
- **FIX APLICADO** (client): `.eq("clasificatorio", true)` en ambas consultas. Otros logros
  (rangos/kills) leen ELO o tablas ranked, ya estaban aislados.

### BUG #5 — Doble resolución en `registrar_resultado_duelo` (feed duplicado)
- **PROBLEMA**: `registrar_resultado_duelo` (`0072`) NO verifica el estado del duelo: si un
  participante re-envía su resultado (`on conflict do update` l.78-84 + resolución l.104-159),
  vuelve a recorrer el bloque de feed (l.126-132) y, en ranked, volvería a aplicar el delta ELO
  (l.150-153). No hay guard tipo `if v_duel.estado in ('completado','abandonado')`.
- **EVIDENCIA**: resubmit de B (perdedor) tras resolución → `resuelto:true` de nuevo y **2
  `feed_posts` `resultado_duelo` para el mismo duelo/ganador A** (aunque `duel_results` mantuvo
  2 filas y stats NO se duplicaron). En ranked el mismo camino duplicaría ELO.
- **FIX**: NO aplicado en esta auditoría (función compartida con ranked; requiere migración).
  Recomendación: guard al inicio — `if v_duel.estado <> 'pendiente' return existing state`.
- (No logro se desbloqueó para anónimos: `user_achievements` vacío — el camino real de logros se
  dispara por trigger en usuarios normales; BUG #4 sigue siendo correcto para el flujo completo.)

## VERIFICACIÓN DE E2E EXTRAS

- Re-entry del mismo usuario: 1 sola fila en cola, `entered_at` NO se resetea (segundos siguen
  sumando; `r2.segundos_esperando=2`), cancel limpia.
- Heartbeat stale: fila con `last_seen_at` de hace 5 min se borra en el próximo `buscar_rival_duelo`
  (`stale_cleanup antes:1 → despues:0`).
- `rendirse_duelo` casual: `estado=abandonado`, `ganador_id=otro`, **ELO diff 0**, stats intactas.
  (En la corrida el rival fue un bot — ver BUG #2.)
- Duelo casual simple queda visible en el historial del usuario (informativo; BUG #3 ya corregido).
- Guard de `auth.uid()`/participación en registrar_resultado con ajeno: `no autorizado` (074 / 07x).
- Realtime (`NotificacionesDuelo`) saltea anónimos (l.37) — limita el aviso "te retaron" para
  usuarios anónimos en cola; documentado, no corregido (UX de la modalidad casual anónima).

---

## ARCHIVOS MODIFICADOS

- `src/app/[locale]/rankeds/RankedsClient.tsx` — Fix BUG #1 (poll: chequeo pasivo primero + query
  `ronda null|1` + `clasificatorio = modo`) y Fix BUG #3 (stats V/D/tasa solo clasificatorios).
- `src/lib/logros/verificar.ts` — Fix BUG #4 (filtro `clasificatorio = true` en duelos_ganados y
  racha_duelos_ganados).

## ARCHIVOS NO MODIFICADOS (pendiente de decisión)

- Migraciones `0050` (origen casual), `0072` (resultado), `0073` (K-factor), `0088` (rendirse),
  `0109` (buscar_rival_duelo vigente), `0051` (cleanup pendientes), `0058` (heartbeat): BUG #2 y
  BUG #5 requieren SQL. Propuestas documentadas, NO aplicadas (fuera de alcance: no tocar family
  ranked/shared; pendiente coordinación de migración).

## VERIFICACIÓN

- `npx tsc --noEmit` ✅ 0 errores.
- `npx eslint` sobre ambos archivos tocados ✅ 0 issues.
- `npm test` ✅ 126/126 (10 archivos).
- E2E real (2 anon, Chromium, dev server): ver sección EVIDENCIA + `casual-evidence.json`.

## SIGUIENTES PASOS

1. Migración (0120+) para guard de estado en `registrar_resultado_duelo` (BUG #5, impacta feed + ELO).
2. Migración para condicionar el fallback de bot a `p_ranked = true` (BUG #2).
3. Evaluar aviso de reto para anónimos (NotificacionesDuelo l.37) o bloquear anónimos de la cola
   casual con mensajería clara.
4. Cleanup de duelos fantasma pendientes en producción (query señalada en evidencia).