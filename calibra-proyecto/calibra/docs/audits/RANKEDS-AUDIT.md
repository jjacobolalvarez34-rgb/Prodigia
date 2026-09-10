# RANKEDS-AUDIT — Rankeds (ELO, matchmaking, ranking) y Clanes

- **Fecha:** 2026-09-09 · Fase F7 · orchestrator + matchmaking + social/backend
- **Alcance:** módulo Rankeds (duelos clasificatorios, ELO, matchmaking, serie mejor-de-3, ranking visible, guards) y módulo Clanes (membresías/roles, nivel de clan, misiones semanales, guerra semanal, chat, estandarte/imagen, mundo de clanes con mapa y ciudad).
- **Método:** verificación por código (TSX/TS, rutas API, migraciones SQL `0001`–`0128`) e inventarios de auditorías previas (F2 RLS, T8/T9/T10, F4 marketing, F5 tienda, F6 progresión). Evidencias con `file:line`.
- **Restricción:** este entorno no tiene acceso a la DB real ni a navegador ⇒ nada de esto se probó contra runtime; los estados `BLOQUEADO-POR-DB` quedan señalados y su SQL propuesto documentado (no se generan migraciones nuevas).
- **Última migración analizada:** `0128_espanol_neutro.sql`.

## 1. Resumen ejecutivo

