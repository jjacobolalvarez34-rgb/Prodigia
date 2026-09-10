# TRASTIENDA — Economía y Mecánicas

> Documento de diseño (solo diseño, sin código). Estado: **IMPLEMENTADO** (2026-09-09).
> Creado: 2026-09-08. Referencias citadas contra código real.
> Implementación: migraciones `0121`–`0127` + cliente completo en `/trastienda`. Ver `docs/audits/STORE-ECONOMY-AUDIT.md` (F5) para el detalle código-safe; este doc conserva el diseño original con sus divergencias anotadas abajo.

### Nota de implementación (2026-09-09) — divergencias vs este diseño

- **M1 (apuestas):** implementado solo para `duels`; `rankeds`/`reto_semanal` quedan para un corte futuro (`0123` comentario líneas 11). Límites reales 10 apuestas/día y 500 Chispas/día, multiplers idénticos a la tabla de §1.
- **M2 (predicción):** implementada con la tabla de multiplers "AJUSTADO" de §2 y ventana lunes→miércoles server-authoritative (`ventana_predicciones`, 0126). Resolución por **self-heal** al apostar (`resolver_prediccion_ranking(v_semana - 7)` dentro de `apostar_prediccion_ranking`) — no hay job semanal automático.
- **M3 (títulos):** 8 de 9 títulos en `src/lib/titulos/catalogo.ts:107-116`. Falta `gniñardo` (Mitológico, top-3 ×3 semanas). El premio "título" de la ruleta entrega títulos REALES desde 0123.
- **M4 (ruleta):** reemplazada por la **mesa casino** (`0127`): 118 elementos de la tabla periódica, fichas 100/250/500/1000, límite 20/día, factor `× 0.88` (EV del jugador ~0.88, house edge 12%). La rueda clásica queda legacy sin uso en la UI.
- **M5 (minijuegos):** La Calcu, Volado y La Pizarra activos. Acertijos de Enigmia y El Reloj se implementaron en 0124 y se **eliminaron en 0126** (limpieza, decisión de diseño).
- **Lugar de entrada:** se implementó la **Opción B** del §7 (ruta propia `/trastienda`), no la Opción A recomendada en el doc.
- **EV agregado real:** la mesa casino (factor 0.88) desvía el target 0.92-0.96 del diseño — ver hallazgo H-01 en STORE-ECONOMY-AUDIT.md.

---

## 0. Contexto y restricciones de economía

**Fuentes de Chispas verificadas** (`docs/economy/ECONOMY.md`):
- Práctica: ~100-130/partida (nivel calibración 3-5, ~70% aciertos), referencia 120.
- Reto diario: 20×acierto, tope 100.
- Reto semanal: 10×acierto, tope 450.
- Duelos: victoria/draw (monto no confirmado).

**Consumos actuales** (`src/lib/tienda/costos.ts`):
- Catálogo completo: ~23.200 Chispas (~190 partidas).
- Items de utilidad: 350-600 (3-5 partidas).
- Cosméticos bajo: 1.000-2.000.
- Cosméticos prestigio: 4.000-6.000.

**Regla de diseño**: Trastienda NO puede destruir la economía. El EV esperado del jugador debe ser <1 (la casa siempre gana a largo plazo), pero lo suficientemente alto para que se sienta tentador. Target EV: **0.92-0.96** por interacción.

**Moneda**: **LAS MISMAS CHISPAS** (decidido por el PO — la Trastienda NO tiene moneda propia). NO dinero real. Las "fichas" del diseño visual son solo representación gráfica del balance/importe apostado, no una divisa distinta. El vocabulario "apostar" queda como jerga interna del juego educativo (gambling ficticio con moneda interna), manteniendo los límites y el EV <1 que acotan su abuso.

---

## 1. MECÁNICA 1 — Apostar a la siguiente partida

### Concepto
El jugador apuesta Chispas al resultado de una **próxima partida de OTRO jugador** visible en el feed/ranking. NO apuesta a partidas propias (riesgo de manipulación). Elige ganador, monto, confirma. Resolución automática server-authoritative al cerrar esa partida.

### Flujo (pasos)

```
1. JUGADOR ABRE TRASTIENDA → sección "Apostar a Partida"
2. RPC fetch_apuestas_disponibles() → lista partidas PRÓXIMAS/en curso
   (rankeds recién emparejadas, duelo aceptado, reto semanal en vivo)
   Cada item: {partida_id, tipo, jugador_a, jugador_b, elo_a, elo_b,
               mundo, estado}
3. JUGADOR ELIGE PARTIDA → ve odds implícitas (calculadas por ELO)
4. JUGADOR ELIGE GANADOR (jugador_a | jugador_b | empate)
5. JUGADOR ELIGE MONTO (chips predefinidos: 25, 50, 100, 200)
6. MODAL CONFIRMACIÓN → resumen: partida, elección, monto, ganancia potencial
7. JUGADOR CONFIRMA → RPC apostar_partida({p_partida_id, p_eleccion, p_monto})
   - Server valida: monto ≤ balance, partida en estado "apostable",
     no tiene apuesta duplicada en esa partida, jugador apostador
     NO es ninguno de los dos participantes
   - Deduce chispas del balance
   - Registra apuesta con estado "pendiente"
8. RESOLUCIÓN AUTOMÁTICA: cuando la partida se cierra
   (trigger en /api/practica/finish o /api/rankeds/completar),
   llama resolver_apuesta_partida({p_partida_id})
   - Server calcula ganador real
   - Paga ganancias (monto × multiplier) o pierde apuesta
   - Estado: "ganada" | "perdida" | "empate_devuelto"
```

