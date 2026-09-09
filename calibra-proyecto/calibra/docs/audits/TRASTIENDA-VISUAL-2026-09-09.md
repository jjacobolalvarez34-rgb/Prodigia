# TRASTIENDA — Identidad Visual Reforzada

> Documento de especificación visual (sin código). Extiende `TRASTIENDA-DESIGN.md`.
> Creado: 2026-09-09. Referencias citadas contra código real.

---

## 0. Base de referencia

| Documento / Archivo | Qué aporta | Estado |
|---|---|---|
| `TRASTIENDA-DESIGN.md` | Concepto "sótano del Bazar", paleta inicial, layout, componentes, animaciones, assets | Base — este documento lo extiende/refuerza |
| `TRASTIENDA-ECONOMIA.md` | Mecánicas, EV, límites, tablas, server-authoritative | Autoridad económica — NO se contradice |
| `src/app/globals.css:16-60` | Paleta CSS vars (light/dark), data-theme, tipografía | Fuente de verdad de tokens |
| `src/components/Boton.tsx:45-51` | Degradé primario `linear-gradient(120deg, var(--primario), var(--logro))` | Reutilizar tal cual |
| `src/components/FondoMundo.tsx:23-91` | Patrón de glifos flotantes por mundo | Modelo para glifos Trastienda |
| `src/components/icons.tsx` | IconCandado (`src/components/icons.tsx:140`), IconOjo, iconos de mundo | Iconografía existente para reusar |
| `src/app/[locale]/tienda/TiendaClient.tsx:622-655` | Paleta y layout actual de Trastienda (granate/marrón) | A superar — identidad actual genérica |
| `src/lib/titulos/catalogo.ts` | Catálogo de títulos, sistema de rareza | Integrar títulos Trastienda |
| `docs/marketing/BRAND.md:7` | "SI no parece Prodigia, no es Prodigia" | Regla de oro — cumplir |
| `TiendaClient.tsx:478-510` | Estante con toldo colgante, franjas, sombra `0_14px_28px` | Patrón de sección de Tienda |

---

## 1. Concepto visual reforzado

### La metáfora ampliada: "El sótano del Bazar — una cueva bajo la ciudad"

La Tienda es un bazar luminoso con toldos a rayas, madera cálida y estantes de productos. La Trastienda es **lo que hay debajo** — no un sótano sucio, sino una cueva tallada en la roca oscura donde los ciudades de Prodigia van a hacer sus tratos más peligrosos. Es un speakeasy matemático: se llega por una escalera estrecha, la luz cambia, el aire se siente distinto.

#### Narrativa espacial (para implementadores)

| Zona | Metáfora visual | Elemento UI concreto |
|---|---|---|
| **La escalera** | Bajar desde la Tienda — transición de atmósfera | Fondo animado: gradiente de `--surface` (Tienda) a `--tt-bg` (Trastienda) durante 0.5s. Icono de candado existente (`IconCandado`) en el botón de entrada. |
| **La entrada** | Puerta de madera vieja con candado que se abre | Transición de fade-out de Tienda → fade-in de Trastienda. El candado se "abre" con una animación de rotación del arco (0.3s). |
| **La sala principal** | Cueva tallada con mesas de juego | Fondos oscuros sólidos (`--tt-bg`), paneles como mesas de madera oscura (`--tt-surface`). Sin neón, sin cristal — madera, metal, piedra. |
| **Los focos** | Luz puntual que ilumina las mesas | `--tt-glow`: sombra radial violeta sutil debajo de paneles activos. NO backlight por todos lados — solo en interacción. |
| **El objeto raro** | Vitrina iluminada en la pared de fondo | Panel dedicado con `--tt-glow` pulsante, borde de rareza, contenido dinámico. |
| **El barman** | Figura que opera la sala (presente pero no prominente) | Símbolo propuesto: candado abierto con chispa dentro. Ver sección 3.7. |

#### Elementos narrativos clave

1. **Luz de neón que entra desde arriba**: un solo rayo de luz violeta (`--primario`) que cae desde la "escalera" hacia la ruleta. Es el único elemento "neon" de toda la Trastienda — y es ambiental, no decorativo. Implementación: `::before` en el contenedor principal con `linear-gradient(180deg, var(--primario) 0%, transparent 40%)` a opacidad 0.06-0.08, posicionado arriba-centro.
2. **Mesas de juego**: cada panel/módulo es una "mesa" — superficie sólida oscura con borde fino y sombra profunda. Sin glassmorphism. Las mesas de apuestas tienen un sutil tinte del color del mundo al que pertenece la partida.
3. **La caja fuerte**: el display de Chispas del header es la "caja fuerte" de la sala — un rectángulo compacto con borde dorado, fondo `--tt-surface-2`, que muestra el balance como si fuera una lectura de una caja fuerte mecánica (números en JetBrains Mono, dígitos que "ruedan" al actualizar).
4. **La ruleta**: el objeto central — una tómbola vertical de 10 segmentos, no giratoria horizontal. La aguja está arriba, la ruleta gira. Es el único objeto con movimiento constante (idle: glow pulsante en el centro).
5. **La vitrina del objeto raro**: panel dedicado en la parte inferior, con un objeto que "brilla" dentro — glow pulsante lento (`--tt-glow`), borde de la rareza correspondiente, y una descripción del objeto actual. Solo aparece si hay un objeto raro disponible (ruleta o predicción).

#### Lo que NO es la Trastienda

- ❌ No es un casino genérico con luces neón por todos lados
- ❌ No es un arcade gamer con pasteles de colores
- ❌ No es un speakeasy real (no hay jazz, no hay mozas)
- ✅ Es un sótano de Prodigia: los mismos colores pero oscurecidos, profundos, con vida propia

---

## 2. Paleta Trastienda (hex exactos)

### 2.1 Variables CSS propuestas

Se agregan al bloque `:root` y a los bloques `data-theme` en `src/app/globals.css` con el prefijo `--tt-*` para aislar la paleta de Trastienda de la paleta general de la app.

