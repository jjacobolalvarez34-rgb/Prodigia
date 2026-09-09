# USER-RANKING-AUDIT — Auditoría de usuarios y ranking

> Fecha: 2026-09-08 · Dominio: usuarios / ranking público · Criterio: quién aparece en los rankings de Prodigia (semanal y ELO persistente).
> Método: verificado SOLO contra código real (`supabase/migrations/*.sql`) y contra la **DB de producción en vivo (SOLO lectura, service_role vía Rest)** + browser (Playwright ad-hoc en dev server). Estados según `docs/AGENT-RULES.md`.
> Importante: distribución de usuarios cambia con los días; este informe describe la fotografía del 2026-09-08. La migración 0119 garantiza el filtro para el futuro, no solo para hoy.

## RESUMEN

| Qué | Estado |
|---|---|
| Anónimos (signInAnonymously) en rankings públicos | EXCLUIDOS (filtro `is_anonymous` VIVO en prod, familia 0042/0066+) — **CONFIRMADO** |
| Cuentas incompletas (sin `display_name`, o email sin confirmar) en ranking ELO persistente | **APARECÍAN** (5 de 14 filas) — BUG VIVO → CORREGIDO por 0119 (pendiente aplicar) |
| Eliminados / bots | Eliminados no existen (cascade); bots (`es_bot=36`) excluidos — **CONFIRMADO** |
| Lectura de `ranking_semanal()` con anon key | **LECTURA POSIBLE** (sin sesión devolvía el semanal completo) → endurecido en 0119 (guard + revoke) |
| Cuentas QA de prueba en ranking de puntos | **Contaminan** (50000 pts → #1). No distinguibles por SQL (no hay columna `es_qa`). Data hygiene, no bug |
| `ranking_semanal_por_mundo()` | OBSOLETA: sin callers en `src/` — documentada, NO tocada |
| `buscar_rival_duelo()` | Sin guard server-side de `is_anonymous` (solo `auth.uid()`); el guard de UI cubre el flujo. Documentado |
| Contraste Matriz principal | master-audit tenía "0042 sin correr en prod" → **CONFIRMO que los filtros de 0042 están aplicados y funcionando** |

## PROBLEMA

1. **(P0, vivo)** El ranking ELO persistente (`ranking_elo_global`, tab "ranking" de Rankeds) muestra jugadores con `display_name = null` — cuentas incompletas que jamás completaron onboarding — junto a jugadores reales. En la fotografía de hoy: **14 filas, 5 sin nombre** (`sophie@cogroupsas.com` no confirmada, `calibra-test-agent@example.com`, `test-fase1-...` no confirmada, `josemito889@gmail.com`, `bilinpatino@gmail.com`). Con ELO de arranque (800) ocupan posiciones 4/9/12/13/14 y ensucian el ranking competitivo persistente.
2. **(Medio)** `ranking_semanal()` es ejecutable por el rol `anon` (sin sesión): la anon key de producción devuelve el ranking semanal completo (verificado en vivo: fila única «Neutron»). No es crítico de privacidad (datos ya públicos una vez logueado) pero es una lectura no autenticada de una RPC de nicho.
3. **(Bajo, data)** Las cuentas QA (`QA Tester` 50000 pts, `QA Tester 2`) aparecen en la posición #1/o al tope de ranking de Puntos. No son atacantes: son cuentas de test del pipeline. No filtrables por SQL hoy.

## CAUSA RAÍZ

- El WHERE de los rankings filtraba únicamente `is_anonymous = false` y `not es_bot` (0042/0066 y sucesoras). Nunca consideró **identidad permanente**: `display_name` no nulo/vacío y `email_confirmed_at` no nulo. El `handle_new_user` crea el perfil al registrar con `display_name` aún null; recién el onboarding lo setea. Las cuentas que registran y no onbordean (o son tests) quedan visibles para siempre en el ELO.
- El grant de ejecución: Postgres da `EXECUTE` a `PUBLIC` por defecto. 0042/0066 solo otorgaron `to authenticated`; los `REVOKE ... FROM PUBLIC` nunca se escribieron → `ranking_semanal()` (creada en 0066 sin guard `auth.uid()`) siguió ejecutable con anon key. Las otras (`ranking_semanal_filtrado`, `ranking_elo_global`) sí lanzan `no autenticado` a `auth.uid()` null → no leak, pero seguían girando en PUBLIC.

## PROPUESTA (decidida y validada contra datos reales)

Definir "usuario permanente" como el que cumple **las 4 condiciones** (verificado que no excluye jugadores legítimos):

1. `coalesce(u.is_anonymous, false) = false` (ya existía)
2. `not p.es_bot` (ya existía)
3. `p.display_name is not null and btrim(p.display_name) <> ''`
4. `u.email_confirmed_at is not null`

Aplicarlo en las 4 funciones que alimentan rankings visibles: `ranking_elo_global`, `ranking_semanal_filtrado`, `ranking_semanal`, `posicion_ranking_puntos`.
NO se toca economía (puntos/Chispas/nivel). NO se agrega `nivel_cuenta >= 5` al ranking ELO (eso es la recompensa/gate de la familia S5 — se documenta como recomendación opcional): una cuenta no invitada que elige correctamente sus 2 mundos queda **visible** aunque no llegue a nivel 5.
Endurecimiento: `ranking_semanal()` gana guard `auth.uid() is not null` + `revoke execute from public, anon` + `grant to authenticated`.

## IMPLEMENTACIÓN

- Nueva migración **`supabase/migrations/0119_filtro_ranking_usuarios_permanentes.sql`** (número libre; tras 0118).
  - `create or replace ranking_elo_global(boolean)` — mismos outputs (7 cols) + condiciones 3 y 4.
  - `create or replace ranking_semanal_filtrado(text, boolean)` — se replica la definición vigente de 0109 (8 mundos: numeria, geografia, enigmia, quimia, anatomia, melodia, trigonometria, historia + default Numería) + condiciones 3 y 4.
  - `drop + create ranking_semanal()` — shape de 0066 (7 cols) + condiciones 3 y 4 + guard `auth.uid() is not null` (el `join auth.users` en el WHERE cubre el caso: sin sesión la consulta devuelve 0 filas incluso si se invoca) + revoke public/anon + grant authenticated.
  - `create or replace posicion_ranking_puntos()` — shape de 0066 + condiciones 3 y 4 (el `total_jugadores` pasa de contar cuentas incompletas a contar solo permanentes).
- Sin cambios en `src/`: el cliente ya consume estos RPC (leaderboard `ranking_semanal_filtrado`, Rankeds `ranking_elo_global`, `/api/leaderboard/posicion` y `/perfil` con `ranking_semanal` y `posicion_ranking_puntos`). Rendimiento: condiciones sobre columnas indexed de `auth.users`/`profiles`; mismo plan.

### Efecto verificado por simulación (mismos predicados sobre filas vivas, 2026-09-08)

| Función | Antes | Después | Detalle |
|---|---|---|---|
| `ranking_elo_global` | 14 | **9** | Salen exactamente las 5 cuentas sin `display_name`. Quedan: Neutron(1204), Yen(807), Lumy(801), prueba, QA Tester, Valeria, QA Tester 2, Padre, persik |
| `ranking_semanal` | 1 | 1 | Neutron (782 XP) — 0 jugadores legítimos afectados ✓ |
| `posicion_ranking_puntos` (total) | 14 | 9 | 0 cuentas legítimas perdidas |
| Anónimos con XP esta semana | 0 | 0 | Explica por qué el semanal se veía limpio incluso pre-fix |

## VERIFICACIÓN

- **Código**: `npx tsc --noEmit` → limpio. `npx eslint supabase src` → solo **4 errores y 6 warnings PREEXISTENTES** en archivos ajenos a este trabajo (`DiagnosticoClient.tsx`, `SocialClient.tsx`, `TrigonometriaDiagnosticoClient.tsx`, `generadores.ts`, `racha-en-riesgo`). `npm test` → **126/126 passing**.
- **DB real (SOLO lectura)**: 137 usuarios auth (87 anónimos), 137 perfiles (0 huérfanos). Anónimos: max nivel 4, 5 con puntos>0, ninguno en ningún ranking (0 filas). RPCs consultadas con anon key y con sesión QA confirmando: anon key → `ranking_semanal` devuelve datos (leak) y las otras lanzan `no autenticado`.
- **Browser (Playwright ad-hoc, dev server en 3000)**: (a) visitante sin sesión en `/es/leaderboard` → 307 a `/es/login?next=%2Fleaderboard` (sin datos de ranking expuestos); (b) invitado nuevo (`signInAnonymously` desde `/es/login`) → redirigido por `requireUsuario` (no completa onboarding); (c) QA autenticado → `/es/leaderboard` muestra SOLO usuarios permanentes reales («Neutron, 782 Exp», «Todavía no hay nadie más»), sin anónimos ni cuentas incompletas en el semanal.
- **Migración NO aplicada a producción**: no es posible vía Rest (no hay endpoint de DDL). Aplicación manual documentada (SQL editor / `supabase db push`) + re-ejecutar los scripts de verificación para confirmar `ranking_elo_global` → 9 filas.

## DOCUMENTACIÓN

- MASTER-AUDIT.md tenía abierto «Migración 0042 sin correr en producción» → este informe lo **desmiente**: los filtros de 0042 están aplicados y vivos (verificado en `ranking_elo_global` y `ranking_semanal_filtrado` con las 14 filas reales sin anónimos ni bots). Queda pendiente que el dueño de la matriz actualice esa fila (no edité MASTER-AUDIT.md por regla de claims — es documentación maestra).
- `ranking_semanal_por_mundo()` (0049) sigue existiendo sin callers en `src/` — candidata a marcar obsoleta/revoke en una futura tanda de limpieza (F-M2/MASTER-AUDIT se ocupa de RPC huérfanas).
- `buscar_rival_duelo()` (0042/0078) **no** chequea `is_anonymous` server-side; el único guard es `auth.uid()`. El flujo de UI lo cubre (`rutasInvitado` + `bloquearInvitado`), pero a nivel RLS es defensa documentada, no bloqueo duro.
- Cuentas QA (`QA Tester`/`QA Tester 2`): contaminación de datos de test en rankings; no filtrar por SQL (no existe `es_qa`). Acción propuesta (data, no código): depurar/renombrar cuentas QA en prod cuando se quiera, o aceptarlas como usuarios reales.

## ESTADO

- [x] Auditoría de código + DB real + browser (fotografía 2026-09-08)
- [x] Migración `0119_filtro_ranking_usuarios_permanentes.sql` escrita y validada por simulación
- [x] tsc / lint (sin errores nuevos) / tests 126/126
- [ ] **Aplicar 0119 a producción** (paso manual, no hecho — SELECCIONAR/`supabase db push`)
- [ ] Re-verificar post-aplicación: `ranking_elo_global` con sesión sana → 9 filas; PR con anon key a `ranking_semanal` → 0 filas / denominado

## ARCHIVOS MODIFICADOS

- `supabase/migrations/0119_filtro_ranking_usuarios_permanentes.sql` (NUEVO)
- `docs/audits/USER-RANKING-AUDIT.md` (ESTE DOC, NUEVO)

## SIGUIENTE PASO

1. Aplicar 0119 (recomendado: `supabase db push` o SQL editor tomando el archivo completo).
2. Re-ejecutar verificación post-fix (script `db-audit-ranking4.mjs` de la sesión, en Temp) y un Playwright QA sobre `/es/leaderboard` + Rankeds.
3. Decidir acción de datos para cuentas QA (backlog, no bloqueante).
4. Actualizar MASTER-AUDIT.md (filas 0042 y esta auditoría) por su dueño.