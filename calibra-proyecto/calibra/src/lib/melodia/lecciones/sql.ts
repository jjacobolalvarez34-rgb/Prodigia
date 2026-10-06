import type { TecnicaMelodia, ClaseMelodia, PreguntaLeccionMelodia, VisualLeccionMelodia } from "./tipos";

// Número y nombre de la migración generada. lecciones.test.ts compara este
// texto con el archivo del repo, así que la migración no puede quedar
// desincronizada del contenido tipado (fuente única). Mismo patrón que
// src/lib/anatomia/lecciones/sql.ts.
export const ARCHIVO_MIGRACION_MELODIA = "0213_melodia_tecnicas_clases.sql";
// Ampliación del 2026-10-06 (figuras cortas, oído de acordes, Tempo y compás).
export const ARCHIVO_MIGRACION_AMPLIACION_MELODIA = "0253_melodia_lecciones_figuras_acordes_tempo.sql";

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

// Migración de la ampliación: solo INSERT de lecciones nuevas (0213 ya está
// aplicada y no se regenera). Cada slug es nuevo; `on conflict do nothing`
// la deja correr dos veces sin error.
export function generarSqlAmpliacionMelodia(tecnicas: TecnicaMelodia[], clases: ClaseMelodia[]): string {
  const fila = (l: TecnicaMelodia | ClaseMelodia) =>
    `('${escaparSql(l.slug)}', '${escaparSql(l.nombre)}',\n  '${escaparSql(l.descripcion)}',\n  'melodia',\n  $melodia$${contenidoJson(l)}$melodia$::jsonb,\n  ${l.orden},\n  ${l.requierePro})`;
  const porGrupo = (ls: { grupo: string }[]) => {
    const conteo = new Map<string, number>();
    for (const l of ls) conteo.set(l.grupo, (conteo.get(l.grupo) ?? 0) + 1);
    return [...conteo].map(([g, n]) => `${g} ${n}`).join(", ");
  };
  return `-- ============================================================
-- Prodigia — Melodía: lecciones de la ampliación (pedido del usuario,
-- 2026-10-06). Acompañan lo que la Práctica empezó a evaluar ese día:
--   - Fundamentos: semicorchea, fusa, semifusa, puntillo y corcheas unidas.
--   - Oído absoluto: oído de acordes (tipo de tríada y acorde completo).
--   - Tempo y compás (grupo y modo nuevo, ver 0252_melodia_tempo.sql):
--     pulso, BPM, términos italianos y cifras de compás. Usa el visual
--     nuevo "melodia.metronomo".
--
-- ${tecnicas.length} Técnicas (requiere_pro=false): ${porGrupo(tecnicas)}.
-- ${clases.length} Clases (requiere_pro=true): ${porGrupo(clases)}.
-- Cada una continúa el \`orden\` de su grupo (0213 no se toca).
--
-- Requiere 0252. Este archivo se GENERA desde
-- src/lib/melodia/lecciones/ampliacion.ts y lecciones.test.ts comprueba que
-- coincida. No editar a mano.
-- Regenerar: MELODIA_ESCRIBIR_SQL=1 npx vitest run src/lib/melodia/lecciones
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

${[...tecnicas, ...clases].map(fila).join(",\n\n")}
on conflict (problem_type, slug) do nothing;
`;
}
