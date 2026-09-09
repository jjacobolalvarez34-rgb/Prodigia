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

- Un eje por pieza (claro crema), tipografía Space Grotesk / JetBrains Mono (fallbacks del sistema si no están instaladas — revisar en render real), píldoras `rounded-full`, gradientes violeta→dorado en CTAs, números en mono, spark 4-puntas en la marca.
- Capturas reales embebidas sin recortes de grid (la identidad de 8 colores se respeta en `8-mundos`).

## Bloqueado: eje oscuro

El eje claro es una composición de capturas reales que sí existen. El eje **nocturno** propuesto en el plan (fondo `#090c14` + capturas del app en dark mode) queda `BLOQUEADO`: no hay capturas del dark mode real (requiere el app corriendo / tunnel del usuario). Pendientes de producir en cuanto existan capturas dark:

- `pieza-oscura-8-mundos-square`
- `pieza-oscura-numeria-sprint-story` (story 1080×1920)

## Notas

- Los render con fallback de fuente pueden diferir levemente de la tipografía exacta de la marca si Space Grotesk / JetBrains Mono no están instaladas en el sistema donde se corre el script.
- Los `*.html` son editables directamente (CSS inline) — el PNG es solo el render.