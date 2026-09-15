# PIEZAS-REALES — Piezas publicitarias renderizadas

> Generadas 2026-09-09 (lote claro) y 2026-09-14 (stories/carruseles/plantillas/edits) con Playwright (chromium headless) sobre las capturas reales de `../pantallas-reales/` y `../pantallas-oscuras/` — sin dev server, vía `file://`.

## Piezas

| Archivo (HTML → PNG) | Formato | Eje | Captura real usada | Concepto |
|---|---|---|---|---|
| `pieza-luz-8-mundos-square` | 1:1 (1080×1080) | claro (crema `#fdfbf7`) | `10-home-principal.png` | "8 mundos. Una sola cabeza. Sin límite." |
| `pieza-luz-numeria-sprint-square` | 1:1 (1080×1080) | claro | `23-demo-numeria-sprint.png` | "60 segundos. La cabeza hace el resto." |
| `pieza-luz-reto-diario-square` | 1:1 (1080×1080) | claro | `12-reto-diario.png` | "El reto arranca mañana. ¿Llegás?" |
| `pieza-luz-melodia-banner` | 16:9-ish (1200×630) | claro | `20-melodia-detalle-musical.png` | "La cabeza también tiene oído." |
| `pieza-luz-hero-8-ciudades-banner` | 16:9-ish (1200×630) | claro | `03-landing-hero-8-ciudades.png` | "Entrená tu cabeza jugando. Sin crear cuenta." |
| `pieza-luz-mecanismo-60s-banner` | 16:9-ish (1200×630) | claro | `04-landing-mecanismo-60s.png` | "10 preguntas. 60 segundos." (racha + tiempo · rapidez + XP) |
| `pieza-luz-ranking-podio-square` | 1:1 (1080×1080) | claro | `11-ranking-semanal.png` | "Todos arrancan igual. El ranking del día." |
| `pieza-luz-diagnostico-sin-presion-square` | 1:1 (1080×1080) | claro | `08-diagnostico-numeria-sin-presion.png` | "Veamos dónde estás. Sin presión: no afecta tu racha." |
| `pieza-luz-geografia-mapa-square` | 1:1 (1080×1080) | claro | `29-demo-geografia-mapa.png` | "¿Dónde está? Tocá el mapa y te marca el check." |
| `pieza-luz-anatomia-huesos-square` | 1:1 (1080×1080) | claro | `28-demo-anatomia-huesos.png` | "Te calo y te responde. FÉMUR ✓" |
| `pieza-luz-dos-ciudades-gratis-square` | 1:1 (1080×1080) | claro | `06-onboarding-elegir-2-mundos.png` | "2 ciudades gratis. Para siempre." |

## Stories 9:16 · carruseles · plantillas · edits (2026-09-14)

Verificación de contenido anclada a las capturas reales (features BLOQUEADAS no se simulan).

