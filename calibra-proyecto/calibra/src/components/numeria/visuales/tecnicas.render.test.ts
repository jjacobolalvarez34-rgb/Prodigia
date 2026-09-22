import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_NUMERIA } from "./registro";
import { TECNICAS_NUMERIA } from "@/lib/numeria/lecciones";

// Tests de RENDER de los visuales NUEVOS de las 39 Técnicas de Numeria
// (2026-09-22): cada visual real se dibuja sin excepciones (animado y
// estático, es/en) y los 4 primitivos nuevos (numeria.recta/potencia/
// balanza/figura) muestran los números exactos esperados para un
// ejemplo conocido — mismo criterio que visuales.test.ts (las 5 Clases).

const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Numeria: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Numeria: MENSAJES[idioma].Numeria, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_NUMERIA })
    )
  );
}

describe("visuales de las 39 Técnicas de Numeria: se dibujan sin romper", () => {
  it("cada visual de cada técnica se renderiza (animado y estático, es y en) con su alternativa textual", () => {
    let total = 0;
    for (const tec of TECNICAS_NUMERIA) {
      for (const v of tec.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${tec.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(200);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{6,}"/);
            expect(salida, donde).toContain("<figcaption");
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Numeria.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            expect(salida, donde).toContain("<button"); // controles
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(150);
  }, 60_000);

  it("CuerpoVisual: cada visual va justo debajo de su paso, en las 39 técnicas reales", () => {
    for (const tec of TECNICAS_NUMERIA) {
      const stub = (({ visual }: { visual: { tipo: string } }) => createElement("i", { "data-visual": visual.tipo })) as never;
      const registro = Object.fromEntries([...Object.keys(REGISTRO_VISUALES_NUMERIA), "cuadros"].map((tipo) => [tipo, stub]));
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Numeria: MENSAJES.es.Numeria, Aprender: MENSAJES.es.Aprender } as never },
          createElement(CuerpoVisual, { pasos: tec.pasos, visuales: tec.visuales, registro })
        )
      );
      for (const v of tec.visuales) {
        expect(salida, `${tec.slug}: falta ${v.tipo}`).toContain(`data-visual="${v.tipo}"`);
      }
    }
  });
});

describe("numeria.recta", () => {
  it("3/4 = 0.75: la marca y su etiqueta aparecen", () => {
    const salida = html({ tipo: "numeria.recta", min: 0, max: 1, marcas: [{ valor: 0.75, etiqueta: "3/4 = 0.75" }], estatico: true });
    expect(salida).toContain("0.75");
  });

  it("dos marcas (redondeo): 3.14159 y 3.14 aparecen", () => {
    const salida = html({
      tipo: "numeria.recta",
      min: 3.1,
      max: 3.2,
      marcas: [
        { valor: 3.14159, etiqueta: "3.14159" },
        { valor: 3.14, etiqueta: "3.14 (redondeado)" },
      ],
      estatico: true,
    });
    expect(salida).toContain("3.14159");
    expect(salida).toContain("3.14 (redondeado)");
  });

  it("max <= min, o sin marcas: se omite", () => {
    expect(html({ tipo: "numeria.recta", min: 1, max: 1, marcas: [{ valor: 1 }] })).toBe("");
    expect(html({ tipo: "numeria.recta", min: 0, max: 1, marcas: [] })).toBe("");
  });
});

describe("numeria.potencia", () => {
  it("modo cadena: 2^4 = 16, con los pasos intermedios 4, 8, 16", () => {
    const salida = html({ tipo: "numeria.potencia", modo: "cadena", base: 2, exponente: 4, estatico: true });
    expect(salida).toContain(">4<");
    expect(salida).toContain(">8<");
    expect(salida).toContain(">16<");
  });

  it("modo cuadricula: 7×7 = 49", () => {
    const salida = html({ tipo: "numeria.potencia", modo: "cuadricula", base: 7, exponente: 2, estatico: true });
    expect(salida).toContain("49");
  });

  it("cuadricula con exponente distinto de 2: se omite", () => {
    expect(html({ tipo: "numeria.potencia", modo: "cuadricula", base: 3, exponente: 3 })).toBe("");
  });

  it("base o exponente inválidos: se omite", () => {
    expect(html({ tipo: "numeria.potencia", modo: "cadena", base: 0, exponente: 4 })).toBe("");
    expect(html({ tipo: "numeria.potencia", modo: "cadena", base: 2, exponente: 1 })).toBe("");
  });
});

describe("numeria.balanza", () => {
  it("modo despejar: 2x+3=11 lleva a x=4", () => {
    const salida = html({ tipo: "numeria.balanza", modo: "despejar", coefX: 2, constante: 3, resultado: 11, estatico: true });
    expect(salida).toContain("x = 4");
  });

  it("modo verificar: sustituyendo x=4 confirma 11", () => {
    const salida = html({ tipo: "numeria.balanza", modo: "verificar", coefX: 2, constante: 3, resultado: 11, estatico: true });
    expect(salida).toContain("11");
  });

  it("coefX 0: se omite", () => {
    expect(html({ tipo: "numeria.balanza", modo: "despejar", coefX: 0, constante: 3, resultado: 11 })).toBe("");
  });
});

describe("numeria.figura", () => {
  it("triangulo: catetos 8 y 6 dan hipotenusa 10", () => {
    const salida = html({ tipo: "numeria.figura", modo: "triangulo", cateto1: 8, cateto2: 6, estatico: true });
    expect(salida).toContain("10");
  });

  it("areaCompuesta: 10x8 menos 3x2 = 74", () => {
    const salida = html({ tipo: "numeria.figura", modo: "areaCompuesta", anchoGrande: 10, altoGrande: 8, anchoRecorte: 3, altoRecorte: 2, estatico: true });
    expect(salida).toContain("74");
  });

  it("circulo: radio 7 (múltiplo de 7) da área 154 exacta", () => {
    const salida = html({ tipo: "numeria.figura", modo: "circulo", radio: 7, estatico: true });
    expect(salida).toContain("154");
  });

  it("angulos: suplementario de 125 da 55", () => {
    const salida = html({ tipo: "numeria.figura", modo: "angulos", tipoAngulo: "suplementario", conocido: 125, estatico: true });
    expect(salida).toContain("55");
  });

  it("triangulo con catetos inválidos: se omite", () => {
    expect(html({ tipo: "numeria.figura", modo: "triangulo", cateto1: 0, cateto2: 6 })).toBe("");
  });
});
