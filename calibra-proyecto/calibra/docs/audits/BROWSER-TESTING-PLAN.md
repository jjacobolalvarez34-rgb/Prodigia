# BROWSER-TESTING-PLAN — F9: Plan de verificación por navegador

- Fecha: 2026-09-09
- Fase (mega-sprint): **F9 — Browser testing: plan + documentación**
- Autor: orchestrator (autónomo, sin acceso DB/browser/tunnel)
- Fuentes: auditorías F0–F8 (`docs/audits/*.md`), `docs/FINAL-AUDIT-STATUS.md`, `docs/agent-work/ACTIVE.md`, `docs/PROGRESO.md`, verificación de código/migraciones en vivo (2026-09-09).

---

## 0. Resumen ejecutivo

Este documento consolida **todos los pendientes de verificación por navegador** que quedaron sin retestear en F0–F8 (entorno sin tunnel/DB/browser), los ordena **por flujo de usuario** y les asigna estado + fuente `file:line` (o migración).

Regla de oro (AGENTS.md y consigna de la fase): **nada inventado**. Todo "resultado esperado" tiene fuente verificada en código, migración o test; lo que no es verificable desde este entorno se marca con su estado y el motivo.

**Números:** **9 flujos** · **55 ítems** de verificación de navegador.

| Estado primario | Ítems |
|---|---|
| VERIFICADO EN CÓDIGO | 47 |
| VERIFICADO CON TEST | 1 (casino 0127: suite vitest) |
| PROPUESTA (decisión pendiente) | 1 (título `gniñardo`, 0123) |
| PENDIENTE-USUARIO (requiere tunnel/browser) | 4 (landing visual, invitado-bloqueado visual, capturas dark, instalación PWA) |
| BLOQUEADO-POR-DB (requiere migración + datos) | 2 (bots en casual `0109:550-562`, cierre guerra semanal clanes `0070:614`) |
| **Total** | **55** |

Estado complementario en celdas: `+ PENDIENTE-USUARIO` (visual/browser) o `+ PROPUESTA` (decisión de producto).

---

## 1. Estados usados y cómo leer este plan

| Estado | Significado |
|---|---|
| `VERIFICADO EN CÓDIGO` | El código ya determina el resultado esperado (con `file:line` o migración). No requiere DB/browser salvo confirmación visual. |
| `VERIFICADO CON TEST` | Cubierto por suite automatizada (`npm test` = vitest: 13 files / 147 OK). |
| `VERIFICADO EN DB` | Solo confirmable con la base real aplicada (migraciones `[APPLY-FIRST]`). Ninguno pudo marcarse así en esta fase (sin acceso DB). |
| `PROPUESTA` | Cambio de producto/UI opcional o decisión pendiente (PO ausente). |
| `BLOQUEADO` / `BLOQUEADO-POR-DB` | No ejecutable hoy; requiere migración, datos o decisión. |
| `PENDIENTE-USUARIO` | El paso en browser lo hace el humano (tunnel). |
| `NO PUEDO VERIFICAR` | Sin fuente ni forma de confirmar desde este entorno. (**0 ítems**: todos tienen fuente.) |

Convenciones: cada paso indica **URL → acción → resultado esperado**. Los pasos marcados `· DB` dependen de aplicar antes `[APPLY-FIRST]`. Los `· 2 cuentas` requieren probar con dos sesiones.

---

## 2. Orden recomendado de ejecución (para el usuario)

1. **Aplicar `0116 → … → 0128` en orden** (`[APPLY-FIRST]`, §3) + `NOTIFY pgrst, 'reload schema';` al final. Sin esto, la mayoría de los flujos falla (PGRST202) o usa curva/limpieza viejas.
2. **Verificar/crear cuentas QA** (`[QA-ENV]`, §4): `node scripts/crear-usuario-qa.mjs` y `QA_SLOT=2 node scripts/crear-usuario-qa.mjs`. Comprobar que el `display_name` empieza por `qa` → `es_cuenta_prueba=true` (0126) y que quedan fuera de rankings/mesas.
3. **Levantar tunnel** (`npm run dev` + tunnel). Retestear **por flujo A → I** (§7). A–C son secuenciales (onboarding antes de jugar); D–I en cualquier orden (1–2 cuentas).
4. **No bloqueantes:** D8 y F7 (`BLOQUEADO-POR-DB`) requieren migración/decisión aparte — ver cada ítem.
5. **Opcional marketing:** con tunnel, capturar el dark mode real y correr `node scripts/piezas-reales.mjs` para completar `docs/marketing/assets/pantallas-oscuras/` (PENDIENTE de F4, ítem H4).