### Modelo de datos (tablas propuestas)

```sql
-- Apuestas a partidas (NO confundir con apuesta_monto/apuesta_umbral existente)
CREATE TABLE trastienda_apuestas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  partida_id uuid NOT NULL,            -- referencia a duels.id o rankeds.id
  partida_tipo text NOT NULL,           -- 'ranked' | 'duelo' | 'reto_semanal'
  jugador_a_id uuid,
  jugador_b_id uuid,
  eleccion text NOT NULL,              -- 'a' | 'b' | 'empate'
  monto integer NOT NULL CHECK (monto > 0),
  multiplier NUMERIC(5,2),             -- calculado al apostar, locked
  ganancia_potencial integer,           -- monto × multiplier
  estado text DEFAULT 'pendiente',     -- 'pendiente' | 'ganada' | 'perdida' | 'empate_devuelto'
  resultado_final text,                -- 'a' | 'b' | 'empate'
  payout integer DEFAULT 0,
  creado_at timestamptz DEFAULT now(),
  resuelto_at timestamptz,
  CONSTRAINT trastienda_apuestas_user CHECK (user_id = auth.uid())
);

-- Límites diarios por usuario
CREATE TABLE trastienda_limites_diarios (
  user_id uuid REFERENCES profiles(id) PRIMARY KEY,
  fecha date DEFAULT current_date,
  apuestas_realizadas integer DEFAULT 0,
  monto_total_apostado integer DEFAULT 0,
  perdida_total integer DEFAULT 0,
  CONSTRAINT trastienda_limites_user CHECK (user_id = auth.uid())
);
```

### Odds y multiplier

Odds implícitas basadas en ELO diferencia (no市场化 — fijo en server):

| ΔELO (|A-B|) | Multiplier favorito | Multiplier underdog | Empate |
|---|---|---|---|
| 0-50 | ×1.85 | ×1.85 | ×3.50 |
| 51-150 | ×1.50 | ×2.30 | ×4.00 |
| 151-300 | ×1.30 | ×3.00 | ×5.00 |
| 301+ | ×1.15 | ×4.00 | ×6.00 |

EV del jugador por apuesta: **~0.94** (house edge 6%).

### Separación cliente/servidor (server-authoritative)

| Decisión | Quién | Validación |
|---|---|---|
| Lista de partidas disponibles | Server (RPC) | Filtra solo aptas para apuesta |
| Elección de ganador | Cliente | — |
| Monto | Cliente | Server valida ≤ balance, ≤ límite diario |
| Cálculo de odds/multiplier | **Server** | Locked al momento de apostar, NO recalculado |
| Deducción de Chispas | **Server** (RPC) | Transacción atómica: SELECT balance → UPDATE |
| Resolución del resultado | **Server** (trigger/RPC) | Lee resultado real de la partida, NO del cliente |
| Pago de ganancias | **Server** (RPC) | Transacción atómica: UPDATE estado + UPDATE balance |

### Restricciones de seguridad

1. **Prohibir apuestas tras iniciar la partida**: la partida debe estar en estado `en_curso` o `emparejada` pero NO `completada`. El trigger de resolución solo corre si la apuesta está en `pendiente`.
2. **Prohibir auto-apuestas**: `CHECK user_id != jugador_a_id AND user_id != jugador_b_id` en la tabla + validación en RPC.
3. **Impedir manipulación del resultado**: el resultado se lee de `duels.ganador_id` o `rankeds.resultado` — campos que el jugador NO puede modificar (protegidos por RLS y `security definer`). El cliente NUNCA envía el resultado.
4. **Interdependencia con `resolver_apuesta_si_activa`**: la función existente (`S5` en MASTER-AUDIT) acepta `p_precision` del cliente → apuesta siempre ganada. **La nueva mecánica NO depende de esa función** — usa su propia tabla y su propio RPC `resolver_apuesta_partida`. Sin embargo, la apuesta "doble o nada" existente (`apuesta_monto`/`apuesta_umbral` en `profiles`) queda como sistema legado separado. Recomendación: migrar "doble o nada" a la misma tabla `trastienda_apuestas` en una fase futura, pero NO como prerequisito de Trastienda.

### Estados de una apuesta

```
[pendiente] → (partida se cierra) → [ganada] | [perdida] | [empate_devuelto]
                                                    ↑
                                              (empate real: monto devuelto)
```

---

## 2. MECÁNICA 2 — Apuestas de ranking (mercado de predicciones)

