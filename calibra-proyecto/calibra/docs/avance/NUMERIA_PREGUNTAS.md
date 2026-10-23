# Avance: variedad de preguntas de Numeria (2026-10-23) — TERMINADO

Encargo: «decimales · convertir» repetía la misma pregunta (~30 veces) y la dificultad no se notaba;
revisar la variedad de todos los modos de Numeria con un test, y dejar el plan de auditoría de los 15 mundos
en `docs/AUDITORIA_PREGUNTAS.md`. Sin commits (los hace la sesión principal).

## Causa encontrada

`src/lib/practica/decimales.ts`, `generarConvertir`: el denominador salía de una tabla por banda
(`[2, 4, 5, 10, 20][banda]`) y el numerador de `randomInt(1, den - 1)`. En nivel 1-2 eso es
`den = 2`, `num = randomInt(1, 1) = 1`: **siempre «Convierte 1/2 a decimal»** (1 pregunta posible;
3 en nivel 3-4, 4 en 5-6). El deduplicador de partida (`generarSinRepetir`, 20 intentos) no puede
evitar repetir si solo existe una pregunta. Además «porcentaje» usaba una base fija por banda
(20 preguntas por nivel) con redondeos no declarados, y «redondear» tenía un error de coma flotante
(12,105 a 2 decimales daba 12,1).

## Hecho

- [x] `src/lib/practica/variedad.ts` (nuevo): medición de variedad con semillas, solapamiento 1↔10 y «meseta».
- [x] `src/lib/practica/variedadNumeria.test.ts` (nuevo): 20 modos × 10 niveles con umbrales (≥ 30 distintas; potencias 16, raíces 14; solapamiento ≤ 50 %; meseta < 50 %).
- [x] `src/lib/practica/variedadMundos.test.ts` (nuevo): reporte de los 13 adaptadores + Geografía (sin umbrales).
- [x] `src/lib/practica/decimales.ts` reescrito + `decimales.test.ts` (nuevo, recalcula la respuesta desde cada enunciado).
- [x] `src/lib/practica/problems.ts`: banda 0 de multiplicación/división 2..9 × 2..5.
- [x] `src/lib/practica/fracciones.ts`: denominadores y factores por banda.
- [x] `src/lib/practica/geometria.ts`: formas por banda, sin mesetas, triángulos válidos, respuestas enteras.
- [x] `src/lib/practica/potencias.ts` (+ `potencias.test.ts` ajustado): pares con mínimo por banda, más raíces, notación nueva.
- [x] `docs/AUDITORIA_PREGUNTAS.md`: plan + tabla antes/después de Numeria + primera medición de los otros mundos.
- [x] Verificación: calibra `npx tsc --noEmit -p .` limpio (sin literales BigInt), eslint limpio en lo tocado, `npx vitest run src/lib/practica` en verde; mobile `npx tsc --noEmit -p .` limpio.

Firmas públicas sin cambios (`generarProblemaDecimal`, `generarProblemaGeometria`, `generarProblemaPotencia`,
`generarProblemaFraccion`, `generarProblema`, `paresPotencia`, `BASE_MAXIMA_POTENCIA`; se agregaron
`BASE_MINIMA_POTENCIA` y `desarrolloDecimal`).

## Siguiente paso (otra tarea)

Arreglar los mundos marcados en `docs/AUDITORIA_PREGUNTAS.md` §5 (prioridad: Vitalia, Melodía, Anatomía,
Trigonometría) y agregarles umbrales al test de variedad.
