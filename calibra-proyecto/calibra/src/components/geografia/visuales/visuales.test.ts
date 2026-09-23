import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_GEOGRAFIA } from "./registro";
import { TECNICAS_GEOGRAFIA, CLASES_GEOGRAFIA } from "@/lib/geografia/lecciones";
import type { VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";

// Tests de RENDER del visual nuevo de Geografía ("geografia.mapa") y del
// dispatcher genérico, con react-dom/server (sin navegador) — mismo
// patrón que src/components/enigmia/visuales/visuales.test.ts. Dos cosas
// de este visual NUNCA se dibujan en este render de servidor, a propósito
// (Mapa.tsx, `montado` vía useSyncExternalStore): las <Geography> (el
// fetch del topojson de react-simple-maps es async, nunca corre durante
// SSR) y los <Marker> con el nombre del país (su posición usa
// trigonometría de la proyección — Math.tan/Math.log — que Node y el
// navegador no siempre redondean bit a bit igual; renderizarlos ya en el
// HTML del servidor producía un hydration mismatch real, confirmado con
// Playwright). Por eso acá se verifica el marco accesible del visual
// (figura, controles, alternativa sr-only con los nombres de país) y que
// nada rompa con datos buenos/malos — la legibilidad real de cada
// <Marker> con su nombre (recorte correcto por continente, sin clipping)
// se verificó a ojo en el navegador real, ver el reporte de esta tarea.
const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Geografia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Geografia: MENSAJES[idioma].Geografia, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_GEOGRAFIA })
    )
  );
}

describe("visuales de Geografía: las 36 lecciones reales (20 Técnicas + 16 Clases) se dibujan sin romper", () => {
  it("cada visual 'geografia.mapa' se renderiza (animado y estático, es y en) con sus países y la alternativa textual", () => {
    const TODAS = [...TECNICAS_GEOGRAFIA, ...CLASES_GEOGRAFIA];
    let total = 0;
    for (const leccion of TODAS) {
      for (const v of leccion.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${leccion.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(150);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
            expect(salida, donde).toContain("<figcaption");
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Geografia.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            expect(salida, donde).toContain("<button"); // controles
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(100);
  }, 60_000);
});

describe("geografia.mapa", () => {
  it("Argentina, Chile, Uruguay y Paraguay: los 4 nombres aparecen en la alternativa accesible (estático)", () => {
    const salida = html({
      tipo: "geografia.mapa",
      continente: "america",
      paisesIds: ["032", "152", "858", "600"],
      estatico: true,
    });
    // Los <Marker> no se dibujan en SSR (ver comentario de cabecera) —
    // la alternativa sr-only sí lista siempre los 4, sin depender de la
    // animación ni del montaje en cliente.
    expect(salida).toContain("Argentina, Chile, Uruguay, Paraguay");
    expect((salida.match(/<text/g) ?? []).length).toBe(0);
  });

  it("animado (no estático): tampoco dibuja ningún <Marker> en SSR, pero la alternativa sí lista a los 2", () => {
    const salida = html({
      tipo: "geografia.mapa",
      continente: "america",
      paisesIds: ["032", "152"],
      estatico: false,
    });
    expect((salida.match(/<text/g) ?? []).length).toBe(0);
    // la alternativa sr-only sí lista a los dos, aunque la animación no arrancó
    expect(salida).toContain("Argentina, Chile");
  });

  it("id de país sin coordenada curada: se descarta sin romper (no revienta el render)", () => {
    const salida = html({
      tipo: "geografia.mapa",
      continente: "america",
      paisesIds: ["999999"],
      estatico: true,
    });
    expect(salida).toBe("");
  });

  it("sin paisesIds (o vacío): se omite", () => {
    expect(html({ tipo: "geografia.mapa", continente: "america", paisesIds: [] })).toBe("");
  });

  it("más de 4 países: se recorta a los primeros 4 (confirmado en la alternativa accesible)", () => {
    const salida = html({
      tipo: "geografia.mapa",
      continente: "africa",
      paisesIds: ["504", "012", "788", "434", "818"], // 5to (Egipto) debe quedar afuera
      estatico: true,
    });
    expect(salida).toContain("Marruecos, Argelia, Túnez, Libia");
    expect(salida).not.toContain("Egipto");
  });
});

describe("CuerpoVisual: cada visual de Geografía va justo debajo de su paso, en las lecciones reales", () => {
  it("el orden es paso i, sus visuales, paso i+1", () => {
    const TODAS = [...TECNICAS_GEOGRAFIA, ...CLASES_GEOGRAFIA];
    for (const leccion of TODAS) {
      const registro = Object.fromEntries(
        [...Object.keys(REGISTRO_VISUALES_GEOGRAFIA), "cuadros"].map((tipo) => [
          tipo,
          (({ visual }: { visual: { tipo: string } }) => createElement("i", { "data-visual": visual.tipo })) as never,
        ])
      );
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Geografia: MENSAJES.es.Geografia, Aprender: MENSAJES.es.Aprender } as never },
          createElement(CuerpoVisual, { pasos: leccion.pasos, visuales: leccion.visuales as DatosVisual[], registro })
        )
      );
      let desde = 0;
      for (const v of leccion.visuales) {
        const idx = salida.indexOf(`data-visual="${v.tipo}"`, desde);
        expect(idx, `${leccion.slug}: falta ${v.tipo}`).toBeGreaterThanOrEqual(0);
        desde = idx + 1;
      }
    }
  });
});
