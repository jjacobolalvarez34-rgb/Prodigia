import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_TRIGONOMETRIA } from "./registro";
import { TIPOS_VISUAL_TRIGONOMETRIA } from "@/lib/trigonometria/visuales";
import { TECNICAS_TRIGONOMETRIA, CLASES_TRIGONOMETRIA } from "@/lib/trigonometria/lecciones";

// Tests de RENDER de los visuales de Trigonometría con react-dom/server (sin
// navegador), mismo patrón que src/components/anatomia/visuales/visuales.test.ts:
// marco accesible, controles, alternativa textual, cero NaN/undefined y todos los
// mensajes es/en resueltos. El dibujo real (giro del radio, curvas, colores,
// solapes a 360 px) se vio en el navegador.
const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Trigonometria: unknown; Aprender: unknown; Common?: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Trigonometria: MENSAJES[idioma].Trigonometria, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_TRIGONOMETRIA })
    )
  );
}

const MUESTRAS = [
  { tipo: "trigonometria.triangulo", catetos: [3, 4], vertice: "A", pasos: ["hipotenusa", "opuesto", "adyacente", "sen", "cos", "tan", "cosec", "sec", "cot"] },
  { tipo: "trigonometria.triangulo", catetos: [5, 12], vertice: "B" },
  { tipo: "trigonometria.resolver", modo: "lado", angulo: 35, dado: "c", valor: 12, pedido: "a" },
  { tipo: "trigonometria.resolver", modo: "lado", angulo: 52, dado: "a", valor: 8, pedido: "c" },
  { tipo: "trigonometria.resolver", modo: "angulo", lados: [{ lado: "a", valor: 3 }, { lado: "b", valor: 4 }] },
  { tipo: "trigonometria.circulo", angulos: [30, 150, 210, 330, 90], mostrar: ["referencia"] },
  { tipo: "trigonometria.circulo", angulos: [60, 420, -60], unidad: "radianes" },
  { tipo: "trigonometria.cuadrantes", referencia: 30 },
  { tipo: "trigonometria.onda", onda: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "amplitud", "periodo", "puntos"] },
  { tipo: "trigonometria.onda", onda: { fn: "sen", a: 2, b: 3, c: [1, 6], d: 1 }, base: { fn: "sen" }, rango: [0, 2], pasos: ["curva", "amplitud", "periodo", "desfase", "vertical", "puntos"] },
  { tipo: "trigonometria.onda", onda: { fn: "tan", b: 2 }, rango: [-1, 1], pasos: ["curva", "periodo", "asintotas"] },
  { tipo: "trigonometria.ley", ley: "seno", datos: { A: 40, B: 65, a: 12 } },
  { tipo: "trigonometria.ley", ley: "coseno", datos: { a: 8, b: 11, C: 50 } },
  { tipo: "trigonometria.ley", ley: "area", datos: { a: 10, b: 7, C: 35 } },
  { tipo: "trigonometria.ley", ley: "ambiguo", datos: { a: 7, b: 10, A: 30 } },
  { tipo: "trigonometria.ley", ley: "ambiguo", datos: { a: 4, b: 10, A: 30 } },
  { tipo: "trigonometria.ecuacion", fn: "sen", gradosValor: 30 },
  { tipo: "trigonometria.ecuacion", fn: "tan", gradosValor: 45 },
  { tipo: "trigonometria.identidad", angulo: 30, forma: "derivadas" },
  { tipo: "trigonometria.mano" },
];

