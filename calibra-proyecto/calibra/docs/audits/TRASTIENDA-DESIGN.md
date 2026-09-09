# TRASTIENDA — Diseño Visual

> Documento de diseño visual (sin código). Estado: PENDIENTE DE IMPLEMENTACIÓN.
> Creado: 2026-09-08. Referencias citadas contra código real.

---

## 0. Identidad de referencia (extraída del código)

| Elemento | Fuente | Línea |
|---|---|---|
| Variables de color (light/dark) | `src/app/globals.css` | 16-60 |
| Paleta por mundo (8 mundos) | `src/lib/mundos/precios.ts` | — |
| Degradé primario: violeta→dorado | `src/components/Boton.tsx` | 50 |
| Gradiente de la Tienda actual | `src/app/[locale]/tienda/TiendaClient.tsx` | 218 |
| Fondo bazar (radial-gradient) | `TiendaClient.tsx` | 218 |
| Estantes con toldo colgante | `TiendaClient.tsx` | 478-510 |
| Colores de Trastienda actual | `TiendaClient.tsx` | 622-655 |
| Logo: aro violeta + chispa asimétrica degradé | `Logo.tsx` | 18-70 |
| Font display: Space Grotesk | `globals.css:74` | — |
| Font mono: JetBrains Mono | `globals.css:76` | — |
| Font body: Inter | `globals.css:75` | — |
| Brand: "SI no parece Prodigia, no es Prodigia" | `docs/marketing/BRAND.md:7` | — |
| Gradiente 120° violeta→dorado como CTA | `Boton.tsx:50` | — |
| Fondos con glifos flotantes por mundo | `FondoMundo.tsx:23-91` | — |
| Píldoras rounded-full, tarjetas rounded-2xl | `SprintRunner.tsx:546` | — |

### Paleta de la Trastienda actual (ya existente)

La sección Trastienda en `TiendaClient.tsx` usa:
- Fondo: `linear-gradient(180deg, #6B2A2A 0%, #3D2410 100%)` — granate oscuro a marrón.
- Texto: `#F4E4C1` (crema dorado sobre fondo oscuro).
- Acento error/advertencia: `#FF9B9B`.
- Bordes: `#5C1A1A` (granate apagado).

**Esta paleta NO pertenece a la identidad Prodigia** — es una paleta "bazar/mercado" que se creó para la Tienda. La Trastienda debe diferenciarse visualmente de la Tienda pero mantener coherencia con la marca Prodigia.

---

## 1. Concepto visual de la sala

### La metáfora: "El sótano del Bazar"

La Tienda es un bazar luminoso, cálido, con toldos a rayas y estantes de madera. La Trastienda es **el sótano** — se llega bajando escaleras, la luz cambia, el ambiente es más íntimo, más peligroso. No es un casino genérico: es un lugar dentro del universo Prodigia donde las reglas son un poco más flexibles.

**Elementos narrativos**:
- La puerta de entrada: una puerta de madera vieja con candado (icono existente 🚪).
- Iluminación: focos puntuales, no luz uniforme. Sombras largas.
- Materialidad: madera oscura, metal oxidado, piedra. NO cristal, NO neón.
- Color dominante: **profundidades** — los colores de Prodigia pero oscurecidos y saturados.

### Paleta de la Trastienda (diseñada)

| Token | Valor light | Valor dark | Uso |
|---|---|---|---|
| `--tt-bg` | `#1a1118` | `#0d0a10` | Fondo de sala |
| `--tt-surface` | `#2a1f28` | `#1a1420` | Paneles, tarjetas |
| `--tt-surface-2` | `#3d2e3a` | `#261c2e` | Elementos elevados |
| `--tt-border` | `#4a3848` | `#352a38` | Bordes, separadores |
| `--tt-text` | `#f0e6ec` | `#e8dce4` | Texto principal |
| `--tt-text-muted` | `#9a8a96` | `#7a6a78` | Texto secundario |
| `--tt-accent` | `#ffc53d` | `#ffb627` | Acento dorado (logro) |
| `--tt-danger` | `#ff6b6b` | `#ff5d5d` | Error, pérdida |
| `--tt-success` | `#3fb88b` | `#3ddc97` | Victoria, ganancia |
| `--tt-glow` | `rgba(124, 92, 255, 0.15)` | `rgba(124, 92, 255, 0.2)` | Brillo sutil violeta |

