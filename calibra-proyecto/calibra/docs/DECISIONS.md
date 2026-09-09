# DECISIONS — Decisiones de diseño (ADR)

> Registro de decisiones importantes y su justificación. Agregar nuevas como entrada al final, con fecha y estado.
> Formato: `## <YYYY-MM-DD> — <título>` + contexto + decisión + consecuencias + estado (verificado/pendiente).

## 2026-09-07 — Recrear infraestructura de agentes y documentación base

- **Contexto:** el repo tenía solo el bloque autogenerado de Next.js en AGENTS.md y `.opencode/` no existía. No hay CI/registro de arquitectura; los docs de especificación estaban desactualizados.
- **Decisión:** crear `AGENTS.md` extendido (conservando el bloque Next.js), `.opencode/agents/*.md` (22 agentes de dominio), y `docs/` de coordinación (AGENT-INDEX, AGENT-RULES, PROJECT-STATE, ARCHITECTURE, DECISIONS, TECH-DEBT, EXTERNAL-RESOURCES, agent-work/ACTIVE).
- **Consecuencias:** cualquier agente/desarrollador tiene un punto de entrada normalizado. El estado actual queda CÓDIGO-First (el repo manda, los docs se marcan cuando se desactualizan).
- **Estado:** VERIFICADO POR CÓDIGO (creación de archivos; el contenido refleja lectura real del repo).

## 2026-08-27 — Opción del mundo de referencia para paridad (heredada de PARIDAD_MUNDOS.md)

- **Decisión:** Numeria es el mundo de referencia de la matriz de paridad (por ser el mundo base y el que mejor cubierto está).
- **Estado:** VERIFICADO POR CÓDIGO según matriz en `docs/PARIDAD_MUNDOS.md`.

## Histórico de decisiones previas (resumen, heredadas)

- **Estándar de fecha en retos/rachas:** UTC en cliente (`racha.ts`, `lunesDeEstaSemanaIso`) con el mismo criterio que Postgres (`current_date`, `date_trunc('week',...)`) — `0113`.
- **Onboarding 2 mundos gratis:** `elegir_mundos_iniciales(text[])` se llama UNA vez con los 2 slugs, y se hace parte de `0112` (evita romper el flujo de llamada doble a la RPC vieja de 1 mundo — ver comentario en `FlujoElegirMundos.tsx`).
- **Todos los mundos son "potencialmente pagos"** (incluso Numeria): cuál es gratis depende de la elección inicial de cada cuenta (`precios.ts`, `0097`).
- **Precio real en el servidor:** `desbloquear_mundo()` define el precio; el cliente solo muestra el número de referencia (`PRECIO_MUNDO_CHISPAS`).
- **Ranking público vía `security definer`** con `limit 100`, porque la RLS de filas propias no deja lecturas cruzadas (`0113`).

## 2026-09-09 — Trastienda con identidad visual propia (implementado)

- **Contexto:** la Trastienda era una tarjeta granate genérica ("doble o nada") sin relación con la identidad Prodigia (`TiendaClient.tsx`). El spec `docs/audits/TRASTIENDA-VISUAL-2026-09-09.md` propuso la metáfora del "sótano del Bazar". El PO pidió implementarlo.
- **Decisión:** aplicar la identidad visual nueva sobre el módulo existente, sin tocar la mecánica ni el flujo server-authoritative:
  - Tokens `--tt-*` en `globals.css` (los 3 bloques de tema + `@theme`) — paleta violeta oscuro, **sala siempre oscura por diseño** (propuesta P2).
  - La puerta de entrada usa el emblema candado (`IconCandado`, propuesta P3) y no el emoji 🚪.
  - Header de sala con "Volver al Bazar" + **caja fuerte** (balance en mono dorado `--tt-accent`, propuesta P7).
  - Rayo de luz violeta desde la "escalera" + marca de agua del candado al fondo (opacidad 0.05).
  - Montos apostables como chips de mesa (`rounded-full`, `--tt-surface-2`).
  - Estados: apuesta activa = badge "⏳ Pendiente" con borde punteado `--tt-accent`; error en `--tt-danger`.
