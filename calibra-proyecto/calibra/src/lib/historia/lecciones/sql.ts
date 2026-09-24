import type { TecnicaHistoria, ClaseHistoria, PreguntaLeccionHistoria, VisualLeccionHistoria } from "./tipos";
import { ORDEN_GRUPOS_HISTORIA, type GrupoHistoria } from "@/lib/historia/bloques";

// Genera la migración de Aprender de Historia a partir del contenido tipado (fuente
// única). lecciones.test.ts compara este texto con el archivo del repo, así que una
// migración no puede quedar desincronizada del contenido. Mismo patrón que
// src/lib/trigonometria/lecciones/sql.ts.
//
// ORDEN DE LAS OPERACIONES (importa): primero los UPDATE de las 5 filas que ya
// existían (0109 + quiz de 0176; por slug, solo `techniques`, sin tocar
// `technique_progress`, así nadie pierde lo que ya completó) y después los INSERT de
// las nuevas. `techniques.slug` es único y no hay restricción sobre `orden`, así que
// ningún paso puede chocar con otro. NO hay ALTER (requiere_pro existe desde 0170) ni
// se toca skill_levels.

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: { pasos: string[]; visuales: VisualLeccionHistoria[]; quiz: PreguntaLeccionHistoria[] }): string {
  const contenido = {
    pasos: c.pasos,
    visuales: c.visuales,
    quiz: c.quiz.map((q) => ({ pregunta: q.pregunta, opciones: q.opciones, respuesta: q.respuesta, explicacion: q.explicacion })),
  };
  return JSON.stringify(contenido, null, 2);
}

const valorInsert = (l: TecnicaHistoria | ClaseHistoria, requierePro: boolean) =>
  `('${escaparSql(l.slug)}', '${escaparSql(l.nombre)}',\n  '${escaparSql(l.descripcion)}',\n  'historia',\n  $historia$${contenidoJson(l)}$historia$::jsonb,\n  ${l.orden},\n  ${requierePro})`;

const updateExistente = (t: TecnicaHistoria) =>
  `update public.techniques\nset nombre = '${escaparSql(t.nombre)}',\n  descripcion = '${escaparSql(t.descripcion)}',\n  contenido = $historia$${contenidoJson(t)}$historia$::jsonb,\n  orden = ${t.orden},\n  requiere_pro = false\nwhere slug = '${escaparSql(t.slug)}' and problem_type = 'historia';`;

export interface OpcionesSqlHistoria {
  // Encabezado (líneas de comentario SIN el "-- " inicial).
  cabecera: string[];
  tecnicas: TecnicaHistoria[];
  clases: ClaseHistoria[];
}

function porGrupo<T extends { grupo: GrupoHistoria }>(lista: T[]): string {
  return ORDEN_GRUPOS_HISTORIA.map((g) => ({ g, n: lista.filter((x) => x.grupo === g).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.g} ${x.n}`)
    .join(", ");
}

export function resumenHistoria(tecnicas: TecnicaHistoria[], clases: ClaseHistoria[]): string[] {
  const nuevas = tecnicas.filter((t) => !t.existente);
  const existentes = tecnicas.filter((t) => t.existente);
  return [
    `Técnicas: ${tecnicas.length} en total (${porGrupo(tecnicas)}): ${existentes.length} ya existían (se ACTUALIZAN) y ${nuevas.length} son nuevas.`,
    `Clases: ${clases.length} (${porGrupo(clases)}), requiere_pro = true.`,
  ];
}

export function generarSqlHistoria(o: OpcionesSqlHistoria): string {
  const existentes = o.tecnicas.filter((t) => t.existente);
  const nuevas = o.tecnicas.filter((t) => !t.existente);
  const partes: string[] = [];
  partes.push(
    `-- ============================================================\n${[
      ...o.cabecera,
      "",
      ...resumenHistoria(o.tecnicas, o.clases),
      "",
      "Este archivo se GENERA desde src/lib/historia/lecciones/ (fuente única) y",
      "lecciones.test.ts comprueba que coincida. No editar a mano.",
      "Regenerar: HISTORIA_ESCRIBIR_SQL=1 npx vitest run src/lib/historia/lecciones",
    ]
      .map((l) => (l === "" ? "--" : `-- ${l}`))
      .join("\n")}\n-- ============================================================`
  );
  if (existentes.length > 0) {
    partes.push(`-- 1) Técnicas que ya existían: se actualizan por slug (español neutro, quiz revisado, visuales, época y orden).\n\n${existentes.map(updateExistente).join("\n\n")}`);
  }
  if (nuevas.length > 0) {
    partes.push(
      `-- 2) Técnicas nuevas (requiere_pro = false).\ninsert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values\n\n${nuevas.map((t) => valorInsert(t, false)).join(",\n\n")};`
    );
  }
  if (o.clases.length > 0) {
    partes.push(
      `-- 3) Clases (requiere_pro = true): se desbloquean por época; la primera del mundo es preview gratis.\ninsert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values\n\n${o.clases.map((c) => valorInsert(c, true)).join(",\n\n")};`
    );
  }
  return partes.join("\n\n") + "\n";
}

// Cabecera de la migración de esta fase.
export const CABECERA_HISTORIA: string[] = [
  "Prodigia — Historia: rediseño del mundo (Aprender pasa a Técnicas | Clases con 5",
  "bloques por época: Prehistoria, Antigüedad, Edad Media, Edad Moderna y Edad",
  "Contemporánea; docs/PARIDAD_MUNDOS.md filas 22/23 y la sección \"Historia: rediseño",
  "del mundo\").",
  "",
  "Antes: 5 Técnicas mnemotécnicas genéricas (0109 + quiz de 0176), sin Clases, sin",
  "visuales, sin contenido de historia y con voseo rioplatense. Ahora:",
  "  - las 5 Técnicas existentes se REESCRIBEN por slug: español neutro, ejemplos con",
  "    hechos reales, quiz revisado y visuales (los ids de las filas no cambian, así",
  "    que el progreso de quien ya las completó se conserva);",
  "  - Técnicas nuevas por época (4 a 6 por época), gratis;",
  "  - Clases nuevas por época (2 a 8 por época), Pro; se desbloquean por época y cada",
  "    una repasa en un paso \"Contexto:\" lo que usa de épocas anteriores. La primera",
  "    (Prehistoria) es preview gratis.",
  "",
  "Alcance: SOLO historia universal (sin bloque nacional). Del siglo XX y hasta hoy solo",
  "hechos de amplio consenso, con fecha y protagonistas, sin interpretación política ni",
  "cifras discutidas. Todo nombre y todo año sale de la tabla canónica",
  "src/lib/historia/{hechos,personajes}.ts (listada para revisión humana en",
  "docs/HISTORIA_HECHOS.md); las lecciones traen `contenido.visuales` con los visuales",
  "\"historia.*\" (que solo llevan ids de hechos y de personajes) y el primitivo genérico",
  "\"cuadros\". Esta migración NO toca skill_levels.",
  "",
  "Efecto conocido: agregar filas `techniques` cambia el total de lecciones del nivel de",
  "mundo (registrar_puntos_mundo) para quien no tenga Pro: las Clases cuentan en el total",
  "pero el plan gratuito no puede completarlas (mismo caso documentado para Calculia en",
  "PARIDAD_MUNDOS.md). Se deja así a propósito.",
];