| Archivo (HTML → PNG) | Formato | Capturas reales usadas | Concepto |
|---|---|---|---|
| `pieza-luz-musculo-story` | 9:16 (1080×1920) | `23-demo-numeria-sprint.png` | "La cabeza también es un músculo." |
| `pieza-luz-8-mundos-story` | 9:16 (1080×1920) | `10-home-principal.png` | 8 mundos + grid de identidad. |
| `pieza-luz-mecanismo-60s-story` | 9:16 (1080×1920) | `04-landing-mecanismo-60s.png` + `08` | 10 preguntas · 60 segundos · sin presión |
| `pieza-luz-mapa-mundo-story` | 9:16 (1080×1920) | `29-demo-geografia-mapa.png` + `28` | Mapa + anatomía ("el mundo… y tu cuerpo"). |
| `pieza-luz-carrusel-adaptativa-1-story` | 9:16 | `23-demo-numeria-sprint.png` | Slide 1/3 "Arrancás en tu nivel" (LevelDial NIVEL 3). |
| `pieza-luz-carrusel-adaptativa-2-story` | 9:16 | `23` | Slide 2/3 "3 seguidas y subís" (NIVEL 4). |
| `pieza-luz-carrusel-adaptativa-3-story` | 9:16 | `23` | Slide 3/3 "Fallaste? No pasa nada" (sin daño). |
| `pieza-luz-carrusel-mundo-1-story` | 9:16 | `23` | "¿Qué hay en el mundo? · Numeria" 1/4. |
| `pieza-luz-carrusel-mundo-2-story` | 9:16 | `24-demo-melodia-figuras.png` | "Un pentagrama en tu app" 2/4. |
| `pieza-luz-carrusel-mundo-3-story` | 9:16 | `28-demo-anatomia-huesos.png` + `29-demo-geografia-mapa.png` | "Huesos y mapas reales" 3/4. |
| `pieza-luz-carrusel-mundo-4-story` | 9:16 | `26-demo-quimia-elementos.png` | "Moléculas y elementos" 4/4. |
| `pieza-luz-edit-viral-musculo-story` | 9:16 | `23` | Edit viral text-heavy (glifos + − ÷ ×). |
| `pieza-luz-edit-viral-pentagrama-story` | 9:16 | `24` | Edit viral "Oído absoluto" (glifos ♪♫♩). |
| `plantilla-recurrente-ranking-story` | 9:16 | `11-ranking-semanal.png` | PLANTILLA semanal ranking (slots `[EDITAR]`). |
| `plantilla-recurrente-reto-story` | 9:16 | `12-reto-diario.png` | PLANTILLA diaria reto (slots `[EDITAR]`). |

## Re-renderizar

```
node scripts/piezas-reales.mjs
```

El script abre cada `*.html` de esta carpeta, detecta el formato por nombre (`square`/`story`/`banner`) y guarda el PNG al lado. Formatos soportados: `square` 1080×1080 · `story` 1080×1920 · `banner` 1200×630.

## Reglas cumplidas (VISUAL-ASSETS.md)

- Un eje por pieza (claro crema o nocturno `#090c14`), tipografía Space Grotesk / JetBrains Mono (fallbacks del sistema si no están instaladas — revisar en render real), píldoras `rounded-full`, gradientes violeta→dorado en CTAs, números en mono, spark 4-puntas en la marca.
- Capturas reales embebidas sin recortes de grid (la identidad de 8 colores se respeta en `8-mundos`).

## Eje oscuro (BLOQUEADO solo en captura)

Desde 2026-09-09 existen las 4 plantillas `pieza-oscura-*` (HTML+PNG de preview) usando los tokens dark REALES de la app (`src/app/globals.css:47-56`: fondo `#090c14`, surface `#12172a`, borde `#232b47`, primario `#7c5cff`, texto `#f4f6fb`/`#8892b0`). Cada una carga primero su captura de `../pantallas-oscuras/<nombre>.png` y, mientras esa no exista, usa la versión CLARA real como foco de luz (regla `DIRECCION-ARTISTICA.md` sección 9) — por eso el preview renderiza bien hoy.