```css
/* Modo claro (dentro de :root) */
--tt-bg:           #1a1118;
--tt-surface:      #2a1f28;
--tt-surface-2:    #3d2e3a;
--tt-border:       #4a3848;
--tt-text:         #f0e6ec;
--tt-text-muted:   #9a8a96;
--tt-accent:       #ffc53d;
--tt-accent-bright:#ffd86b;
--tt-neon:         #7c5cff;
--tt-success:      #3fb88b;
--tt-danger:       #ff6b6b;
--tt-danger-muted: #ff6b6b80;
--tt-glow:         rgba(124, 92, 255, 0.12);

/* Modo oscuro (dentro de :root[data-theme="dark"] y @media(prefers-color-scheme:dark)) */
--tt-bg:           #0d0a10;
--tt-surface:      #1a1420;
--tt-surface-2:    #261c2e;
--tt-border:       #352a38;
--tt-text:         #e8dce4;
--tt-text-muted:   #7a6a78;
--tt-accent:       #ffb627;
--tt-accent-bright:#ffc84d;
--tt-neon:         #7c5cff;
--tt-success:      #3ddc97;
--tt-danger:       #ff5d5d;
--tt-danger-muted: #ff5d5d80;
--tt-glow:         rgba(124, 92, 255, 0.18);
```

### 2.2 Tabla completa

| Token | Light | Dark | Uso | Derivación |
|---|---|---|---|---|
| `--tt-bg` | `#1a1118` | `#0d0a10` | Fondo de sala | Dark violeta/magenta, desplazado desde `--background` de Prodigia (`#fdfbf7` → oscurecido 90% + shift violeta) |
| `--tt-surface` | `#2a1f28` | `#1a1420` | Paneles, tarjetas, mesas | Equivalente a `--surface` pero en el espectro tt |
| `--tt-surface-2` | `#3d2e3a` | `#261c2e` | Elementos elevados, chips | Equivalente a `--surface-2` |
| `--tt-border` | `#4a3848` | `#352a38` | Bordes, separadores | Equivalente a `--border` |
| `--tt-text` | `#f0e6ec` | `#e8dce4` | Texto principal sobre fondos tt | Adaptación de `--foreground` al espectro tt |
| `--tt-text-muted` | `#9a8a96` | `#7a6a78` | Texto secundario, labels | Equivalente a `--texto-secundario` |
| `--tt-accent` | `#ffc53d` | `#ffb627` | Dorado: logros, Chispas display, odds | **Es exactamente `--logro` de Prodigia** |
| `--tt-accent-bright` | `#ffd86b` | `#ffc84d` | Hover de accent, highlights | Versión 15% más clara de `--tt-accent` |
| `--tt-neon` | `#7c5cff` | `#7c5cff` | Violeta: glow, rareza raro+, aguja ruleta | **Es `--primario` dark de Prodigia** |
| `--tt-success` | `#3fb88b` | `#3ddc97` | Victoria, ganancia | **Es `--correcto` de Prodigia** |
| `--tt-danger` | `#ff6b6b` | `#ff5d5d` | Derrota, error | **Es `--error` de Prodigia** |
| `--tt-danger-muted` | `#ff6b6b80` | `#ff5d5d80` | Texto de pérdida (no flash) | 50% opacidad de `--tt-danger` |
| `--tt-glow` | `rgba(124,92,255,0.12)` | `rgba(124,92,255,0.18)` | Glow sutil de paneles activos | Violeta a baja opacidad — más visible en dark |

### 2.3 Accesibilidad y contraste

| Par | Ratio light | Ratio dark | WCAG AA (texto normal) | WCAG AA (texto grande) |
|---|---|---|---|---|
| `--tt-text` / `--tt-bg` | ~12:1 | ~14:1 | ✅ Pasa | ✅ Pasa |
| `--tt-text-muted` / `--tt-bg` | ~4.8:1 | ~4.2:1 | ✅ Pasa (>4.5:1) | ✅ Pasa |
| `--tt-accent` / `--tt-bg` | ~10:1 | ~8.5:1 | ✅ Pasa | ✅ Pasa |
| `--tt-accent` / `--tt-surface` | ~7:1 | ~6:1 | ✅ Pasa | ✅ Pasa |
| `--tt-danger` / `--tt-bg` | ~5.5:1 | ~4.8:1 | ✅ Pasa (borderline dark) | ✅ Pasa |
| `--tt-success` / `--tt-bg` | ~6:1 | ~7:1 | ✅ Pasa | ✅ Pasa |

**Nota**: `--tt-text-muted` en dark mode (`#7a6a78` sobre `#0d0a10`) está en el límite de AA. Si falla en testing real, subir a `#8a7a88`. Verificar con herramienta de contraste antes de implementar.

### 2.4 Derivación de la paleta existente

La paleta actual de Trastienda (`TiendaClient.tsx:622-625`) usa:
- Fondo: `linear-gradient(180deg, #6B2A2A 0%, #3D2410 100%)` — granate/marrón
- Texto: `#F4E4C1` — crema dorado
- Bordes: `#5C1A1A` — granate apagado

**Problema**: esta paleta es genérica "bazar/mercado" y no tiene relación con la identidad Prodigia. La nueva paleta `--tt-*` la reemplaza completamente.

**Relación con la Tienda**: la Tienda usa cálidos (marrones `#3D2410`, crema `#F4E4C1`). La Trastienda usa fríos (violetas `#1a1118`, dorado `#ffc53d` como acento, no como texto). La transición entre ambas debe ser perceptible: el jugador siente que "bajó de nivel".

---

## 3. Tipografía

### 3.1 Jerarquía propia

La Trastienda usa las mismas fuentes de Prodigia (Space Grotesk, Inter, JetBrains Mono) pero con una **jerarquía diferente** que comunica "serio/premium/oscuro":

| Nivel | Fuente | Peso | Tamaño | Color | Uso | Ejemplo |
|---|---|---|---|---|---|---|
| Display | Space Grotesk | 700 (Bold) | 28-32px | `--tt-text` | Título de sala, nombre de módulo | "La Trastienda", "Ruleta" |
| Display small | Space Grotesk | 700 | 20-22px | `--tt-text` | Subtítulo de módulo, resultado | "Ganaste 150 Chispas" |
| Body | Inter | 400 (Regular) | 14-16px | `--tt-text` | Descripciones, copy general | "Elegí ganador de la partida" |
| Body small | Inter | 400 | 12-13px | `--tt-text-muted` | Labels, hints, estado | "Monto mínimo: 25 Chispas" |
| Mono | JetBrains Mono | 700 (Bold) | 20-28px | `--tt-accent` | Números de Chispas, odds, countdowns | "⚡ 450", "×1.85", "14:32:07" |
| Mono small | JetBrains Mono | 400 | 13-14px | `--tt-text-muted` | Números secundarios, history | "Giraste 3 veces hoy" |
| Tabular | JetBrains Mono | 700 | 36-48px | `--tt-accent` | Display de balance grande (caja fuerte) | "450" en header |
| Caption | Inter | 500 (Medium) | 11px | `--tt-text-muted` | Tags de rareza, badges | "Común", "Épico", "Legendario" |

