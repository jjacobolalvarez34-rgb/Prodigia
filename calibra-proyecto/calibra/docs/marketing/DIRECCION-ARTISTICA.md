# DIRECCIÓN ARTÍSTICA — Prodigia (campaña 2026-09-09)

> Arte de dirección publicitaria para **Prodigia** (app de práctica de cálculo mental multi-mundo con gamificación, Chispas, multijugador; español rioplatense).
> Este documento construye **identidad propia** a partir de la app REAL. Nada se copia de marcas ajenas: cada decisión cita el código de Prodigia (`archivo:línea`) o una referencia explícita (sección 1) adaptada SIN copiar.
> Alcance: UN solo entregable de especificación + el append de recursos en `docs/EXTERNAL-RESOURCES.md`. Estado de cada dato: VERIFICADO EN CÓDIGO / PROPUESTA (identificadas explícitamente).

---

## 0. Regla de oro (non-negociable, heredada de BRAND.md)

> **"Si no parece Prodigia, no es Prodigia."** La dirección artística publicitaria arranca SIEMPRE de la identidad real de la app: `globals.css`, `Logo.tsx`, `mundos.ts`, `precios.ts`, `WorldCard.tsx`, `icons.tsx`, `FondoMundo.tsx`. No se "parece a" nada externo: se construye desde los tokens vivos de la app.

Este documento convierte esa identidad en **especificaciones ejecutables** para un diseñador o para un generador de assets por código (ver sección final).

---

## 1. Análisis de referencias → qué funciona → cómo se adapta SIN copiar

> Uso modesto de websearch (2026). Cada referencia: qué funciona → por qué → adaptación Prodigia (nunca imitación). Ningún logo/paleta/tipografía ajenos se trasladan; solo se extraen PRINCIPIOS reutilizables.

### R1 · Duolingo — "Juiciness" y world-building de marca (2026)
- Qué funciona: una estética "jugosa" (colores saturados, esquinas redondeadas, ilustración consistente) + un universo con personajes/mascota que es el "moat" de la marca ("aunque te clonen la app, los usuarios vuelven por los personajes").
- Por qué: el making-of documenta la migración de una UI plana/gris a una jugosa que "se siente más a juego" y mejora rendimiento a largo plazo; la consistencia del shape-language hace la marca reconocible en un lineup.
- Adaptación Prodigia SIN copiar: Prodigia ya tiene su propia "jugosidad" real en código: esquinas `rounded-full`/`rounded-2xl`/`rounded-3xl` (SprintRunner.tsx:546), degradés por mundo, y su **símbolo propio**: el **aro violeta + chispa asimétrica de 4 puntas** (Logo.tsx:18-70). El "universo" de Prodigia NO son personajes sino **8 mundos-ciudad con color, ícono y glifos propios** (mundos.ts:20-27, FondoMundo.tsx:23-91). Decisión: la pieza publicitaria siempre incluye al menos una señal del universo (un aro+chispa, un glifo de mundo, un degradé de mundo) y mantiene radios y degradés idénticos a la app. No inventamos mascota antropomórfica (eso sería un "Duo"); Prodigia tiene símbolo + mundos.

### R2 · League of Legends — escalera de rangos por color (Riot)
- Qué funciona: un sistema de tier (Bronce→toque) se lee al instante por **color + forma del badge**, con progresión "cada tier luce más que el anterior" (volumen, material, color) y un área uniforme donde mirar tu progreso.
- Por qué: el color como señal inmediata de estado + economía de recompensas visuales hace que el avance se "sienta" sin leer texto.
- Adaptación Prodigia SIN copiar: Prodigia YA tiene su propia escalera de 6 rangos con hex propios y nombre "Prodigio" como tope (database.ts:263-268, `RangoBadge.tsx`). En publicidad usamos esos EXACTOS hex y el ícono de rango propio (`IconRango`, icons.tsx:283). El "Prodigio" (tope) lleva nombre en degradé violeta→ámbar (`RangoBadge.tsx:34-41`) — ese es el payoff publicitario natural, no un clon de crestas Riot.

