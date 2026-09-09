# LEVEL-UP-ANIMACION-2026-09-08 — Spec de la animación de "subir de nivel" (cuenta)

> Autor: agente combinado **gameplay + visual-design + ux-ui** (P2). Método: verificación contra CÓDIGO real (package.json, componentes de partícula/gesto/sonido, rutas de finish y migraciones de nivel). Estados según `docs/AGENT-RULES.md` §1.
> Alcance: SOLO spec/docs. No hay código de runtime; no se tocan migraciones ni archivos de estado.

---

## PROBLEMA

El "subir de nivel" del jugador hoy se siente como **texto**, no como un **EVENTO**. Si bien ya existen gestos para hitos (logro, nivel de mundo, ganar duelo), el nivel **de cuenta** (`profiles.nivel_cuenta`) — el que el PO llama "NIVEL X" — **no dispara ninguna celebración**:

- `nivel_cuenta` sube invisible dentro de `registrar_xp_diario()` → `acreditar_chispas()` (server-side), pero **la ruta de finish no expone `nivel_subio`/`nivel_nuevo`/`bonus_nivel` al cliente** (grep `finish/route.ts` → el response JSON de la línea 207-233 solo devuelve `puntosTotal`, `logrosNuevos`, `nivelMundo`, etc.; no hay `nivelCuenta`/`subioNivelCuenta`).
- El resultado: el usuario agarra el bonus (`50 * nivel`) de Chispas sin que nadie le avise, y la barra de progreso del perfil salta sin contexto.

Por eso el requerimiento: una animación central de **level up** que se sienta evento, con: símbolo central → carga de energía → explosión → partículas → "¡NIVEL X!" → recompensa → confirmación.

---

## STACK REAL (verificado en `calibra/package.json`)

| Capa | Librería instalada | Uso propuesto |
|---|---|---|
| DOM animación | **framer-motion ^13.1.0** (`motion`/`AnimatePresence`) | Orquestación de fases del overlay/card |
| Partículas | **canvas 2D manual** (patrón ya en `ChispaClick.tsx`) | Explosión/partículas (sin lib extra) |
| Sonido | **Web Audio** (patrón ya en `lib/sonido.ts`) | Tono de nivel sintetizado |
| CSS | **Tailwind v4** (CSS-first, `@tailwindcss/postcss`) | Layout/card/keyframes de glow |
| Extra instalado | `gsap ^3.15`, `three ^0.185`, `ogl` | **NO se usan** — overkill; framer + canvas alcanzan |
| Plataforma | **Capacitor 8 (Android)** | Animación DOM+canvas corre bien; evitar WebGL pesado/quemado de batería |

**Decisión técnica central: framer-motion para el DOM + canvas 2D solo para las partículas de la explosión.** Motivo: coherente con el stack existente (ver "Componentes a reutilizar"), sin agregar dependencias, y el patrón de partículas por canvas ya está probado en `ChispaClick.tsx`.

---

## COMPONENTES A REUTILIZAR / REFACTORIZAR (cotejo de reuso)

**Existentes, reutilizables tal cual:**
- `src/components/GestoLogo.tsx` — el gesto del logo (anillo abre + chispa escapa) es **la estética de celebración de Prodigia**. Se usa en NivelMundoSubio, LogroBanner y ResultadoDueloBlock. El level up de cuenta debe reutilizarlo como símbolo central (idéntico lenguaje, distinta escala/color).
- `src/lib/efectos.ts` — `efectosHabilitados()`/`useSyncExternalStore` ya respetan toggle de usuario + `prefers-reduced-motion`. Reutilizar para decidir si se corren partículas/gesto.
- `src/lib/sonido.ts` — `reproducirTono("nivel")` ya existe (chime ascendente C5→E5→G5) y respeta mute + reduced-motion. Es la base del concepto sonoro (ver SONIDO).
- `src/components/PuntajeCorner.tsx` — patrón de partículas decorativas con `motion.span` (6 partículas en intensidad "grande") y `IntensidadPuntaje` (`chico|medio|grande`). Reutilizar la convención de "partículas = decoración, info real = всегда visible".
- `src/components/ChispaClick.tsx` — **patrón canvas 2D** (dibujar partícula con `requestAnimationFrame`, ResizeObserver, alpha/scale por progreso). Reutilizar la estructura para la explosión de partículas del burst.

