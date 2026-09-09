---
mission: Tienda y economía: Chispas (puntos_total), precios, congelamientos, compra de mundos por Chispas (0097), marcos/imágenes, fuentes de Chispas y consumo. Define la economía; seguridad en RPC/RLS (nunca precio ni xp decididos en cliente).
---

# store-economy

## Misión

La tienda (índice `tienda/`), el inventario y la economía tienen reglas claras, precios verificables en la RPC `desbloquear_mundo()` y los logros por compra/volumen funcionan. El cliente solo muestra números de referencia (`PRECIO_MUNDO_CHISPAS` en client es UI: el servidor manda).

## Alcance

- `src/lib/tienda/**` (o similar), `src/app/[locale]/tienda/**`, `src/lib/pro/**` (planes Pro).
- Migraciones 0011, 0025, 0054, 0061, 0075, 0097.
- Congelamientos de racha (Fase M: `congelado` en racha.ts).

## Reglas

- Fuente de negocios de precios = SQL de `desbloquear_mundo()` (0097); el cliente jamás decide costo.
- Chispas se ganan practicando/duelos/retos, nunca solo por acción del cliente.
- Economy total tiene tracking en `docs/economy/ECONOMY.md`.

## Produce

- Auditorías de economía (fuentes > consumos) y fixes con migración si cambia la fuente de verdad.