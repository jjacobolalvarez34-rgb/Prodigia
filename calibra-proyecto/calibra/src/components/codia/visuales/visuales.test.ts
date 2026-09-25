import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoLeccionCodia from "@/components/codia/CuerpoLeccionCodia";
import { REGISTRO_VISUALES_CODIA } from "./registro";
import { TIPOS_VISUAL_CODIA } from "@/lib/codia/visuales";
import { LECCIONES_CODIA } from "@/lib/codia/lecciones";
import { visualesDeContenido } from "@/lib/aprender/visuales";
import { datosFlujo, datosTraza } from "@/lib/codia/visualesDatos";
import { FLUJO_NOTA, TRAZA_TABLA_SEGUIMIENTO, SERIES_UNO_Y_ANIDADOS, COMPARAR_DIVISION_CERO, TRAZA_COLA_TURNOS } from "@/lib/codia/lecciones/programas";

// Tests de RENDER de los visuales de Codia con react-dom/server (sin
// navegador). Existen por el crash de 2026-09-21: una verificación que solo
// mira datos no ve un componente que revienta al dibujarse. Acá se dibuja de
// verdad CADA visual de CADA lección (es y en, animado y estático): marco
// accesible, controles, alternativa textual, mensajes resueltos y ninguna
// basura tipo NaN. El dibujo real (barras, resaltado, 360 px) se vio en el
// navegador.
const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Codia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function envolver(idioma: string, hijo: ReturnType<typeof createElement>) {
  return createElement(
    Proveedor,
    {
      locale: idioma,
      timeZone: "UTC",
      messages: { Codia: MENSAJES[idioma].Codia, Aprender: MENSAJES[idioma].Aprender } as never,
      onError: (e: unknown) => {
        throw e; // un mensaje faltante o mal formateado rompe el test
      },
    },
    hijo
  );
}

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(envolver(idioma, createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_CODIA })));
}

const TODOS = LECCIONES_CODIA.flatMap((l) => (l.visuales ?? []).map((v) => ({ slug: l.slug, v })));

describe("visuales de Codia: registro", () => {
  it("todos los tipos declarados tienen componente y se usan en alguna lección", () => {
    expect(Object.keys(REGISTRO_VISUALES_CODIA).sort()).toEqual([...TIPOS_VISUAL_CODIA].sort());
    expect(new Set(TODOS.map((t) => t.v.tipo))).toEqual(new Set(TIPOS_VISUAL_CODIA));
  });
});

