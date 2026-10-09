import type { LeccionDinamia } from "./tipos";

// Genera la migración de contenido de Aprender de Dinamia desde las lecciones
// tipadas (fuente única). lecciones.test.ts compara este texto con el archivo
// del repo, así que la migración no puede quedar desincronizada.

const lit = (s: string) => `'${s.replace(/'/g, "''")}'`;

export function contenidoJson(l: LeccionDinamia): string {
  return JSON.stringify({ pasos: l.pasos, visuales: l.visuales, quiz: l.quiz });
}

export function generarSqlDinamia(lecciones: LeccionDinamia[], numero: string): string {
  const filas = lecciones.map(
    (l) => `(${lit(l.slug)}, ${lit(l.nombre)},\n  ${lit(l.descripcion)},\n  'dinamia',\n  $dinamia$${contenidoJson(l)}$dinamia$::jsonb,\n  ${l.orden}, ${l.requierePro})`
  );
  const tecnicas = lecciones.filter((l) => !l.requierePro).length;
  const clases = lecciones.length - tecnicas;
  return `-- ============================================================
-- Prodigia — Dinamia (mundo 14, Física): contenido de Aprender (migración ${numero}).
--
-- ${tecnicas} Técnicas GRATIS (requiere_pro = false) y ${clases} Clases PRO (requiere_pro =
-- true; la primera es la gratis del mundo), en 6 temas: Cinemática, Vectores,
-- Leyes de Newton, Trabajo y energía, Termodinámica y Fluidos
-- (docs/PLAN_MUNDOS_FISICA_BIOLOGIA.md §3). Cada lección trae sus pasos, una o
-- más animaciones (\`dinamia.*\`, dibujadas por src/lib/dinamia/escenas.ts en la
-- web y la app) y su quiz (se valida por igualdad exacta en
-- /api/aprender/completar). Los temas salen de GRUPOS_APRENDER.dinamia.
--
-- Requiere 0263 (techniques admite problem_type 'dinamia'). Idempotente: on
-- conflict (slug) actualiza la fila.
--
-- Este archivo se GENERA desde src/lib/dinamia/lecciones/ (fuente única) y
-- lecciones.test.ts comprueba que coincida. No editar a mano. Regenerar:
-- DINAMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/dinamia/lecciones
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
