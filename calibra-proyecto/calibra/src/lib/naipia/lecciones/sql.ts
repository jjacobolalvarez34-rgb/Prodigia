import type { LeccionNaipia } from "./tipos";

// Genera la migración 0196_naipia_lecciones_visuales.sql a partir del
// contenido tipado (fuente única). lecciones.test.ts compara este texto con
// el archivo del repo, así que la migración no puede quedar desincronizada.
// Solo UPDATE de `contenido`: nombre, descripción, orden y requiere_pro
// siguen siendo los de 0192 (que NO se edita).

export function contenidoJson(l: LeccionNaipia): string {
  const contenido = {
    pasos: l.pasos,
    visuales: l.visuales,
    quiz: l.quiz.map((q) => ({
      pregunta: q.pregunta,
      opciones: q.opciones,
      respuesta: q.respuesta,
      explicacion: q.explicacion,
    })),
  };
  return JSON.stringify(contenido, null, 2);
}

export function generarSqlNaipia(lecciones: LeccionNaipia[]): string {
  const filas = lecciones.map(
    (l) =>
      `update public.techniques set contenido =\n$naipia$${contenidoJson(l)}$naipia$::jsonb\nwhere slug = '${l.slug.replace(/'/g, "''")}' and problem_type = 'naipia';`
  );
  return `-- ============================================================
-- Prodigia — Naipia (mundo 12): lecciones en formato VISUAL.
--
-- Reescribe el \`contenido\` de las 13 lecciones de Aprender (5 Técnicas y
-- 8 Clases, mismos slugs, orden y requiere_pro que 0192): \`pasos\` pasa a ser
-- una introducción corta y la explicación real son los \`visuales\`
-- animados (tabla de valores, conteo corriente, pares que se cancelan,
-- mazo completo, sistemas comparados, conteo verdadero y cuadros). El
-- \`quiz\` es IDÉNTICO al de 0192 (el contrato de /api/aprender/completar
-- valida por igualdad exacta).
--
-- Este archivo se GENERA desde src/lib/naipia/lecciones/ (fuente única;
-- todo número sale de TABLA_SISTEMAS) y lecciones.test.ts comprueba que
-- coincida. No editar a mano. Regenerar: NAIPIA_ESCRIBIR_SQL=1 npx vitest
-- run src/lib/naipia/lecciones. Requiere 0192 (las filas ya existen).
-- ============================================================

${filas.join("\n\n")}
`;
}
