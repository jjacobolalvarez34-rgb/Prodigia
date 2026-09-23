import type { ClaseEnigmia } from "./tipos";

// Genera la migración 0203_enigmia_clases.sql a partir del contenido
// tipado (fuente única). lecciones.test.ts compara este texto con el
// archivo del repo, así que la migración no puede quedar desincronizada.
// Mismo patrón que src/lib/numeria/lecciones/sql.ts (generarSqlNumeria):
// estas 6 Clases son INSERT nuevos, no existen filas todavía para estos
// slugs en logic_techniques.

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: ClaseEnigmia): string {
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

export function generarSqlEnigmia(clases: ClaseEnigmia[]): string {
  const filas = clases.map(
    (c) =>
      `('${escaparSql(c.slug)}', '${escaparSql(c.nombre)}',\n  '${escaparSql(c.descripcion)}',\n  ${c.orden},\n  '${c.categoria}',\n  $enigmia$${contenidoJson(c)}$enigmia$::jsonb,\n  true)`
  );
  return `-- ============================================================
-- Prodigia — Enigmia: 6 Clases nuevas con explicación visual animada
-- (fila 22 + fila 23 de docs/PARIDAD_MUNDOS.md, pedido explícito del
-- usuario: "revisa que esté de acuerdo a paridad, agregale animaciones a
-- las lecciones, y agregale Clases"): enseñan los CONCEPTOS de
-- razonamiento lógico desde cero (secuencias aritméticas/geométricas,
-- patrones no numéricos, proposiciones y contrapositiva, silogismos,
-- chunking/asociación, qué es un algoritmo) — a diferencia de las 6
-- Técnicas rápidas ya existentes (atajos puntuales). \`pasos\` es una
-- introducción corta, la explicación real son los \`visuales\` animados
-- (secuencia, cadena lógica, agrupación, traza de algoritmo — ver
-- src/components/enigmia/visuales/). Mismo criterio de gating que el
-- resto de los mundos: la Clase de orden más bajo del recorrido global
-- es preview gratis; el resto exige Pro — ver
-- src/lib/enigmia/pathClases.ts.
--
-- Requiere agregar antes \`logic_techniques.requiere_pro\` (esta misma
-- migración la crea con \`alter table ... add column if not exists\`,
-- mismo criterio que 0170_calculia_curso_pro.sql hizo sobre
-- \`techniques\`) — logic_techniques no la tenía todavía.
--
-- Este archivo se GENERA desde src/lib/enigmia/lecciones/ (fuente única;
-- todo número sale de src/lib/enigmia/visualesDatos.ts) y
-- lecciones.test.ts comprueba que coincida. No editar a mano. Regenerar:
-- ENIGMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/enigmia/lecciones
-- ============================================================

alter table public.logic_techniques add column if not exists requiere_pro boolean not null default false;

insert into public.logic_techniques (slug, nombre, descripcion, orden, categoria, contenido, requiere_pro) values

${filas.join(",\n\n")};
`;
}