### R3 · Ecosystem creativo de UA mobile games 2026 (SocialPeta / AdMapix / Segwise)
- Qué funciona (datos 2026): (a) **gameplay-first**: el "core loop" se muestra antes que cualquier gimmick; (b) **corte a mitad de gameplay** / near-fail (efecto Zeigarnik: la tensión sin resolver retiene); (c) sweet spot de **~22 s de video** con un batido de cortes (8–34 s); (d) 1️⃣1:1 **hook emocional en los primeros 2 s**; (e) **el formato sigue a la mecánica**: puzzles/una acción→playable, espectáculo/narrativa→video.
- Por qué: la atención se compra en 3 s; la "primera sesión real" es lo que convierte.
- Adaptación Prodigia SIN copiar: las 8 demos REALES (`assets/pantallas-reales/23..30`) son el "gameplay-first" nativo de Prodigia: cada mundo muestra UNA pregunta real. Regla de dirección: **la captura de sprint (23-demo-numeria-sprint.png, el "5 + 6" gigante) es el hero absoluto** de apertura; los cortes de mundo son los beats; nunca abrimos con animación abstracta que no muestre el juego. El copy rioplatense ("Tu rival ya terminó") es nuestro propio tipo de near-fail: la barra del rival que sigue sola.

### R4 · MONOPOLY GO! vs Royal Match vs Coin Master — dos playbooks opuestos (AdMapix 2026)
- Qué funciona: Scopely blitz de video (masa, ~60 días de vida) vs patience-marathon de Royal Match (misma pieza vive 200-340 días). Lección: **la disciplina de rotación y un solo mensaje consistente** importan más que el presupuesto; "una línea de copy sirve para toda la flota; la diferenciación vive en los primeros 3 s del footage".
- Por qué: reduce fatiga, mantiene coherencia de marca, datos limpios.
- Adaptación Prodigia SIN copiar: adoptamos una **flota pequeña de ~6 visuales** (footer: especificación mínima) en vez de miles; cada pieza comparte el mismo sistema visual (mismo degradé, misma tipografía, mismo badge) y solo cambia el mundo/gancho. El CTA/lockup es siempre idéntico: "Entrá → Prodigia" + aro+chispa.

### R5 · Duolingo "shape language & minimalismo por escalabilidad" (artículo oficial 2020)
- Qué funciona: un estilo **mínimo, vectorial y reutilizable** (no ilustración rica por pieza) que escala a cientos de assets; "menos detalles = más legible a tamaño chico"; espacio negativo blanco como marco.
- Por qué: producción barata + lectura instantánea en pantalla chica.
- Adaptación Prodigia SIN copiar: en vez de ilustraciones, Prodigia usa su **lenguaje vectorial nativo**: íconos stroke-2 línea redonda (icons.tsx), glifos unicode por mundo (FondoMundo.tsx) y degradés por mundo (WorldCard.tsx:64). Regla: **reusar los SVG reales de la app** para todo icono publicitario; no redibujar a mano.

### R6 · Figma Community / LottieFiles — recursos licenciados (2026)
- Qué funciona: paletas/listas de variables de color gratis (CC BY 4.0) y animaciones Lottie con licencia "Lottie Simple" que permite uso comercial sin atribución.
- Por qué: cuando se necesite un asset externo (una animación de partícula, una plantilla de rejilla), existe ruta legal clara.
- Adaptación Prodigia: usarlos SÓLO como referencia/plantilla o para micro-animaciones neutras (partículas/confeti), jamás para el símbolo de marca. Registrados en EXTERNAL-RESOURCES.md con su licencia. (Detalle: la chispa/aro debe salir SIEMPRE del SVG real.)

### R7 · Esports/ranked "Climb" — la subida como narrativa (referencia conceptual)
- Qué funciona: el "climb" (escalar rangos) como arco narrativo publicitario: empezás abajo, subís, hay un tope aspiracional.
- Por qué: misión clara + progreso visible = motor de retención.
- Adaptación Prodigia: el arco de campaña "8 mundos → rankeds → Prodigio" ya existe como jerarquía real (precios.ts, RANGOS_ELO). Dirección: en piezas multi-secuencia, ordenar visualmente de mundo→rango→tope Prodigio, usando los degradés reales.

### R8 · Juegos AAA de "mundo/ciudad" — eventos de lanzamiento (referencia HB)
- Qué funciona: lanzar un producto como un lugar al que viajar ("entrá a este mundo"), no como una utilidad.
- Por qué: el "mundo" da identidad, colección y ganas de explorar.
- Adaptación Prodigia: Prodigia LITERALMENTE llama "ciudades" a sus mundos (la landing: "Elegí una ciudad", VisitanteLanding.tsx; FondoMundo es el "lobby"; cambiar de mundo se siente como viajar — FondoMundo.tsx:18-22). Dirección: **el lenguaje de "explorar 8 ciudades"** se vuelve el frame de todas las piezas; cada mundo es una pieza distinta con su color.

