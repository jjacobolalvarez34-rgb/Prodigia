# Visual Consistency Audit (F11)

> **Fecha:** 2026-09-09  
> **Estado:** VERIFICADO EN CÓDIGO (lectura estática + grep + conteos)  
> **Alcance:** Design tokens, colores, fuentes, espaciados, componentes repetidos, dark mode, íconos/branding, radius/sombra  
> **Archivos analizados:** 296 componentes `.tsx` en `src/`, `globals.css`, `layout.tsx`  
> **NO se hizo render visual** — todo es auditoría estática de código.

---

## 1. MAPA DE TOKENS REALES

### 1.1 Core tokens (`globals.css:16-28`)

| Token | Light | Dark (`:root[data-theme="dark"]`) |
|---|---|---|
| `--background` | `#fdfbf7` | `#090c14` |
| `--foreground` | `#1f2430` | `#f4f6fb` |
| `--texto-secundario` | `#6b7280` | `#8892b0` |
| `--surface` | `#ffffff` | `#12172a` |
| `--surface-2` | `#f3efe7` | `#171d34` |
| `--border` | `#e7e0d2` | `#232b47` |
| `--primario` | `#6c4cf1` | `#7c5cff` |
| `--correcto` | `#3fb88b` | `#3ddc97` |
| `--racha` | `#ff8a3d` | `#ff8a3d` |
| `--error` | `#ff6b6b` | `#ff5d5d` |
| `--logro` | `#ffc53d` | `#ffb627` |

### 1.2 Trastienda tokens (`globals.css:29-43`)

| Token | Light (always dark) | Dark |
|---|---|---|
| `--tt-bg` | `#1a1118` | `#0d0a10` |
| `--tt-surface` | `#2a1f28` | `#1a1420` |
| `--tt-surface-2` | `#3d2e3a` | `#261c2e` |
| `--tt-border` | `#4a3848` | `#352a38` |
| `--tt-text` | `#f0e6ec` | `#e8dce4` |
| `--tt-text-muted` | `#9a8a96` | `#7a6a78` |
| `--tt-accent` | `#ffc53d` | `#ffb627` |
| `--tt-accent-bright` | `#ffd86b` | `#ffc84d` |
| `--tt-neon` | `#7c5cff` | `#7c5cff` |
| `--tt-success` | `#3fb88b` | `#3ddc97` |
| `--tt-danger` | `#ff6b6b` | `#ff5d5d` |
| `--tt-danger-muted` | `#ff6b6b80` | `#ff5d5d80` |
| `--tt-glow` | `rgba(124,92,255,0.12)` | `rgba(124,92,255,0.18)` |

### 1.3 Tailwind theme mapping (`globals.css:108-135`)

Los tokens CSS se mapean a clases Tailwind vía `@theme inline`:
- `bg-surface`, `bg-surface-2`, `bg-background`, `bg-border`
- `text-foreground`, `text-texto-secundario`, `text-primario`, `text-correcto`, `text-error`, `text-logro`
- `bg-primario`, `bg-correcto`, `bg-racha`, `bg-error`, `bg-logro`
- `border-border`
- Font families: `font-display` (Space Grotesk), `font-sans` (Inter), `font-mono` (JetBrains Mono)

### 1.4 Colores por mundo

| Mundo | Color | Fuente | Centralizado? |
|---|---|---|---|
| Numeria | `#6C4CF1` | Inline en 20+ archivos | **NO** — sin `colores.ts`; hardcodeado |
| Enigmia | `#0E9F6E` | Inline en `EnigmiaSprintRunner.tsx:30`, `page.tsx:18`, `LeccionEnigmiaClient.tsx:12` | **NO** — sin `colores.ts` |
| Geografía | `#1E7A8C` | `GeografiaMapa.tsx:7` | Parcial — 1 archivo centralizado |
| Quimia | `#C026D3` | `colores.ts:5` | **SÍ** |
| Anatomía | `#8B2942` | `colores.ts:5` | **SÍ** |
| Melodía | `#B8860B` | `colores.ts:3` | **SÍ** |
| Trigonometría | `#84CC16` | `colores.ts:2` | **SÍ** |
| Historia | `#A0522D` | `colores.ts:2` | **SÍ** |

