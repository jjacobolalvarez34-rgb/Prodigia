# AUDIT-RLS-SEGURIDAD-2026-09-07 — Auditoría de RLS y seguridad

> Autor: auth-security (orquestada 2026-09-07). Método: verificación contra CÓDIGO real (migraciones SQL + rutas API + edge functions). Estados según docs/AGENT-RULES.md §1.
> Contexto: sin acceso a la DB de producción → la REPRODUCCIÓN en vivo quedó BLOQUEADA. Los hallazgos marcados CONFIRMADO lo están por lectura de código (la evidencia cita archivo:línea); el PoC con cuentas QA requiere la base (como se hizo en 0035/0060/0102).

## Resumen ejecutivo

La app tiene una base de RLS sólida (todas las tablas con RLS habilitado, funciones security definer con `set search_path`, varias tandas de auditoría previas: 0035, 0060, 0102, 0103). PERO se encontró una **familia de huecos de economía/progreso** del tipo "RPC security definer que acepta un valor contable del cliente sin validar" y "policies RLS amplias sobre tablas de progreso". El más grave permite **fabricar Chispas ilimitadas** llamando directo a un RPC con cualquier `p_xp`.

| # | Severidad | Hallazgo | Estado |
|---|---|---|---|
| S10 | CRÍTICO | `acreditar_chispas(p_user_id, p_monto)` granted a authenticated SIN validar `p_user_id = auth.uid()` → Chispas ilimitadas a cualquiera | CORREGIDO (0115: guard + revoke) |
| S0 | CRÍTICO | `registrar_xp_diario(p_xp)` suma `p_xp` verbatim a Chispas + XP semanal | CORREGIDO (0120: ignora p_xp, deriva XP real del día) |
| S1 | CRÍTICO | `registrar_puntos_mundo(p_world, p_puntos)` infla `nivel_mundo` → marcos/títulos | CORREGIDO (0120: ambas funciones derivan de attempts reales) |
| S2 | ALTO | `skill_levels` policy "for all" → dominio falso (nivel de mundo/títulos) | CORREGIDO (0120: solo SELECT; upsert dentro de `insertar_intento`) |
| S3 | ALTO | `attempts` INSERT sin validar contenido; `attempts.xp` firmable → ranking por mundo | CORREGIDO (0120: policy dropeada; alta vía `insertar_intento` security definer) |
| S4 | ALTO | `daily_progress` policy "for all" → XP semanal global fabricable | CORREGIDO (0120: policy dropeada; solo SELECT, escribe registrar_xp_diario) |
| S5 | ALTO | `resolver_apuesta_si_activa(p_precision)` — ganar la apuesta siempre | CONFIRMADO (código) / BLOQUEADO (repro) |
| S6 | MEDIO | `handle_new_user` sin `set search_path` (regresión de 0060) | CORREGIDO (0115) |
| S7 | MEDIO | `friendships` INSERT permitía `estado='aceptada'` directo | CORREGIDO (0115) |
| S8 | MEDIO | `logic_attempts` INSERT solo `auth.uid() = user_id` (XP de Enigmia) | CORREGIDO (0120: policy dropeada; alta vía `insertar_intento_logica`) |
| S9 | BAJO | Edge functions públicas sin verificación de firma/JWT | CONFIRMADO (código) / BLOQUEADO (repro) |

## Detalle de hallazgos

### S10 — CRÍTICO: acreditar_chispas permite acreditar Chispas a cualquiera (y las de uno mismo)
- Evidencia: `0070_clanes_niveles_y_roles.sql:105-153` — `security definer`, `set search_path = public`, cuerpo → `update profiles set puntos_total = puntos_total + p_monto where id = p_user_id:119`; **no existe ninguna comparación `p_user_id = auth.uid()`**; `grant execute ... to authenticated:153`.
- Explotación: `rpc("acreditar_chispas", { p_user_id: <mi id>, p_monto: 999999 })` → Chispas ilimitadas + `xp_historico_total` + `nivel_cuenta` + bonus de nivel (aclaran: nivel alto → más Chispas) + `xp_aportado` al clan. Además `p_monto` negativo descuenta a un TERCERO (griefing, sin tope inferior). No requiere jugar ni pasar por finish/generadores.
- El doble impacto: es la puerta MÁS directa de la familia economía (ni siquiera depende de fabricar intentos) y además su flag de negocio `> 0` hace que el descuento inicial corra igual para monto negativo.
- Fix aplicado en `0115` (guard `auth.uid()` + revoke a public/authenticated; el uso interno por registrar_xp_diario y completar_reto_diario pasa siempre el user autenticado → no rompe nada; la app nunca la llama desde el cliente).

