import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_CALCULIA } from "./registro";
import { LECCIONES_CALCULIA } from "@/lib/calculia/lecciones";

// Tests de RENDER de los visuales de Calculia con react-dom/server (sin navegador),
// mismo patrón que src/components/historia/visuales/visuales.test.ts: marco
// accesible, controles, alternativa textual, cero NaN/undefined, todos los mensajes
// es/en resueltos y coordenadas estables (sin ruido de punto flotante que rompa la
// hidratación). El dibujo real (superposiciones a 360 px, animación) se vio en el
// navegador.
const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Calculia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function proveer(hijo: ReturnType<typeof createElement>, idioma: string): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Calculia: MENSAJES[idioma].Calculia, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      hijo
    )
  );
}
const html = (visual: unknown, idioma = "es") => proveer(createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_CALCULIA }), idioma);

const MUESTRAS = [
  { tipo: "calculia.tangente", funcion: [{ tipo: "potencia", c: 5, n: 4 }], x0: 1, rango: [0, 1.6] },
  { tipo: "calculia.tangente", funcion: [{ tipo: "factorLineal", c: 1, a: 3, b: 2, n: 4 }], x0: -0.5 },
  { tipo: "calculia.tangente", funcion: [{ tipo: "potencia", c: 3, n: 2 }, { tipo: "potencia", c: -2, n: 1 }], x0: 2, titulo: "Con $y=2$ fija: $f(x,2)=6x^2$" },
  { tipo: "calculia.area", funcion: [{ tipo: "potencia", c: 6, n: 2 }], desde: 0, hasta: 2 },
  { tipo: "calculia.area", funcion: [{ tipo: "factorLineal", c: 8, a: 2, b: 1, n: 3 }], desde: 0, hasta: 1, titulo: "Área bajo $8(2x+1)^3$" },
  { tipo: "calculia.serie", a: 4, rNum: 1, rDen: 2, terminos: 10 },
  { tipo: "calculia.serie", a: 8, rNum: -1, rDen: 2, terminos: 10 },
  { tipo: "calculia.serie", a: 1, rNum: 2, rDen: 1, terminos: 8 },
  { tipo: "calculia.edo", k: 2, n: 1, x0: 1 },
  { tipo: "calculia.edo", k: 3, n: 2, x0: 1 },
];

// Todos los números de los atributos geométricos del SVG (sin el resto del HTML).
function numerosSvg(salida: string): string[] {
  const r: string[] = [];
  for (const m of salida.matchAll(/\s(?:d|x|y|x1|y1|x2|y2|cx|cy|r|width|height|viewBox)="([^"]*)"/g)) for (const n of m[1].matchAll(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)) r.push(n[0]);
  return r;
}

