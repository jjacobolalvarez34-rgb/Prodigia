import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import VisualLeccion from "@/components/aprender/VisualLeccion";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_CIRCUITIA } from "./registro";
import { LECCIONES_CIRCUITIA } from "@/lib/circuitia/lecciones";

// Tests de RENDER de los visuales de Circuitia con react-dom/server (sin
// navegador): cada visual de las 12 lecciones reales se dibuja sin
// excepciones (un mensaje faltante rompe el test), con alternativa textual
// sr-only, y muestra los valores esperados, escritos aquí a mano (Ley de Ohm,
// serie y paralelo), no recalculados con el mismo código.

const Proveedor = NextIntlClientProvider as unknown as ComponentType<Record<string, unknown>>;
const raiz = path.resolve(__dirname, "../../../..");
const leer = (idioma: string) => JSON.parse(fs.readFileSync(path.join(raiz, "messages", `${idioma}.json`), "utf8"));
const MENSAJES: Record<string, { Circuitia: unknown; Aprender: unknown }> = { es: leer("es"), en: leer("en") };

function html(visual: unknown, idioma = "es"): string {
  return renderToStaticMarkup(
    createElement(
      Proveedor,
      {
        locale: idioma,
        timeZone: "UTC",
        messages: { Circuitia: MENSAJES[idioma].Circuitia, Aprender: MENSAJES[idioma].Aprender } as never,
        onError: (e: unknown) => {
          throw e;
        },
      },
      createElement(VisualLeccion, { visual, registro: REGISTRO_VISUALES_CIRCUITIA })
    )
  );
}