describe("visuales de Trigonometría: se dibujan sin romper (muestras de todos los tipos)", () => {
  it("todos los tipos declarados tienen componente registrado y muestra", () => {
    expect(Object.keys(REGISTRO_VISUALES_TRIGONOMETRIA).sort()).toEqual([...TIPOS_VISUAL_TRIGONOMETRIA].sort());
    expect(new Set(MUESTRAS.map((m) => m.tipo))).toEqual(new Set(TIPOS_VISUAL_TRIGONOMETRIA));
  });

  it("cada muestra se renderiza (animada y estática, es y en) con marco accesible, alternativa textual y sin basura", () => {
    for (const visual of MUESTRAS) {
      for (const estatico of [false, true]) {
        for (const idioma of ["es", "en"]) {
          const salida = html({ ...visual, estatico }, idioma);
          const donde = `${visual.tipo} ${JSON.stringify(visual).slice(0, 60)} estatico=${estatico} ${idioma}`;
          expect(salida.length, donde).toBeGreaterThan(300);
          expect(salida, donde).toContain('role="group"');
          expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
          expect(salida, donde).toContain("<figcaption");
          expect(salida.replace(/<annotation[\s\S]*?<\/annotation>/g, ""), donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
          expect(salida, donde).not.toContain("Trigonometria.visuales");
          expect(salida, donde).not.toContain("Aprender.visual");
          if (visual.tipo !== "trigonometria.mano") expect(salida, donde).toContain("<button");
        }
      }
    }
  });

  it("los datos inválidos se omiten sin romper la lección", () => {
    for (const visual of [
      { tipo: "trigonometria.triangulo", catetos: [0, 4], vertice: "A" },
      { tipo: "trigonometria.triangulo", catetos: "3,4", vertice: "A" },
      { tipo: "trigonometria.resolver", modo: "lado", angulo: 120, dado: "a", valor: 5, pedido: "b" },
      { tipo: "trigonometria.resolver", modo: "raro" },
      { tipo: "trigonometria.circulo", angulos: [10] },
      { tipo: "trigonometria.circulo", angulos: [] },
      { tipo: "trigonometria.circulo" },
      { tipo: "trigonometria.cuadrantes", referencia: 33 },
      { tipo: "trigonometria.onda", onda: { fn: "sin" }, rango: [0, 2] },
      { tipo: "trigonometria.onda", onda: { fn: "sen" }, rango: [2, 0] },
      { tipo: "trigonometria.onda", onda: { fn: "sen" } },
      { tipo: "trigonometria.ley", ley: "seno", datos: {} },
      { tipo: "trigonometria.ley", ley: "coseno" },
      { tipo: "trigonometria.ecuacion", fn: "tan", gradosValor: 90 },
      { tipo: "trigonometria.ecuacion", fn: "sen", gradosValor: 10 },
      { tipo: "trigonometria.identidad", angulo: 90 },
    ]) {
      expect(html(visual), JSON.stringify(visual)).toBe("");
    }
  });
});

describe("visuales de Trigonometría: las lecciones reales se dibujan sin romper", () => {
  const TODAS = [...TECNICAS_TRIGONOMETRIA, ...CLASES_TRIGONOMETRIA];

  it("cada visual de cada Técnica y Clase se renderiza (es y en, animado y estático)", () => {
    let total = 0;
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        if (!v.tipo.startsWith("trigonometria.")) continue;
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${leccion.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(300);
            expect(salida, donde).toContain('role="group"');
            expect(salida.replace(/<annotation[\s\S]*?<\/annotation>/g, ""), donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Trigonometria.visuales");
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(200);
  }, 300_000);

  it("CuerpoVisual arma una lección completa (pasos + visuales) sin romper", () => {
    for (const leccion of [TECNICAS_TRIGONOMETRIA[0], CLASES_TRIGONOMETRIA[0], CLASES_TRIGONOMETRIA[11]]) {
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Trigonometria: MENSAJES.es.Trigonometria, Aprender: MENSAJES.es.Aprender } as never },
          createElement(CuerpoVisual, { pasos: leccion.pasos, visuales: leccion.visuales, registro: REGISTRO_VISUALES_TRIGONOMETRIA })
        )
      );
      expect(salida).toContain("<figure");
      expect(salida).not.toMatch(/NaN|undefined/);
    }
  });
});
