import type { TecnicaGeografia, TecnicaGeneralGeografia, ClaseGeografia, PreguntaLeccionGeografia } from "./tipos";
import type { VisualGeografia } from "@/lib/geografia/visuales";

// Genera la migración 0207_geografia_mas_contenido.sql a partir del
// contenido tipado (fuente única). lecciones.test.ts compara este texto
// con el archivo del repo, así que la migración no puede quedar
// desincronizada. Mismo patrón que src/lib/enigmia/lecciones/sql.ts
// (generarSqlEnigmia): estos slugs son INSERT nuevos, no existen filas
// todavía para ellos en `techniques`. `requiere_pro` ya existe en
// `techniques` desde 0170_calculia_curso_pro.sql — no hace falta
// agregarla de nuevo acá.

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: { pasos: string[]; visuales: VisualGeografia[]; quiz: PreguntaLeccionGeografia[] }): string {
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

export function generarSqlGeografia(tecnicas: TecnicaGeografia[], clases: ClaseGeografia[]): string {
  const filaTecnica = (t: TecnicaGeografia) =>
    `('${escaparSql(t.slug)}', '${escaparSql(t.nombre)}',\n  '${escaparSql(t.descripcion)}',\n  'geografia',\n  $geografia$${contenidoJson(t)}$geografia$::jsonb,\n  ${t.orden},\n  false)`;
  const filaClase = (c: ClaseGeografia) =>
    `('${escaparSql(c.slug)}', '${escaparSql(c.nombre)}',\n  '${escaparSql(c.descripcion)}',\n  'geografia',\n  $geografia$${contenidoJson(c)}$geografia$::jsonb,\n  ${c.orden},\n  true)`;

  return `-- ============================================================
-- Prodigia — Geografía: retrofit completo a Técnicas | Clases por
-- continente (docs/PARIDAD_MUNDOS.md fila 1: "Aprender tiene solo 3
-- lecciones totales — 3 lecciones genéricas para 4 regiones, ninguna por
-- continente. Gap de contenido, no de código" — y fila 22/23). Geografía
-- era el mundo más flaco de contenido de Aprender de todo el proyecto:
-- solo 3 Técnicas genéricas (0027_geografia_lecciones.sql,
-- dividir-en-subregiones / anclar-por-vecinos / forma-caracteristica) y 0
-- Clases.
--
-- ${tecnicas.length} Técnicas nuevas (requiere_pro=false), ${tecnicas.length / 4} por
-- continente — a diferencia de las 3 históricas (estrategias genéricas
-- que no mapean a un continente y quedan en el grupo "general", ver
-- src/lib/geografia/path.ts), cada una es un atajo de identificación
-- específico de un continente (forma, vecinos, fronteras, tamaño
-- relativo). Todas traen \`contenido.visuales\` con el primitivo nuevo
-- "geografia.mapa" (mapa real animado, ver más abajo).
--
-- ${clases.length} Clases nuevas (requiere_pro=true), ${clases.length / 4} por
-- continente — un curso progresivo real, una lección por sub-región
-- curada en src/lib/geografia/subregiones.ts (Cono Sur, Región Andina,
-- Centroamérica y el Caribe, Norteamérica; Europa Occidental, Europa del
-- Este, Escandinavia y el Báltico, Región Mediterránea; Norte de África,
-- África Occidental, África Oriental, África Austral; Asia Oriental,
-- Sudeste Asiático y Asia Meridional, Oriente Medio, Oceanía). La primera
-- Clase de cada continente es preview gratis — ver
-- src/lib/geografia/path.ts.
--
-- Alcance de sub-regiones (decisión explícita, ver el comentario de
-- cabecera de src/lib/geografia/subregiones.ts): NO se curó la
-- sub-región de los 153 países de PAISES_POR_CONTINENTE — solo de los
-- ~40 países "ancla" que estas Clases usan como ejemplo.
--
-- 1 primitivo de visual NUEVO ("geografia.mapa",
-- src/components/geografia/visuales/Mapa.tsx, registro.ts): reusa
-- react-simple-maps + el mismo topojson real de /geografia/practica
-- (mismo recorte por continente, src/lib/geografia/proyeccion.ts), y va
-- revelando 1 a 4 países con su nombre superpuesto — primer visual del
-- proyecto que envuelve un mapa real en vez de un primitivo dibujado a
-- mano. Las coordenadas de cada país salen de una tabla curada y
-- verificada en src/lib/geografia/visualesDatos.ts (resolverPaisesResaltados),
-- nunca hardcodeadas en el componente.
--
-- Cada quiz trae 3-4 preguntas, todas con \`explicacion\` y la
-- \`respuesta\` literal dentro de \`opciones\`, verificadas contra hechos
-- geográficos reales (nunca inventadas a mano).
--
-- Este archivo se GENERA desde src/lib/geografia/lecciones/ (fuente
-- única) y lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: GEOGRAFIA_ESCRIBIR_SQL=1 npx vitest run src/lib/geografia/lecciones
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${tecnicas.map(filaTecnica).join(",\n\n")};

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${clases.map(filaClase).join(",\n\n")};
`;
}

// Migración que REESCRIBE por slug las 3 Técnicas genéricas históricas
// (grupo "general"): las filas ya existen desde 0027 (+ quiz de 0172), así
// que acá va un update por slug —nunca se edita una migración vieja— que
// pisa nombre, descripción y contenido (español neutro + `visuales`).
export function generarSqlGeografiaGenerales(generales: TecnicaGeneralGeografia[], numero: string): string {
  const update = (t: TecnicaGeneralGeografia) =>
    `update public.techniques\nset nombre = '${escaparSql(t.nombre)}',\n  descripcion = '${escaparSql(t.descripcion)}',\n  contenido = $geografia$${contenidoJson(t)}$geografia$::jsonb\nwhere slug = '${escaparSql(t.slug)}' and problem_type = 'geografia';`;

  return `-- ============================================================
-- Prodigia — Geografía: las 3 Técnicas del grupo "general" pasan a tener
-- mapas animados y español neutro (migración ${numero}).
--
-- Las Técnicas genéricas históricas (0027_geografia_lecciones.sql, con el
-- quiz de 0172_geografia_lecciones_quiz.sql): dividir-en-subregiones,
-- anclar-por-vecinos y forma-caracteristica. Al hacer el retrofit por
-- continente (0208) solo las 20 Técnicas y 16 Clases nuevas recibieron el
-- visual "geografia.mapa"; estas 3 quedaron como texto plano, sin ninguna
-- animación, y con voseo rioplatense en los imperativos y los verbos,
-- contra la convención de español neutro (docs/ESPECIFICACION.md).
--
-- Se REESCRIBEN por slug (update, nunca se edita una migración vieja):
-- misma idea y mismos ejemplos de cada técnica, en español neutro, con
-- mapas animados de países reales (src/lib/geografia/visualesDatos.ts).
-- La fila conserva su \`orden\` y \`requiere_pro = false\`.
--
-- Este archivo se GENERA desde src/lib/geografia/lecciones/ (fuente
-- única) y lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: GEOGRAFIA_ESCRIBIR_SQL=1 npx vitest run src/lib/geografia/lecciones
-- ============================================================

${generales.map(update).join("\n\n")}
`;
}
