import { describe, expect, it } from "vitest";
import { leccionesFuente, type MundoTraducible } from "./fuentes";
import { resolverBloques, textosTraducibles, validarTraduccion, type TraduccionLeccion } from "./traducir";

// Validación temporal de UN mundo sin registrarlo: MUNDO=historia npx vitest run src/lib/i18n-lecciones/validar-un-mundo.test.ts
const mundo = process.env.MUNDO as MundoTraducible | undefined;
const PALABRAS_ES = /\b(los|las|del|para|una|con|por|que|esta|este|como|pero|cuando|entonces)\b/i;

describe.skipIf(!mundo)("validar un mundo", () => {
  it("la traducción cumple todas las reglas", async () => {
    const mod = (await import(`./en/${mundo}`)) as Record<string, Record<string, TraduccionLeccion>>;
    const traducciones = Object.values(mod)[0];
    const fuentes = leccionesFuente(mundo as MundoTraducible);
    const porSlug = new Map(fuentes.map((f) => [f.slug, f]));
    const problemas: string[] = [];
    for (const f of fuentes) if (!traducciones[f.slug]) problemas.push(`falta ${f.slug}`);
    for (const [slug, cruda] of Object.entries(traducciones)) {
      const f = porSlug.get(slug);
      if (!f) {
        problemas.push(`slug inexistente ${slug}`);
        continue;
      }
      const tr = resolverBloques(f, cruda);
      problemas.push(...validarTraduccion(f, tr));
      if ((tr.visuales ?? []).length !== textosTraducibles(f.visuales).length) {
        problemas.push(`${slug}: visuales ${(tr.visuales ?? []).length} y la fuente tiene ${textosTraducibles(f.visuales).length}`);
      }
      const textos = [tr.nombre, tr.descripcion ?? "", ...tr.pasos, ...(tr.visuales ?? [])];
      for (const q of tr.quiz ?? []) textos.push(q.pregunta, q.explicacion ?? "", ...q.opciones);
      for (const t of textos) {
        const limpio = t.replace(/```[\s\S]*?```/g, " ").replace(/~~~[\s\S]*?~~~/g, " ").replace(/\$[^$]*\$/g, " ");
        const m = PALABRAS_ES.exec(limpio);
        if (m) problemas.push(`${slug}: «${m[0]}» en «${limpio.slice(0, 70)}»`);
      }
    }
    expect(problemas).toEqual([]);
  });
});
