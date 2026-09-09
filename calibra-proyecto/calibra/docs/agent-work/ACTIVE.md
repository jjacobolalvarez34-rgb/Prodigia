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
| PENDIENTE | Piezas eje OSCURO (requiere capturas reales del dark mode — tunnel del usuario) | marketing | 2026-09-09 |
| COMPLETADO (corte 1) | Módulos nuevos de Trastienda (ruleta, volado, pizarra, historial) + economía server `0121` + fix resiliente doble o nada — M1/M2/M3 y minijuegos restantes DIFERIDOS | store-economy/visual-design/ux-ui | 2026-09-09 |
| COMPLETADO (corte 2) | Trastienda corte 2: fix Pizarra (`0122`, PGRST202) + página propia `/trastienda` + M1 apuestas + M2 predicción ranking + M3 títulos + minijuegos Calcu/Acertijos/Reloj — SQL `0123`/`0124` escritos + cliente completo (rutas, 5 componentes, i18n es/en, títulos en catalogo/verificar) | store-economy/visual-design/ux-ui | 2026-09-09 |
| PENDIENTE | Auditoría RLS/seguridad: repro en vivo + fix S5 (p_precision) y S9 (edge) | auth-security | — |
| PENDIENTE | Fase C: auditoría economía/tienda | store-economy | — |
| PENDIENTE | Fase C: auditoría marketing | marketing | — |
| PENDIENTE | Fase C: auditoría paridad de mundos | qa-e2e | — |
| PENDIENTE | Fase G: cierre de PROGRESO/PROJECT-STATE | orchestrator | — |

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