### Referencias con licencia/atribución
| Ref | Tipo | Licencia/uso |
|---|---|---|
| Duolingo Handbook / blog shape-language / Apple Developer | Lectura de principios | Contenido editorial público; se cita la idea, no se copia diseño. |
| Riot /dev: Visual Design of League Leveling | Editorial de principios | Se cita la idea de "progresión por color"; no se usan assets. |
| SocialPeta / AdMapix / Segwise insights 2026 | Datos de creatividad UA | Datos públicos de tendencia; no se copian piezas. |
| Figma Community (Untitled UI color styles + LottieFiles plugin) | Plantilla/recurso | CC BY 4.0 (atribución) / Lottie Simple License (comercial sí). Ver EXTERNAL-RESOURCES.md. |

---

## 2. Paleta publicitaria

> Base 100% de `globals.css` (tokens reales). Dos ejes mutuamente excluyentes por pieza: CLARO (`#fdfbf7`) u OSCURO (`#090c14`), NUNCA mezclados (BRAND.md:12, VISUAL-ASSETS.md:13).

### 2.1 Tokens base (VERIFICADO EN CÓDIGO — globals.css:16-28 / 48-60)
| Token | CLARO | OSCURO | Uso publicitario |
|---|---|---|---|
| Fondo (`--background`) | `#fdfbf7` crema | `#090c14` nocturno | Fondo de pieza / tarjeta |
| Superficie (`--surface`) | `#ffffff` | `#12172a` | Sobre-elevar screenshots |
| Superficie-2 (`--surface-2`) | `#f3efe7` | `#171d34` | Franjas/scrims suaves |
| Borde (`--border`) | `#e7e0d2` | `#232b47` | Bordes de marcos/badges |
| Texto (`--foreground`) | `#1f2430` | `#f4f6fb` | Headlines (en claro) / body en oscuro |
| Texto secundario (`--texto-secundario`) | `#6b7280` | `#8892b0` | Captions, metadata |
| Primario (`--primario`) | `#6c4cf1` violeta | `#7c5cff` | CTAs, anclas, botones |
| Correcto (`--correcto`) | `#3fb88b` | `#3ddc97` | Acierto, "nivel +1" |
| Error (`--error`) | `#ff6b6b` | `#ff5d5d` | Solo de refuerzo puntual (nunca drama) |
| Racha (`--racha`) | `#ff8a3d` | `#ff8a3d` | Racha, tiempo, boost |
| Logro (`--logro`) | `#ffc53d` dorado | `#ffb627` | Medallas, XP, podio, "Prodigio" |

### 2.2 Acentos por mundo (VERIFICADO EN CÓDIGO — `src/lib/mundos.ts:20-27` y `precios.ts:33-40`)
| Mundo | Hex exacto | Ícono (icons.tsx) | Glifos de fondo (FondoMundo.tsx) |
|---|---|---|---|
| Numeria | `#6C4CF1` | IconSuma | `+ − × ÷ = 7` |
| Enigmia | `#0E9F6E` | IconLogica | `? ◆ ▲ ● ∴` |
| Geografía | `#1E7A8C` | IconGeometria | `◔ ✦ ◐` |
| Quimia | `#C026D3` | IconQuimica | `⚗ ⚛ ⬡ 🧪` |
| Anatomía | `#8B2942` | IconAnatomia | `⚕ ♥ 🦴 🧠` |
| Melodía | `#B8860B` | IconMelodia | `♪ 𝄞 ♫ ♩ ♭` |
| Trigonometría | `#84CC16` | IconTrigonometria | `△ ∠ ° π θ` |
| Historia | `#A0522D` | IconHistoria | `📜 🏛 ⏳ ⚔ 🗿` |

**Regla de uso en publicidad:** UN mundo protagonista por pieza. Su "degradé de mundo" (ver 2.5) es la firma visual (WorldCard.tsx:64). En piezas "8 mundos", mantener al menos 2 colores contrastantes en la composición (VISUAL-ASSETS.md:35).

### 2.3 Colores de rareza (PROPUESTA — la Tienda actual usa `marcos_mundo` + fuentes, NO tiene sistema de rareza por código)
> ⚠️ IMPORTANTE: no existe en código aún. Esto es una **PROPUESTA de dirección** con nombres propios Prodigia (coherentes con la metáfora Chispas/ciudades/rangos). Cuando se implemente una tienda con rareza, usar estos hex.
| Nivel (propio) | Nombre Prodigia | Hex sólido | Uso propuesto |
|---|---|---|---|
| Común | **Crikt** (base) | `#B8C4D9` (plata) | ítems base de bazar |
| Poco común | **Burbuja** | `#1E7A8C` (teal geografía) | desbloqueos avanzados |
| Raro | **Relámpago** | `#6C4CF1` (violeta primario) | cosméticos destacados |
| Épico | **Estela** | `#7C5CFF→#FFC53D` degradé (primario→logro) | sets de temporada |
| Legendario | **Prodigio** | `#A794FF→#FFC53D` (degradé del logo, Logo.tsx:26-30) | exclusivos del tope de rangos |

