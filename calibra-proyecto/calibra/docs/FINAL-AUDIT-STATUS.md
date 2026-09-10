# FINAL-AUDIT-STATUS — Auditoría de cierre del proyecto Prodigia

> Fecha: 2026-09-09 · Ronda de cierre de la tanda 2026-09-07 → 2026-09-09.
> Método: SOLO LECTURA de `docs/` + inventario de `supabase/migrations/`, `docs/audits/` y `docs/marketing/`. No se modificó código, no se corrieron migraciones, no se tocó ninguna base. Toda afirmación cita evidencia `archivo:línea` (docs) o una migración concreta. Estados válidos: CONFIRMADO / VERIFICADO POR CÓDIGO / VERIFICADO EN BROWSER / VERIFICADO EN TEST / VERIFICADO EN DB / BLOQUEADO / PENDIENTE / PROPUESTA / IMPLEMENTADO.
> Lingüística: español neutro latinoamericano.
> Límites declarados de este entorno: sin acceso a la base/DB real (Las migraciones 0115-0127 no pudieron ejecutarse ni validarse contra Postgres) y sin navegador interactivo del usuario (el tunnel es del usuario; Playwright headless sí estuvo disponible el 2026-09-08 para capturas).

---

## Resumen por área (tabla maestra)

| Área | Estado general | Evidencia | Pendiente |
|---|---|---|---|
| Seguridad / RLS | VERIFICADO POR CÓDIGO; fixes pendientes de aplicar | S6/S7/S10 en `0115`; S0-S4/S8 en `0120`; S5/S9 abiertos (`docs/audits/MASTER-AUDIT.md:30-37`) | Aplicar `0115` y `0120` a prod; repro y fix de S5/S9 |
| Economía / Tienda / Trastienda | VERIFICADO POR CÓDIGO (cortes 1 y 2 + limpieza + ruleta casino) | `0121`-`0127` con cliente completo; vitest hasta 147/147 (`docs/PROGRESO.md:3716`) | Aplicar `0121`→`0127` en orden + NOTIFY y retestear en browser |
| Onboarding / mundos | VERIFICADO POR CÓDIGO; verificación en vivo pendiente | `0116` + guard/pickers; `0117` curva de nivel (`docs/PROGRESO.md:3437-3487`) | Aplicar `0116`/`0117`; retest del flujo de 2 mundos por tunnel |
| Duelos / Casual / Ranked | VERIFICADO EN BROWSER (casual y reto directo); 2 bugs requieren migración | E2E 2 cuentas QA (`docs/audits/CASUAL-AUDIT-2026-09-08.md`, `RETO-DIRECTO-AMIGO-2026-09-08.md`) | BUG#2/#5 casuales (migración), clasificatorio de invitación, expiración de `duel_invites` |
| i18n / idioma | VERIFICADO POR CÓDIGO (auditoría); fixes NO implementados | `docs/audits/I18N-AUDIT.md` — 89 hallazgos (12 críticos), paridad `en/es` al 100% (`I18N-AUDIT.md:27`) | Migrar ~75 archivos a `@/i18n/navigation`; i18n de Auth/Clanes/Retos/SEO |
| Marketing / Producto | VERIFICADO (código + browser headless); 16 docs + 4 piezas reales | `docs/marketing/README.md:6-8`, `assets/piezas/README.md:9-12` | Piezas eje oscuro (BLOQUEADO: requiere capturas dark reales), live research de competencia |
| PWA / App | VERIFICADO POR CÓDIGO (build); instalación en dispositivo BLOQUEADO | `app/manifest.ts`, `public/sw.js`, `RegistrarServiceWorker.tsx` (`docs/PROGRESO.md` sección PWA; `docs/PROJECT-STATE.md:17-21`) | Verificar instalación real en dispositivo; pendiente Capacitor/push (MASTER-AUDIT: mobile PENDIENTE) |

---

## Detalle por área

### Seguridad / RLS

Estado: **VERIFICADO POR CÓDIGO** con correcciones escritas y **PENDIENTE de aplicar a prod**. Única familia de hallazgos abierta: S5 y S9, ambos **BLOQUEADOS** para repro en vivo (sin DB real).

