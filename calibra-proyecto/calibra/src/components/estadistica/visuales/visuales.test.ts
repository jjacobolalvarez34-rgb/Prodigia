import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_ESTADISTICA } from "./registro";
import { TECNICAS_ESTADISTICA, CLASES_ESTADISTICA } from "@/lib/estadistica/lecciones";
import { detectarVoseoEnMensajes } from "@/lib/texto/espanolNeutro";

// Tests de RENDER de los visuales de Estadística con react-dom/server (sin
// navegador): cada visual de las 13 lecciones reales se dibuja sin excepciones
// (un mensaje faltante en es o en en FALLA el test), trae su alternativa
// textual (figcaption sr-only) y muestra los valores que se calculan a mano
// acá abajo. Los datos en sí se contrastan en visualesDatos.test.ts.

const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Estadistica: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Estadistica: MENSAJES[idioma].Estadistica, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e; // un mensaje faltante o mal formateado rompe el test
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_ESTADISTICA })
    )
  );
}

const LECCIONES = [...TECNICAS_ESTADISTICA, ...CLASES_ESTADISTICA];
const MENOS = "−";
const visual = (slug: string, tipo: string, i = 0) => LECCIONES.find((l) => l.slug === slug)!.visuales.filter((v) => v.tipo === tipo)[i];
const estatico = (v: unknown, idioma = "es") => html({ ...(v as object), estatico: true }, idioma);

const S = {
  media: "estadistica-media-desde-una-media-provisoria",
  mediana: "estadistica-mediana-por-posicion",
  cuartiles: "estadistica-cuartiles-por-mitades",
  varianza: "estadistica-varianza-con-desvios",
  central: "estadistica-clase-2-tendencia-central",
  dispersion: "estadistica-clase-3-dispersion",
  probabilidad: "estadistica-clase-4-probabilidad",
  z: "estadistica-clase-6-normal-z-y-percentiles",
  correlacion: "estadistica-clase-7-correlacion-y-regresion",
  graficos: "estadistica-clase-8-lectura-critica-de-graficos",
};

