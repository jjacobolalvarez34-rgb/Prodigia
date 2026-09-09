# TECH-DEBT — Deuda técnica y tareas pendientes

> Estado: lista viva. Cada item: qué está mal, dónde, impacto, y estado.
> Estados válidos: VERIFICADO POR CÓDIGO / HIPÓTESIS / BLOQUEADO / PENDIENTE / RESUELTO.

## P0 — Bugs reportados (a reproducir — ver DIAGNOSTICO.md y PROJECT-STATE.md)

1. **Selección de 2 mundos se traba ("ya elegiste tus dos mundos iniciales") y solo queda "numería" activa.** **RESUELTO (2026-09-08)**: repro en vivo (usuario, tunnel dev). Causa: cuentas con `mundos_desbloqueados = ['numeria']` heredado de la fase vieja de 1 mundo gratis → `elegir_mundos_iniciales` (0112:124) rechazaba todo array no vacío con "ya elegiste" y el guard (`guard.ts`, `onboarding/page.tsx`) solo mandaba a onboarding a los que tenían 0 mundos. Fix: `0116_fix_elegir_dos_mundos.sql` (cardinalidad 1 → se reemplaza con los 2 elegidos; solo `>= 2` bloquea) + guard y pickers (`< 2` → onboarding; ante error "ya elegiste" navega a la home en vez de trabarse). Verificado: tsc/eslint/test(110)/build limpios. **Pendiente: aplicar migración `0116` en la base y retestear en vivo.** Estado: VERIFICADO POR CÓDIGO / PENDIENTE verificación en navegador.
2. **Reto diario tira error** — **RESUELTO (2026-09-07)**: era el loop de `useSyncExternalStore` en `RetoClient.tsx` (getSnapshot devolvía objeto nuevo por llamada). Fix: `crearSnapshotProgreso` en `src/lib/progresoReto.ts` + `useMemo`. Verificado: tsc/lint/test(110)/build. Verificación en navegador: `BLOQUEADO` (sin browser en el entorno).
3. **Reto semanal tira error** — **RESUELTO (2026-09-07)**: misma causa raíz que 2 (mismo componente `RetoClient` compartido). Misma verificación. Verificación en navegador: `BLOQUEADO`.
4. **Matchmaking casual mezcla con ranked / usa ELO** — requisito: casual ≠ ranked (ver `0050_duelos_casuales.sql`). Auditoría pendiente.

## Docs desactualizados

- `docs/ESPECIFICACION.md` dice 5 mundos; el código tiene 8 (`precios.ts:13`). `VERIFICADO POR CÓDIGO` / PENDIENTE actualizar doc.
- `docs/MECANICA.md` es mecanica v1 solo aritmética; el juego ya tiene 8 mundos, retos, duelos, clanes, tienda. `VERIFICADO POR CÓDIGO` / PENDIENTE.
- `README.md` de la raíz dice Next 15, talbf "pantalla de práctica a construir", rutas que ya no existen (probablemente heredado). `HIPÓTESIS` / PENDIENTE revisar.

## Infra / entorno

- **No hay git CLI en este entorno** → no se puede commitear; los cambios quedan en working tree sin historial. `VERIFICADO EN SESIÓN` (comando `git` no encontrado en PATH).
- Sin acceso a dashboard de Supabase ni a la DB real → no se puede validar en vivo RLS/migraciones. `BLOQUEADO`.
- **Migración `0042_ranking_excluye_invitados.sql` PENDIENTE de correr en producción** (según PROGRESO.md). `PENDIENTE`.
- Sin browser confirmado en esta sesión → validaciones visuales/e2e `BLOQUEADO`.

## Deuda por dominio (para auditar, Fase B/C)

- **Trastienda: economía server del primer corte implementada en `0121` (ruleta + volado + pizarra + historial).** El 2026-09-09 se aplicó la piel visual (tokens `--tt-*`, caja fuerte, candado) sobre el doble o nada; el mismo día se escribió `supabase/migrations/0121_trastienda_economia.sql` (tablas `trastienda_ruleta`, `trastienda_minijuegos`, `trastienda_pizarra` + RPCs `girar_ruleta`/`tirar_volado`/`iniciar_la_pizarra`/`adivinar_la_pizarra`/`fetch_trastienda_historial`) y el cliente (4 rutas API + 4 componentes + keys es/en). **DIFERIDO a un corte posterior** (ver `TRASTIENDA-ECONOMIA.md`): Mecánica 1 (mesa de apuestas a partidas de otros), Mecánica 2 (predicciones de ranking), Mecánica 3 (títulos de Trastienda — el segmento "titulo" de la ruleta entrega un escudo placeholder), y los minijuegos La Calcu/Acertijos/El Reloj. Propuestas visuales P4-P10 de `TRASTIENDA-VISUAL` siguen PENDIENTES (la ruleta implementada es horizontal circular, no la tómbola vertical P4). `PENDIENTE` (aplicar 0121 a prod y retestear en vivo).
- Verificar que `supabase/functions/*` tengan los secrets necesarios y callback de push configurado (0114). `PENDIENTE`.
- Verificar cobertura RLS post-0102 y huecos conocidos en `DIAGNOSTICO.md` Caja A (config de Supabase del dashboard no es código). `PENDIENTE`.
- `proxy.ts` sin documentar bien. `PENDIENTE`.