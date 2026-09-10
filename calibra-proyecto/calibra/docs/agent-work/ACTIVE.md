# ACTIVE — Sistema de claims

> Registro vivo. Agregar al final según `docs/agent-work/README.md` y `docs/AGENT-RULES.md` §3.
> Formato: `### CLAIM: <tarea> · <agente> · <fecha>` y `### CIERRE: <tarea> · <agente> · <fecha>`.

## Principios

- Un **claim** es quién está trabajando qué y qué áreas toca (para que ningún otro agente pise).
- Una lista de **tareas abiertas del proyecto** con estado, agente a cargo y evidencia.
- Al terminar una tarea: cerrar el claim y mover el item a `COMPLETADO` o `CANCELADO`.

---

## Tareas abiertas

| Estado | Tarea | Agente | Última actualización |
|---|---|---|---|
| COMPLETADO | P0 retos diario/semanal (loop useSyncExternalStore) | daily-weekly-challenges | 2026-09-07 |
| COMPLETADO | Línea marketing Fase 1: estudio real + 16 docs + primer paquete publicitario | marketing/orchestrator | 2026-09-07 |
| COMPLETADO | Fase C: auditoría RLS/seguridad | auth-security | 2026-09-07 |
| COMPLETADO | Fase D: repro + fix P0 bug 2 mundos (trabado + numeria sola) — repro EN VIVO con tunnel; fix 0116 + guard + pickers; verificación en vivo del usuario pendiente | onboarding-landing | 2026-09-08 |
| COMPLETADO | T1 Auditoría de usuarios y ranking (quién aparece; invitados/anon eliminados del ranking público) + fix | auth-security/backend-supabase/matchmaking | 2026-09-08 |
| COMPLETADO (diseño) | T2/T3 Trastienda: mecánicas (apuestas, ruleta, minijuegos, títulos) + economía controlada + diseño visual — DISEÑO listo, implementación pendiente de decisión | store-economy/visual-design/ux-ui/gameplay | 2026-09-08 |
| COMPLETADO | T4 Niveles de mundos: curva creciente (Numeria lvl 1 con ~800 resueltos) + simulación | gameplay/backend-supabase/educational-content | 2026-09-08 |
| COMPLETADO | T5+T6 Niveles personales (curva real) + recompensa por subir de nivel (economía analizada, NO 1000 a ciegas) | gameplay/backend-supabase/store-economy | 2026-09-08 |
| COMPLETADO (spec) | T7 Animación de level up (spec técnica+visual) — spec lista; falta implementar finish route + overlay | gameplay/visual-design/ux-ui | 2026-09-08 |
| COMPLETADO | T8 Causal: auditoría completa queue/heartbeat/races + evidencia de pruebas (BUG#1/#3/#4 fix, BUG#2/#5 documentados para migración) | matchmaking/backend-supabase/qa-e2e | 2026-09-08 |
| COMPLETADO | T9 Invitación por link: auditoría completa + fix Quimia (link roto) | social/frontend/backend/qa | 2026-09-08 |
| COMPLETADO | T10 Reto directo a amigo: REPRODUCIDO (2 bugs) → causa raíz → fix → e2e real con 2 cuentas QA | social/frontend/backend/qa | 2026-09-08 |
| PENDIENTE | Fase D: reproducir P0 reto diario/semanal | daily-weekly-challenges | — |
| COMPLETADO | Fase B: auditoría del mapa (rutas/RPC/migraciones 0001-0115) | repo-architect | 2026-09-07 |
| COMPLETADO | Cierre familia S0/S1/S2/S3/S4/S8 (RLS economía/progreso): migración 0120 + rutas a RPC security definer | auth-security | 2026-09-08 |
| COMPLETADO | Trastienda visual: identidad "sótano del Bazar" implementada (tokens --tt-*, caja fuerte, emblema candado, sala siempre oscura) sobre el doble o nada — mecánica intacta | orchestrator/visual-design | 2026-09-09 |
| COMPLETADO (eje claro) | Piezas publicitarias reales: 4 piezas renderizadas (8-mundos, numeria-sprint, reto-diario square + melodia banner) + README + script `scripts/piezas-reales.mjs` | marketing/orchestrator | 2026-09-09 |
| COMPLETADO (F4) | F4 marketing: inventario + auditoría docs-vs-código (`docs/audits/MARKETING-AUDIT.md`) + 4 plantillas eje OSCURO con tokens dark reales + plan de capturas | marketing/orchestrator | 2026-09-09 |
| PENDIENTE | Piezas eje OSCURO: solo falta la CAPTURA real del dark mode (tunnel del usuario) → `assets/pantallas-oscuras/` + re-render `node scripts/piezas-reales.mjs` | marketing | 2026-09-09 |
| COMPLETADO (corte 1) | Módulos nuevos de Trastienda (ruleta, volado, pizarra, historial) + economía server `0121` + fix resiliente doble o nada — M1/M2/M3 y minijuegos restantes DIFERIDOS | store-economy/visual-design/ux-ui | 2026-09-09 |
| COMPLETADO (corte 2) | Trastienda corte 2: fix Pizarra (`0122`, PGRST202) + página propia `/trastienda` + M1 apuestas + M2 predicción ranking + M3 títulos + minijuegos Calcu/Acertijos/Reloj — SQL `0123`/`0124` escritos + cliente completo (rutas, 5 componentes, i18n es/en, títulos en catalogo/verificar) | store-economy/visual-design/ux-ui | 2026-09-09 |
| PENDIENTE | Auditoría RLS/seguridad: repro en vivo + fix S5 (p_precision) y S9 (edge) | auth-security | — |
| PENDIENTE | Fase C: auditoría economía/tienda | store-economy | — |
| PENDIENTE | Fase C: auditoría marketing | marketing | — |
| PENDIENTE | Fase C: auditoría paridad de mundos | qa-e2e | — |
| PENDIENTE | Fase G: cierre de PROGRESO/PROJECT-STATE | orchestrator | — |
| COMPLETADO | F3 Español neutro latinoamericano: es.json + 13 archivos de componentes/páginas + RPC 0128 (9 funciones solo-mensajes) + herramientas de normalización; i18n es/en 555/555 | orchestrator/i18n | 2026-09-09 |
| COMPLETADO | F10 auditoría UX de producto final (solo documentación; cero cambios de código) | orchestrator | 2026-09-09 |
| COMPLETADO | F11 auditoría visual consistencia (código) + 2 cierres riesgo-cero | orchestrator | 2026-09-09 |
| COMPLETADO | F13 reconciliación docs de diseño (ESPECIFICACION/DIAGNOSTICO/TECH-DEBT/ARCHITECTURE) | orchestrator | 2026-09-09 |

---

### CLAIM: F8 Duelo casual / Feed social · orchestrator · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/audits/DUELOS-AUDIT.md` (nuevo), `src/app/[locale]/social/Feed.tsx` (voseo), `src/app/[locale]/duelo/invitacion/[inviteId]/page.tsx` (voseo), `docs/agent-work/ACTIVE.md`, `docs/PROGRESO.md`, `docs/audits/REQUIREMENTS-CHECKLIST.md`.
Plan: AUDITAR (duelos casual/ranked + feed social completo) → CRUZAR checklist → CERRAR riesgo-cero (dead imports, voseo) → DOCUMENTAR.

### CIERRE: F8 Duelo casual / Feed social · orchestrator · 2026-09-09
Resultado:
- VERIFICA: `npx tsc --noEmit` **0** · `npx eslint` (Feed.tsx, invitacion/page.tsx) **0** · `npx vitest run` **147/147** (13 files). Cero migraciones en esta fase.
- **Duelos casual/ranked → VERIFICADO EN CÓDIGO** (`docs/audits/DUELOS-AUDIT.md`): entrada única vía `RankedsClient.tsx` (`poll` 2.2s, `MAX_SEGUNDOS_BUSQUEDA=60`, ventana ±30→±300 `0109:537`); casual = `clasificatorio=false` (0050), sin ELO (`0050:243-249`), stats aparte (`mis_stats_casual`); "aleatorio" solo clasificatoria (`0109:504-508` + UI `RankedsClient.tsx:427-438`); mejor-de-3 = 3 rondas (`0109:573-620`, badge `PantallaVS.tsx:39-43`); rendirse/a bandono (`0088`, `BotonRendirse`, `SalaEsperaDuelo.tsx:49`). **P0#4 parcial confirmado**: el fallback de bots tras 30s (`0109:550-562`) NO está condicionado a `p_ranked` → casual y ranked<1300 pueden caer contra bot. **BLOQUEADO-POR-DB** (migración requerida).
- **Feed social → VERIFICADO EN CÓDIGO + plan PROPUESTA**: código completo (`Feed.tsx`, `FeedSidebar.tsx`, APIs `api/feed/*`, migraciones 0013/0052/0053), desactivado SOLO en `SocialClient.tsx:16-19` (page.tsx server sigue cargando posts/amigos/retos). RLS: feed_posts público para autenticados (embedding profiles por diseño). Plan de activación PROPUESTO (diff sugerido + checks + riesgos R1-R5) en DUELOS-AUDIT §2.4 — NO activado (decisión de producto, PO ausente).
- CERRÉ (riesgo-cero): voseo residual en `Feed.tsx:141` ("seguís/agregá" → "sigues/agrega") y `invitacion/[inviteId]/page.tsx:37` ("compartiselo" → "compárteselo"). Sin cambios de lógica ni de DB.
- Checklist: #18 (Casual) y #54 (Feed PARCIAL) sin cambio de estado (la auditoría lo confirma; activación queda en PROPUESTA). Procentaje de feed: queda documented.
- PENDIENTE usuario: aplicar migraciones pendientes (0116→0128) y decidir la PROPUESTA de activación del feed.

---

### CLAIM: F13 reconciliación docs de diseño · orchestrator · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/ESPECIFICACION.md`, `docs/DIAGNOSTICO.md`, `docs/TECH-DEBT.md`, `docs/ARCHITECTURE.md`, `docs/PROGRESO.md`, `docs/agent-work/ACTIVE.md`.
Plan: LEER todos los docs de diseño → CRUZAR contra hallazgos F0-F12 (contexto del usuario, NO re-auditar) → CORREGIR claims obsoletos → AGREGAR cabecera de reconciliación → VERIFICAR coherencia → DOCUMENTAR.

### CIERRE: F13 reconciliación docs de diseño · orchestrator · 2026-09-09
Resultado:
- **Estados de verificación**: la fase es 100% documentación (cero código, cero migraciones) → tsc/eslint/vitest/build NO aplican. Claims de runtime sin acceso a DB/browser se marcan "NO PUEDO VERIFICAR (sin DB)".
- **`docs/ESPECIFICACION.md`** (15 ediciones): cabecera "Última reconciliación: 2026-09-09 — fase F13" + sección nueva "Estado verificado (F0-F13)" (tabla con 16 filas, cada una con audit/evidencia file:line); 8 mundos (se agregaron Melodía/Trigonometria/Historia, con mundo neutro LA y mundo con refs verificables — sin inventar modos/`problem_type`); curva mundo 34/45/21 (0117, worldLevel.ts:46-49); niveles cuenta 0118 + recompensa 50n+250; tienda 24 ítems/47.900 + Trastienda completa (casino 0.88/118 elem/20/día, apuestas 10|500, predicciones self-heal, 3 minijuegos activos, títulos 8/9, falta gniñardo); rankeds (nivel mín 5, mejor-de-3, ELO TS≡SQL 0043, casual sin ELO 0050, anti-aleatorio 0109); feed DESACTIVADO (SocialClient.tsx:16-19); reto semanal 45 (0113); RLS familia S0-S4/S8 cerrada en 0120, S5 re-granted 0121:605-649 y S9 pendientes; runners 11 mundos; checklist 8 mundos; migraciones 0001→0128 con resumen por bloque; Pendiente reescrito (17 ítems). Corregí también vitest (13→147 tests) y el rango del diagrama de estructura (0036→0128).
- **`docs/DIAGNOSTICO.md`**: 5 bugs marcados RESUELTO EN CÓDIGO (Bug 2/3 misma causa raíz compartida, helper único) + notas de arquitectura actualizadas (Numeria Realtime 0038, matchmaking ±30→±300 cada 10s tope ±300 0109:537, notificaciones reto Realtime + duel_invites 0059).
- **`docs/TECH-DEBT.md`** y **`docs/ARCHITECTURE.md`**: claims de docs desactualizados actualizados (8 mundos, fórmula, README); rango de migraciones a 0128.
- **Coherencia final**: grep de restos ("cinco/5 mundos", "español (Argentina)", "0001-0036", fórmula vieja 50%) → ESPECIFICACION quedó limpio. Referencias cruzadas de la tabla "Estado verificado" validadas contra `docs/audits/*.md` (todos existen: STORE-ECONOMY, DUELOS, RANKEDS, CASUAL, NIVELES-MUNDOS, NIVELES-PERSONALES, AUDIT-RLS-SEGURIDAD, REQUIREMENTS-CHECKLIST, I18N) + `docs/TERMINOLOGY.md`.
- **NO PUEDO VERIFICAR (sin DB)**: detalle de modos/sub-temas de Melodía/Trigonometria/Historia (queda remitido a REQUIREMENTS-CHECKLIST/PROGRESO); contenido exacto de las ramas de los 8 `problem_type` nuevos; runtime de duels contra bots (comportamiento documentado por diseño).
- **Queda fuera de alcance (no editar)**: `docs/audits/*.md` y `docs/marketing/*` (regla). `docs/PROJECT-STATE.md:27,84` y `docs/audits/MASTER-AUDIT.md:50` siguen diciendo que ESPECIFICACION tiene "5 mundos" → claim ya obsoleto (ESPECIFICACION reconciliado en F13); actualizar en la próxima pasada que toque esos docs.

---

## Log de claims

### CLAIM: P0 retos diario/semanal · daily-weekly-challenges · 2026-09-07
Estado: EN CURSO
Áreas tocadas: `src/components/reto/RetoClient.tsx`, `src/lib/progresoReto.ts` (nuevo), `src/lib/progresoReto.test.ts` (nuevo).
Plan: INVESTIGAR → REPRODUCIR → CORREGIR → VERIFICAR → DOCUMENTAR.

### CIERRE: P0 retos diario/semanal · daily-weekly-challenges · 2026-09-07
Resultado:
- CONSTRUÍ: causa raíz confirmada en RetoClient.tsx (getSnapshot de useSyncExternalStore devolvía objeto nuevo por llamada → loop infinito). Fix: memoización en crearSnapshotProgreso (src/lib/progresoReto.ts) + usoMemo en el componente. Test de regresión 9 casos.
- VERIFIQUÉ: vitest 110/110 (8 files), tsc --noEmit limpio, eslint archivos tocados limpio, next build limpio (234 rutas, incluye /reto-diario y /reto-semanal).
- RESULTADO: CONFIRMADO (crash-proof por test de regresión que documenta el contrato Object.is) / BLOQUEADO (flujo en navegador: no hay browser en este entorno; falta verificar visualmente el retome de la pestaña y la interacción completa). Ver TECH-DEBT.
Estado: EN CURSO
Áreas tocadas: `AGENTS.md`, `.opencode/agents/*.md`, `docs/AGENT-INDEX.md`, `docs/AGENT-RULES.md`, `docs/agent-work/README.md`, este archivo, y resto de docs de Fase A.
Plan:
1. `AGENTS.md` real (conservando bloque Next.js) — hecho.
2. 22 agentes en `.opencode/agents/*.md` — hecho.
3. AGENT-INDEX + AGENT-RULES — hecho.
4. agent-work/README + ACTIVE.md — hecho.
5. PROJECT-STATE.md, ARCHITECTURE.md, DECISIONS.md, TECH-DEBT.md, EXTERNAL-RESOURCES.md — hecho.
6. esqueletos audits/marketing/landing/economy — hecho.

### CIERRE: Fase A — Infraestructura de agentes y docs base · documentation · 2026-09-07
Resultado: CONSTRUÍ: 22 agentes + 12 archivos de docs. VERIFIQUÉ: enum de `.opencode/agents` (22), existencia de dirs docs. RESULTADO: VERIFICADO POR CÓDIGO — todo creado; Falta Fase D (P0s) y B/C (auditorías).

### CIERRE: Línea marketing Fase 1 · marketing · 2026-09-07
Resultado:
- CONSTRUÍ: 3 subagents de solo lectura estudiaron la app real (educativo, gameplay/competitivo, visual/UX) y se crearon los 16 doc de `docs/marketing/` (README, BRAND, PRODUCT-MESSAGING, AUDIENCE, COMPETITIVE-RESEARCH, CONTENT-STRATEGY, AD-CONCEPTS, SOCIAL-CONTENT, VIDEO-CONCEPTS, VISUAL-ASSETS, SCREENSHOTS, PROMPTS-IMAGES, PROMPTS-VIDEO, CAMPAIGNS, COPY-LIBRARY, FUNNEL) + agent-work/ACTIVE.md.
- CONSTRUÍ (primer paquete urgente): 5 anuncios visuales (Ad1-5), 5 videos cortos (Video A-E), 10 hooks, 5 anuncios completos, 5 carruseles (A/B), 3 trailers (T1-T3) — todos anclados en features verificadas.
- VERIFIQUÉ: cada claim publicitario citado en PRODUCT-MESSAGING.md y AD-CONCEPTS.md tiene evidencia VERIFICADO EN CÓDIGO.
- RESULTADO: VERIFICADO POR CÓDIGO. PENDIENTE: actualizar capturas en browser (BLOQUEADO sin navegador), live research de competencia (COMPETITIVE-RESEARCH es HIPÓTESIS), priorizar tabla de conceptos P0-P3 definitiva. Detalle en `docs/marketing/agent-work/ACTIVE.md`.

### CIERRE: Fase C — Auditoría RLS/seguridad · auth-security · 2026-09-07
Resultado:
- INVENTARIO + AUDITÉ por código todas las migraciones 0001-0114 relevantes (RLS, security definer, grants, RPC); edge functions revisadas; sin secretos en repo.
- HALLAZGOS (ver `docs/audits/AUDIT-RLS-SEGURIDAD-2026-09-07.md`): **S10 CRÍTICO** `acreditar_chispas(p_user_id, p_monto)` granted a authenticated SIN validar `auth.uid()` → Chispas ilimitadas a cualquiera + griefing con monto negativo (0070:105-153); **S0 CRÍTICO** `registrar_xp_diario(p_xp)` suma p_xp verbatim → Chispas/XP infinito (VIGENTE 0070:164-206, acreditar_chispas:199); **S1 CRÍTICO** `registrar_puntos_mundo` p_puntos verbatim → nivel_mundo/marcos/títulos (VIGENTE 0109:81-202); **S2/S3/S4/S8 ALTO** policies "for all" de skill_levels/attempts/daily_progress/logic_attempts → dominio/rankings fabricables; **S5 ALTO** `resolver_apuesta_si_activa(p_precision)` → apuesta siempre ganada (0025:171-208, security definer); **S9 BAJO** edge functions sin verificación de llamada.
- CORREGÍ (sin riesgo, cero cambio de flujo legítimo) en `0115_cerrar_huecos_seguridad_fase5.sql`: S6 `handle_new_user` re-creado con `set search_path = public` (regresión de 0060); S7 policy INSERT de friendships ahora exige `estado='pendiente'` (no rompe /api/amigos/solicitar ni conectar_por_invitacion, security definer); y **S10** `acreditar_chispas` con guard `auth.uid()` + revoke a public/authenticated (uso interno inmutable, nunca llamada desde cliente).
- VERIFIQUÉ: SATISFACTORIO contra el código (SQL de 0115 espeja 0112/0012/0070 salvo el guard y el search_path; los callers internos de acreditar_chispas pasan sempre auth.uid(): 0070:199, 0070:240). Los cambios son SQL puro → no tocan TS/tsc/lint; tsc/lint del repo ya estaban limpios.
- RESULTADO: CONFIRMADO POR CÓDIGO para hallazgos; CORREGIDO S6/S7/S10; BLOQUEADO la reproducción en vivo y el fix de la familia S0-S5/S8/S9 (requieren base real; el fix correcto es migrar el alta de progreso/XP a funciones security definer con valores derivados de la DB, NO parchear los RPC a ciegas — quedaría sin verificar).

### CLAIM: Fase C — Auditoría RLS/seguridad · auth-security · 2026-09-07
Estado: COMPLETADO (ver CIERRE arriba)
Áreas tocadas: `supabase/migrations/**` (RLS en tablas, security definer, policies), `src/app/api/**`, `supabase/functions/**`. Enfocado en: (1) políticas RLS de todas las tablas, (2) funciones SECURITY DEFINER (lógica de autorización), (3) RPC expuestos, (4) invitados/anon vs usuarios autenticados, (5) niveles de seguridad de API routes y edge functions.
Plan: INVENTARIO → AUDITAR → HALLAZGOS con severidad (CRÍTICO/ALTO/MEDIO/BAJO) → CORREGIR los confirmados → VERIFICAR → DOCUMENTAR. Prioridad de examen: migraciones listadas (0031, 0035, 0036, 0042, 0050, 0060, 0072, 0080, 0090, 0102, 0113).

### CLAIM: Fase B — Auditoría del mapa (rutas/RPC/migraciones) · repo-architect · 2026-09-07
Estado: COMPLETADO (ver CIERRE)
Áreas tocadas: `src/app/**` (rutas App Router + segmento `[locale]`), `supabase/migrations/*.sql` (RPC/functions por migración), `src/lib/**`. Solo lectura/inventario; no se modifica código todavía.
Plan: M1. Inventario de rutas (páginas + API routes + middleware) → M2. Inventario de RPC/functions Postgres → M3. Inventario de migraciones 0001-0114 → M4. Cruzar: rutas vs RPC usados vs definiciones SQL, y detección de rutas/RPC huérfanos → M5. Reporte docs/audits/AUDIT-MAPA-<fecha>.md + actualización de MASTER-AUDIT.md.

### CIERRE: Fase B — Auditoría del mapa (rutas/RPC/migraciones) · repo-architect · 2026-09-07
Resultado:
- INVENTARIO (M1-M3): 111 páginas bajo `[locale]`, 31 API routes + `/auth/callback`, 1 `proxy.ts` (Next 16: `middleware`→`proxy`); 122 funciones Postgres únicas (250 definiciones); 115 migraciones (0001-0115). Sin rutas catch-all; 6 familias de params dinámicos.
- CRUCÉ (M4): ningun RPC llamado desde la app está sin definir; las funciones revocadas (desbloquear_titulo, otorgar_marco_mundo) NO se usan (se usa *_propio correctamente). Independiente: hallazgo de seguridad adicional **S10** (acreditar_chispas sin auth.uid()) detectado durante el cruce — CORREGIDO en 0115.
- HALLAZGOS (informe `docs/audits/AUDIT-MAPA-2026-09-07.md`): F-M1 `elegir_mundo_inicial(text)` huérfana aún grantada (legacy, coexiste con `elegir_mundos_iniciales`); F-M2 AGENTS.md dice "70 rutas" (real 111/32); F-M3 frontera de confianza de attempts repartida ruta/policy (ligado a S3/S8); F-M4 cierre semanal de clanes por tráfico.
- VERIFIQUÉ: inventario 100% por lectura de archivos (subagentes), estados registrados. Cambios: solo SQL de 0115 (S10) → no toca TS/lint; tsc/lint ya limpios.
- RESULTADO: VERIFICADO POR CÓDIGO (inventario) / NO VERIFICADO en vivo (proxy×rutas, guard de invitado completo, onboarding 2 mundos). Backlog: revoke/legacy F-M1, actualizar docs F-M2 (Fase G), opcional scheduled job F-M4.

### CLAIM: Cierre familia S0/S1/S2/S3/S4/S8 (RLS economía/progreso) · auth-security · 2026-09-08
Estado: EN CURSO
Áreas tocadas: `supabase/migrations/0120_cerrar_s0_s1.sql` (nuevo), `src/app/api/attempts/route.ts`, `src/app/api/logic-attempts/route.ts`, docs de auditoría.
Plan: ANALIZAR (schemas/policies/llamadores/formulas) → MIGRACIÓN 0120 → migrar rutas a RPC → VERIFICAR → DOCUMENTAR → avisar al usuario (aplicar 0120 a prod).

### CIERRE: Cierre familia S0/S1/S2/S3/S4/S8 · auth-security · 2026-09-08
Resultado:
- CONSTRUÍ: `0120_cerrar_s0_s1.sql` — drop de 5 policies amplias (attempts, logic_attempts,
  skill_levels, logic_skill_levels, daily_progress) que quedan solo SELECT; helper
  `xp_real_por_mundo`; `registrar_xp_diario` y `registrar_progreso_mundo`/`registrar_puntos_mundo`
  redefinidos para DERIVAR montos reales de la DB (deltas idempotentes); RPC `insertar_intento`
  e `insertar_intento_logica` security definer (XP + anti-apuro + calibración server-side,
  fórmula espejo con boost). Migré `/api/attempts` y `/api/logic-attempts` a esos RPC.
- VERIFIQUÉ: tsc 0 · vitest 126/126 · eslint de las 2 rutas 0 · greps sin callers directos rotos.
- RESULTADO: CONFIRMADO POR CÓDIGO (S0-S4/S8 cerradas; quedan S5/S9). PENDIENTE: aplicar 0120
  a prod por el PO y re-observar finish de práctica/Enigmia.

### CLAIM: Fase marketing-real + i18n + tienda + UX · orchestrator · 2026-09-09
Estado: EN CURSO (delegada en especialistas; ver TODOS abajo)
Áreas: docs/marketing/** (piezas reales), docs/audits/I18N-AUDIT.md, TIENDA-EXPANSION-2026-09-09.md, TRASTIENDA-VISUAL-2026-09-09.md, PRODUCT-UX-AUDIT.md, EXTERNAL-RESOURCES.md, DECISIONS.md, TECH-DEBT.md.
Plan: (A) piezas publicitarias reales light+dark a partir de las 30 capturas existentes + capturas dark vía Playwright; (B) auditoría i18n ; (C) expansión tienda; (D) diseño visual Trastienda; (E) prototipos de video; (F) UX audit. NO tocar migraciones/producción aún.
Estado: COMPLETADO en código (ver CIERRE); verificación en vivo la hace el usuario (aplicar 0116 + tunnel).
Áreas tocadas: `supabase/migrations/0116_fix_elegir_dos_mundos.sql` (nuevo), `src/lib/auth/guard.ts`, `src/app/[locale]/onboarding/page.tsx`, `src/app/[locale]/onboarding/OnboardingForm.tsx`, `src/components/landing/FlujoElegirMundos.tsx`, `src/lib/mundos/precios.ts` (comentario), `src/types/database.ts` (comentario).
Plan: INVESTIGAR (2 subagentes explore: flujo cliente + RPC/DB) → CORREGIR → VERIFICAR (tsc/lint/test/build) → DOCUMENTAR → usuario aplica 0116 y retestea en vivo.

### CIERRE: P0 bug "2 mundos" · onboarding-landing · 2026-09-08
Resultado:
- REPRO EN VIVO reportado por el usuario (dev tunnel): elige 2 mundos → "ya elegiste tus dos mundos iniciales" trabado; al recargar solo "numeria" activo.
- DIAGNÓSTICO (2 explore en paralelo): `profiles.mundos_desbloqueados = ['numeria']` heredado de la fase vieja de 1 mundo gratis + RPC `elegir_mundos_iniciales` que rechazaba todo array no vacío (0112:124) + guard que solo mandaba a onboarding a los de 0 mundos + clientes que no navegaban ante el error.
- CORREGÍ: migración `0116_fix_elegir_dos_mundos.sql` (self-heal cardinalidad 1 → 2; bloqueo solo con `>= 2`; revoke de `elegir_mundo_inicial(text)` legacy con chequeo de existencia), `guard.ts` `< 2`, `onboarding/page.tsx` `>= 2`, y en ambos pickers el error "ya elegiste" navega a la home en vez de trabarse. Comentarios stale en `precios.ts`/`database.ts` corregidos.
- VERIFIQUÉ: tsc 0 · eslint 0 · vitest 110/110 · build 0.
- RESULTADO: VERIFICADO POR CÓDIGO. PENDIENTE usuario: aplicar `0116` en la base y confirmar el flujo en vivo por el tunnel.
### CLAIM: T1 Auditoría usuarios/ranking · auth-security+backend-supabase+matchmaking · 2026-09-08
Estado: DELEGADO (subagent en ejecución). Entregable: `docs/audits/USER-RANKING-AUDIT.md` + fix (+ regresiones). Migración asignada sugerida: `0119_filtro_ranking_usuarios_permanentes.sql` (confirmar número libre).

### CLAIM: T2/T3 Trastienda (mecánicas + economía + diseño visual) · store-economy+visual-design+ux-ui+gameplay · 2026-09-08
Estado: DELEGADO (subagent en ejecución). Entregables: `docs/audits/TRASTIENDA-ECONOMIA.md` (mecánicas 1-5, probabilidades/EV/límites, minijuegos 3-5, títulos) y `docs/audits/TRASTIENDA-DESIGN.md` (sala/fichas/ruleta/estados/animaciones/assets). Sin código ni migraciones esta ronda (diseño primero).

### CLAIM: T4 Niveles mundos (curva) · gameplay+backend+educational · 2026-09-08
Estado: DELEGADO (subagent en ejecución). Migración asignada: `0117_curva_nivel_mundo.sql`. Simular jugador pequeño/medio/avanzado/extremo. NO tocar registrar_puntos_mundo/registrar_xp_diario (familia S0/S1 en backlog de seguridad).

### CLAIM: T5+T6 Niveles personales + recompensa · gameplay+backend+store-economy · 2026-09-08
Estado: DELEGADO (subagent en ejecución). Migración asignada: `0118_niveles_cuenta_recompensas.sql`. Analizar inflación ANTES de fijar recompensa (1000 Chispas es propuesta, no decisión).

### CLAIM: T7 Animación level up · gameplay+visual-design+ux-ui · 2026-09-08
Estado: DELEGADO (subagent en ejecución). Entregable: spec técnica+visual (timing, partículas, estados mobile/desktop). Sin código.

### CLAIM: T8 Causal · matchmaking+backend+qa-e2e · 2026-09-08
Estado: DELEGADO (subagent en ejecución). Requiere EVIDENCIA de pruebas (Playwright). No tocar Ranked/ELO.

### CLAIM: T9 Invitación por link · social+frontend+backend+qa · 2026-09-08
Estado: DELEGADO (subagent en ejecución). Cubrir: sesión sí/no, móvil, link viejo/2 veces/inválido/expirado, race conditions.

### CLAIM: T10 Reto directo a amigo · social+frontend+backend+qa · 2026-09-08
Estado: DELEGADO (subagent en ejecución). REPRODUCIR (2 anon QA) → CAUSA RAÍZ → CORREGIR → E2E.

### CIERRE: T1 Auditoría usuarios/ranking · auth-security+backend-supabase+matchmaking · 2026-09-08
Resultado:
- PROBLEMA (vivo): cuentas incompletas (display_name null / email sin confirmar) aparecían en el ranking ELO persistente (5 de 14 filas, fotografía de hoy). `ranking_semanal()` legible con anon key.
- CAUSA RAÍZ: el WHERE de rankings filtraba solo `is_anonymous=false` y `not es_bot`, nunca "identidad permanente"; los grants nunca revocaron PUBLIC en `ranking_semanal()`.
- PROPUESTA: "usuario permanente" = 4 condiciones (no anónimo, no bot, display_name no vacío, email confirmado). Aplicada a `ranking_elo_global`, `ranking_semanal_filtrado`, `ranking_semanal`, `posicion_ranking_puntos`.
- IMPLEMENTACIÓN: migración `0119_filtro_ranking_usuarios_permanentes.sql`. Sin cambios en `src/`.
- VERIFICACIÓN: tsc 0 · lint sin errores nuevos · tests 126/126 · simulación sobre DB real (14→9 filas, 0 legítimos perdidos) · browser (Playwright): leaderboard sin anónimos. Migración NO aplicada a prod (paso manual).
- RESULTADO: CONFIRMADO POR CÓDIGO + DATOS REALES + BROWSER. BLOQUEADO aplicar 0119 a prod (no hay DDL vía Rest). Doc: USER-RANKING-AUDIT.md.

### CIERRE: T2/T3 Trastienda (diseño) · store-economy+visual-design+ux-ui+gameplay · 2026-09-08
Resultado: DISEÑO COMPLETO (sin código a propósito — ronda de diseño primero).
- Mecánica 1 (apostar a la partida): flujo completo server-authoritative, tabla `trastienda_apuestas`, resolución automática, EV objetivo 0.92-0.96.
- Mecánica 2 (apuestas de ranking): evaluada — riesgo/abuso documentado, se prioriza la mecánica 1 (postponer o diseño alternativo).
- Mecánica 3: títulos exclusivos de Trastienda (nombres/rareza/condiciones) en el doc de economía.
- Mecánica 4: ruleta con probabilidades/EV/pity/límites diarios definidos (economía controlada).
- Mecánica 5: 3-5 minijuegos pulidos seleccionados.
- Recompensa al subir de nivel: análisis de economía (ver T5/T6): 1000 flat RECHAZADO → propuesto 50·n+250.
- Diseño visual: `TRASTIENDA-DESIGN.md` (concepto "sótano del Bazar", paleta, componentes, flujo, animaciones, assets).
- ESTADO: DISEÑO VERIFICADO POR CÓDIGO (todo cita código real). Moneda = LAS MISMAS CHISPAS (decisión PO fijada 2026-09-08; "fichas" son solo representación visual del balance). PENDIENTE: implementación en código + migraciones (prerequisito: familia S0/S1).

### CIERRE: T4 Niveles de mundos · gameplay+backend-supabase+educational-content · 2026-09-08
Resultado:
- PROBLEMA: Numeria nivel 1 con ~800 problemas. NO era bug de acumulación sino de CURVA: la fórmula vigente ponderaba 50% "dominio nivel 10" (inalcanzable en uso real) y volumen con techo 50000 sub-ponderado.
- PROPUESTA: volumen 34% (techo 25000) + dominio 45% (desde nivel 4, clamp((n-4)/6)) + lecciones 21%. 800 problemas ⇒ nivel ~54; el farm de un solo sub-tema queda clavado en ~36 (anti-farm por diseño).
- IMPLEMENTACIÓN: migración `0117_curva_nivel_mundo.sql` (RPC `registrar_progreso_mundo`, MISMO contrato de salida) + `src/lib/practica/worldLevel.ts` (fórmula pura) + `worldLevel.test.ts` (4 jugadores + anti-farm). `practica/finish` y `enigmia/finish` usan el RPC nuevo.
- VERIFICACIÓN: tsc 0 · eslint archivos tocados 0 · vitest 126/126 (incluye 6 tests nuevos) · build NO corrido (no se tocaron rutas, sólo 2 handlers). Playwright pendiente.
- RESULTADO: CONFIRMADO POR CÓDIGO. PENDIENTE: aplicar 0117 a prod y re-observar niveles.

### CIERRE: T5+T6 Niveles personales + recompensa · gameplay+backend-supabase+store-economy · 2026-09-08
Resultado:
- PROBLEMA confirmado: curva `100·n^1.6` se siente ~816 constante en el rango habitual (marginal 655→980). 
- PROPUESTA: escalera C por tramos (200/300/550/900/1400/1900/2400 cota) — primeros niveles fáciles, medios exigentes, altos acotados. Nivel 50 = 82 350 XP (~17 sem élite).
- RECOMPENSA (T6): 1000 flat ANALIZADO y RECHAZADO (duplica velocidad de compra del catálogo, regala 3-5x el grind en niveles bajos, plano). Propuesto `50·n+250` (nivel 15 = exactamente 1000). **APROBADO por PO el 2026-09-08.**
- IMPLEMENTACIÓN: migración `0118_niveles_cuenta_recompensas.sql` (escalera, `nivel_desde_xp_cuenta` O(n) vía generate_series, `acreditar_chispas` con bonus variable) + `src/lib/cuenta/niveles.ts` (espejo TS) + `niveles.test.ts`.
- VERIFICACIÓN: vitest 126/126 (incluye 10 nuevos) · tsc 0 · eslint 0. Build no corrido (solo SQL+lib). Migración NO aplicada.
- RESULTADO: CONFIRMADO POR CÓDIGO + APROBADO POR PO (recompensa 50·n+250, 2026-09-08). APPLY: 0118 aplicada a la base por el PO.

### CIERRE: T7 Animación level up (spec) · gameplay+visual-design+ux-ui · 2026-09-08
Resultado: SPEC COMPLETA en `LEVEL-UP-ANIMACION-2026-09-08.md`. Trigger real identificado: nivel_cuenta sube en `acreditar_chispas` (0070/0115) pero la ruta `practica/finish` NO expone `nivelCuenta{subio,nivel,bonus}` → es el hueco a cerrar. Stack decidido: framer-motion + canvas 2D (patrón ChispaClick) + WebAudio (patrón sonido.ts), reusando GestoLogo/efectos.ts. Sin código (solo spec).

### CIERRE: T8 Duelos casuales · matchmaking+backend-supabase+qa-e2e · 2026-09-08
Resultado: auditoría completa CON evidencia E2E real (2 anon Chromium) en `CASUAL-AUDIT-2026-09-08.md`.
- Confirmado: casual no toca ELO (800→800), no cruza con cola ranked (timeout simultáneo clasificatorio=false), stats separadas (`mis_stats_casual`).
- BUG#1 (race rebirth fantasma en poll) → FIX en RankedsClient.tsx (chequeo pasivo primero + query ronda null|1 + clasificatorio = modo).
- BUG#2 (casual matchea bots: fallback >30s no condicionado a p_ranked) → DOCUMENTADO, requiere migración (0109:552-560).
- BUG#3 (stats V/D/tasa contaban casuales) → FIX en RankedsClient.tsx (filtro clasificatorio).
- BUG#4 (logros duelos_ganados/racha contaban casuales) → FIX en src/lib/logros/verificar.ts (.eq clasificatorio true).
- BUG#5 (doble resolución en registrar_resultado_duelo → feed duplicado / ELO duplicado en ranked) → DOCUMENTADO, requiere migración (guard estado).
- VERIFICACIÓN: tsc 0 · eslint 0 en tocados · vitest 126/126 · E2E real. PENDIENTE: migraciones BUG#2/#5 + cleanup de duelos fantasma en prod.

### CIERRE: T9 Invitación por link · social+frontend+backend+qa · 2026-09-08
Resultado en `INVITACION-LINK-AUDIT-2026-09-08.md`:
- Bug REAL corregido: `SelectorMundoDuelo` ofrecía 5 modos de Quimia pero `crear_invitacion_duelo` solo acepta 3 → el link fallaba `opcion invalida`. Fix aditivo: `QUIMIA_MODOS_INVITACION` + prop `subopcionesPorMundo` (solo usada por InvitarPorLink en AmigosClient:274). Rankeds y retar-amigo intactos.
- Verificado por código: misma sala, validaciones (usado 2×, propio link, cancelado, etc.), registro de resultado del invitado, móvil. 
- Hallazgos documentados (sin fix): duelo por link es `clasificatorio=true` pese al comentario "casual" (discrepancia producto/código, requiere migración); sin expiración/cleanup de `duel_invites`; cuentas nuevas pierden el link (`RegistroForm` → `/`).
- VERIFICACIÓN: tsc 0 · eslint 0 · vitest 126/126 · build 0 (234 rutas). Playwright: BLOQUEADO (dev server no respondía en ese momento).
- RESULTADO: CONFIRMADO POR CÓDIGO + fix aplicado.

### CIERRE: T10 Reto directo a amigo · social+frontend+backend+qa · 2026-09-08
Resultado en `RETO-DIRECTO-AMIGO-2026-09-08.md`. REPRODUCIDO con 2 cuentas QA reales (Chromium):
- BUG A (raíz): `NotificacionesDuelo` (layout raíz) se suscribía a `realtime:retos-a:<id>` solo al MONTAR, con `getUser()` en deps []; al entrar por navegación cliente desde /login, getUser() devolvía null → el canal NUNCA se suscribía → el retado no recibía el aviso → duelo pendiente para siempre.
- BUG B: el toast era un enlace hardcodeado a `/practica?operacion=...`; para mundos != numeria `operation_type=null` → el retado caía en `/es/practica?operacion=null&duelo=…`, el gate `fila.mundo==="numeria"` fallaba → duelo nunca conectaba.
- IMPLEMENTACIÓN: `NotificacionesDuelo.tsx` — suscripción con `onAuthStateChange` (re-canal por sesión + cleanup) + destino con `hrefDuelo(mundo, operation_type, duel_id, sub_tipo)` + etiqueta traducida. Sin migración (fix 100% cliente).
- VERIFICACIÓN e2e real (login SIN reload, el flujo que fallaba): Numeria ✓ (toast ~3s → ambos en sala), Geografía ✓ (toast "Te retaron a un duelo de Geografía (América)" → sala de geografía). tsc 0 · eslint 0.
- RESULTADO: REPRODUCIDO REAL → CAUSA RAÍZ → CORREGIDO → VERIFICADO EN BROWSER (2 usuarios). Pendiente opcional: mismo hrefDuelo en Feed.tsx:217.

### CIERRE: Fase marketing-real + i18n + tienda + UX · orchestrator · 2026-09-09
Resultado:
- DELEGUÉ en 6 agentes: i18n (I18N-AUDIT.md), dirección artística (DIRECCION-ARTISTICA.md + EXTERNAL-RESOURCES), video (ANUNCIOS-VIDEO + STORYBOARD-TRAILER-PRINCIPAL), tienda (TIENDA-EXPANSION-2026-09-09.md), Trastienda visual (TRASTIENDA-VISUAL-2026-09-09.md) y UX (PRODUCT-UX-AUDIT.md). Entregaron docs (ronda de estudio, no código) — el PO confundió docs con implementación y pidió "implementalo".
- IMPLEMENTÉ la Trastienda visual sobre el módulo existente: tokens `--tt-*` en `globals.css` (3 bloques + @theme), `TiendaClient.tsx` con puerta-emblema candado, sala siempre oscura (rayo de luz, caja fuerte, chips de monto, badge pendiente, marca de agua), prop `onVolver`, copy nuevo en `es.json`/`en.json`.
- VERIFIQUÉ: tsc 0 · eslint tocados 0 · vitest 126/126.
- PENDIENTE: (a) piezas eje OSCURO (requiere capturas dark reales del app — tunnel del usuario); (b) integrar detalles finos de los entregables si el PO los aprueba; (c) usuario verifica la Trastienda en browser. Los módulos nuevos (ruleta, apuestas, minijuegos, títulos) NO se implementan: requieren economía server de `TRASTIENDA-ECONOMIA.md` + decisión PO (ver DECISIONS.md y TECH-DEBT.md).

### CLAIM: Trastienda economía corte 1 (ruleta + volado + pizarra + historial + fix doble o nada) · store-economy+visual-design · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `supabase/migrations/0121_trastienda_economia.sql`, `src/lib/trastienda/*`, `src/app/api/trastienda/*`, `src/components/trastienda/*`, `src/app/[locale]/tienda/TiendaClient.tsx`, `messages/es.json` + `messages/en.json`, `src/lib/trastienda/ruleta.test.ts`.

### CIERRE: Trastienda economía corte 1 (ruleta + volado + pizarra + historial + fix doble o nada) · store-economy+visual-design · 2026-09-09
Resultado:
- CONSTRUÍ migración `0121_trastienda_economia.sql`: tablas `trastienda_ruleta`, `trastienda_minijuegos`, `trastienda_pizarra` (sin RLS ni grants — secreto solo vía RPC) + RPCs `girar_ruleta`, `tirar_volado`, `iniciar_la_pizarra`, `adivinar_la_pizarra`, `fetch_trastienda_historial`; recrea de forma RESILIENTE `apostar_doble_o_nada` y `resolver_apuesta_si_activa` (guards `to_regclass` + `ADD COLUMN IF NOT EXISTS` → el "Algo salió mal" era probablemente 42P01 por tablas inexistentes en prod, HIPÓTESIS).
- Cliente: 4 rutas API (girar-ruleta/volado/pizarra/historial), 4 componentes (Ruleta/Volado/Pizarra/HistorialTrastienda), `TiendaClient.tsx` integra todo (props `historialVersion`/`onPuntos`/`onMovimiento`), keys `Tienda.trastienda` espejadas es/en (47 cada una, verificado por script).
- DIFERIDO a decisión PO: Mecánica 1 (apuestas a partida), Mecánica 2 (predicciones ranking), Mecánica 3 (títulos — ruleta entrega escudo placeholder), minijuegos La Calcu/Acertijos/Reloj.
- VERIFIQUÉ: tsc 0 · eslint tocados 0 · vitest 132/132 (126 previos + 6 tests nuevos de ruleta: probabilidades 100, ángulos 360, gradient, rotación→aguja, EV en rango, valor escudo) · build limpio (rutas nuevas listadas). Paridad i18n 47/47.
- RESULTADO: VERIFICADO POR CÓDIGO. PENDIENTE usuario: aplicar `0121_trastienda_economia.sql` a prod; retestear doble o nada + módulos nuevos en browser (tunnel/decisions en DECISIONS.md).

### CIERRE: Trastienda economía corte 1 (doble o nada) · store-economy · 2026-09-09
Resultado: fix resiliente incluido en 0121 (to_regclass + ADD COLUMN IF NOT EXISTS). Causa raíz en la apuesta activa: HIPÓTESIS 42P01 (logic_attempts/duel_results ausentes en prod) — no confirmable sin acceso a la DB. EV 0.92/0.94 intacto.
- ESTADO: VERIFICADO POR CÓDIGO. Piezas eje claro: renderizadas (Playwright headless, sin server) en `docs/marketing/assets/piezas/` (4 PNG + HTML editables + script `scripts/piezas-reales.mjs`).

### CLAIM: Trastienda corte 2 (fix Pizarra + M1/M2/M3 + minijuegos completos) · store-economy+visual-design · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `supabase/migrations/0122_arreglo_pizarra.sql`, `0123_trastienda_mecanicas_123.sql`, `0124_trastienda_minijuegos.sql`, `src/app/[locale]/trastienda/page.tsx` (nuevo), `src/components/trastienda/TrastiendaClient.tsx`, `src/app/[locale]/tienda/page.tsx` + `TiendaClient.tsx` (refactor: sin apuesta_monto/ocultar_doble_o_nada en select, props viejas fuera), `src/app/api/trastienda/{apuestas,predicciones,la-calcu,acertijos,el-reloj}/route.ts` (nuevos), `src/components/trastienda/{ApostarPartida,PrediccionRanking,LaCalcu,Acertijos,ElReloj}.tsx` (nuevos), `HistorialTrastienda.tsx` (mapeo minijuegos), `src/lib/trastienda/tipos.ts`, `src/lib/titulos/{catalogo,verificar}.ts` (categoría `trastienda` + 8 títulos), `messages/es.json` + `messages/en.json`.

### CIERRE: Trastienda corte 2 (fix Pizarra + M1/M2/M3 + minijuegos completos) · store-economy+visual-design · 2026-09-09
Resultado:
- CONSTRUÍ `0122_arreglo_pizarra.sql`: bug `v_del_dia integer` → `v_pizarra_id uuid` (la pizarra nueva venía NULL → 22021/el historial no listaba) + re-grant + `NOTIFY pgrst, 'reload schema'` (el "Algo salió mal" de TODOS los módulos, PGRST202, es caché de esquema PostgREST — diagnóstico en el propio archivo). PENDIENTE usuario: aplicarlo + el NOTIFY y retestear.
- Refactor de la página: `/trastienda` propia (fuera de la Tienda) + `TrastiendaClient.tsx`; `tienda/page.tsx` sin `apuesta_monto, ocultar_doble_o_nada` del select y sin props `apuestaActiva`/`ocultarDobleONadaInicial`; función interna `Trastienda` borrada de `TiendaClient.tsx`.
- CONSTRUÍ `0123_trastienda_mecanicas_123.sql` (M1 apuestas a duelos ajenos con límites 10/día y 500/día, preview + multiplier por ΔELO server-side, resolución por trigger sobre `duel_results`; M2 predicción de ranking semanal `ranking_semanal_de_semana` con self-heal `cobrar_predicciones_pendientes` (no hay job semanal garantizado), buckets 1/2/3/4-5/6-10/11-20/21+ con parcial ±2 posiciones al 50%; M3 títulos: `girar_ruleta` reescrito con rama 'titulo' real vía `titulos_trastienda_base()` + `desbloquear_titulo_propio`, helpers `nombre_titulo_trastienda`).
- CONSTRUÍ `0124_trastienda_minijuegos.sql`: La Calcu (puzzle generado server-side, AST JSONB validado en el server — sin eval de texto; 50 Chispas; 125 payout +200 si ≤10s), Acertijos de Enigmia (secuencias de 4/5/6 símbolos distintos, dificultad por racha, 30s, payouts 60/100/170, costo 100), El Reloj del sótano (15 sumas/restas, respuestas SOLO en server — tabla sin grants/RLS —, 85s, payouts 160/95/55/0, costo 60). Correcciones en sesión: `eval_calcu` `->>`, `generar_puzzle_calcu` reescrito a árbol de forma fija con '/' solo en internas y `+-*` final (target entero siempre alcanzable), rachas por iteración consecutiva excluyendo la fila actual.
- Cliente completo: 5 rutas API (`/api/trastienda/apuestas|predicciones|la-calcu|acertijos|el-reloj`), 5 componentes nuevos, integración en `TrastiendaClient` (apuestas + oráculo arriba de la Ruleta; grid 3 minijuegos abajo), propagación de balance `puntos`/`onPuntos`/`onMovimiento`; `HistorialTrastienda` mapea los minijuegos nuevos por `titulo`; tipos espejados a los contratos RPC reales (`id` en vez de `calcu_id`, `resolvio`/`ganado`/`correctas` + `payout`, `monto_hoy`, `semana`).
- M3 en TS: categoría `trastienda` + 8 títulos con los criterios de `TRASTIENDA-ECONOMIA.md` §3 (tronado 1 ganada, farolero racha 5, profeta-minor 10 predicciones, uja 50 apuestas, ardilla 5000 payout, profeta-mayor racha 5 predicciones, ecualizador racha 20, sentenciador ≥100 y neto >0); los 4 títulos base de la ruleta redundan (idempotente) con `titulos_trastienda_base()`.
- VERIFIQUÉ: tsc 0 · eslint tocados 0 · vitest 132/132 · build 0 (rutas nuevas listadas: acertijos, apuestas, el-reloj, la-calcu, predicciones). Key `entrarALaTrastienda` confirmada ya existente en es/en.
- RESULTADO: VERIFICADO POR CÓDIGO. PENDIENTE usuario: aplicar `0122` + `NOTIFY pgrst, 'reload schema';` + `0123` + `0124` a prod y retestear en browser (tunnel). Sin acceso a DB/runtime desde este entorno: los RPC nuevos NO se pudieron verificar contra la base real.

### CLAIM: Trastienda limpieza (0126): QA oculto, oráculo, mesa paginada, sin Acertijos/El Reloj, español normalizado · orchestrator+store-economy · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `supabase/migrations/0126_trastienda_limpieza.sql` (nuevo), `src/app/api/trastienda/predicciones/route.ts`, `src/components/trastienda/{ApostarPartida,TrastiendaClient,HistorialTrastienda}.tsx`, `src/lib/trastienda/tipos.ts`, borrados `{Acertijos,ElReloj}.tsx` + `api/trastienda/{acertijos,el-reloj}/route.ts`, `messages/{es,en}.json`, `src/lib/api/respuestaError.ts`.

### CIERRE: Trastienda limpieza (0126) · orchestrator+store-economy · 2026-09-09
Resultado:
- CONSTRUÍ `0126_trastienda_limpieza.sql` (idempotente, `notify pgrst` al final): (1) `profiles.es_cuenta_prueba` + seed `qa%` — la solución a "ocultar QA" porque NO son distinguibles por SQL (no hay columna es_qa; decisión documentada, reversible a mano); (2) re-crea `fetch_apuestas_disponibles` (filtra `es_cuenta_prueba`) y `ranking_elo_global`/`ranking_semanal_filtrado`/`ranking_semanal`/`posicion_ranking_puntos`/`ranking_semanal_de_semana` con `and not p.es_cuenta_prueba`; (3) RPC nueva `ventana_predicciones()` server-authoritative (current_date; la ventana cliente-UTC del oráculo se desfasaba del server); (4) drop de Acertijos/El Reloj (funciones + tablas) y re-crea `girar_ruleta`/`apostar_partida`/`apostar_prediccion_ranking`/`iniciar_la_pizarra`/`apostar_doble_o_nada` con mensajes de errores en español normalizado (los voseos vivían en los `raise exception`).
- Cliente: oráculo GET usa `ventana_predicciones()` con fallback pre-0126; mesa de apuestas como dashboard paginado (3 partidas/página, `enLinea`/`pagina`/`anterior`/`siguiente`); Acertijos y El Reloj eliminados por completo (componentes, rutas API, tipos, historial, i18n); `La Calcu` ahora sola en el grid. Español normalizado en `es.json` (trastienda) y `respuestaError.ts` ("Algo salió mal. Prueba de nuevo."); `en.json` espejo.
- VERIFIQUÉ: tsc 0 (tras limpiar `.next/types` stale de las rutas borradas) · eslint tocados 0 · vitest 139/139 · build 0 (243 páginas; acertijos/el-reloj ya NO listadas). Diseño previo de la ruleta casino (agente) COMPLETO — `apostar_casino_elementos` + tabla `trastienda_casino` + zonas/pagos, migración propuesta 0127 — PENDIENTE aprobación del usuario antes de implementar.
- RESULTADO: VERIFICADO POR CÓDIGO. PENDIENTE usuario: aplicar `0123` → `0124` → `0125` → `0126` (en ese orden) a prod, luego retesteo por tunnel: QA fuera de rankings/mesas, oráculo consistente, mesa paginada, ausencia de Acertijos/El Reloj, mensajes neutros.

### CLAIM: Trastienda ruleta casino (0127) · orchestrator+store-economy · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `supabase/migrations/0127_trastienda_ruleta_casino.sql` (nuevo), `src/lib/trastienda/casino.ts` + `casino.test.ts` (nuevos), `src/app/api/trastienda/casino/route.ts` (nuevo), `src/components/trastienda/{Ruleta,TrastiendaClient,HistorialTrastienda}.tsx`, `src/lib/trastienda/tipos.ts`, `messages/{es,en}.json`.

### CIERRE: Trastienda ruleta casino (0127) · orchestrator+store-economy · 2026-09-09
Resultado:
- CONSTRUÍ `0127_trastienda_ruleta_casino.sql` (diseño aprobado del PO 2026-09-09): catálogo `trastienda_casino_elementos` con los 118 elementos (6 alcalinos, 6 alcalinotérreos, 38 transición, 12 post-transición, 6 metaloides, 7 no metales, 6 halógenos, 7 gases nobles, 15 + 15 lantánidos/actínidos); tabla `trastienda_casino` (RLS select-propia) + RPC `casino_elementos_en_zona` (zonas: paridad, grupo:1..18, grupo:transicion, periodo:1..7, tipo, elemento:X) + RPC `apostar_casino_elementos` (server-authoritative, elige al azar entre los 118, `payout = round(monto × (118/n) × 0.88)`, fichas 100/250/500/1000, límite 20/día, premio raro ~5% con ramas boost/escudo/congelamiento/fuente/marco/título iguales a 0123); `fetch_trastienda_historial` re-creada para incluir `trastienda_casino` como tipo `casino`.
- Espejo TS en `casino.ts` (misma tabla periódica + `EV_CASA_CASINO=0.88`, `FICHAS_CASINO`, `LIMITE_CASINO_DIARIO=20`) + tests (conteos, paridad 59/59, EV por zona ~0.88, zonificación, rechazo de inválidas). Fix en sesión: símbolos como "Au" no son todo-mayúsculas → lookup case-insensitive en `elementoEnZona`/`esZonaCasinoValida` y en el SQL (`upper(e.simbolo) = upper(v_valor)`); grupo 1 = 7 (incluye el hidrógeno).
- Cliente: `Ruleta.tsx` reescrita como mesa de apuestas casino (tabla periódica 18 columnas funcionando por `gridColumnStart`, f-bloques de 15, color por tipo vía `colorElementoCasino`, pills de zonificación — paridad/grupo transición/grupos/periodos/familias —, selector de fichas, resumen con posibilidades×multiplicador×pago, botón APOSTAR con sweep cada 110 ms y resultado con resaltado del elemento ganador + premio raro); `TrastiendaClient.tsx` con sub-pestañas 🎰 ruleta / 🎲 juegos; `HistorialTrastienda.tsx` con rama `casino` (símbolo del ganador en el badge, `elemento → simbolo` en el detalle); claves i18n es/en para toda la mesa; tipos `ResultadoCasino`.
- VERIFIQUÉ: tsc 0 (tras limpiar `.next/types` stale de la ruta nueva) · eslint tocados 0 · vitest 147/147 (8 suites casino) · build 0 (244 páginas, `/api/trastienda/casino` listada). Paridad i18n ruleta es/en verificada por script.
- RESULTADO: VERIFICADO POR CÓDIGO. PENDIENTE usuario: aplicar en orden `0123` → `0124` → `0125` → `0126` → `0127` + `NOTIFY pgrst, 'reload schema';` y retestear las fichas/mesa/límite + premio raro por tunnel. La ruleta clásica (`ruleta.ts` legacy + `/api/trastienda/girar-ruleta`) queda sin uso en la UI pero intacta (no se tocó).

### CLAIM: F3 español neutro latinoamericano · orchestrator+i18n · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `messages/es.json`, 13 archivos de componentes/páginas/API, `supabase/migrations/0128_espanol_neutro.sql` (nuevo), scripts `{normalizar-espanol,detectar-voseo,analizar-voseo-funciones,generar-migracion-neutro,verificar-0128}.mjs`.

### CIERRE: F3 español neutro latinoamericano · orchestrator+i18n · 2026-09-09
Resultado:
- CONSTRUÍ: `normalizar-espanol.mjs` (mapeo token→token, límites Unicode-aware, solo valores JSON) aplicado a `messages/es.json` — ~53 strings voseo→tuteo (tenés→tienes, podés→puedes, querés→quieres, elegí→elige, probá→prueba, necesitás→necesitas, sumate→súmate, apretés→aprietes, revisá→revisa, multiplicá→multiplica, etc.). 13 archivos con voseo hardcodeado corregidos (SalaEsperaDuelo, ConvertirCuenta, mensajeError, feed/retar, profesor/crear-grupo, 5×Diagnóstico de mundos, ClanesClient, login, registro, FeedSidebar, privacidad, terminos, Onboarding DiagnosticoClient, MundoBloqueado). Generación programática de `0128_espanol_neutro.sql`: 9 funciones recreadas con `raise exception` en neutro (reportar_usuario, crear_problema_personalizado, reportar_post, unirse_invitacion_duelo, crear_clan, reportar_mensaje_clan, mensajes_de_clan, desbloquear_mundo, elegir_mundos_iniciales); verificación por script de que solo difieren los literales de mensaje (lógica idéntica). salir_del_clan sin cambios (estás es neutro).
- VERIFIQUÉ: tsc 0 · eslint 13 archivos 0 errores nuevos (4 preexistentes en DiagnosticoClient:72/89/232 de react-compiler refs, ajenos) · vitest 147/147 · paridad es/en 555/555 · voseo residual en es.json solo «más»/«estás» (neutrales) tras 3 pasadas.
- RESULTADO: VERIFICADO POR CÓDIGO. PENDIENTE usuario: aplicar `0128` tras `0127` + `NOTIFY pgrst, 'reload schema';`. PENDIENTE contenido: tips/lecciones seed con rioplatense en migraciones ya aplicadas (0005:71, 0015:123/152/166, 0026:48/51, 0027:31, 0032:25/49, 0056:449, 0089:312, 0101:51/58/103, 0108:389, 0109:358/380/389/395) — pase de contenido futuro, no UPDATEs a ciegas sin DB.

### CLAIM: F4 marketing — inventario + auditoría + eje oscuro · marketing/orchestrator · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/marketing/**` (docs + assets, SOLO docs — sin tocar código de la app ni migraciones), `docs/audits/MARKETING-AUDIT.md` (nuevo), `docs/marketing/assets/piezas/pieza-oscura-*.html` (nuevos) + PNG de preview, `docs/marketing/assets/pantallas-oscuras/` (carpeta destino + README, nueva). Visualización de los PNG generados: NO pude (modelo sin entrada de imágenes) → revisión visual del usuario.

### CIERRE: F4 marketing — inventario + auditoría + eje oscuro · marketing/orchestrator · 2026-09-09
Resultado:
- CONSTRUÍ: inventario de la línea (`docs/marketing/` = 20 .md · 30 capturas reales · 8 piezas HTML+PNG · pipeline `scripts/piezas-reales.mjs`); auditoría docs-vs-código con hallazgos y file:line en `docs/audits/MARKETING-AUDIT.md`; 4 plantillas HTML del eje oscuro (`pieza-oscura-*`: 8-mundos-square, numeria-sprint-story, reto-diario-square, melodia-banner) con tokens dark REALES de `globals.css:47-56`, `<img>` que carga primero `../pantallas-oscuras/<nombre>.png` (dark final) y cae solo a la captura clara real (foco de luz, DIRECCION-ARTISTICA §9); carpeta `pantallas-oscuras/` con README de capturas + tabla pieza↔captura; READMEs (`docs/marketing/README.md`, `assets/piezas/README.md`) actualizados.
- VERIFIQUÉ: `node scripts/piezas-reales.mjs` renderizó los 8 PNG (4 claros + 4 oscuros) con tamaños correctos (square 1080×1080 · story 1080×1920 · banner 1200×630); facts citados con file:line: nivel mundo vigente 34/45/21 (`worldLevel.ts:46-49`, `0117`, `0125:184`) vs vieja 50% (`PRODUCT-MESSAGING.md:52,55`, `AD-CONCEPTS.md:90`, `0080`); 8 mundos reales (`mundos.ts:19-28`, `0110`, `precios.ts:13`) vs `docs/MARKETING.MD:8-9` (6 + "no número fijo"); feed social desactivado (`SocialClient.tsx:16-19`) vs `AUDIENCE.md:31`; tour: `Header.tsx:27-31` desactivado + `PrimeraVezTip.tsx` existe (PARCIAL); Pro solo informativo (`pro/page.tsx:12-16` → coincide); retos 5/45 (`reto-diario/page.tsx:11`, `reto-semanal/page.tsx:11`) y "10 preg/60 s" (`es.json:500`); dark mode real (`globals.css:47-56,79`, `ThemeToggle.tsx`, `layout.tsx:120-130`, `ProfileMenu.tsx:62`). tsc/lint/test/build: NO aplican (cero cambios de código/migraciones; cambios solo docs + HTML estático fuera de `src/`).
- RESULTADO: VERIFICADO POR CÓDIGO. **BLOQUEADO-con-plan** (captura real del dark mode requiere tunnel del usuario → dejar PNG en `docs/marketing/assets/pantallas-oscuras/` y correr el script). Corregir pendiente: `PRODUCT-MESSAGING.md:52,55`, `AD-CONCEPTS.md:90` (fórmula vieja), `AUDIENCE.md:31` (feed desactivado), `docs/MARKETING.MD:8-9` (6 mundos y "no número fijo"), confirmar umbral `requireNivelCuentaRankeds` (docs dicen nivel 5). Revisión visual de los 8 PNG por el usuario.

### CLAIM: F5 auditoría Tienda/Trastienda (docs vs código) · store-economy+orchestrator · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/audits/STORE-ECONOMY-AUDIT.md` (nuevo), `docs/audits/TRASTIENDA-ECONOMIA.md` (header + nota de divergencias), `docs/audits/REQUIREMENTS-CHECKLIST.md` (ítems 34/41/44 y pendiente 3), `src/lib/trastienda/ruleta.ts` (comentario legacy, sin tocar valores/test). Sin cambios de runtime ni migraciones.

### CIERRE: F5 auditoría Tienda/Trastienda (docs vs código) · store-economy+orchestrator · 2026-09-09
Resultado:
- CONSTRUÍ `docs/audits/STORE-ECONOMY-AUDIT.md`: cruce Tienda+Trastienda docs-vs-código con file:line. Tienda: catálogo real = 24 ítems / 47.900 Chispas (sin paquete) — el comentario `costos.ts:13` y `TRASTIENDA-ECONOMIA.md:17`/"TIENDA-EXPANSION.md:10,14" citan "~23.200 / 26 ítems (8 marcos rango)" (real: 6 marcos rango) → divergencias T-01..T-04. Trastienda: M1 duels-only (límites 10 y 500, cuotas = spec), M2 mult ajustados + self-heal (sin job semanal), M3 8/9 títulos (falta `gniñardo`), M4 reemplazada por mesa casino 0127 (factor 0.88), M5 3 minijuegos activos (Acertijos/El Reloj eliminados en 0126), T-01/T-02 RLS sin grants (BAJO latente, bloqueado por decisión de no parchear sin repro), S5 fuera de alcance.
- HALLAZGOS: H-01 comentario SQL `0127:17,342` dice "EV de casa ~ 0.92" pero factor 0.88 => EV jugador ~0.88 (PROPUESTA, no se tocó SQL); H-02 notas desactualizadas "título=escudo placeholder" corregidas (`REQUIREMENTS-CHECKLIST:90,102` + comentario `ruleta.ts`); H-03 **voseo visible en TIENDA** `es.json:203,205,207,209` "Revisá tu conexión." (F3 no normalizó tokens capitalizados) — **reportado, NO corregido** (regla de la tarea); H-04 clave `tenes` (es.json:231) solo nombre de key, valor neutro.
- APLIQUÉ (código-safe): comentario `src/lib/trastienda/ruleta.ts` (legacy 0127 + títulos reales desde 0123, sin tocar `VALOR_SEGMENTO_CHISPAS` ni test); header de `TRASTIENDA-ECONOMIA.md` → IMPLEMENTADO + bloque de divergencias; notas 34/41/44 y pendiente 3 de `REQUIREMENTS-CHECKLIST.md`.
- VERIFIQUÉ: `npx tsc --noEmit` 0 · eslint `ruleta.ts` 0 · vitest 147/147 (comentario-only; `ruleta.test.ts` intacto).
- RESULTADO: VERIFICADO POR CÓDIGO. Backlog: M1 rankeds/reto_semanal DIFERIDO-POR-DECISIÓN (`0123:11`); job semanal M2 DIFERIDO-POR-DECISIÓN (self-heal cubre); ruleta clásica CERRADO (reemplazada); `gniñardo` PENDIENTE-DECISIÓN; Acertijos/El Reloj CERRADO por diseño; voseo "Revisá" PROPUESTA (espera decisión). PENDIENTE usuario: aplicar `0123→0124→0125→0126→0127→0128` + `NOTIFY pgrst, 'reload schema';` y retestear por tunnel. Sin acceso DB/browser en este entorno.

### CLAIM: F6 progresión — nivelado real (mundo+cuenta), recompensas, animación level-up · gameplay+backend-supabase+store-economy+visual-design · 2026-09-09
Estado: EN CURSO.
Áreas tocadas: audit nuevo `docs/audits/PROGRESION-AUDIT.md`; cierre seguro del hook de level-up: `src/components/NivelCuentaSubio.tsx` (nuevo), `src/app/api/practica/finish/route.ts` + `src/app/api/enigmia/finish/route.ts` (exponer `nivelCuenta`), `src/app/[locale]/practica/SprintSummary.tsx` + 12 clientes de práctica (wiring de `nivelCuenta`), `messages/{es,en}.json` (1 key cada uno). SIN migraciones nuevas ni toques a economía previa. Verificación: tsc/eslint/vitest.

### CIERRE: F6 progresión — nivelado real (mundo+cuenta), recompensas, animación level-up · gameplay+backend-supabase+store-economy+visual-design · 2026-09-09
Estado: CERRADO.
- VERIFICA: `npx tsc --noEmit` 0 · eslint 16 archivos tocados 0 · vitest 147/147 · `npm run build` OK (244 páginas). Audit completo en `docs/audits/PROGRESION-AUDIT.md`.
- CERRADO: umbral rankeds = 5 (`src/lib/auth/guard.ts:184`, docs y página rankeds-bloqueado coinciden).
- VERIFICADO POR CÓDIGO: fórmula mundo 34/45/21 + techos (`worldLevel.ts:46-51`); curva cuenta `0118` (200/300/550/900/1400/1900/2400) vs `0070` (floor(100·power(n,1.6))) — conviven según migración aplicada; `0125:7` concilia con `greatest(...)`; bonus `50·n+250` pagado solo en transición por `acreditar_chispas` (revocada al cliente, `0115:102`; `registrar_xp_diario` no devuelve `nivel_subio/bonus`).
- IMPLEMENTADO: `NivelCuentaSubio.tsx` (GestoLogo + tono "nivel") + `nivelCuenta:{subio,nivel}` en ambos finish routes (before/after read, seguro bajo cualquier curva) + wiring en 13 resúmenes + key `subisteDeNivel` es/en.
- PENDIENTE (requiere SQL/decisión): propagar monto de bonus desde `acreditar_chispas`/`recompensa_nivel_cuenta` (sin grant) y completar overlay burst de LEVEL-UP-ANIMACION. PROPUESTA: completar mapas 4→8 mundos en `NivelMundoSubio.tsx:13-25`.
- RIESGO CERO: cambios solo lectura-safe; sin migraciones, sin tocar economía ni SQL. Aplicar 0117→0125 en prod sigue PENDIENTE usuario (NO PUEDO VERIFICAR desde este entorno).

### CLAIM: F7 auditoría Rankeds y Clanes · orchestrator+matchmaking+social · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/audits/RANKEDS-AUDIT.md` (nuevo), `src/types/database.ts` (tipos alineados a 8 mundos), `docs/audits/REQUIREMENTS-CHECKLIST.md` (legend + resumen + pendiente 5), `docs/agent-work/ACTIVE.md`, `docs/PROGRESO.md`.
Plan: AUDITAR (rankeds: ELO/matchmaking/serie/ranking/guards · clanes: membresías/roles/nivel/misiones/guerra/chat/estandarte/mapa) → CRUZAR con checklist → CERRAR riesgo-cero → VERIFICAR (tsc/eslint/vitest) → DOCUMENTAR.

### CIERRE: F7 auditoría Rankeds y Clanes · orchestrator+matchmaking+social · 2026-09-09
Resultado:
- VERIFICA: `npx tsc --noEmit` **0** · `npx eslint src/types/database.ts` **0** · `npx vitest run` **147/147** (13 files). Cero migraciones nuevas en esta fase.
- **Rankeds → VERIFICADO POR CÓDIGO** (`docs/audits/RANKEDS-AUDIT.md`): guards (`requireUsuario`+`bloquearInvitado`+`requireNivelCuentaRankeds`=5, `guard.ts:184`); ELO 800 inicial + 6 rangos TS≡SQL (`database.ts:262-269` ≡ `0043:117-130`); K por rango (0072) y ×1.5 en series (0073); serie mejor-de-3 (`mi_puntaje` 0071/0074, `rival_puntaje` 0094); matchmaking operativo `0109` (8 mundos, guard mundo inválido, Platino+ "todas las ciudades" y casual ≠ aleatorio en `0109:504-508`); rechazo en cascada (0047); rendirse/abandonado (`0088`: estado `'abandonado'` + `abandonado_por`); ranking anti-anónimos (0119) + anti-QA (0126); i18n `Rankeds` 43/43 es/en. Hipótesis "UI↔server mundos" DESCARTADA (8≡8).
- **Clanes → VERIFICADO POR CÓDIGO**: `0068` (check bots/jugadores, tag 2-5, índice único jugadores, roles fundador/guía/miembro), `0069`/`0070` (`miembros_de_clan` 0070:468, `rival_de_clan` 0070:575, `procesar_cierre_semana_clanes` 0070:614), `xp_requerido_nivel_clan = floor(4000·niv^1.9)` sin cap (0070:64) + grant (0100:81), misiones semanales **sin cron** (lazy, `0068:307,324`), chat rate-limit + push (0092/0100 + edge `notify-clan-mensaje`), estandarte/imagen (0084 bucket 2MB solo fundador + `mapa_clanes` 0084:127), mapa/ciudad (`0076:57`, `tierCiudad` 1/3/6/11/21), `COSTO_CREAR_CLAN=5000` (`ClanesClient.tsx:17`).
- CERRÉ: pendiente 5 del checklist — `Mundo`/`MundoDuelo` (`database.ts:38`, `:328`) alineados a 8 mundos (sin importadores, riesgo-cero); legend + resumen del checklist (doc drift: decía 50 → 65 filas, "ELIMINADO POR DISEÑO" fuera del legend); "Última migración analizada" → 0128.
- Documentado sin fix (scope/DB): D-03 `SerieDueloClient.tsx` hardcode español (i18n gap no captado por I18N-AUDIT en "Rankeds"); D-04 voz mixta en Clanes ("Tenés" `:561` vs "tienes" `:457`) + "Hacé click" `mundo/page.tsx`; D-05 = P0#4 TECH-DEBT parcialmente confirmado: casual no toca ELO (0050+E2E) pero el fallback de bots >30s puede mandar un casual contra bot (`0109:552-560`) → requiere migración, **BLOQUEADO-POR-DB**. S5/S9 siguen BLOQUEADOS-POR-DB. Runtime/tunnel E2E sigue PENDIENTE usuario.

### CLAIM: F9 browser testing — plan + documentación · orchestrator · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/audits/BROWSER-TESTING-PLAN.md` (nuevo, entregable de la fase), `docs/agent-work/ACTIVE.md`, `docs/PROGRESO.md`. Cero cambios de código/migraciones (fase solo documentación).

### CIERRE: F9 browser testing — plan + documentación · orchestrator · 2026-09-09
Resultado:
- CONSTRUÍ `docs/audits/BROWSER-TESTING-PLAN.md`: consolidación de TODOS los pendientes de verificación por navegador de F0–F8 en **9 flujos / 55 ítems** con estado y fuente `file:line`/migración por fila. Estados: **47 VERIFICADO EN CÓDIGO** · **1 VERIFICADO CON TEST** (casino `casino.test.ts`, 147/147) · **1 PROPUESTA** (título `gniñardo`, 0123) · **4 PENDIENTE-USUARIO** (landing/invitado-bloqueado visuales, capturas dark H4, instalación PWA I3) · **2 BLOQUEADO-POR-DB** (bots casual `0109:550-562`; cierre guerra semanal `0070:614`). Bloques **APPLY-FIRST** (`0116→0128` en orden + `NOTIFY pgrst, 'reload schema';`), **QA-ENV** (cuentas QA + `es_cuenta_prueba` 0126:30-33) y **TUNNEL-ONLY**; pirámide código/DB/visual; **inventario Playwright** (real: `playwright ^1.62.1` solo devDep, sin config ni `e2e/` ni `@playwright/test`, uso ad-hoc solo en `scripts/piezas-reales.mjs`).
- VERIFIQUÉ en vivo: `npx vitest run` **147/147** (13 files); browsers instalados en `%LOCALAPPDATA%\ms-playwright`; sin dev server en :3000; NOTIFY embebidos en `0122:79`/`0123:913`/`0125:330`/`0126:889`/`0127:512` (ausentes en 0121/0124/0128); `es_cuenta_prueba` en `0126:30-33`; íconos PWA `public/icon-{192,512}[-maskable].png`+`icon.svg` presentes; `.env.test.local` existe; `reto-semanal/page.tsx:11` (45 preguntas). tsc/lint/test/build: **no aplican** (cero cambios de código/migraciones).
- RESULTADO: entregable F9 listo. **0 ítems sin fuente** (ninguno `NO PUEDO VERIFICAR`). PENDIENTE usuario: aplicar migraciones, levantar tunnel y recorrer el plan en orden (§2 del doc); luego marcar los ítems `VERIFICADO EN DB`/`VERIFICADO EN BROWSER`. D8/F7 siguen **BLOQUEADOS-POR-DB**; H4 (capturas dark) pendiente desde F4.

### CLAIM: F10 auditoría UX de producto final · orchestrator · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/audits/UX-AUDIT.md` (nuevo), `docs/agent-work/ACTIVE.md`, `docs/PROGRESO.md`. Cero cambios de código/migraciones (fase solo documentación).
Plan: AUDITAR (flujos/affordances/feedback/copy ~100 páginas) → RECONCILIAR PRODUCT-UX-AUDIT → CERRAR riesgo-cero (si aplicable) → DOCUMENTAR.

### CIERRE: F10 auditoría UX de producto final · orchestrator · 2026-09-09
Resultado:
- CONSTRUÍ `docs/audits/UX-AUDIT.md`: tabla de ~18 hallazgos con `file:line`, reconciliación con PRODUCT-UX-AUDIT (42 hallazgos previos), top 5 priorizado, cobertura de 30+ archivos leídos.
- CIERRE: 0 cambios de código/migraciones. Todos los candidatos a cierre requieren decisión PO (confirmación salir, 2-step tienda, vinculación cuenta) o pertenecen a otra fase (F3 voseo TSX, F11 visual, I18N-AUDIT). Patrón consistente con fases F8/F9 del repo.
- VERIFICADO EN CÓDIGO: 8 hallazgos PRODUCT-UX-AUDIT cerrados/verificados — RankingElo empty #17 (`RankingElo.tsx:103-106,184-187`), BotonRendirse confirm #26 (`BotonRendirse.tsx:44-66`), SalaEspera timeout #27 (`SalaEsperaDuelo.tsx:70-86`), error.tsx retry #33 (`error.tsx:33-35`), loading.tsx brand #34 (`loading.tsx:9-12`), Recuperar copy #3 (`RecuperarForm.tsx:35-37`), Amigos empty #15 (`AmigosClient.tsx:109-112`), Tienda utilidad confirm #9 parcial (`TiendaClient.tsx:539-561`). 8+ confirmados abiertos.
- HALLAZGOS NUEVOS: Ajustes sin sección Cuenta (`AjustesClient.tsx`), perfil nivel ??1 sin hint (`perfil/[userId]/page.tsx:151`), i18n gaps (Leaderboard `:143`, SalaEspera `:95-100`, error.tsx `:25-35`).
- tsc/eslint/vitest: no aplican (fase solo documentación; cero cambios de código).

### CLAIM: F11 auditoría visual consistencia (código) · orchestrator · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/audits/VISUAL-CONSISTENCY-AUDIT.md` (nuevo), `src/components/BotonesFinPartida.tsx` (C-01), `src/components/NivelMundoSubio.tsx` (C-02), `docs/agent-work/ACTIVE.md`, `docs/PROGRESO.md`.
Plan: MAPEAR tokens → INVENTARIAR estilos duplicados → ANALIZAR dark mode → AUDITAR íconos/tipografía → CERRAR riesgo-cero → DOCUMENTAR.

### CIERRE: F11 auditoría visual consistencia (código) · orchestrator · 2026-09-09
Resultado:
- CONSTRUÍ `docs/audits/VISUAL-CONSISTENCY-AUDIT.md`: mapa completo de tokens CSS (11 core + 13 trastienda + @theme mapping), 8 colores de mundo, 8 fuentes, inventario de estilos (296 .tsx), dark mode analysis, íconos/emojis, tipografía, 6 hallazgos + 6 propuestas futuras.
- CERRÉ 2 riesgo-cero: (C-01) `BotonesFinPartida.tsx:20` — `#3FB88B` → `var(--correcto)` (mejora dark mode, mismo color light); (C-02) `NivelMundoSubio.tsx:13-25` — agregados 4 mundos faltantes a `NOMBRE_MUNDO` + `COLOR_MUNDO` (anatomía/melodía/trigonometría/historia). (C-03) NO necesario: `SerieDueloClient.tsx`, `RetoClient.tsx`, `FondoCursorMundo.tsx` ya tenían los 8 mundos.
- VERIFICADO: tsc **0** · eslint tocados **0** · vitest **147/147** (13 files).
- RESULTADO: VERIFICADO POR CÓDIGO. Fortalezas: tokens CSS bien diseñados, dark mode arquitectónicamente correcto (CSS vars, no Tailwind dark:), tipografía coherente, radius/shadows en escala. Debilidades PROPUESTA: colores de mundo inconsistentes (4/8 sin colores.ts), #6C4CF1 hardcodeado en ~20 archivos (JS contexts), #FFC53D en ~40 lugares.

### CLAIM: F12 Función vs Marketing (promesa vs producto real) · orchestrator · 2026-09-09
Estado: CERRADO (ver CIERRE abajo).
Áreas tocadas: `docs/audits/FUNCION-VS-MARKETING.md` (nuevo), `docs/agent-work/ACTIVE.md`, `docs/PROGRESO.md`. Cero cambios de código/migraciones (fase solo documentación).
Plan: PROCESAR claims de docs marketing + messages/ → VERIFICAR en código → PRODUCIR matriz → CERRAR.

### CIERRE: F12 Función vs Marketing (promesa vs producto real) · orchestrator · 2026-09-09
Resultado:
- CONSTRUÍ `docs/audits/FUNCION-VS-MARKETING.md`: matriz de 24 claims (17 ✅ / 5 ⚠️ / 2 ❌ / 1 no-existe) con file:line por celda.
- TOP claims dañinos: #15 "50% dominio" (fórmula vieja, real 45% — 4 docs afectados), #11 feed social (desactivado en código, vendido en AUDIENCE.md:31).
- Temas transversales: (a) feed social → quitar de marketing o activar; (b) fórmula nivel mundo → actualizar 4 docs; (c) Pro → copy "cuando quieras" correcto; (d) tour → ~30s real, no "guiado de 2min"; (e) casino/trastienda → conectado pero sin nav; (f) PWA → instalable sin offline.
- 0 cierres riesgo-cero: todos los candidatos requieren decisión PO (corregir copy de marketing del PO, activar/quitar feed).
- VERIFICADO: tsc/eslint/vitest no aplican (fase solo documentación; cero cambios de código).
- RESULTADO: F12 CERRADO. El PO tiene la matriz completa para decidir qué prometer, qué matizar y qué quitar.