### Concepto
El jugador predice su **propio puesto final** en el ranking semanal (o el de un amigo). Mercado de "shares" sobre posiciones.

### Evaluación de diseño original vs propuesto

**Diseño original (mercado libre)**: varios jugadores compran "shares" de distintos puestos. Precio fluctúa. Pagos proporcionales.

**Problemas encontrados**:
- **Explotación**: un jugador puede "shortear" su propio puesto (poner shares en puesto 5 sabiendo que va a quedar 1°). Inversión mínima, ganancia máxima.
- **Concurrencia**: mercados líquidos requieren muchos jugadores — Prodigia es una app educativa, no una plataforma de trading.
- **Interés real**: la mayoría de usuarios no va a querer gestionar un mercado de acciones.

**Diseño propuesto (predicción simple, cerrada)**:

```
1. JUGADOR ELIGE "Predicción de Ranking" en Trastienda
2. Ve las opciones: Puesto 1, 2, 3, 4-5, 6-10, 11-20, 21+
   (rangos agrupados para reducir variance)
3. Elige UN puesto/rango + monto (25-200 Chispas)
4. Server calcula multiplier según dificultad:
   - Puesto 1: ×8.0 (más difícil)
   - Puesto 2: ×5.0
   - Puesto 3: ×3.5
   - Puesto 4-5: ×2.5
   - Puesto 6-10: ×1.8
   - Puesto 11-20: ×1.3
   - Puesto 21+: ×1.1
5. CIERRE: lunes a las 00:00 UTC (igual que ranking semanal)
6. RESOLUCIÓN: server compara puesto real vs predicho
   - Coincidencia exacta: pago completo
   - Rango cercano (±2 posiciones): 50% del payout
   - Fuera de rango: pérdida completa
```

### Restricciones

- **1 predicción por semana por usuario** (evita spam/manipulación).
- **Monto máximo: 200 Chispas** (limita pérdida).
- **No predicciones de OTROS jugadores** (evita acoso/Tracking).
- **Ventana de apuesta**: lunes 00:00 UTC a miércoles 23:59 UTC (mitad de semana, antes de que el ranking se asiente).

### EV del jugador

| Predicción | Multiplier | P estimada | EV |
|---|---|---|---|
| Puesto 1 | ×8.0 | 0.05 | 0.40 |
| Puesto 2 | ×5.0 | 0.08 | 0.40 |
| Puesto 3 | ×3.5 | 0.12 | 0.42 |
| Puesto 4-5 | ×2.5 | 0.18 | 0.45 |
| Puesto 6-10 | ×1.8 | 0.30 | 0.54 |
| Puesto 11-20 | ×1.3 | 0.45 | 0.59 |
| Puesto 21+ | ×1.1 | 0.70 | 0.77 |

**EV promedio ponderado: ~0.51** — demasiado bajo. **Ajuste**: reducir house edge en predicciones fáciles:

| Predicción (AJUSTADO) | Multiplier | P estimada | EV |
|---|---|---|---|
| Puesto 1 | ×6.0 | 0.05 | 0.30 |
| Puesto 2 | ×4.0 | 0.08 | 0.32 |
| Puesto 3 | ×3.0 | 0.12 | 0.36 |
| Puesto 4-5 | ×2.2 | 0.18 | 0.40 |
| Puesto 6-10 | ×1.65 | 0.30 | 0.50 |
| Puesto 11-20 | ×1.30 | 0.45 | 0.59 |
| Puesto 21+ | ×1.12 | 0.70 | 0.78 |

**EV promedio ajustado: ~0.47** — sigue bajo. **Solución**: el bono de predicción es el **interés real + dopamine**, no la ganancia pura. Aceptar EV ~0.5 para esta mecánica (es "apuesta de fantasía", no inversion). El jugador apuesta por SU PROPIO rendimiento, lo cual es motivante aunque pierda Chispas.

### Tabla

```sql
CREATE TABLE trastienda_predicciones_ranking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  semana_iso text NOT NULL,            -- '2026-W36'
  puesto_predicho text NOT NULL,       -- '1' | '2' | '3' | '4-5' | '6-10' | '11-20' | '21+'
  monto integer NOT NULL CHECK (monto > 0),
  multiplier NUMERIC(5,2) NOT NULL,
  estado text DEFAULT 'pendiente',     -- 'pendiente' | 'ganada' | 'parcial' | 'perdida'
  payout integer DEFAULT 0,
  puesto_real integer,                 -- llenado al resolver
  creado_at timestamptz DEFAULT now(),
  resuelto_at timestamptz,
  UNIQUE(user_id, semana_iso),         -- 1 predicción por semana
  CONSTRAINT trastienda_pred_user CHECK (user_id = auth.uid())
);
```

---

## 3. MECÁNICA 3 — Títulos exclusivos de Trastienda

### Filosofía
Los títulos de Trastienda representan **aptitud para el riesgo**, no mérito de estudio. Son los títulos más "oscuros" del catálogo — no se ganan estudiando, se ganan jugándose. Deben sentirse como pertenecientes a un圈子 exclusivo.