### S0 — CRÍTICO: registrar_xp_diario = grifo infinito de Chispas
- Evidencia (VERSIÓN HASTA 0119): `0070_clanes_niveles_y_roles.sql:164-206` (creada en 0003/0004/0009, endurecida en 0036, redifinida en 0070) — `security definer`, `set search_path = public`, `grant execute ... to authenticated:206`. El cuerpo suma `p_xp` verbatim a `daily_progress.xp_ganado:189` y llama `acreditar_chispas(v_user, p_xp):199` SIN validar contra intentos reales. La redifinición de 0070 cambió el mecanismo de Chispas (antes perfil.puntos_total, ahora vía acreditar_chispas) pero mantuvo la confianza en `p_xp` del cliente.
- Vía legítima (BLOQUEADA): `/api/practica/finish` suma `attempts.xp` y lo pasa como `p_xp` (`src/app/api/practica/finish/route.ts`) — desde 0120 `registrar_xp_diario` **ignora `p_xp`** y acredita `greatest(0, XP real del día − ya acreditado hoy)` (idempotente, anti doble-finish).
- Explotación: `supabase.rpc("registrar_xp_diario", { p_xp: 999999 })` tantas veces como se quiera → Chispas ilimitadas (comprar mundos 3000, escudos 350, etc.) + top del ranking semanal global (suma `daily_progress.xp_ganado`).
- **CORREGIDO en `0120_cerrar_s0_s1.sql`** (redefinición derivada de la DB; se mantiene la firma/returns por compatibilidad con las rutas de finish).

### S1 — CRÍTICO: registrar_puntos_mundo infla nivel de mundo
- Evidencia (VERSIÓN HASTA 0119): `0109_mundo_historia.sql:81-202` — `security definer`, `set search_path = public`, `grant ... to authenticated:202`; `p_puntos` suma verbatim a `world_progress.puntos_mundo:113`.
- Explotación: `rpc("registrar_puntos_mundo", { p_world: "numeria", p_puntos: 50000 })` → `v_frac_volumen = 1` → tope sin jugar; combinado con S2 (dominio=1) → `nivel_mundo=100` → marcos temáticos (0110/0104, exigen nivel 40) y títulos de mundo completado.
- **CORREGIDO en `0120`**: `registrar_progreso_mundo` deriva los puntos reales del mundo desde `xp_real_por_mundo` (suma `attempts.xp`/`logic_attempts.xp` del mundo) y acredita la diferencia contra `world_progress.puntos_mundo`; `registrar_puntos_mundo` delega en ella. El cliente puede llamarlas cuanto quiera: la diferencia se vuelve 0.

### S2 — ALTO: skill_levels escribible del cliente
- Evidencia: `0002_mecanica_v1.sql:24-27` — policy "for all" (`auth.uid() = user_id`).
- Impacto: `registrar_puntos_mundo` cuenta `nivel=10` como "dominio" (S1 combo), y `src/lib/titulos/verificar.ts` usa subtemas nivel 10 para títulos de mundo completado → marcos/títulos sin jugar.
- **CORREGIDO en `0120`**: policy dropeada (queda solo SELECT); el upsert de `skill_levels` ahora vive DENTRO de `insertar_intento` (security definer), que solo recalcula el nivel si el intento no es sospechoso y el tipo es calibrable.

### S3 — ALTO: attempts.xp fabricable (ranking por mundo)
- Evidencia: `0001_init.sql:86-88` INSERT policy solo `auth.uid() = user_id`; `attempts.xp smallint ... check (xp >= 0)` (`0003:10`); `ranking_semanal_filtrado` suma `sum(a.xp)` para los rankings por mundo.
- Explotación: insert directo con `xp=5000`, `correct=true`, `time_ms=1`.
- **CORREGIDO en `0120`**: policy de INSERT dropeada; el alta pasa SOLO por `insertar_intento` (security definer) que calcula xp y anti-apuro server-side.

### S4 — ALTO: daily_progress "for all"
- Evidencia: `0002_mecanica_v1.sql:51-54`. Un cliente puede actualizar `xp_ganado` directo.
- Impacto: ranking semanal GLOBAL (suma `daily_progress.xp_ganado`), y el promedio histórico de XP diario que usa finish queda falseable.
- **CORREGIDO en `0120`**: policy dropeada (solo SELECT); `daily_progress` se escribe únicamente desde `registrar_xp_diario` (security definer).

### S5 — ALTO: apuestas siempre ganadas
- Evidencia: `0025_tienda_ampliada.sql:171-208` — `resolver_apuesta_si_activa(p_precision)` acepta la precisión del cliente; si `p_precision > apuesta_umbral` paga el doble.
- Explotación: apostar (buy-in, tope 200, una activa) y resolver con `p_precision=2` → ganar siempre; +monto neto por ciclo, repetible.
- Matiz: el neto por ciclo es acotado (≤200) pero sumable; y `apostar_doble_o_nada` descuenta? (requiere leer 0025:119-166 en la tanda de repro).
- Fix recomendado: la resolución debe recibir la evidencia (attempts del sprint) y validarla, igual que el resto.