| Archivo (HTML → PNG) | Formato | Eje | Captura FINAL (dark) | Concepto |
|---|---|---|---|---|
| `pieza-oscura-8-mundos-square` | 1:1 (1080×1080) | oscuro `#090c14` | `../pantallas-oscuras/10-home-principal.png` | "8 mundos. Una sola cabeza. Sin límite." |
| `pieza-oscura-numeria-sprint-story` | 9:16 (1080×1920) | oscuro | `../pantallas-oscuras/23-demo-numeria-sprint.png` | "60 segundos. La cabeza hace el resto." |
| `pieza-oscura-reto-diario-square` | 1:1 (1080×1080) | oscuro | `../pantallas-oscuras/12-reto-diario.png` | "El reto arranca mañana. ¿Llegás?" |
| `pieza-oscura-melodia-banner` | 16:9-ish (1200×630) | oscuro | `../pantallas-oscuras/20-melodia-detalle-musical.png` | "La cabeza también tiene oído." |
| `pieza-oscura-ranking-podio-square` | 1:1 (1080×1080) | oscuro | `../pantallas-oscuras/11-ranking-semanal.png` | "Todos arrancan igual. El ranking del día." |
| `pieza-oscura-geografia-mapa-square` | 1:1 (1080×1080) | oscuro | `../pantallas-oscuras/29-demo-geografia-mapa.png` | "¿Dónde está? Tocá el mapa y te marca el check." |
| `pieza-oscura-anatomia-huesos-square` | 1:1 (1080×1080) | oscuro | `../pantallas-oscuras/28-demo-anatomia-huesos.png` | "Te calo y te responde. FÉMUR ✓" |
| `pieza-oscura-dos-ciudades-gratis-square` | 1:1 (1080×1080) | oscuro | `../pantallas-oscuras/06-onboarding-elegir-2-mundos.png` ✅ real | "2 ciudades gratis. Para siempre." |
| `pieza-oscura-reto-diario-story` | 9:16 (1080×1920) | oscuro | `../pantallas-oscuras/12-reto-diario.png` ✅ real | "El reto arranca mañana. ¿Llegás?" |

> ✅ real = captura FINAL dark ya existe en `pantallas-oscuras/` (swap automático confirmado en el render 2026-09-14).

## Plantillas "Problema de la Semana" (tipográficas, sin capturas · 2026-09-14)

Loop semanal reutilizable: **Lun problema → Mar respuesta**, en feed y historia, con variante nocturna. 100% tipografía + grilla de opciones (sin screenshots) — solo editar slots `[EDITAR]`.

| Archivo (HTML → PNG) | Formato | Uso |
|---|---|---|
| `plantilla-semanal-problema-square` | 1:1 (1080×1080) | Feed: problema + 4 opciones A-D (una marcada ✓ = correcta). |
| `plantilla-semanal-problema-story` | 9:16 (1080×1920) | Historia: problema + opciones grandes + hueco marcado para sticker de ENCUESTA. |
| `plantilla-semanal-problema-oscura-square` | 1:1 | Ídem feed en modo nocturno (tokens dark reales). |
| `plantilla-semanal-problema-oscura-story` | 9:16 | Ídem historia en modo nocturno. |
| `plantilla-semanal-respuesta-square` | 1:1 | Feed del día siguiente: opción correcta + explicación "Por qué". |
| `plantilla-semanal-respuesta-story` | 9:16 | Historia cierre: respuesta + hueco para sticker de link/CTA. |

La opción correcta en feed va con la clase `correcta` (borde + ✓ verde) — ignorar en la publicación del Lunes y quitar el `<span class="ok">` si se prefiere sin spoiler.

## Plantillas de contenido de marca (tipográficas, sin capturas · 2026-09-14)

Usar en los días sin problema ni respuesta (ej. Mié/Jue/Vie). 100% tipografía, espaciado y slots `[EDITAR]`.

### Dato curioso ("Lo que aprendés jugando")

Número gigante mono + hecho breve de uno de los mundos reales (números, música, química, anatomía, geografía — NO inventar).

| Archivo | Formato | Notas |
|---|---|---|
| `plantilla-dato-curioso-square` | 1:1 | Badge del mundo, dato-fuerte gigante con gradiente, regla real "Seguí jugando y va pegando solo". |
| `plantilla-dato-curioso-story` | 9:16 | Vertical + hueco para sticker. |
| `plantilla-dato-curioso-oscura-square` | 1:1 | Versión nocturna (tokens dark). |

### Meme educativo

Formato meme (texto arriba → problema al centro → remate abajo), sin fotos. Chiste propio, pero el problema central debe ser real (sacado de un nivel).

| Archivo | Formato |
|---|---|
| `plantilla-meme-matematico-square` | 1:1 |
| `plantilla-meme-matematico-story` | 9:16 (+ hueco sticker) |