### Catálogo propuesto

| # | Slug | Nombre | Rareza | Criterio | Ícono | Descripción visual |
|---|---|---|---|---|---|---|
| 1 | `tronado` | Tronado | Común | 1 apuesta ganada en Trastienda | 💥 | Explosioncita naranja sobre fondo oscuro |
| 2 | `farolero` | Farolero | Poco común | 5 apuestas ganadas seguidas | 🏮 | Farol con luz pulsante dorada |
| 3 | `profeta-minor` | Profeta Menor | Raro | Ganar 10 predicciones de ranking en total | 🔮 | Orbe violeta con brillo interno |
| 4 | `uja` | Uja | Raro | Apostar 50 partidas en total (sin importar resultado) | 🎰 | Trébol de 4 hojas estilizado |
| 5 | `ardilla` | Ardilla | Épico | Acumular 5000 Chispas en ganancias de Trastienda (payout total) | 🐿️ | Ardilla conSeen dorado |
| 6 | `profeta-mayor` | Profeta Mayor | Épico | Acertar 5 predicciones de ranking consecutivas | 🌟 | Estrella fugaz atravesando un dado |
| 7 | `ecualizador` | Ecualizador | Legendario | Ganar 20 apuestas en Trastienda sin perder ninguna seguida (racha) | ⚖️ | Balanza perfectamente nivelada, brillo platino |
| 8 | `sentenciador` | Sentenciador | Legendario | 100 apuestas totales con EV positivo neto (>0 ganancia neta) | 👁️ | Ojo cerrado con rayo, estilo grabado |
| 9 | `gniñardo` | Gniñardo | Mitológico | Top 3 del ranking semanal 3 semanas seguidas + 1 predicción acertada cada semana | 👑 | Corona retorcida con chispas violeta |

### Sistema de rareza

| Rareza | Color de borde | Fondo | Probabilidad implícita | Cantidad total |
|---|---|---|---|---|
| Común | `#8892b0` (texto-secundario) | Surface-2 | ~60% de jugadores activos de Trastienda | ~6 |
| Poco común | `#3fb88b` (correcto) | Surface-2 + borde verde | ~25% | ~3 |
| Raro | `#7c5cff` (primario) | Surface-2 + borde violeta | ~10% | ~2 |
| Épico | `#ff8a3d` (racha) | Surface-2 + borde naranja | ~4% | ~2 |
| Legendario | `#ffc53d` (logro) | Surface-2 + borde dorado | ~1% | ~2 |
| Mitológico | degradé primario→logro | Surface-2 + borde degradé | <0.5% | ~1 |

### Integración con catálogo existente

Los títulos de Trastienda se agregan a `CATALOGO_TITULOS` en `src/lib/titulos/catalogo.ts` con una nueva categoría `"trastienda"`:

```typescript
export type CriterioTitulo =
  | ... // existentes
  | { tipo: "trastienda_apuestas_ganadas"; valor: number }
  | { tipo: "trastienda_apuestas_racha"; valor: number }
  | { tipo: "trastienda_predicciones_ganadas"; valor: number }
  | { tipo: "trastienda_predicciones_racha"; valor: number }
  | { tipo: "trastienda_ganancia_neta"; valor: number }
  | { tipo: "trastienda_apuestas_totales"; valor: number }
  | { tipo: "trastienda_ranking_prediccion_top3" };
```

El verificador (`verificar.ts`) agregaría una rama propia que lee de `trastienda_apuestas` y `trastienda_predicciones_ranking`.

---

## 4. MECÁNICA 4 — Ruleta de Trastienda

### Diseño desde cero con economía controlada

**Concepto**: Ruleta de segmentos, NO una máquina tragamonedas. El jugador gira, cae en un segmento, recibe el premio correspondiente. Simple, transparente, sin packing.

### Matriz de segmentos

| Segmento | Color | Probabilidad | Recompensa | EV (Chispas) |
|---|---|---|---|---|
| ⚡ Boost | `#ff8a3d` | 8% | 1 boost (valor 600) | 48.0 |
| 🛡️ Escudo | `#7c5cff` | 12% | 1 escudo (valor 350) | 42.0 |
| ❄️ Congelamiento | `#3fb88b` | 10% | 1 congelamiento (valor 450) | 45.0 |
| 💰 50 Chispas | `#ffc53d` | 15% | 50 Chispas | 7.5 |
| 💰 25 Chispas | `#ffc53d` | 18% | 25 Chispas | 4.5 |
| 💰 100 Chispas | `#ffc53d` | 5% | 100 Chispas | 5.0 |
| 🎨 Fuente aleatoria | `#A794FF` | 4% | 1 fuente no desbloqueada (o 200 Chispas si tiene todas) | 40.0* |
| 🖼️ Marco aleatorio | `#E8B34D` | 3% | 1 marco no desbloqueado (o 300 Chispas si tiene todos) | 30.0* |
| 🔮 Título raro | `#7c5cff` | 1% | 1 título de Trastienda al azar (raro o menos) | 25.0* |
| 💀 Sin premio | `#1f2430` | 24% | Nada | 0 |
| **TOTAL** | | **100%** | | **EV = 247.0** |