- **S10 CRÍTICO** — `acreditar_chispas(p_user_id, p_monto)` aceptaba montos/usuarios arbitrarios → CORREGIDO en `0115_cerrar_huecos_seguridad_fase5.sql` (guard `auth.uid()` + revoke a public/authenticated; uso interno inmutable) (`docs/agent-work/ACTIVE.md:82`, `docs/audits/MASTER-AUDIT.md:30`).
- **S6 MEDIO** — `handle_new_user` sin `set search_path = public` → CORREGIDO en `0115` (`MASTER-AUDIT.md:36`).
- **S7 MEDIO** — policy de friendships INSERT permitía `estado='aceptada'` → CORREGIDO en `0115` (`MASTER-AUDIT.md:37`).
- **S0/S1/S2/S3/S4/S8** — el "grifo infinito" (xp/chispas/nivel fabricables verbatim + policies amplias) → CORREGIDO en `0120_cerrar_s0_s1.sql`: drop de 5 policies amplias, helpers de derivación (`xp_real_por_mundo`), RPC `insertar_intento`/`insertar_intento_logica` security definer; `/api/attempts` y `/api/logic-attempts` migradas a esos RPC (`ACTIVE.md:111-117`, `MASTER-AUDIT.md:31-33`, `docs/PROGRESO.md:3566-3610`). Verificación: `tsc 0 · vitest 126/126 · eslint 0` en las 2 rutas (`ACTIVE.md:117`).
- **S5 ALTO** — `resolver_apuesta_si_activa(p_precision)` → apuesta siempre ganada. **BLOQUEADO** (requiere base real para repro) (`MASTER-AUDIT.md:34`, `ACTIVE.md:38`). Nota: `0121` la recrea con guards `to_regclass` solo para el fix de "Algo salió mal" (HIPÓTESIS 42P01); no clausura S5.
- **S9 BAJO** — edge functions públicas sin verificación de JWT/firma. **PENDIENTE** (`MASTER-AUDIT.md:35`).
- **Estados de verificación del frente**: fixes en SQL puro, no tocan TS → la verificación es por lectura/espejo (`ACTIVE.md:83`). La **reproducción en vivo queda pendiente del PO** tras aplicar `0115`/`0116`/`0120` (bloqueador documentado en `PROJECT-STATE.md:78`).

### Economía / Tienda / Trastienda

Estado: **VERIFICADO POR CÓDIGO** — diseño (T2/T3), corte visual, cortes de economía 1 y 2, limpieza y ruleta casino implementados; el SQL server-authoritative **no se validó contra una base real** (`ACTIVE.md:262`).

- **Moneda**: mismas Chispas (decisión PO 2026-09-08; las "fichas" son representación visual) (`ACTIVE.md:178`).
- **Identidad visual** "sótano del Bazar": tokens `--tt-*`, sala siempre oscura, caja fuerte, emblema candado, copy es/en — VERIFICADO POR CÓDIGO, `tsc 0 · eslint · vitest 126/126`; verificación visual en browser PENDIENTE del usuario (`DECISIONS.md:26-38`, `ACTIVE.md:229-231`).
- **`0121` corte 1** (ruleta, volado, pizarra, historial + fix resiliente doble o nada): `vitest 132/132` (6 tests de ruleta: probabilidades, ángulos, gradient, aguja, EV, escudo) · build limpio con las 4 rutas · paridad i18n 47/47 (`ACTIVE.md:239-243`, `DECISIONS.md:43-51`).
- **`0122` fix Pizarra** (`v_del_dia integer → v_pizarra_id uuid`) + diagnóstico PGRST202 (caché de esquema PostgREST) + `NOTIFY pgrst, 'reload schema'` para todos los módulos (`ACTIVE.md:255`).
- **`0123` M1/M2/M3** (apuestas a partidas ajenas con límites 10/día y 500/día, predicción de ranking semanal con self-heal, títulos de Trastienda reales) y **`0124` minijuegos** (La Calcu con AST server-side, Acertijos, El Reloj): `vitest 132/132 · build 245 páginas`; SQL sin validar contra la base (`ACTIVE.md:257-262`).
- **`0126` limpieza**: `es_cuenta_prueba` (marca `qa%`), `ventana_predicciones()` server-authoritative, mesa paginada, **drop de Acertijos/El Reloj** (decisión de producto), español normalizado sin voseo en los `raise exception` y en `es.json`/`respuestaError.ts`. `vitest 139/139 · build 243 páginas` (`ACTIVE.md:268-273`, header de `0126`).
- **`0127` ruleta casino** (tabla periódica de 118 elementos, EV casa 0.88, fichas 100-1000, límite 20/día, premio raro ~5%): diseño aprobado por PO; `tsc 0 · eslint 0 · vitest 147/147 (13 archivos) · build 244 páginas` (`PROGRESO.md:3702-3721`, `ACTIVE.md:279-285`).
- **Frente de riesgo económico pendiente**: S5 (apuesta con `p_precision` del cliente) sigue abierto (`MASTER-AUDIT.md:34`); la ruleta clásica (`ruleta.ts` legacy, `/api/trastienda/girar-ruleta`) quedó sin uso pero intacta (`ACTIVE.md:285`).

