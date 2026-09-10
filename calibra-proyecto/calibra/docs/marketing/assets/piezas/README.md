# PIEZAS-REALES — Piezas publicitarias renderizadas

> Generadas 2026-09-09 con Playwright (chromium headless) sobre las capturas reales de `../pantallas-reales/` — sin dev server, vía `file://`.

## Piezas

| Archivo (HTML → PNG) | Formato | Eje | Captura real usada | Concepto |
|---|---|---|---|---|
| `pieza-luz-8-mundos-square` | 1:1 (1080×1080) | claro (crema `#fdfbf7`) | `10-home-principal.png` | "8 mundos. Una sola cabeza. Sin límite." |
| `pieza-luz-numeria-sprint-square` | 1:1 (1080×1080) | claro | `23-demo-numeria-sprint.png` | "60 segundos. La cabeza hace el resto." |
| `pieza-luz-reto-diario-square` | 1:1 (1080×1080) | claro | `12-reto-diario.png` | "El reto arranca mañana. ¿Llegás?" |
| `pieza-luz-melodia-banner` | 16:9-ish (1200×630) | claro | `20-melodia-detalle-musical.png` | "La cabeza también tiene oído." |

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

**Para destrabar:** el usuario captura el dark mode real con su tunnel, deja los PNG en `docs/marketing/assets/pantallas-oscuras/` (ver su README) y corre `node scripts/piezas-reales.mjs` — el swap a la captura dark es automático, sin editar HTML.

## Notas

- Los render con fallback de fuente pueden diferir levemente de la tipografía exacta de la marca si Space Grotesk / JetBrains Mono no están instaladas en el sistema donde se corre el script.
- Los `*.html` son editables directamente (CSS inline) — el PNG es solo el render.