### Motivación semanal

Claim real de la app: *"Entrená tu cabeza como si fuera un músculo"* (REAL-APP-2026-09-08). Reutilizar los domingos o lunes por la mañana.

| Archivo | Formato |
|---|---|
| `plantilla-motivacion-semana-square` | 1:1 |
| `plantilla-motivacion-semana-story` | 9:16 (+ hueco sticker) |

### 1 minuto cada mañana (hábito)

Número gigante `1'` + "cada mañana · 5 preguntas". Anclado al reto diario real (features: rachas, ranking del día). Ideal para lunes temprano o stories repetitivas.

| Archivo | Formato |
|---|---|
| `plantilla-minuto-cada-manana-square` | 1:1 |
| `plantilla-minuto-cada-manana-story` | 9:16 (+ hueco para encuesta "¿A qué hora jugás?") |

## Re-renderizar

**Para destrabar:** el usuario captura el dark mode real con su tunnel, deja los PNG en `docs/marketing/assets/pantallas-oscuras/` (ver su README) y corre `node scripts/piezas-reales.mjs` — el swap a la captura dark es automático, sin editar HTML.

## Lote nuevo 2026-09-14 — Trastienda · Reto semanal · Rangos ELO · Mundos (eje claro y oscuro)

> Español latinoamericano NEUTRO (tuteo: "Empieza", "Juega", "Entra") — alineado con `docs/marketing/VOZ-TONO.md`. Verificado por color promedio: piezas claras ≈ crema `[247-249,...]`, oscuras ≈ nocturno `[14-19,...]` (scripts/analizar-color-piezas.mjs).

### Eje claro

| Archivo (HTML → PNG) | Formato | Captura real usada | Concepto |
|---|---|---|---|
| `pieza-luz-trastienda-ruleta-square` | 1:1 | `31-trastienda-ruleta.png` | Trastienda: "Juégate algo más que la partida." |
| `pieza-luz-trastienda-ruleta-story` | 9:16 | `31-trastienda-ruleta.png` | "Ruleta. Doble o nada. Tu suerte." (20 giros/día · x2) |
| `pieza-luz-reto-semanal-square` | 1:1 | `32-reto-semanal.png` | Reto semanal: "El mismo examen, el mismo día, para todo el mundo." (45 preguntas) |
| `pieza-luz-reto-semanal-story` | 9:16 | `32-reto-semanal.png` | "Una semana. Tu nombre en el ranking." (10 Chispas/acierto) |
| `pieza-luz-rangos-square` | 1:1 | tipográfica (grid 6 rangos ELO) | "Del Bronce al Prodigio." (desbloqueo nivel 5) |
| `pieza-luz-duelo-fantasma-story` | 9:16 | `10-home-principal.png` | Duelos asíncronos: "Su fantasma te espera." |
| `pieza-luz-quimia-elementos-square` | 1:1 | `26-demo-quimia-elementos.png` | Mundo Químia: "Arma la molécula antes de que se acabe el tiempo." |
| `pieza-luz-enigmia-logica-square` | 1:1 | `25-demo-enigmia-logica.png` | Mundo Enigmia: "Lógica que enciende el cerebro." |
| `pieza-luz-trigonometria-square` | 1:1 | `30-demo-trigonometria-triangulo.png` | Mundo Trigonometría: "La trigonometría también se juega." |
| `pieza-luz-historia-cronologia-square` | 1:1 | `27-demo-historia-cronologia.png` | Mundo Historia: "Ordena la historia y gana el contexto." |
| `pieza-luz-melodia-detalle-square` | 1:1 | `20-melodia-detalle-musical.png` | Mundo Melodía: "La cabeza también tiene oído." |
| `pieza-luz-60s-sprint-story` | 9:16 | `23-demo-numeria-sprint.png` | "El reloj no espera. Tú puedes entrenar." (racha +14 · precisión 96%) |
| `pieza-luz-carrusel-trastienda-1-story` | 9:16 | panel tipográfico | Carrusel Trastienda 1/3: "La trivia tiene su salón." (20/día) |
| `pieza-luz-carrusel-trastienda-2-story` | 9:16 | panel tipográfico | 2/3: "Acierta y dobla." (x2) |
| `pieza-luz-carrusel-trastienda-3-story` | 9:16 | panel tipográfico | 3/3: "Apuesta a la tabla." (ELO) |
| `pieza-luz-carrusel-rangos-1-story` | 9:16 | `11-ranking-semanal.png` | Carrusel Rangos 1/3: "6 rangos para tu nivel real." |
| `pieza-luz-carrusel-rangos-2-story` | 9:16 | panel tipográfico | 2/3: "Nivel 5" (desbloqueo de rankeds) |
| `pieza-luz-carrusel-rangos-3-story` | 9:16 | panel tipográfico | 3/3: "ELO" (casual no afecta tu rango) |

