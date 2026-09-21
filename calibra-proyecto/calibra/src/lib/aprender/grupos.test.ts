import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { GRUPOS_APRENDER, agruparNodos } from "@/lib/aprender/grupos";

const DIR = path.resolve(__dirname, "../../../supabase/migrations");

// Todos los slugs de `techniques` sembrados en las migraciones de un mundo:
// filas `('<mundo>-...', 'Nombre'` dentro de un insert a techniques.
// Se leen las migraciones UNA sola vez (son cientos de archivos: repetirlo por
// mundo tardaba más que el timeout de 5 s bajo carga).
const SQL_TECNICAS = readdirSync(DIR)
  .filter((n) => n.endsWith(".sql"))
  .map((f) => readFileSync(path.join(DIR, f), "utf8"))
  .filter((sql) => /insert into public\.techniques/i.test(sql));

function slugsSembrados(mundo: string): string[] {
  const slugs = new Set<string>();
  for (const sql of SQL_TECNICAS) {
    const re = new RegExp(String.raw`\(\s*'(${mundo}-[a-z0-9-]+)'\s*,\s*'`, "g");
    for (const m of sql.matchAll(re)) slugs.add(m[1]);
  }
  return [...slugs].filter((s) => !/-(explorador|nivel-5|100)$/.test(s));
}

describe("temas del panel de Aprender", () => {
  for (const mundo of ["calculia", "circuitia", "estadistica", "naipia", "codia"]) {
    it(`${mundo}: cada técnica y clase sembrada cae en un tema (nada en "Otras")`, () => {
      const sembrados = slugsSembrados(mundo);
      expect(sembrados.length).toBeGreaterThanOrEqual(10);
      const cubiertos = new Set(
        [...GRUPOS_APRENDER[mundo].tecnicas, ...GRUPOS_APRENDER[mundo].clases].flatMap((gr) => gr.slugs)
      );
      expect(sembrados.filter((s) => !cubiertos.has(s))).toEqual([]);
      // y ningún tema apunta a un slug inexistente (typo)
      expect([...cubiertos].filter((s) => !sembrados.includes(s))).toEqual([]);
    });
  }

  it("agruparNodos conserva el orden, omite temas vacíos y manda lo desconocido a Otras", () => {
    const nodos = [{ slug: "codia-tecnica-leer-bucles" }, { slug: "x-desconocido" }, { slug: "codia-tecnica-tabla-seguimiento" }];
    const r = agruparNodos(nodos, "codia", "tecnicas", "es");
    expect(r.map((gr) => gr.nombre)).toEqual(["Trazado y lectura", "Otras"]);
    expect(r[0].nodos.map((n) => n.slug)).toEqual(["codia-tecnica-leer-bucles", "codia-tecnica-tabla-seguimiento"]);
  });
});
