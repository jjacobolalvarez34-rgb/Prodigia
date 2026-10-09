import { describe, expect, it } from "vitest";
import katex from "katex";
import fs from "node:fs";
import path from "node:path";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";
import { revisarEscena } from "@/lib/dibujo/revisarEscena";
import { escenaVitalia } from "@/lib/vitalia/escenas";
import { TIPOS_VISUALES_VITALIA, type VisualVitalia } from "@/lib/vitalia/visuales";
import { detectarVoseo } from "@/lib/texto/espanolNeutro";
import { CLASES_VITALIA, LECCIONES_VITALIA, ORDEN_GRUPOS_VITALIA, TECNICAS_VITALIA } from "./index";
import { generarSqlVitalia } from "./sql";

// Verificación del contenido de Aprender de Vitalia (fuente única de la
// migración de contenido). Regenerar la migración:
// VITALIA_ESCRIBIR_SQL=1 npx vitest run src/lib/vitalia/lecciones
const NUMERO_MIGRACION = "0265";
const ruta = path.resolve(__dirname, "../../../..", "supabase", "migrations", `${NUMERO_MIGRACION}_vitalia_contenido.sql`);

// Todos los textos visibles de una lección (para KaTeX y español neutro).
function textos(l: (typeof LECCIONES_VITALIA)[number]): string[] {
  const out = [l.nombre, l.descripcion, ...l.pasos];
  for (const q of l.quiz) out.push(q.pregunta, q.respuesta, q.explicacion, ...q.opciones);
  for (const v of l.visuales) {
    if (v.titulo) out.push(v.titulo);
    if (v.tipo === "cuadros") for (const c of v.cuadros) out.push(c.texto ?? "", c.resaltar ?? "", c.formula ? `$${c.formula}$` : "");
  }
  return out.filter(Boolean);
}

describe("lecciones de Vitalia", () => {
  it("26 Técnicas gratis y 34 Clases Pro, con slugs únicos y orden correlativo", () => {
    expect(TECNICAS_VITALIA).toHaveLength(26);
    expect(CLASES_VITALIA).toHaveLength(34);
    expect(TECNICAS_VITALIA.every((t) => !t.requierePro)).toBe(true);
    expect(CLASES_VITALIA.every((c) => c.requierePro)).toBe(true);
    const slugs = LECCIONES_VITALIA.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^vitalia-[a-z0-9-]+$/);
    expect(LECCIONES_VITALIA.map((l) => l.orden)).toEqual(Array.from({ length: 60 }, (_, i) => i + 1));
  });

  it("cada tema tiene al menos 4 Técnicas y 4 Clases", () => {
    for (const g of ORDEN_GRUPOS_VITALIA) {
      expect(TECNICAS_VITALIA.filter((t) => t.grupo === g).length, g).toBeGreaterThanOrEqual(4);
      expect(CLASES_VITALIA.filter((c) => c.grupo === g).length, g).toBeGreaterThanOrEqual(4);
    }
  });

  it("GRUPOS_APRENDER.vitalia pone cada lección en su tema", () => {
    const def = GRUPOS_APRENDER.vitalia;
    for (const l of LECCIONES_VITALIA) {
      const lista = l.requierePro ? def.clases : def.tecnicas;
      expect(lista.find((g) => g.slugs.includes(l.slug))?.id, l.slug).toBe(l.grupo);
    }
  });

  for (const l of LECCIONES_VITALIA) {
    it(`${l.slug}: pasos, animaciones y quiz bien formados`, () => {
      expect(l.nombre.length).toBeGreaterThan(3);
      expect(l.descripcion.length).toBeGreaterThan(10);
      expect(l.pasos.length).toBeGreaterThanOrEqual(3);
      expect(l.visuales.length).toBeGreaterThanOrEqual(1);
      for (const v of l.visuales) {
        expect(esVisualLeccion(v)).toBe(true);
        if (v.tipo === "cuadros") continue;
        expect((TIPOS_VISUALES_VITALIA as readonly string[]).includes(v.tipo), v.tipo).toBe(true);
        const e = escenaVitalia(v as VisualVitalia);
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
    for (const l of LECCIONES_VITALIA) {
      for (const t of textos(l)) {
        for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${l.slug}: ${m[1]}`).not.toThrow();
        expect(detectarVoseo(t), `${l.slug}: ${t}`).toEqual([]);
      }
    }
  }, 60_000);

  it(`la migración ${NUMERO_MIGRACION} es exactamente lo que se genera del contenido`, () => {
    const sql = generarSqlVitalia(LECCIONES_VITALIA, NUMERO_MIGRACION);
    if (process.env.VITALIA_ESCRIBIR_SQL) fs.writeFileSync(ruta, sql);
    expect(fs.readFileSync(ruta, "utf8").replace(/\r\n/g, "\n")).toBe(sql);
  });
});
