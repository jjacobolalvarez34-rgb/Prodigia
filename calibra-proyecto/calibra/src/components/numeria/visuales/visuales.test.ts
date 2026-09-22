import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_NUMERIA } from "./registro";
import { CLASES_NUMERIA } from "@/lib/numeria/lecciones";
import type { VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";

// Tests de RENDER de los visuales de Numeria y del dispatcher genérico,
// con react-dom/server (sin navegador): cada visual de las 5 Clases
// reales se dibuja sin excepciones (animado y estático, es/en) y
// contiene los números esperados, para un ejemplo conocido.

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

describe("visuales de Numeria: las 5 Clases reales se dibujan sin romper", () => {
  it("cada visual de cada clase se renderiza (animado y estático, es y en) con su alternativa textual", () => {
    let total = 0;
    for (const c of CLASES_NUMERIA) {
      for (const v of c.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${c.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
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
    expect(total).toBeGreaterThan(30);
  }, 60_000);
});

describe("numeria.columnas", () => {
  it("248 + 176: dígitos 8 y 6 de la columna de unidades aparecen en el tablero", () => {
    const salida = html({ tipo: "numeria.columnas", operacion: "suma", a: 248, b: 176, estatico: true });
    expect(salida).toContain(">8<");
    expect(salida).toContain(">6<");
  });

  it("el texto alternativo describe cada columna y el resultado final", () => {
    const salida = html({ tipo: "numeria.columnas", operacion: "suma", a: 248, b: 176, estatico: true });
    expect(salida).toContain("8 + 6");
    expect(salida).toContain("Se lleva 1");
    expect(salida).toContain("Resultado: 424");
  });

  it("resta 532 − 178: préstamo en unidades, resultado 354", () => {
    const salida = html({ tipo: "numeria.columnas", operacion: "resta", a: 532, b: 178, estatico: true });
    expect(salida).toContain("2 − 8");
    expect(salida).toContain("Pide prestado 1");
    expect(salida).toContain("Resultado: 354");
  });

  it("resta inválida (a < b) o números negativos: se omite sin romper", () => {
    expect(html({ tipo: "numeria.columnas", operacion: "resta", a: 5, b: 10 })).toBe("");
    expect(html({ tipo: "numeria.columnas", operacion: "suma", a: -1, b: 2 })).toBe("");
  });
});

describe("numeria.multiplicacion", () => {
  it("23 × 14 = 322, con los productos parciales 92 y 230", () => {
    const salida = html({ tipo: "numeria.multiplicacion", a: 23, b: 14, estatico: true });
    expect(salida).toContain("Producto parcial (dígito 4): 92");
    expect(salida).toContain("Producto parcial (dígito 1): 230");
    expect(salida).toContain("Suma de los productos parciales: 322");
  });

  it("factores no positivos: se omite", () => {
    expect(html({ tipo: "numeria.multiplicacion", a: 0, b: 5 })).toBe("");
    expect(html({ tipo: "numeria.multiplicacion", a: 5, b: -2 })).toBe("");
  });
});

describe("numeria.division", () => {
  it("937 ÷ 4: cociente 234, resto 1, y cada paso intermedio", () => {
    const salida = html({ tipo: "numeria.division", dividendo: 937, divisor: 4, estatico: true });
    expect(salida).toContain("9 ÷ 4 = 2");
    expect(salida).toContain("13 ÷ 4 = 3");
    expect(salida).toContain("17 ÷ 4 = 4");
    expect(salida).toContain("Cociente 234, resto 1");
  });

  it("divisor 0 o negativo: se omite", () => {
    expect(html({ tipo: "numeria.division", dividendo: 10, divisor: 0 })).toBe("");
    expect(html({ tipo: "numeria.division", dividendo: -10, divisor: 2 })).toBe("");
  });
});

describe("numeria.mcm", () => {
  it("MCM(4,6) = 12, con los múltiplos de cada número listados", () => {
    const salida = html({ tipo: "numeria.mcm", a: 4, b: 6, estatico: true });
    expect(salida).toContain("Múltiplos de 4");
    expect(salida).toContain("Múltiplos de 6");
    expect(salida).toContain("MCM: 12");
  });
});

describe("numeria.fraccion", () => {
  it("1/4 + 1/6 = 5/12 (denominador común 12)", () => {
    const salida = html({ tipo: "numeria.fraccion", operacion: "suma", num1: 1, den1: 4, num2: 1, den2: 6, estatico: true });
    expect(salida).toContain("= 3/12 (denominador común)");
    expect(salida).toContain("= 2/12 (denominador común)");
    expect(salida).toContain("Resultado: 5/12");
  });

  it("2/3 × 3/5 = 2/5 (simplificado)", () => {
    const salida = html({ tipo: "numeria.fraccion", operacion: "multiplicacion", num1: 2, den1: 3, num2: 3, den2: 5, estatico: true });
    expect(salida).toContain("Resultado: 2/5");
  });

  it("2/3 ÷ 3/5 = 10/9, mostrando la recíproca 5/3", () => {
    const salida = html({ tipo: "numeria.fraccion", operacion: "division", num1: 2, den1: 3, num2: 3, den2: 5, estatico: true });
    expect(salida).toContain("Recíproca: 5/3");
    expect(salida).toContain("Resultado: 10/9");
  });

  it("denominador inválido: se omite", () => {
    expect(html({ tipo: "numeria.fraccion", operacion: "suma", num1: 1, den1: 0, num2: 1, den2: 2 })).toBe("");
  });
});

describe("dispatcher: tolerancia a datos malos", () => {
  const vacio = (v: unknown) => expect(html(v)).toBe("");

  it("tipo desconocido, sin tipo, no-objeto: se omite", () => {
    vacio({ tipo: "mundo-inexistente.algo" });
    vacio({});
    vacio(null);
    vacio("numeria.columnas");
    vacio(42);
  });

  it("un visual que lanza al dibujarse no rompe el resto del cuerpo de la lección", () => {
    const Roto = () => {
      throw new Error("visual roto");
    };
    const registro = { ...REGISTRO_VISUALES_NUMERIA, "prueba.roto": Roto as never };
    const salida = renderToStaticMarkup(
      createElement(
        Proveedor,
        { locale: "es", timeZone: "UTC", messages: { Numeria: MENSAJES.es.Numeria, Aprender: MENSAJES.es.Aprender } as never },
        createElement(CuerpoVisual, {
          pasos: ["Primer paso", "Segundo paso"],
          visuales: [
            { tipo: "prueba.roto", despuesDePaso: 0 },
            { tipo: "numeria.mcm", a: 4, b: 6, despuesDePaso: 1, estatico: true },
          ] as DatosVisual[],
          registro,
        })
      )
    );
    expect(salida).toContain("Primer paso");
    expect(salida).toContain("Segundo paso");
    expect(salida).toContain("MCM: 12");
  });
});

describe("CuerpoVisual: cada visual va justo debajo de su paso, en las 5 Clases reales", () => {
  it("el orden es paso i, sus visuales, paso i+1", () => {
    for (const c of CLASES_NUMERIA) {
      const registro = Object.fromEntries(
        Object.keys(REGISTRO_VISUALES_NUMERIA).map((tipo) => [
          tipo,
          (({ visual }: { visual: { tipo: string } }) => createElement("i", { "data-visual": visual.tipo })) as never,
        ])
      );
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Numeria: MENSAJES.es.Numeria, Aprender: MENSAJES.es.Aprender } as never },
          createElement(CuerpoVisual, { pasos: c.pasos, visuales: c.visuales, registro })
        )
      );
      const inicios = c.pasos.map((p) => {
        const clave = p.slice(0, 20).split("$")[0];
        expect(clave.length, c.slug).toBeGreaterThanOrEqual(8);
        const claveEscapada = clave.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        const idx = salida.indexOf(claveEscapada);
        expect(idx, `${c.slug}: no encuentro el paso «${clave}»`).toBeGreaterThanOrEqual(0);
        return idx;
      });
      expect([...inicios].sort((a, b) => a - b)).toEqual(inicios);
      let desde = 0;
      for (const v of c.visuales) {
        const idx = salida.indexOf(`data-visual="${v.tipo}"`, desde);
        expect(idx, `${c.slug}: falta ${v.tipo}`).toBeGreaterThanOrEqual(0);
        const paso = v.despuesDePaso!;
        expect(idx).toBeGreaterThan(inicios[paso]);
        if (paso + 1 < inicios.length) expect(idx).toBeLessThan(inicios[paso + 1]);
        desde = idx + 1;
      }
    }
  });
});