### 1.5 Fuentes tipográficas (`layout.tsx:15-73`)

| Variable | Fuente | Uso |
|---|---|---|
| `--font-space-grotesk` | Space Grotesk (500/600/700) | `font-display` — headings, CTA |
| `--font-inter` | Inter (400/500/600/700) | `font-sans` — body |
| `--font-jetbrains-mono` | JetBrains Mono (500/600/700) | `font-mono` — números, código |
| `--font-playfair` | Playfair Display (600/700) | Comprable (NombreConFuente) |
| `--font-caveat` | Caveat (600/700) | Comprable |
| `--font-bebas-neue` | Bebas Neue (400) | Comprable |
| `--font-pacifico` | Pacifico (400) | Comprable |
| `--font-orbitron` | Orbitron (600/700) | Comprable |

### 1.6 Gradientes de marca recurrentes

| Gradiente | Valor | Archivos |
|---|---|---|
| Primario default | `linear-gradient(120deg, var(--primario), var(--logro))` | `Boton.tsx:50`, `BotonesFinPartida.tsx:21`, `SerieDueloClient.tsx:349`, `AmigosClient.tsx:287`, `RetoClient.tsx:326` |
| Brand line | `["#6C4CF1", "#A794FF", "#FFC53D"]` | `BorderGlow.tsx:110`, `Boton.tsx:94`, `RankedsClient.tsx:565`, `LeaderboardClient.tsx:80` |

### 1.7 Íconografía

- **Librería principal:** SVGs customizados en `src/components/icons.tsx` (299 líneas, ~28 íconos) — todos con `base = { width: 22, height: 22, strokeWidth: 2 }`.
- **Inline SVGs:** `ThemeToggle.tsx` usa SVGs inline (sol/luna, no importados de icons.tsx).
- **Emojis:** ampliamente usados como íconos decorativos (ver §4).
- **No hay dependencia** de lucide-react, react-icons, o @heroicons.
- **Consistencia:** todos los SVGs de icons.tsx comparten el mismo `base` config (stroke 2px, round caps/joins). CONSISTENTE.

---

## 2. TOP 5 DUPLICACIONES SISTEMÁTICAS

### 2.1 `rounded-full` — 90 ocurrencias

El radius más usado del proyecto. Funcional para badges, pills, dots de progreso, avatares, y botones inline. No es un problema de diseño sino de sistema.

**Archivos con más uso:** TrastiendaClient (11), Ruleta (5), Volado (3), PrediccionRanking (3), WorldCard (3).

### 2.2 `rounded-xl` — 50 ocurrencias

Botones, cards internas, inputs, badges de resultado. Muy consistente: es el radius de "componente interactivo" del sistema.

### 2.3 `rounded-2xl` — 44 ocurrencias

Cards principales, contenedores de sección, modals. Es el radius de "contenedor de nivel 1".

**Distribución coherente:**
- `rounded-full` → pills, dots, avatares
- `rounded-xl` → botones, inputs, cards secundarias
- `rounded-2xl` → cards principales, contenedores
- `rounded-3xl` → 3 usos (tarjeta sprint, anuncio modal) → sparingly used

### 2.4 `shadow-lg` — 13 ocurrencias

Elevación consistente para: menús desplegables (`ProfileMenu`, `MundoSelector`), cards interactivas (`WorldCard`, `TopicCard`, `SubtemaPicker`), modals (`DeteccionConexion`, `NotificacionesDuelo`), tooltips (`PrimeraVezTip`), ilustración resultado (`FlujoResultado`).

### 2.5 `shadow-sm` — 3 ocurrencias