**Derivación**: los colores `--tt-bg` y `--tt-surface` son versiones muy oscuras de los tonos fríos del modo oscuro de Prodigia (`#090c14`, `#12172a`), desplazados hacia el violeta/magenta para dar sensación de "profundidad". El acento dorado `--tt-accent` es exactamente `--logro` de Prodigia (`#ffc53d`). Los colores de feedback (`success`, `danger`) son los mismos de la app.

### Relación con la Tienda

La Tienda usa una paleta cálida (marrones, crema, naranjas). La Trastienda es lo opuesto: **fría y profunda**. La transición visual entre las dos debe ser clara — el jugador siente que "bajó a otro nivel".

---

## 2. Arquitectura visual

### Layout general

```
┌──────────────────────────────────────────┐
│  [Volver a Tienda]              450 ⚡   │  ← Header fijo con balance
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────┐  ┌─────────────┐       │
│  │  APOSTAR A  │  │  PREDICCIÓN │       │  ← 2 módulos principales
│  │  PARTIDA    │  │  RANKING    │       │    (paneles clickeables)
│  └─────────────┘  └─────────────┘       │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │          🎰 RULETA               │    │  ← Módulo ruleta
│  │     [GIRO: 150 Chispas]         │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │       MINIJUEGOS                 │    │  ← Grilla de 5 minijuegos
│  │  ┌────┐ ┌────┐ ┌────┐          │    │
│  │  │LC  │ │AE  │ │VOL │          │    │
│  │  └────┘ └────┘ └────┘          │    │
│  │  ┌────┐ ┌────┐                 │    │
│  │  │LP  │ │ER  │                 │    │
│  │  └────┘ └────┘                 │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  📋 HISTORIAL RECIENTE           │    │  ← Últimas 5 interacciones
│  └──────────────────────────────────┘    │
│                                          │
└──────────────────────────────────────────┘
```

### Mobile vs Desktop

| Elemento | Mobile | Desktop |
|---|---|---|
| Header | Sticky, balance a la derecha | Igual |
| Módulos principales | Stack vertical | 2 columnas |
| Ruleta | Ancho completo, rotación centrada | 50% ancho, centrada |
| Minijuegos | 2 columnas | 3-5 columnas |
| Historial | Ancho completo | Ancho completo |

---

## 3. Componentes visuales

### 3.1 Panel de módulo (`TrastiendaPanel`)

Cada módulo de Trastienda (Apostar, Predicción, Ruleta, Minijuegos) es un panel con:

```
┌─────────────────────────────────┐
│  🎲 TÍTULO DEL MÓDULO          │  ← Font display, bold, --tt-text
│  Descripción breve en 1 línea   │  ← Font body, --tt-text-muted
│                                 │
│  [BOTÓN DE ACCIÓN]              │  ← Boton.tsx variante "primario"
│                                 │    con degradé violeta→dorado
└─────────────────────────────────┘
```

- **Borde**: 1px `--tt-border`, `rounded-2xl`.
- **Fondo**: `--tt-surface`.
- **Hover**: `--tt-surface-2` + sombra sutil `0 8px 24px rgba(0,0,0,0.3)`.
- **Animación**: `transition: transform 0.2s ease, box-shadow 0.2s ease`. Hover: `translateY(-2px)`.
- **NO glassmorphism**: sin `backdrop-blur`, sin transparencia excesiva. Superficies sólidas con sombra.

### 3.2 Botón de Trastienda

Reutiliza `Boton.tsx` existente (`src/components/Boton.tsx`). Variante `primario` con `destacado` para CTAs principales. El degradé por defecto (`var(--primario)` → `var(--logro)`) es perfecto para Trastienda: violeta → dorado, el color de la moneda.

Para botones de acción secundaria (cancelar, volver): variante `fantasma` con color `--tt-text-muted`.

