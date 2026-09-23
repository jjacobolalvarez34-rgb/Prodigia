import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_ANATOMIA } from "./registro";
import { TECNICAS_ANATOMIA, CLASES_ANATOMIA } from "@/lib/anatomia/lecciones";
import { NOMBRE_REGION, resolverEntradasCuerpo, resolverEtapas, resolverGrupos, resolverHuesos } from "@/lib/anatomia/visualesDatos";
import type { VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";

// Tests de RENDER de los 4 visuales de Anatomía con react-dom/server (sin
// navegador), mismo patrón que src/components/geografia/visuales/visuales.test.ts.
// En SSR el esqueleto NO trae el SVG (se pide con fetch en el cliente): se
// verifica el marco accesible, la lista de nombres y la alternativa textual;
// el dibujo resaltado real se vio en el navegador.
const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Anatomia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Anatomia: MENSAJES[idioma].Anatomia, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_ANATOMIA })
    )
  );
}

const TODAS = [...TECNICAS_ANATOMIA, ...CLASES_ANATOMIA];

describe("visuales de Anatomía: las 43 lecciones reales se dibujan sin romper", () => {
  it("cada visual se renderiza (animado y estático, es y en) con marco accesible, controles y alternativa textual", () => {
    let total = 0;
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${leccion.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(300);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
            expect(salida, donde).toContain("<figcaption");
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Anatomia.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            expect(salida, donde).toContain("<button"); // controles
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(300);
  }, 120_000);
});

describe("anatomia.esqueleto", () => {
  it("lista los nombres de los huesos (tomados de la práctica) y los declara en la alternativa", () => {
    const salida = html({ tipo: "anatomia.esqueleto", huesos: ["femur", "tibia", "perone"], estatico: true });
    for (const n of ["Fémur", "Tibia", "Peroné"]) expect(salida).toContain(n);
    expect(salida).toContain("Fémur, Tibia, Peroné");
    expect(salida).toContain("dominio público");
  });

  it("descarta claves que no son huesos del SVG y repetidas; sin ninguna válida se omite", () => {
    expect(resolverHuesos(["femur", "femur", "no-existe", 3, "__proto__", "constructor"]).map((h) => h.clave)).toEqual(["femur"]);
    expect(html({ tipo: "anatomia.esqueleto", huesos: ["no-existe"] })).toBe("");
    expect(html({ tipo: "anatomia.esqueleto", huesos: "femur" })).toBe("");
    expect(html({ tipo: "anatomia.esqueleto" })).toBe("");
  });

  it("recorta a 8 huesos como máximo", () => {
    const todas = ["femur", "humero", "tibia", "perone", "radio", "cubito", "columna", "craneo", "pelvis", "carpianos"];
    expect(resolverHuesos(todas)).toHaveLength(8);
  });

  it("un CSS de resaltado por instancia: las claves resaltadas salen solo de la lista validada", () => {
    const salida = html({ tipo: "anatomia.esqueleto", huesos: ["femur", "x\"]{}", "humero"], estatico: true });
    expect(salida).not.toContain('x"]{}');
    expect(salida).toContain('data-hueso="humero"');
  });
});

describe("anatomia.cuerpo", () => {
  it("dibuja las dos vistas, el nombre, la región y la nota honesta de que es un esquema", () => {
    const salida = html({
      tipo: "anatomia.cuerpo",
      entradas: [{ nombre: "Hígado", regiones: ["abdomen"], detalle: "arriba a la derecha" }],
      estatico: true,
    });
    expect(salida).toContain("Hígado");
    expect(salida).toContain("Vista anterior");
    expect(salida).toContain("Vista posterior");
    expect(salida).toContain("Región: abdomen");
    expect(salida).toContain("no un dibujo anatómico");
    expect((salida.match(/<rect/g) ?? []).length).toBeGreaterThan(20);
  });

  it("una entrada posterior resalta la figura de atrás y lo dice", () => {
    const salida = html({ tipo: "anatomia.cuerpo", entradas: [{ nombre: "Trapecio", regiones: ["cuello", "torax"], vista: "posterior" }], estatico: true });
    expect(salida).toContain("por detrás");
    expect(salida).toContain("cuello, tórax");
  });

  it("regiones e entradas inválidas se descartan; sin entradas válidas se omite", () => {
    expect(resolverEntradasCuerpo([{ nombre: "X", regiones: ["marte"] }, { nombre: "", regiones: ["cabeza"] }, null, 5])).toEqual([]);
    expect(html({ tipo: "anatomia.cuerpo", entradas: [{ nombre: "X", regiones: ["marte"] }] })).toBe("");
    expect(resolverEntradasCuerpo([{ nombre: "A", regiones: ["cabeza", "cabeza", "marte"] }])[0].regiones).toEqual(["cabeza"]);
  });

  it("los nombres de región están todos definidos", () => {
    for (const r of ["cabeza", "cuello", "hombro", "torax", "abdomen", "pelvis", "brazo", "antebrazo", "muslo", "pierna"] as const) {
      expect(NOMBRE_REGION[r].length).toBeGreaterThan(2);
    }
  });
});

describe("anatomia.grupos", () => {
  it("muestra cada grupo, sus ítems, las marcas y los detalles (todo en la alternativa accesible)", () => {
    const salida = html({
      tipo: "anatomia.grupos",
      grupos: [
        { nombre: "Sensitivos", items: [{ texto: "Olfatorio", marca: "I", detalle: "olfato" }] },
        { nombre: "Cara", items: [{ texto: "Maxilar" }, { texto: "Nasal" }] },
      ],
      estatico: true,
    });
    expect(salida).toContain("Sensitivos");
    expect(salida).toContain("Olfatorio");
    expect(salida).toContain("Maxilar");
    expect(salida).toContain("Sensitivos: I Olfatorio (olfato). Cara: Maxilar, Nasal");
  });

  it("datos malos: grupos sin nombre o sin ítems se descartan; nada válido = se omite; máximo 6 grupos", () => {
    expect(resolverGrupos([{ nombre: "A", items: [] }, { items: [{ texto: "x" }] }, "x"])).toEqual([]);
    expect(html({ tipo: "anatomia.grupos", grupos: [] })).toBe("");
    const siete = Array.from({ length: 7 }, (_, i) => ({ nombre: `G${i}`, items: [{ texto: "x" }] }));
    expect(resolverGrupos(siete)).toHaveLength(6);
  });
});

describe("anatomia.flujo", () => {
  it("numera las etapas en orden, con sus detalles, y agrega la nota de ciclo si corresponde", () => {
    const salida = html({
      tipo: "anatomia.flujo",
      etapas: [{ titulo: "Boca", detalle: "se mastica" }, { titulo: "Esófago" }],
      ciclo: true,
      estatico: true,
    });
    expect(salida.indexOf("Boca")).toBeGreaterThan(-1);
    expect(salida.indexOf("Esófago")).toBeGreaterThan(salida.indexOf("Boca"));
    expect(salida).toContain("Boca (se mastica) → Esófago");
    expect(salida).toContain("es un ciclo");
    expect(html({ tipo: "anatomia.flujo", etapas: [{ titulo: "A" }], estatico: true })).not.toContain("es un ciclo");
  });

  it("datos malos: etapas sin título se descartan; máximo 10; sin nada válido se omite", () => {
    expect(resolverEtapas([{ detalle: "x" }, { titulo: "  " }, 7])).toEqual([]);
    expect(html({ tipo: "anatomia.flujo", etapas: [] })).toBe("");
    expect(resolverEtapas(Array.from({ length: 12 }, (_, i) => ({ titulo: `E${i}` })))).toHaveLength(10);
  });
});

describe("CuerpoVisual: cada visual de Anatomía va justo debajo de su paso, en las lecciones reales", () => {
  it("el orden es paso i, sus visuales, paso i+1", () => {
    for (const leccion of TODAS) {
      const registro = Object.fromEntries(
        [...Object.keys(REGISTRO_VISUALES_ANATOMIA), "cuadros"].map((tipo) => [
          tipo,
          (({ visual }: { visual: { tipo: string } }) => createElement("i", { "data-visual": visual.tipo })) as never,
        ])
      );
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Anatomia: MENSAJES.es.Anatomia, Aprender: MENSAJES.es.Aprender } as never },
          createElement(CuerpoVisual, { pasos: leccion.pasos, visuales: leccion.visuales as DatosVisual[], registro })
        )
      );
      // Cada visual con despuesDePaso = i debe aparecer antes del paso i+1.
      const posicionesPaso = leccion.pasos.map((p) => salida.indexOf(p.slice(0, 40).replace(/&/g, "&amp;").replace(/'/g, "&#x27;")));
      leccion.visuales.forEach((v) => {
        const i = v.despuesDePaso!;
        expect(posicionesPaso[i], `${leccion.slug}: no se encontró el paso ${i + 1} en el HTML`).toBeGreaterThanOrEqual(0);
        const idxVisual = salida.indexOf(`data-visual="${v.tipo}"`, Math.max(0, posicionesPaso[i]));
        expect(idxVisual, `${leccion.slug}: falta ${v.tipo}`).toBeGreaterThanOrEqual(0);
        if (i + 1 < leccion.pasos.length && posicionesPaso[i + 1] >= 0) {
          expect(idxVisual, `${leccion.slug}: ${v.tipo} debe ir antes del paso ${i + 2}`).toBeLessThan(posicionesPaso[i + 1]);
        }
      });
    }
  });
});