---

## 3. [APPLY-FIRST] — Migraciones requeridas antes de testear

Desde este entorno no hay acceso DB y **no está confirmada** la aplicación de ninguna de estas migraciones en producción (los CIERRES F3–F8 las dejan PENDIENTE usuario). El plan asume que se aplican **en orden numérico** `0116 → 0128`. Sin ellas, los flujos fallan con PGRST202 (objeto no encontrado: RPC/columnas nuevas) o con comportamiento viejo (curvas 0070, sin `es_cuenta_prueba`, sin mesa casino).

| Migración | Qué habilita (relevante para browser test) |
|---|---|
| `0116_fix_elegir_dos_mundos` | El guard que exige ≥2 mundos desbloqueados al entrar (`src/lib/auth/guard.ts:37-39`) deja de romper el onboarding. |
| `0117_curva_nivel_mundo` | `registrar_progreso_mundo` (curva 34/45/21) — necesario para el resumen de práctica (A6/A7). |
| `0118_niveles_cuenta_recompensas` | Escalera de cuenta (200/300/550/900/1400/1900/2400) + recompensa `50·n+250` — resumen "subiste de nivel" (A7) y gate de rankeds (D1). |
| `0119_filtro_ranking_usuarios_permanentes` | Rankeds/ranking excluyen anónimos — clave para G3 (ranking). |
| `0120_cerrar_s0_s1` | Cierre de S0/S1 (ver FINAL-AUDIT-STATUS) — prerequisito de D. |
| `0121_trastienda_economia` | Economía de Trastienda base (ver STORE-ECONOMY-AUDIT M1/M2). |
| `0122_arreglo_pizarra` | Pizarra mult-arreglada + NOTIFY (l.79) — usada en C. |
| `0123_trastienda_mecanicas_123` | Duelos de Trastienda (límites 10/500), mult ajustados, títulos 8/9 (falta `gniñardo`). NOTIFY l.913. |
| `0124_trastienda_minijuegos` | Minijuegos de Trastienda (ver STORE-ECONOMY M5). |
| `0125_recalcular_niveles_mundo_y_saneo` | Recálculo en lote de niveles de mundo + `greatest(...)` que concilia curvas. NOTIFY l.330. |
| `0126_trastienda_limpieza` | `profiles.es_cuenta_prueba` (ilike 'qa%', l.30-33) + exclusiones en rankings/mesas; oráculo `ventana_predicciones`; mesa paginada; drop de Acertijos/El Reloj. NOTIFY l.889. |
| `0127_trastienda_ruleta_casino` | Mesa casino (tabla periódica 118 elementos, fichas 100/250/500/1000, límite 20/día, payout 0.88, premio raro ~5%). NOTIFY l.512. |
| `0128_espanol_neutro` | 9 RPC con mensajes de error en neutro (raise exception). Sin NOTIFY (solo funciones). |

**Comando final (lo aplica el usuario):** los archivos `0116–0128` vía `supabase db push` (o tool equivalente) y luego solo una vez:

```sql
NOTIFY pgrst, 'reload schema';
```

Los `notify pgrst` ya embebidos al final de `0122:79`, `0123:913`, `0125:330`, `0126:889`, `0127:512` cubren el reload al aplicarlos; el NOTIFY extra es por las migraciones que no lo traen (`0121`, `0124`, `0128`).

---

## 4. [QA-ENV] — Datos y cuenta de prueba necesarios

Para los flujos que requieren jugar (B, D, E, F, G) se usan las **cuentas QA** que F0 creó con los scripts existentes:

