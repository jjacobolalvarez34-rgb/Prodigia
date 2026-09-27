# TECH-DEBT — Deuda técnica y tareas pendientes

> Estado: lista viva. Cada item: qué está mal, dónde, impacto, y estado.
> Estados válidos: VERIFICADO POR CÓDIGO / HIPÓTESIS / BLOQUEADO / PENDIENTE / RESUELTO.
> Última actualización: 2026-09-27 (reescrito completo: la versión anterior, del 2026-09-09,
> tenía datos de entorno que ya no son ciertos — ver "Infra/entorno" — y bugs P0 ya resueltos
> hace semanas. Historial completo en `docs/PROGRESO.md`).

## Fuente de verdad de seguridad y prioridades

**No dupliques hallazgos acá**: `docs/audits/REVISION-GENERAL-2026-09-26.md` es la auditoría vigente
(seguridad, producto/legal, UX, docs, repo) con severidad, evidencia y el orden sugerido de trabajo.
`docs/PROJECT-STATE.md` § Seguridad lleva qué de esa lista ya se cerró. Este archivo es para todo lo
demás (deuda que no entró en esa auditoría, o que se descubre después).

## Abierto

1. **`resolver_apuesta_partida` y `resolver_prediccion_ranking` nunca se llaman desde ningún lado**
   (encontrado 2026-09-27, revisando la Trastienda para el fix de SEG-02). Un usuario puede apostar
   Monedas a un duelo ajeno o a su puesto en el ranking semanal (`apostar_partida`/
   `apostar_prediccion_ranking`, con UI real: `ApostarPartida.tsx`/`PrediccionRanking.tsx`), pero la
   función que la PAGA no la dispara nada — la apuesta queda "pendiente" para siempre. `PENDIENTE`:
   agendar esas dos funciones (falta un disparador: al completarse el duelo / al cerrar la semana) o
   sacar la mecánica de la UI hasta tenerlo.
2. **Matchmaking casual mezcla con ranked / usa ELO** — requisito: casual ≠ ranked (ver
   `0050_duelos_casuales.sql`). Sin auditar de nuevo desde la de 2026-09-08 (`docs/audits/
   CASUAL-AUDIT-2026-09-08.md`, dos bugs quedaron documentados sin fix ahí: casual vs bots, doble
   resolución de resultado). `PENDIENTE`.
3. **`docs/MECANICA.md`** describe una mecánica v1 solo de aritmética; el juego tiene 13 mundos,
   retos, duelos, clanes, Trastienda, tienda, Pro. `PENDIENTE actualizar` (o marcar como histórico).
4. **`proxy.ts` sin documentar bien.** `PENDIENTE`.
5. **`docs/PARIDAD_MUNDOS.md` (278 KB) y `docs/PROGRESO.md` (~280 KB)** ya no entran cómodos en el
   contexto de un agente — se leen parciales y se pierden decisiones (DOC-04 de la revisión general).
   `PENDIENTE`: archivar por mes o por mundo.

## Resuelto (referencia rápida — el detalle está en PROJECT-STATE.md o en el commit)

- Selección de 2 mundos trabada, reto diario/semanal con error, varios bugs de matchmaking/invitación
  por link/ranking con cuentas incompletas — todos de la tanda 2026-09-07/08, resueltos esa semana.
- El repo SÍ tiene git disponible y el asistente puede commitear (la nota vieja de "no hay git CLI"
  era de un entorno anterior sin esa herramienta, no una limitación permanente del proyecto).
- SEG-02 (doble o nada farmeable), SEG-03 (gate de edad de la Trastienda sin verificación server-side),
  PROD-01 parcial (Monedas propias no comprables para la Trastienda), higiene de repo (REPO-01/02/03,
  key de fal.ai) — 2026-09-27, ver `docs/PROJECT-STATE.md` § Seguridad.

## Infra / entorno (verificar de nuevo si cambia de máquina)

- Sin acceso a dashboard de Supabase ni a la DB real desde este entorno → no se puede validar en vivo
  RLS/migraciones; todo lo marcado "verificado" en una sesión de código es VERIFICADO POR CÓDIGO, no
  contra producción. El usuario aplica las migraciones a mano. `BLOQUEADO` (estructural).
- Sin browser real para e2e en la mayoría de sesiones (alguna sesión puntual sí levantó Playwright
  headless). `VERIFICAR caso a caso`.