### Onboarding / mundos

Estado: **VERIFICADO POR CÓDIGO** + repro en vivo del PO para el bug P0; verificación de navegador **PENDIENTE**.

- **P0 "2 mundos"** — reproducido EN VIVO por el usuario (tunnel): "ya elegiste tus dos mundos iniciales" trabado + solo "numeria" activo. Causa raíz: estado heredado `['numeria']` + `elegir_mundos_iniciales` rechazando arrays no vacíos (0112:124) + guard que solo mandaba a onboarding con 0 mundos (`PROGRESO.md:3444-3458`).
- **Fix**: `0116_fix_elegir_dos_mundos.sql` (cardinalidad 1 → self-heal; bloqueo solo con `>= 2`; revoke de `elegir_mundo_inicial(text)` legacy), `guard.ts` (`< 2`), `onboarding/page.tsx` (`>= 2`), pickers navegan a home ante el error (`PROGRESO.md:3462-3475`, `PROJECT-STATE.md:48`). Verificación: `tsc 0 · eslint 0 · vitest 110/110 · build 0`. **PENDIENTE**: aplicar `0116` y retestear por tunnel (`ACTIVE.md:135`).
- **Niveles de mundo (T4)** — curva vieja 50% "dominio nivel 10" inalcanzable → fix `0117_curva_nivel_mundo.sql` (volumen 34% techo 25000 + dominio 45% + lecciones 21%; 800 problemas ⇒ nivel ~54; farm clavado en ~36) + `src/lib/practica/worldLevel.ts` + tests. VERIFICADO POR CÓDIGO (`tsc 0 · vitest 126/126`); **PENDIENTE aplicar `0117`** (`ACTIVE.md:180-186`).

### Duelos / Casual / Ranked

Estado: **VERIFICADO EN BROWSER** para casual y reto directo (E2E con cuentas QA/cuentas anónimas reales); quedan 2 bugs de casual documentados para migración y 2 decisiones de producto de invitación por link.

- **T8 Casual** — CONFIRMADO por E2E real (2 sesiones anónimas Chromium): no toca ELO (800→800), no cruza cola ranked, stats separadas (`mis_stats_casual`) (`ACTIVE.md:200-208`). BUG#1 (re-birth fantasma), BUG#3 (stats) y BUG#4 (logros) **CORREGIDOS en cliente** (`RankedsClient.tsx`, `src/lib/logros/verificar.ts`). BUG#2 (casual matchea bots, fallback >30s no condicionado a `p_ranked` — `0109:552-560`) y BUG#5 (doble resolución → feed/ELO duplicado, sin guard de estado) **DOCUMENTADOS para migración**. Cleanup de duelos fantasma en prod: **PENDIENTE** (`MASTER-AUDIT.md:39-43`).
- **T9 Invitación por link** — bug real corregido (Quimia ofrecía 5 modos vs 3 de `crear_invitacion_duelo` → link inválido); fix aditivo `QUIMIA_MODOS_INVITACION`. Hallazgos sin fix: link es `clasificatorio=true` pese al comentario "casual" (discrepancia producto/código → decisión PO) y `duel_invites` sin expiración (`MASTER-AUDIT.md:43`, `PROJECT-STATE.md:53`).
- **T10 Reto directo a amigo** — REPRODUCIDO con 2 cuentas QA reales (2 bugs: suscripción realtime jamás creada al entrar por navegación cliente desde /login; toast hardcodeado a Numeria) → fix en `NotificacionesDuelo.tsx` (`onAuthStateChange` + `hrefDuelo`) → **VERIFICADO EN BROWSER** con Numeria y Geografía (`PROGRESO.md:3490-3515`, `PROJECT-STATE.md:52`).
- **Verificación de la tanda**: `tsc 0 · vitest 126/126 · build 234 rutas · lint solo 4 errores preexistentes` (`PROGRESO.md:3559-3562`).

### i18n / idioma

Estado: **VERIFICADO POR CÓDIGO** (auditoría 2026-09-09, modelo es/es; fixes NO implementados — ronda de estudio).

