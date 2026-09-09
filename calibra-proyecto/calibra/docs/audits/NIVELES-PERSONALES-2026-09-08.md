# NIVELES PERSONALES + RECOMPENSA AL SUBIR DE NIVEL

**Fecha:** 2026-09-08 · **Agente:** gameplay + backend-supabase + store-economy · **Referencia:** T5 + T6 (P1, acopladas)
**Migración:** `supabase/migrations/0118_niveles_cuenta_recompensas.sql`

---

## PROBLEMA

- **T5:** "El XP requerido por nivel parece CONSTANTE (~816) → subir de nivel es trivial y poco emocionante."
- **T6:** Propuesta del product owner: 1000 Chispas por nivel. No se implementa a ciegas: hay que analizar implicancia económica primero.

## CAUSA RAÍZ (verificación de la hipótesis "~816 constante")

La hipótesis es **parcialmente cierta como percepción, falsa como fórmula**.

- Fórmula real (0070:33-38): `xp_requerido_nivel_cuenta(n) = floor(100 * power(n, 1.6))` — XP **acumulado** para ALCANZAR el nivel.
- Costo **marginal** de cruzar de n−1 a n: `100·(n^1.6 − (n−1)^1.6)`:
  nivel 2 → **203**, nivel 5 → 445, nivel 10 → 655, nivel 13 → 763, **nivel 15 → 828**, nivel 20 → 980, nivel 30 → 1244.
- No es constante, pero en el rango en el que vive la mayoría (niveles ~10–20) el marginal va de 655 a 980: **se siente ~816 constante**. A eso se le suma que una partida típica rinde ~100–130 XP (costos.ts:6-8, formulas.ts) y la meta diaria es 500 XP (0070:9-10) → un nivel cada ~2–3 días en ese tramo, sin variación perceptible entre un nivel y el siguiente. Por eso "trivial y poco emocionante".

`nivel_cuenta` y `xp_historico_total` son columnas de `profiles` (0070:26-27); el nivel se recalcula en `acreditar_chispas` (0070:82, redifinida en 0115:82) vía `nivel_desde_xp_cuenta`; el RPC `xp_requerido_nivel_cuenta` lo mostraba la barra de `/perfil` (page.tsx:135-144). No hay fórmula duplicada en TS/UI (las llamadas al RPC se adaptan solas).

## PROPUESTA — curvas comparadas

Criterios: primeros niveles fáciles · medios exigentes · altos valiosos · **acotada** (que no se vuelva imposible).

| Curva | Fórmula | Marginal | Umbral lvl 15 | Umbral lvl 30 | Umbral lvl 50 | Veredicto |
|---|---|---|---|---|---|---|
| **A · Exponencial/potencia suave (actual)** | `100·n^1.6` | 203→828→1244 (crece lento) | 7 616 | 23 088 | 52 281 | Rechazada: plana en 10–20, sensación "~816 constante". |
| **B · Polinómica cuadrática** | `140·n²` cota marginal 2600 | 420→2600 (se aplana en ~lvl 10) | 26 800 | 65 800 | 117 800 | Rechazada: arranca caro (lvl 2 = 420 XP) y vuelve a aplanarse en 2600. |
| **C · Escalones por tramos (ELEGIDA)** | marginal por tramo: 200 / 300 / 550 / 900 / 1400 / 1900 / **2400 (cota)** | 200→900→2400, siempre creciente hasta la cota | 8 350 | 34 350 | 82 350 | **Elegida** (ver abajo). |
| **D · Híbrida potencia + cola lineal** | `marginal = min(140·n^0.95, 2050)` | 270→1834→2050 | 14 882 | 45 532 | 86 532 | Descartada por segunda: suave pero sin tramos legibles y con cota laxa. |

