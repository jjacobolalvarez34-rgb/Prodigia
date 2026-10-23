import { describe, expect, it } from "vitest";
import { generarProblemaPotencia, paresPotencia } from "./potencias";

const niveles = (n: number) => ({ potencia: n, raiz: n, notacion: n });

describe("potencias: variedad por nivel", () => {
  it("los niveles bajos ya no se reducen a 2² y 3² (bug reportado 2026-09-25)", () => {
    for (const nivel of [1, 2]) {
      const pares = paresPotencia(nivel);
      expect(pares.length).toBeGreaterThanOrEqual(6);
      expect(new Set(pares.map((p) => p.base)).size).toBeGreaterThanOrEqual(5);
    }
    const vistos = new Set<string>();
    for (let i = 0; i < 400; i++) {
      const p = generarProblemaPotencia(niveles(1), ["potencia"]);
      vistos.add(p.enunciado);
    }
    expect(vistos.size).toBeGreaterThanOrEqual(6);
  });

  it("cada banda suma pares nuevos y las altas dejan de preguntar lo más fácil (auditoría 2026-10-23)", () => {
    const clave = (p: { base: number; exp: number }) => `${p.base}^${p.exp}`;
    let previo = new Set<string>();
    for (const nivel of [1, 3, 5, 7, 9]) {
      const actual = new Set(paresPotencia(nivel).map(clave));
      expect([...actual].filter((c) => !previo.has(c)).length, `nivel ${nivel}`).toBeGreaterThanOrEqual(5);
      expect(actual.size).toBeGreaterThanOrEqual(previo.size);
      previo = actual;
    }
    const alto = new Set(paresPotencia(10).map(clave));
    for (const facil of ["2^2", "3^2", "5^2"]) expect(alto.has(facil), facil).toBe(false);
    expect(paresPotencia(1).length).toBeGreaterThanOrEqual(16);
  });

  it("la respuesta siempre es base^exponente y cabe en un entero cómodo", () => {
    for (const nivel of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      for (let i = 0; i < 200; i++) {
        const p = generarProblemaPotencia(niveles(nivel), ["potencia"]);
        const m = /^\$(\d+)\^\{(\d+)\}\$$/.exec(p.enunciado)!;
        expect(Number(m[1]) ** Number(m[2])).toBe(p.respuesta);
        expect(p.respuesta).toBeLessThanOrEqual(20 ** 2 * 1000);
      }
    }
  });
});
