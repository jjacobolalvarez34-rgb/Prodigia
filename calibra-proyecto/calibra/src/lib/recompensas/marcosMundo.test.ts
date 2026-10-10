import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CIUDADES } from "./catalogo";
import { CIUDADES_CON_MARCO, svgMarcoMundo } from "./marcosMundo";
import { MARCOS_MUNDO } from "@/types/database";

// Los archivos de public/marcos son lo que genera marcosMundo.ts (la web los sirve como
// imagen; la app dibuja el mismo SVG con SvgXml). Para regenerarlos:
// MARCOS_ESCRIBIR=1 npx vitest run src/lib/recompensas/marcosMundo.test.ts
const DIR = path.resolve(__dirname, "../../../public/marcos");

describe("marcos de ciudad", () => {
  it("hay un marco por cada ciudad y MARCOS_MUNDO apunta a su SVG", () => {
    expect([...CIUDADES_CON_MARCO].sort()).toEqual(CIUDADES.map((c) => c.slug).sort());
    for (const c of CIUDADES_CON_MARCO) expect(MARCOS_MUNDO[c]?.imagen).toBe(`/marcos/marco_${c}.svg`);
  });

  for (const c of CIUDADES_CON_MARCO) {
    it(`${c}: el archivo coincide con el generador y no tapa la foto`, () => {
      const svg = svgMarcoMundo(c)!;
      expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 200 200"/);
      expect(svg).not.toMatch(/NaN|undefined/);
      // Ningún círculo con relleno ni trazo por dentro del radio de la foto (77).
      for (const m of svg.matchAll(/<circle cx="100" cy="100" r="([\d.]+)"/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(77);
      const ruta = path.join(DIR, `marco_${c}.svg`);
      if (process.env.MARCOS_ESCRIBIR === "1") fs.writeFileSync(ruta, svg + "\n", "utf8");
      expect(fs.readFileSync(ruta, "utf8").replace(/\r\n/g, "\n")).toBe(svg + "\n");
    });
  }
});