- **Consecuencias:** la Trastienda se percibe como un lugar distinto (frío) bajo la Tienda (cálida), manteniendo 0 cambio de lógica. Copy nuevo agregado en `es.json`/`en.json` (laTrastienda, sotanoDescripcion, volverAlBazar, cajaFuerte, apuestaPendiente).
- **Pendiente PO:** las demás propuestas de `TRASTIENDA-VISUAL` (P1 paleta ya aplicada; P4 ruleta vertical, P5 glow pulsante, P6 transición candado animado, P8-P10) y TODOS los módulos nuevos (ruleta, mesa de apuestas a partidas, minijuegos, vitrina de objeto raro, títulos de Trastienda) requieren la economía server de `TRASTIENDA-ECONOMIA.md` (migraciones) que aún no existe — no se implementan hasta `TRASTIENDA-DESIGN/TRASTIENDA-ECONOMIA` se aprueben en detalle.
- **Estado:** VERIFICADO POR CÓDIGO (tsc 0 · eslint 0 en tocados · vitest 126/126). Verificación visual en browser: PENDIENTE del usuario.

## 2026-09-09 — Trastienda: economía server del primer corte (ruleta + volado + pizarra + historial)

- **Contexto:** `TRASTIENDA-ECONOMIA.md` define 5 mecánicas y 6 minijuegos. El PO quería "los módulos", pero implementar todo de una vez era inmanejable y requirente de más decisiones. Se definió un corte pragmático de economía server-authoritative y EV controlado (target 0.92-0.96/interacción) sobre lo que no depende de funciones de otros jugadores ni de datos de la app.
- **Decisión (`supabase/migrations/0121_trastienda_economia.sql`):**
  - **Ruleta** (Mecánica 4): 10 segmentos con probabilidades espejo en `src/lib/trastienda/ruleta.ts`, límite 5 giros/día, 1er giro 120 / siguientes 150 Chispas, pity: 3 giros sin premio → 4º garantizado. Segmento "titulo" (Mecánica 3, diferida) entrega ESCUDO como placeholder. EV ~0.92 con pity.
  - **Volado** (Mecánica 5, minijuego): RNG SOLO server, hasta 3 rondas, entradas 30/60/120 → pagos 55/110/220, EV 0.915/ronda; el jugador puede parar o seguir.
  - **La Pizarra**: el server guarda el secreto (1-100, RNG), el cliente NUNCA lo ve. Entrada 30, 10 por pregunta, máx 7 intentos, máx 3 partidas/día. Pagos 170 (1-3 intentos) / 100 (4-5) / 50 (6-7). Tabla sin RLS ni grants — solo RPCs `security definer`.
  - **Historial** (`fetch_trastienda_historial`, últimas 8) para el módulo `HistorialTrastienda`.
  - **Fix resiliente del doble o nada**: `apostar_doble_o_nada` (0054) y `resolver_apuesta_si_activa` (0025) se RECREAN con guards `to_regclass('public.logic_attempts'/'duel_results')` y `ADD COLUMN IF NOT EXISTS` — el error genérico que veía el usuario ("Algo salió mal") era probablemente 42P01 por tablas inexistentes en prod (HIPÓTESIS, sin acceso a DB). EV 0.92/0.94 intacto.
- **DIFERIDO (registrado en TECH-DEBT):** Mecánica 1 (apostar a partida de otro), Mecánica 2 (predicciones de ranking), Mecánica 3 (títulos Trastienda), minijuegos La Calcu/Acertijos/El Reloj; ruleta horizontal circular en vez de la tómbola vertical P4 del spec visual.
- **Consecuencias:** la Trastienda pública vs privada — el cliente solo consulta historial; resultados/secretos de azar nunca viajan al cliente. Client i18n espejado es/en (47 keys cada uno). La `trastienda_minijuegos` reemplaza el `apuesta_doble_o_nada` como fuente del volado sin romper la apuesta activa existente (usuario con apuesta pendiente la sigue resolviendo en próxima partida).
- **Estado:** VERIFICADO POR CÓDIGO (tsc 0 · eslint tocados 0 · vitest 132/132 con 6 tests nuevos de ruleta · build limpio con las 4 rutas nuevas). SQL sin verificar contra DB: **el usuario debe aplicar `0121_trastienda_economia.sql` a prod y retestear el doble o nada + módulos.**