**Por qué C:** marginal monótono (200 → 2400) que "escalona" la sensación de esfuerzo por tramo → los primeros niveles se regalan (nivel 5 = 1 100 XP ≈ 9 partidas; rankeds cuyo gate es nivel 5, guard.ts:184, sigue siendo de las primeras semanas), los medios exigen (900–1400), y los altos se acotan en **2400 XP/nivel ≈ 20 partidas** → nivel 50 = 82 350 XP alcanzable (~17 semanas de jugador élite), nunca imposible. Es la única que cumple las 4 criterios y además es legible/auditable como tabla.

### Tabla elegida — nivel ↦ XP acumulado · XP del próximo salto · recompensa (T6)

| Nivel | XP acum. | Siguiente salto | Recompensa | Nivel | XP acum. | Siguiente salto | Recompensa |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 200 | 300 | 26 | 26 750 | 1 900 | 1 550 |
| 2 | 200 | 300 | 350 | 27 | 28 650 | 1 900 | 1 600 |
| 3 | 500 | 300 | 400 | 28 | 30 550 | 1 900 | 1 650 |
| 4 | 800 | 300 | 450 | 29 | 32 450 | 1 900 | 1 700 |
| 5 | 1 100 | 550 | 500 | 30 | 34 350 | 2 400 | 1 750 |
| 6 | 1 650 | 550 | 550 | 31 | 36 750 | 2 400 | 1 800 |
| 7 | 2 200 | 550 | 600 | 32 | 39 150 | 2 400 | 1 850 |
| 8 | 2 750 | 550 | 650 | 33 | 41 550 | 2 400 | 1 900 |
| 9 | 3 300 | 550 | 700 | 34 | 43 950 | 2 400 | 1 950 |
| 10 | 3 850 | 900 | 750 | 35 | 46 350 | 2 400 | 2 000 |
| 11 | 4 750 | 900 | 800 | 36 | 48 750 | 2 400 | 2 050 |
| 12 | 5 650 | 900 | 850 | 37 | 51 150 | 2 400 | 2 100 |
| 13 | 6 550 | 900 | 900 | 38 | 53 550 | 2 400 | 2 150 |
| 14 | 7 450 | 900 | 950 | 39 | 55 950 | 2 400 | 2 200 |
| 15 | 8 350 | 1 400 | 1 000 | 40 | 58 350 | 2 400 | 2 250 |
| 16 | 9 750 | 1 400 | 1 050 | 41 | 60 750 | 2 400 | 2 300 |
| 17 | 11 150 | 1 400 | 1 100 | 42 | 63 150 | 2 400 | 2 350 |
| 18 | 12 550 | 1 400 | 1 150 | 43 | 65 550 | 2 400 | 2 400 |
| 19 | 13 950 | 1 400 | 1 200 | 44 | 67 950 | 2 400 | 2 450 |
| 20 | 15 350 | 1 900 | 1 250 | 45 | 70 350 | 2 400 | 2 500 |
| 21 | 17 250 | 1 900 | 1 300 | 46 | 72 750 | 2 400 | 2 550 |
| 22 | 19 150 | 1 900 | 1 350 | 47 | 75 150 | 2 400 | 2 600 |
| 23 | 21 050 | 1 900 | 1 400 | 48 | 77 550 | 2 400 | 2 650 |
| 24 | 22 950 | 1 900 | 1 450 | 49 | 79 950 | 2 400 | 2 700 |
| 25 | 24 850 | 1 900 | 1 500 | 50 | 82 350 | 2 400 | 2 750 |

Tramos de costo marginal (cruzar de k−1 a k): **k=2: 200 · k=3–5: 300 · k=6–10: 550 · k=11–15: 900 · k=16–20: 1 400 · k=21–30: 1 900 · k≥31: 2 400 (cota)**.

## ANÁLISIS DE ECONOMÍA de la recompensa (T6)

