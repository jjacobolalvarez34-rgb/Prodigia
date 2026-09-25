import { readFileSync } from "node:fs";
import path from "node:path";

// SOLO PARA TESTS. El contenido de las lecciones que sembraron migraciones viejas
// (0165, 0170, 0181, 0195...) trae voseo; 0221_espanol_neutro_lecciones.sql lo
// corrige en la base. Los tests que comparan el contenido tipado (ya en español
// neutro) contra "lo sembrado" pasan lo sembrado por aquí para ver el estado
// FINAL de la base tras 0221: mismo mapa y misma regla de "palabra completa".
const RUTA = path.resolve(__dirname, "../../../supabase/migrations/0221_espanol_neutro_lecciones.sql");

let regla: [RegExp, string][] | null = null;

function reglas(): [RegExp, string][] {
  if (!regla) {
    const sql = readFileSync(RUTA, "utf8");
    regla = [...sql.matchAll(/array\['([^']*)', '([^']*)'\]/g)].map(
      (m) => [new RegExp(String.raw`(?<![\p{L}])${m[1]}(?![\p{L}])`, "gu"), m[2]] as [RegExp, string]
    );
  }
  return regla;
}

export function aNeutro(texto: string): string {
  let out = texto;
  for (const [re, neutro] of reglas()) out = out.replace(re, neutro);
  return out;
}

// Aplica aNeutro a todo string dentro de un valor JSON-like (objetos, arrays, filas).
export function aNeutroProfundo<T>(valor: T): T {
  if (typeof valor === "string") return aNeutro(valor) as T;
  if (Array.isArray(valor)) return valor.map((v) => aNeutroProfundo(v)) as T;
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, aNeutroProfundo(v)])) as T;
  }
  return valor;
}
