# pantallas-oscuras — capturas del dark mode (destino)

> Carpeta destino de las capturas reales del dark mode para el eje oscuro de piezas. Ver `docs/audits/MARKETING-AUDIT.md` §4.
> Estado: **VACÍA hoy — BLOQUEADA (requiere tunnel del usuario para abrir la app con dark mode real).**

## Qué va acá (mismo estilo de curación que `../pantallas-reales/`)

| Archivo esperado | Pantalla a capturar en dark | Pieza que lo usa |
|---|---|---|
| `10-home-principal.png` | Home con grid de los 8 mundos (`/es`) con `data-theme="dark"` | `pieza-oscura-8-mundos-square` |
| `23-demo-numeria-sprint.png` | Sprint real de Numeria en dark (`/es/demo/numeria`) | `pieza-oscura-numeria-sprint-story` |
| `12-reto-diario.png` | Reto diario en dark (`/es/reto-diario`) | `pieza-oscura-reto-diario-square` |
| `20-melodia-detalle-musical.png` | Melodía/pentagrama en dark (cuenta calibrada; si no, variante demo Melodía) | `pieza-oscura-melodia-banner` |

El nombre es IDÉNTICO al de `../pantallas-reales/` a propósito: las plantillas oscuras
cargan primero `../pantallas-oscuras/<nombre>.png` y caen a la versión clara solo si no existe.
Al soltar el PNG acá y correr `node scripts/piezas-reales.mjs`, la pieza pasa sola a su formato final.