**Refactorizar / conectar:**
- `src/app/api/practica/finish/route.ts` — el **trigger real**: hoy NO devuelve si subió `nivel_cuenta`. La spec exige que `registrar_xp_diario` (o un RPC par) propague `nivel_subio`+`nivel_nuevo`+`bonus_nivel` y que el JSON de respuesta incluya `nivelCuenta: { subio, nivel, bonus }`. Este es el punto de enganche (ver DÓNDE SE DISPARA).
- Un nuevo overlay reutilizable (`LevelUpOverlay`) que integre GestoLogo+partículas+sound moralmente como lo hace `LogroBanner`/`NivelMundoSubio`, para montarse en un solo punto del árbol (probablemente en `[locale]/layout.tsx` o cerca de where se renderiza el `resumen`).

---

## DÓNDE SE DISPARA (punto de trigger real)

Cadena server→cliente que detona el level up de cuenta:

1. `src/app/api/practica/finish/route.ts:154-157` llama `supabase.rpc("registrar_xp_diario", ...)`.
2. Dentro de SQL, `registrar_xp_diario()` → `acreditar_chispas()` (`supabase/migrations/0070_...sql:119-149`) recalcula `nivel_cuenta` desde `xp_historico_total` y, si subió, suma el bonus `50 * nivel` y setea `v_subio=true`, `v_nivel_nuevo`, `v_bonus`.
3. `finish/route.ts:207-233` arma el `NextResponse.json`. **ACÁ falta** devolver `nivelCuenta`. Este es el punto donde la animación encuentra su "subió" — el hook debe leer `resumen.nivelCuenta.subio` y montar el overlay.
4. En cliente, `SprintSummary.tsx:78-88` recibe `resumen` y renderiza `LogroBanner`/`NivelMundoSubio`. El nuevo `LevelUpOverlay` se montaría en la misma zona (o a nivel layout).

> Estados: el trigger de cuenta (nivel_cuenta) es **VERIFICADO POR CÓDIGO** (0070 + finish route), pero hoy **NO está expuesto en el response** → es el hueco a cerrar. El resto de triggers equivalentes (`skillLevel.nivel` en cada `*SprintRunner`, `nivelMundo` en finish) ya existen y sirven de referencia de formato.

---

## TECHNICAL SPEC — Storyboard por fases

Estados: `idle → charging → burst → reward → done`. Transición de estados vía máquina simple (useState/useReducer) orquestada por framer-motion; el símbolo central es `GestoLogo` (o su vía de escala mayor).

| # | Estado | Timing | Easing | Qué pasa visual |
|---|---|---|---|---|
| 0 | `idle` | 0ms | — | Overlay entra (backdrop oscuro suave + card), símbolo central aparece en escala 0.6→1 |
| 1 | `charging` | 0→700ms | easeInOut | Símbolo **se intensifica**: escala 1→1.25 con 3 pulsos (`scale:[1,1.15,1.28,1.15]`), glow/blur se acumula (sombra + filtro `blur` creciente), ligera vibración RMS (translate ±2px a ~18Hz, decay) |
| 2 | `burst` | 700→950ms | easeOut (primer cuadro = exponencial) | **Explosión**: símbolo escala 1.28→1.8 con `opacity 1→0` rápido; al 720ms salta canvas de partículas radiales; corta pulse de luz de fondo (`background` destello) |
| 3 | `reward` | 950→1900ms | backOut | Aparece "¡NIVEL X!" (tipografía `font-display font-black`, la de celebraciones) + debajo la recompensa `+{bonus} Chispas` con `CountUp`; glow suave |
| 4 | `done` | 1900→2600ms | easeInOut | Fade de salida del overlay (opacity→0, scale→0.95) → llama `onDone` y desmonta (AnimatePresence) |

**Duración total ≈ 2.6s.** Acceso: si el usuario toca el overlay en `reward`/`done`, se acelera el cierre (salto a `done`), nunca bloqueante.

