import type { TecnicaTrigonometria, ClaseTrigonometria, PreguntaLeccionTrigonometria, VisualLeccionTrigonometria } from "./tipos";
import { ORDEN_GRUPOS_TRIGONOMETRIA, type GrupoTrigonometria } from "@/lib/trigonometria/bloques";

// Genera la migración de Aprender de Trigonometría a partir del contenido
// tipado (fuente única). lecciones.test.ts compara este texto con el archivo del
// repo, así que una migración no puede quedar desincronizada del contenido.
// Mismo patrón que src/lib/quimia/lecciones/sql.ts y anatomia/.../sql.ts.
//
// ORDEN DE LAS OPERACIONES (importa): primero los UPDATE de las 5 filas que ya
// existían (por slug, solo `techniques`, sin tocar `technique_progress`, así
// nadie pierde lo que ya completó) y después los INSERT de las nuevas.
// `techniques.slug` es único y no hay restricción sobre `orden`, así que ningún
// paso puede chocar con otro. NO hay ALTER (requiere_pro existe desde 0170) ni se
// toca skill_levels.

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: { pasos: string[]; visuales: VisualLeccionTrigonometria[]; quiz: PreguntaLeccionTrigonometria[] }): string {
  const contenido = {
    pasos: c.pasos,
    visuales: c.visuales,
    quiz: c.quiz.map((q) => ({ pregunta: q.pregunta, opciones: q.opciones, respuesta: q.respuesta, explicacion: q.explicacion })),
  };
  return JSON.stringify(contenido, null, 2);
}

const valorInsert = (l: TecnicaTrigonometria | ClaseTrigonometria, requierePro: boolean) =>
  `('${escaparSql(l.slug)}', '${escaparSql(l.nombre)}',\n  '${escaparSql(l.descripcion)}',\n  'trigonometria',\n  $trigonometria$${contenidoJson(l)}$trigonometria$::jsonb,\n  ${l.orden},\n  ${requierePro})`;

const updateExistente = (t: TecnicaTrigonometria) =>
  `update public.techniques\nset nombre = '${escaparSql(t.nombre)}',\n  descripcion = '${escaparSql(t.descripcion)}',\n  contenido = $trigonometria$${contenidoJson(t)}$trigonometria$::jsonb,\n  orden = ${t.orden},\n  requiere_pro = false\nwhere slug = '${escaparSql(t.slug)}' and problem_type = 'trigonometria';`;

export interface OpcionesSqlTrigonometria {
  // Encabezado (líneas de comentario SIN el "-- " inicial).
  cabecera: string[];
  tecnicas: TecnicaTrigonometria[];
  clases: ClaseTrigonometria[];
}

function porGrupo<T extends { grupo: GrupoTrigonometria }>(lista: T[]): string {
  return ORDEN_GRUPOS_TRIGONOMETRIA.map((g) => ({ g, n: lista.filter((x) => x.grupo === g).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.g} ${x.n}`)
    .join(", ");
}

export function resumenTrigonometria(tecnicas: TecnicaTrigonometria[], clases: ClaseTrigonometria[]): string[] {
  const nuevas = tecnicas.filter((t) => !t.existente);
  const existentes = tecnicas.filter((t) => t.existente);
  return [
    `Técnicas: ${tecnicas.length} en total (${porGrupo(tecnicas)}): ${existentes.length} ya existían (se ACTUALIZAN) y ${nuevas.length} son nuevas.`,
    `Clases: ${clases.length} (${porGrupo(clases)}), requiere_pro = true.`,
  ];
}

export function generarSqlTrigonometria(o: OpcionesSqlTrigonometria): string {
  const existentes = o.tecnicas.filter((t) => t.existente);
  const nuevas = o.tecnicas.filter((t) => !t.existente);
  const partes: string[] = [];
  partes.push(
    `-- ============================================================\n${[
      ...o.cabecera,
      "",
      ...resumenTrigonometria(o.tecnicas, o.clases),
      "",
      "Este archivo se GENERA desde src/lib/trigonometria/lecciones/ (fuente única) y",
      "lecciones.test.ts comprueba que coincida. No editar a mano.",
      "Regenerar: TRIGONOMETRIA_ESCRIBIR_SQL=1 npx vitest run src/lib/trigonometria/lecciones",
    ]
      .map((l) => (l === "" ? "--" : `-- ${l}`))
      .join("\n")}\n-- ============================================================`
  );
  if (existentes.length > 0) {
    partes.push(`-- 1) Técnicas que ya existían: se actualizan por slug (español neutro, quiz corregido, visuales, bloque y orden).\n\n${existentes.map(updateExistente).join("\n\n")}`);
  }
  if (nuevas.length > 0) {
    partes.push(
      `-- 2) Técnicas nuevas (requiere_pro = false).\ninsert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values\n\n${nuevas.map((t) => valorInsert(t, false)).join(",\n\n")};`
    );
  }
  if (o.clases.length > 0) {
    partes.push(
      `-- 3) Clases (requiere_pro = true): un curso lineal en orden pedagógico; la primera es preview gratis.\ninsert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values\n\n${o.clases.map((c) => valorInsert(c, true)).join(",\n\n")};`
    );
  }
  return partes.join("\n\n") + "\n";
}

// Cabecera de la migración de esta fase.
export const CABECERA_TRIGONOMETRIA: string[] = [
  "Prodigia — Trigonometría: rediseño del mundo, fase 1 (Aprender pasa a",
  "Técnicas | Clases con 6 bloques en orden de colegio; docs/PARIDAD_MUNDOS.md",
  "filas 22/23 y la sección \"Trigonometría: rediseño del mundo (fase 1)\").",
  "",
  "Antes: 5 Técnicas mnemotécnicas (0108 + quiz de 0177 + fix de 0180), sin",
  "Clases y sin visuales, con voseo rioplatense. Ahora:",
  "  - las 5 Técnicas existentes se REESCRIBEN por slug: español neutro, precisiones",
  "    matemáticas, quiz revisado y visuales (los ids de las filas no cambian, así",
  "    que el progreso de quien ya las completó se conserva);",
  "  - Técnicas nuevas por bloque (razones, círculo, gráficas, leyes, identidades y",
  "    ecuaciones);",
  "  - Clases nuevas: un curso lineal de 27 lecciones, de los lados del triángulo",
  "    rectángulo a las ecuaciones trigonométricas.",
  "",
  "Los bloques 3 (gráficas y periodo) y 6 (ecuaciones) se enseñan acá pero todavía",
  "no tienen modo de práctica: es la fase 2 (skill_levels, duelos, reto diario,",
  "nivel de mundo y logros). Esta migración NO toca skill_levels.",
  "",
  "Todo dato matemático sale de funciones puras con tests (src/lib/trigonometria/",
  "{exactos,triangulos,ondas,ecuaciones,identidades}.ts): valores exactos",
  "contrastados con Math.* y una tabla curada, triángulos resueltos con métodos",
  "independientes, ondas con la función evaluada, ecuaciones verificadas por",
  "sustitución y con barrido de soluciones, identidades evaluadas en decenas de",
  "ángulos. Las lecciones traen `contenido.visuales` con los visuales",
  "\"trigonometria.*\" y el primitivo genérico \"cuadros\".",
  "",
  "Efecto conocido: agregar filas `techniques` cambia el total de lecciones del",
  "nivel de mundo (registrar_puntos_mundo) para quien no tenga Pro: las Clases",
  "cuentan en el total pero el plan gratuito no puede completarlas (mismo caso",
  "documentado para Calculia en PARIDAD_MUNDOS.md). Se deja así a propósito.",
];
