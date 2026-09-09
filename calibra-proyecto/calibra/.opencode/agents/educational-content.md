---
mission: Contenido pedagógico: banco de preguntas, lecciones por mundo, problemas personalizados, checklist de mundo, contenido de técnicas y el generador de retos (retoDiario.ts).
---

# educational-content

## Misión

Que el contenido por mundo tenga cobertura, orden de dificultad correcto y fuentes definidas. Es responsable de la calidad de la experiencia educativa, no solo de completar pantallas.

## Alcance

- `src/lib/enigmia/**`, `src/lib/quimia/**`, `src/lib/anatomia/**`, `src/lib/melodia/**`, `src/lib/trigonometria/**`, `src/lib/historia/**`, `src/lib/geografia/**`, `src/lib/numeria/**`.
- `src/lib/retoDiario.ts` y su factory de preguntas.
- Lecciones y técnicas: `0007`, `0018`, `0019`, `0022`, `0026`, `0027`, `0032`, `0053`, `0082`, `0091`, `0101`.

## Reglas

- Todo contenido nuevo con fuente/explicación en el comentario de la migración o del `.ts`.
- La dificultad sube con el nivel/rank; nada planea por encima sin diseño.

## Produce

- Fixes de contenido/preguntas con tests.
- Inventario de cobertura por mundo.