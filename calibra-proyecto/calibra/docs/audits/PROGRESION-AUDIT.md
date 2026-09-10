# PROGRESIÓN — Auditoría de niveles, recompensas y level-up

- Fecha: 2026-09-09
- Scope: FASE F6 del mega-sprint de consolidación.
- Método: SOLO lectura de código + migraciones + docs (sin DB, sin browser).
- Estados usados: VERIFICADO POR CÓDIGO / IMPLEMENTADO / PENDIENTE / PROPUESTA / BLOQUEADO / NO PUEDO VERIFICAR.

## 1. Nivel de MUNDO (progreso por mundo)

### 1.1 Fórmula vigente — VERIFICADO POR CÓDIGO
`src/lib/practica/worldLevel.ts:46-51`:

- Peso volumen: `0.34` (techo `VOLUMEN_TECHO = 25000`)
- Peso dominio: `0.45`
- Peso lecciones: `0.21`
- `NIVEL_MIN_DOMINIO = 4` · `NIVEL_MAX_DOMINIO = 10`

El nivel se calcula así:

```ts
nivel_mundo = 1 + 9 * (0.34*(vol/min(vol,25000)) + 0.45*((dominio-4)/6) + 0.21*(lecciones/total))
```

### 1.2 Dónde se graba — VERIFICADO POR CÓDIGO
- `registrar_progreso_mundo` (creada en `0117_curva_nivel_mundo.sql`, reemplaza a `registrar_puntos_mundo`). Se llama desde los finish routes de práctica y enigmia con la fórmula 1.1.
- `0125_recalcular_niveles_mundo_y_saneo.sql`: recalcula niveles de mundo en lote y sanea XP/Chispas/afinidad negativas. Si no está aplicada en prod, se conserva la lectura previa (segura para este cierre).

### 1.3 Comparativo de curvas
- Vieja (hasta 0117): pesos `0.3/0.5/0.2` con techo de volumen `50000` — curva más lenta de subida y techos diferentes. La 1.1 es la que usa el código actual.

## 2. Nivel de CUENTA (progreso global)

### 2.1 Curva vigente — VERIFICADO POR CÓDIGO
`supabase/migrations/0118_niveles_cuenta_recompensas.sql:15-22` (función `costo_marginal_nivel_cuenta`):

| Tramo (k = nivel destino) | Costo marginal (XP acumulado requerido) |
|---|---|
| 2 | 200 |
| 3..5 | 300 |
| 6..10 | 550 |
| 11..15 | 900 |
| 16..20 | 1400 |
| 21..30 | 1900 |
| 31+ | 2400 |

XP acumulado (referencias, 0118:19-22): nivel 5 = **1.100**, nivel 15 = **8.350**, nivel 30 = **34.350**, nivel 50 = **82.350**.

### 2.2 Curva vieja (0070, si 0118 no está aplicada en prod)
`0070_clanes_niveles_y_roles.sql:33-38`: `floor(100 * power(n, 1.6))` → 1100 en nivel 10, ~4800 en nivel 30, ~13800 en nivel 50. **Las dos curvas conviven según la migración aplicada**; el código de la app no depende de cuál está (ver cierre §6).

### 2.3 Conciliación contra el historial — VERIFICADO POR CÓDIGO
`0125_recalcular_niveles_mundo_y_saneo.sql` sección 7: aplica `nivel_cuenta = greatest(nivel_cuenta, nivel_desde_xp_cuenta(xp_historico_total))` — nunca baja nivel aunque la curva cambie.

### 2.4 Dónde sube de verdad — VERIFICADO POR CÓDIGO
`acreditar_chispas` (`0118:124-149`+) es la única que actualiza `xp_historico_total` / `nivel_cuenta` y paga el bonus de nivel. `registrar_xp_diario` (`0070`, la que se llama en los finish routes) paga `.puntos_total` + `.xp_historico_total` vía `acreditar_chispas` (revocada como RPC directo, ver §4.2).

### 2.5 Espejo TypeScript — VERIFICADO POR CÓDIGO
`src/lib/cuenta/niveles.ts:40-42` replica la curva y `recompensaNivelCuenta` — usada SOLO por tests de la fórmula del lado TS (no por componentes: el cliente no decide nivel, lo dice el server/RLS).