### 2.4 Colores de rango Ranked (VERIFICADO EN CÓDIGO — `src/types/database.ts:263-268`)
| Rango | Hex | Nota publicitaria |
|---|---|---|
| Bronce | `#B08D57` | — |
| Plata | `#B8C4D9` | — |
| Oro | `#E8B34D` | — |
| Platino | `#5FBFA8` | desde acá "todas las ciudades" (fair play) |
| Diamante | `#5DC8F5` | — |
| **Prodigio** (tope) | `#FFC53D` + nombre en degradé `#A794FF→#FFC53D` | SELLO DE CAMPAÑA: el payoff aspiracional |

### 2.5 Gradientes y su uso (VERIFICADO EN CÓDIGO)
1. **Degradé de mundo** (la firma): `linear-gradient(120deg, <hexMundo>, color-mix(in oklab, <hexMundo> 55%, white))` — EXACTO de `WorldCard.tsx:64`. Uso: fondo de tarjetas de mundo, chips de mundo, marcos de screenshot.
2. **Degradé primario→logro** (violeta→dorado): `linear-gradient(120deg, var(--primario), var(--logro))` — de `Boton.tsx:50`. Uso: CTAs, barras de progreso, el "nivel +1".
3. **Degradé del logo** (chispa): `#A794FF → #E4CBA0 → #FFC53D` (Logo.tsx:26-30). Uso: SOLO el relleno de la chispa. Anti-patrón: NO usarlo como fondo general (VISUAL-ASSETS.md:55).
4. **Prodigio (tope)** = degradé del logo aplicado a texto (`RangoBadge.tsx:34-41`). Uso: el nombre "Prodigio" en texto degradado.

---

## 3. Tipografía

> Sistema real (VERIFICADO EN CÓDIGO): `--font-display` = Space Grotesk, `--font-sans` = Inter, `--font-mono` = JetBrains Mono (globals.css:74-76). Pesos cargados en `src/app/layout.tsx:15-36`: Space Grotesk **500/600/700**, Inter **400/500/600/700**, JetBrains Mono **500/600/700**.

### 3.1 Jerarquía publicitaria (nuevo, basada en pesos reales)
| Rol | Fuente | Peso | Tracking | Uso |
|---|---|---|---|---|
| Display | Space Grotesk | 700 (bold) | tight `-0.03em` | Headline de 1 línea, hasta 3.ª palabra en color mundo/logro |
| Headline | Space Grotesk | 600 | tight `-0.02em` | Títulos de sección |
| Subhead | Space Grotesk | 500 | `-0.01em` | Sub-sellos ("Partidas de 60 s…") |
| Cuerpo | Inter | 400/500 | normal | Párrafos, explicaciones |
| Caption | Inter | 500 | `+0.02em` | Metadatos, tags, pies |
| Números | JetBrains Mono | 600/700 | normal | TODOS los números: `10 preguntas`, `60 seg`, `2 mundos`, `3000 Chispas`, ELO, puestos. NUNCA en otra fuente (BRAND:41, VISUAL-ASSETS:21). |

### 3.2 Reglas de legibilidad sobre screenshot
Sobre una captura de app (que tiene densidad y color propio), el texto va en **cajas con máscara o scrim**, NUNCA flotando crudo:
- **Claro:** texto `#1f2430` sobre `#fdfbf7` + scrim blando. Si el screenshot es claro, meter una "caja" `#fdfbf7` con `border #e7e0d2`.
- **Oscuro:** texto `#f4f6fb`; si el screenshot es oscuro (como el sprint), usar glow/borde del color del mundo o un scrim `#090c14` translúcido.
- Mínimo legible: headline ≥ 48 px en pieza 1080; body ≥ 20 px; caption ≥ 14 px.
- **Fallbacks:** si no está la fuente web cargada, fallback sans = `system-ui`; jamás serif ni decorative. Números también con fuente mono de sistema de mono-espaciado como fallback.

---

## 4. Tratamiento de screenshots en publicidad

> Las 30 capturas reales son la materia prima. No se tocan sus colores; se las enmarca.