\* *Valor estimado promedio considerando probabilidad de que el jugador ya tenga el item.*

### Coste por giro

**Coste: 150 Chispas** (~1.25 partidas).

**EV del jugador por giro: 247 / 150 = 1.65** — **¡EV >1!** Esto destruiría la economía.

### Recálculo con EV <1

**Objetivo: EV = 0.94** (house edge 6%). Coste 150 → payout esperado = 141.

**Segmentos ajustados**:

| Segmento | Probabilidad | Recompensa | EV |
|---|---|---|---|
| ⚡ Boost | 5% | 1 boost (600) | 30.0 |
| 🛡️ Escudo | 8% | 1 escudo (350) | 28.0 |
| ❄️ Congelamiento | 6% | 1 congelamiento (450) | 27.0 |
| 💰 50 Chispas | 12% | 50 Chispas | 6.0 |
| 💰 25 Chispas | 20% | 25 Chispas | 5.0 |
| 💰 100 Chispas | 3% | 100 Chispas | 3.0 |
| 🎨 Fuente aleatoria | 2% | 1 fuente (o 200 Chispas) | 16.0* |
| 🖼️ Marco aleatorio | 1.5% | 1 marco (o 300 Chispas) | 13.5* |
| 🔮 Título raro | 0.5% | 1 título Trastienda | 10.0* |
| 💀 Sin premio | 42% | Nada | 0 |
| **TOTAL** | **100%** | | **EV = 138.5** |

**EV del jugador: 138.5 / 150 = 0.923** → house edge 7.7%. **Aceptable.**

### Límites diarios

| Límite | Valor | Justificación |
|---|---|---|
| Giros máximo/día | 5 | Coste total máx: 750 Chispas (~6.25 partidas) |
| Límite de pérdidas | 3 giros sin premio seguidos → "pity" | Evita frustración extrema |
| Coste primer giro del día | 120 Chispas (descuento 20%) | Incentivo a volver cada día |
| Coste giros 2-5 | 150 Chispas (normal) | Precio estándar |

### Pity system

Después de **3 giros sin premio consecutivos**, el 4to giro tiene garantía de al menos un premio menor (25+ Chispas o 1 item de utilidad). Esto:
- Evita rachas de mala suerte frustrantes.
- Aumenta el coste promedio esperado del jugador (gira más veces para "recuperar").
- Limita la pérdida máxima a ~4 giros sin retorno significativo.

### Tabla

```sql
CREATE TABLE trastienda_ruleta (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  fecha date DEFAULT current_date,
  segmento text NOT NULL,             -- 'boost' | 'escudo' | ... | 'nada'
  premio_tipo text,                   -- 'item' | 'chispas' | 'fuente' | 'marco' | 'titulo' | null
  premio_detalle jsonb,               -- {item: 'escudo'} o {chispas: 50} o null
  giro_numero integer NOT NULL,       -- 1-5 del día
  pity_counter integer DEFAULT 0,     -- giros sin premio consecutivos
  costo_aplicado integer NOT NULL,    -- 120 o 150
  creado_at timestamptz DEFAULT now(),
  CONSTRAINT trastienda_ruleta_user CHECK (user_id = auth.uid())
);
```

### Animación de la ruleta (resumen)

- **Fase 1 (0-0.5s)**: ruleta rota rápido (360°/s) con blur.
- **Fase 2 (0.5-2.0s)**: desacelera con easing `cubic-bezier(0.25, 0.1, 0.25, 1)`.
- **Fase 3 (2.0-2.5s)**: rebote suave (±15°) sobre el segmento final.
- **Fase 4 (2.5-3.5s)**: flash de color del segmento + reveal del premio.
- **Feedback**: sonido de "tictac" por segmento pasado, "ding" al parar, "fanfarria" si es premio raro+.

---

## 5. MECÁNICA 5 — Minijuegos

### Filosofía
3-5 minijuegos MUY pulidos, no 20 basura. Cada uno es un microcosmos de riesgo/recompensa, memoria, probabilidad, tiempo, matemática o deducción. Todos usan Chispas como entrada y dan Chispas o items como salida.

---

### Minijuego 1: "La Calcu" (Matemática bajo presión)

**Nombre en universo**: La Calcu — la calculadora maldita del sótano.

**Mecánica**: Se muestra una meta (ej: "llegar a 24 con estos 4 números"). El jugador tiene 30 segundos para encontrar la combinación de operaciones que llegue al resultado exacto. Si llega, gana. Si no, pierde.

**Entrada**: 50 Chispas.
**Salida**:
- Solución exacta: 150 Chispas (×3).
- Solución en 10 segundos o menos: 200 Chispas (×4).
- Sin solución / tiempo agotado: 0.

**EV calculado**: ~35% de usuarios resuelven "24 game" con 4 números. EV = 0.35 × 150 = 52.5 / 50 = **1.05** → ajustar a ×2.5 (salida 125) → EV = 0.35 × 125 / 50 = **0.875**. **OK.**

