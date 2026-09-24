import { describe, it, expect } from "vitest";
import katex from "katex";
import { ECUACIONES, solucionesConInversa, solucionesRad, solucionesTex } from "./ecuaciones";
import { aNumero } from "./fracciones";

// Cada ecuación del catálogo se verifica por SUSTITUCIÓN (cada solución anula
// f) y por COMPLETITUD (un barrido fino de [0, 2π) no encuentra ningún otro
// punto donde f se anule, ni siquiera un cero doble en el que f toca el eje
// sin cruzarlo).
describe("ecuaciones trigonométricas del catálogo", () => {
  it("cada solución listada satisface la ecuación (sustitución) y están en [0, 2π) y en orden", () => {
    for (const e of ECUACIONES) {
      katex.renderToString(e.tex, { throwOnError: true });
      expect(e.soluciones.length, e.id).toBeGreaterThan(0);
      let previa = -1;
      for (const s of e.soluciones) {
        const x = aNumero(s) * Math.PI;
        expect(x, e.id).toBeGreaterThanOrEqual(0);
        expect(x, e.id).toBeLessThan(2 * Math.PI);
        expect(x, `${e.id}: fuera de orden`).toBeGreaterThan(previa);
        previa = x;
        expect(Math.abs(e.f(x)), `${e.id} en ${s.n}/${s.d}π`).toBeLessThan(1e-9);
      }
      katex.renderToString(solucionesTex(e), { throwOnError: true });
    }
  });

  it("no falta ninguna solución: en una malla de 40000 puntos, f solo es ~0 cerca de las soluciones listadas", () => {
    for (const e of ECUACIONES) {
      const listadas = solucionesRad(e);
      const N = 40000;
      for (let i = 0; i < N; i++) {
        const x = (i / N) * 2 * Math.PI;
        const y = e.f(x);
        if (!Number.isFinite(y)) continue;
        if (Math.abs(y) < 1e-4) {
          const cerca = listadas.some((s) => Math.abs(s - x) < 0.02 || Math.abs(s + 2 * Math.PI - x) < 0.02);
          expect(cerca, `${e.id}: f(${x.toFixed(4)}) = ${y} y no es una solución listada`).toBe(true);
        }
      }
      // y ningún cambio de signo entre puntos consecutivos sin solución cercana (ceros simples)
      let anterior = e.f(0.0000001);
      for (let i = 1; i < N; i++) {
        const x = (i / N) * 2 * Math.PI + 0.0000001;
        const y = e.f(x);
        if (Number.isFinite(y) && Number.isFinite(anterior) && Math.sign(y) !== Math.sign(anterior) && Math.abs(y) < 0.05 && Math.abs(anterior) < 0.05) {
          expect(listadas.some((s) => Math.abs(s - x) < 0.02 || Math.abs(s + 2 * Math.PI - x) < 0.02), `${e.id}: cambio de signo en ${x.toFixed(4)}`).toBe(true);
        }
        anterior = y;
      }
    }
  });

  it("ids únicos y cantidad razonable de casos por tipo", () => {
    expect(new Set(ECUACIONES.map((e) => e.id)).size).toBe(ECUACIONES.length);
    expect(ECUACIONES.filter((e) => e.id.startsWith("fact-")).length).toBeGreaterThanOrEqual(3);
    expect(ECUACIONES.filter((e) => e.id.startsWith("id-")).length).toBeGreaterThanOrEqual(3);
  });
});

describe("resolver con la función inversa", () => {
  it("las dos soluciones de sen x = k, cos x = k y tan x = k en [0, 2π) satisfacen la ecuación y no hay otras", () => {
    const casos: ["sen" | "cos" | "tan", number][] = [["sen", 0.3], ["sen", -0.6], ["cos", -0.4], ["cos", 0.8], ["tan", 2], ["tan", -3]];
    for (const [fn, k] of casos) {
      const sols = solucionesConInversa(fn, k);
      expect(sols.length, `${fn} = ${k}`).toBe(2);
      const f = (x: number) => (fn === "sen" ? Math.sin(x) : fn === "cos" ? Math.cos(x) : Math.tan(x)) - k;
      for (const s of sols) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThan(2 * Math.PI);
        expect(Math.abs(f(s)), `${fn} = ${k} en ${s}`).toBeLessThan(1e-7);
      }
      // barrido: no hay otro cero
      for (let i = 0; i < 20000; i++) {
        const x = (i / 20000) * 2 * Math.PI;
        if (Math.abs(x - Math.PI / 2) < 1e-3 || Math.abs(x - (3 * Math.PI) / 2) < 1e-3) continue;
        if (Math.abs(f(x)) < 1e-3) expect(sols.some((s) => Math.abs(s - x) < 0.01), `${fn} = ${k}: ${x}`).toBe(true);
      }
    }
    expect(solucionesConInversa("sen", 1.5)).toEqual([]);
    expect(solucionesConInversa("cos", -2)).toEqual([]);
  });
});
