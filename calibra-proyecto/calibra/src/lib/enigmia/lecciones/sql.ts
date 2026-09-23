import type { ClaseEnigmia, TecnicaEnigmia, PreguntaLeccionEnigmia } from "./tipos";
import type { VisualLeccion } from "@/lib/aprender/visuales";

// Genera la migración 0203_enigmia_clases.sql a partir del contenido
// tipado (fuente única). lecciones.test.ts compara este texto con el
// archivo del repo, así que la migración no puede quedar desincronizada.
// Mismo patrón que src/lib/numeria/lecciones/sql.ts (generarSqlNumeria):
// estas 6 Clases son INSERT nuevos, no existen filas todavía para estos
// slugs en logic_techniques.

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: { pasos: string[]; visuales: VisualLeccion[]; quiz: PreguntaLeccionEnigmia[] }): string {
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

// Genera la migración 0206_enigmia_mas_contenido.sql: 10 Técnicas nuevas
// (requiere_pro=false, CON `visuales` — a diferencia de las 6 históricas)
// + 5 Clases nuevas (requiere_pro=true), ambas INSERT nuevos (los slugs no
// existen todavía). No hace falta `alter table` acá: `requiere_pro` ya la
// agregó 0203. Mismo patrón de generación/comparación byte a byte que
// generarSqlEnigmia — ver masContenido.test.ts.
export function generarSqlEnigmiaMasContenido(tecnicas: TecnicaEnigmia[], clases: ClaseEnigmia[]): string {
  const filaTecnica = (t: TecnicaEnigmia) =>
    `('${escaparSql(t.slug)}', '${escaparSql(t.nombre)}',\n  '${escaparSql(t.descripcion)}',\n  ${t.orden},\n  '${t.categoria}',\n  $enigmia$${contenidoJson(t)}$enigmia$::jsonb,\n  false)`;
  const filaClase = (c: ClaseEnigmia) =>
    `('${escaparSql(c.slug)}', '${escaparSql(c.nombre)}',\n  '${escaparSql(c.descripcion)}',\n  ${c.orden},\n  '${c.categoria}',\n  $enigmia$${contenidoJson(c)}$enigmia$::jsonb,\n  true)`;

  return `-- ============================================================
-- Prodigia — Enigmia: más contenido (el usuario probó las 6 Técnicas + 6
-- Clases de la tanda anterior y dijo "está muy vacío"; pidió más
-- Técnicas, más Clases, más preguntas de quiz por lección, y animaciones
-- para todo lo nuevo — mismo criterio ya usado).
--
-- ${tecnicas.length} Técnicas nuevas (requiere_pro=false), a diferencia de
-- las 6 históricas de 0015/0020 estas SÍ traen \`contenido.visuales\`
-- animados: patrones-alternantes (Patrones); silogismos-dos-premisas,
-- negacion-ningun-x-es-y, eliminacion-por-descarte (Deducción);
-- metodo-de-loci, agrupar-por-categoria, visualizar-en-vez-de-repetir
-- (Memoria); trazar-un-bucle-a-mano, condicion-de-corte,
-- simplificar-antes-de-ejecutar (Pensamiento computacional).
--
-- ${clases.length} Clases nuevas (requiere_pro=true), profundizando lo que
-- ya enseñaban las 6 Clases de 0203 sin repetirlo: patrones-compuestos
-- (Patrones, sigue a secuencias/patrones-no-numéricos);
-- deduccion-por-eliminacion (Deducción, sigue a proposiciones/silogismos);
-- repeticion-espaciada-y-recuerdo-activo (Memoria, sigue a
-- chunking/asociación); bucles-y-repeticion y depuracion-por-que-falla-
-- un-algoritmo (Computacional, siguen a qué-es-un-algoritmo).
--
-- 2 primitivos de visual NUEVOS (src/components/enigmia/visuales/,
-- registro.ts): \`enigmia.eliminacion\` (candidatos que se descartan uno a
-- uno hasta que queda uno solo — Técnica y Clase de eliminación por
-- descarte comparten el mismo primitivo) y \`enigmia.loci\` (método de
-- loci: cada dato asociado a un lugar de un recorrido, revelado un par a
-- la vez). Los datos de ambos salen de funciones puras nuevas en
-- src/lib/enigmia/visualesDatos.ts (resolverPorEliminacion, asociarLoci),
-- recalculadas de forma independiente en masContenido.test.ts. El resto
-- de los visuales nuevos reusa los 4 primitivos ya existentes
-- (enigmia.secuencia/cadena/agrupacion/algoritmo) + el primitivo genérico
-- \`cuadros\`.
--
-- Cada quiz trae 4-5 preguntas (antes 2-3), todas con \`explicacion\` y la
-- \`respuesta\` literal dentro de \`opciones\`, verificadas contra la
-- aritmética/lógica real del ejemplo — nunca inventadas a mano.
--
-- Este archivo se GENERA desde src/lib/enigmia/lecciones/ (fuente única;
-- todo número sale de src/lib/enigmia/visualesDatos.ts) y
-- masContenido.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: ENIGMIA_MAS_ESCRIBIR_SQL=1 npx vitest run src/lib/enigmia/lecciones/masContenido.test.ts
-- ============================================================

insert into public.logic_techniques (slug, nombre, descripcion, orden, categoria, contenido, requiere_pro) values

${tecnicas.map(filaTecnica).join(",\n\n")};

insert into public.logic_techniques (slug, nombre, descripcion, orden, categoria, contenido, requiere_pro) values

${clases.map(filaClase).join(",\n\n")};
`;
}