### 4.1 Marco (device frame vs full-bleed)
- **Full-bleed** (screenshot ocupa todo el fondo) solo si es una pantalla icónica (el sprint `23`, el hero 8 mundos `03`, el podio `11`). Requiere scrim para texto.
- **Device frame** (captura dentro de un marco de teléfono) para piezas de una sola pantalla de historia (onboarding `06`, bloqueo `17`). Frame minimalista: NO teléfono 3D glossy (anti-patrón VISUAL-ASSETS:54); un rectángulo con bisel delgado `#1f2430`/`#090c14` + borde `--border`.

### 4.2 Dimensiones, esquinas, sombra
- **Proporción de la captura:** es 16:9-ish o vertical de la app; recortar a 3:4 / 4:5 / 1:1 / 9:16 según el formato (ver sección 5).
- **Esquinas:** `rounded-2xl` (16 px) para tarjetas/preview, `rounded-3xl` (24 px) para hero, `rounded-full` solo en chips/píldoras (SprintRunner.tsx:546).
- **Sombra:** `shadow-lg shadow-foreground/[0.03]` (consistente con la app). En oscuro, además un **borde sutil y glow del color del mundo** para no "perder" el screenshot (sección 9).

### 4.3 Brillo, borde, máscaras
- **Máscara de borde:** 1−2 px del color del mundo a baja opacidad (`hexMundo` al 40–60%) rodeando la captura, para anclarla a la pieza.
- **Scrims:** overlay lineal `#090c14` (oscuro) o `#fdfbf7` (claro) desde un costado, para la zona de texto. Opacidad 40–70% según contraste del screenshot.

### 4.4 Zoom a detalle
- Recortar a un **detalle icónico**: el `5 + 6` gigante (enunciado mono), la clave de sol dorada (pentagrama `19`), el candado de `17`, el esqueleto `28`, el mapa `29`. Regla: un detalle = una idea.
- El zoom NUNCA deforma; recorte limpio + opcional glow de mundo.

### 4.5 Buzón para texto (enmascaramiento)
- En piezas con mucho screenshot, reservar un **buzón** (banda inferior o lateral) para el headline: un rectángulo de `--surface` con `--border`, acorde a la proporción (sección 5). El texto no invade el área de UI de la captura.

---

## 5. Composición por formato

### 5.1 Rejilla base y zona segura
- **Zona segura:** 8% del borde en cada lado para contenido crítico (texto, CTA). En short vertical 9:16, dejar el tercio inferior (≈ 25% de altura) fuera de riesgo por la UI overplay.
- **Regla de tercios:** el screenshot o su detalle en la intersección de tercios; el headline en el tercio opuesto. No centrar jamás de forma estática (salvo pósters de hero).

### 5.2 Post 1:1 (feed)
- Split vertical: **screenshot arriba (2/3)** + **buzón abajo (1/3)**. Screenshot full-bleed en 2/3 con scrim inferior de `--surface`; headline Space Grotesk bold + 1 número JetBrains Mono + CTA aro+chispa.
- Croquis:
```
┌─────────────────────────┐
│                          │  <- screenshot (detalle/demo) full-bleed
│                          │      + scrim inferior hacia --surface
│                          │
├─────────────────────────┤
│  "8 MUNDOS.              │  <- buzón: Space Grotesk bold
│   UNA SOLA CABEZA."       │
│  10 preguntas · 60 seg   │  <- JetBrains Mono caption
│  (aro+chispa) [Entrá →]  │
└─────────────────────────┘
```

### 5.3 Story 9:16 (vertical)
- Vertical full-bleed: screenshot en 2/3 superior, headline gigante en tercio inferior sobre scrim. Botón de CTA abajo-centro. Texto de títulos arriba NO dentro de la zona de tap de UI.
- Croquis:
```
┌────────┐
│░░░░░░░░│ <- screenshot vertical del mundo
│  ♪ 𝄞   │    (pentagrama / sprint / mapa)
│░░░░░░░░│
├────────┤
│  HEADLINE   │ <- scrim, Space Grotesk 700
│  60 SEGUNDOS │ <- JetBrains Mono
│ (aro+chispa) │
│  Entrá →     │ <- pill --primario
└────────┘
```

### 5.4 Banner 16:9 (lateral)
- Horizontal: screenshot a la izquierda (detalle 4:5 recortado), buzón de texto a la derecha sobre `--surface` con glifos de mundo flotando tenues (reuso de FondoMundo). Headline izquierda, CTA derecha.
- Croquis:
```
┌──────────────────────────────────────┐
│ ┌──────┐  HEADLINE SPACE GROTESK       │
│ │ 5+6  │  "TENÉS 60 SEGUNDOS."          │
│ │Sprint│  10 preguntas · racha          │
│ └──────┘  (aro+chispa)   [Entrá →]     │
└──────────────────────────────────────┘
```