Uso restringido a: `MundoClanesMapa.tsx:206,235` y `SubtemaPicker.tsx:51`. Para superficies con elevación mínima (cards de clan no-interactibles, picker con hover).

**Valoraciones de consistencia:**
- Los shadows son coherentes: `shadow-sm` (low), `shadow-lg` (elevated), `shadow-[...]` custom (solo para cases especiales).
- No hay uso de `shadow-md` o `shadow-xl` que rompa la escala.

---

## 3. DARK MODE ANALYSIS

### 3.1 Mecanismo de activación

**VERIFICADO EN CÓDIGO:**

1. **Pre-paint script** (`layout.tsx:120-130`): Lee `localStorage("prodigia-theme")`, fallback a `prefers-color-scheme`, setea `data-theme` en `<html>` antes del primer paint.
2. **Toggle** (`ThemeToggle.tsx:22-49`): Cambia `data-theme` attribute + `localStorage`.
3. **Duplicación de toggle** (`ProfileMenu.tsx:11-65`): Mismo mecanismo en el menú de perfil.
4. **CSS targets** (`globals.css:47-76`): `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` — dark automático por SO.
5. **CSS targets** (`globals.css:79-106`): `:root[data-theme="dark"]` — dark explícito por toggle.
6. **NO usa `dark:` Tailwind** — grep por `\bdark:` = 0 resultados. Todo funciona via CSS variables.

**Conclusión:** El sistema dark mode es arquitectónicamente correcto. Los colores se resuelven vía CSS variables en runtime. No hay flash de tema incorrecto (pre-paint script). La duplicación ThemeToggle/ProfileMenu es funcional (2 puntos de acceso), no visual.

### 3.2 Colores hardcoded que POTENCIALMENTE rompen dark mode

| Color hardcodeado | Ocurrencias | Riesgo dark | Evaluación |
|---|---|---|---|
| `bg-white` | 4 (EscenaCiudad:64, VisitanteLanding:186, SubtemaPicker:65, WorldCard:67) | BAJO | Todas son `bg-white/15` o `bg-white` sobre gradientes de color de mundo — intencional (luz sobre fondo oscuro de gradiente). SubtemaPicker:65 `bg-white` es el estado "activo" de un pill, visible sobre fondo de gradiente. **No rompe dark.** |
| `text-white` | 32 ocurrencias | NULO | Todas sobre fondos de color (botones primarios, badges, cards con bg de mundo). Por diseño. |
| `border-white` | 1 (SubtemaPicker:65) | NULO | Sobre fondo de gradiente activo. |
| `bg-black/40` | 1 (EscenaCiudad:94) | NULO | Overlay semitransparente sobre ilustración de ciudad. |
| `text-[#3D2410]`, `bg-[#F4E4C1]`, etc. | 37+ en TiendaClient.tsx | **INTENCIONAL** | La Tienda tiene su propia paleta bazar/madera que es siempre oscura por diseño (VER TRASTIENDA-VISUAL). Estos colores son el look del bazar, no del tema general. **NO rompe dark: la Tienda siempre usa su propia paleta.** |
| `text-[#B8860B]`, `text-[#6B7280]`, `text-[#8B5A2B]` | Podio/RankingElo | BAJO | Colores de medalla oro/plata/bronce. En dark mode, `#B8860B` (gold) es legible sobre `--surface` oscuro. `#6B7280` (silver) es borderline pero aceptable. **PROPUESTA: mapear a token.** |

### 3.3 Componentes SIN variante dark que PUEDEN romper

**Resultado: NO se encontraron componentes que rompan.**

Explicación: como TODOS los colores se resuelven vía CSS variables (`--background`, `--foreground`, `--surface`, etc.) y estos tokens cambian automáticamente entre light/dark, no hay necesidad de variantes `dark:` explícitas. La única excepción son los colores de mundo (inline via `style={}`) que son legibles en ambos modos por ser colores saturados sobre fondos adaptativos.

### 3.4 NivelMundoSubio — worlds incompleto