- `scripts/crear-usuario-qa.mjs` → cuenta principal (slot 1). Segunda cuenta: `QA_SLOT=2 node scripts/crear-usuario-qa.mjs`.
- Las credenciales quedan en `.env.test.local` (verificado: existe) bajo `QA_EMAIL`, `QA_PASSWORD`, `QA_USER_ID` (por slot). No se vuelca contenido del archivo (secretos).
- `scripts/login-qa.mjs` genera la cookie de sesión Supabase (`sb-…-auth-token`) sin navegador — útil para peticiones SSR de checkeo; en el plan los pasos de UI se hacen con el browser.
- **Regla de visibilidad (0126):** todo `display_name` que empieza con `qa` recibe `es_cuenta_prueba=true` en `profiles` (automático, `0126:32-33`) y queda **excluido** de rankeds (`ranking_elo_global`, `ranking_semanal…`), trastienda (`fetch_apuestas_disponibles`) y posiciones de predicción. Para ver "ranking con gente real" hay que probar con una cuenta no-QA (o un usuario normal registrado ad hoc).

Casos de prueba a preparar (verificables con los scripts, sin browser):
- `1.c` Verificar que el perfil `qa…` aparece con `es_cuenta_prueba=true` (SQL: `select display_name, es_cuenta_prueba from profiles where display_name ilike 'qa%'`).
- `2.c` Verificar `posicion_ranking_puntos`/`ranking_semanal…` no devuelven filas `es_cuenta_prueba` (SQL directo tras aplicar 0126).
- `3.c` Verificar los 118 elementos y EV por zona (tests `casino.ts` ya cubren en TS; en DB: `select count(*) from trastienda_casino_elementos`).

---

## 5. [TUNNEL-ONLY] — Ítems que solo pueden verificarse en browser

Sin tunnel no hay dev server accesible y sin navegador no hay render; desde este entorno ninguno de estos pasos pudo ejecutarse. Son los que quedan a cargo del usuario:

| Ítem | Por qué solo browser |
|---|---|
| A1 Landing como visitante | Render del flujo `VisitanteLanding` + tour interactivo (`localStorage` `CONOCE`, `VisitanteLanding.tsx:20-66`). |
| A7 Animación level-up + monto de bonus | Overlay/audio solo en runtime; el monto exacto del bonus sigue PROPUESTA (no expuesto por SQL). |
| B5 Página invitado-bloqueado | Visual + botón de convertir cuenta (`invitado-bloqueado/page.tsx:56`). |
| E4 Feed social (si se activa) | Decisión de producto PROPUESTA (`DUELOS-AUDIT` §2.4). |
| F5 Chat de clan realtime | Requiere 2 sesiones simultáneas con tunnel (edge function + rate-limit). |
| G3 Ranking semanal con usuarios reales | Requiere datos reales (linterna tuyos o de otros) + filtros 0119/0126 aplicados. |
| H4 Capturas reales del dark mode | Necesita tunnel + navegador + captura; pendiente desde F4. |
| I3 Instalación PWA | Requiere Chrome + tunnel (HTTPS) + manifest servido. |

Los ítems de los flujos marcados `· DB` dependen además de las migraciones (§3), pero la verificación **visual** final siempre es tunnel.

---

## 6. Pirámide de verificación (qué cae en cada capa)

Para los 55 ítems, la evidencia se distribuye en 3 capas. Nota: **no hay e2e real** en el repo (ver §8); la capa "código" es estática/unit, no browser.

| Capa | Qué cubre | Ítems (conteo) |
|---|---|---|
| **1 · Código estático / unit (verificado por el agente)** | Guardas, lógica, UI wiring, curvas, constantes. Source `file:line`. | 48 (47 VERIFICADO EN CÓDIGO + 1 VERIFICADO CON TEST) |
| **2 · DB / RPC / RLS (tras `[APPLY-FIRST]`)** | Comportamiento que el código delega al servidor: `elegir_mundos_iniciales`, limits 0123, oráculo 0126, casino 0127, filtros 0119/0126, cierre de guerra 0070, matchmaking 0109. Ninguno pudo marcarse `VERIFICADO EN DB` (sin base). | ~14 ítems dependen de esta capa (marcados `· DB` en §7) |
| **3 · Visual / navegador (tunnel, usuario)** | Render, animaciones, realtime, instalación, capturas. | 21 ítems con componente visual (ver §§5 y 7) |

---

## 7. Plan por flujo de usuario

### Flujo A — Invitado → onboarding → 2 mundos → práctica → sprint → resumen → nivel subido (7 ítems)