**Controles**: Teclado numérico + botones de operaciones (+, -, ×, ÷). Tap para seleccionar números y operadores.

**Estados**: ` esperando | jugando | resuelto | fallido `
**Duración**: 30 segundos.
**Target**: Jugadores que disfrutan matemática mental (core audience de Prodigia).

---

### Minijuego 2: "Acertijos de Enigmia" (Memoria + Deducción)

**Nombre en universo**: Acertijos de Enigmia — los rompecabezas que dejó el bibliotecario.

**Mecánica**: Se muestra una secuencia de 4-6 símbolos (colores, formas, números) durante 3 segundos. Luego se ocultan. El jugador debe reconstruir el patrón exacto (orden correcto). Dificultad variable: 4 símbulos = fácil, 6 = difícil.

**Entrada**: 40 Chispas.
**Salida**:
- 4 símbolos correctos: 100 Chispas (×2.5).
- 5 símbolos: 180 Chispas (×4.5).
- 6 símbolos: 300 Chispas (×7.5).
- Error: 0.

**EV calculado**: ~60% aciertan 4, ~35% aciertan 5, ~15% aciertan 6. EV = (0.6×100 + 0.35×180 + 0.15×300) / 40 = (60 + 63 + 45) / 40 = **4.2** → demasiado alto.

**Ajuste**: subir costo a 80 Chispas. EV = 168 / 80 = **2.1** → sigue alto.

**Ajuste 2**: difficulty scaling automático — si el jugador acierta 3 seguidos, sube la dificultad (6 símbolos, 2 segundos de展示). Bajar salidas:

| Dificultad | Símbolos | Tiempo展示 | Salida | P(acierto) |
|---|---|---|---|---|
| Fácil | 4 | 3s | 90 Chispas | 65% |
| Media | 5 | 2.5s | 150 Chispas | 35% |
| Difícil | 6 | 2s | 250 Chispas | 12% |

**EV = (0.65×90 + 0.35×150 + 0.12×250) / 80** → pero solo un nivel por ronda. **EV ponderado: (0.65×90 + 0.35×150 + 0.12×250) / 3 = ~122. EV = 122/80 = 1.52** → ajustar costo a 100. EV = 122/100 = **1.22** → ajustar salidas a 80/130/210. EV = (0.65×80 + 0.35×130 + 0.12×210)/100 = (52+45.5+25.2)/100 = **1.227** → subir costo a 110. EV = **1.11** → OK, ajustar más.

**EV final objetivo: 0.90-0.95**. Con costo 100 y salidas 70/120/200: EV = (0.65×70 + 0.35×120 + 0.12×200)/100 = (45.5+42+24)/100 = **1.115** → bajar más.

**Costo 100, salidas 60/100/170**: EV = (0.65×60 + 0.35×100 + 0.12×170)/100 = (39+35+20.4)/100 = **0.944** → **PERFECTO.**

**Controles**: Tap en los símbolos para colocarlos en orden. Botón "Confirmar" cuando termine.

**Estados**: `mostrando | recordando | resuelto | fallido`
**Duración**: 8-12 segundos (3s展示 + tiempo ilimitado para recordar, pero timer general de 30s).
**Target**: Jugadores de Enigmia, fans de memoria y patrones.

---

### Minijuego 3: "Volado" (Probabilidad pura)

**Nombre en universo**: Volado del Trastiendista — cara o cruz, pero con twist.

**Mecánica**: Moneda virtual. El jugador elige cara (violeta/Primario) o cruz (dorado/Logro). Tira la moneda. Simple. PERO: puede apostar más de una vez (max 3 rondas) y cada ronda DOBLA la apuesta base. Si pierde en cualquier ronda, pierde todo.

**Entrada**: 30 Chispas base.
**Ronda 1**: 30 Chispas. Si gana: 55 Chispas (×1.83).
**Ronda 2**: 60 Chispas (reinvierte 55 + 5 más). Si gana: 110 Chispas.
**Ronda 3**: 120 Chispas. Si gana: 220 Chispas.

**EV por ronda**: 0.5 × multiplier. Ronda 1: EV = 0.5 × 1.83 = 0.915. Ronda 2: EV = 0.5 × 1.83 × (inversión reinvertida) = misma proporción. **EV total esperado: ~0.91** por ronda, acumulativo.

**Pero**: el jugador puede parar después de cualquier ronda y quedarse con lo ganado. Esto cambia la estrategia óptima → EV real > 0.91 (el jugador promedio para en ronda 2 si ganó). **EV estimado del sistema: ~0.88** (por la tentación de seguir).

**Controles**: Un botón grande "TIRAR". Opciones "Parar" y "Seguir" después de cada ronda ganada.
**Estados**: `apostando | tirando | resultado | retirado`
**Duración**: 3-10 segundos.
**Target**: Jugadores casual, experiencia rápida y emocionante.

---

### Minijuego 4: "La Pizarra" (Deducción lógica)