**Fuentes de Chispas hoy** (todas mapeadas por código):
- Practicar: `registrar_xp_diario` → `acreditar_chispas` (0070:199) — XP 1:1 con Chispas. Partida típica ~100–130 (costos.ts:6-8), meta diaria 500 XP (0070:9-10).
- Reto diario: hasta 100 Chispas/día (0113:53) → 700/sem; también suma `xp_historico_total` (pasa por `acreditar_chispas`).
- Reto semanal: hasta 450/sem (0113:113) — NO pasa por `acreditar_chispas` (update directo).
- Misiones de clan (0070:288-289) y apuestas doble-o-nada (0054, tope 200, **reciclado** de Chispas, no nueva emisión).

**Sinks (drenaje):** tienda catálogo ~23 200 Chispas totales (costos.ts:22-70), mundos a 3 000 c/u hasta 7 pagos (0097:96), crear_clan 5 000 (0070:309), marcos temáticos 2 400 y paquete 14 500.

**Impacto de «1000 por nivel» (simulación, 3 perfiles):** el catálogo completo de la tienda se termina en…

| Perfil (XP/sem) | Sin bonus | **50·n (hoy)** | **1000 flat (PO)** | **50·n+250 (propuesto)** |
|---|---|---|---|---|
| Élite (4 200) | 5 sem | 4 sem | **2 sem** | 3 sem |
| Normal (2 100) | 6 sem | 6 sem | **4 sem** | 5 sem |
| Light (1 200) | 10 sem | 10 sem | **7 sem** | 9 sem |

Emisión extra en 12 semanas (élite): flat 1000 = **+14 000 Chispas**; 50·n+250 = **+12 750**; 50·n = +10 450.

**Conclusión:** mantener 1000 NO es sostenible —
1. **Duplica la velocidad** de comprar TODO el catálogo de prestigio (diseñado en 0054 como meta de "semanas": catálogo ~190 partidas) para el jugador élite: 5 → 2 semanas.
2. En niveles bajos **regala ~3–5× el grind del nivel**: el costo marginal 1→2 es 200 XP y el 2→3, 300; pagar 1000 ahí es casi gratis y abre los cosméticos de prestigio (marco_prodigio/fuente_manuscrita, 5 000) en la primera semana de vida, destruyendo su señal de status.
3. Es plano: los niveles altos (marginal 2 400) premian igual que los bajos (200) — contradice "altos valiosos".

**Fórmula elegida:** `recompensa_nivel_cuenta(n) = 50·n + 250`:
- Nivel 1: 300 · nivel 10: 750 · **nivel 15: exactamente 1000** (honra el número del PO, pero solo donde el nivel lo justifica) · nivel 50: 2 750.
- Siempre entre ~0.6× y ~1.75× del costo marginal del nivel alcanzado (mayor fracción en los primeros niveles — es un onboarding que emociona —, ≈ 1× en medios y altos): nunca regala más de un nivel de grind.
- **Sin duplicados ni recálculo:** el pago vive dentro de la rama `if v_nivel_nuevo > v_nivel_anterior` de `acreditar_chispas` (transición real). Al cambiar la curva, nadie que ya tenga su nivel guardado recibe recompensas retroactivas: solo se sube, nunca se baja ni se re-paga. El bonus no toca `xp_historico_total` → sin retroalimentación/inflación compuesta.

*~~(Requiere vista del PO/orquestador: se propone 50·n+250 en lugar de 1000 flat por lo anterior. Es la única decisión que se tomó en nombre del orquestador — el resto se implementó directamente.)~~ → **APROBADA por el PO el 2026-09-08: `recompensa_nivel_cuenta(n) = 50·n + 250`, vigente con la 0118 ya aplicada a la base.***

## IMPLEMENTACIÓN

