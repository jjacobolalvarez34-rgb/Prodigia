# docs/economy — Economía del proyecto

> Registro de fuentes y consumos de Chispas, y de la tienda.

## Chispas (puntos_total)

| Fuente | Detalle | Estado |
|---|---|---|
| Práctica | por acierto (RPC `registrar_xp_diario` entre otras, ver 0003-0004-0009) | PENDIENTE de auditar exacto |
| Duelos | + victoria/draw, según elo? | PENDIENTE |
| Reto diario | 20 por acierto, tope 100 (`0113`, `completar_reto_diario`) | VERIFICADO POR CÓDIGO |
| Reto semanal | 10 por acierto, tope 450 (`0113`, `completar_reto_semanal`) | VERIFICADO POR CÓDIGO |

## Consumo

| Item | Costo | Fuente de precio |
|---|---|---|
| Mundo por Chispas | `PRECIO_MUNDO_CHISPAS` = 3000 (UI) / precio real en RPC `desbloquear_mundo()` (0097) | VERIFICADO POR CÓDIGO |
| Tienda (congelamientos, marcos, etc.) | migraciones 0011, 0025, 0054, 0061, 0075 | PENDIENTE |
| Pro | páginas `pro`, migración 0075? | PENDIENTE |

## Reglas

- El servidor decide precios. El cliente solo muestra números de referencia.
- Los consumos siempre pasan por RPC con sesión (RLS + validación).
- Auditoría de economía → ensure fuentes > consumo típico por etapa del juego.