describe("visuales de Estadística: las 13 lecciones reales se dibujan sin romper", () => {
  it("cada visual de cada lección se renderiza (animado y estático, es y en) con su alternativa textual y sin valores rotos", () => {
    let total = 0;
    for (const l of LECCIONES) {
      for (const v of l.visuales) {
        for (const est of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico: est }, idioma);
            const donde = `${l.slug} ${v.tipo} estatico=${est} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(200);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{8,}"/);
            expect(salida, donde).toContain('<figcaption class="sr-only"');
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Estadistica.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            total++;
          }
        }
      }
    }
    expect(total).toBe(50 * 4);
  }, 60_000);

  it("la lección completa (CuerpoVisual) pone cada visual debajo de su paso y se dibuja entera", () => {
    for (const l of LECCIONES) {
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          { locale: "es", timeZone: "UTC", messages: { Estadistica: MENSAJES.es.Estadistica, Aprender: MENSAJES.es.Aprender } as never, onError: (e: unknown) => { throw e; } },
          createElement(CuerpoVisual, { pasos: l.pasos, visuales: l.visuales, registro: REGISTRO_VISUALES_ESTADISTICA })
        )
      );
      expect((salida.match(/<figure/g) ?? []).length, l.slug).toBe(l.visuales.length);
      expect((salida.match(/katex/g) ?? []).length, `${l.slug}: KaTeX`).toBeGreaterThan(0);
    }
  }, 60_000);

  it("los datos malos se omiten sin excepción (los hooks corren igual): listas vacías, tipos de campo errados, sigma <= 0, árbol sin ramas, gráfico inválido", () => {
    const rotos = [
      { tipo: "estadistica.ordenar", datos: [], resaltar: "mediana" },
      { tipo: "estadistica.ordenar", datos: [1, 2, 3], resaltar: "otra" },
      { tipo: "estadistica.ordenar", datos: [1, 2, 3], resaltar: "posicion", posicion: 9 },
      { tipo: "estadistica.frecuencias", datos: "hola" },
      { tipo: "estadistica.desvios", datos: [1, 2], centro: "x", etiquetaCentro: "Media" },
      { tipo: "estadistica.desvios", datos: [1, 2], centro: 1, etiquetaCentro: "Media", sigma: 0 },
      { tipo: "estadistica.dispersion", x: [1, 2, 3], y: [1, 2] },
      { tipo: "estadistica.arbol", raiz: "r", ramas: [] },
      { tipo: "estadistica.grafico", grafico: { tipo: "torta" } },
      { tipo: "estadistica.normal", media: 0, sigma: -1 },
    ];
    for (const v of rotos) expect(html(v), JSON.stringify(v)).toBe("");
    // Un tipo que ningún registro conoce también se ignora.
    expect(html({ tipo: "estadistica.no-existe" })).toBe("");
    expect(html({ tipo: "constructor" })).toBe("");
  });

  it("los mensajes de Estadistica.visuales están completos en es y en, y el español no tiene voseo", () => {
    const claves = (o: Record<string, unknown>) => Object.keys(o).sort();
    const es = (MENSAJES.es.Estadistica as { visuales: Record<string, string> }).visuales;
    const en = (MENSAJES.en.Estadistica as { visuales: Record<string, string> }).visuales;
    expect(claves(es)).toEqual(claves(en));
    expect(detectarVoseoEnMensajes(es)).toEqual([]);
  });
});

describe("estadistica.ordenar: se ordena y resalta la mediana, los cuartiles o una posición", () => {
  it("n impar: 9, 3, 7, 5, 11, 1, 8 -> ordenados 1, 3, 5, 7, 8, 9, 11 y Mediana = 7", () => {
    const salida = estatico(visual(S.mediana, "estadistica.ordenar", 0));
    expect(salida).toContain("Datos originales: 9, 3, 7, 5, 11, 1, 8.");
    expect(salida).toContain("Datos ordenados de menor a mayor: 1, 3, 5, 7, 8, 9, 11.");
    expect(salida).toContain("Mediana = 7");
  });

  it("n par: 12, 4, 9, 7 -> Mediana = 8 (con coma decimal en español y punto en inglés para 6,5)", () => {
    expect(estatico(visual(S.mediana, "estadistica.ordenar", 1))).toContain("Mediana = 8");
    const p = { tipo: "estadistica.ordenar", datos: [8, 3, 5, 10], resaltar: "mediana" };
    expect(estatico(p, "es")).toContain("Mediana = 6,5");
    expect(estatico(p, "en")).toContain("Median = 6.5");
  });

  it("cuartiles: 2, 4, 4, 5 | 7, 8, 9, 12 -> Q1 = 4, mediana = 6, Q3 = 8,5, IQR = 4,5; con n impar el 6 queda afuera (M) y Q1 = 3, Q3 = 9, IQR = 6", () => {
    expect(estatico(visual(S.cuartiles, "estadistica.ordenar", 0))).toContain("Q1 = 4, mediana = 6, Q3 = 8,5, IQR = 4,5");
    expect(estatico(visual(S.cuartiles, "estadistica.ordenar", 0), "en")).toContain("Q1 = 4, median = 6, Q3 = 8.5, IQR = 4.5");
    const impar = estatico(visual(S.cuartiles, "estadistica.ordenar", 1));
    expect(impar).toContain("Q1 = 3, mediana = 6, Q3 = 9, IQR = 6");
    // Marcas debajo de las fichas: Q1 (un dato), M (la mediana que queda afuera) y Q3 (un dato).
    expect(impar).toContain(">Q1<");
    expect(impar).toContain(">M<");
    expect(impar).toContain(">Q3<");
  });

  it("percentil 70 de 12, 15, ..., 39 (N = 10) -> posición 7, valor 30; percentil 25 -> posición 3, valor 18", () => {
    expect(estatico(visual(S.z, "estadistica.ordenar", 0))).toContain("Percentil 70: posición 7, valor 30");
    expect(estatico(visual(S.z, "estadistica.ordenar", 1))).toContain("Percentil 25: posición 3, valor 18");
  });
});

describe("estadistica.frecuencias: barras que crecen y resaltan la moda", () => {
  it("3, 5, 5, 7, 50 -> Moda = 5 y Media = 14; la tabla 1, 2, 3 con frecuencias 2, 5, 3 -> Moda = 2 y Media = 2,1", () => {
    const a = estatico(visual(S.central, "estadistica.frecuencias", 0));
    expect(a).toContain("Moda = 5");
    expect(a).toContain("Media = 14");
    expect(a).toContain("El valor 5 aparece 2 veces.");
    expect(a).toContain("El valor 3 aparece 1 vez.");
    const b = estatico(visual(S.central, "estadistica.frecuencias", 1));
    expect(b).toContain("Moda = 2");
    expect(b).toContain("Media = 2,1");
    expect(estatico(visual(S.central, "estadistica.frecuencias", 1), "en")).toContain("Mean = 2.1");
  });

  it("sin repetidos no hay moda y con empate hay varias", () => {
    expect(estatico({ tipo: "estadistica.frecuencias", datos: [1, 2, 3] })).toContain("no hay moda");
    expect(estatico({ tipo: "estadistica.frecuencias", datos: [1, 1, 2, 2, 3] })).toContain("Modas: 1, 2");
  });
});

describe("estadistica.desvios: desviaciones coloreadas con su signo escrito", () => {
  it("media provisoria 60: +1, +4, −2, +7, 0 y suma de las desviaciones = +10", () => {
    const salida = estatico(visual(S.media, "estadistica.desvios"));
    expect(salida).toContain("Media provisoria: 60");
    expect(salida).toContain("Suma de las desviaciones = +10");
    for (const d of ["+1", "+4", `${MENOS}2`, "+7"]) expect(salida).toContain(d);
    expect(salida).toContain("Dato 58: desviación −2.");
  });

  it("las desviaciones respecto de la media suman 0 (3, 5, 5, 7, 50 con media 14: −11, −9, −9, −7, +36)", () => {
    const salida = estatico(visual(S.central, "estadistica.desvios"));
    expect(salida).toContain("Suma de las desviaciones = 0");
    for (const d of [`${MENOS}11`, `${MENOS}9`, `${MENOS}7`, "+36"]) expect(salida).toContain(d);
  });

  it("con cuadrados: 2, 50, 40 y 160 (varianza) y con 2, 4, 4, 4, 5, 5, 7, 9 la suma de los cuadrados es 32", () => {
    const esperadas = [2, 50, 40, 160];
    esperadas.forEach((suma, i) => expect(estatico(visual(S.dispersion, "estadistica.desvios", i))).toContain(`Suma de los cuadrados = ${suma}`));
    const v = estatico(visual(S.varianza, "estadistica.desvios"));
    expect(v).toContain("Suma de los cuadrados = 32");
    expect(v).toContain("² = 16");
    expect(v).toContain("² = 9");
  });

  it("con sigma muestra el puntaje z: 86 -> +2 y 62 -> −1 (μ = 70, σ = 8); 84 -> +1,5 (μ = 75, σ = 6)", () => {
    const a = estatico(visual(S.z, "estadistica.desvios", 0));
    expect(a).toContain("z = +2");
    expect(a).toContain(`z = ${MENOS}1`);
    expect(a).toContain("z = desviación ÷ 8");
    expect(estatico(visual(S.z, "estadistica.desvios", 2))).toContain("z = +1,5");
    expect(estatico(visual(S.z, "estadistica.desvios", 2), "en")).toContain("z = +1.5");
  });
});

describe("estadistica.normal: regla empírica", () => {
  it("μ = 100, σ = 15: 68 % entre 85 y 115, 95 % entre 70 y 130, 99,7 % entre 55 y 145", () => {
    const salida = estatico(visual(S.z, "estadistica.normal"));
    expect(salida).toContain("Entre 85 y 115 (±1σ): 68 % de los datos");
    expect(salida).toContain("Entre 70 y 130 (±2σ): 95 % de los datos");
    expect(salida).toContain("Entre 55 y 145 (±3σ): 99,7 % de los datos");
    expect(estatico(visual(S.z, "estadistica.normal"), "en")).toContain("99.7 % of the data");
  });

  it("con un punto marcado muestra su puntaje z (x = 130 -> z = +2)", () => {
    const salida = estatico({ tipo: "estadistica.normal", media: 100, sigma: 15, marcarX: 130 });
    expect(salida).toContain("El valor 130 tiene puntaje z = +2");
    expect(salida).toContain("z = +2");
  });
});

describe("estadistica.dispersion: puntos y recta de mínimos cuadrados", () => {
  it("x = 1..5, y = 1, 3, 2, 5, 4 -> r = 0,8, pendiente 0,8, intercepto 0,6 y 5 puntos dibujados", () => {
    const salida = estatico(visual(S.correlacion, "estadistica.dispersion", 0));
    expect(salida).toContain("Coeficiente de correlación r = 0,8");
    expect(salida).toContain("pendiente 0,8, intercepto 0,6");
    expect(salida).toContain("(1, 1), (2, 3), (3, 2), (4, 5), (5, 4)");
    expect((salida.match(/<circle/g) ?? []).length).toBe(5);
    expect(salida).toContain("<line"); // la recta
    expect(estatico(visual(S.correlacion, "estadistica.dispersion", 0), "en")).toContain("r = 0.8");
  });

  it("la relación curva perfecta tiene r = 0", () => {
    expect(estatico(visual(S.correlacion, "estadistica.dispersion", 1))).toContain("Coeficiente de correlación r = 0");
  });
});

describe("estadistica.arbol: probabilidades condicionales y conjuntas", () => {
  it("con reposición: 0,3 × 0,5 = 0,15 (roja y luego azul)", () => {
    const salida = estatico(visual(S.probabilidad, "estadistica.arbol", 0));
    expect(salida).toContain("1.ª roja → 2.ª azul: 0,3 × 0,5 = 0,15");
    expect(salida).toContain("1.ª no roja → 2.ª no azul: 0,7 × 0,5 = 0,35");
  });

  it("con la tabla: 0,6 × 0,75 = 0,45 (estudió y aprobó) y los cuatro caminos", () => {
    const salida = estatico(visual(S.probabilidad, "estadistica.arbol", 1));
    expect(salida).toContain("Estudió → Aprobó: 0,6 × 0,75 = 0,45");
    expect(salida).toContain("Estudió → Reprobó: 0,6 × 0,25 = 0,15");
    expect(salida).toContain("No estudió → Aprobó: 0,4 × 0,25 = 0,1");
    expect(salida).toContain("No estudió → Reprobó: 0,4 × 0,75 = 0,3");
  });
});

describe("estadistica.grafico: reusa los SVG de la práctica con datos fijos", () => {
  it("diagrama de caja: Q1 40, mediana 50, Q3 60 y el atípico 95, con su alternativa textual", () => {
    const salida = estatico(visual(S.graficos, "estadistica.grafico", 2));
    expect(salida).toContain("<svg");
    expect(salida).toContain("Mínimo 20, Q1 40, mediana 50, Q3 60, máximo 85. Valores atípicos: 95.");
  });

  it("las barras con el eje cortado avisan dónde empieza el eje (96) y las honestas empiezan en 0", () => {
    expect(estatico(visual(S.graficos, "estadistica.grafico", 4))).toContain("El eje vertical empieza en 96.");
    expect(estatico(visual(S.graficos, "estadistica.grafico", 3))).toContain("El eje vertical empieza en 0.");
  });

  it("histograma y líneas dibujan un SVG con su alternativa (frecuencia por clase / valores por mes)", () => {
    expect(estatico(visual(S.graficos, "estadistica.grafico", 0))).toContain("Frecuencia de cada clase: [10, 20): 4; [20, 30): 9; [30, 40): 5.");
    expect(estatico(visual(S.graficos, "estadistica.grafico", 1))).toContain("Ene: 20; Feb: 24; Mar: 40; Abr: 44; May: 46.");
  });
});

describe("accesibilidad y movimiento reducido", () => {
  it("el contenido visual va aria-hidden y la alternativa textual es un figcaption sr-only con los mismos datos", () => {
    const salida = estatico(visual(S.central, "estadistica.frecuencias", 0));
    expect(salida).toContain('aria-hidden="true"');
    expect(salida).toContain('<figcaption class="sr-only">');
    expect(salida).toContain("Datos: 3, 5, 5, 7, 50.");
  });

  it("con estatico (o prefers-reduced-motion) se muestra el estado final ya dibujado y no hay Reproducir automático", () => {
    const salida = estatico(visual(S.central, "estadistica.ordenar"));
    // Todas las fichas ordenadas visibles (opacity:1) y el mensaje final presente en pantalla.
    expect((salida.match(/opacity:1/g) ?? []).length).toBeGreaterThanOrEqual(5);
    expect(salida).toContain("Mediana = 5");
  });
});