- Paridad `en.json`/`es.json` al 100% (300 claves por namespace, 0 huérfanas, 0 placeholders rotos) (`docs/audits/I18N-AUDIT.md:27,36-58`).
- **89 hallazgos** (12 CRÍTICA, 28 ALTA, 35 MEDIA, 14 BAJA): ~75 archivos usan `next/navigation`/`next/link` en vez de `@/i18n/navigation` → rutas sin prefijo de locale; Login/Registro/Ajustes/Retos/Clanes 100% hardcodeados en español; títulos SEO hardcodeados en ~15 páginas; 40 títulos de logros y nombres de modos en `src/lib/` sin i18n; edge functions envían pushes en español (`I18N-AUDIT.md:13-25`).
- **Top bugs de cambio de idioma**: `router.push("/login")` sin prefix; términos/privacidad 100% hardcodeados (`I18N-AUDIT.md:29-32`).
- **PENDIENTE**: implementación de los fixes; el trabajo de Trastienda de 2026-09-09 ya mantiene paridad es/en (47 claves corte 1; espejos verificados por script) (`ACTIVE.md:242,284`).

### Marketing / Producto

Estado: **VERIFICADO** (código + browser headless Playwright); eje claro producido, eje oscuro **BLOQUEADO**.

- 16 docs en `docs/marketing/` (README, BRAND, PRODUCT-MESSAGING, AUDIENCE, COMPETITIVE-RESEARCH, CONTENT-STRATEGY, AD-CONCEPTS, SOCIAL-CONTENT, VIDEO-CONCEPTS, VISUAL-ASSETS, SCREENSHOTS, PROMPTS-IMAGES, PROMPTS-VIDEO, CAMPAIGNS, COPY-LIBRARY, FUNNEL) + `REAL-APP-2026-09-08.md` (30 capturas reales en `assets/pantallas-reales/`) (`docs/marketing/README.md:6-8`).
- PRODUCT-MESSAGING: todo diferencial citado con evidencia; únicos claims con matiz HIPÓTESIS: "ejercicios infinitos" en Historia/Química orgánica (bancos finitos) (`PRODUCT-MESSAGING.md:31`), COMPETITIVE-RESEARCH es hipótesis (`ACTIVE.md:76`).
- **Piezas publicitarias reales (eje claro)**: 4 PNG renderizados (1080×1080 ×3 + 1200×630) con HTML editable + script `scripts/piezas-reales.mjs` en `docs/marketing/assets/piezas/` (`assets/piezas/README.md:3-12`, `ACTIVE.md:34`).
- **BLOQUEADO — eje oscuro**: faltan capturas reales del dark mode (requiere tunnel del usuario); pendientes `pieza-oscura-8-mundos-square` y `pieza-oscura-numeria-sprint-story` (`assets/piezas/README.md:27-32`, `ACTIVE.md:35`).
- BRAND verificado contra código real (paleta, tipografías, colores por mundo) (`docs/marketing/BRAND.md:3`).

### PWA / App

Estado: **VERIFICADO POR CÓDIGO** (build de producción limpio); instalación real en dispositivo **BLOQUEADO** (sin dispositivo en el entorno).

- Instalable sin offline completo: `src/app/manifest.ts`, PNG reales (`public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`), `public/sw.js` angosto (cache-first solo `/_next/static/*` + ícono; no intercepta HTML/API/Supabase), `RegistrarServiceWorker.tsx` (`docs/PROGRESO.md` sección PWA; `docs/PROJECT-STATE.md:17-21`).
- Verificado por `next build` en su tanda (68 rutas) y en las tandas siguientes (234 → 245 → 243 → 244 páginas). Instalación real en Android/iOS: **BLOQUEADO**.
- Capacitor 8 + push notifications en stack (`PROJECT-STATE.md:19`) y **auditoría PENDIENTE** (dominio mobile-capacitor en `MASTER-AUDIT.md:24`).

---

## Migraciones 0115-0127 (una línea cada una)

