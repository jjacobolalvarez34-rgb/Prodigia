import type { LeccionCalculia } from "./tipos";

// Genera la migración de visuales de Aprender de Calculia a partir del
// contenido tipado (fuente única). lecciones.test.ts compara este texto con el
// archivo del repo, así que la migración no puede quedar desincronizada.
//
// Escribe `pasos` Y `visuales` con un merge (`contenido || '{"pasos": [...],
// "visuales": [...]}'`), igual que Circuitia (0217) y Estadística (0218): los
// pasos cambian porque (1) se agregaron pasos NUEVOS AL FINAL de cuatro Clases
// (nunca se reordenan ni se tocan los existentes, así que los `despuesDePaso`
// de antes siguen apuntando al mismo paso) para cubrir lo que evalúa la práctica
// y (2) el texto ya es español neutro (lo mismo que hace 0221 sobre lo
// sembrado). El `quiz` NO se toca: el merge lo deja como está en la base (el
// contrato de /api/aprender/completar valida el quiz por igualdad exacta).
// nombre, descripción, orden y requiere_pro tampoco cambian. No hay ALTER, no se
// toca technique_progress ni skill_levels.

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function visualesJson(l: LeccionCalculia): string {
  return JSON.stringify({ pasos: l.pasos, visuales: l.visuales }, null, 2);
}

export function generarSqlCalculia(cabecera: string[], lecciones: LeccionCalculia[]): string {
  const filas = lecciones.map(
    (l) =>
      `update public.techniques\nset contenido = contenido || $calculia$${visualesJson(l)}$calculia$::jsonb\nwhere slug = '${escaparSql(l.slug)}' and problem_type = 'calculia';`
  );
  const lineas = cabecera.map((l) => (l === "" ? "--" : `-- ${l}`));
  return `-- ============================================================\n${lineas.join("\n")}\n-- ============================================================\n\n${filas.join("\n\n")}\n`;
}

export const CABECERA_CALCULIA: string[] = [
  "Prodigia — Calculia: visuales animados en Aprender (docs/PARIDAD_MUNDOS.md,",
  "fila 23 y la sección \"Calculia: visuales en Aprender\").",
  "",
  "Las 12 lecciones de Calculia (5 Técnicas y 7 Clases) eran solo texto. Esta",
  "migración agrega `contenido.visuales` a cada una y cubre los huecos entre la",
  "práctica y las lecciones (integrales con coeficiente en 1/x, seno y coseno,",
  "integral definida, criterio de la razón y EDO dy/dx = k·x^n·y con n hasta 4).",
  "",
  "Es un merge (`contenido || ...`) que escribe `pasos` y `visuales`:",
  " - `pasos`: cuatro Clases ganan pasos NUEVOS AL FINAL (integrales desde cero:",
  "   1/x con coeficiente e integral definida; integrales avanzadas: seno y coseno",
  "   con coeficiente; series geométricas: criterio de la razón; EDOs separables:",
  "   caso general, n = 3 y n = 4, y k distinto de n+1), sin reordenar ni tocar los",
  "   existentes; el resto de las lecciones repite su texto (ya en español neutro,",
  "   igual que lo deja 0221, que corre después y es idempotente).",
  " - `quiz`: NO se toca (se valida por igualdad exacta en",
  "   /api/aprender/completar).",
  "No cambian nombre, descripción, orden ni requiere_pro.",
  "",
  "Visuales: los propios \"calculia.tangente\" (pendiente de la recta tangente),",
  "\"calculia.area\" (integral como área), \"calculia.serie\" (sumas parciales) y",
  "\"calculia.edo\" (familia de soluciones de una EDO separable), más el primitivo",
  "genérico \"cuadros\" para las reglas paso a paso. Todo número sale de funciones",
  "puras (src/lib/calculia/visualesDatos.ts) verificadas contra diferencias",
  "finitas, Simpson y sumas directas.",
  "",
  "Este archivo se GENERA desde src/lib/calculia/lecciones/ (fuente única) y",
  "lecciones.test.ts comprueba que coincida. No editar a mano.",
  "Regenerar: CALCULIA_ESCRIBIR_SQL=1 npx vitest run src/lib/calculia/lecciones",
  "Requiere que existan las 12 filas (0165 y 0170). Idempotente: volver a correrla",
  "deja el mismo resultado.",
];

// Migración del curso (2026-10-06): reubica las 12 lecciones sembradas
// (UPDATE de `orden` por slug) e inserta las nuevas. No toca el contenido de las
// sembradas ni la 0216. `on conflict do nothing` la deja correr dos veces (techniques tiene unique (slug)).
export const ARCHIVO_MIGRACION_CURSO_CALCULIA = "0254_calculia_curso_dividido.sql";

export function generarSqlCursoCalculia(nuevas: LeccionCalculia[], ordenNuevo: Record<string, number>): string {
  const reorden = Object.entries(ordenNuevo).map(
    ([slug, orden]) => `update public.techniques set orden = ${orden} where problem_type = 'calculia' and slug = '${escaparSql(slug)}';`
  );
  const contenido = (l: LeccionCalculia) => JSON.stringify({ pasos: l.pasos, visuales: l.visuales, quiz: l.quiz }, null, 2);
  const fila = (l: LeccionCalculia) =>
    `('${escaparSql(l.slug)}', '${escaparSql(l.nombre)}',\n  '${escaparSql(l.descripcion)}',\n  'calculia',\n  $calculia$${contenido(l)}$calculia$::jsonb,\n  ${l.orden},\n  ${l.requierePro})`;
  const tecnicas = nuevas.filter((l) => !l.requierePro).length;
  return `-- ============================================================
-- Prodigia — Calculia: curso dividido por reglas (pedido del usuario,
-- 2026-10-06: «le falta a Calculia mejor división para clases y técnicas»).
--
-- Antes cada tema tenía una o dos lecciones que mezclaban varias reglas. Ahora
-- cada regla tiene su Técnica (gratis) y su Clase (Pro), en orden de dependencia
-- dentro de su tema (derivadas, integrales, series, multivariable y EDOs).
--   - ${tecnicas} Técnicas nuevas y ${nuevas.length - tecnicas} Clases nuevas (INSERT).
--   - Las 12 lecciones existentes se REUBICAN (solo cambia \`orden\`): Técnicas
--     1-20 y Clases 21-40. No se toca su contenido, ni el progreso de nadie.
--   - Las Clases viejas que juntaban varias reglas («producto, cociente y
--     cadena», «integrales avanzadas») quedan al final de su tema, como repaso.
--
-- Requiere 0216. Este archivo se GENERA desde src/lib/calculia/lecciones/curso.ts
-- y curso.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: CALCULIA_CURSO_ESCRIBIR_SQL=1 npx vitest run src/lib/calculia/lecciones/curso.test.ts
-- ============================================================

${reorden.join("\n")}

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${nuevas.map(fila).join(",\n\n")}
on conflict (slug) do nothing;
`;
}
