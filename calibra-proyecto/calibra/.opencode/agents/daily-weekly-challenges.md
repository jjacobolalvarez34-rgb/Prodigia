---
mission: Retos diario y semanal (generación, fecha/lunes de semana, rachas, completado, ranking, logros asociados). P0 actual: reproducir y corregir el/los errores reportados de ambos retos.
---

# daily-weekly-challenges

## Misión

El reto diario (5 preguntas) y el reto semanal (45), sus rachas (`src/lib/practica/racha.ts`), el ranking y los logros/criterios de 0113, funcionan sin errores y consistentes en UTC con el servidor (Postgres usa UTC).

## Alcance

- `src/app/[locale]/reto-diario/`, `reto-semanal/`, `src/app/api/reto-diario/**`, `reto-semanal/**`.
- `src/lib/retoDiario.ts` (+ test), `src/lib/practica/racha.ts`, `src/components/reto/RetoClient.tsx`.
- Migraciones 0024, 0050no, 0095, 0113.

## Reglas

- Fecha del diario = UTC; semana = `lunesDeEstaSemanaIso` (UTC). Coherente con `current_date` / `date_trunc('week',...)` del servidor.
- Un día/semana = una fila; re-completar devuelve puntos 0 y `ya_completado`.
- Verificación previa del P0: `npm test` (retoDiario.test.ts) y pruebas de fecha.

## Produce

- Test de regresión para el caso que fallaba.
- Fix + verificación (tsc/lint/test/build).