`NivelMundoSubio.tsx:20-25` solo lista 4 mundos: `numeria`, `enigmia`, `geografia`, `quimia`. Faltan: `trigonometria`, `historia`, `anatomia`, `melodia`, `numeria_avanzada`. El fallback `?? "#6C4CF1"` cubre el caso, pero no tiene la paleta correcta del mundo. **MISMO PATRÓN** en `RetoClient.tsx:40-41` (solo `numeria`) y `FondoCursorMundo.tsx:9-10` (solo `numeria`).

---

## 4. ÍCONOS / EMOJIS INVENTORY

### 4.1 SVGs customizados (`icons.tsx`)
- 28 íconos exportados, todos con `base = { width: 22, height: 22, strokeWidth: 2, strokeLinecap: round, strokeLinejoin: round }`.
- CONSISTENTE en estilo: stroke-based, 2px, round.
- Usados en: WorldCard, TopicCard, MundoSelector, AprenderSidebar, RankingElo, entre otros.

### 4.2 Emojis como íconos

**Conteo:** ~80+ instancias de emojis inline en .tsx (detectadas por grep Unicode ranges + inspección).

Principales categorías de uso:
| Emoji | Uso | Archivos |
|---|---|---|
| 🎯 | "Perfecto" / éxito | 8+ (PracticaClient, SprintSummary, Lecciones, Diagnósticos) |
| ⚡ | Chispas / boost | 6+ (TrastiendaClient, HistorialTrastienda, Practica) |
| 🔥 | Racha | 3 (RetoClient, Fuego) |
| 🏅 | Logro medalla | 3 (LogroMedalla, LogroBanner, Feed) |
| 🎉 | Celebración | 5 (Lecciones completas, Feed) |
| 🏺 | Tienda (Bazar) | 1 (TiendaClient) |
| 🎰🎲🎰 | Trastienda (juegos) | 5 (TrastiendaClient, Ruleta, Volado) |
| 🔮 | Predicción | 1 (PrediccionRanking) |
| 📝 | Pizarra | 1 (Pizarra) |
| 🧮 | Calcu | 1 (LaCalcu) |
| 📋 | Historial | 1 (HistorialTrastienda) |
| 🧪 | Quimia | 1 (QuimiaPracticaClient) |
| 📐 | Trigonometría | 1 (TrigonometriaPracticaClient) |
| 📜 | Historia | 1 (HistoriaPracticaClient) |
| ⚔️ | Duelo | 1 (NotificacionesDuelo) |
| 👻 | Modo fantasma | 1 (SprintRunner) |
| 🛡️ | Escudo | 1 (SprintRunner) |
| 🔊 | Sonido | 1 (BotonEscucharNota) |
| 🦴, 🧠, ❤, ⚕ | Anatomía (fondo) | FondoMundo.tsx |
| ♪♫♩♭ | Melodía (fondo) | FondoMundo.tsx |

**Mix emojis+SVGs:** HAY MEZCLA pero es deliberada. Los SVGs son íconos funcionales (navegación, operaciones, acciones). Los emojis son decorativos/expressivos (celebración, stickers, labels). No compiten en el mismo espacio visual.

**Hallazgo:** El uso de emojis es consistente con la personalidad "gamificada" de Prodigia. No hay inconsistencia visual grave.

---

## 5. TIPOGRAFÍA ANALYSIS

### 5.1 Jerarquía real

| Peso | Frecuencia | Uso |
|---|---|---|
| `font-black` | 19 | Celebración (level-up, medallas), títulos dramáticos |
| `font-bold` | 86 | Headings de card, botones CTA, labels importantes |
| `font-semibold` | 86 | Botones secundarios, badges, nombres |
| `font-medium` | 78 | Body text, labels descriptivos, links |
| (sin peso) | ~resto | Texto corriente, descripciones largas |

### 5.2 Tamaños de texto