### PARTÍCULAS (fase `burst`)
- **Cantidad:** 24–36 (escala con `nivel_cuenta`: +4 por nivel, techo 60) — cifra justificada: es un evento "grande" (no 6 como PuntajeCorner grande).
- **Física:** cada partícula tiene `angle` uniforme en 360°, `speed` 80–220 px/s con ligera aleatoriedad, `drag` 0.90, `gravity` suave (opcional, caída leve), duración 500–750ms, alpha 1→0 con cola, `scale` 1→0.4.
- **Estilo:** dibujar con el degradé del logo `#A794FF→#FFC53D` (mismo que `ChispaClick.tsx:28-32` y `GestoLogo.tsx:33-37`) para que el burst sea "de Prodigia". Forma: puntos + 2–3 chispas comet de mayor tamaño.
- **Implementación:** canvas 2D de `pointer-events-none` sobre la card, mismo patrón `requestAnimationFrame` + `clearRect` de `ChispaClick.tsx:88-116`.

### A11Y / prefers-reduced-motion
- `efectosHabilitados()` ya devuelve `false` si `prefers-reduced-motion: reduce` (`src/lib/efectos.ts:22`). Con reduced-motion: **se simplifica, NO se saltea** — el overlay aparece, muestra "¡NIVEL X!"+recompensa con un simple `opacity` fade (sin burst, sin vibración, sin partículas, sin glow). La **información** (nivel + recompensa) siempre se muestra; solo se quita lo decorativo. Mismo criterio que `PuntajeCorner.tsx:25-28`.
- El overlay debe ser `role="alertdialog"`/`aria-live="polite"`, con `aria-label` descriptivo ("Subiste al nivel X, ganaste Y Chispas"); el botón de cerrar accesible por teclado.
- Respetar el toggle de partículas/efectos global (`efectosHabilitados`).

---

## SONIDO (conceptual)

Sensación: **arpegio ascendente con estallido final** — "ascenso de energía" que sube y remata en la explosión.

- **Timbre:** onda `triangle` (como `sonido.ts:106-107` para notas musicales) para nivel/charging; agrega un `sine` una octava arriba como armónico. 
- **Estuctura (Web Audio, ~1.3s):**
  - *charging (0–0.55s):* glissando ascendente corto/creciente en volumen (pulsos 3–4 notas que suben), volumen bajo (0.06→0.10) — sensación de "acumulando".
  - *burst (0.55–0.7s):* ruido/transitorio percusivo (noise burst breve, ganancia rápida decay) + nota grave-sólida — el "boom" de la explosión.
  - *reward (0.7–1.3s):* fanfarria mayor en `triangle` (similar a `duelo_gano`, `sonido.ts:138-143`) heredando la identidad del chime `"nivel"` existente (`sonido.ts:125-130`).
- **Dónde insertarlo:** en `src/lib/sonido.ts` — nueva función o variante `reproducirTono("level_up")` (agregar al union `TipoTono`, `sonido.ts:108`) que respete mute + `prefiereMenosEstimulo()`. **Web Audio, sin archivos de audio** — coherente con el criterio del repo. Se invoca en el mismo hook que dispara la animación (leading edge de `reward`).

---

## UI — Layout card / overlay (desktop + mobile)

**Overlay full-screen** (fondo oscuro al 50–70%, blur) → **card centrada**.

- **Card (desktop):** `max-w-sm rounded-3xl bg-surface p-8 text-center shadow-2xl`, gap 4, centrado.
  - Fila superior: símbolo central `GestoLogo size={130}` (colores del gradiente, `colorHex` del mundo o `#FFC53D`).
  - `¡NIVEL X!` — `font-display text-4xl font-black tracking-tight` (tipografía Black de celebraciones).
  - Recompensa — `+{bonus} Chispas` con icono de chispa + `CountUp`, `font-mono font-bold text-primario`.
  - Subtitulo opcional `text-sm text-texto-secundario` ("Seguí sumando para el nivel {X+1}").
  - Botón **"¡Continuar!"** (`Boton` existente) → cierra.
- **Card (mobile / Capacitor, tap):** mismas piezas, `max-w-[88vw]`, `GestoLogo size={110}`, `text-3xl` en el titular, botón full-width `w-full` (blanco táctil ≥48px de alto). El **tap** en cualquier parte del overlay también avanza/cierra (acelera a `done`), nunca bloquea.
- **Estados reentrada:** ver "REENTRADA".

### REENTRADA (si el usuario cierra a mitad o la app se pausa)
- **Propuesta:** el "level up" es un evento **one-shot no crítico** — el nivel y el bonus ya quedaron acreditados server-side (source of truth RLS). Si el overlay se cierra/salta a mitad, **no bloquea y no persiste modal** (no engorroso).
- **Badge pendiente:** opcional y NO en esta iteración. El nivel nuevo siempre es visible en el header/perfil (dato vivo). Si se quiere refuerzo, daría un micro-badge "Nivel nuevo" en el header hasta el primer vistazo al perfil — marcado PENDIENTE, fuera del alcance P2.

