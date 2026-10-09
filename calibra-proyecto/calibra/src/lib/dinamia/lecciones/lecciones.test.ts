import { describe, expect, it } from "vitest";
import katex from "katex";
import fs from "node:fs";
import path from "node:path";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";
import { revisarEscena } from "@/lib/dibujo/revisarEscena";
import { escenaDinamia } from "@/lib/dinamia/escenas";
import { TIPOS_VISUALES_DINAMIA, type VisualDinamia } from "@/lib/dinamia/visuales";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import { CLASES_DINAMIA, LECCIONES_DINAMIA, ORDEN_GRUPOS_DINAMIA, TECNICAS_DINAMIA } from "./index";
import { generarSqlDinamia } from "./sql";

// Verificación del contenido de Aprender de Dinamia (fuente única de la
// migración de contenido). Regenerar la migración:
// DINAMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/dinamia/lecciones
const NUMERO_MIGRACION = "0264";
const ruta = path.resolve(__dirname, "../../../..", "supabase", "migrations", `${NUMERO_MIGRACION}_dinamia_contenido.sql`);

// Todos los textos visibles de una lección (para KaTeX y español neutro).
function textos(l: (typeof LECCIONES_DINAMIA)[number]): string[] {
  const out = [l.nombre, l.descripcion, ...l.pasos];
  for (const q of l.quiz) out.push(q.pregunta, q.respuesta, q.explicacion, ...q.opciones);
  for (const v of l.visuales) {
    if (v.titulo) out.push(v.titulo);
    if (v.tipo === "cuadros") for (const c of v.cuadros) out.push(c.texto ?? "", c.resaltar ?? "", c.formula ? `$${c.formula}$` : "");
  }
  return out.filter(Boolean);
}

describe("lecciones de Dinamia", () => {
  it("24 Técnicas gratis y 30 Clases Pro, con slugs únicos y orden correlativo", () => {
    expect(TECNICAS_DINAMIA).toHaveLength(24);
    expect(CLASES_DINAMIA).toHaveLength(30);
    expect(TECNICAS_DINAMIA.every((t) => !t.requierePro)).toBe(true);
    expect(CLASES_DINAMIA.every((c) => c.requierePro)).toBe(true);
    const slugs = LECCIONES_DINAMIA.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^dinamia-[a-z0-9-]+$/);
    expect(LECCIONES_DINAMIA.map((l) => l.orden)).toEqual(Array.from({ length: 54 }, (_, i) => i + 1));
  });

  it("cada tema tiene sus Técnicas y sus Clases (como el plan: 4 Técnicas por tema)", () => {
    for (const g of ORDEN_GRUPOS_DINAMIA) {
      expect(TECNICAS_DINAMIA.filter((t) => t.grupo === g), g).toHaveLength(4);
      expect(CLASES_DINAMIA.filter((c) => c.grupo === g).length, g).toBeGreaterThanOrEqual(4);
    }
  });

  it("GRUPOS_APRENDER.dinamia pone cada lección en su tema", () => {
    const def = GRUPOS_APRENDER.dinamia;
    for (const l of LECCIONES_DINAMIA) {
      const lista = l.requierePro ? def.clases : def.tecnicas;
      expect(lista.find((g) => g.slugs.includes(l.slug))?.id, l.slug).toBe(l.grupo);
    }
  });

  for (const l of LECCIONES_DINAMIA) {
    it(`${l.slug}: pasos, animaciones y quiz bien formados`, () => {
      expect(l.nombre.length).toBeGreaterThan(3);
      expect(l.descripcion.length).toBeGreaterThan(10);
      expect(l.pasos.length).toBeGreaterThanOrEqual(3);
      expect(l.visuales.length).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v)).toBe(true);
        if (v.tipo === "cuadros") continue;
        expect((TIPOS_VISUALES_DINAMIA as readonly string[]).includes(v.tipo), v.tipo).toBe(true);
        const e = escenaDinamia(v as VisualDinamia);
        expect(e, JSON.stringify(v)).not.toBeNull();
        expect(revisarEscena(e!)).toEqual([]);
      }
      expect(l.quiz).toHaveLength(l.requierePro ? 3 : 2);
      for (const q of l.quiz) {
        expect(q.opciones, q.pregunta).toContain(q.respuesta);
        expect(new Set(q.opciones).size, q.pregunta).toBe(q.opciones.length);
        expect(q.explicacion.length).toBeGreaterThan(5);
      }
    });
  }

  it("toda la notación compila en KaTeX y el texto está en español neutro", () => {
    for (const l of LECCIONES_DINAMIA) {
      for (const t of textos(l)) {
        for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${l.slug}: ${m[1]}`).not.toThrow();
        expect(detectarVoseo(t), `${l.slug}: ${t}`).toEqual([]);
      }
    }
  }, 60_000);

  it(`la migración ${NUMERO_MIGRACION} es exactamente lo que se genera del contenido`, () => {
    const sql = generarSqlDinamia(LECCIONES_DINAMIA, NUMERO_MIGRACION);
    if (process.env.DINAMIA_ESCRIBIR_SQL) fs.writeFileSync(ruta, sql);
    expect(fs.readFileSync(ruta, "utf8").replace(/\r\n/g, "\n")).toBe(sql);
  });
});