### 5.5 Thumbnail de video
- Alto contraste, CERO texto redundante: un detalle + un número gigante + un emoji/símbolo de mundo. Rejilla de tercios con el detalle a la izquierda, el "número-faro" (JetBrains Mono) a la derecha. Badge "RANKED"/"1v1" si aplica (sección 10).

### 5.6 Anclas, flechas, indicadores, badges
- Solo cuando aportan: una **flecha/glow** apunta al detalle que hay que mirar (el candado, el hueso, la nota) usando el color del mundo. Los **badges de sistema** (sección 10) reemplazan a las etiquetas decorativas.

---

## 6. Iconografía y elementos del universo

> Todo lo que se muestra DEBE existir en el código. Se reúsa el SVG real, no se redibuja.

- **Aro + chispa (marca):** `Logo.tsx` / `icon.svg`. La chispa asimétrica de 4 puntas con degradé `#A794FF→#E4CBA0→#FFC53D`. Tratamiento: en pieza estática va **abajo del lockup**; en hero puede ir con glow suave (la app ya la llama con glow en `LogoSpinner.tsx:23`). Nunca se le cambia la forma.
- **Íconos de mundos/operaciones:** `icons.tsx` (stroke 2, punta redonda). Tratamiento: color del mundo, al 100%; en badges, dentro de pill `bg-<mundo>/15`. Sombra suave; contorno finito solo en oscuro.
- **Glifos por mundo** (`FondoMundo.tsx:23-91`): sirven de **textura de fondo** en buzones y hero, muy tenues (opacidad 0.02–0.06, igual que la app). Nunca como protagonista.
- **Chispas (moneda):** símbolo de la chispa grande + contador en JetBrains Mono. En piezas de economía/tienda.
- **Escudos / medallas / rangos:** uso en piezas de fair-play y rankeds: `IconEscudo`, `IconRango` (icons.tsx) y las insignias PNG `/rangos/*.png` (en public/). El badge "Prodigio" con nombre degradado = emblema de cierre.
- **Mascota/símbolo:** NO hay mascota antropomórfica en código; el símbolo es el aro+chispa. Regla: **no inventar mascota**. El "personaje" publicitario es el número/problema gigante (el `5 + 6`) y los 8 mundos.

---

## 7. Textura y tratamiento de fondo

> Parametrización para el generador. Todos los fondos derivan de tokens, no de fotos.

- **Gradiente de fondo (1 axis):** `linear-gradient(120deg, <hexMundo>, color-mix(in oklab, <hexMundo> 15%, var(--surface)))` — versión aderezada de `WorldCard.tsx:64` (la app usa 55% blanco; en publicidad bajar a 15–25% blanco cuando el fondo debe quedar desaturado para texto). Si el screenshot protagoniza, el fondo NO lleva degradé fuerte.
- **Ruido sutil:** píxel noise al 2–4% de opacidad, mezcla `soft-light`, para quitar el "flat" digital. Opcional.
- **Orbes de luz:** 2 orb-gradients radiales del color del mundo (`radial-gradient(circle at 20% 80%, color-mix(in oklab, <hexMundo> 25%, transparent), transparent 60%)`) en esquinas opuestas entra la superficie. Blur `blur(60px)`.
- **Rejilla geométrica:** línea punteada o guías tenues de `--border` al 30% tras el screenshot (para piezas "8 mundos"). NO celosía jamás.
- **Glifos flotantes:** reuso de FondoMundo con opacidad 0.02–0.06, rotación ±8°, en márgenes (nunca centro) — literal de `FondoMundo.tsx:23-91`.

---

## 8. Motion publicitario

> Para video (9:16 / 1:1 / 16:9 cortos). Estilo: "la app cobra vida", no cinemática de estudio.

- **Ritmo:** base 22 s (dato de mercado, sección R3), con cortes múltiples de 2–3 s. Un hook en 0–2 s mostrando el sprint.
- **Easing:** `cubic-bezier(0.45, 0.05, 0.55, 0.95)` (el del logo-spinner, globals.css:129) para todo lo propio de marca; `ease-in-out` para fundidos.
- **Tipos de transición (de más a menos usada):**
  1. **Corte seco** — entre mundos/demos (ritmo de juego; near-fail: cortar a mitad).
  2. **Fundido (crossfade)** — cambios de estado (resultado, ranking).
  3. **Slide** — al pasar un screenshot a otro en piezas "8 mundos".
  4. **Zoom/tilt/parallax** — para dar tridimensionalidad a un screenshot fijo: zoom lento 1.0→1.06 sobre el `5+6`; tilt leve (±3°) en el frame de teléfono; parallax entre 2 capas de glifos.