Flujo secuencial de entrada. Requiere DB (0116, 0118, 0125) para los pasos que graban.

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| A1 | `/` como visitante (sin sesión): ver landing CTA | Landing con CTA y flujo "conocé" visible; sin crash SSR/localStorage | VERIFICADO EN CÓDIGO · visual: PENDIENTE-USUARIO | `VisitanteLanding.tsx:20,49,66` (`localStorage` `CLAVE_CONOCE`) |
| A2 | Entrar a `/practica` sin sesión | Redirección a `/login?next=…` (nunca 500) | VERIFICADO EN CÓDIGO | `guard.ts:19` |
| A3 | Iniciar sesión con una cuenta nueva sin `display_name`, ir a `/` | Redirección a `/onboarding?next=…` | VERIFICADO EN CÓDIGO | `guard.ts:29`, `onboarding/page.tsx:21` |
| A4 | Pasos de onboarding: elegir **2 mundos** y continuar | Requiere ≥2 `mundos_desbloqueados`; si no, se queda/avisa (no entra al juego principal) — fix 0116 | VERIFICADO EN CÓDIGO · DB (RPC `elegir_mundos_iniciales`, 0128 neutro) | `guard.ts:37-39`; `FlujoElegirMundos.tsx:130`; `0116` |
| A5 | Primer acceso al mundo: diagnóstico (`/historia/diagnostico`, etc.) | Redirección al destino correcto tras el diagnóstico | VERIFICADO EN CÓDIGO | p.ej. `historia/diagnostico/page.tsx:23` (`redirect(next ?? "/historia")`); patrón igual en los 8 mundos |
| A6 | Sesión de práctica/sprint: responder bien/mal | Feedback inmediato con racha/combo (error levemente diferido 900 ms) | VERIFICADO EN CÓDIGO | `SprintRunner.tsx:31,199,298`; `useRachaCombo` |
| A7 | Terminar sprint → resumen | Muestra "subiste de nivel" de mundo (curva 34/45/21) y de cuenta si corresponde (`nivelCuenta` en finish); animación + monto del bonus = PENDIENTE | VERIFICADO EN CÓDIGO (wiring) · visual/animación: PENDIENTE-USUARIO · monto bonus: PROPUESTA | `worldLevel.ts:46-51`; `NivelCuentaSubio.tsx`; `api/practica/finish/route.ts` + `api/enigmia/finish/route.ts` (F6) |

### Flujo B — Login / Registro / Recuperar / Convertir cuenta (6 ítems)

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| B1 | `/login` con cuenta QA (email+password) | Sesión iniciada y vuelta al origen | VERIFICADO EN CÓDIGO | `LoginForm.tsx:42` (`signInWithPassword`) |
| B2 | `/registro` crear usuario nuevo | Redirección a `/onboarding` (display_name vacío) | VERIFICADO EN CÓDIGO | `registro/page.tsx:17`; `guard.ts:29` |
| B3 | `/recuperar` pedir reset | Correo con `redirectTo=/auth/callback?next=/auth/actualizar-password` | VERIFICADO EN CÓDIGO | `RecuperarForm.tsx:22` |
| B4 | Convertir cuenta anónima a email (desde perfil o invitado-bloqueado) | `updateUser` conservando lo jugado; botón solo si `is_anonymous` | VERIFICADO EN CÓDIGO | `ConvertirCuenta.tsx:32`; `perfil/page.tsx:248`; `invitado-bloqueado/page.tsx:56`; `FlujoElegirMundos.tsx:130` |
| B5 | `/invitado-bloqueado` (cuenta sin display_name / sin 2 mundos) | Página con candado + botón para convertir/continuar | PENDIENTE-USUARIO (visual; render verificable en código) | `invitado-bloqueado/page.tsx:8,23,33,46,56` |
| B6 | `/registro?ref=<userId>` desde un link de amigo | El nuevo usuario queda conectado como amigo con quien compartió el link | VERIFICADO EN CÓDIGO | `AmigosClient.tsx:299-316` |

### Flujo C — Tienda / Trastienda / Casino (7 ítems)