### S8 — MEDIO: logic_attempts INSERT
- Evidencia: `0015_mundo_enigmia.sql:62` — policy solo `auth.uid() = user_id`. Equivalent a S3 para Enigmia (ranking por mundo "enigmia" suma `logic_attempts.xp`).
- **CORREGIDO en `0120`**: policy de INSERT dropeada; el alta pasa SOLO por `insertar_intento_logica` (security definer) que calcula xp y anti-apuro server-side y actualiza `logic_skill_levels`.

### S9 — BAJO: edge functions públicas
- Evidencia: `supabase/functions/{notify-duelo,notify-clan-mensaje,racha-en-riesgo}` — sin verificación de JWT/firma de webhook en su entrypoint. Están diseñadas para webhooks/scheduled (service role), pero si quedan alcanzables por el cliente (invoke) permitirían re-disparar pushes (spam).
- Fix recomendado: en Supabase Edge, habilitar verificación de JWT o validar el secret header del webhook.

### S6 — MEDIO (CORREGIDO en 0115)
- `handle_new_user` re-creado en 0112 SIN `set search_path = public` (`0112:23-38`). Regresión del fix de 0060. Aunque el cuerpo referencia `public.profiles` (calificado, riesgo bajo de hijacking), rompe la convención defensiva del resto del proyecto. Fix: `migration 0115` re-agrega `set search_path = public`, cero cambio de comportamiento.

### S7 — MEDIO (CORREGIDO en 0115)
- `friendships` INSERT (`0012:47-49`) solo exigía `auth.uid() = user_id` → vector de "amistad forzada"/spam con `estado='aceptada'` directo. Fix: `with check (auth.uid() = user_id and estado = 'pendiente')`. No rompe `/api/amigos/solicitar` (inserta pendiente, `route.ts:23`) ni `conectar_por_invitacion` (security definer, bypasea RLS, `0063:34-36`).

## Lo que se revisó y está BIEN

- `retos_diarios_completados` / `retos_semanales_completados`: sin policy de escritura de cliente; todo por funciones security definer con validación de fecha/semana (`0113`). (Nota: `p_correctos` sigue siendo valor del cliente — mismo family de S0; ver backlog.)
- `duels` / `duel_results` / `duel_queue`: cierres de 0035/0060/0102 vigentes.
- `feed_posts`: content-check de 0102 vigente.
- `user_achievements` / `unlocked_modifiers`: criterio de 0060 vigente.
- `desbloquear_titulo` (4 params) revocado de public; `desbloquear_titulo_propio` es el único callable (0102/0103).
- Tienda: `comprar_item_tienda` valida item y piso de precio; desbloqueo de mundos vía `desbloquear_mundo` (3000, server-side, auth.uid()).
- Clanes, chat, grupos/profesor: funciones security definer con chequeos `auth.uid()` y RLS coherente.
- `device_push_tokens`: SIN policy de lectura/escritura de cliente (solo funciones) — correcto (`0114`).
- Edge functions: usan service role key desde `Deno.env`, sin secretos en el repo (grep JWT limpio; `.env*.local` gitignorados en `.gitignore:19`).
- Desde `0120`: `attempts` / `logic_attempts` / `skill_levels` / `logic_skill_levels` / `daily_progress` se escriben SOLO vía funciones security definer (`insertar_intento`, `insertar_intento_logica`, `registrar_xp_diario`) y se leen con RLS normal (SELECT intacto). Las policies amplias de escritura fueron dropeadas.

## Recomendación de prioridad

1. Reproducir S5 y S9 contra la base real con cuentas QA — es el P0 de seguridad que queda de esta familia.
2. ~Implementar el patrón "escribir progreso/XP SOLO por funciones security definer con valores derivados de la DB" (S0/S1/S2/S3/S4/S8 son la misma familia)~ → HECHO en `0120_cerrar_s0_s1.sql` (pendiente de aplicar a prod).
3. Los fixes S6/S7 del 0115 pueden deployar inmediatamente (no cambian flujo legítimo). El 0120 idem (mantiene firma pública de los RPC; solo cambia de dónde sale el valor).

## Estado
- Informe: CONFIRMADO POR CÓDIGO (hallazgos listados con evidencia archivo:línea).
- Reproducción en vivo: BLOQUEADO (sin acceso a DB).
- Familia S0-S4/S8: CORREGIDA (migración `0120` escrita y rutas migradas; **pendiente de aplicar a prod**). Pendiente: repro en vivo de S5/S9.