const textos = (salida: string): string[] => [...salida.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").replace(/&#x27;|&quot;/g, "'"));

const R = (id: string, ohmios: number) => ({ tipo: "resistor" as const, id, ohmios });

describe("visuales de Circuitia: las 12 lecciones reales se dibujan sin romper", () => {
  it("cada visual de cada lección se renderiza (animado y estático, es y en) con su alternativa textual", () => {
    let total = 0;
    for (const l of LECCIONES_CIRCUITIA) {
      for (const v of l.visuales) {
        for (const estatico of [false, true]) {
          for (const idioma of ["es", "en"]) {
            const salida = html({ ...v, estatico }, idioma);
            const donde = `${l.slug} ${v.tipo} estatico=${estatico} ${idioma}`;
            expect(salida.length, donde).toBeGreaterThan(300);
            expect(salida, donde).toContain('role="group"');
            expect(salida, donde).toMatch(/aria-label="[^"]{4,}"/);
            expect(salida, donde).toContain("<figcaption");
            expect(salida, donde).toContain("<svg");
            expect(salida, donde).not.toMatch(/NaN|undefined|\[object|Infinity/);
            expect(salida, donde).not.toContain("Circuitia.visuales");
            expect(salida, donde).not.toContain("Aprender.visual");
            total++;
          }
        }
      }
    }
    expect(total).toBeGreaterThan(100);
  }, 60_000);

  it("la lección completa (pasos + visuales) se dibuja con el dispatcher genérico", () => {
    for (const l of LECCIONES_CIRCUITIA) {
      const salida = renderToStaticMarkup(
        createElement(
          Proveedor,
          {
            locale: "es",
            timeZone: "UTC",
            messages: { Circuitia: MENSAJES.es.Circuitia, Aprender: MENSAJES.es.Aprender } as never,
            onError: (e: unknown) => {
              throw e;
            },
          },
          createElement(CuerpoVisual, { pasos: l.pasos, visuales: l.visuales, registro: REGISTRO_VISUALES_CIRCUITIA })
        )
      );
      expect((salida.match(/<figure/g) ?? []).length, l.slug).toBe(l.visuales.length);
    }
  });
});

describe("circuitia.circuito", () => {
  const serie = { tipo: "circuitia.circuito", topologia: { tipo: "serie", hijos: [R("R1", 10), R("R2", 20)] }, vFuente: 12, mostrarValores: "ambas" };

  it("estático: dibuja cada resistor con su valor y, bajo él, corriente y voltaje reales (0,4 A; 4 V y 8 V)", () => {
    const t = textos(html({ ...serie, estatico: true }));
    expect(t).toContain("R1 = 10 Ω");
    expect(t).toContain("R2 = 20 Ω");
    expect(t).toContain("0.4 A · 4 V");
    expect(t).toContain("0.4 A · 8 V");
    expect(t).toContain("12 V");
  });

  it("animado: al empezar solo el primer resistor ya muestra sus valores (se revelan de a uno)", () => {
    const t = textos(html(serie));
    expect(t).toContain("0.4 A · 4 V");
    expect(t).not.toContain("0.4 A · 8 V");
  });

  it("paralelo: mismo voltaje (12 V) y corrientes 1,2 A y 0,6 A", () => {
    const t = textos(html({ tipo: "circuitia.circuito", topologia: { tipo: "paralelo", hijos: [R("R1", 10), R("R2", 20)] }, vFuente: 12, mostrarValores: "ambas", estatico: true }));
    expect(t).toContain("1.2 A · 12 V");
    expect(t).toContain("0.6 A · 12 V");
  });

  it("mixto: 0,3 A y 6 V en cada rama del bloque; la alternativa dice que es mixto", () => {
    const salida = html({
      tipo: "circuitia.circuito",
      topologia: { tipo: "serie", hijos: [R("Rs1", 10), { tipo: "paralelo", hijos: [R("Rp1", 20), R("Rp2", 20)] }] },
      vFuente: 12,
      mostrarValores: "ambas",
      estatico: true,
    });
    const t = textos(salida);
    expect(t).toContain("0.6 A · 6 V");
    expect(t.filter((x) => x === "0.3 A · 6 V")).toHaveLength(2);
    expect(salida).toContain("circuito mixto");
  });

  it("sin valores: solo el esquema (sin corriente ni voltaje bajo los resistores)", () => {
    const t = textos(html({ ...serie, mostrarValores: "ninguna", estatico: true }));
    expect(t.some((x) => /\bA\b|· \d/.test(x))).toBe(false);
  });

  it("con movimiento hay pulsos animados y botón para pausarlos; con «reducir movimiento» (estático) no hay animación", () => {
    const animado = html(serie);
    expect(animado).toContain("circuitia-pulso");
    expect(animado).toMatch(/stroke-dasharray="0\.1 11\.9"/);
    expect(animado).toContain("Pausar la corriente");
    const quieto = html({ ...serie, estatico: true });
    expect(quieto).not.toContain("stroke-dasharray");
    expect(quieto).not.toContain("@keyframes");
    expect(quieto).not.toContain("Pausar la corriente");
    // Las flechas de sentido siguen ahí sin animación.
    expect(quieto).toContain("<polygon");
  });

  it("animarCorriente: false apaga los pulsos aunque haya movimiento", () => {
    const salida = html({ ...serie, animarCorriente: false });
    expect(salida).not.toContain("stroke-dasharray");
    expect(salida).not.toContain("Pausar la corriente");
  });

  it("una topología no soportada no rompe la lección: el visual se omite", () => {
    const salida = html({ tipo: "circuitia.circuito", topologia: { tipo: "serie", hijos: [R("R1", 1), { tipo: "serie", hijos: [R("R2", 1), R("R3", 1)] }] }, vFuente: 12 });
    expect(salida).toBe("");
  });

  it("resalta el resistor pedido con el color del mundo", () => {
    const salida = html({ ...serie, mostrarValores: "ninguna", resaltarId: "R2", estatico: true });
    expect(salida).toMatch(/<polyline[^>]*stroke="#F59E0B"[^>]*stroke-width="3.2"/);
  });
});

describe("circuitia.resistenciaEquivalente", () => {
  it("serie 8 + 8: al final el resistor equivalente vale 16 Ω", () => {
    const salida = html({ tipo: "circuitia.resistenciaEquivalente", modo: "serie", ohmios: [8, 8], estatico: true });
    expect(textos(salida).join(" ")).toContain("= 16 Ω");
    expect(salida).toContain("16\\,\\Omega");
  });

  it("paralelo 8 || 8: al final vale 4 Ω (la mitad de un solo resistor)", () => {
    const salida = html({ tipo: "circuitia.resistenciaEquivalente", modo: "paralelo", ohmios: [8, 8], estatico: true });
    expect(textos(salida).join(" ")).toContain("= 4 Ω");
  });

  it("animado: al empezar aparece el primer resistor en su arreglo, sin la fórmula ni el equivalente", () => {
    const salida = html({ tipo: "circuitia.resistenciaEquivalente", modo: "paralelo", ohmios: [10, 20] });
    const t = textos(salida);
    expect(t).toContain("R1 = 10 Ω");
    expect(t).not.toContain("R2 = 20 Ω");
    // (la alternativa sr-only sí dice el resultado; lo visible todavía no.)
    expect(salida.split("<figcaption")[0]).not.toContain("6.67");
  });

  it("paralelo 10 || 20 (estático): 6,67 Ω, menor que el resistor más pequeño", () => {
    const salida = html({ tipo: "circuitia.resistenciaEquivalente", modo: "paralelo", ohmios: [10, 20], estatico: true });
    expect(salida).toContain("6.67");
    expect(salida).toContain("menor que el más pequeño");
  });

  it("menos de 2 resistores: se omite", () => {
    expect(html({ tipo: "circuitia.resistenciaEquivalente", modo: "serie", ohmios: [5] })).toBe("");
  });
});

describe("circuitia.leyOhm", () => {
  it("V = 12 V y R = 30 Ω: la incógnita I se revela al final como 0,4 A (estático)", () => {
    const t = textos(html({ tipo: "circuitia.leyOhm", v: 12, r: 30, estatico: true }));
    expect(t).toContain("I = 0.4 A");
    expect(t).toContain("V = 12 V");
    expect(t).toContain("R = 30 Ω");
  });

  it("animado: al empezar la incógnita se muestra como «?»", () => {
    const t = textos(html({ tipo: "circuitia.leyOhm", v: 12, r: 30 }));
    expect(t).toContain("I = ?");
    expect(t).not.toContain("I = 0.4 A");
  });

  it("I y R conocidos: calcula V (0,5 A × 10 Ω = 5 V); V e I: calcula R (12 V / 2 A = 6 Ω)", () => {
    expect(textos(html({ tipo: "circuitia.leyOhm", i: 0.5, r: 10, estatico: true }))).toContain("V = 5 V");
    expect(textos(html({ tipo: "circuitia.leyOhm", v: 12, i: 2, estatico: true }))).toContain("R = 6 Ω");
  });

  it("con los 3 valores o con menos de 2, se omite", () => {
    expect(html({ tipo: "circuitia.leyOhm", v: 1, i: 1, r: 1 })).toBe("");
    expect(html({ tipo: "circuitia.leyOhm", v: 1 })).toBe("");
  });
});

describe("español neutro y paridad en los textos de los visuales", () => {
  it("el HTML en español no contiene voseo", async () => {
    const { detectarVoseo } = await import("@/lib/texto/espanolNeutro");
    for (const l of LECCIONES_CIRCUITIA) {
      for (const v of l.visuales) expect(detectarVoseo(html({ ...v, estatico: true })), `${l.slug} ${v.tipo}`).toEqual([]);
    }
  });

  it("es y en tienen las mismas claves en Circuitia.visuales", () => {
    const claves = (o: unknown, pre = ""): string[] =>
      o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? claves(v, `${pre}${k}.`) : [`${pre}${k}`])) : [];
    const es = leer("es").Circuitia.visuales;
    const en = leer("en").Circuitia.visuales;
    expect(claves(es).sort()).toEqual(claves(en).sort());
    expect(claves(es).length).toBeGreaterThan(15);
  });
});