| Migración | Qué hace | Estado en prod |
|---|---|---|
| `0115_cerrar_huecos_seguridad_fase5.sql` | Cierra S6 (`search_path` en `handle_new_user`), S7 (friendships solo `estado='pendiente'`), S10 (`acreditar_chispas` con guard `auth.uid()` + revoke). Deja S0-S5/S8 documentados | **PENDIENTE** de aplicar (`PROJECT-STATE.md:36`) |
| `0116_fix_elegir_dos_mundos.sql` | Self-heal de cuentas con 1 mundo heredado → cardinalidad 2; bloquea solo con `>= 2`; revoke de `elegir_mundo_inicial(text)` legacy | **PENDIENTE** de aplicar (`ACTIVE.md:135`) |
| `0117_curva_nivel_mundo.sql` | Nueva curva de nivel de mundo (34% volumen / 45% dominio / 21% lecciones) redefiniendo `registrar_progreso_mundo` | **PENDIENTE** de aplicar (`ACTIVE.md:186`) |
| `0118_niveles_cuenta_recompensas.sql` | Escalera de XP por tramos (200→2400) + `nivel_desde_xp_cuenta` + recompensa `50·n+250` | **APLICADA** por el PO (`MASTER-AUDIT.md:46`, `ACTIVE.md:195`) |
| `0119_filtro_ranking_usuarios_permanentes.sql` | Ranking solo para usuarios permanentes (no anónimo, no bot, `display_name` no vacío, email confirmado); endurece `ranking_semanal()` + revoke. Simulación 14→9 filas con 0 legítimos perdidos (`USER-RANKING-AUDIT.md:53`) | **PENDIENTE** de aplicar (`PROJECT-STATE.md:42`) |
| `0120_cerrar_s0_s1.sql` | Cierra familia S0/S1/S2/S3/S4/S8: deriva XP/puntos de la base, policies amplias a solo-SELECT, RPC `insertar_intento`/`insertar_intento_logica` | **PENDIENTE** de aplicar (`PROJECT-STATE.md:43`) |
| `0121_trastienda_economia.sql` | Corte 1 Trastienda: tablas ruleta/volado/pizarra + RPCs + `fetch_trastienda_historial` + fix resiliente del doble o nada | **PENDIENTE** de aplicar (`ACTIVE.md:243`) |
| `0122_arreglo_pizarra.sql` | Fix `v_del_dia integer → v_pizarra_id uuid` de La Pizarra + re-grant + incluido `NOTIFY pgrst, 'reload schema'` (PGRST202) | **PENDIENTE** de aplicar (`ACTIVE.md:255`) |
| `0123_trastienda_mecanicas_123.sql` | M1 apuestas a duelos ajenos (límites 10/día, 500/día), M2 predicción de ranking semanal (self-heal, buckets), M3 títulos de Trastienda reales | **PENDIENTE** de aplicar (`ACTIVE.md:262`) |
| `0124_trastienda_minijuegos.sql` | La Calcu (AST JSONB server-side), Acertijos de Enigmia, El Reloj (sesión sin grants); rachas por iteración | **PENDIENTE** de aplicar (`ACTIVE.md:262`) — luego eliminados por `0126` |
| `0125_recalcular_niveles_mundo_y_saneo.sql` | Recalcula niveles de mundo con la curva vigente (0117/0120) en los 8 mundos + saneo de `xp_historico_total`/Chispas negativas | **PENDIENTE** de aplicar (`PROGRESO.md:3720`) |
| `0126_trastienda_limpieza.sql` | `es_cuenta_prueba` (marca `qa%`) fuera de rankings/mesas, `ventana_predicciones()` server, mesa paginada, drop de Acertijos/El Reloj, español normalizado; `NOTIFY pgrst` incluido | **PENDIENTE** de aplicar (`ACTIVE.md:273`) |
| `0127_trastienda_ruleta_casino.sql` | Mesa casino de la tabla periódica (118 elementos), `apostar_casino_elementos` server-authoritative, `fetch_trastienda_historial` con tipo `casino`; `NOTIFY pgrst` incluido | **PENDIENTE** de aplicar (`ACTIVE.md:285`) |

### Nota de orden / consistencia

- `0118` figura como APLICADA aunque la cadena documentada la tomaba después de `0115`/`0116`/`0117` (el propio header pide "correr después de 0117"). Al aplicar el resto conviene confirmar que `0115` (guard de `acreditar_chispas`) y `0117` estén en la base, porque `0118` redefine `acreditar_chispas` con el bonus variable y asume esa base.
- Orden recomendado de aplicación (documentado): `0115` → `0116` → `0117` → `0119` → `0120` → `0121` → `0122` → `0123` → `0124` → `0125` → `0126` → `0127`, y **al final de la tanda correr** `NOTIFY pgrst, 'reload schema';` (incluido además en las propias `0122`/`0123`/`0125`/`0126`/`0127`). Sin ese reload, todo RPC nuevo responde PGRST202 → "Algo salió mal" (`ACTIVE.md:255`).