**Nombre en universo**: La Pizarra del Profesor — adiviná el número.

**Mecánica**: Se genera un número del 1 al 100 (secreto). El jugador hace preguntas de "mayor/menor" y el sistema responde. Cada pregunta cuesta Chispas. Debe adivinar en 7 intentos o menos para ganar.

**Entrada**: 20 Chispas (precio fijo).
**Costo por pregunta**: 10 Chispas adicionales.
**Salida**:
- Adivina en 1-3 intentos: 200 Chispas (ganancia neta: 200 - 20 - (intentos×10))
- Adivina en 4-5 intentos: 120 Chispas.
- Adivina en 6-7 intentos: 60 Chispas.
- No adivina: 0.

**EV calculado**: Con estrategia óptica (búsqueda binaria), se puede garantizar adivinar en 7 intentos (2^7 = 128 > 100). PERO: la mayoría de usuarios no usa búsqueda binaria perfecta.

**P(1-3 intentos)**: ~10% (suerte). Ganancia neta: 200 - 20 - 20 = 160.
**P(4-5 intentos)**: ~35%. Ganancia neta: 120 - 20 - 45 = 55.
**P(6-7 intentos)**: ~40%. Ganancia neta: 60 - 20 - 65 = -25.
**P(>7)**: ~15%. Ganancia neta: -20 - 70 = -90.

**EV = (0.10×160 + 0.35×55 + 0.40×(-25) + 0.15×(-90)) / costo_total_esperado**

Inversión esperada: 20 + (4.5×10) = 65 Chispas.
EV bruto = (0.10×200 + 0.35×120 + 0.40×60 + 0.15×0) = (20 + 42 + 24 + 0) = 86.
EV neto = 86 - 65 = **21** →EV por giro = 86/65 = **1.32** → ajustar.

**Ajuste**: subir costo base a 30. Inversión esperada: 30 + 45 = 75.
EV bruto = 86. EV neto = 86 - 75 = **11** → ratio 86/75 = **1.15** → bajar salidas.

**Salidas ajustadas**: 150/90/40/0. EV bruto = (0.10×150 + 0.35×90 + 0.40×40 + 0) = 15 + 31.5 + 16 = 62.5.
EV = 62.5/75 = **0.833** → subir un poco.

**Salidas finales**: 170/100/50/0. EV = (0.10×170 + 0.35×100 + 0.40×50) / 75 = (17+35+20)/75 = 72/75 = **0.96** → **aceptable.**

**Controles**: Input numérico 1-100 + botón "Preguntar". O tap en rueda numérica.
**Estados**: `jugando | ganado | perdido`
**Duración**: 30-90 segundos.
**Target**: Jugadores analíticos, fans de deducción lógica.

---

### Minijuego 5: "El Reloj" (Velocidad + matemática)

**Nombre en universo**: El Reloj del sótano — el tiempo es plata.

**Mecánica**: 15 problemas de cálculo mental rápido (suma/resta ×10,範囲 10-99). Cada problema tiene 5 segundos. Si resuelve todos, gana el pozo. Si falla alguno, pierde la entrada.

**Entrada**: 60 Chispas.
**Salida**:
- 15/15 correctas: 250 Chispas (×4.17).
- 12-14 correctas: 150 Chispas.
- 9-11 correctas: 90 Chispas.
- <9: 0.

**EV calculado**: Para usuario promedio de Prodigia (nivel calibración ~4):
- P(15/15) = ~5%. Salida: 250.
- P(12-14) = ~25%. Salida: 150.
- P(9-11) = ~40%. Salida: 90.
- P(<9) = ~30%. Salida: 0.

**EV = (0.05×250 + 0.25×150 + 0.40×90 + 0.30×0) / 60 = (12.5+37.5+36+0)/60 = 86/60 = 1.43** → ajustar.

**Salidas ajustadas**: 180/110/65/0. EV = (0.05×180 + 0.25×110 + 0.40×65)/60 = (9+27.5+26)/60 = 62.5/60 = **1.04** → bajar más.

**Salidas finales**: 160/95/55/0. EV = (0.05×160 + 0.25×95 + 0.40×55)/60 = (8+23.75+22)/60 = 53.75/60 = **0.896** → **aceptable.**

**Controles**: Input numérico + Enter para submit. Auto-avanza al siguiente.
**Estados**: `preparando | jugando | resuelto | fallido`
**Duración**: 75 segundos (15 × 5s).
**Target**: Core audience — usuarios de práctica diaria que quieren "sparkar" su velocidad.

---

### Resumen de minijuegos y EV

| Minijuego | Costo | EV | Target | Duración |
|---|---|---|---|---|
| La Calcu | 50 | 0.88 | Matemáticos | 30s |
| Acertijos Enigmia | 100 | 0.94 | Memoria/Deducción | 30s |
| Volado | 30 | 0.88 | Casual | 3-10s |
| La Pizarra | 30+ | 0.96 | Analíticos | 30-90s |
| El Reloj | 60 | 0.90 | Core practice | 75s |