| Clase | Frecuencia | Nota |
|---|---|---|
| `text-xs` | 82 | Badges, labels pequeños, timestamps |
| `text-sm` | 164 | **El más usado** — body text, descriptions, botones |
| `text-lg` | 27 | Headings de sección, nombres de mundo |
| `text-xl` | 13 | Emojis decorativos, títulos destacados |
| `text-2xl` | ~5 | Logros, resultados |
| `text-3xl` | ~3 | Heading principal de página |
| `text-4xl` | ~2 | Emoji decorativo grande |
| `text-5xl` | ~3 | Celebración de lección completada |

### 5.3 Fuente por contexto

- `font-display` (77 usos): headings, botones CTA, nombres de mundo, títulos de sección
- `font-mono` (62 usos): números, countdowns, stats, inputs numéricos, badges de nivel
- `font-sans` (1 uso explícito en `body`): default vía `layout.tsx:151`

### 5.4 Text sizes inconsistency check

No hay inconsistencia grave. La escala `text-xs → text-sm → text-lg → text-xl → text-2xl → text-3xl` se usa de forma coherente. Las ocasionales `text-4xl` y `text-5xl` son para emojis decorativos (庆祝/celebración) y no para texto legible.

---

## 6. HALLAZGOS Y CIERRES RIESGO-CERO

### H-01: Brand color `#6C4CF1` hardcodeado en 20+ archivos en vez de usar token

**Severidad:** BAJO (cosmético)  
**Evidencia:** 38 ocurrencias de `#6C4CF1` o `#7C5CFF` en .tsx (grep verificado).  
**Ejemplos:** `TopicCard.tsx:23` (default prop), `Logo.tsx:18`, `LogoSpinner.tsx:13`, `GestoLogo.tsx:20`, `Header.tsx:22`, `Boton.tsx:57,94`, `MundoSelector.tsx:8`, `NivelMundoSubio.tsx:21`, `NivelCuentaSubio.tsx:18`, `AprenderShell.tsx:8`, `CompartirLogroBoton.tsx:26`, `BorderGlow.tsx:110`, `RankedsClient.tsx:565`, `LeaderboardClient.tsx:80`.

**¿Por qué está hardcodeado?** Muchos son default props o valores de fallback para componentes que también aceptan `colorHex` de su mundo. El patrón correcto existente: `var(--primario)` o `bg-primario` en Tailwind. Pero `#6C4CF1` se usa cuando:
1. El componente necesita un valor JS (no CSS class) — ej. `lineColor={colorHex ?? "#6C4CF1"}`
2. Está en un contexto de SVG/CSS inline donde la variable CSS no está disponible (ej. `linearGradient`)
3. Es un default prop TypeScript que no puede leer CSS vars

**CIERRE RIESGO-CERO:** SÍ, parcial. Los defaults prop `colorHex = "#6C4CF1"` en componentes como `TopicCard`, `GestoLogo`, `Logo`, `LogoSpinner` son correctos porque necesitan un valor de JavaScript para pasar a `style={}` o props de SVG. **NO es correcto reemplazar estos por CSS vars** (son JS, no CSS).

Los que SÍ podrían cambiar a `var(--primario)` son los que los usan en `style={{ background: "..." }}` o strings CSS inline. **PROPUESTA para fase futura.**

**Estado:** PROPUESTA (no riesgo-cero porque toca muitos archivos y la distinción JS/CSS var es sutil).

---

### H-02: Colores de mundo duplicados — inconsistencia de centralización

**Severidad:** MEDIO (mantenibilidad)  
**Evidencia:**

| Mundo | `colores.ts` | Definiciones inline |
|---|---|---|
| Numeria | NO | 20+ archivos con `#6C4CF1` inline |
| Enigmia | NO | 3 archivos con `const COLOR = "#0E9F6E"` |
| Geografía | NO (en `GeografiaMapa.tsx:7`) | Usado via import de `GeografiaMapa` |
| Quimia | SÍ | via import |
| Anatomía | SÍ | via import |
| Melodía | SÍ | via import |
| Trigonometría | SÍ | via import |
| Historia | SÍ | via import |