## 3. Recompensa por subir de nivel

### 3.1 Fórmula — VERIFICADO POR CÓDIGO
`recompensa_nivel_cuenta(n) = 50·n + 250` (`0118:107-113`; espejo TS en `niveles.ts:40-42`).

| Nivel | Bonus |
|---|---|
| 1 | 300 |
| 15 | 1.000 |
| 30 | 1.750 |
| 50 | 2.750 |

### 3.2 Quién la paga — VERIFICADO POR CÓDIGO
La paga `acreditar_chispas` SOLO en la transición de nivel (`if v_nivel_nuevo > v_nivel_anterior`, `0118:144-…`), nunca en recálculos en lote.

### 3.3 Grants — VERIFICADO POR CÓDIGO
- `costo_marginal_nivel_cuenta`: grant (0118:67) — usado por el server.
- `xp_requerido_nivel_cuenta`: grant (0070:56).
- `nivel_desde_xp_cuenta`: SIN grant.
- `recompensa_nivel_cuenta`: **SIN grant** → el server/cliente no puede consultarla (los helpers de precio de la tienda usan `costo_marginal`, no esta).
- `acreditar_chispas`: revocada `from public, authenticated` (0115:102); 0118 la recrea con `create or replace` y conserva el revoke → **el bonus es 100% server-side** y `registrar_xp_diario` no lo devuelve (drops de `(nivel_subio, nivel_nuevo, bonus_nivel)` que calcula internamente `acreditar_chispas`, `0118:120,124-125,155`).

## 4. Economía cruzada (recompensa vs tienda)

`src/lib/tienda/costos.ts` (solo lectura, sin cambios en esta fase):

- Utilidades: escudo **350**, congelamiento **450**, boost **600** (líneas 22-24).
- Fuentes: mono 1000, serif 1400, impacto 1200, script 1800, futurista 2500, manuscrita 5000 (25-36).
- Marcos de rango: bronce 1000 → prodigio 5000 (37-42).
- Marcos temáticos por mundo: **2400 c/u**, gate `nivel_mundo >= 40` (43-59); paquete 8 mundos: **14500** (69).
- Referencia de ingreso: ~100-130 Puntos por partida típica (formulas.ts, comentario de costos.ts:6-20).

Lectura: subir un nivel de cuenta en la escala alta (nivel 31+, `costo_marginal` 2400) equivale a 1 marco temático; el bonus por nivel (50·n+250) queda muy por debajo de la utilidad de juego (escudo 350 ≈ bonus nivel 2) y apenas acompaña el ritmo de compras de cosméticos. Sin contraindicación evidente.

## 5. Umbral de RANKEDS (nivel de cuenta mínimo)

- `src/lib/auth/guard.ts:184`: **`NIVEL_CUENTA_MINIMO_RANKEDS = 5`** — VERIFICADO POR CÓDIGO.
- Coherente con: `docs/REQUIREMENTS-CHECKLIST.md:116` ("nivel 5") y la metadata de la página `src/app/[locale]/rankeds-bloqueado/page.tsx:10` (bloqueo "nivel 5"). El pendiente que marcaba `MARKETING-AUDIT.md:142` queda **CERRADO: 5**.

## 6. Level-up visible en el resumen (cierre implementado en esta fase)

Contexto: la spec `docs/audits/LEVEL-UP-ANIMACION-2026-09-08.md` pide avisar al jugador cuando su CUENTA sube de nivel en el fin de partida — hoy el registro de XP ocurre server-side y nadie lo celebra en pantalla (solo `NivelMundoSubio` cubre el nivel de mundo).