describe("visuales de Codia: las lecciones reales se dibujan sin romper", () => {
  it("cada visual de cada Técnica y Clase se renderiza (es y en, animado y estático)", () => {
    let total = 0;
    for (const { slug, v } of TODOS) {
      for (const estatico of [false, true]) {
        for (const idioma of ["es", "en"]) {
          const salida = html({ ...v, estatico }, idioma);
          const donde = `${slug} ${v.tipo} "${v.titulo}" estatico=${estatico} ${idioma}`;
          expect(salida.length, donde).toBeGreaterThan(400);
          expect(salida, donde).toContain('role="group"');
          expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
          // Alternativa textual para lector de pantalla.
          expect(salida, donde).toContain("<figcaption");
          expect(salida, donde).toContain("sr-only");
          // Controles del reproductor (Anterior / Siguiente / Repetir).
          expect(salida, donde).toContain("<button");
          expect(salida, donde).not.toContain("Codia.visuales");
          expect(salida, donde).not.toContain("Aprender.visual");
          // Las salidas de JavaScript ("undefined", "Infinity") son legítimas en una comparación.
          const basura = v.tipo === "codia.comparar" ? /NaN|\[object/ : /NaN|undefined|\[object|Infinity/;
          expect(salida.replace(/<figcaption[\s\S]*?<\/figcaption>/g, ""), donde).not.toMatch(basura);
          total++;
        }
      }
    }
    expect(total).toBe(TODOS.length * 4);
    expect(TODOS.length).toBeGreaterThanOrEqual(40);
  }, 300_000);

  it("estático muestra el estado final: la salida real del programa aparece en la traza y en la comparación", () => {
    const traza = html({ tipo: "codia.traza", programa: TRAZA_TABLA_SEGUIMIENTO, lenguaje: "python", estatico: true });
    expect(traza).toContain("7 3");
    expect(traza).toContain("a"); // variable
    const comparar = html({ tipo: "codia.comparar", programa: COMPARAR_DIVISION_CERO, estatico: true });
    expect(comparar).toContain("ZeroDivisionError");
    expect(comparar).toContain("ArithmeticException");
    expect(comparar).toContain("Infinity");
    const flujo = html({ tipo: "codia.flujo", programa: FLUJO_NOTA, lenguaje: "python", estatico: true });
    expect(flujo).toContain("nota &gt;= 70");
    expect(flujo).toContain("Verdadera");
    expect(flujo).toContain("Falsa");
    const crec = html({ tipo: "codia.crecimiento", series: SERIES_UNO_Y_ANIDADOS, ns: [8, 16], estatico: true });
    expect(crec).toContain("×4");
  });

  it("la traza mostrada en el HTML sigue el código real (nombres de variable y valores por paso)", () => {
    const datos = datosTraza(TRAZA_COLA_TURNOS, "python");
    const salida = html({ tipo: "codia.traza", programa: TRAZA_COLA_TURNOS, lenguaje: "python", estatico: true });
    // La alternativa sr-only lista TODOS los pasos con sus variables reales.
    for (let i = 0; i < datos.pasos.length; i++) expect(salida).toContain(`Paso ${i + 1}, línea ${datos.pasos[i].linea}`);
    expect(salida).toContain("cola = [4, 5, 4] (frente: 4)");
  });

  it("el diagrama de flujo de un bucle y de un condicional marca lo que pasó de verdad", () => {
    const d = datosFlujo(FLUJO_NOTA, "python");
    expect(d?.tipo).toBe("si");
    if (d?.tipo === "si") expect(d.ramas.map((r) => r.resultado)).toEqual([false, true]);
  });
});

describe("visuales de Codia: la lección completa (pasos con código + visuales) se arma sin romper", () => {
  it("CuerpoLeccionCodia dibuja cada lección con sus bloques de código, salidas y visuales", () => {
    for (const l of LECCIONES_CODIA) {
      for (const idioma of ["es", "en"]) {
        const salida = renderToStaticMarkup(
          envolver(idioma, createElement(CuerpoLeccionCodia, { pasos: l.pasos.map((p) => p.replace(/~~~/g, "```")), visuales: visualesDeContenido(l.visuales) }))
        );
        const donde = `${l.slug} ${idioma}`;
        expect(salida, donde).toContain("<figure");
        expect(salida, donde).toContain("<code");
        expect(salida, donde).not.toContain("```");
        expect(salida, donde).not.toContain("~~~");
        expect((salida.match(/<figure/g) ?? []).length, donde).toBe(l.visuales!.length);
      }
    }
  }, 300_000);
});

describe("visuales de Codia: los datos inválidos se omiten sin romper la lección", () => {
  it("un visual roto no dibuja nada", () => {
    for (const visual of [
      { tipo: "codia.traza", programa: null, lenguaje: "python" },
      { tipo: "codia.traza", programa: { funcs: [], main: [] }, lenguaje: "python" },
      { tipo: "codia.traza", programa: { funcs: [], main: [{ k: "print", args: [] }] }, lenguaje: "python" },
      { tipo: "codia.comparar" },
      { tipo: "codia.comparar", programa: { funcs: [], main: "x" } },
      { tipo: "codia.comparar", programa: { funcs: [], main: [] } },
      { tipo: "codia.flujo", programa: { funcs: [], main: [{ k: "print", args: [{ k: "n", v: 1 }] }] }, lenguaje: "python" },
      { tipo: "codia.flujo", programa: null, lenguaje: "python" },
      { tipo: "codia.crecimiento", series: [], ns: [4, 8] },
      { tipo: "codia.crecimiento", series: "x", ns: [4] },
      { tipo: "codia.crecimiento", series: SERIES_UNO_Y_ANIDADOS, ns: [] },
      { tipo: "codia.desconocido" },
    ]) {
      expect(html(visual), JSON.stringify(visual)).toBe("");
    }
  });
});