- **Partículas/confeti:** SOLO en el momento de logro/recompensa (el "nivel +1", podio, reto completado), con el color del mundo. Nunca decorativo constante. (La app usa confeti en acierto, SprintRunner.)
- **Bucle:** los últimos 0,5 s deben permitir loop (SOCIAL-CONTENT:26).

---

## 9. Reglas dark mode publicitario

> La app soporta `data-theme=dark` + `localStorage prodigia-theme` (layout.tsx:120-130) y tokens oscuros (globals.css:48-60). La publicidad oscura es un eje VÁLIDO y potente (el sprint, rankeds) pero debe verse **intencional**, no como un screenshot "que quedó oscuro".

- **Fondo:** `#090c14` (no negro puro). Superficies `#12172a`/`#171d34`.
- **Contraste de texto sobre pantalla oscura:** usar el `--primario` claro `#7c5cff` y `--logro` `#ffb627` para acentos, textos `#f4f6fb`. Minimizar `--foreground` sobre UI oscura saturada.
- **Las superficies claras del screenshot como fuentes de luz:** si la captura (clara, crema) convive con fondo oscuro, tratar el screenshot como un foco: halo radial suave del color de su superficie (`#fdfbf7` al 8–12%) alrededor del marco, + glow del color del mundo detrás. Esto "explica" por qué hay una zona clara.
- **Bordes y glow para no perder el screenshot:** todo screenshot en eje oscuro lleva borde y glow: `border 1px color-mix(in oklab, <hexMundo> 60%, var(--border))` + `box-shadow 0 0 24px color-mix(in oklab, <hexMundo> 30%, transparent), 0 24px 48px rgba(0,0,0,.5)`. El borde/glow del color del mundo lo "saca" del fondo negro.
- **Scrims oscuros:** overlay `#090c14` con opacidad 55–75% en la zona de texto; nunca al 100% (se pierde el screenshot).
- **Un solo eje por pieza:** si el screenshot protagonista es oscuro, toda la pieza es oscura; si es claro, toda la pieza clara.

---

## 10. Sistema de badges / marcos / etiquetas publicitarias Prodigia

> Kit gráfico reutilizable. Todos usan tokens y tipografía reales.

| Elemento | Spec | Uso |
|---|---|---|
| **Badge RANKED** | Pill `rounded-full`, bg `--surface-2`, borde `--border`, texto Space Grotesk 600 uppercase + `IconRango` en `--racha` | Piezas de rankeds/duelos |
| **Sello de mundo** | Cuadrado `rounded-xl` con degradé de mundo (WorldCard:64), ícono blanco del mundo | Marcar "mundo protagonista" |
| **Chip duelo 1v1** | Pill `rounded-full` bg `--surface`, borde `--primario/40`, texto Space Grotesk + icono `IconEscudo` | Piezas de multiplayer |
| **Cinta de descriptor** | Banda horizontal `bg --surface` `border-y --border`, texto Inter caption → pool: "10 preguntas · 60 seg", "2 gratis para siempre", "fair play" | frame inferior de pieza |
| **Sello Prodigio (tope)** | Texto "Prodigio" con degradé `#A794FF→#FFC53D` (RangoBadge:34) + `IconRango` | payoff aspiracional, cierre |
| **Badge reto del día** | Pill con `--logro` al 15% + `--logro` texto | Piezas de reto diario/semanal |

Anti-patrones de badges: NO cliparts genéricos de trofeos/estrellas; SIEMPRE `IconRango`/`IconEscudo` reales, y el número de rango/progreso en JetBrains Mono.

---

## 11. Especificación mínima para producir 10 piezas (receta para el generador)

> Pasos reproducible para un generador de assets por código. Salida: 10 piezas estándar (3 post 1:1, 3 story 9:16, 2 banner 16:9, 2 thumbnail).

### Paso 0 — Setup
1. Cargar tokens: paleta claro/oscuro (sec. 2.1), colores de 8 mundos (2.2), rangos (2.4), gradientes (2.5).
2. Cargar fuentes: Space Grotesk 700/600, Inter 400/500/600, JetBrains Mono 600/700.
3. Cargar SVGs reales: `Logo.tsx` (aro+chispa), `icons.tsx` (íconos mundo + IconRango/IconEscudo), `FondoMundo.tsx` (glifos).
4. Directorio de entrada de screenshots: `docs/marketing/assets/pantallas-reales/*.png`.

