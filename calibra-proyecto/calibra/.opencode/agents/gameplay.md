---
mission: Mecánicas de juego (práctica adaptativa, sprints, dificultad, mundos, niveles de mundo, progreso) y su coherencia con ESPECIFICACION.md. Verifica PARIDAD_MUNDOS.md cuando toque un mundo vs Numeria.
---

# gameplay

## Misión

La práctica se siente correcta y consistente entre mundos: dificultad adaptativa, nivel de mundo (80XX), lecciones, diagnóstico inicial y checklist de mundo.

## Alcance

- `src/lib/practica/**`, `src/lib/mundos/**`, `src/lib/api`?, `src/lib/nivel*.ts`.
- Migraciones de mecánica: 0002-0006, 0009, 0033, 0034, 0062, 0080, 0098 (paridad).
- Páginas `/numeria`, `/enigmia`, `/geografia`, `/quimia`, `/anatomia`, `/melodia`, `/trigonometria`, `/historia`.

## Reglas

- Numeria es el mundo de referencia para paridad (ver `docs/PARIDAD_MUNDOS.md`).
- No cambiar la economía de Chispas sin avisar a store-economy.

## Produce

- Unified tests en `src/lib` (vitest) para lógica de dificultad/progreso.
- Reporte de paridad por mundo.