import type { ClaseNumeria } from "./tipos";

// Genera la migración 0199_numeria_clases_conceptos.sql a partir del
// contenido tipado (fuente única). lecciones.test.ts compara este texto con
// el archivo del repo, así que la migración no puede quedar desincronizada.
// A diferencia de Naipia (que solo actualizaba `contenido` de filas ya
// sembradas), estas 5 Clases son INSERT nuevos: todavía no existen filas en
// `techniques` para estos slugs.

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: ClaseNumeria): string {
  const contenido = {
    pasos: c.pasos,
    visuales: c.visuales,
    quiz: c.quiz.map((q) => ({
      pregunta: q.pregunta,
      opciones: q.opciones,
      respuesta: q.respuesta,
      explicacion: q.explicacion,
    })),
  };
  return JSON.stringify(contenido, null, 2);
}

export function generarSqlNumeria(clases: ClaseNumeria[]): string {
  const filas = clases.map(
    (c) =>
      `('${escaparSql(c.slug)}', '${escaparSql(c.nombre)}',\n  '${escaparSql(c.descripcion)}',\n  '${c.problemType}',\n  $numeria$${contenidoJson(c)}$numeria$::jsonb,\n  ${c.orden}, true)`
  );
  return `-- ============================================================
-- Prodigia — Numeria: 5 Clases nuevas con explicación visual animada
-- (fila 22 + fila 23 de docs/PARIDAD_MUNDOS.md, pedido explícito del
-- usuario 2026-09-22): conceptos básicos, multiplicación, división,
-- mínimo común múltiplo y operaciones entre fracciones — mismo formato
-- que las Clases del resto de los mundos (\`pasos\` es una introducción
-- corta, la explicación real son los \`visuales\` animados en tablero de
-- columnas) y mismo criterio de gating (la clase 1 de cada tema es
-- preview gratis; el resto exige Pro — ver
-- src/lib/aprender/pathClases.ts).
--
-- Requiere 0170 (columna techniques.requiere_pro). \`problem_type\` usa uno
-- de los 9 temas ya existentes de Numeria (suma/multiplicacion/division/
-- fracciones) para entrar sin cambios en TEMAS_ORDEN — no hace falta DDL
-- nuevo, \`requiere_pro\` y \`contenido.visuales\` ya son genéricos.
--
-- Este archivo se GENERA desde src/lib/numeria/lecciones/ (fuente única;
-- todo número sale de src/lib/numeria/visualesDatos.ts) y
-- lecciones.test.ts comprueba que coincida. No editar a mano. Regenerar:
-- NUMERIA_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${filas.join(",\n\n")};
`;
}