### Paso 1 — Elegir por pieza (parámetro único)
Para CADA pieza definís: `{ mundo:"numeria", axis:"oscuro"|"claro", formato:"1:1"|"9:16"|"16:9"|"thumb", screenshot:"23-demo-numeria-sprint.png", headline:"…", numero1:"10", numero2:"60", concepto:"sprint"|"mundos"|"ranking"|"reto"|"ranked"|"economia" }`.

### Paso 2 — Construcción base (orden fijo)
1. **Lienzo:** `1080×1080` (1:1), `1080×1920` (9:16), `1920×1080` (16:9), `1280×720` (thumb).
2. **Fondo:** `--background` del axis + degradé de mundo al 15–25% blanco (sec. 7) + 2 orbes de luz + ruido 3% + glifos de mundo a 0.04.
3. **Screenshot:** recortar a la proporción del formato; aplicar `rounded-2xl`/`rounded-3xl`, máscara de borde del mundo al 50%, y (si oscuro) glow+borde (sec. 9).
4. **Buzón/scrim:** reservar zona de texto en `--surface` con `--border`, o scrim sobre full-bleed.
5. **Texto:** headline Space Grotesk 700 (tracking tight) con hasta 1 palabra en color mundo; números SIEMPRE JetBrains Mono; body Inter; caption Inter.
6. **Badge:** aplicar el badge del concepto (sec. 10).
7. **Lockup:** `Logo` (aro+chispa) + "Prodigia" abajo + CTA pill `--primario` "Entrá →".

### Paso 3 — Recetas por concepto (10 piezas)
| # | Concepto | Mundo | Axis | Screenshot base | Extra |
|---|---|---|---|---|---|
| 1 | Sprint (post 1:1) | Numeria | oscuro | `23-demo-numeria-sprint.png` | zoom al `5+6`, cinta "10 preguntas · 60 seg" |
| 2 | 8 mundos (post 1:1) | — (multi) | claro | `03-landing-hero-8-ciudades.png` | full-bleed, badge "8 MUNDOS" |
| 3 | Reto del día (post 1:1) | — | claro | `12-reto-diario.png` | badge reto, cinta "5 preguntas, las mismas para todos" |
| 4 | Ranking (story 9:16) | — | claro | `11-ranking-semanal.png` | podio 🥇, cinta "tu ranking de la semana" |
| 5 | Pentagrama (story 9:16) | Melodía | claro | `19-melodia-home-pentagrama.png` | zoom clave de sol dorada |
| 6 | Mapa (story 9:16) | Geografía | claro | `29-demo-geografia-mapa.png` | badge sello mundo |
| 7 | Duelo 1v1 (banner 16:9) | — | oscuro | `23` (sprint) + dots rival | chip "duelo 1v1", fantasma 👻 |
| 8 | Rankeds (banner 16:9) | — | oscuro | `15-invitado-bloqueado-rankeds.png` | badge RANKED + sello Prodigio |
| 9 | Thumb "Adaptativa" | Numeria | oscuro | `23` | número-faro "NIVEL +1", confeti en logro |
| 10 | Thumb "Mundo libre" | — | claro | `17-mundo-bloqueado-3000-chispas.png` | 2 gratis para siempre, candado |

### Paso 4 — QA automático (puertas)
- Solo hex de tokens (sec. 2). No hay color fuera de paleta.
- Números en JetBrains Mono, títulos en Space Grotesk. Pasa fallback de fuente.
- Un solo axis por pieza. Un mundo protagonista.
- Zona segura respetada; headline fuera del área de UI de la captura.
- Logo = SVG real (aro+chispa), no redibujado.
- Sin fotos de stock, sin texturas externas.
- Cada pieza referencia su `archivo:línea` del código en metadata (traza).
- Formato correcto y proporción exacta del screenshot.

---

## 12. Resumen de decisiones de dirección (TL;DR)
1. **La pieza siempre muestra el juego real** (capturas), nunca ilustración ajena. Hero absoluto: el sprint `5 + 6`.
2. **Un mundo protagonista por pieza** con su degradé (WorldCard.tsx:64) y su glifo; los 8 mundos solo en el "muro de ciudades".
3. **El aro+chispa es el único símbolo**; no se inventa mascota, no se imita Duolingo/Duo.
4. **Dos ejes excluyentes** (claro crema / oscuro nocturno) con reglas de contraste y glow propias (sec. 9).
5. **Mismo sistema visual en toda la flota** (paleta, tipografía, badges, lockup); cambia solo mundo/gancho.
6. **Números en JetBrains Mono, títulos Space Grotesk**, todo con happy-path de legibilidad (scrims/buzones).
