import type { TecnicaAnatomia, ClaseAnatomia, PreguntaLeccionAnatomia } from "./tipos";
import type { VisualAnatomia } from "@/lib/anatomia/visuales";

// Número y nombre de la migración generada. lecciones.test.ts compara este
// texto con el archivo del repo, así que la migración no puede quedar
// desincronizada del contenido tipado (fuente única). Mismo patrón que
// src/lib/geografia/lecciones/sql.ts.
export const ARCHIVO_MIGRACION_ANATOMIA = "0212_anatomia_tecnicas_clases.sql";

function escaparSql(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(c: { pasos: string[]; visuales: VisualAnatomia[]; quiz: PreguntaLeccionAnatomia[] }): string {
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

export function generarSqlAnatomia(tecnicas: TecnicaAnatomia[], clases: ClaseAnatomia[], slugsHistoricos: string[]): string {
  const historicas = tecnicas.filter((t) => slugsHistoricos.includes(t.slug));
  const nuevas = tecnicas.filter((t) => !slugsHistoricos.includes(t.slug));

  // UPDATE por slug: reescribe nombre/descripción/contenido de las 5
  // Técnicas viejas (español neutro + visuales + quiz ampliado).
  const updateTecnica = (t: TecnicaAnatomia) =>
    `update public.techniques\nset nombre = '${escaparSql(t.nombre)}',\n  descripcion = '${escaparSql(t.descripcion)}',\n  contenido = $anatomia$${contenidoJson(t)}$anatomia$::jsonb,\n  orden = ${t.orden},\n  requiere_pro = false\nwhere problem_type = 'anatomia' and slug = '${escaparSql(t.slug)}';`;
  const filaTecnica = (t: TecnicaAnatomia) =>
    `('${escaparSql(t.slug)}', '${escaparSql(t.nombre)}',\n  '${escaparSql(t.descripcion)}',\n  'anatomia',\n  $anatomia$${contenidoJson(t)}$anatomia$::jsonb,\n  ${t.orden},\n  false)`;
  const filaClase = (c: ClaseAnatomia) =>
    `('${escaparSql(c.slug)}', '${escaparSql(c.nombre)}',\n  '${escaparSql(c.descripcion)}',\n  'anatomia',\n  $anatomia$${contenidoJson(c)}$anatomia$::jsonb,\n  ${c.orden},\n  true)`;

  const porGrupo = (g: string) => `${tecnicas.filter((t) => t.grupo === g).length} Técnicas y ${clases.filter((c) => c.grupo === g).length} Clases`;

  return `-- ============================================================
-- Prodigia — Anatomía: Técnicas | Clases completas (docs/PARIDAD_MUNDOS.md
-- filas 22 y 23). Antes Anatomía tenía 5 Técnicas (0081_mundo_anatomia.sql,
-- con quiz en 0173) y 0 Clases; la práctica evalúa huesos, músculos,
-- órganos y sistema nervioso, y Aprender no cubría casi nada de eso.
--
-- ${tecnicas.length} Técnicas (requiere_pro=false): ${historicas.length} históricas REESCRITAS por slug con UPDATE (corrige el
-- voseo de 0081 y errores de contenido, ver docs/PARIDAD_MUNDOS.md
-- "Anatomía: Técnicas | Clases") y ${nuevas.length} INSERT nuevas. Por sistema: óseo ${porGrupo("oseo").split(" y ")[0]}, muscular ${porGrupo("muscular").split(" y ")[0]},
-- órganos ${porGrupo("organos").split(" y ")[0]}, nervioso ${porGrupo("nervioso").split(" y ")[0]}.
--
-- ${clases.length} Clases nuevas (requiere_pro=true): óseo ${porGrupo("oseo").split(" y ")[1]}, muscular ${porGrupo("muscular").split(" y ")[1]},
-- órganos ${porGrupo("organos").split(" y ")[1]}, nervioso ${porGrupo("nervioso").split(" y ")[1]}. Cada sistema es un curso independiente (orden de
-- dependencia DENTRO del sistema); la primera Clase de todas (posición
-- anatómica y planos) es preview gratis. Ver src/lib/anatomia/path.ts.
--
-- 4 primitivos de visual nuevos (src/components/anatomia/visuales/):
-- "anatomia.esqueleto" (resalta huesos sobre el SVG real de dominio
-- público que ya usa la práctica), "anatomia.cuerpo" (esquema de regiones,
-- NO un dibujo anatómico), "anatomia.grupos" y "anatomia.flujo" (cajas y
-- flechas). Cada Técnica y Clase trae al menos un visual y un quiz con
-- \`explicacion\` y la \`respuesta\` literal dentro de \`opciones\`.
--
-- Orden de las sentencias: primero los UPDATE de las filas existentes,
-- después los INSERT — un slug nuevo nunca pisa uno existente
-- (unique (problem_type, slug)) y las columnas requiere_pro/orden ya
-- existen (0170). No se tocan technique_progress: quien ya dominó una
-- técnica histórica la sigue teniendo dominada.
--
-- Este archivo se GENERA desde src/lib/anatomia/lecciones/ (fuente única)
-- y lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: ANATOMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/anatomia/lecciones
-- ============================================================

${historicas.map(updateTecnica).join("\n\n")}

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${nuevas.map(filaTecnica).join(",\n\n")};

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${clases.map(filaClase).join(",\n\n")};
`;
}
