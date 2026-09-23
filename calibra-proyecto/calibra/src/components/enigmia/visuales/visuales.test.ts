import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_ENIGMIA } from "./registro";
import { CLASES_ENIGMIA } from "@/lib/enigmia/lecciones";
import type { VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";

// Tests de RENDER de los visuales de Enigmia y del dispatcher genérico,
// con react-dom/server (sin navegador): cada visual de las 6 Clases
// reales se dibuja sin excepciones (animado y estático, es/en) y
// contiene los datos esperados, para un ejemplo conocido.

const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Enigmia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Enigmia: MENSAJES[idioma].Enigmia, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_ENIGMIA })
    )
  );
}

describe("visuales de Enigmia: las 6 Clases reales se dibujan sin romper", () => {
  it("cada visual de cada clase se renderiza (animado y estático, es y en) con su alternativa textual", () => {
    let total = 0;
    for (const c of CLASES_ENIGMIA) {
      for (const v of c.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${c.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(150);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
            expect(salida, donde).toContain("<figcaption");
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Enigmia.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            expect(salida, donde).toContain("<button"); // controles
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(20);
  }, 60_000);
});

describe("enigmia.secuencia", () => {
  it("aritmética 3,7,11,15,19: los términos y la diferencia +4 aparecen", () => {
    const salida = html({ tipo: "enigmia.secuencia", modo: "aritmetica", primerTermino: 3, paso: 4, cantidad: 5, estatico: true });
    expect(salida).toContain(">3<");
    expect(salida).toContain(">19<");
    expect(salida).toContain("3, 7, 11, 15, 19");
  });

  it("geométrica 2,6,18,54,162: la razón ×3 aparece", () => {
    const salida = html({ tipo: "enigmia.secuencia", modo: "geometrica", primerTermino: 2, paso: 3, cantidad: 5, estatico: true });
    expect(salida).toContain("2, 6, 18, 54, 162");
  });

  it("letras A,C,E,G,I", () => {
    const salida = html({ tipo: "enigmia.secuencia", modo: "letras", primeraLetra: "A", paso: 2, cantidad: 5, estatico: true });
    expect(salida).toContain("A, C, E, G, I");
  });

  it("cantidad inválida: se omite sin romper", () => {
    expect(html({ tipo: "enigmia.secuencia", modo: "aritmetica", primerTermino: 1, paso: 1, cantidad: 0 })).toBe("");
    expect(html({ tipo: "enigmia.secuencia", modo: "aritmetica", primerTermino: 1, paso: 1, cantidad: 99 })).toBe("");
  });
});

describe("enigmia.cadena", () => {
  it("silogismo de 3 nodos, con conclusión resaltada", () => {
    const salida = html({
      tipo: "enigmia.cadena",
      nodos: ["Es un perro", "Es un mamífero", "Tiene columna vertebral"],
      concluir: true,
      estatico: true,
    });
    expect(salida).toContain("Es un perro");
    expect(salida).toContain("Tiene columna vertebral");
    expect(salida).toContain("Es un perro → Es un mamífero → Tiene columna vertebral");
  });

  it("menos de 2 nodos: se omite", () => {
    expect(html({ tipo: "enigmia.cadena", nodos: ["Solo uno"] })).toBe("");
    expect(html({ tipo: "enigmia.cadena", nodos: [] })).toBe("");
  });
});

describe("enigmia.agrupacion", () => {
  it("482915637 en bloques de 3: los 3 bloques aparecen agrupados", () => {
    const salida = html({
      tipo: "enigmia.agrupacion",
      items: ["4", "8", "2", "9", "1", "5", "6", "3", "7"],
      tamanos: [3, 3, 3],
      estatico: true,
    });
    expect(salida).toContain("482 - 915 - 637");
    expect(salida).toContain("Agrupado en 3 bloques");
  });

  it("sin items o tamanos: se omite", () => {
    expect(html({ tipo: "enigmia.agrupacion", items: [], tamanos: [3] })).toBe("");
    expect(html({ tipo: "enigmia.agrupacion", items: ["1", "2"], tamanos: [] })).toBe("");
  });
});

describe("enigmia.algoritmo", () => {
  it("traza con condicional: x=0 → 5 → 7 (se cumple) → 21", () => {
    const salida = html({
      tipo: "enigmia.algoritmo",
      inicial: 0,
      pasos: [
        { tipo: "sumar", valor: 5 },
        { tipo: "condicional", comparacion: ">", umbral: 3, siVerdadero: { tipo: "sumar", valor: 2 }, siFalso: { tipo: "restar", valor: 2 } },
        { tipo: "multiplicar", valor: 3 },
      ],
      estatico: true,
    });
    expect(salida).toContain("x = 0");
    expect(salida).toContain("x = 5");
    expect(salida).toContain("x = 7");
    expect(salida).toContain("Valor final: x = 21");
  });

  it("orden A (restar, dividir) da 8; orden B (dividir, restar) da 6", () => {
    const a = html({
      tipo: "enigmia.algoritmo",
      inicial: 20,
      pasos: [
        { tipo: "restar", valor: 4 },
        { tipo: "dividir", valor: 2 },
      ],
      estatico: true,
    });
    const b = html({
      tipo: "enigmia.algoritmo",
      inicial: 20,
      pasos: [
        { tipo: "dividir", valor: 2 },
        { tipo: "restar", valor: 4 },
      ],
      estatico: true,
    });
    expect(a).toContain("Valor final: x = 8");
    expect(b).toContain("Valor final: x = 6");
  });

  it("sin pasos o inicial inválido: se omite", () => {
    expect(html({ tipo: "enigmia.algoritmo", inicial: 0, pasos: [] })).toBe("");
    expect(html({ tipo: "enigmia.algoritmo", inicial: Number.NaN, pasos: [{ tipo: "sumar", valor: 1 }] })).toBe("");
  });
});

describe("dispatcher: tolerancia a datos malos", () => {
  const vacio = (v: unknown) => expect(html(v)).toBe("");

  it("tipo desconocido, sin tipo, no-objeto: se omite", () => {
    vacio({ tipo: "mundo-inexistente.algo" });
    vacio({});
    vacio(null);
    vacio("enigmia.cadena");
    vacio(42);
  });

  it("un visual que lanza al dibujarse no rompe el resto del cuerpo de la lección", () => {
    const Roto = () => {
      throw new Error("visual roto");
    };
    const registro = { ...REGISTRO_VISUALES_ENIGMIA, "prueba.roto": Roto as never };
    const salida = renderToStaticMarkup(
      createElement(
        Proveedor,
        { locale: "es", timeZone: "UTC", messages: { Enigmia: MENSAJES.es.Enigmia, Aprender: MENSAJES.es.Aprender } as never },
        createElement(CuerpoVisual, {
          pasos: ["Primer paso", "Segundo paso"],
          visuales: [
            { tipo: "prueba.roto", despuesDePaso: 0 },
            { tipo: "enigmia.cadena", nodos: ["A", "B"], despuesDePaso: 1, estatico: true },
          ] as DatosVisual[],
          registro,
        })
      )
    );
    expect(salida).toContain("Primer paso");
    expect(salida).toContain("Segundo paso");
    expect(salida).toContain("A → B");
  });
});

describe("CuerpoVisual: cada visual va justo debajo de su paso, en las 6 Clases reales", () => {
  it("el orden es paso i, sus visuales, paso i+1", () => {
    for (const c of CLASES_ENIGMIA) {
      const registro = Object.fromEntries(
        [...Object.keys(REGISTRO_VISUALES_ENIGMIA), "cuadros"].map((tipo) => [
          tipo,
          (({ visual }: { visual: { tipo: string } }) => createElement("i", { "data-visual": visual.tipo })) as never,
        ])
      );
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Enigmia: MENSAJES.es.Enigmia, Aprender: MENSAJES.es.Aprender } as never },
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
