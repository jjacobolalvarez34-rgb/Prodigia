import type { LeccionCircuitia } from "./tipos";

// Genera la migración de visuales de Circuitia a partir del contenido tipado
// (fuente única). lecciones.test.ts compara este texto con el archivo del
// repo, así que la migración no puede quedar desincronizada.
//
// Agrega `visuales` Y reescribe `pasos` con un merge (`contenido || '{"pasos":
// [...], "visuales": [...]}'`): los pasos cambian porque (1) se agregaron pasos
// AL FINAL de tres Clases (nunca se reordenan ni se tocan los existentes, así
// que los `despuesDePaso` de antes siguen apuntando al mismo paso) para cubrir
// lo que evalúa la práctica y (2) el texto ya es español neutro (lo mismo que
// hace 0221 sobre lo sembrado). El `quiz` NO se toca: el merge lo deja como
// está en la base (el contrato de /api/aprender/completar valida el quiz por
// igualdad exacta).

export function visualesJson(l: LeccionCircuitia): string {
  return JSON.stringify({ pasos: l.pasos, visuales: l.visuales }, null, 2);
}

export function generarSqlCircuitia(lecciones: LeccionCircuitia[], numero: string): string {
  const filas = lecciones.map(
    (l) =>
      `update public.techniques\nset contenido = contenido || $circuitia$${visualesJson(l)}$circuitia$::jsonb\nwhere slug = '${l.slug.replace(/'/g, "''")}' and problem_type = 'circuitia';`
  );
  return `-- ============================================================
-- Prodigia — Circuitia: visuales animados en Aprender (migración ${numero}).
--
-- Agrega \`visuales\` al \`contenido\` de las 12 lecciones de Aprender (5
-- Técnicas gratis y 7 Clases Pro, mismos slugs): esquemas de circuito con
-- símbolos estándar y corriente animada, resistencia equivalente armándose
-- en serie/paralelo y el triángulo V/I/R de la Ley de Ohm. Los datos de cada
-- visual son solo la topología, los ohmios y el voltaje de la fuente; todo
-- valor eléctrico que se muestra lo calcula el código (resolver.ts).
--
-- Es un merge (\`contenido || ...\`) que escribe \`pasos\` y \`visuales\`:
--  - \`pasos\`: tres Clases ganan pasos NUEVOS AL FINAL (Fundamentos: serie de
--    3 resistores; Razonamiento cualitativo 1 y 2: voltaje, reducir la
--    resistencia y el caso mixto), sin reordenar ni tocar los existentes; el
--    resto de las lecciones repite su texto (ya en español neutro, igual que
--    lo deja 0221).
--  - \`quiz\`: NO se toca (se valida por igualdad exacta en
--    /api/aprender/completar).
-- No cambian nombre, descripción, orden ni requiere_pro. Requiere 0167/0171
-- (las filas ya existen). Idempotente: volver a correrla deja el mismo resultado.
--
-- Este archivo se GENERA desde src/lib/circuitia/lecciones/ (fuente única) y
-- lecciones.test.ts comprueba que coincida. No editar a mano. Regenerar:
-- CIRCUITIA_ESCRIBIR_SQL=1 npx vitest run src/lib/circuitia/lecciones
-- ============================================================

${filas.join("\n\n")}
`;
}