### 3.3 Fichas de Chispas (display de balance)

```
  ⚡ 450
  ─────
  Chispas
```

- Ícono ⚡ (rayo) existente en la app para boost.
- Número en JetBrains Mono (`font-mono`), bold, color `--tt-accent`.
- Label "Chispas" en Inter, `--tt-text-muted`.
- Fondo: `--tt-surface-2`, `rounded-full`, padding compacto.
- Posición: header fijo, derecha.

### 3.4 Ruleta visual

**Estructura**: Círculo dividido en 10 segmentos de colores. Aguja fija arriba.

```
         ▲ (aguja)
       ╱   ╲
     ╱ SEG 7 ╲
    │  SEG 8   │
    │ SEG 9 SEG│
    │    10    │
    │  SEG 6   │
    │ SEG5 SEG1│
     ╲ SEG 4 ╱
       ╲ 3 ╱
         ╲╱
      SEG 2
```

- **Segmentos**: colores sólidos, NO gradientes por segmento. Borde fino `--tt-border` entre segmentos.
- **Aguja**: triángulo invertido, `--tt-accent` (dorado), con sombra.
- **Centro**: círculo con el logo de Prodigia (versión mini, aro + chispa).
- **Animación de giro**: framer-motion `rotate` con easing custom. La aguja se ilumina al parar sobre el segmento ganador.
- **Feedback post-giro**: flash de color del segmento → reveal del premio en un toast/notification.

### 3.5 Tablero de apuestas (Apostar a Partida)

```
┌─────────────────────────────────────┐
│  🏟️ Apostar a Partida              │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  🟣 Juan (ELO 1420)          │  │  ← Jugador A
│  │  VS                           │  │
│  │  🟡 María (ELO 1380)         │  │  ← Jugador B
│  │  🌍 Numeria · Ranked         │  │  ← Mundo + tipo
│  │  Odds: ×1.85 / ×1.85        │  │  ← Multipliers
│  ├───────────────────────────────┤  │
│  │  Elegí ganador:               │  │
│  │  [🟣 Juan] [🟡 María] [🤝 Empate]│  ← Botones de elección
│  ├───────────────────────────────┤  │
│  │  Monto: [25] [50] [100] [200]│  ← Chips
│  ├───────────────────────────────┤  │
│  │  Ganancia potencial: ×1.85   │  │
│  │  = 185 Chispas               │  │
│  │  [CONFIRMAR APUESTA]         │  │  ← Boton.tsx primario
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

- **VS**: texto bold, `--tt-danger` (granate) o `--tt-text-muted`.
- **Jugadores**: avatar + nombre + ELO. Fondo del elegido: `--tt-surface-2` con borde `--tt-accent`.
- **Odds**: JetBrains Mono, `--tt-accent`.
- **Montos**: píldoras `rounded-full`, estilo chips de casino.

### 3.6 Tarjeta de minijuego

```
┌───────────────┐
│  🧮 La Calcu  │  ← Emoji + nombre
│               │
│  30s · 50⚡   │  ← Duración + costo
│               │
│  [JUGAR]      │  ← Boton.tsx
└───────────────┘
```

- **Fondo**: `--tt-surface`.
- **Hover**: `--tt-surface-2` + borde `--tt-accent` sutil.
- **Icono del juego**: emoji grande centrado, `text-3xl`.
- **Animación de entrada**: fade-in escalonado (cada tarjeta aparece 0.1s después de la anterior).

### 3.7 Título desbloqueado (notificación)

```
┌──────────────────────────────────────┐
│  ✨ ¡TÍTULO DESBLOQUEADO!            │
│                                      │
│  [icono del título]                  │
│  FAROLERO                            │  ← Font display, bold
│  Rareza: Poco común                 │  ← Color de rareza
│                                      │
│  "5 apuestas ganadas seguidas"       │  ← Criterio
│                                      │
│  [USAR AHORA]  [CERRAR]             │
└──────────────────────────────────────┘
```

- **Fondo**: `--tt-surface` con borde del color de rareza.
- **Icono**: grande, centrado, con animación de pulso suave.
- **Animación de entrada**: slide-up + fade-in (0.4s).

### 3.8 Indicador de resultado (post-acción)

**Victoria**:
- Flash de `--tt-success` (verde) en el borde del panel.
- Número de Chispas ganadas aparece con animación de "conteo" (0 → total).
- Sonido: "ding" suave.

**Derrota**:
- Flash de `--tt-danger` (coral) sutil.
- Texto "0 Chispas" en `--tt-text-muted`.
- Sin animación exagerada (no queremos humillar).

**Empate (apuestas)**:
- Flash de `--tt-accent` (dorado).
- "Monto devuelto" en `--tt-text`.

---

## 4. Flujos y pantallas

### 4.1 Flujo de entrada

```
[Tienda] → scroll abajo → botón "🚪 Entrar a la Trastienda"
  → transición: fade-out de Tienda (0.3s) → fade-in de Trastienda (0.3s)
  → fondo cambia gradualmente de marrón cálido a profundo frío
