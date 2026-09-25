// Genera supabase/migrations/0221_espanol_neutro_lecciones.sql: corrige el voseo
// que quedó en el CONTENIDO YA SEMBRADO de las lecciones (techniques y
// logic_techniques: nombre, descripcion y contenido jsonb — pasos, ejemplo y
// quiz) usando el mismo mapeo de scripts/normalizar-espanol-fuente.mjs.
// Uso: node scripts/generar-migracion-neutro-lecciones.mjs
import { readFileSync, writeFileSync } from "node:fs";

const fuente = readFileSync("scripts/normalizar-espanol-fuente.mjs", "utf8");
const tokensTxt = fuente.slice(fuente.indexOf("const TOKENS = ["), fuente.indexOf("const PAREJAS"));

// Fuera: identidades, frases con espacio, y palabras que también existen en tuteo
// con otro significado ("tomate", "sos", "vos" — el SQL corre sobre TODA la tabla).
const EXCLUIR = new Set(["tomate", "sos", "vos", "dale", "clickeá"]);
const pares = [];
const vistos = new Set();
for (const m of tokensTxt.matchAll(/\["([^"]+)",\s*"([^"]+)"\]/g)) {
  const [, a, b] = m;
  if (a === b || a.includes(" ") || EXCLUIR.has(a) || vistos.has(a)) continue;
  vistos.add(a);
  pares.push([a, b]);
}
// "clickeá" -> "haz clic" solo en minúscula/capitalizado, aparte para no romper la
// capitalización de la primera letra de la frase.
pares.push(["clickeá", "haz clic"]);

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const todos = [];
for (const [a, b] of pares) {
  todos.push([a, b]);
  todos.push([cap(a), cap(b)]);
}
const esc = (s) => s.replace(/'/g, "''");
const arreglo = todos.map(([a, b]) => `    array['${esc(a)}', '${esc(b)}']`).join(",\n");

const sql = `-- ============================================================
-- Prodigia — español neutro (sin voseo) en las lecciones ya sembradas.
--
-- Las migraciones de contenido anteriores (Numeria, Anatomía, Calculia, Circuitia,
-- Estadística, Codia...) dejaron imperativos rioplatenses ("Trazá", "anotá",
-- "calculá", "Ordená"...) en \`techniques\` y \`logic_techniques\` (nombre,
-- descripcion y contenido: pasos, ejemplo y quiz). Prodigia usa tuteo neutro
-- (docs/PARIDAD_MUNDOS.md, fila 24).
--
-- Reemplaza, por palabra completa (sin tocar "partícula" por "partí"), cada forma
-- de voseo por su equivalente neutro. Es una migración de datos: no cambia el
-- esquema, no toca slugs, orden, requiere_pro ni progreso, y solo escribe las
-- filas que realmente cambian. El quiz cambia SOLO de redacción: la respuesta
-- correcta (índice) queda igual, y /api/aprender/completar valida contra la
-- misma fila de la base.
--
-- Idempotente: volver a correrla no encuentra voseo y no modifica nada.
-- Se GENERA con scripts/generar-migracion-neutro-lecciones.mjs; no editar a mano.
-- ============================================================

do $neutro$
declare
  pares text[][] := array[
${arreglo}
  ];
  -- Una palabra completa: no precedida ni seguida de una letra. El "\\\\n" del
  -- jsonb::text (salto de línea escapado) también cuenta como inicio de palabra.
  pre constant text := '(?:(?<![[:alpha:]])|(?<=\\\\n))';
  pos constant text := '(?![[:alpha:]])';
  r record;
  tabla text;
  n_nombre text;
  n_desc text;
  n_cont text;
  i int;
begin
  foreach tabla in array array['techniques', 'logic_techniques'] loop
    for r in execute format('select id, nombre, descripcion, contenido::text as contenido from public.%I', tabla) loop
      n_nombre := r.nombre;
      n_desc := r.descripcion;
      n_cont := r.contenido;
      for i in 1 .. array_length(pares, 1) loop
        n_nombre := regexp_replace(n_nombre, pre || pares[i][1] || pos, pares[i][2], 'g');
        if n_desc is not null then
          n_desc := regexp_replace(n_desc, pre || pares[i][1] || pos, pares[i][2], 'g');
        end if;
        n_cont := regexp_replace(n_cont, pre || pares[i][1] || pos, pares[i][2], 'g');
      end loop;
      if n_nombre is distinct from r.nombre
         or n_desc is distinct from r.descripcion
         or n_cont is distinct from r.contenido then
        execute format('update public.%I set nombre = $1, descripcion = $2, contenido = $3::jsonb where id = $4', tabla)
          using n_nombre, n_desc, n_cont, r.id;
      end if;
    end loop;
  end loop;
end
$neutro$;
`;

writeFileSync("supabase/migrations/0221_espanol_neutro_lecciones.sql", sql, "utf8");
console.log(`0221 escrita: ${pares.length} formas (${todos.length} con capitalización).`);