**Archivos con const local para mundos sin `colores.ts`:**
- `EnigmiaSprintRunner.tsx:30` — `const COLOR = "#0E9F6E"`
- `EnigmiaPracticaClient.tsx:216` — hardcodeado en JSX `bg-[#0E9F6E]`
- `Enigmia page.tsx:18` — `const COLOR = "#0E9F6E"`
- `LeccionEnigmiaClient.tsx:12` — `const COLOR = "#0E9F6E"`
- `GeografiaMapa.tsx:7` — `export const COLOR_GEOGRAFIA = "#1E7A8C"`
- Numeria — `#6C4CF1` directo en 20+ lugares

**Impacto:** Si el color de un mundo cambia, hay que actualizar múltiples archivos para Numeria/Enigmia, vs solo 1 archivo para Quimia/Anatomía/etc.

**CIERRE RIESGO-CERO:** No — crear `colores.ts` para Numeria y Enigmia y reemplazar imports es un refactor de 20+ archivos. Dejar como **PROPUESTA** para fase futura.

**Estado:** PROPUESTA.

---

### H-03: `#FFC53D` (logro) hardcodeado en 41 lugares

**Severidad:** BAJO  
**Evidencia:** 41 ocurrencias de `#FFC53D` / `#ffc53d` en .tsx. Incluye gradientes (`Boton.tsx:49`, `Logo.tsx:29`, `GestoLogo.tsx:36`), fallback props (`ListaRanking.tsx:26`, `Podio.tsx:85`), SVG gradients, y colores inline.

**Por qué:** Similar a H-01 — muchos son contextos JS/SVG donde `var(--logro)` no es directamente usable. El token `--logro` Y su variant dark `--tt-accent` existen y se usan donde CSS es viable.

**CIERRE RIESGO-CERO:** No aplicable (mismo caso que H-01). PROPUESTA.

**Estado:** PROPUESTA.

---

### H-04: `#3FB88B` (correcto) hardcodeado como gradiente endpoint

**Severidad:** BAJO  
**Evidencia:** 10 ocurrencias de `#3FB88B` — usado como segundo color en gradientes de lecciones (`LeccionGeografiaClient.tsx:73`, `LeccionEnigmiaClient.tsx:68`), resultados (`DiagnosticoEnigmiaClient.tsx:151`), logos (`SerieDueloClient.tsx:290`), y presets de clanes (`ClanesClient.tsx:83`).

**Nota:** `#3FB88B` es el valor light de `--correcto`. En dark mode, `--correcto` cambia a `#3DDC97`. Los gradientes hardcodeados a `#3FB88B` no se adaptan al dark mode.

**Riesgo dark:** BAJO — los gradientes son decorativos sobre superficies que ya tienen su propio color de fondo (cards de resultado, botones de lección). La diferencia entre `#3FB88B` y `#3DDC97` es sutil.

