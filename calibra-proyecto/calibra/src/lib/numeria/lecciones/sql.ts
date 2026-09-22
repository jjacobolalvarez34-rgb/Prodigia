import type { ClaseNumeria, TecnicaVisualNumeria } from "./tipos";

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

// Genera la migración 0201_numeria_tecnicas_visuales.sql: UPDATE de las 39
// Técnicas rápidas ya existentes (requiere_pro = false, sembradas en
// 0007/0018/0019/0026/0032/0079/0101), agregándoles su apartado visual.
// A diferencia de generarSqlNumeria (INSERT de filas nuevas), acá la fila
// YA EXISTE: usa jsonb_set dos veces (mismo patrón que 0185) para
// reemplazar solo las claves "pasos" y "visuales" de \`contenido\`, dejando
// "quiz" (agregado en 0182/0183/0184) intacto.
export function generarSqlTecnicas(tecnicas: TecnicaVisualNumeria[]): string {
  const filas = tecnicas.map((tec) => {
    const pasosJson = JSON.stringify(tec.pasos, null, 2);
    const visualesJson = JSON.stringify(tec.visuales, null, 2);
    return `update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$${pasosJson}$numeria$::jsonb),
  '{visuales}', $numeria$${visualesJson}$numeria$::jsonb
)
where slug = '${escaparSql(tec.slug)}';`;
  });
  return `-- ============================================================
-- Prodigia — Numeria: apartado visual para las 39 Técnicas rápidas
-- (pedido explícito del usuario 2026-09-22, tras probar las Clases con
-- tablero animado: "revisa TODAS [las técnicas] y colócales su apartado
-- visual" — a diferencia de las 5 Clases de 0199, que ya nacieron con
-- visuales, estas técnicas eran solo texto desde 0007/0018/0019/0026/
-- 0032/0079/0101). Reescribe \`pasos\` (introducción corta, en español
-- neutro) y agrega \`visuales\` (el truco EN ACCIÓN con un ejemplo real);
-- \`quiz\` (agregado en 0182/0183/0184) y el resto de la fila (nombre,
-- descripcion, orden, requiere_pro) NO se tocan — jsonb_set reemplaza
-- solo esas dos claves de \`contenido\`, mismo patrón que 0185.
--
-- Reusa los primitivos ya existentes de Numeria (numeria.columnas/
-- multiplicacion/division/mcm/fraccion) donde el truco calza con ese
-- algoritmo, y agrega 4 primitivos nuevos para lo que no tenía uno:
-- numeria.recta (Decimales, recta numérica), numeria.potencia
-- (Potencias, cadena de multiplicación o cuadrícula de área),
-- numeria.balanza (Álgebra, ecuación de un paso) y numeria.figura
-- (Geometría, triángulo/rectángulo compuesto/círculo/ángulos) — ver
-- src/components/numeria/visuales/. El resto usa el primitivo genérico
-- \`cuadros\` para razonamientos numéricos paso a paso puntuales.
--
-- Este archivo se GENERA desde src/lib/numeria/lecciones/tecnicas.ts
-- (fuente única; todo número sale de src/lib/numeria/visualesDatos.ts) y
-- tecnicas.test.ts comprueba que coincida. No editar a mano. Regenerar:
-- NUMERIA_TECNICAS_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones/tecnicas.test.ts
-- ============================================================

${filas.join("\n\n")}
`;
}