```

**Transición de color**: animación CSS de `background` de laTienda (`radial-gradient(120% 100% at 50% 0%, #E8C79A 0%, #C97B4A 45%, #8a5a35 100%)`) a `--tt-bg` (`#1a1118`) durante 0.5s. El jugador percibe que la atmósfera cambia.

### 4.2 Flujo de Ruleta

```
1. Jugador toca "GIRO: 150 ⚡"
2. Botón se deshabilita, texto cambia a "Girando..."
3. Ruleta rota (animación 2.5s, easing de desaceleración)
4. Segmento ganador se ilumina (flash 0.3s)
5. Toast de resultado aparece (slide-up desde abajo)
6. Balance se actualiza con animación de conteo
7. Si pity activado: indicador "🛡️ Pity activo" desaparece
```

### 4.3 Flujo de Apuesta a Partida

```
1. Jugador abre módulo → carga lista de partidas (skeleton loading)
2. Selección de partida → expande panel de detalles
3. Selección de ganador → highlight en el jugador elegido
4. Selección de monto → chip seleccionado se llena
5. "CONFIRMAR" → modal de confirmación (no toast — es irreversible)
6. Confirmación → RPC → toast "Apuesta registrada"
7. Cuando la partida se cierra → notificación push (si está offline)
```

### 4.4 Flujo de Minijuego

```
1. Jugador toca tarjeta del minijuego
2. Overlay/modal se abre (0.3s fade-in)
3. Instrucciones breves (1-2 líneas) + "EMPEZAR"
4. Minijuego en sí (UI completa, timer visible)
5. Resultado → animación de victoria/derrota
6. "JUGAR DE NUEVO" o "CERRAR"
```

---

## 5. Animaciones con timing

| Elemento | Propiedad | Duración | Easing |
|---|---|---|---|
| Transición Tienda→Trastienda | background, opacity | 0.5s | ease-in-out |
| Panel hover | transform, box-shadow | 0.2s | ease |
| Ruleta giro | rotate | 2.5s | cubic-bezier(0.25, 0.1, 0.25, 1) |
| Ruleta rebote | rotate | 0.3s | ease-out |
| Flash de resultado | opacity, background | 0.3s | ease |
| Conteo de Chispas | number interpolation | 0.8s | ease-out |
| Tarjeta minijuego entrada | opacity, translateY | 0.4s | ease-out (stagger 0.1s) |
| Título desbloqueado | opacity, translateY, scale | 0.4s | spring (framer-motion) |
| Modal confirmación | opacity, scale | 0.25s | ease-out |
| Notificación toast | translateY, opacity | 0.3s | ease-out |

**Regla**: ninguna animación debe durar más de 3 segundos (excepto la ruleta, que es la experiencia core). Animaciones en Trastienda son más contenidas que en la Tienda — el sótano es serio.

---

## 6. Estados

### Estado vacío (sin interacciones hoy)

```
┌─────────────────────────────────────┐
│  🚪 La Trastienda                   │
│                                     │
│  "El sótano del bazar.             │
│   Algunos dicen que aquí se        │
│   ganan fortunas. Otros dicen      │
│   que se pierden."                  │
│                                     │
│  [Dale una vuelta]                  │
└─────────────────────────────────────┘
```

### Estado con actividad

```
┌─────────────────────────────────────┐
│  🚪 La Trastienda           450 ⚡  │
│                                     │
│  [módulos como en el layout]        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📋 Hoy jugaste:            │    │
│  │  ✓ Ruleta: ×3 (ganaste 75) │    │
│  │  ✓ Volado: ×1 (ganaste 55) │    │
│  │  ✗ La Calcu: ×1 (perdiste) │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Estado bloqueado (daily limit)

```
┌─────────────────────────────────────┐
│  🎰 Ruleta                          │
│                                     │
│  "Ya giraste 5 veces hoy.           │
│   Volvé mañana."                    │
│                                     │
│  Próximo giro GRATIS: 120 ⚡        │
│  (en 14:32:07)                      │
└─────────────────────────────────────┘
```

---

## 7. Assets necesarios

### Formato solicitado

| # | Asset | Tipo | Descripción | Tamaño | Notas |
|---|---|---|---|---|---|
| 1 | `trastienda-bg.svg` | Fondo | Patrón de madera oscura con textura de piedra. Repetible en tile. Tono `#1a1118`-`#2a1f28`. | 200×200px | SVG pattern, NO imagen pesada |
| 2 | `trastienda-door.svg` | Ícono | Puerta de madera vieja con candado. Estilo line-art, 2px stroke, color `--tt-text-muted`. | 48×48px | Para el botón de entrada |
| 3 | `trastienda-wheel.svg` | Ruleta | Círculo con 10 segmentos de colores predefinidos. Aguja dorada. Centro con logo mini. | 300×300px | Vector, animable con framer-motion |
| 4 | `trastienda-chips.svg` | Ficha | Ficha de casino estilizada con rayo de Prodigia. Colores: `--tt-accent` + `--tt-surface`. | 32×32px | Para displays de monto |
| 5 | `trastienda-dice.svg` | Ícono | Dado de 6 caras, estilo line-art. Para módulo de apuestas. | 48×48px | — |
| 6 | `trastienda-cards.svg` | Ícono | 3 cartas superpuestas (para minijuegos de azar). | 48×48px | — |
| 7 | `trastienda-timer.svg` | Ícono | Reloj de arena estilizado. Para "El Reloj" y countdowns. | 48×48px | — |
| 8 | `trastienda-board.svg` | Ícono | Pizarra con ecuaciones. Para "La Pizarra". | 48×48px | — |
| 9 | `trastienda-brain.svg` | Ícono | Cerebro con circuits. Para "Acertijos de Enigmia". | 48×48px | — |
| 10 | `trastienda-titles-bg.png` | Textura | Fondo para tarjetas de títulos. Degradé sutil de `--tt-surface` a `--tt-surface-2` con grain. | 400×100px | PNG, ~5KB |
| 11 | `rarity-{common,uncommon,rare,epic,legendary,mythic}.svg` | Borde | Bordes de 6 rarezas para títulos. Cada uno es un marco rectangular con esquinas decorativas. | 200×60px | SVG, colorable vía CSS |
| 12 | `trastienda-sound-ding.mp3` | Audio | Sonido de "ding" suave para victoria. | <50KB | Opcional, fase 2 |
| 13 | `trastienda-sound-spin.mp3` | Audio | Sonido de ruleta girando (tictac). | <100KB | Opcional, fase 2 |
| 14 | `trastienda-sound-fanfare.mp3` | Audio | Fanfarria corta para premio raro+. | <80KB | Opcional, fase 2 |

### Íconos de minijuegos (en `src/components/icons/`)

| Minijuego | Emoji actual | Ícono SVG propuesto | Descripción |
|---|---|---|---|
| La Calcu | 🧮 | `IconCalcu` | Calculadora con signos de operación |
| Acertijos Enigmia | 🧩 | `IconAcertijo` | Pieza de rompecabezas con signo de interrogación |
| Volado | 🪙 | `IconVolado` | Moneda con cara/cruz estilizada |
| La Pizarra | 📝 | `IconPizarra` | Pizarra con número y flechas |
| El Reloj | ⏱️ | `IconReloj` | Cronómetro con rayos |

---

## 8. Respeto a la identidad Prodigia

### Lo que SÍ se toma de Prodigia

- **Degradé 120° violeta→dorado** para CTAs (Boton.tsx:50).
- **Font display: Space Grotesk** para títulos.
- **Font mono: JetBrains Mono** para números y Chispas.
- **Font body: Inter** para descripciones.
- **Color `--logro` (#ffc53d)** como acento dorado universal.
- **Píldoras rounded-full** para chips y tags.
- **Tarjetas rounded-2xl** para paneles.
- **Sombras de 14px** (patrón existente en TiendaClient.tsx:481).
- **Iconos de mundos** existentes (si se necesita referenciar mundos en apuestas).
- **Voz rioplatense**: "Elegí", "Apostá", "Girá", "Acertaste".

### Lo que NO se hace

- ❌ **Glassmorphism**: sin `backdrop-blur`, sin transparencias excesivas. Superficies sólidas.
- ❌ **Gradientes por todos lados**: gradientes solo en CTAs y fondos de sección, no en cada borde.
- ❌ **Look SaaS**: nada de dashboards con sidebar, cards genéricas, o estética de herramienta de productividad.
- ❌ **Neón/gamer**: sin `text-shadow` con colores neón, sin bordes brillantes por todos lados. La Trastienda es un sótano, no un arcade.
- ❌ **Stock images**: todo ilustrado/Vector, no fotos.
- ❌ **Copy genérico**: "¡Apostá y ganá!" → NO. Usar voz Prodigia: "¿Te la jugás?"

---

## 9. DECISIONES PARA EL ORQUESTADOR

###Assets y timing
- **Assets 1-9** (SVGs): estimación 2-3 horas de diseño. Prioridad ALTA — sin ellos la UI queda genérica.
- **Assets 10-14** (texturas, audio): fase 2. La UI funciona sin ellos.
- **Íconos de minijuegos**: usar emojis como placeholder en fase 1, migrar a SVGs en fase 2.

### Integración con Componentes existentes
- **Boton.tsx**: reutilizar tal cual. NO crear botones sueltos.
- **GlareHover**: usar para tarjetas de minijuegos (mismo patrón que `TiendaClient.tsx:543`).
- **BorderGlow**: usar para la ruleta y para el panel de "Predicción de Ranking" (mismo patrón que oferta del día, `TiendaClient.tsx:461`).
- **GestoLogo.tsx**: reusar para momento de desbloqueo de título Legendario/Mitológico (es el "momento grande" de Prodigia, no inventar uno nuevo).

### Dependencias con diseño previo
- **TRASTIENDA-ECONOMIA.md**: los montos y probabilidades están definidos ahí. El visual NO cambia la economía.
- **Paleta de mundos** (`src/lib/mundos/precios.ts`): los colores de mundos se usan en "Apostar a Partida" para identificar el mundo de la partida apostada.

### Próximos pasos de implementación visual
1. Crear SVGs de assets 1-9 (prioridad).
2. Crear componente `TrastiendaClient.tsx` expandiendo la sección existente en `TiendaClient.tsx`.
3. Crear sub-componentes: `PanelRuleta.tsx`, `TableroApuestas.tsx`, `GrillaMinijuegos.tsx`, `HistorialTrastienda.tsx`.
4. Integrar con `Boton.tsx`, `GlareHover`, `BorderGlow`.
5. Agregar CSS variables `--tt-*` a `globals.css`.
6. Testing visual en mobile y desktop.

---

*Documento de diseño visual. Sin código de runtime. Referencias: `src/app/globals.css:16-60`, `src/components/Boton.tsx:50`, `src/app/[locale]/tienda/TiendaClient.tsx:218,478-510,622-655`, `src/lib/mundos/precios.ts`, `docs/marketing/BRAND.md:7-10`, `src/lib/titulos/catalogo.ts`.*