| Módulo | Veredicto |
|---|---|
| Rankeds | **VERIFICADO POR CÓDIGO.** End-to-end server-authoritative (matchmaking en RPC, ELO en SQL, serie, ranking con filtros anti-anónimos). UI autorizada solo desde nivel de cuenta 5 y con los 8 mundos consistentes con el server. |
| Clanes | **VERIFICADO POR CÓDIGO.** Las 5 features (membresías/roles, nivel, misiones, guerra, chat/estandarte/mapa) están presentes en SQL + cliente. Los gaps conocidos son de i18n/voz (documentados), no funcionales. |
| Cierres aplicados | **1 cierre riesgo-cero:** `Mundo`/`MundoDuelo` en `database.ts` alineados a los 8 mundos (eran 2 y 3). Sin importadores ⇒ sin riesgo. |
| Bloqueos | S5/S9 (seguridad, requieren DB/edge) y fix de bots en casual (BUG#2 de T8, requiere migración y base). |

Estados usados: `VERIFICADO POR CÓDIGO` / `IMPLMENTADO` / `REAL (E2E)` / `BLOQUEADO-POR-DB` / `PROPUESTA`.

## 2. Rankeds

### 2.1 Acceso y guards
- `src/app/[locale]/rankeds/page.tsx` aplica `requireUsuario` + `bloquearInvitado` + `requireNivelCuentaRankeds` (guard.ts). Umbral = **nivel de cuenta 5**: `NIVEL_CUENTA_MINIMO_RANKEDS = 5` (`src/lib/auth/guard.ts:184`, chequeo en `:187`).
- `src/app/[locale]/rankeds-bloqueado/page.tsx` muestra el nivel faltante (`rankeds-bloqueado/page.tsx:28,39`). Coincide con `REQUIREMENTS-CHECKLIST.md:116` y con el cierre F6 (um).
- Duelos por vía de amigos/invitación también pasan por guard de sesión (`bloquearInvitado`).

### 2.2 ELO y rangos
- ELO inicial por defecto **800** (`perfil.elo_rating`; la UI lee `profile.elo_rating ?? 800` en `RankedsClient.tsx`).
- **6 rangos Bronce → Prodigio**, con paridad TS ≡ SQL verificada del valor en esta ronda:
  - `RANGOS_ELO` (`src/types/database.ts:262-269`): bronce 0 / plata 900 / oro 1100 / platino 1300 / diamante 1500 / prodigio 1700.
  - SQL `rango_de_elo` (`0043:117-130`): mismas cotas (prodigio ≥1700, diamante ≥1500, platino ≥1300, oro ≥1100, plata ≥900, bronce resto).
- **K-factor por rango** (`0072`) y **ELO simétrico ×1.5 en series** (`0073`); consumidos por `registrar_resultado_duelo` (0072/0109) desde `/api/duelos/resultado`.

### 2.3 Matchmaking
- Función operativa: **`buscar_rival_duelo` recreada en `0109`** (vectores: `v_mundos` con los **8 mundos**, guard `'mundo invalido'`, guard `casual no admite todas las ciudades — siempre es duelo solo con "todas las ciudades"` en `0109:507-508`, guard **Platino+** en el modo ranked que exige "todas las ciudades" — refuerza `0078`).
- **Ventana progresiva de ELO** ±15 → ±120 (migraciones `0031`, `0038`, `0043`, `0066`).
- Poll del cliente cada ~3 s con tope `MAX_SEGUNDOS_BUSQUEDA = 60` (`RankedsClient.tsx:383`, uso en `:533`).
- **Casual separado del ELO** (`0050`: `mis_stats_casual`, el duelo casual no toca `elo_rating`) y verificado E2E en `docs/audits/CASUAL-AUDIT-2026-09-08.md` (ELO 800→800 con 2 jugadores).
- **8 mundos consistentes:** la UI ofrece 8 en `SelectorMundoDuelo`, el server acepta los mismos 8 (`src/lib/duelos/rutas.ts:3` ≡ `0109`). La hipótesis "la UI ofrece mundos que el server rechaza" quedo **DESCARTADA** (el guard `'mundo invalido'` es solo red de seguridad).
- **Bots de respaldo:** fallback >30 s con bots; **BUG#2 de T8** = ese fallback no está condicionado a `p_ranked` (`0109:552-560`) ⇒ un casual también podría toparse con bots → requiere migración; BLOQUEADO-POR-DB (se aplica solo con base, ver `CASUAL-AUDIT-2026-09-08.md`).

### 2.4 Serie mejor-de-3
- `estado_serie_duelo` con `mi_puntaje` (`0071`, re-creada en `0074`) y `rival_puntaje` (`0094`, drop+create en cadena).
- `finalizar_serie_si_correspondes` + ruta `/api/duelos/finalizar-serie`; K×1.5 en series (`0073`).
- `SerieDueloClient.tsx` render de rondas, "esperando rival" y cierre de serie con ΔELO; `TagClanDeBots` discreto cuando el rival es bot de clan.

### 2.5 Rechazo, rendición y abandono
- `rechazar_duelo` (`0047`): borra en cascada y **cancela la serie completa** (no solo la ronda actual).
- `rendirse_duelo` + `reclamar_victoria_por_abandono` (`0088`): `duels_estado_check` gana `'abandonado'`, columna `abandonado_por`, y el reclamo es presence-driven (cliente reporta/verifica). Rutas API: `/api/duelos/rendirse` y `/api/duelos/reclamar-abandono`.

### 2.6 Ranking visible
- `RankingElo.tsx`: podio 🥇🥈🥉 + buscador por nombre; las posiciones salen de `indexOf` sobre la lista **sin** filtrar (correcto).
- Rankings ELO **filtran usuarios permanentes** (`0119`: no anónimos/no bots/display_name/email) y **`es_cuenta_prueba`** (`0126`) ⇒ "ranking justo" (familia `ranking_elo_global` y líder semanal en `leaderboard`).

### 2.7 Duelos y progreso (XP / guerra de clanes)
- Los duelos **solo** tocan ELO y la verificación de logros/títulos: `/api/duelos/resultado` → `registrar_resultado_duelo` + `verificarLogros`/`verificarTitulos`; `/api/duelos/finalizar-serie` igual.
- **No escriben `daily_progress` ni otorgan XP/Chispas** ⇒ **los duelos NO aportan a la guerra ni a la misión semanal de clanes** (que solo cuentan XP de práctica diaria vía `registrar_xp_diario`). Es comportamiento por diseño (ver D-02).

### 2.8 i18n
- `RankedsClient.tsx` y `RankingElo.tsx` usan **100% `t()`** (namespace `Rankeds`, 43 claves con paridad es/en 100% verificada en F3).
- `SerieDueloClient.tsx`: textos **hardcodeados en español** (fuera del namespace). Hueco conocido → i18n gap documentado (D-03); no se traduce en esta ronda (scope de cierres riesgo-cero).

## 3. Clanes

### 3.1 Estructura y roles (`0068_clanes_reales.sql`)
- `clanes`: `clanes_tipo_check` ('bots'/'jugadores'), `owner_id` (fundador), `tag` de 2-5 caracteres, `color_estandarte`, índice único de nombre **solo entre clanes de jugadores**.
- `clan_membresias`: roles **fundador / guía / miembro** fluyen por entidad.
- `0069` = fixes de `mi_clan()`; `0070` re-crea `miembros_de_clan` (`0070:468`), `rival_de_clan` (`0070:575`), `procesar_cierre_semana_clanes` (`0070:614`, grant `:645`); `0100:81` habilita `xp_requerido_nivel_clan` al cliente.
- Las tablas **no tienen grants** para `authenticated` (solo RPC security definer/autorizadas): el acceso al clan es por RPC validado (patrón del resto del proyecto) y no por DML directo.

### 3.2 Crear / unirse / salir (`ClanesClient.tsx`)
- Costo de creación **5.000 Chispas**: `COSTO_CREAR_CLAN = 5000` (`ClanesClient.tsx:17`), validación en `:456-457`, copy y botón en `:519` y `:561-563`.
- Flujos vía RPC (`crear_clan`, unirse/salir con límites y capacidades que valida el server). `salir_del_clan` conserva mensajes neutros (0128 no lo necesitó).

### 3.3 Nivel de clan y XP
- `xp_requerido_nivel_clan = floor(4000 · niv^1.9)` **sin cap** (`0070:64`), grant al cliente en `0100:81`.
- Panel MiClan consulta `xp_requerido_nivel_clan(nivel_clan)` y `(nivel_clan+1)` para la barra de progreso (`ClanesClient.tsx`).
- La XP del clan llega indirectamente por `registrar_xp_diario` (práctica diaria); **duelos no** (ver §2.7).

### 3.4 Misiones semanales
- `clan_misiones` + `asegurar_mision_semanal` (`0068:307`) — **sin cron**: se dispara al abrir la página de clanes (comentario de intención en `0070:603`; `clanes/page.tsx` la llama lazy). `mision_actual_de_clan` (`0068:324`) para leer la vigente. Recompensa en Chispas **server-side**.
- `ClanesClient.tsx` muestra misiones con su recompensa y la del rival de la guerra.

### 3.5 Guerra semanal
- `rival_de_clan` (`0070:575`) asigna el clan rival de la semana; `procesar_cierre_semana_clanes` (`0070:614`) concilia el cierre (lazy desde `clanes/page.tsx:20`). La UI muestra el rival + ranking semanal del clan (`ClanesClient.tsx`).

### 3.6 Chat de clan
- `0092_chat_de_clan.sql` (tabla + rate-limit + `reportar_mensaje_clan`) y `0100_fix_chat_clan_y_progreso_nivel.sql` (fix + grants). Push nativo vía edge `notify-clan-mensaje`.
- `ChatDeClan.tsx`: `Broadcast` para lo realtime, **3 "redes"** (últimos 3 días, tope 100 mensajes), `toLocaleTimeString("es-AR")` fijo (matiz de i18n), `ReportarBoton` reutilizado.

### 3.7 Estandarte e imagen
- `EstandarteClan.tsx`: SVG por tier según `nivel_clan` (1-3 / 4-7 / 8-10), con override por `imagen_clan_url`.
- `0084_imagen_clan.sql`: bucket `clanes` (2 MB), `actualizar_imagen_clan` (solo fundador) y `mapa_clanes` re-creada (`0084:127`). `SubirImagenClan.tsx` valida tipo/tamaño y sube al bucket.

### 3.8 Mundo de clanes (mapa + ciudad)
- `0076_mundo_clanes.sql`: `mapa_clanes` (`0076:57`) y parcela del mundo. `MundoClanesMapa.tsx`: grid **6 × 168 × 128** con pan/zoom (umbral de arrastre 6 px).
- `tierCiudad.ts`: **Asentamiento/Aldea/Ciudad/Metrópolis/Prodigio** por miembros con casa (1/3/6/11/21).
- `EscenaCiudad.tsx`: casas por `MiembroCasa` con hash determinístico, PNGs `/clan_rangos/{1..5}.png` y 3 animaciones CSS.

### 3.9 i18n
- Páginas y componentes de clanes **100% hardcodeados en español** (`clanes/page.tsx` metadata, `mundo/page.tsx` "Hacé click" en la leyenda del mapa, `ClanesClient.tsx`, chat, estandarte, mapa, ciudad). I18N-AUDIT ya las lista como pantallas 100% españolas.
- **Voz mezclada** dentro del mismo componente: `"Tenés {misChispas} Chispas"` (`ClanesClient.tsx:561`) junto a `"...cuesta 5000 (tienes {misChispas})."` (`:457`, neutro). No se normalizan en F7 (fuera de alcance; F3 dejó el SQL y es.json neutros, el resto es decisión de i18n real — ver D-04).

## 4. Cruce con REQUIREMENTS-CHECKLIST

Ítems propios de esta fase (13-28) — **sin cambios de estado**, con evidencia adicional F7:

| # | Requisito | Estado (checklist) | Refuerzo F7 |
|---|---|---|---|
| 13 | Rankeds clasificatorio con ELO | IMPLEMENTADO | `guard.ts:184`, `0109`, `/api/duelos/*` |
| 14 | 6 rangos ELO | IMPLEMENTADO | TS `database.ts:262-269` ≡ SQL `0043:117-130` (cotejado) |
| 15 | K-factor por rango y simétrico en series | IMPLEMENTADO | `0072`, `0073` |
| 16 | Matchmaking ventana progresiva ±15→±120 | IMPLEMENTADO | `0031/0038/0043/0066` + `0109` operativa |
| 17 | Anti-smurf Platino+ "todas las ciudades" | IMPLEMENTADO | `0078` + re-confirmado `0109:504-508` |
| 18 | Casual separado del ELO | REAL | `0050` + E2E (CASUAL-AUDIT) |
| 19-22 | Fantasma, progreso en vivo, link, reto a amigo | IMPLEMENTADO | `0028`, `0038`, `0059/0096/0109`, rutas amigos (T9/T10) |
| 23 | Rechazar/rendirse/reclamar abandono | IMPLEMENTADO | `0047`, `0088` (estado `'abandonado'` + `abandonado_por`) |
| 24 | Clanes: roles, tag, estandarte | IMPLEMENTADO | `0068`, `0069`, `0070` |
| 25 | Misiones semanales + Chispas | IMPLEMENTADO | `0068:307,324` (lazy, sin cron) |
| 26 | Guerra semanal + cierre | IMPLEMENTADO | `0070:575,614` |
| 27 | Nivel de clan + XP | IMPLEMENTADO | `0070:64`, `0100:81` |
| 28 | Chat con rate-limit y push | IMPLEMENTADO | `0092`, `0100`, edge `notify-clan-mensaje` |

## 5. Hallazgos de esta ronda

- **D-01 (CERRADO):** tipos stale en `src/types/database.ts` — `Mundo` con 2 mundos (`:38`) y `MundoDuelo` con 3 (`:328`) frente a los 8 reales (`src/lib/duelos/rutas.ts:3`, `src/lib/mundos.ts:19-28`, `0109`). **Ningún archivo los importa** (grep de `@/types/database` sin hits). Se alinearon a los 8 mundos. Cierra el pendiente 5 de `REQUIREMENTS-CHECKLIST.md`.
- **D-02 (por diseño, documentado):** los duels (rankeds y casuales) no escriben `daily_progress` ni otorgan XP/Chispas ⇒ no aportan a guerra/misión semanal de clanes. No es un bug.
- **D-03 (hueco i18n):** `SerieDueloClient.tsx` está fuera del namespace `Rankeds` y es 100% hardcodeado en español; I18N-AUDIT no lo detectó porque solo escaneó las páginas de rankeds, no este componente de serie.
- **D-04 (decisión):** voz mixta en Clanes ("Tenés" `:561` vs "tienes" `:457`; "Hacé click" en `mundo/page.tsx`) y textos 100% españoles. Traducir toda la pantalla excede el scope de cierres riesgo-cero → se documenta (I18N-AUDIT ya lista clanes como 100% español).
- **D-05 (P0#4 TECH-DEBT):** "matchmaking casual mezcla con ranked / usa ELO". Verificado: el casual **no** toca ELO (`0050` + E2E), pero el **fallback de bots >30 s no está condicionado a `p_ranked`** (`0109:552-560`) ⇒ puede mandar un casual contra un bot. Fix requiere migración y base → BLOQUEADO-POR-DB.
- **D-06 (hipótesis descartada):** la UI y el server coinciden en los 8 mundos; no hay divergencia "UI ↔ server" de mundos.
- **D-07 (doc drift, CERRADO):** `REQUIREMENTS-CHECKLIST.md` resumía 50 items pero la matriz tiene 65 filas y usa la categoría "ELIMINADO POR DISEÑO" fuera del legend → reseccionado el resumen/legend en esta ronda (ver siguiente sección).

## 6. Bloqueados por falta de DB / runtime

- **S5 — `resolver_apuesta_si_activa`:** un cliente con la `p_precision` "verdaderamente correcta" gana siempre la apuesta "doble o nada" (documentado en F2 `docs/audits/AUDIT-RLS-SEGURIDAD-2026-09-07.md`; función re-creada de forma resiliente en `0121`). Fix = derivar la precisión de la DB (como `0120` hizo con XP), **no** parchear a ciegas. Sin acceso a la base no se puede validar → BLOQUEADO-POR-DB, sin migración nueva en esta fase.
- **S9 — edge functions sin verificación de llamada:** requiere tocar `supabase/functions/*` + config, no se pruebe aquí → BLOQUEADO-POR-DB/config.
- **E2E runtime** de los flujos rankeds/clanes (reto de amigo/duelo, guerra semanal, chat realtime con 2 jugadores): requiere browser con 2 cuentas → PENDIENTE usuario (tunnel).

## 7. Estados finales

| Área | Estado |
|---|---|
| Rankeds (guards, ELO, matchmaking, serie, ranking) | VERIFICADO POR CÓDIGO |
| Duelos casuales | REAL (E2E previo) + BLOQUEADO-POR-DB para el fix de bots (BUG#2) |
| Clanes (membresías, nivel, misiones, guerra, chat, estandarte, mapa/ciudad) | VERIFICADO POR CÓDIGO |
| i18n Rankeds | VERIFICADO (43/43 es/en) — SerieDueloClient hueco documentado |
| i18n Clanes | Documentado (pantallas 100% español, decisión) |
| Tipos `Mundo`/`MundoDuelo` | CERRADO (alineados a 8) |
| S5 / S9 | BLOQUEADO-POR-DB |
| Runtime / tunnel | PENDIENTE usuario |

## 8. Verificación de esta ronda

- Cambios de código TS: **solo `src/types/database.ts`** (tipos, sin lógica).
- `npx tsc --noEmit` · `npx eslint src/types/database.ts` · `npx vitest run` → resultados al final del CIERRE F7 en `docs/agent-work/ACTIVE.md` y `docs/PROGRESO.md`.
- Cero migraciones nuevas en esta fase. Los pendientes de migración siguen siendo los ya documentados (`0117→0128` + los que decida PO por S5/S9).