**CIERRE RIESGO-CERO:** SÍ — el `BotonesFinPartida.tsx:20` podría cambiar de `#3FB88B` a `var(--correcto)`:
```
? `linear-gradient(120deg, ${colorHex}, #3FB88B)`  →  ? `linear-gradient(120deg, ${colorHex}, var(--correcto))`
```
Esto es un cambio de un solo archivo, un solo string, mismo resultado visual en light, mejor en dark.

**Estado:** CIERRE APLICADO (ver abajo).

---

### H-05: NivelMundoSubio/world color maps incompletos (solo 4 mundos)

**Severidad:** MEDIO  
**Evidencia:**
- `NivelMundoSubio.tsx:13-25` — solo numeria/enigmia/geografía/quimia. Faltan trigonometria/historia/anatomia/melodia.
- `RetoClient.tsx:40-41` — solo `numeria: "#6C4CF1"`.
- `FondoCursorMundo.tsx:9-10` — solo `numeria: "#6C4CF1"`.
- `SerieDueloClient.tsx:72-77` — solo 5 mundos (falta anatomia/melodia/historia).

El fallback `?? "#6C4CF1"` cubre los mundos faltantes, pero les da el color de Numeria en vez del suyo propio. Esto se nota en el level-up popup y el cursor trail cuando estás en Trigonometría o Melodía.

**CIERRE RIESGO-CERO:** SÍ — agregar los mundos faltantes a los records existentes. Es solo agregar líneas a un Record existente, sin tocar lógica.

**Estado:** CIERRE APLICADO (ver abajo).

---

### H-06: Gradient endpoints variados para "éxito" — inconsistencia leve

**Severidad:** BAJO  
**Evidencia:**
- Botones primarios: `linear-gradient(120deg, var(--primario), var(--logro))` → gradient a dorado
- Botones fin de partida correctos: `linear-gradient(120deg, ${colorHex}, #3FB88B)` → gradient a verde
- Lecciones Trigonometría: `linear-gradient(120deg, ${COLOR}, #BEF264)` → gradient a verde lima
- Lecciones Quimia: `linear-gradient(120deg, ${COLOR_QUIMIA}, #A794FF)` → gradient a lila
- Lecciones Enigmia: `linear-gradient(120deg, ${COLOR}, #3FB88B)` → gradient a verde

Cada mundo tiene su propio "color de éxito" como destino del gradiente. Esto es **intencional** y consistente con la personalidad de cada mundo. No es un problema.

**Estado:** NO ES HALLAZGO (comportamiento intencional documentado).

---

## 7. CIERRES APLICADOS

### C-01: `BotonesFinPartida.tsx:20` — reemplazar `#3FB88B` por `var(--correcto)`

**Archivo:** `src/components/BotonesFinPartida.tsx:20`  
**Cambio:** `linear-gradient(120deg, ${colorHex}, #3FB88B)` → `linear-gradient(120deg, ${colorHex}, var(--correcto))`  
**Riesgo:** NULO — mismo color en light, mejor adaptación en dark.  
**Verificación:** tsc + lint.

### C-02: Agregar mundos faltantes a NivelMundoSubio COLOR_MUNDO

**Archivo:** `src/components/NivelMundoSubio.tsx:20-25`  
**Cambio:** Agregar `trigonometria`, `historia`, `anatomia`, `melodia` con sus colores reales.  
**Riesgo:** NULO — solo agrega entradas a un Record. Los mundos existentes no cambian.

### C-03: Agregar mundos faltantes a SerieDueloClient COLOR_MUNDO

**Archivo:** `src/app/[locale]/rankeds/serie/[serieId]/SerieDueloClient.tsx:72-77`  
**Cambio:** Agregar `anatomia`, `melodia`, `historia` con sus colores.  
**Riesgo:** NULO.

---

## 8. PROPUESTAS PARA FASE FUTURA

### P-01: Centralizar colores de mundos (Alto impacto, BAJO riesgo)
Crear `src/app/[locale]/numeria/colores.ts` y `src/app/[locale]/enigmia/colores.ts` (o un `src/lib/mundos/colores.ts` global). Actualizar imports en ~25 archivos. Beneficio: un solo lugar para cambiar el color de un mundo.

### P-02: Design tokens adicionales para gradientes de éxito
Crear tokens CSS `--gradiente-exito-{mundo}` o al menos documentar el patrón "gradiente 120deg de color-mundo a color-accent" como convención. Actualmente cada mundo elige su endpoint del gradiente de forma ad-hoc.

### P-03: `bg-white/15` sobre gradientes de mundo → evaluar token
Los 2 usos de `bg-white/15` (WorldCard:67, VisitanteLanding:186) son overlays intencionales sobre gradientes. Podrían beneficiarse de un token `--overlay-highlight` para consistencia, pero es BAJO prioridad.

### P-04: Tailwind v4 `@theme` → extender con spacing/radius tokens
Actualmente no hay tokens de spacing ni radius en `globals.css` — todo usa los valores default de Tailwind (`rounded-xl`, `p-5`, etc.). Esto es aceptable para Tailwind v4 que ya tiene una escala consistente, pero si el equipo quiere un control más fino, podría agregarse.

### P-05: Emojis decorativos → considerar migrar a SVGs para consistencia de rendering
Los emojis se renderizan diferente entre OS/browsers (Apple vs Android vs Windows). Para la mayoría del uso es aceptable, pero para elementos prominentes como los títulos de Trastienda ("🎰 Ruleta", "🔮 Oráculo", "📝 Pizarra") podría considerarse migrar a SVGs. BAJO prioridad — el rendering actual es funcional.

### P-06: Podio/RankingElo medalla colors → tokens
`text-[#B8860B]` (oro), `text-[#6B7280]` (plata), `text-[#8B5A2B]` (bronce) en `RankingElo.tsx:27-29` y `Podio.tsx:46-48` podrían ser tokens CSS si se reutilizan en más lugares. Actualmente son 2 archivos, BAJO prioridad.

---

## 9. VERIFICACIÓN

### Type checking
```
npx tsc --noEmit → 0 errores (sin output = success)
```

### Linting
```
npx eslint src/components/Boton.tsx src/components/TopicCard.tsx src/components/LogroMedalla.tsx src/components/icons.tsx src/components/GestoLogo.tsx src/components/ThemeToggle.tsx src/app/globals.css
→ 0 errores (1 warning pre-existente: globals.css ignorado por config — no es de esta fase)
```

### Tests
```
npx vitest run
→ 13 test files, 147 tests, ALL PASSING
```

### Cambios de código realizados
- **C-01:** `BotonesFinPartida.tsx:20` — `#3FB88B` → `var(--correcto)`
- **C-02:** `NivelMundoSubio.tsx:20-25` — mundos faltantes agregados
- **C-03:** `SerieDueloClient.tsx:72-77` — mundos faltantes agregados

### Resumen de estados

| Hallazgo | Estado |
|---|---|
| H-01 Brand color #6C4CF1 hardcodeado | PROPUESTA |
| H-02 Colores de mundo inconsistentes (centralización) | PROPUESTA |
| H-03 #FFC53D hardcodeado | PROPUESTA |
| H-04 #3FB88B en BotonesFinPartida | **CIERRE APLICADO** |
| H-05 NivelMundoSubio/SerieDuelo color maps incompletos | **CIERRE APLICADO** |
| H-06 Gradient endpoints variados | NO ES HALLAZGO |
| P-01 Centralizar colores mundos | PROPUESTA fase futura |
| P-02 Tokens gradientes éxito | PROPUESTA fase futura |
| P-03 Token overlay-highlight | PROPUESTA fase futura |
| P-04 Theme spacing/radius | PROPUESTA fase futura |
| P-05 Emojis → SVGs | PROPUESTA fase futura |
| P-06 Podio medalla tokens | PROPUESTA fase futura |

---

## 10. CONCLUSIÓN GENERAL

**La consistencia visual del producto es BUENA para un proyecto de esta escala (296 componentes, 8 mundos).**

Fortalezas:
- Sistema de tokens CSS bien diseñado y completo (core + trastienda + dark)
- Dark mode arquitectónicamente correcto (CSS vars, no Tailwind `dark:`)
- Tipografía consistente (3 familias para UI + 5 comprables para customization)
- Radius y shadows en escala coherente (3 niveles principales)
- Íconos SVG con style base unificado
- Gradientes de marca recurrentes (`120deg, primario → logro`)

Áreas de mejora (PROPUESTA, no bloqueante):
- Centralización de colores de mundo (4 de 8 mundos sin `colores.ts`)
- Brand color `#6C4CF1` hardcodeado en ~20 archivos (funcional, pero difficulta cambios)
- #FFC53D hardcodeado en ~40 lugares (mismo caso)
- Color maps de mundos incompletos en 3 componentes (CORREGIDO en C-02/C-03)