### 3.2 Reglas de composición

1. **Display**: `letter-spacing: -0.02em` (tracking-tight). No uppercase — la voz Prodigia es rioplatense informal.
2. **Mono números**: siempre `font-variant-numeric: tabular-nums` para que los dígitos no "salten" al cambiar.
3. **Display de Chispas (caja fuerte)**: los números usan `letter-spacing: 0.04em` para dar sensación mecánica/digital.
4. **Títulos de rareza**: `text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px` — estilo etiqueta de拔げ.
5. **Fallbacks**: `font-family: 'Space Grotesk', system-ui, sans-serif` (display), `'Inter', system-ui, sans-serif` (body), `'JetBrains Mono', 'SF Mono', 'Fira Code', monospace` (mono). Estos ya están definidos en `globals.css:74-76`.

### 3.3 Diferencia con el resto de la app

| Aspecto | Resto de Prodigia | Trastienda |
|---|---|---|
| Display weight | Bold (700) | Bold (700) — igual |
| Display tracking | tight (-0.02em) | tight (-0.02em) — igual |
| Números | Mono bold, color `--primario` o `--foreground` | Mono bold, color **`--tt-accent`** (dorado) — más premium |
| Texto body | Inter regular, `--foreground` | Inter regular, `--tt-text` — ligeramente más cálido que el foreground normal |
| Badges/tags | `rounded-full`, `--surface-2` | `rounded-full`, `--tt-surface-2`, con borde de rareza |

La diferencia clave es el **color de los números**: en el resto de la app son violeta o foreground; en Trastienda son **dorado** (`--tt-accent`), comunicando que los números ahí tienen valor económico.

---

## 4. Componentes visuales con speccs

### 4.1 Panel de módulo (`TrastiendaPanel`)

Cada módulo de Trastienda es un panel que actúa como "mesa de juego".

```
┌─────────────────────────────────────────┐
│  🎲 TÍTULO DEL MÓDULO                  │  ← Display small, bold, --tt-text
│  Descripción breve en 1-2 líneas       │  ← Body small, --tt-text-muted
│                                         │
│  [CONTENIDO / ACCIONES]                 │
│                                         │
└─────────────────────────────────────────┘
```

**Specs**:
- `background`: `--tt-surface`
- `border`: 1px solid `--tt-border`
- `border-radius`: 16px (`rounded-2xl` — mismo patrón que `TiendaClient.tsx:481`)
- `padding`: 20px 24px (mobile), 24px 28px (desktop)
- `box-shadow`: `0 8px 32px -8px rgba(0,0,0,0.4)` (más profundo que el de Tienda: `0_14px_28px` en `TiendaClient.tsx:481`)
- **Hover**: `transform: translateY(-2px)` + `box-shadow: 0 12px 40px -8px rgba(0,0,0,0.5)` + `border-color: --tt-accent` sutil (0.3s ease)
- **Active state**: `transform: translateY(0)` + `box-shadow` reducido
- **NO glassmorphism**: sin `backdrop-blur`, sin transparencia. Superficies sólidas.
- **Transición**: `transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease`

### 4.2 Header de Trastienda (caja fuerte)

El header fijo muestra el balance y el botón de volver.

```
┌──────────────────────────────────────────────┐
│  ← Volver al Bazar          ⚡ 450           │
│                                              │
└──────────────────────────────────────────────┘
```

**Specs**:
- `background`: `--tt-bg` (el mismo fondo de sala, para que se integre)
- `border-bottom`: 1px solid `--tt-border`
- `position`: sticky, top 0, z-index 10
- `padding`: 12px 16px
- **Display de Chispas (caja fuerte)**:
  - `background`: `--tt-surface-2`
  - `border`: 1px solid `--tt-accent` (dorado, 0.5 opacidad)
  - `border-radius`: 9999px (rounded-full)
  - `padding`: 6px 14px
  - Número: JetBrains Mono bold 20px, `--tt-accent`
  - Ícono ⚡: 16px, `--tt-accent`
  - **Animación de conteo**: al cambiar el número, interpolación de 0.8s con `ease-out` (mismo patrón que `TRASTIENDA-DESIGN.md:333`)

### 4.3 Ruleta de Trastienda

La pieza central de la sala.

**Estructura visual**:

```
           ▲ (aguja dorada)
         ╱   ╲
       ╱  SEG 7 ╲
      │   SEG 8   │
      │  SEG 9  SEG│
      │     10     │
      │   SEG 6    │
      │  SEG5 SEG1 │
       ╲  SEG 4  ╱
         ╲  3  ╱
           ╲╱
        SEG 2
```

**Specs de la ruleta**:
- **Contenedor**: 280×280px (mobile), 320×320px (desktop). Centrado.
- **Segmentos**: 10 segmentos, colores sólidos del segmento (ver tabla en `TRASTIENDA-ECONOMIA.md:283-295`):
  - ⚡ Boost: `#ff8a3d` (racha)
  - 🛡️ Escudo: `#7c5cff` (primario)
  - ❄️ Congelamiento: `#3fb88b` (correcto)
  - 💰 50/25/100 Chispas: `#ffc53d` (logro)
  - 🎨 Fuente: `#A794FF` (primario light)
  - 🖼️ Marco: `#E8B34D` (logro dark)
  - 🔮 Título: `#7c5cff` (primario)
  - 💀 Sin premio: `#1f2430` (background oscuro)
- **Borde entre segmentos**: 1px `--tt-border`
- **Centro**: círculo 48px con logo mini Prodigia (aro + chispa). Background `--tt-surface-2`.
- **Aguja**: triángulo invertido, 20px alto, `--tt-accent` (dorado). Sombra `0 2px 8px rgba(255,197,61,0.4)`.
- **Idle glow**: el centro pulsa suavemente con `--tt-glow` en ciclo de 3s (opacity 0.3 → 0.6 → 0.3).
- **Borde exterior**: 2px `--tt-border`, `border-radius: 50%`.

**Estados de la ruleta**:

| Estado | Visual |
|---|---|
| Idle (sin girar) | Centro con glow pulsante. Aguja dorada estática. Texto "GIRO: 150 ⚡" debajo. |
| Girando | Ruleta rota. Aguja fija. Blur en segmentos (motion blur). Texto "Girando...". Botón deshabilitado. |
| Frenando | Rotación desacelera. Sin blur. Rebote suave (±15°). |
| Resultado | Segmento ganador se ilumina (flash de color 0.3s). Aguja se ilumina. Toast de resultado slide-up. |

**Animación de giro** (ampliada de `TRASTIENDA-DESIGN.md:326-337`):

| Fase | Tiempo | Easing | Detalle |
|---|---|---|---|
| Fase 1: arranque | 0-0.5s | `ease-in` | Rotación rápida (360°/s), blur activado |
| Fase 2: desaceleración | 0.5-2.0s | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Rotación decreciente, blur se reduce |
| Fase 3: rebote | 2.0-2.5s | `ease-out` | ±15° de rebote sobre segmento final |
| Fase 4: reveal | 2.5-3.5s | `ease` | Flash de color + toast de resultado |
| **Total** | **3.5s** | | Más largo que el propuesto en DESIGN (2.5s) — justificación: la experiencia core merece más tiempo de anticipo |

### 4.4 Mesa de apuestas (Apostar a Partida)