Requiere DB: 0121→0123→0124→0126→0127. Ver STORE-ECONOMY-AUDIT (auditoría completa).

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| C1 | `/tienda` (catálogo) | 24 ítems / 47.900 Chispas (sin paquete) con precios consistentes | VERIFICADO EN CÓDIGO · DB (precios) · visual: PENDIENTE-USUARIO | `docs/audits/STORE-ECONOMY-AUDIT.md` (catálogo T-01..T-04) · `src/lib/tienda/costos.ts:13` |
| C2 | `/tienda` → Trastienda → **Duelos** (apostar chispas) | Límites 10 / 500 respetados; cuotas = spec | VERIFICADO EN CÓDIGO | `0123` (mecánicas) + STORE-ECONOMY M1 |
| C3 | Trastienda → **Títulos** | 8 de 9 títulos; falta `gniñardo` (decisión) | VERIFICADO EN CÓDIGO (8/9) · `gniñardo`: PROPUESTA | STORE-ECONOMY M3 · `0123` |
| C4 | Trastienda → **Casino** (mesa de tabla periódica) | Fichas 100/250/500/1000, límite 20/día, payout ~0.88, premio raro ~5% | VERIFICADO CON TEST (suite `casino.test.ts`) · visual en vivo: PENDIENTE-USUARIO | `src/lib/trastienda/casino.ts` + `casino.test.ts` (147/147) |
| C5 | Trastienda → **Oráculo** (predicciones de ranking) | Ventana = server `current_date` (consistente, no desfasada por UTC del cliente) | VERIFICADO EN CÓDIGO · DB (RPC `ventana_predicciones`) | `0126` (0:…) · `src/app/api/trastienda/predicciones/route.ts` |
| C6 | Trastienda (lateral de juegos) | **No** aparecen Acertijos ni El Reloj (eliminados); solo La Calcu / mesa casino | VERIFICADO EN CÓDIGO | `0126` (drop + componentes borrados) · `src/components/trastienda/TrastiendaClient.tsx` |
| C7 | Trastienda → **Doble o nada** | Ocultable desde Ajustes ("Ocultar 'Doble o nada'") | VERIFICADO EN CÓDIGO | `AjustesClient.tsx:76` |

### Flujo D — Rankeds: clasificatoria + casual, mejor-de-3 (9 ítems)