### 6.1 IMPLEMENTADO
- `src/components/NivelCuentaSubio.tsx` (NUEVO): badge "Subiste a nivel {n}" con **GestoLogo** (color `#6C4CF1`) + `reproducirTono("nivel")`, mismo lenguaje visual que `NivelMundoSubio`. No renderiza nada si `!subio` (no molesta en partidas normales).
- `src/app/api/practica/finish/route.ts` y `src/app/api/enigmia/finish/route.ts`: leen `profiles.nivel_cuenta` ANTES y DESPUÉS de `registrar_xp_diario` y devuelven `nivelCuenta: { subio, nivel }`. **Sin migración nueva y seguro bajo cualquier curva de nivel desplegada (0118 o 0070)**: si 0118 no se aplicó, el nivel puede no subir ese día y `subio` queda false, sin romper nada.
- Wiring en los 13 resúmenes que ya mostraban `NivelMundoSubio`: `SprintSummary.tsx` + los 12 clientes de práctica (numeria 5, enigmia, geografia, quimia, anatomia, melodia, trigonometria, historia). Cada uno agrega `nivelCuenta?: NivelCuentaInfo | null` a su `FinishResponse` y `<NivelCuentaSubio>` junto al de mundo.
- i18n: `messages/es.json` y `messages/en.json` → `Practica.resumen.subisteDeNivel` con placeholder `{n}` ("¡Subiste a nivel {n} de cuenta!" / "You leveled up to account level {n}!").

### 6.2 PENDIENTE (siguiente fase, requiere SQL + decisión visual)
- **Bonus exacto en el badge**: mostrar "+1.000 Chispas" requiere propagar `(nivel_subio, nivel_nuevo, bonus_nivel)` desde `acreditar_chispas` hacia `registrar_xp_diario` (o dar acceso a `recompensa_nivel_cuenta`), y decidir si el modo invitado/cuenta nueva lo muestra. Hoy el CLIENTE no puede conocer el monto (sin grant).
- **Overlay burst completo** de la spec LEVEL-UP-ANIMACION (fases, canvas tipo `ChispaClick`, framer-motion): fuera de alcance de este cierre pequeño; el badge con GestoLogo ya cubre la celebración mínima.

## 7. Hallazgos / divergencias docs-vs-código

1. **`NivelMundoSubio.tsx:13-25`**: los mapas `NOMBRE_MUNDO`/`COLOR_MUNDO` solo cubren **4 mundos** (numeria, enigmia, geografia, quimia). Para los otros 4 (anatomia, melodia, trigonometria, historia) cae al fallback del color violeta y muestra el `world` crudo. PROPUESTA: completar los mapas (los 8 mundos existen, confirma `0110_ocho_mundos.sql` y los 8 marcos en `costos.ts:50-59`).
2. **Bonus invisible**: la única réplica del monto del bonus vive en el SQL (`acreditar_chispas`) y no se devuelve por ninguna vía → el cliente no puede celebrar el monto. (PENDIENTE-migración, §6.2.)
3. **Docs de mundos**: `ESPECIFICACION.md` habla de 5 mundos; el código maneja 8 (`0110`). El audit de mundo (`NIVELES-MUNDOS-2026-09-08.md`) ya lo tenía anotado; no es de esta fase.
4. **`marketing-audit` umbral rankeds**: quedó fijado en **5** (§5).

## 8. Verificación de la fase

- `npx tsc --noEmit` → **0 errores**.
- `npx eslint` sobre los 16 archivos tocados → **0 problemas**. Lint global: 4 errores preexistentes en `Onboarding/DiagnosticoClient.tsx` (purity/refs), ajenos a esta fase.
- `npx vitest run` → **147/147 OK** (13 files).
- `npm run build` → **OK** (Next.js 16.3.0 Turbopack, 244 páginas, warnings no relacionados).

## 9. Backlog / Decisiones abiertas

| Item | Estado | Dónde |
|---|---|---|
| Completar mapas 4→8 mundos en `NivelMundoSubio` | PROPUESTA | §7.1 |
| Propagar `(nivel_subio, nivel_nuevo, bonus_nivel)` a `registrar_xp_diario` | PENDIENTE-migración | §6.2 |
| Overlay burst de la spec LEVEL-UP-ANIMACION | PENDIENTE | §6.2 |
| Umbral rankeds = 5 | CERRADO | §5 |
| Aplicar 0117→0125 (y demás pendientes) en prod | PENDIENTE usuario | NO PUEDO VERIFICAR |