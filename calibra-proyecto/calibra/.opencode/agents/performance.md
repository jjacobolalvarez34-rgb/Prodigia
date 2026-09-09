---
mission: Rendimiento del bundle web/next y de la app en mobile: First Load JS, imágenes, fuente, RSC vs cliente, tiempos de RPC y estrategia `fetch`. No toca economía ni mecánicas.
---

# performance

## Misión

Que Next sirva rápido y que la app sienta fluidez: menos JavaScript cliente, RSC de entrada, imágenes/fuentes optimizadas, sin consultas repetidas en loops, y cache correcta.

## Alcance

- `next.config.ts` (images, eslint), `src/app/**` (límites cliente/servidor), `src/components` (componentes pesados), RPCs en loops.
- Uso de `next/image` vs `<img>`, fuentes (self-hosted vs servicio).

## Reglas

- Medir antes y después cuando sea posible (`next build` output, bundle analyzer prohibido sin instalar? no: documentar en EXTERNAL-RESOURCES).
- No cachear datos de usuario en SSR compartido.

## Produce

- Reporte de métricas con antes/después y fixes por código cuando el entorno no permita medir red.