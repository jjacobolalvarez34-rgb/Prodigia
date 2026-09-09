# PROJECT-STATE — Estado del proyecto

> Fuente de verdad del estado ACTUAL (verificado). Última actualización: 2026-09-08.
> Método: cada afirmación trae estado válido (§1 de `docs/AGENT-RULES.md`).

## Identidad

| | |
|---|---|
| Nombre | Prodigia (package `prodigia`, v0.1.0) |
| Qué es | Práctica de cálculo mental con dificultad adaptativa, acertijos de lógica, lecciones, duelos, clanes, rankeds, retos diarios/semanales, tienda y 8 mundos |
| Idioma | Español (rioplatense, "vos"), i18n con next-intl (`[locale]`) |
| Raíz | `D:\Repositorios\Prodigia\calibra-proyecto\calibra` |

## Stack (VERIFICADO POR CÓDIGO)

- Next.js 16.3.0 (App Router) + React 19.2.8 + TypeScript strict + Tailwind v4. `next.config.ts` con plugin next-intl (`./src/i18n/request.ts`). Rutas con segmento `[locale]`.
- Supabase (Postgres + Auth + RLS). Clientes: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`. Edge: `supabase/functions/` (notify-duelo, notify-clan-mensaje, racha-en-riesgo, _shared).
- Capacitor 8 para Android (`@capacitor/android`, `@capacitor/push-notifications`).
- Animación: GSAP, Framer Motion. 3D: three, ogl. Mapas: react-simple-maps + world-atlas.
- Tests: vitest (`npm test`), playwright (dev). Build verificado en sesión anterior: 70 rutas (PENDIENTE re-verificar en esta sesión).

## Mundos (8) — VERIFICADO POR CÓDIGO

`precios.ts:13` define `MUNDOS_PAGOS = ["numeria","geografia","enigmia","quimia","anatomia","melodia","trigonometria","historia"]`.

**Ojo:** `docs/ESPECIFICACION.md` dice 5 mundos — documentación desactualizada (ver TECH-DEBT). El código maneja 8.

## Migraciones

119 archivos (`0001_init.sql` a `0120_cerrar_s0_s1.sql`). Series notables:

- Onboarding 2 mundos: `0112_flujo_bienvenida.sql` (RPC `elegir_mundos_iniciales(text[])`), `0116_fix_elegir_dos_mundos.sql` (self-heal de cuentas con 1 mundo heredado → 2).
- Retos diario (5 preguntas) + semanal (45) con ranking público y logros: `0113_reto_diario_y_semanal.sql`.
- Push: `0114_push_notifications.sql`.
- Seguridad: `0035_auditoria_lanzamiento_rls`, `0036_fix_permisos_xp_tienda`, `0060_auditoria_rls_2`, `0102_cerrar_huecos_seguridad_fase4`, `0115_cerrar_huecos_seguridad_fase5` (PENDIENTE de correr en prod).
- Mundos: `0108_trigonometria`, `0109_historia`, `0110_ocho_mundos`.
- Matchmaking casual: `0050_duelos_casuales.sql`.
- **Tanda 2026-09-08 (las 3 nuevas PENDIENTES DE APLICAR EN PROD — verificadas por código + simulación, NO aplicadas por Rest):**
  - `0117_curva_nivel_mundo.sql` — curva de nivel de mundo (volumen 34% / dominio 45% / lecciones 21%) + RPC `registrar_progreso_mundo`. Ver `docs/audits/NIVELES-MUNDOS-2026-09-08.md`.
  - `0118_niveles_cuenta_recompensas.sql` — escalera de XP por tramos + `recompensa_nivel_cuenta` (50·n+250, **APROBADA por PO 2026-09-08**, aplicada). Ver `docs/audits/NIVELES-PERSONALES-2026-09-08.md`.
  - `0119_filtro_ranking_usuarios_permanentes.sql` — ranking solo con display_name + email confirmado; endurece `ranking_semanal()` (guard + revoke public/anon). Ver `docs/audits/USER-RANKING-AUDIT.md`.
  - `0120_cerrar_s0_s1.sql` — **cierra la familia de seguridad S0/S1/S2/S3/S4/S8** (2026-09-08): dropea policies amplias de `attempts`/`logic_attempts`/`skill_levels`/`logic_skill_levels`/`daily_progress`; redefine `registrar_xp_diario` (ignora `p_xp`, deriva el XP real del día), `registrar_progreso_mundo`/`registrar_puntos_mundo` (derivan de `xp_real_por_mundo`); nuevos RPC `insertar_intento`/`insertar_intento_logica` security definer que calculan xp/anti-apuro/calibración server-side. **PENDIENTE DE APLICAR EN PROD**.
- **PENDIENTE EN PROD:** migración `0042_ranking_excluye_invitados.sql` (según PROGRESO.md). Estado: NO VERIFICADO en esta sesión.

## Bugs P0 reportados (a reproducir, NO asumir)

1. **Selección de 2 mundos** — **DIAGNOSTICADO Y CORREGIDO (2026-09-08)**: repro en vivo reportado por el usuario (elige 2 mundos → "ya elegiste tus dos mundos iniciales" trabado; al recargar solo "numeria" activo). Causa: cuenta con `mundos_desbloqueados = ['numeria']` heredado de la fase vieja de 1 mundo gratis → la RPC `elegir_mundos_iniciales` rechazaba cualquier array no vacío (0112:124) y el guard solo mandaba a onboarding a los que tenían 0 mundos. Fix: migración `0116` (cardinalidad 1 → se reemplaza con la elección; solo `>= 2` bloquea) + guard/los pickers (`< 2` va a onboarding, y ante el error "ya elegiste" navega a la home en vez de trabarse). Verificado por tsc/lint (test/build limpios); **falta que el usuario aplique `0116` y retestea por el tunnel**. Estado: VERIFICADO POR CÓDIGO / PENDIENTE verificación en vivo.
2. **Reto diario** tira error — **RESUELTO (2026-09-07)**: loop infinito de render por `useSyncExternalStore` con snapshot inestable en `RetoClient.tsx`. Fix: `crearSnapshotProgreso` (`src/lib/progresoReto.ts`). Verificado por test de regresión + tsc/lint/build. Flujo en navegador: BLOQUEADO (sin browser en el entorno).
3. **Reto semanal** tira error — **RESUELTO (2026-09-07)**: misma causa raíz (componente `RetoClient` compartido). Misma verificación.
4. **Matchmaking casual** — **AUDITADO (2026-09-08)**: BUG#1 (re-birth fantasma + match duplicado) y BUG#3 (stats V/D/tasa con casuales) y BUG#4 (logros contando casuales) CORREGIDOS en cliente; BUG#2 (casual vs bots) y BUG#5 (doble resolución de resultado → feed/ELO duplicado) DOCUMENTADOS para migración pendiente. No mezcla con ranked/ELO CONFIRMADO por E2E. Ver `docs/audits/CASUAL-AUDIT-2026-09-08.md`.
5. **Reto directo a amigo (partida trabada)** — **REPRODUCIDO Y CORREGIDO (2026-09-08)**: causa A = `NotificacionesDuelo` jamás se suscribía a realtime al entrar por navegación cliente desde /login (getUser() null en mount) → el retado ni se enteraba; causa B = toast hardcodeado a `/practica?operacion=...` rompía mundos != numeria (operation_type null). Fix: re-suscripción con `onAuthStateChange` + `hrefDuelo` + etiqueta traducida. VERIFICADO EN BROWSER con 2 cuentas QA (Numeria y Geografía). Ver `docs/audits/RETO-DIRECTO-AMIGO-2026-09-08.md`.
6. **Invitación por link** — **AUDITADA Y CORREGIDA (2026-09-08)**: bug real corregido (Quimia ofrecía 5 modos pero `crear_invitacion_duelo` acepta 3 → link `opcion invalida`); verificado misma sala/validaciones/resultado invitado. Hallazgos sin fix: `clasificatorio=true` pese a comentario "casual" (discrepancia producto/código) y sin expiración de `duel_invites`. Ver `docs/audits/INVITACION-LINK-AUDIT-2026-09-08.md`.
7. **Ranking con cuentas incompletas** — **CONFIRMADO Y CORREGIDO (2026-09-08)**: 5 de 14 filas del ranking ELO eran perfiles sin `display_name`/sin email confirmado. Fix: `0119` (4 condiciones de "usuario permanente"). Endurecido `ranking_semanal()` contra anon key. NO APLICADO a prod todavía. Ver `docs/audits/USER-RANKING-AUDIT.md`.

## P1 (2026-09-08) — estado de diseño/implementación

- **T4 Niveles de mundos** — CAUSA RAÍZ CONFIRMADA (curva exigía "dominio nivel 10" casi inalcanzable + volumen techo 50000). Fix `0117` + `worldLevel.ts` + tests. 800 problemas ⇒ nivel ~54. PENDIENTE aplicar a prod.
- **T5+T6 Niveles personales + recompensa** — curva por tramos (200→2400 cota) en `0118`. 1000 Chispas flat ANALIZADO Y RECHAZADO → **`50·n+250` APROBADA + aplicada**.
- **T7 Animación level up** — SPEC lista (`LEVEL-UP-ANIMACION-2026-09-08.md`). PENDIENTE implementar: finish route debe exponer `nivelCuenta{subio,nivel,bonus}` + overlay.
- **T2/T3 Trastienda** — DISEÑO listo (`TRASTIENDA-ECONOMIA.md` + `TRASTIENDA-DESIGN.md`). **Moneda = mismas Chispas** (decisión PO fijada). PENDIENTE implementación (requiere aplicar 0120 a prod, que ya cierra S0/S1).

## Auditorías (2026-09-08) — resumen

- **RLS/seguridad** (`docs/audits/AUDIT-RLS-SEGURIDAD-2026-09-07.md`): hallazgos S0-S10. S10 CRÍTICO (`acreditar_chispas` sin validar `auth.uid()`) **corregido** en `0115`; S6/S7 corregidos también. Familia S0/S1/S2/S3/S4/S8 **CORREGIDA en `0120`** (solo queda S5/S9, repro BLOQUEADO). Ver detalle en el informe.
- **Mapa** (`docs/audits/AUDIT-MAPA-2026-09-07.md`): superficie real = 111 páginas, 31 API routes + `/auth/callback`, 122 funciones Postgres únicas, 115 migraciones. Hallazgos F-M1..F-M4 (minoritarios). Ver detalle en el informe.
- **Usuarios/ranking** (`docs/audits/USER-RANKING-AUDIT.md`, 2026-09-08): cuentas incompletas en ranking ELO + anon key legible → fix `0119`. Simulación 14→9 filas, 0 legítimos afectados.
- **Casual** (`docs/audits/CASUAL-AUDIT-2026-09-08.md`): E2E real 2 anon; 3 fixes cliente aplicados, 2 bugs serían requieren migración (bot y doble resolución).
- **Invitación por link** (`docs/audits/INVITACION-LINK-AUDIT-2026-09-08.md`): fix Quimia aplicado; discrepancias documentadas.
- **Reto directo a amigo** (`docs/audits/RETO-DIRECTO-AMIGO-2026-09-08.md`): 2 bugs reales reproducidos y corregidos; e2e 2 cuentas QA.
- **Niveles mundos** (`docs/audits/NIVELES-MUNDOS-2026-09-08.md`) y **niveles personales** (`docs/audits/NIVELES-PERSONALES-2026-09-08.md`): causa raíz + migraciones 0117/0118.
- **Animación level up** (`docs/audits/LEVEL-UP-ANIMACION-2026-09-08.md`): spec técnica+visual (P2).
- **Trastienda**: diseño de economía y visual (`TRASTIENDA-ECONOMIA.md`, `TRASTIENDA-DESIGN.md`).

## Limitaciones del entorno de esta sesión

- Sin CLI de git (`git` no está instalado / no en PATH). No se hacen commits; todo queda en working tree (PROGRESO.md lo confirma).
- Sin acceso a dashboard de Supabase ni a la DB/RLS de producción → verificación en vivo de migraciones nuevas: BLOQUEADO (0117/0118/0119/0116 pendientes de aplicar manualmente por `supabase db push` o SQL editor).
- Browser: **SÍ disponible** (Playwright Chromium headless + dev server en localhost:3000 funcionaron el 2026-09-08: capturas de marketing, e2e casual y e2e reto directo). Ojo: la 1.ª compilación de `/ [locale]` en Turbopack sobre este filesystem lento tarda varios minutos; no levantar un segundo `npm run dev` (se cuelga esperando puerto).

## Docs de referencia

- `docs/PROGRESO.md` — historial completo de sesiones anteriores (vivo, no borrar).
- `docs/ESPECIFICACION.md` — visión (parcialmente desactualizada: 5 mundos vs 8).
- `docs/DIAGNOSTICO.md` — diagnóstico previo de bugs (Caja A = config Supabase en prod; Caja B = manejo de errores).
- `docs/PARIDAD_MUNDOS.md` — matriz de paridad de mundos (auditado 2026-08-27).
- `docs/EMAIL-PENDIENTE.md` — SMTP/magic-link genérico pendiente.
- `docs/MECANICA.md` — mecánica v1 solo aritmética (DESACTUALIZADO).
- `docs/MARKETING.MD` — texts de marketing.

## Lectura recomendada de entrada

1. `AGENTS.md` → 2. `docs/AGENT-RULES.md` → 3. `docs/ARCHITECTURE.md` → 4. este archivo → 5. `docs/PROGRESO.md`.