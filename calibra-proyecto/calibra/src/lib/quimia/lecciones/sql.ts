import type { TecnicaQuimia, ClaseQuimia, PreguntaLeccionQuimia, VisualLeccionQuimia } from "./tipos";
import { ORDEN_GRUPOS_QUIMIA, type GrupoQuimia } from "@/lib/quimia/grupos";

// Genera las migraciones de Aprender de Quimia a partir del contenido tipado
// (fuente única). lecciones.test.ts compara este texto con el archivo del
// repo, así que una migración no puede quedar desincronizada del contenido.
// Mismo patrón que src/lib/geografia/lecciones/sql.ts y enigmia/.../sql.ts.
//
// ORDEN DE LAS OPERACIONES (importa): primero los UPDATE de las filas que ya
// existían (por slug, solo `techniques`, sin tocar `technique_progress`) y
// después los INSERT de las nuevas. `techniques.slug` es único y no hay
// ninguna restricción sobre `orden`, así que ningún paso puede chocar con
// otro (una migración de Geografía chocó con `23505 duplicate key` por
// reordenar filas dentro de una PK; acá no se reordena ninguna clave).

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: { pasos: string[]; visuales: VisualLeccionQuimia[]; quiz: PreguntaLeccionQuimia[] }): string {
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

const valorInsert = (l: TecnicaQuimia | ClaseQuimia, requierePro: boolean) =>
  `('${escaparSql(l.slug)}', '${escaparSql(l.nombre)}',\n  '${escaparSql(l.descripcion)}',\n  'quimia',\n  $quimia$${contenidoJson(l)}$quimia$::jsonb,\n  ${l.orden},\n  ${requierePro})`;

const updateExistente = (t: TecnicaQuimia) =>
  `update public.techniques\nset nombre = '${escaparSql(t.nombre)}',\n  descripcion = '${escaparSql(t.descripcion)}',\n  contenido = $quimia$${contenidoJson(t)}$quimia$::jsonb,\n  orden = ${t.orden},\n  requiere_pro = false\nwhere slug = '${escaparSql(t.slug)}' and problem_type = 'quimia';`;

export interface OpcionesSqlQuimia {
  // Encabezado (líneas de comentario SIN el "-- " inicial).
  cabecera: string[];
  tecnicas: TecnicaQuimia[];
  clases: ClaseQuimia[];
}

function porGrupo<T extends { grupo: GrupoQuimia }>(lista: T[]): string {
  return ORDEN_GRUPOS_QUIMIA.map((g) => ({ g, n: lista.filter((x) => x.grupo === g).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.g} ${x.n}`)
    .join(", ");
}

export function resumenQuimia(tecnicas: TecnicaQuimia[], clases: ClaseQuimia[]): string[] {
  const nuevas = tecnicas.filter((t) => !t.existente);
  const existentes = tecnicas.filter((t) => t.existente);
  return [
    `Técnicas: ${tecnicas.length} en total (${porGrupo(tecnicas)}): ${existentes.length} ya existían (se ACTUALIZAN) y ${nuevas.length} son nuevas.`,
    `Clases: ${clases.length} (${porGrupo(clases)}), requiere_pro = true.`,
  ];
}

export function generarSqlQuimia(o: OpcionesSqlQuimia): string {
  const existentes = o.tecnicas.filter((t) => t.existente);
  const nuevas = o.tecnicas.filter((t) => !t.existente);
  const partes: string[] = [];
  partes.push(
    `-- ============================================================\n${[...o.cabecera, "", ...resumenQuimia(o.tecnicas, o.clases), "", "Este archivo se GENERA desde src/lib/quimia/lecciones/ (fuente única) y", "lecciones.test.ts comprueba que coincida. No editar a mano.", "Regenerar: QUIMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/quimia/lecciones"]
      .map((l) => (l === "" ? "--" : `-- ${l}`))
      .join("\n")}\n-- ============================================================`
  );
  if (existentes.length > 0) {
    partes.push(`-- 1) Técnicas que ya existían: se actualizan por slug (texto en español neutro, quiz corregido, visuales).\n\n${existentes.map(updateExistente).join("\n\n")}`);
  }
  if (nuevas.length > 0) {
    partes.push(
      `-- 2) Técnicas nuevas (requiere_pro = false).\ninsert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values\n\n${nuevas.map((t) => valorInsert(t, false)).join(",\n\n")};`
    );
  }
  if (o.clases.length > 0) {
    partes.push(
      `-- 3) Clases (requiere_pro = true): un curso lineal en orden de curso; la primera es preview gratis.\ninsert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values\n\n${o.clases.map((c) => valorInsert(c, true)).join(",\n\n")};`
    );
  }
  return partes.join("\n\n") + "\n";
}

// Cabecera de la migración de la tanda 1 (0209).
export const CABECERA_TANDA1: string[] = [
  "Prodigia — Quimia: Aprender pasa a Técnicas | Clases (tanda 1 de 2 del",
  "retrofit de Quimia; docs/PARIDAD_MUNDOS.md filas 22/23 y la sección",
  "\"Quimia: Técnicas | Clases (tanda 1)\").",
  "",
  "Antes: 4 Técnicas mnemotécnicas (0056 + quiz de 0175), sin Clases y sin",
  "visuales, en 3 grupos (símbolos, fórmulas, tabla). Ahora:",
  "  - las 4 Técnicas existentes se REESCRIBEN: español neutro sin voseo (el",
  "    texto que sembraron 0056 y 0175 usaba voseo rioplatense; en esos dos",
  "    archivos se corrigió además solo esa redacción, ya que esta migración",
  "    pisa el contenido), precisiones químicas (los",
  "    oxoácidos terminan en -ico O -oso; \"ácido clorhídrico\" es la solución",
  "    en agua) y visuales; \"patrones-en-formulas\" pasa del grupo fórmulas al",
  "    grupo nomenclatura, que es de lo que trata;",
  "  - Técnicas nuevas por grupo (tabla, símbolos, fórmulas, nomenclatura);",
  "  - Clases nuevas: el curso desde el átomo hasta la nomenclatura inorgánica",
  "    (los grupos redox y orgánica los agrega la tanda 2).",
  "",
  "Todo dato químico de las lecciones sale de tablas de referencia con tests",
  "(src/lib/quimia/{tabla,datos,formulas,nomenclatura,enlaces,valencia}.ts):",
  "configuración electrónica contrastada para los 118 elementos, nombres en los",
  "tres sistemas contrastados con reglas calculadas, masas molares sumadas desde",
  "la tabla de masas atómicas. Las lecciones traen `contenido.visuales` con los",
  "visuales \"quimia.*\" (tabla periódica animada, ficha de elemento, enlace,",
  "cruce de cargas, cuadro de datos y llenado de subcapas) y el primitivo",
  "genérico \"cuadros\".",
];

// Cabecera de la migración de la tanda 2 (redox y orgánica).
export const CABECERA_TANDA2: string[] = [
  "Prodigia — Quimia: Aprender, tanda 2 de 2 del retrofit a Técnicas | Clases",
  "(docs/PARIDAD_MUNDOS.md filas 22/23 y la sección \"Quimia: Técnicas |",
  "Clases (tanda 2)\"). La tanda 1 (0209) sembró tabla, símbolos, fórmulas y",
  "nomenclatura; esta migración agrega los dos grupos que quedaban:",
  "  - redox (estados de oxidación completos, reacciones redox, balanceo por",
  "    número de oxidación y por ion-electrón, serie de actividad, pilas y",
  "    electrólisis);",
  "  - orgánica (el carbono, fórmulas, alcanos, alquenos y alquinos, cíclicos",
  "    y aromáticos, grupos funcionales, isomería, reacciones, glucosa y",
  "    polímeros).",
  "",
  "Solo INSERT de lecciones nuevas (ninguna de las filas de 0209 se toca, y los",
  "slugs no chocan con los de 0209: techniques.slug es único). Las Clases se",
  "agregan al final del curso (grupo redox y después orgánica), así que el",
  "orden de desbloqueo de las 17 anteriores no cambia.",
  "",
  "Todo dato químico sale de tablas de referencia con tests (src/lib/quimia/",
  "{redox,organica,moleculas}.ts): números de oxidación calculados, ecuaciones",
  "balanceadas en átomos y carga, semirreacciones por el algoritmo ion-electrón,",
  "nombres IUPAC calculados y contrastados con una tabla curada y con el banco",
  "de la práctica. Los visuales nuevos son \"quimia.redox\", \"quimia.oxidacion\",",
  "\"quimia.balanceo\", \"quimia.pila\", \"quimia.cadena\", \"quimia.grupos\",",
  "\"quimia.isomeria\" y \"quimia.hibridacion\" (esqueletos 2D esquemáticos).",
];