**`supabase/migrations/0118_niveles_cuenta_recompensas.sql`** (número libre verificado: no existe 0117, que es de otro agente, ni 0118):
1. `costo_marginal_nivel_cuenta(integer)` — helper con la escalera (grant a authenticated: lo necesita `xp_requerido_nivel_cuenta`, security invoker, que el cliente ya podía llamar).
2. `xp_requerido_nivel_cuenta(integer)` — misma firma/semántica (XP acumulado), nueva curva vía `generate_series`.
3. `nivel_desde_xp_cuenta(bigint)` — reescrito sobre el costo marginal (evita el O(n²) de re-sumar la curva en el loop viejo).
4. `recompensa_nivel_cuenta(integer)` = `50·n + 250` — nueva.
5. `acreditar_chispas(uuid, integer)` — `create or replace` idéntica a la de 0115 (guard `auth.uid()`, `security definer`, search_path) con el único cambio de `v_bonus := 50 * v_nivel_nuevo` → `v_bonus := public.recompensa_nivel_cuenta(v_nivel_nuevo)`. El `create or replace` **no re-otorga** el execute: el revoke del cliente de 0115 queda intacto.

**Cliente/UI:** `src/app/[locale]/perfil/page.tsx:135-144` y `perfil/[userId]/page.tsx:130` muestran el nivel vía RPC/columna → se adaptan solos. No hay texto literal de la fórmula en el árbol (`grep 1.6|power|xp_requerido` en `src/` solo encuentra comentarios y el RPC). `ClanesClient.tsx` usa `xp_requerido_nivel_clan` (curva de clan, intacta). Sin cambios de UI necesarios.

**Tests:** `src/lib/cuenta/niveles.ts` (espejo TS de la fórmula, para test puro) + `niveles.test.ts` (tabla 1..50, bordes de umbral, bounds de recompensa, inversión `nivelDesdeXp∘xpRequerido`).

## VERIFICACIÓN

- `npx vitest run`: **10 archivos, 126 tests OK** (incluye los 10 nuevos de la curva/recompensa).
- `npx tsc --noEmit -p tsconfig.json`: sin errores.
- `npx eslint src/lib/cuenta/niveles.ts src/lib/cuenta/niveles.test.ts`: sin errores.
- Build: **NO ejecutado** — no se tocaron rutas (solo SQL + lib de tests). No se aplica la migración a ninguna base (0 daño; se valida por lectura de código + espejo TS).

## ESTADO

- **CONFIRMADO por código**: causa raíz de la curva plana (0070:33-38 y marginales medidos).
- **IMPLEMENTADO**: migración 0118 + espejo TS + tests. Recompensa propuesta (50·n+250) en lugar de 1000 flat, fundamentada.
- **PENDIENTE orquestador/PO**: aprobar 50·n+250 (o pedir recalibración); aplicar 0118 a la base y validar grandfathering en vivo (nadie baja de nivel, quien bordea un umbral ve su barra en 0% hasta el nivel siguiente — quirk cosmético auto-sanable).
- **NO aplicamos SQL** a ninguna base en esta sesión.

## ARCHIVOS MODIFICADOS

- `supabase/migrations/0118_niveles_cuenta_recompensas.sql` (nuevo)
- `src/lib/cuenta/niveles.ts` (nuevo)
- `src/lib/cuenta/niveles.test.ts` (nuevo)
- `docs/audits/NIVELES-PERSONALES-2026-09-08.md` (este documento)

## SIGUIENTE PASO

1. Aprobar la fórmula de recompensa con el PO (1000 flat rechazado por el análisis de economía).
2. Aplicar 0118 a staging + verificar en vivo una subida de nivel (recompensa y barra).
3. Revisar `scripts/compensacion-jacobo-fase1.mjs` (usa el RPC para un one-off admin): la curva nueva cambia cuánto XP setea — solo relevante si se re-ejecuta.
4. Considerar (decisión de diseño, fuera de alcance): ¿la recompensa a nivel 100+ (2 400 de costo, 5 250 de pago) crece sin cota? Si el juego alcanza esos niveles es un problema de cortesía, no de economía — documentado a propósito (los ultramaratonistas drenan toda la tienda igual).