---

## ASSETS NECESARIOS
- **Ninguno nuevo de tipo imagen/audio** — todo se sintetiza con código (GestoLogo, canvas, Web Audio), alineado al criterio del repo (sin archivos de audio/imagen con licencia).
- Único "asset" conceptual: los **tonos de level_up** a definir como datos (`Nota[]`) en `sonido.ts` (¡refactor del union `TipoTono`).

---

## DECISIONES PARA ORQUESTADOR
1. **Técnica:** framer-motion (DOM/fases) + canvas 2D (partículas burst) + Web Audio (sonido). Descartar three/ogl/gsap (instalados pero no necesarios).
2. **Filosofía:** reutilizar la **identidad visual de Prodigia** (GestoLogo + gradiente `#A794FF→#FFC53D` + tipografía Black + chime de nivel), NO confetti genérico.
3. **Trigger:** el hueco real es que `finish/route.ts` no devuelve `nivelCuenta`. El orquestador decide si propagar desde SQL (`registrar_xp_diario` devolviendo `nivel_subio/nivel_nuevo/bonus`) o consultar `nivel_cuenta` antes/después en la ruta. Recomendado: propagar desde SQL para atomicidad (misma transacción del bonus).
4. **A11y default:** reduced-motion = simplificado (fade, info visible), nunca skipeado.
5. **Gate de audio:** respetar `sonidoHabilitado()` + `prefiereMenosEstimulo()`; gate de efectos: `efectosHabilitados()`.
6. **Montaje:** componente único `LevelUpOverlay` consumido desde el punto donde ya se procesa `resumen` (SprintSummary y equivalentes) o re-declarado a nivel layout; evitar duplicar la lógica en cada mundo.

---

## VERIFICACIÓN (viabilidad de la técnica en el stack actual)
- framer-motion `^13.1.0` **ya instalado y usado** en ≥25 archivos (`AnimatePresence` en onboarding `OnboardingForm`, `motion.div` en `LogroBanner`, `GestoLogo`, `PuntajeCorner`, `template.tsx`). ✅ CONFIRMADO POR CÓDIGO.
- Canvas 2D + requestAnimationFrame **ya implementado** en `ChispaClick.tsx` (patrón idéntico al necesario). ✅
- Web Audio **ya implementado** en `lib/sonido.ts` (`AudioContext` + `reproducirSecuencia`). ✅
- Toggles de accesibilidad **ya existen** (`efectos.ts`, `sonido.ts` respetan reduced-motion). ✅
- Sin dependencias nuevas → no aplica `docs/EXTERNAL-RESOURCES.md`.

---

## ESTADO
- CONFIRMADO POR CÓDIGO: stack real, componentes reutilizables, trigger de `nivel_cuenta` en SQL (0070), hueco en `finish/route.ts`.
- NO VERIFICADO: comportamiento en vivo del overlay en Capacitor (sin navegador/device en esta sesión).
- PENDIENTE: badge de reentrada (fuera de alcance P2), decisión SQL-propagation vs consulta-en-ruta.

## ARCHIVOS (referencia, NO editados)
- `calibra/package.json`
- `src/components/GestoLogo.tsx`, `ChispaClick.tsx`, `NivelMundoSubio.tsx`, `LogroBanner.tsx`, `PuntajeCorner.tsx`
- `src/lib/efectos.ts`, `src/lib/sonido.ts`
- `src/app/api/practica/finish/route.ts` (trigger), `src/app/[locale]/practica/SprintSummary.tsx` (punto de montaje)
- `supabase/migrations/0070_clanes_niveles_y_roles.sql` (lógica de nivel_cuenta + bonus `50*nivel`)

## SIGUIENTE PASO
1. (Server, mínimo) Que `finish/route.ts` exponga `nivelCuenta: { subio, nivel, bonus }`.
2. (Client) Crear `LevelUpOverlay` reutilizando `GestoLogo` + patrón canvas de `ChispaClick` + `reproducirTono`, montado donde se procesa `resumen`.
3. (Sonido) Nueva variante `level_up` en `sonido.ts` (`TipoTono`) con la estructura timbre de SONIDO.
4. Test: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`.
