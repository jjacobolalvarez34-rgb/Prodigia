import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import GraficoEstadistico from "@/components/estadistica/GraficoEstadistico";
import { generarProblemaEstadistica } from "@/lib/practica/estadistica";
import { construirBoxplot } from "./graficos";
import type { GraficoEstadistica } from "./tipos";

// Test de datos de los gráficos SVG del modo 5: (a) cada gráfico generado
// se renderiza sin errores, (b) el SVG tiene exactamente un elemento por
// dato (barras/puntos/clases/atípicos) y (c) la geometría respeta la
// escala del eje — es decir, lo que se DIBUJA es lo que dicen los datos,
// que son los mismos de los que se deriva la respuesta.

function renderizar(g: GraficoEstadistica): string {
  return renderToStaticMarkup(createElement(GraficoEstadistico, { grafico: g }));
}

function contar(html: string, patron: RegExp): number {
  return (html.match(patron) ?? []).length;
}

describe("graficos de estadistica (SVG por código)", () => {
  it("dibuja un elemento por dato en cada tipo de gráfico (niveles 5-9)", () => {
    const vistos = new Set<string>();
    for (let nivel = 5; nivel <= 9; nivel++) {
      for (let i = 0; i < 300; i++) {
        const p = generarProblemaEstadistica("graficos", nivel);
        const g = p.grafico!;
        vistos.add(g.tipo);
        const html = renderizar(g);
        expect(html.startsWith("<div")).toBe(true);
        expect(html).toContain("<svg");
        expect(html).not.toMatch(/NaN|undefined|Infinity/);
        if (g.tipo === "barras") {
          // Una <rect> por barra; ninguna con altura negativa.
          expect(contar(html, /<rect /g)).toBe(g.valores.length);
          expect(html).not.toMatch(/height="-/);
        }
        if (g.tipo === "lineas") {
          expect(contar(html, /<circle /g)).toBe(g.valores.length);
          const puntos = /<polyline points="([^"]+)"/.exec(html)![1].split(" ");
          expect(puntos.length).toBe(g.valores.length);
        }
        if (g.tipo === "histograma") {
          expect(contar(html, /<rect /g)).toBe(g.frecuencias.length);
        }
        if (g.tipo === "boxplot") {
          expect(contar(html, /<circle /g)).toBe(g.atipicos.length);
          expect(contar(html, /<rect /g)).toBe(1);
        }
      }
    }
    expect([...vistos].sort()).toEqual(["barras", "boxplot", "histograma", "lineas"]);
  }, 120_000);

  it("la altura relativa de las barras respeta el eje (incluido el eje truncado)", () => {
    for (let i = 0; i < 400; i++) {
      const p = generarProblemaEstadistica("graficos", 9);
      const g = p.grafico!;
      if (g.tipo !== "barras") continue;
      const html = renderizar(g);
      const alturas = [...html.matchAll(/<rect [^>]*height="([\d.]+)"/g)].map((m) => Number(m[1]));
      expect(alturas.length).toBe(g.valores.length);
      // altura ∝ (valor − eje.min): se compara contra la primera barra.
      const rango = g.eje.max - g.eje.min;
      for (let k = 0; k < alturas.length; k++) {
        const esperada = ((g.valores[k] - g.eje.min) / rango) * (250 - 34 - 42);
        expect(Math.abs(alturas[k] - esperada)).toBeLessThan(1e-6);
      }
    }
  });

  it("el gráfico engañoso (eje truncado) exagera la altura visual pero el dato real no cambia", () => {
    let visto = false;
    for (let i = 0; i < 600 && !visto; i++) {
      const p = generarProblemaEstadistica("graficos", 9);
      if (p.detalle.tipo !== "engano_aparente") continue;
      visto = true;
      const g = p.grafico!;
      if (g.tipo !== "barras") throw new Error("se esperaba barras");
      const [a, b] = g.valores;
      expect(g.eje.min).toBeGreaterThan(0);
      // La barra B "parece" p.respuesta veces la A, pero B/A real es casi 1.
      expect((b - g.eje.min) / (a - g.eje.min)).toBe(p.respuesta);
      expect(b / a).toBeLessThan(1.11);
      expect(p.respuesta).toBeGreaterThanOrEqual(1.5);
    }
    expect(visto).toBe(true);
  });

  it("el boxplot tiene coherencia interna en los niveles 7-9 (orden, bigotes y atípicos de Tukey)", () => {
    for (let nivel = 7; nivel <= 9; nivel++) {
      for (let i = 0; i < 400; i++) {
        const g = construirBoxplot(nivel);
        const iqr = g.q3 - g.q1;
        expect(g.min).toBeLessThanOrEqual(g.q1);
        expect(g.q1).toBeLessThan(g.mediana);
        expect(g.mediana).toBeLessThan(g.q3);
        expect(g.q3).toBeLessThanOrEqual(g.max);
        expect(g.min).toBeGreaterThanOrEqual(g.q1 - 1.5 * iqr);
        expect(g.max).toBeLessThanOrEqual(g.q3 + 1.5 * iqr);
        for (const a of g.atipicos) expect(a < g.q1 - 1.5 * iqr || a > g.q3 + 1.5 * iqr).toBe(true);
        expect(g.min).toBeGreaterThanOrEqual(g.eje.min);
        expect(Math.max(g.max, ...g.atipicos)).toBeLessThanOrEqual(g.eje.max);
      }
    }
  });

  it("los histogramas usan clases contiguas de igual ancho", () => {
    for (let i = 0; i < 400; i++) {
      const g = generarProblemaEstadistica("graficos", 8).grafico!;
      if (g.tipo !== "histograma") continue;
      const anchos = g.limites.slice(1).map((l, k) => l - g.limites[k]);
      expect(new Set(anchos).size).toBe(1);
      expect(g.limites.length).toBe(g.frecuencias.length + 1);
    }
  });
});