### Eje oscuro (capturas dark reales con fallback a claras)

| Archivo (HTML → PNG) | Formato | Captura dark | Concepto |
|---|---|---|---|
| `pieza-oscura-trastienda-ruleta-story` | 9:16 | `31-trastienda-ruleta.png` ✅ | "Ruleta. Doble o nada. Tu suerte." |
| `pieza-oscura-reto-semanal-square` | 1:1 | `32-reto-semanal.png` ✅ | "El mismo examen, el mismo día, para todo el mundo." |
| `pieza-oscura-rangos-square` | 1:1 | tipográfica | Grid 6 rangos ELO en modo nocturno. |
| `pieza-oscura-quimia-elementos-square` | 1:1 | `26-demo-quimia-elementos.png` ✅ | Mundo Químia nocturno. |
| `pieza-oscura-enigmia-logica-square` | 1:1 | `25-demo-enigmia-logica.png` ✅ | Mundo Enigmia nocturno. |
| `pieza-oscura-trigonometria-square` | 1:1 | `30-demo-trigonometria-triangulo.png` ✅ | Mundo Trigonometría nocturno. |
| `pieza-oscura-historia-cronologia-square` | 1:1 | `27-demo-historia-cronologia.png` ✅ | Mundo Historia nocturno. |
| `pieza-oscura-melodia-detalle-square` | 1:1 | `20-melodia-detalle-musical.png` ✅ | Mundo Melodía nocturno. |
| `pieza-oscura-duelo-fantasma-story` | 9:16 | `10-home-principal.png` ✅ | Duelos asíncronos nocturno. |
| `pieza-oscura-60s-sprint-story` | 9:16 | `23-demo-numeria-sprint.png` ✅ | "El reloj no espera." nocturno. |
| `pieza-oscura-carrusel-trastienda-1-story` | 9:16 | panel tipográfico | 1/3 nocturno. |
| `pieza-oscura-carrusel-trastienda-2-story` | 9:16 | panel tipográfico | 2/3 nocturno. |
| `pieza-oscura-carrusel-trastienda-3-story` | 9:16 | panel tipográfico | 3/3 nocturno. |

> ✅ = captura dark FINAL ya existe (re-render 2026-09-14 confirmado, swap automático).

## Notas

- Los render con fallback de fuente pueden diferir levemente de la tipografía exacta de la marca si Space Grotesk / JetBrains Mono no están instaladas en el sistema donde se corre el script.
- Los `*.html` son editables directamente (CSS inline) — el PNG es solo el render.
- Las piezas PREVIAS al lote nuevo mantienen el voseo rioplatense original ("Empezá", "Tocá", "Entrená") — legacy de cuando la app usaba voseo. El lote nuevo usa tuteo neutro (VOZ-TONO.md). Actualización pendiente de las viejas si se decide normalizar (ver PRODUCTION-REPORT.md).