---

## Bloqueos de este entorno (2026-09-09)

- **Sin acceso a la base real** → ningún SQL de `0115`-`0127` (salvo `0118` aplicada por el PO) pudo validarse contra Postgres; la reproducción de S5 (`resolver_apuesta_si_activa`) y la confirmación de la HIPÓTESIS 42P01 del doble o nada siguen **BLOQUEADAS** (`PROJECT-STATE.md:78`, `DECISIONS.md:48`).
- **Sin navegador interactivo / tunnel del usuario** → verificación en vivo pendiente (flujo 2 mundos, reto diario/semanal en browser, doble o nada, módulos de Trastienda, piezas del eje oscuro, instalación PWA en dispositivo) (`ACTIVE.md:57,135,243`, `assets/piezas/README.md:27`). Playwright headless SÍ estuvo disponible el 2026-09-08 (capturas de marketing, E2E casual/reto directo) (`PROJECT-STATE.md:79`).
- **Sin git CLI** → no hubo commits; todo el trabajo queda en el working tree (`TECH-DEBT.md:21`, `PROJECT-STATE.md:77`).
- **Sin dashboard de Supabase** → Auth URLs/SMTP/rate-limit config, publicación `supabase_realtime`, secrets de edge functions y la app de push quedan del lado del PO (Caja A de `docs/DIAGNOSTICO.md:10-14`).
- **PGRST202 (caché de esquema PostgREST)** → requiere `NOTIFY pgrst, 'reload schema';` que solo puede ejecutar quien tenga acceso al proyecto (el PO) (`ACTIVE.md:255`).

---

## Deuda técnica priorizada (top 5)

1. **Aplicar las migraciones de seguridad no aplicadas — `0115` y `0120`** (con `0116`/`0117`/`0119` como prerequisitos documentados). Mientras `0120` no corra, el "grifo infinito" de XP/Chispas/nivel (S0/S1/S2/S3/S4/S8) sigue abierto en producción. Referencia: `docs/TECH-DEBT.md:6-11`, `docs/audits/MASTER-AUDIT.md:31-33`.
2. **Cerrar S5 (apuesta siempre ganada) y S9 (edge functions sin verificación de JWT)** — única familia de seguridad sin fix. Requiere repro contra base real (BLOQUEADO desde este entorno). Referencia: `docs/audits/MASTER-AUDIT.md:34-35`.
3. **Migraciones BUG#2/BUG#5 de casual + decisiones de invitación por link** (fallback de bots no condicionado a `p_ranked` `0109:552-560`; doble resolución de `registrar_resultado_duelo`; `clasificatorio=true` vs "casual"; expiración de `duel_invites`; cleanup de duelos fantasma). Referencia: `docs/audits/MASTER-AUDIT.md:40-43`, `docs/audits/CASUAL-AUDIT-2026-09-08.md`, `docs/audits/INVITACION-LINK-AUDIT-2026-09-08.md`.
4. **i18n: 89 hallazgos (12 críticos, 28 altos)** — ~75 archivos con `next/navigation` en vez de `@/i18n/navigation` (rutas sin prefijo de locale), Auth/Clanes/Retos/SEO hardcodeados, edge functions en español. La paridad `es/en` ya es 100% (código listo para migrar). Referencia: `docs/audits/I18N-AUDIT.md:13-32`.
5. **Operatividad de Trastienda en prod + implementaciones diferidas** — aplicar `0121`→`0127` con su `NOTIFY` (sin eso, PGRST202); luego pendientes de producto: T7 animación de level up (spec lista, falta finish route + overlay `docs/audits/LEVEL-UP-ANIMACION-2026-09-08.md`), M1 para rankeds/reto_semanal, ruleta vertical P4, y documentación desactualizada (`ESPECIFICACION.md` 5 vs 8 mundos, `MECANICA.md` v1, `README.md` raíz). Referencia: `docs/TECH-DEBT.md:13-17,28`.

---

*Auditoría de solo lectura generada el 2026-09-09. Fuentes primarias: `docs/agent-work/ACTIVE.md`, `docs/PROGRESO.md` (secciones 2026-09-08/09), `docs/PROJECT-STATE.md`, `docs/TECH-DEBT.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/DIAGNOSTICO.md`, `docs/audits/MASTER-AUDIT.md` y `supabase/migrations/0115-0127`.*