Requiere DB: 0119, 0120, 0126 (filtros) y `0109` (matchmaking) ya aplicado. Ver RANKEDS-AUDIT.

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| D1 | `/rankeds` con cuenta de nivel < 5 | Página bloqueada `rankeds-bloqueado` (nivel 5 requerido) | VERIFICADO EN CÓDIGO | `guard.ts:184`; `rankeds-bloqueado/page.tsx` |
| D2 | Clasificatoria: buscar partida | Poll ~2.2 s hasta 60 s; si no hay rival o se supera el tiempo, mensaje/límite (y ver D8) | VERIFICADO EN CÓDIGO | `RankedsClient.tsx:382-383,533` (poll 2200 ms; `MAX_SEGUNDOS_BUSQUEDA=60`) |
| D3 | Toggle clasificatoria / casual | Modo casual separado (sin ELO, stats aparte) | VERIFICADO EN CÓDIGO | `RankedsClient.tsx:413` |
| D4 | Sel. de mundos: intentar "Todas las ciudades" en casual | No permitido (solo clasificatoria); Platino+ obliga "todas las ciudades" | VERIFICADO EN CÓDIGO · DB | `0109:504-508` + guard UI (`RankedsClient.tsx:427-438`) |
| D5 | Mejor-de-3: jugar 3 rondas | Serie con `ronda_numero`/`ronda_total` y badge de serie en pantalla de VS | VERIFICADO EN CÓDIGO | `0109:573-620`; `PantallaVS.tsx:39-43` |
| D6 | Rendirse en un duelo | Estado `'abandonado'` + `abandonado_por`; oponente puede reclamar victoria | VERIFICADO EN CÓDIGO | `0088` + `BotonRendirse` |
| D7 | Terminar un duelo casual | ELO sin cambios (el casual no toca ELO) | VERIFICADO EN CÓDIGO | `0050:243-249`; `0109` (casual `clasificatorio=false`) |
| D8 | Dejar >30 s sin rival en casual (o clasificatoria <1300) | Sin migración: puede caer contra **bot**; fix condicionado a `p_ranked` requiere migración nueva | BLOQUEADO-POR-DB | `0109:550-562` (D-05 / P0#4) |
| D9 | Buscar las cuentas QA en rankeds/ranking | **No aparecen**: filtro anónimos (0119) + `es_cuenta_prueba` (0126) | VERIFICADO EN CÓDIGO · DB (tras 0119+0126) | `0119`; `0126:70-71,113,216,272,298,332` |

### Flujo E — Duelos / Amigos / Feed / Retos (7 ítems)

Ver DUELOS-AUDIT (flujo casual) y USER-RANKING-AUDIT.

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| E1 | Duelo amistoso (desde rankeds o mundo): invitar a un amigo | Se arma duelo con `sub_tipo` correcto (host) y loop de espera | VERIFICADO EN CÓDIGO · 2 cuentas | `0109` (duels) · `duelo/invitacion/[inviteId]/page.tsx:45` |
| E2 | "Armar desafío" hacia un amigo | Se genera reto directo y se comparte por link | VERIFICADO EN CÓDIGO | `Feed.tsx:468` ("Armá un desafío") |
| E3 | Entrar por link de invitación a duelo | Mensaje "compárteselo" y redirección al duelo correspondiente | VERIFICADO EN CÓDIGO | `duelo/invitacion/[inviteId]/page.tsx:37,45` |
| E4 | `/social` con la UI actual | Feed social **desactivado** visualmente (solo amigos/social por tabs); activación = PROPUESTA (DUELOS-AUDIT §2.4) | VERIFICADO EN CÓDIGO (desactivado) · activación: PROPUESTA | `SocialClient.tsx:16-19` (con `social/page.tsx:26-40` cargando datos) |
| E5 | Amigos: enviar solicitud, aceptar | Alta/solicitud/aceptación y refresco de la lista | VERIFICADO EN CÓDIGO · 2 cuentas | `social/useAmigos.ts:88`; `AmigosClient.tsx` |
| E6 | `/reto-diario` | 5 preguntas de ciudades desbloqueadas, mismas para todos; 1 intento/día (`retos_diarios_completados`); progreso en `localStorage` con recupero por RPC | VERIFICADO EN CÓDIGO | `reto-diario/page.tsx:11,22,28,33`; `RetoClient.tsx:126-152`; `ranking_reto_diario` RPC |
| E7 | `/reto-semanal` | 45 preguntas, mismas para todos; progreso persistido por RPC | VERIFICADO EN CÓDIGO | `reto-semanal/page.tsx:11` |

### Flujo F — Clanes (7 ítems)

Ver RANKEDS-AUDIT (clanes) · requiere 2 cuentas + DB (0068-0070, 0084, 0092, 0100).

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| F1 | Crear clan | Costo 5000 Chispas; check de bots/jugadores; tag 2–5; roles fundador/guía/miembro | VERIFICADO EN CÓDIGO | `ClanesClient.tsx:17`; `0068` |
| F2 | Membresía/roles | Acciones según rol respetadas | VERIFICADO EN CÓDIGO · 2 cuentas | `0068` (roles) |
| F3 | Subir nivel del clan | XP = `floor(4000·niv^1.9)` sin cap | VERIFICADO EN CÓDIGO · DB (grants 0100:81) | `0070:64` + `0100:81` |
| F4 | Misiones semanales del clan | Se generan/y refrescan **lazy** (sin cron) al entrar desde `clanes/page.tsx` | VERIFICADO EN CÓDIGO | `0068:307,324` |
| F5 | Chat del clan (2 cuentas simultáneas) | Mensajes push con rate-limit; retención de notificaciones | VERIFICADO EN CÓDIGO · realtime: PENDIENTE-USUARIO | `0092`/`0100` + edge `notify-clan-mensaje` |
| F6 | Estandarte e imagen del clan + mapa | Subida solo fundador (bucket 2MB), tiers 1-3/4-7/8-10; mapa de ciudades tier 1/3/6/11/21 | VERIFICADO EN CÓDIGO · visual: PENDIENTE-USUARIO | `0084` (+`mapa_clanes` 0084:127); `0076:57` |
| F7 | Cierre de guerra semanal | `procesar_cierre_semana_clanes` ejecuta el cierre y actualiza rangos — **no ejecutable sin base + cron/manual** | BLOQUEADO-POR-DB (ver `0070:614`) · 2 cuentas | `0070:614` |

### Flujo G — Perfil / Ranking (5 ítems)

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| G1 | `/perfil` propia cuenta | Panel con avatar/títulos; botón de **convertir cuenta** si es anónimo | VERIFICADO EN CÓDIGO | `perfil/page.tsx:248` |
| G2 | `/perfil/<userId>` de otro | Redirección si el perfil no existe; perfil ajeno sin botones de edición | VERIFICADO EN CÓDIGO | `perfil/[userId]/page.tsx:54` |
| G3 | `/leaderboard` (ranking semanal) | Lista con podio + búsqueda; excluye anónimos (0119) y QAs (0126); los QAs no pueden verse a sí mismos acá | VERIFICADO EN CÓDIGO · DB (tras 0119+0126) | `leaderboard/page.tsx:30`; `0119`; `0126:70-71…` |
| G4 | Búsqueda por nombre en ranking | Filtra por `display_name` substring | VERIFICADO EN CÓDIGO | `ListaRanking.tsx:33` |
| G5 | Podio top-3 | 3 medallas + avatar/nombre con fuente | VERIFICADO EN CÓDIGO · visual: PENDIENTE-USUARIO | `Podio.tsx:73,75,135,160,183` |

### Flujo H — Dark mode / Ajustes de tema (4 ítems)

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| H1 | Toggle del tema (header/perfil) y recargar | `data-theme` en `documentElement` y persiste en `localStorage['prodigia-theme']` | VERIFICADO EN CÓDIGO | `ThemeToggle.tsx:10,15,28-29`; `ProfileMenu.tsx:15-19,62-63` |
| H2 | Navegar 2 páginas en dark | Tokens dark reales aplicados (`--tt-*`, fondo, texto) | VERIFICADO EN CÓDIGO · visual: PENDIENTE-USUARIO | `globals.css:47-56,79` |
| H3 | Meta `theme-color` en el `<head>` | `themeColor` en metadata acorde al theme | VERIFICADO EN CÓDIGO | `layout.tsx:112` |
| H4 | Captura real del dark mode (marketing, F4) | PNG en `docs/marketing/assets/pantallas-oscuras/` + correr `scripts/piezas-reales.mjs` | PENDIENTE-USUARIO (requiere tunnel) | F4 CIERRE (BLOQUEADO-con-plan) |

### Flujo I — PWA (3 ítems)

| # | URL → acción | Resultado esperado | Estado | Fuente |
|---|---|---|---|---|
| I1 | Ver `/manifest.webmanifest` | name "Prodigia", short_name, `display: standalone`, theme `#6C4CF1`, `start_url: "/"` | VERIFICADO EN CÓDIGO | `src/app/manifest.ts:23-29` |
| I2 | Íconos 192/512 (any + maskable) | Archivos existen (`public/icon-{192,512}[-maskable].png`, `icon.svg`); maskable con fondo plano | VERIFICADO EN CÓDIGO (archivos verificados) | `manifest.ts:30-36`; `public/icon-*.png` (existencia); PROGRESO (Grupo B, generación maskable) |
| I3 | Instalar la app (Chrome, lista blanca) | Prompt de instalación con los íconos maskable | PENDIENTE-USUARIO (requiere Chrome/tunnel) | `manifest.ts` (config) — instalación solo en browser |

---

## 8. Inventario de Playwright (estado real del repo)

Verificado en vivo el 2026-09-09:

- **No hay suite e2e.** No existe `playwright.config.*`, no existe carpeta `e2e/` ni directorio de tests de navegador, y **no está instalado `@playwright/test`** en `package.json`.
- `playwright` **`^1.62.1`** figura solo como `devDependencies` (paquete "library", no runner). Browsers descargados sí existen en `%LOCALAPPDATA%\ms-playwright` (`chromium-1234`, `chromium_headless_shell-1234`, `webkit-2336`).
- **Uso histórico ad-hoc:** `scripts/piezas-reales.mjs` hace `import { chromium } from "playwright"` y renderiza páginas **`file://`** de `docs/marketing/assets/piezas/*.html` (1080×1080, 1080×1920, 1200×630) para generar los PNG de la línea de marketing. No toca la app ni la DB.
- `scripts/crear-usuario-qa.mjs` y `scripts/login-qa.mjs` **no usan Playwright** (login-qa genera cookie vía Supabase).

Implicancias para el plan:
- El nivel "visual (browser)" se puede automatizar **si el usuario lo habilita**: `npm i -D @playwright/test` + `playwright.config.ts` con `webServer` de `npm run dev`. Hoy **no está** — por eso los ítems visuales quedan `PENDIENTE-USUARIO` y no prometo pasos de automatización.
- Las `file://` de `piezas-reales.mjs` corren sin DB (no se roza la app); ejecutables por cualquiera con `node scripts/piezas-reales.mjs`.
- Para reproducir RPC/RLS sin browser, la vía es SQL directo (ver §4) o los tests vitest ya existentes.

---

## 9. Qué NO pudo verificarse (y por qué)

| Ítem / grupo | Motivo |
|---|---|
| **Cualquier `VERIFICADO EN DB`** | No hay acceso a la base real; hay que aplicar `0116→0128` + `NOTIFY pgrst, 'reload schema';` (§3) para comprobar RPC/RLS/casino/limpieza. |
| **Todo render real en navegador** (flujos A–I, partes visuales) | No hay dev server en el puerto 3000 durante el relevamiento, no hay tunnel y no hay navegador interactivo instalado como herramienta del agente. Solamente podrían renderizarse vistas SSR con Playwright **una vez** que el usuario deje el tunnel arriba; hoy no hay config e2e (ver §8). |
| **Realtime / 2 cuentas** (D, E, F) | Duelos, chat de clan, guerra semanal y retos multi-cuenta requieren concurrencia real (tunnel + 2 sesiones) — inalcanzable desde este entorno. |
| **D8 bots en casual (`0109:550-562`)** | Requiere migración nueva (condicionar el fallback de bots a `p_ranked`); confirmado en código como pendiente desde F8/F7. **BLOQUEADO-POR-DB.** |
| **F7 cierre de guerra semanal (`0070:614`)** | Procedimiento de cierre semanal no se puede disparar sin la DB real y datos; **BLOQUEADO-POR-DB.** |
| **H4 capturas dark reales** | Requiere tunnel + captura manual; pendiente desde F4. |
| **Bonificaciones del casino/monto de bonus de nivel** | El monto exacto del bonus de nivel (`50·n+250`) no se expone al cliente (`acreditar_chispas` sin grant, `0115:102`); ver PROPUESTA en PROGRESION-AUDIT. |

Resumen: **0 ítems sin fuente** (ninguno cayó en `NO PUEDO VERIFICAR` por falta de fundamento); los 55 tienen `file:line` o migración. Lo que no pude **ejecutar** es la capa DB (12 migraciones sin aplicar) y la capa visual/realtime (sin tunnel/browser) — eso se transfiere al usuario como `PENDIENTE-USUARIO` / `BLOQUEADO-POR-DB`.

---

## 10. Referencias (auditorías fuente)

- `docs/FINAL-AUDIT-STATUS.md` — tabla maestra de pendientes por área.
- `docs/audits/REQUIREMENTS-CHECKLIST.md` — 65 requisitos (9 REAL / 50 IMPLEMENTADO / 3 PARCIAL / 2 CONCEPTO FUTURO / 1 ELIMINADO; última migración 0128).
- `docs/audits/MARKETING-AUDIT.md` (+ F4 CIERRE) — dark mode, demo/landing, capturas.
- `docs/audits/STORE-ECONOMY-AUDIT.md` — Tienda/Trastienda (catálogo, M1-M5, casino).
- `docs/audits/PROGRESION-AUDIT.md` — niveles mundo/cuenta, recompensas, animación level-up.
- `docs/audits/RANKEDS-AUDIT.md` — rankeds (ELO, matchmaking 0109, mejor-de-3) + clanes.
- `docs/audits/DUELOS-AUDIT.md` — duelo casual/feed social (activación PROPUESTA §2.4).
- `docs/audits/USER-RANKING-AUDIT.md` — 0119 filtro ranking.
- `docs/audits/I18N-AUDIT.md` — hardcodes/login/registro (F3 neutro).
- `docs/PROGRESO.md` (sesiones F0–F8) y `docs/agent-work/ACTIVE.md` (CIERRES con estado de cada fase).
- Migraciones `supabase/migrations/0116…0128` (ver §3).
- Scripts `scripts/{crear-usuario-qa,login-qa,piezas-reales}.mjs` y `.env.test.local` (QAs).