**EV promedio de minijuegos: 0.912** → house edge promedio 8.8%. **Sano.**

### Tabla compartida para minijuegos

```sql
CREATE TABLE trastienda_minijuegos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  juego text NOT NULL,                 -- 'la_calcu' | 'acertijos' | 'volado' | 'la_pizarra' | 'el_reloj'
  entrada integer NOT NULL,            -- chispas pagadas
  salida integer DEFAULT 0,            -- chispas ganadas
  resultado jsonb,                     -- datos específicos del juego
  mejor_racha integer DEFAULT 0,       -- racha máxima de victorias (para títulos)
  racha_actual integer DEFAULT 0,
  creado_at timestamptz DEFAULT now(),
  CONSTRAINT trastienda_mini_user CHECK (user_id = auth.uid())
);
```

---

## 6. Resumen de EV y economía

| Mecánica | Costo entrada | EV del jugador | House edge | Volumen estimado/día |
|---|---|---|---|---|
| Apuesta a partida | 25-200 | 0.94 | 6% | 2-5 apuestas/usuario activo |
| Predicción ranking | 25-200 | 0.50 | 50% | 1/semana/usuario |
| Ruleta | 120-150 | 0.92 | 8% | 3-5 giros/usuario |
| Minijuegos (promedio) | 30-100 | 0.91 | 9% | 2-3 partidas/usuario |

**Flujo neto de Chispas por usuario activo de Trastienda (estimado)**:
- Entra con 500 Chispas (ganadas en práctica normal).
- Gasta: 5 × 150 (ruleta) + 3 × 60 (minijuegos) + 2 × 100 (apuestas) = 750 + 180 + 200 = 1130.
- Gana de vuelta (EV 0.91 promedio): 1130 × 0.91 = 1028.
- **Pérdida neta: ~102 Chispas** por sesión.
- Equivale a ~0.85 partidas de práctica.
- **Conclusión**: el jugador "paga" menos de 1 partida por una sesión completa de Trastienda. Aceptable.

---

## 7. DECISIONES PARA EL ORQUESTADOR

### Autorización
- **RLS necesario**: las tablas `trastienda_*` necesitan policies de INSERT/UPDATE solo para el propio usuario, y SELECT para el propio usuario. Las funciones de resolución necesitan `security definer`.
- **Grant necesario**: `GRANT INSERT, SELECT ON trastienda_* TO authenticated`. Las funciones de resolución necesitan acceso de UPDATE.
- **Nuevo migration**: `0116_trastienda.sql` (o el siguiente número disponible).

### Balance
- **House edge total de Trastienda: ~8% promedio**. Aceptable para una feature de entretenimiento dentro de un juego educativo.
- **Riesgo de destrucción de economía**: si un usuario gasta 750 Chispas/día en ruleta y pierde ~60, eso es 0.5 partidas/día de "costo". No rompe la economía.
- **Riesgo de explotación**: mitigado por límites diarios (5 giros, 1 predicción/semana).

### Lugar de entrada en la UI
- **Opción A (recomendada)**: Trastienda como sección al final de la Tienda (`/tienda`), accesible desde un botón "🚪 Entrar a la Trastienda" al fondo. Ya existe el patrón en `TiendaClient.tsx:118` (`trastiendaAbierta`). Se expandiría esa sección en una página completa.
- **Opción B**: Ruta独立 `/trastienda`. Más limpio, pero requiere nueva ruta y decisión de navegación.
- **Recomendación**: Opción A por ahora, con posibilidad de mover a ruta独立 si la feature crece.

### Dependencias con seguridad
1. **S5 (`resolver_apuesta_si_activa`)**: NO es prerequisito. La nueva mecánica usa tabla propia.
2. **S0/S1 (accreditar_chispas, registrar_puntos_mundo)**: SI afectan — si un jugador puede fabricar Chispas infinitas, Trastienda se vuelve trivial. **Recomendación**: avanzar con S0/S1 antes de lanzar Trastienda.
3. **S2 (policies amplias)**: Las tablas nuevas usan RLS propio, no dependen de S2.

### Próximos pasos de implementación
1. Crear migración `0116_trastienda.sql` con las 4 tablas.
2. Crear RPCs: `fetch_apuestas_disponibles`, `apostar_partida`, `resolver_apuesta_partida`, `girar_ruleta`, `jugar_minijuego_*`.
3. Crear componente `TrastiendaClient.tsx` (expandir la sección existente).
4. Agregar títulos a `CATALOGO_TITULOS` y `verificar.ts`.
5. Crear assets (ver TRASTIENDA-DESIGN.md).
6. Testing: 0 edge cases de concurrencia (2 usuarios apostando a la misma partida).

---

*Documento de diseño. Sin código de runtime. Referencias: `src/lib/tienda/costos.ts`, `src/lib/titulos/catalogo.ts`, `src/app/api/tienda/apostar/route.ts`, `src/app/[locale]/tienda/TiendaClient.tsx`, `docs/economy/ECONOMY.md`, `docs/audits/MASTER-AUDIT.md`.*