describe("visuales de Calculia: se dibujan sin romper (muestras de todos los tipos)", () => {
  it("todos los tipos registrados tienen muestra", () => {
    expect(new Set(MUESTRAS.map((m) => m.tipo))).toEqual(new Set(Object.keys(REGISTRO_VISUALES_CALCULIA)));
  });

  it("cada muestra se renderiza (animada y estática, es y en) con marco accesible, alternativa textual, controles y sin basura", () => {
    for (const visual of MUESTRAS) {
      for (const estatico of [false, true]) {
        for (const idioma of ["es", "en"]) {
          const salida = html({ ...visual, estatico }, idioma);
          const donde = `${visual.tipo} ${JSON.stringify(visual).slice(0, 70)} estatico=${estatico} ${idioma}`;
          expect(salida.length, donde).toBeGreaterThan(400);
          expect(salida, donde).toContain('role="group"');
          expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
          expect(salida, donde).toContain("<figcaption");
          expect(salida, donde).toContain('aria-hidden="true"');
          expect(salida.replace(/<annotation[\s\S]*?<\/annotation>/g, ""), donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
          expect(salida, donde).not.toContain("Calculia.visuales");
          expect(salida, donde).not.toContain("Aprender.visual");
          expect(salida, donde).toContain("<button");
        }
      }
    }
  });

  it("la alternativa textual (sr-only) dice lo que muestra el dibujo, con números y sin LaTeX crudo", () => {
    const tg = html({ ...MUESTRAS[0], estatico: true });
    const alt = tg.match(/<figcaption class="sr-only">([\s\S]*?)<\/figcaption>/)![1];
    expect(alt).toContain("pendiente 20"); // f'(1) = 5·4·1³
    expect(alt.replace(/<annotation[\s\S]*?<\/annotation>/g, "")).not.toMatch(/\\frac|\\dfrac|\^\{/);
    const ar = html({ ...MUESTRAS[3], estatico: true });
    expect(ar.match(/<figcaption class="sr-only">([\s\S]*?)<\/figcaption>/)![1]).toContain("vale 16");
    const se = html({ ...MUESTRAS[5], estatico: true });
    const altSerie = se.match(/<figcaption class="sr-only">([\s\S]*?)<\/figcaption>/)![1];
    expect(altSerie).toContain("se acercan a 8");
    expect(altSerie).toContain("Suma de los primeros 10 términos");
    expect(html({ ...MUESTRAS[7], estatico: true }).match(/<figcaption class="sr-only">([\s\S]*?)<\/figcaption>/)![1]).toContain("diverge");
    const ed = html({ ...MUESTRAS[8], estatico: true }).match(/<figcaption class="sr-only">([\s\S]*?)<\/figcaption>/)![1];
    expect(ed).toContain("5,44"); // 2·1·e = 5.4366 en es (coma decimal)
    expect(html({ ...MUESTRAS[8], estatico: true }, "en").match(/<figcaption class="sr-only">([\s\S]*?)<\/figcaption>/)![1]).toContain("5.44");
  });

  it("el separador decimal sigue al idioma y el signo menos es el matemático", () => {
    expect(html({ ...MUESTRAS[5], estatico: true }, "es")).toContain("7,97");
    expect(html({ ...MUESTRAS[5], estatico: true }, "en")).toContain("7.97");
    expect(html({ ...MUESTRAS[1], estatico: true })).toContain("−"); // x0 = −0.5
  });

  it("las coordenadas del SVG son estables: a lo sumo 2 decimales, sin notación científica ni ruido de punto flotante (hidratación)", () => {
    for (const visual of MUESTRAS) {
      const salida = html({ ...visual, estatico: true });
      const nums = numerosSvg(salida);
      expect(nums.length, visual.tipo).toBeGreaterThan(20);
      for (const n of nums) {
        expect(n, `${visual.tipo}: ${n}`).not.toMatch(/e/);
        expect(n.split(".")[1]?.length ?? 0, `${visual.tipo}: ${n}`).toBeLessThanOrEqual(2);
      }
      // determinista: dos renders iguales
      expect(html({ ...visual, estatico: true })).toBe(salida);
    }
  });

  it("estático muestra el estado final; animado empieza en el primer cuadro", () => {
    const estatica = html({ ...MUESTRAS[0], estatico: true });
    const animada = html({ ...MUESTRAS[0], estatico: false });
    expect(estatica).toContain("Su pendiente es la derivada");
    expect(animada).toContain("Esta es la curva");
    expect(animada).not.toContain("Su pendiente es la derivada");
  });

  it("datos rotos o de otro tipo no rompen: el visual se omite (o no se dibuja) sin excepción", () => {
    for (const malo of [
      { tipo: "calculia.tangente", funcion: [], x0: 1 },
      { tipo: "calculia.tangente", funcion: [{ tipo: "potencia", c: 1, n: 2 }], x0: "uno" },
      { tipo: "calculia.area", funcion: [{ tipo: "potencia", c: 1, n: 2 }], desde: 3, hasta: 1 },
      { tipo: "calculia.serie", a: 0, rNum: 1, rDen: 2, terminos: 5 },
      { tipo: "calculia.serie", a: 1, rNum: 1, rDen: 0, terminos: 5 },
      { tipo: "calculia.edo", k: 0, n: 1, x0: 1 },
      { tipo: "calculia.edo", k: 90, n: 1, x0: 5 },
      { tipo: "calculia.desconocido" },
    ]) {
      expect(() => html(malo), JSON.stringify(malo)).not.toThrow();
      expect(html(malo), JSON.stringify(malo)).not.toContain("<figure");
    }
  });
});

describe("lecciones de Calculia: cada lección se dibuja completa con CuerpoVisual (es y en)", () => {
  it("las 12 lecciones renderizan todos sus visuales, sin claves de mensajes sin resolver ni basura", () => {
    let visuales = 0;
    for (const l of LECCIONES_CALCULIA) {
      for (const idioma of ["es", "en"]) {
        for (const estatico of [false, true]) {
          const salida = proveer(createElement(CuerpoVisual, { pasos: l.pasos, visuales: l.visuales.map((v) => ({ ...v, estatico })), registro: REGISTRO_VISUALES_CALCULIA }), idioma);
          const donde = `${l.slug} ${idioma} estatico=${estatico}`;
          const figuras = salida.match(/<figure /g)?.length ?? 0;
          expect(figuras, `${donde}: ${figuras} figuras dibujadas de ${l.visuales.length}`).toBe(l.visuales.length);
          expect(salida.replace(/<annotation[\s\S]*?<\/annotation>/g, ""), donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
          expect(salida, donde).not.toContain("Calculia.visuales");
          expect(salida, donde).not.toContain("katex-error");
          // cada paso se muestra
          expect(salida.match(/text-base leading-relaxed/g)?.length ?? 0, donde).toBe(l.pasos.length);
        }
      }
      visuales += l.visuales.length;
    }
    expect(visuales).toBe(LECCIONES_CALCULIA.reduce((s, l) => s + l.visuales.length, 0));
    expect(visuales).toBeGreaterThan(30);
  }, 120_000);
});
