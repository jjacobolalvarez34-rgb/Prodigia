import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import { REGISTRO_VISUALES_ENIGMIA } from "./registro";
import { TECNICAS_ENIGMIA_NUEVAS, CLASES_ENIGMIA_NUEVAS } from "@/lib/enigmia/lecciones";

// Tests de RENDER de los 2 primitivos nuevos de Enigmia (enigmia.eliminacion,
// enigmia.loci) y de TODOS los visuales de las 10 Técnicas + 5 Clases
// nuevas (2026-09-22, expansión "está muy vacío"), con react-dom/server
// (sin navegador) — mismo patrón que visuales.test.ts.

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
          throw e;
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_ENIGMIA })
    )
  );
}

describe("visuales nuevos de Enigmia: las 10 Técnicas + 5 Clases nuevas se dibujan sin romper", () => {
  it("cada visual se renderiza (animado y estático, es y en) con su alternativa textual", () => {
    let total = 0;
    for (const l of [...TECNICAS_ENIGMIA_NUEVAS, ...CLASES_ENIGMIA_NUEVAS]) {
      for (const v of l.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${l.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(150);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
            expect(salida, donde).toContain("<figcaption");
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Enigmia.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            expect(salida, donde).toContain("<button");
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(40);
  }, 60_000);
});

describe("enigmia.eliminacion", () => {
  it("Ana/Beto/Caro/Dani: los descartes y el restante Ana aparecen", () => {
    const salida = html({
      tipo: "enigmia.eliminacion",
      candidatos: ["Ana", "Beto", "Caro", "Dani"],
      descartes: [
        { candidato: "Beto", motivo: "no tiene mascota" },
        { candidato: "Caro", motivo: "vive en un departamento sin patio" },
        { candidato: "Dani", motivo: "es alérgico a los animales" },
      ],
      estatico: true,
    });
    expect(salida).toContain("Ana");
    expect(salida).toContain("Beto descartado: no tiene mascota");
    expect(salida).toContain("Queda: Ana");
  });

  it("menos de 2 candidatos, o descartes que no dejan exactamente 1 restante: se omite", () => {
    expect(html({ tipo: "enigmia.eliminacion", candidatos: ["Solo uno"], descartes: [] })).toBe("");
    expect(
      html({
        tipo: "enigmia.eliminacion",
        candidatos: ["A", "B", "C"],
        descartes: [{ candidato: "A", motivo: "x" }],
      })
    ).toBe(""); // quedan 2 restantes (B, C): dato mal armado, se omite
  });
});

describe("enigmia.loci", () => {
  it("Puerta/Living/Cocina/Dormitorio asociados a Leche/Huevos/Pan/Manzanas", () => {
    const salida = html({
      tipo: "enigmia.loci",
      lugares: ["Puerta", "Living", "Cocina", "Dormitorio"],
      items: ["Leche", "Huevos", "Pan", "Manzanas"],
      estatico: true,
    });
    expect(salida).toContain("Puerta");
    expect(salida).toContain("Manzanas");
    expect(salida).toContain("Cocina: Pan");
  });

  it("listas de largo distinto, o muy cortas: se omite", () => {
    expect(html({ tipo: "enigmia.loci", lugares: ["A", "B"], items: ["X"] })).toBe("");
    expect(html({ tipo: "enigmia.loci", lugares: ["Solo uno"], items: ["Solo uno"] })).toBe("");
  });
});
