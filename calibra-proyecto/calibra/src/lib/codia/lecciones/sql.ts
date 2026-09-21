import { fences, type LeccionCodia } from "./tipos";

// Genera la migración 0193_codia_contenido.sql a partir del contenido
// tipado (única fuente). lecciones.test.ts compara este texto con el
// archivo del repo, así que la migración no puede quedar desincronizada
// de lo que se verificó ejecutando.

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

export function contenidoJson(l: LeccionCodia): string {
  const contenido = {
    pasos: l.pasos.map(fences),
    quiz: l.quiz.map((q) => ({
      pregunta: fences(q.pregunta),
      opciones: q.opciones,
      respuesta: q.respuesta,
      explicacion: q.explicacion,
    })),
  };
  return JSON.stringify(contenido, null, 2);
}

export function generarSqlCodia(lecciones: LeccionCodia[]): string {
  const filas = lecciones.map(
    (l) =>
      `('${esc(l.slug)}', '${esc(l.nombre)}',\n  '${esc(l.descripcion)}',\n  'codia',\n  $codia$${contenidoJson(l)}$codia$::jsonb,\n  ${l.orden}, ${l.requierePro ? "true" : "false"})`
  );
  return `-- ============================================================
-- Prodigia — Codia (mundo 13): contenido de Aprender.
--
-- 5 Técnicas GRATIS (orden 1-5, requiere_pro=false) y 8 Clases PRO
-- (orden 6-13, requiere_pro=true; la primera fila requiere_pro=true es
-- preview gratis, ver src/lib/aprender/clases.ts). Las Clases son
-- progresivas y dependientes: variables y tipos -> condicionales ->
-- bucles -> funciones -> listas y diccionarios -> recorridos y
-- complejidad -> errores y depuración -> pilas, colas y conjuntos, con
-- el mismo ejemplo en Python, Java, JavaScript y TypeScript.
--
-- Este archivo se GENERA desde src/lib/codia/lecciones/ (fuente única) y
-- src/lib/codia/lecciones/lecciones.test.ts EJECUTA de verdad cada
-- fragmento de código (python, javac + JVM, node, typescript): la salida
-- mostrada en cada lección es la salida real. No editar a mano.
--
-- La validación del quiz vive en el server (/api/aprender/completar):
-- quien no es Pro no puede aprobar una clase requiere_pro.
-- Idempotente (on conflict por slug). Requiere 0189 (techniques admite
-- problem_type='codia') y 0170 (columna requiere_pro).
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values
${filas.join(",\n")}
on conflict (slug) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  problem_type = excluded.problem_type,
  contenido = excluded.contenido,
  orden = excluded.orden,
  requiere_pro = excluded.requiere_pro;
`;
}
