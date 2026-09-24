import type { TecnicaMelodia, ClaseMelodia, PreguntaLeccionMelodia, VisualLeccionMelodia } from "./tipos";

// Número y nombre de la migración generada. lecciones.test.ts compara este
// texto con el archivo del repo, así que la migración no puede quedar
// desincronizada del contenido tipado (fuente única). Mismo patrón que
// src/lib/anatomia/lecciones/sql.ts.
export const ARCHIVO_MIGRACION_MELODIA = "0213_melodia_tecnicas_clases.sql";

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: { pasos: string[]; visuales: VisualLeccionMelodia[]; quiz: PreguntaLeccionMelodia[] }): string {
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

export function generarSqlMelodia(tecnicas: TecnicaMelodia[], clases: ClaseMelodia[], slugsHistoricos: string[]): string {
  const historicas = tecnicas.filter((t) => slugsHistoricos.includes(t.slug));
  const nuevas = tecnicas.filter((t) => !slugsHistoricos.includes(t.slug));

  // UPDATE por slug: reescribe nombre/descripción/contenido de las 5
  // Técnicas viejas (español neutro + visuales + quiz ampliado).
  const updateTecnica = (t: TecnicaMelodia) =>
    `update public.techniques\nset nombre = '${escaparSql(t.nombre)}',\n  descripcion = '${escaparSql(t.descripcion)}',\n  contenido = $melodia$${contenidoJson(t)}$melodia$::jsonb,\n  orden = ${t.orden},\n  requiere_pro = false\nwhere problem_type = 'melodia' and slug = '${escaparSql(t.slug)}';`;
  const filaTecnica = (t: TecnicaMelodia) =>
    `('${escaparSql(t.slug)}', '${escaparSql(t.nombre)}',\n  '${escaparSql(t.descripcion)}',\n  'melodia',\n  $melodia$${contenidoJson(t)}$melodia$::jsonb,\n  ${t.orden},\n  false)`;
  const filaClase = (c: ClaseMelodia) =>
    `('${escaparSql(c.slug)}', '${escaparSql(c.nombre)}',\n  '${escaparSql(c.descripcion)}',\n  'melodia',\n  $melodia$${contenidoJson(c)}$melodia$::jsonb,\n  ${c.orden},\n  true)`;

  const nt = (g: string) => tecnicas.filter((t) => t.grupo === g).length;
  const nc = (g: string) => clases.filter((c) => c.grupo === g).length;
  const grupos = ["fundamentos", "lectura", "alteraciones", "escalas", "acordes", "oido_absoluto"];
  const detalleT = grupos.map((g) => `${g} ${nt(g)}`).join(", ");
  const detalleC = grupos.map((g) => `${g} ${nc(g)}`).join(", ");

  return `-- ============================================================
-- Prodigia — Melodía: Técnicas | Clases completas (docs/PARIDAD_MUNDOS.md
-- filas 22 y 23). Antes Melodía tenía 5 Técnicas (0089_mundo_melodia.sql,
-- con quiz en 0174) y 0 Clases; la práctica evalúa figuras y cifrado,
-- lectura en pentagrama, alteraciones, escalas, 14 tipos de acordes y oído,
-- y Aprender no cubría casi nada de eso.
--
-- ${tecnicas.length} Técnicas (requiere_pro=false): ${historicas.length} históricas REESCRITAS por slug con UPDATE (corrige el
-- voseo de 0089 y errores de contenido, ver docs/PARIDAD_MUNDOS.md
-- "Melodía: Técnicas | Clases") y ${nuevas.length} INSERT nuevas. Por grupo (modo de
-- práctica): ${detalleT}.
--
-- ${clases.length} Clases nuevas (requiere_pro=true): ${detalleC}. Cada grupo
-- es un curso independiente (orden de dependencia DENTRO del grupo); la
-- primera Clase de todas (el sonido y la nota) es preview gratis. Ver
-- src/lib/melodia/path.ts.
--
-- 6 primitivos de visual nuevos (src/components/melodia/visuales/):
-- "melodia.pentagrama", "melodia.teclado", "melodia.escala",
-- "melodia.acorde", "melodia.ritmo" y "melodia.frecuencia". Las escalas, los
-- acordes y las frecuencias NO se guardan tipeadas: se guardan sus
-- parámetros (fundamental, tipo) y el componente llama a las mismas
-- funciones puras que la práctica. Cada Técnica y Clase trae al menos un
-- visual y un quiz con \`explicacion\` y la \`respuesta\` literal dentro de
-- \`opciones\`.
--
-- Orden de las sentencias: primero los UPDATE de las filas existentes,
-- después los INSERT — un slug nuevo nunca pisa uno existente
-- (unique (problem_type, slug)) y las columnas requiere_pro/orden ya
-- existen (0170). No se tocan technique_progress: quien ya dominó una
-- técnica histórica la sigue teniendo dominada.
--
-- Este archivo se GENERA desde src/lib/melodia/lecciones/ (fuente única)
-- y lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: MELODIA_ESCRIBIR_SQL=1 npx vitest run src/lib/melodia/lecciones
-- ============================================================

${historicas.map(updateTecnica).join("\n\n")}

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${nuevas.map(filaTecnica).join(",\n\n")};

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${clases.map(filaClase).join(",\n\n")};
`;
}