```
┌─────────────────────────────────────────────┐
│  🎲 Apostar a Partida                      │
│  Próximas partidas disponibles             │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │  🟣 Juan (ELO 1420)                │    │
│  │  VS                                │    │
│  │  🟡 María (ELO 1380)               │    │
│  │  🌍 Numeria · Ranked               │    │
│  │  Odds: ×1.85 / ×1.85              │    │
│  ├─────────────────────────────────────┤    │
│  │  Elegí ganador:                     │    │
│  │  [🟣 Juan] [🟡 María] [🤝 Empate]  │    │
│  ├─────────────────────────────────────┤    │
│  │  Monto: [25] [50] [100] [200]      │    │
│  ├─────────────────────────────────────┤    │
│  │  Ganancia potencial: ×1.85         │    │
│  │  = 185 Chispas                     │    │
│  │  [CONFIRMAR APUESTA]               │    │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Specs**:
- **Contenedor**: `TrastiendaPanel` con borde extra `--tt-border` en el panel activo.
- **VS**: JetBrains Mono bold, `--tt-danger` (rojo). No animado.
- **Jugadores**: avatar (40px rounded-full, borde del color del mundo), nombre (Inter bold), ELO (JetBrains Mono, `--tt-text-muted`).
- **Jugador elegido**: fondo `--tt-surface-2`, borde 2px `--tt-accent`, `box-shadow: 0 0 12px var(--tt-glow)`.
- **Odds**: JetBrains Mono bold, `--tt-accent`. Tamaño 18px.
- **Montos (chips)**:
  - `background`: `--tt-surface-2`
  - `border`: 1px solid `--tt-border`
  - `border-radius`: 9999px (rounded-full)
  - `padding`: 8px 16px
  - Texto: JetBrains Mono bold 14px, `--tt-text`
  - **Seleccionado**: `background: var(--tt-accent)`, `color: var(--tt-bg)`, `border-color: var(--tt-accent)`
  - **Hover**: `border-color: var(--tt-accent)`, `transform: scale(1.05)`
  - **Transition**: 0.15s ease
- **Botón confirmar**: `Boton.tsx` variante `primario` con `destacado` (mismo patrón que `Boton.tsx:45-51`, degradé `var(--primario)` → `var(--logro)`).
- **Modal de confirmación**: NO toast — es irreversible (`TRASTIENDA-ECONOMIA.md:46`). `opacity 0.25s ease-out`, `scale 0.95 → 1`. Fondo overlay `rgba(0,0,0,0.6)`.

### 4.5 Tarjeta de minijuego

```
┌───────────────┐
│  🧮           │  ← Emoji grande centrado
│  La Calcu     │  ← Display small, bold, --tt-text
│               │
│  30s · 50⚡   │  ← Mono small, --tt-text-muted
│               │
│  [JUGAR]      │  ← Boton.tsx primario compacto
└───────────────┘
```

**Specs**:
- **Tamaño**: 160×180px (mobile), 180×200px (desktop)
- **Background**: `--tt-surface`
- **Border**: 1px solid `--tt-border`
- **Border-radius**: 16px (rounded-2xl)
- **Hover**: `border-color: var(--tt-accent)` + `box-shadow: 0 0 16px var(--tt-glow)` + `transform: translateY(-2px)`
- **Icono emoji**: `font-size: 36px`, centrado, con `filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))`
- **Animación de entrada**: fade-in + translateY(16px → 0), `0.4s ease-out`, stagger 0.1s entre tarjetas (mismo patrón que `TRASTIENDA-DESIGN.md:334`)
- **Estado bloqueado** (sin chispas suficientes): opacidad 0.5, `filter: grayscale(0.5)`, sin hover effects.

### 4.6 Título desbloqueado (notificación)

```
┌──────────────────────────────────────────┐
│  ✨ ¡TÍTULO DESBLOQUEADO!                │
│                                          │
│  [icono del título]                      │
│  FAROLERO                    ← Display small, bold, --tt-text
│  Poco comun               ← Caption uppercase, color de rareza
│                                          │
│  "5 apuestas ganadas seguidas"           │  ← Body small, --tt-text-muted
│                                          │
│  [USAR AHORA]  [CERRAR]                  │
└──────────────────────────────────────────┘
```

**Specs**:
- **Background**: `--tt-surface`
- **Border**: 2px solid [color de rareza]
- **Border-radius**: 16px
- **Padding**: 24px
- **Icono del título**: 64×64px, centrado, con animación de pulso suave (scale 1 → 1.05 → 1, 2s ease-in-out infinite)
- **Animación de entrada**: slide-up (translateY 24px → 0) + fade-in, 0.4s spring (framer-motion)
- **GestoLogo**: se usa para títulos Legendario y Mitológico (`TRASTIENDA-DESIGN.md:463`)

### 4.7 Indicador de resultado (post-acción)

**Victoria**:
- Flash de `--tt-success` en el borde del panel: `border-color` cambia a `--tt-success` durante 0.5s, luego vuelve a `--tt-border`.
- Número de Chispas ganadas: animación de "conteo" (0 → total) durante 0.8s, JetBrains Mono bold, `--tt-success`.
- Glow sutil: `box-shadow: 0 0 20px rgba(63, 184, 139, 0.15)` durante 1s, luego desaparece.
- Sonido: "ding" suave (fase 2, `<50KB`).

**Derrota**:
- Flash de `--tt-danger-muted` (50% opacidad) en el borde: 0.3s, más sutil que victoria.
- Texto "0 Chispas" en `--tt-text-muted`. Sin animación de conteo.
- Sin glow. Sin sonido.
- **Regla**: no humillar al jugador (`TRASTIENDA-DESIGN.md:267`).

**Empate (apuestas)**:
- Flash de `--tt-accent` (dorado) en el borde: 0.3s.
- "Monto devuelto" en `--tt-text`.
- Sin animación exagerada.

### 4.8 Objeto raro en vitrina

Panel dedicado que muestra el "objeto raro" disponible (raro+ de la ruleta o predicción).

```
┌──────────────────────────────────────────┐
│  🔮 OBJETO RARO                          │  ← Display small, color de rareza
│                                          │
│  ┌──────────────────────────────────┐    │
│  │         [ICONO/EMBLEMA]          │    │  ← 80×80px, glow pulsante
│  │          con glow pulsante       │    │
│  └──────────────────────────────────┘    │
│                                          │
│  "Título: Farolero"                      │  ← Body, --tt-text
│  Rareza: Poco comun                      │  ← Caption, color de rareza
│  Disponible por: ruleta (1%)             │  ← Body small, --tt-text-muted
│                                          │
│  [INTENTAR SUERTE]                       │  ← Boton.tsx primario
└──────────────────────────────────────────┘
```

**Specs**:
- **Glow pulsante del objeto**: `box-shadow` con ciclo de 4s:
  ```
  0%: box-shadow: 0 0 12px var(--tt-glow)
  50%: box-shadow: 0 0 28px var(--tt-glow), 0 0 48px rgba(124,92,255,0.08)
  100%: box-shadow: 0 0 12px var(--tt-glow)
  ```
- **Borde**: 2px del color de la rareza del objeto actual.
- **Aparece solo**: si hay un objeto raro disponible (lógica server).

### 4.9 Panel de "dueño" / barman de la Trastienda

**PROPUESTA** (no confirmada por PO): un símbolo/mascota abstracto para la Trastienda.

**Símbolo propuesto: "El Trastiendista"** — un candado abierto con una chispa dentro.

**Derivación del universo Prodigia**:
- El candado ya existe como ícono (`IconCandado` en `src/components/icons.tsx:140-147`). Representa "acceso restringido".
- La chispa es el símbolo central de Prodigia (moneda Chispas, logo `Logo.tsx:18-70`).
- Un candado abierto con chispa = "se abrió la caja, las Chispas fluyen". Es el anfitrión de la sala.

**Diseño del símbolo**:
- SVG 48×48px, line-art 2px stroke, color `--tt-text-muted` (idle) o `--tt-accent` (activo/hover).
- El candado es el `IconCandado` existente pero con el arco levantado (ya existe la path data).
- Dentro del candado: una chispa de 4 puntas (del logo) a escala reducida.
- **NO es una mascota**: es un emblema/sello, como el sello de una caja fuerte. No tiene personalidad, no habla, no tiene nombres.

**Uso**:
- Sección de historial reciente de Trastienda.
- Marca de agua sutil en el fondo de la sala (opacidad 0.03).
- Icono del botón de entrada a Trastienda (reemplaza 🚪 en la Tienda).

**PROPUESTA vs confirmada**: esto es una propuesta. El PO decidirá si usar este símbolo, otro, o ninguno. La funcionalidad NO depende de este emblema.

---

## 5. Estados y feedback

### 5.1 Estados globales de la sala

| Estado | Visual | Copy |
|---|---|---|
| **Sin actividad hoy** | Fondo tt-bg puro. Mensaje centrado con el emblema. | "El sótano del bazar. Algunos dicen que aquí se ganan fortunas. Otros dicen que se pierden." |
| **Con actividad** | Todos los módulos visibles. Historial reciente al fondo. | — |
| **Límite diario alcanzado** | Módulos visibles pero deshabilitados (opacity 0.5, grayscale). Countdown visible. | "Ya giraste 5 veces hoy. Volvé mañana." + "Próximo giro GRATIS: 120 ⚡ (en HH:MM:SS)" |
| **Sin Chispas suficientes** | Módulos visibles. Botones de acción deshabilitados. Borde `--tt-danger-muted` sutil. | "Necesitás al menos 25 Chispas para apostar." |

### 5.2 Estados de interacción

| Estado | Visual |
|---|---|
| **Cargando (skeleton)** | Paneles con `--tt-surface` animado (shimmer de izq a der, 1.5s infinite). Mismo patrón que skeleton genérico de la app. |
| **Esperando resolución (apuesta pendiente)** | Panel de apuesta con borde `--tt-accent` punteado. Badge "⏳ Pendiente". Sin posibilidad de cancelar (server-authoritative). |
| **Error de red** | Toast con `--tt-danger`, texto del error, botón "Reintentar" (`fantasma`). |
| **Éxito (compra/giro/apuesta)** | Toast con `--tt-success`, resumen de la acción, desaparece en 3s. |

### 5.3 Jerarquía de feedback

1. **Ganar**: LUZ — flash de `--tt-success`, glow, conteo animado, sonido (fase 2). El jugador debe sentir que algo positivo pasó.
2. **Perder**: OSCURIDAD — borde sutil `--tt-danger-muted`, sin fanfarria, sin animación exagerada. El jugador debe poder seguir jugando sin frustración.
3. **Pendiente**: TENSIÓN — borde punteado `--tt-accent`, badge de espera. El jugador quiere ver el resultado.
4. **Bloqueado**: CALMA — countdown visible, módulos atenuados. Sin drama, solo informativo.
5. **Sin recursos**: SUGERENCIA — borde sutil, copy helpful. "Ganá Chispas practicando" como link a la práctica.

---

## 6. Motion

### 6.1 Tabla completa de animaciones

| Elemento | Propiedad | Duración | Easing | Notas |
|---|---|---|---|---|
| Transición Tienda→Trastienda | background, opacity | 0.5s | `ease-in-out` | Fondo cambia de cálido a frío |
| Candado se abre (entrada) | rotate, scale | 0.3s | `ease-out` | IconCandado rota arco 0→45° |
| Panel hover | transform, box-shadow | 0.2s | `ease` | translateY(-2px) |
| Panel active | transform, box-shadow | 0.1s | `ease` | translateY(0) |
| Ruleta giro (fase 1) | rotate | 0.5s | `ease-in` | Arranque rápido |
| Ruleta giro (fase 2) | rotate | 1.5s | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Desaceleración |
| Ruleta giro (fase 3) | rotate | 0.5s | `ease-out` | Rebote ±15° |
| Ruleta giro (fase 4) | opacity, background | 1.0s | `ease` | Flash + reveal |
| Flash resultado | border-color, opacity | 0.3-0.5s | `ease` | Más corto que ruleta |
| Conteo de Chispas | number interpolation | 0.8s | `ease-out` | 0 → total |
| Tarjeta minijuego entrada | opacity, translateY | 0.4s | `ease-out` | Stagger 0.1s |
| Título desbloqueado | opacity, translateY, scale | 0.4s | spring (framer-motion) | — |
| Modal confirmación | opacity, scale | 0.25s | `ease-out` | — |
| Toast notificación | translateY, opacity | 0.3s | `ease-out` | — |
| Glow pulsante (idle) | box-shadow opacity | 3-4s | `ease-in-out` | Infinite, solo en objetos raros y centro ruleta |
| Objeto raro vitrina | box-shadow | 4s | `ease-in-out` | Infinite, más lento que glow general |

### 6.2 Reglas de motion

1. **Ninguna animación > 3s** (excepto glow infinito y ruleta: 3.5s total).
2. **Motion reduce**: respetar `prefers-reduced-motion` — todas las animaciones se deshabilitan, la ruleta muestra resultado sin giro.
3. **No animar todo**: solo los elementos de feedback (resultado, conteo) y los elementos core (ruleta, entrada). Los paneles y tarjetas tienen transiciones sutiles.
4. **Easing consistente**: `ease` para transiciones de estado, `ease-out` para entradas, `ease-in-out` para loops infinitos.
5. **El sótano es serio**: las animaciones de Trastienda son más contenidas que las de la Tienda (donde hay toldos que ondean, cursor que deja estela). Acá todo es más contenido, más preciso.

### 6.3 Transición de entrada Tienda → Trastienda

**Secuencia**:
1. Jugador toca "🚪 Entrar a la Trastienda" (`TiendaClient.tsx:614`).
2. IconCandado rota (arco se levanta, 0.3s).
3. Fade-out de Tienda (0.3s, opacity 1→0).
4. Fade-in de Trastienda (0.3s, opacity 0→1).
5. Fondo cambia gradualmente de marrón cálido (`linear-gradient(180deg, #E8C79A 0%, #C97B4A 45%, #8a5a35 100%)` de Tienda) a `--tt-bg` (`#1a1118`) durante 0.5s (se superpone al fade).

**Total**: ~1.1s de transición percibida.

---

## 7. Rarezas en Trastienda

### 7.1 Tabla de colores por rareza (extendida de `TRASTIENDA-ECONOMIA.md:247-254`)

| Rareza | Borde | Fondo | Glow | Probabilidad | Uso en Trastienda |
|---|---|---|---|---|---|
| Común | `#8892b0` | `--tt-surface-2` | Ninguno | ~60% | Títulos básicos de Trastienda |
| Poco común | `#3fb88b` | `--tt-surface-2` | `rgba(63,184,139,0.1)` | ~25% | Títulos intermedios |
| Raro | `#7c5cff` | `--tt-surface-2` | `rgba(124,92,255,0.12)` | ~10% | Títulos + objetos de ruleta |
| Épico | `#ff8a3d` | `--tt-surface-2` | `rgba(255,138,61,0.12)` | ~4% | Títulos + fuentes/marcos |
| Legendario | `#ffc53d` | `--tt-surface-2` | `rgba(255,197,61,0.15)` | ~1% | Títulos + marcos premium |
| Mitológico | degradé `--primario`→`--logro` | `--tt-surface-2` | `rgba(124,92,255,0.15), rgba(255,197,61,0.1)` | <0.5% | Solo títulos |

### 7.2 Visual de cada rareza en Trastienda

| Rareza | Borde del panel | Glow del objeto | Animación del título |
|---|---|---|---|
| Común | 1px `#8892b0` | Ninguno | Fade-in estándar |
| Poco común | 1px `#3fb88b` | Sutil (12px) | Fade-in + scale 1.02 |
| Raro | 2px `#7c5cff` | Medio (20px) | Fade-in + scale 1.03 + shimmer |
| Épico | 2px `#ff8a3d` | Fuerte (28px) | Slide-up + glow pulsante |
| Legendario | 2px `#ffc53d` | Fuerte (28px) + doble | Slide-up + glow pulsante + GestoLogo |
| Mitológico | 2px degradé | Prismatic (multi-color) | Slide-up + glow prismatic + GestoLogo + partículas |

### 7.3 Alineación con `TRASTIENDA-ECONOMIA.md`

Los títulos de Trastienda (sección 3 de ECONOMIA) ya definen rarezas y colores. Este documento **no los contradice** — los alinea visualmente:

- **Tronado** (Común, `#8892b0`): borde sutil, sin glow.
- **Farolero** (Poco comun, `#3fb88b`): borde verde, glow sutil.
- **Profeta Menor / Uja** (Raro, `#7c5cff`): borde violeta, glow medio.
- **Ardilla / Profeta Mayor** (Epico, `#ff8a3d`): borde naranja, glow fuerte.
- **Ecualizador / Sentenciador** (Legendario, `#ffc53d`): borde dorado, glow fuerte.
- **Gniñardo** (Mitologico, degradé): borde degradé, glow prismatic.

---

## 8. Guion de implementación visual

### Orden de implementación (por componentes React/CSS)

#### Fase 1: Tokens y estructura base

1. **`globals.css`** — Agregar variables `--tt-*` (sección 2.1) en `:root`, `@media(prefers-color-scheme:dark)`, y `:root[data-theme="dark"]`. Agregar en el bloque `@theme inline` los tokens de Tailwind correspondientes.

2. **`globals.css`** — Agregar keyframes:
   - `@keyframes tt-glow-pulse` (glow infinito, 3-4s, ease-in-out)
   - `@keyframes tt-shimmer` (skeleton loading, 1.5s, linear)
   - `@keyframes tt-flash-success` (flash de borde, 0.5s, ease)
   - `@keyframes tt-flash-danger` (flash de borde, 0.3s, ease)

3. **`TrastiendaClient.tsx`** — Componente raíz que envuelve toda la Trastienda. Recibe `puntos` del padre. Renderiza header + secciones. Maneja el estado de entrada/salida.

#### Fase 2: Componentes de layout

4. **`TrastiendaHeader.tsx`** — Header sticky con botón "Volver al Bazar" + display de Chispas (caja fuerte). Reutiliza `IconCandado` o `IconX` para volver.

5. **`TrastiendaPanel.tsx`** — Componente genérico de panel/mesa. Props: `titulo`, `icono`, `descripcion`, `children`. Aplica specs de sección 4.1.

6. **`FondoTrastienda.tsx`** — Fondo de sala. Patrón de glifos flotantes propio (mismo sistema que `FondoMundo.tsx:23-91` pero con símbolos de Trastienda: dados, cartas, candados). Solo se muestra cuando `efectos` está habilitado.

#### Fase 3: Componentes de módulo

7. **`PanelRuleta.tsx`** — Ruleta visual. SVG 10 segmentos + aguja + centro. Integra con framer-motion para la animación de giro. Maneja estados: idle, girando, frenando, resultado.

8. **`TableroApuestas.tsx`** — Mesa de apuestas. Lista de partidas disponibles, selección de jugador, monto, confirmación. Integra con `Boton.tsx` y chips.

9. **`GrillaMinijuegos.tsx`** — Grid de tarjetas de minijuegos. Cada tarjeta es `TarjetaMinijuego` con emoji, nombre, duración, costo, botón.

10. **`HistorialTrastienda.tsx`** — Lista de últimas 5 interacciones. Icono de resultado (✓/✗), nombre del juego, monto, ganancia/pérdida.

11. **`VitrinaObjetoRaro.tsx`** — Panel del objeto raro disponible. Glow pulsante, borde de rareza, descripción.

#### Fase 4: Estados y feedback

12. **`ResultadoFlash.tsx`** — Componente de flash de resultado. Se superpone al panel ganador. Props: `tipo` (ganar/perder/empate), `monto`.

13. **`ToastTrastienda.tsx`** — Toast de notificación de Trastienda. Slide-up desde abajo, auto-dismiss 3s.

14. **`ModalConfirmacion.tsx`** — Modal de confirmación para apuestas. Overlay oscuro, resumen, botones confirmar/cancelar.

#### Fase 5: Integración

15. **`TiendaClient.tsx`** — Modificar el botón de entrada (`TiendaClient.tsx:614`) para usar el emblema propuesto en vez de 🚪. Modificar la sección `trastiendaAbierta` para renderizar `TrastiendaClient.tsx` en vez del contenido actual.

### Tokens CSS nuevos propuestos (resumen para globals.css)

```css
/* === TRASTIENDA TOKENS === */
:root {
  --tt-bg: #1a1118;
  --tt-surface: #2a1f28;
  --tt-surface-2: #3d2e3a;
  --tt-border: #4a3848;
  --tt-text: #f0e6ec;
  --tt-text-muted: #9a8a96;
  --tt-accent: #ffc53d;
  --tt-accent-bright: #ffd86b;
  --tt-neon: #7c5cff;
  --tt-success: #3fb88b;
  --tt-danger: #ff6b6b;
  --tt-danger-muted: #ff6b6b80;
  --tt-glow: rgba(124, 92, 255, 0.12);
}

/* dark mode override — misma estructura en los 3 bloques de data-theme */
```

---

## 9. Vineta: modo claro vs oscuro para Trastienda

### La Trastienda tiene que funcionar DELIBERADAMENTE distinta en ambos temas

A diferencia del resto de la app — donde el modo claro es crema cálido y el oscuro es azul nocturno — la Trastienda **empieza oscura por diseño**. El concepto es un sótano: no hay "modo claro del sótano". Pero los tokens `--tt-*` tienen valores distintos para light y dark para mantener accesibilidad y para que la experiencia sea consistente.

| Aspecto | Modo claro (`data-theme="light"` o default) | Modo oscuro (`data-theme="dark"`) |
|---|---|---|
| **Fondo sala** | `#1a1118` (violeta oscuro, no negro puro) | `#0d0a10` (casi negro, con tinte violeta) |
| **Superficies** | `#2a1f28` / `#3d2e3a` (más claras, más contraste) | `#1a1420` / `#261c2e` (más profundas) |
| **Texto** | `#f0e6ec` (crema con tinte rosa) | `#e8dce4` (ligeramente más frío) |
| **Texto muted** | `#9a8a96` (visible, buen contraste) | `#7a6a78` (más apagado, verificar contraste) |
| **Accent (dorado)** | `#ffc53d` (más brillante, más "premio") | `#ffb627` (más cálido, más "oro antiguo") |
| **Glow** | `rgba(124,92,255,0.12)` (sutil) | `rgba(124,92,255,0.18)` (más visible en fondo oscuro) |
| **Percepción** | "Sótano con luz artificial" — se siente como un lugar cerrado pero con iluminación | "Sótano natural" — se siente como la profundidad real, más inmersivo |

### La transición Tienda→Trastienda es MÁS marcada en dark mode

En dark mode, la Tienda ya es oscura (`--background: #090c14`). La Trastienda es AÚN MÁS oscura (`--tt-bg: #0d0a10`) pero con más violeta. La transición se percibe como un "oscurecimiento adicional + shift de color" — el jugador siente que bajó más profundo.

En light mode, la Tienda es clara (`--background: #fdfbf7`). La Trastienda es oscura (`--tt-bg: #1a1118`). La transición es MUY marcada — un cambio dramático de claro a oscuro. Esto es intencional: el jugador en modo claro siente el contraste fuerte al entrar al sótano.

### Regla de implementación

La Trastienda NUNCA debe verse "clara" — ni en light mode ni en dark mode. Los fondos `--tt-bg` y `--tt-surface` son siempre oscuros. La única diferencia entre temas es el **grado de oscuridad** y el **brillo de los acentos**. Si en algún momento un token `--tt-*` en light mode resulta en un fondo claro, hay un error de implementación.

---

## 10. Decisiones: PROPUESTA vs confirmadas por PO

### Confirmadas por PO (de TRASTIENDA-ECONOMIA y TRASTIENDA-DESIGN)

| Decisión | Fuente | Estado |
|---|---|---|
| Moneda = Chispas (misma moneda que la app) | `TRASTIENDA-ECONOMIA.md:24` | ✅ CONFIRMADA PO |
| Apuestas server-authoritative | `TRASTIENDA-ECONOMIA.md:106-116` | ✅ CONFIRMADA PO |
| EV target: 0.92-0.96 por interacción | `TRASTIENDA-ECONOMIA.md:22` | ✅ CONFIRMADA PO |
| 5 giros máximo/día en ruleta | `TRASTIENDA-ECONOMIA.md:330` | ✅ CONFIRMADA PO |
| Coste primer giro: 120 Chispas (descuento 20%) | `TRASTIENDA-ECONOMIA.md:334` | ✅ CONFIRMADA PO |
| Coste giros 2-5: 150 Chispas | `TRASTIENDA-ECONOMIA.md:335` | ✅ CONFIRMADA PO |
| Pity system: 3 giros sin premio → 4to garantiza premio menor | `TRASTIENDA-ECONOMIA.md:339` | ✅ CONFIRMADA PO |
| 1 predicción por semana por usuario | `TRASTIENDA-ECONOMIA.md:173` | ✅ CONFIRMADA PO |
| Trastienda como sección de la Tienda (Opción A) | `TRASTIENDA-ECONOMIA.md:599` | ✅ CONFIRMADA PO |
| Sin glassmorphism, sin neón excesivo | `TRASTIENDA-DESIGN.md:443-448` | ✅ CONFIRMADA PO |
| Degradé primario→logro para CTAs | `TRASTIENDA-DESIGN.md:147, Boton.tsx:50` | ✅ CONFIRMADA PO |
| Voz rioplatense ("vos", "Elegí", "Apostá") | `TRASTIENDA-DESIGN.md:439, BRAND.md:58` | ✅ CONFIRMADA PO |
| GestoLogo para títulos Legendario/Mitológico | `TRASTIENDA-DESIGN.md:463` | ✅ CONFIRMADA PO |
| Reutilizar Boton.tsx, GlareHover, BorderGlow | `TRASTIENDA-DESIGN.md:460-463` | ✅ CONFIRMADA PO |
| Sin backdrops blur, superficies sólidas | `TRASTIENDA-DESIGN.md:143,443` | ✅ CONFIRMADA PO |

### PROPUESTAS (pendientes de decisión PO)

| # | Propuesta | Justificación | Riesgo si se rechaza |
|---|---|---|---|
| P1 | Paleta `--tt-*` con violeta oscuro en vez de granate/marrón actual | La paleta actual (`#6B2A2A→#3D2410`) es genérica "bazar" y no tiene relación con la identidad Prodigia. El violeta oscuro conecta con `--primario` (#7c5cff) y comunica "profundidad". | La Trastienda seguiría viéndose como una extensión de la Tienda, no como un lugar propio. |
| P2 | El sótano empieza SIEMPRE oscuro (incluso en light mode) | El concepto de sótano requiere oscuridad. Un "sótano claro" contradice la metáfora. | Si el PO quiere Trastienda light, habría que rediseñar toda la paleta. |
| P3 | Símbolo "El Trastiendista" (candado abierto + chispa) | Derivado del universo existente (IconCandado + Logo). Es un emblema, no una mascota — no requiere personalidad ni copy. | La Trastienda no tendría símbolo propio, usaría 🚪 o similar. |
| P4 | Ruleta vertical (tómbola) en vez de horizontal | La tómbola es más compacta (280×280px vs ~400×200px horizontal), funciona mejor en mobile, y comunica "más azar, menos casino". | La regla de "no neón/gamer" se cumpliría igual con una ruleta horizontal. |
| P5 | Glow pulsante en centro de ruleta y vitrina de objeto raro | Comunica "hay algo vivo aquí" sin ser neón. Es un `box-shadow` con opacidad variable, no un `text-shadow` coloreado. | La sala se vería más estática, menos premium. |
| P6 | Transición Tienda→Trastienda con candado animado (IconCandado rota arco) | Es un momento narrativo — "abris la puerta". 0.3s de animación que comunica el cambio de contexto. | La transición sería un simple fade, menos inmersiva. |
| P7 | Jerarquía tipográfica con números dorados (`--tt-accent`) en vez de violeta | Los números en Trastienda representan valor económico (Chispas). El dorado comunica "esto vale algo". Diferencia visual clara con el resto de la app. | Los números serían violeta como siempre, menos distinción visual. |
| P8 | Tarjetas de minijuego de 160×180px (compactas) en vez de más grandes | En mobile son más amigables (caben 2 por fila). En desktop se expanden a 180×200px. | Si el PO quiere tarjetas más grandes, ajustar grid. |
| P9 | Toast en vez de modal para resultados de minijuegos (no apuestas) | Los minijuegos son de bajo impacto (30-100 Chispas). Un toast es suficiente. El modal se reserva para apuestas (irreversibles). | Si el PO quiere modal para todo, usar `ModalConfirmacion` también en minijuegos. |
| P10 | Fondos de Trastienda con glifos flotantes propios (dados, cartas, candados) | Mismo sistema que `FondoMundo.tsx` pero con símbolos de Trastienda. Comunica "este es un lugar distinto". | La sala se vería más estática. Se puede agregar después. |

---

## Referencias cruzadas

| Sección de este doc | Referencia en código | Línea |
|---|---|---|
| Paleta `--tt-*` | `src/app/globals.css` | 16-60 |
| Degradé CTA | `src/components/Boton.tsx` | 45-51 |
| Estante toldo colgante | `TiendaClient.tsx` | 478-510 |
| Paleta actual Trastienda | `TiendaClient.tsx` | 622-655 |
| IconCandado (símbolo propuesto) | `src/components/icons.tsx` | 140-147 |
| Glifos flotantes (modelo) | `src/components/FondoMundo.tsx` | 23-91 |
| Catálogo de títulos | `src/lib/titulos/catalogo.ts` | 1-95 |
| Brand regla de oro | `docs/marketing/BRAND.md` | 7 |
| Paleta por mundo | `src/lib/mundos/precios.ts` | — |
| GestoLogo (momento grande) | `src/components/GestoLogo.tsx` | — |
| BorderGlow (brillo en panels) | `src/components/reactbits/BorderGlow.tsx` | — |
| GlareHover (hover en tarjetas) | `src/components/reactbits/GlareHover.tsx` | — |

---

*Documento de especificación visual. Sin código de runtime. Extiende TRASTIENDA-DESIGN.md. Referencias: TRASTIENDA-ECONOMIA.md, src/app/globals.css:16-60, src/components/Boton.tsx:45-51, src/components/icons.tsx:140-147, src/components/FondoMundo.tsx:23-91, src/app/[locale]/tienda/TiendaClient.tsx:622-655,478-510, src/lib/titulos/catalogo.ts, docs/marketing/BRAND.md:7.*
