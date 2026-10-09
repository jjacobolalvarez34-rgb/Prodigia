import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { leccionesFuente, TABLA_DE, type MundoTraducible } from "./fuentes";
import { encabezadoMigracion, REGISTRO_TRADUCCIONES } from "./registro";
import { generarSqlTraducciones, resolverBloques, textosTraducibles, validarTraduccion } from "./traducir";

const DIR_MIGRACIONES = path.resolve(__dirname, "../../../supabase/migrations");

// Palabras del español que no existen en inglés: si aparecen en un texto en inglés (fuera de
// fórmulas y bloques de código), casi seguro quedó una frase sin traducir.
const PALABRAS_ES = /\b(los|las|del|para|una|con|por|que|esta|este|como|pero|cuando|entonces)\b/i;

function sinFormulasNiCodigo(s: string): string {
  return s.replace(/```[\s\S]*?```/g, " ").replace(/\$[^$]*\$/g, " ");
}

const mundos = Object.keys(REGISTRO_TRADUCCIONES) as MundoTraducible[];

describe("traducciones de lecciones al inglés", () => {
  it("hay al menos un mundo registrado", () => {
    expect(mundos.length).toBeGreaterThan(0);
  });

  for (const mundo of mundos) {
    const entrada = REGISTRO_TRADUCCIONES[mundo]!;
    const fuentes = leccionesFuente(mundo);
    const porSlug = new Map(fuentes.map((f) => [f.slug, f]));

    describe(mundo, () => {
      it("cada slug traducido existe en el mundo (sin slugs inventados) y sin repetidos", () => {
        const huerfanos = Object.keys(entrada.traducciones).filter((s) => !porSlug.has(s));
        expect(huerfanos).toEqual([]);
      });

      it("si el mundo se declara completo, todas sus lecciones están traducidas", () => {
        const faltan = fuentes.filter((f) => !entrada.traducciones[f.slug]).map((f) => f.slug);
        if (entrada.completo) expect(faltan).toEqual([]);
      });

      it("cada traducción respeta la forma de la lección en español (pasos, quiz, visuales, fórmulas y código)", () => {
        const errores: string[] = [];
        for (const [slug, tr] of Object.entries(entrada.traducciones)) {
          const f = porSlug.get(slug);
          if (f) errores.push(...validarTraduccion(f, resolverBloques(f, tr)));
        }
        expect(errores).toEqual([]);
      });

      it("no quedan frases en español en los textos en inglés", () => {
        const sospechosos: string[] = [];
        for (const [slug, trCruda] of Object.entries(entrada.traducciones)) {
          const f0 = porSlug.get(slug);
          const tr = f0 ? resolverBloques(f0, trCruda) : trCruda;
          const textos = [tr.nombre, tr.descripcion ?? "", ...tr.pasos, ...(tr.visuales ?? [])];
          for (const q of tr.quiz ?? []) textos.push(q.pregunta, q.explicacion ?? "", ...q.opciones);
          for (const t of textos) {
            const limpio = sinFormulasNiCodigo(t);
            const m = PALABRAS_ES.exec(limpio);
            if (m) sospechosos.push(`${slug}: «${m[0]}» en «${limpio.slice(0, 70)}»`);
          }
        }
        expect(sospechosos).toEqual([]);
      });

      it("tiene la misma cantidad de textos de visual que la fuente (el orden lo fija textosTraducibles)", () => {
        for (const [slug, tr] of Object.entries(entrada.traducciones)) {
          const f = porSlug.get(slug);
          if (f) expect((tr.visuales ?? []).length, slug).toBe(textosTraducibles(f.visuales).length);
        }
      });

      it(`la migración ${entrada.migracion} es exactamente lo generado`, () => {
        const filas = fuentes
          .filter((f) => entrada.traducciones[f.slug])
          .map((f) => ({ fuente: f, traduccion: resolverBloques(f, entrada.traducciones[f.slug]) }));
        const numero = entrada.migracion.slice(0, 4);
        const esperado = generarSqlTraducciones(encabezadoMigracion(mundo, filas.length, numero), TABLA_DE(mundo), null, filas, "leccion_en");
        const ruta = path.join(DIR_MIGRACIONES, entrada.migracion);
        if (process.env.I18N_LECCIONES_ESCRIBIR_SQL === "1") fs.writeFileSync(ruta, esperado, "utf8");
        expect(fs.existsSync(ruta), `falta ${entrada.migracion}: I18N_LECCIONES_ESCRIBIR_SQL=1 npx vitest run src/lib/i18n-lecciones`).toBe(true);
        expect(fs.readFileSync(ruta, "utf8").replace(/\r\n/g, "\n")).toBe(esperado);
        // Solo hace update de las columnas nuevas.
        expect(esperado).not.toMatch(/^\s*(insert|delete|drop|alter|create|truncate)\b/im);
        expect((esperado.match(/^update public\./gm) ?? []).length).toBe(filas.length);
      });
    });
  }
});

// Pedido del 2026-10-09 («que nada se escape»): una lección que se agrega en una
// migración y nunca pasa por el registro de arriba quedaba en español sin que nada
// avisara (así quedaron afuera el curso de Numeria de 0251, la ampliación de Melodía
// de 0253, el curso de Calculia de 0254, los lenguajes de Codia de 0255 y una lección
// suelta de Trigonometría de 0147). Esta prueba lee TODAS las migraciones: cada slug
// que se inserta en techniques o logic_techniques (y no se borra después) tiene que
// tener su nombre_en en alguna migración.
describe("ninguna lección de las migraciones queda sin inglés", () => {
  it("cada lección insertada tiene una migración que le llena nombre_en", () => {
    const archivos = fs.readdirSync(DIR_MIGRACIONES).filter((f) => f.endsWith(".sql")).sort();
    const insertadas = new Map<string, string>();
    const borradas = new Set<string>();
    const conIngles = new Set<string>();
    for (const archivo of archivos) {
      const sql = fs.readFileSync(path.join(DIR_MIGRACIONES, archivo), "utf8").replace(/\r\n/g, "\n");
      for (const m of sql.matchAll(/insert into (?:public\.)?(?:logic_techniques|techniques)\s*\(([^)]*)\)\s*values([\s\S]*?);\s*$/gim)) {
        if (!m[1].split(",").map((c) => c.trim()).includes("slug")) continue;
        for (const t of m[2].matchAll(/\(\s*'([a-z0-9][a-z0-9_-]+)'/g)) if (!insertadas.has(t[1])) insertadas.set(t[1], archivo);
      }
      for (const m of sql.matchAll(/delete from (?:public\.)?(?:logic_techniques|techniques)\s+where\s+slug\s*(?:=|in)\s*\(?([^;]*)/gi)) {
        for (const t of m[1].matchAll(/'([a-z0-9_-]+)'/g)) borradas.add(t[1]);
      }
      for (const m of sql.matchAll(/nombre_en\s*=[\s\S]*?where\s+slug\s*=\s*'([^']+)'/gi)) conIngles.add(m[1]);
    }
    const faltan = [...insertadas].filter(([slug]) => !borradas.has(slug) && !conIngles.has(slug)).map(([slug, archivo]) => `${slug} (${archivo})`);
    expect(faltan).toEqual([]);
  });
});
