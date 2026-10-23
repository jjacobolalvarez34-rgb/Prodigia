import { describe, it, expect } from "vitest";
import { generarProblema, rangoOperandos } from "./problems";
import { mulberry32 } from "@/lib/rng";

// Fase T3: los duelos en tiempo real dependen de que dos rivales,
// generando problemas por separado en sus propios navegadores, vean
// EXACTAMENTE la misma secuencia — la única garantía de eso es que
// generarProblema(..., rng) sea puramente determinístico dada la misma
// semilla, nunca Math.random.
describe("generarProblema con rng sembrado (duelos en tiempo real)", () => {
  it("la misma semilla produce exactamente la misma secuencia de problemas", () => {
    const rngA = mulberry32(123456);
    const rngB = mulberry32(123456);

    const secuenciaA = Array.from({ length: 20 }, () => generarProblema("suma", 5, undefined, rngA));
    const secuenciaB = Array.from({ length: 20 }, () => generarProblema("suma", 5, undefined, rngB));

    expect(secuenciaA).toEqual(secuenciaB);
  });

  it("semillas distintas producen secuencias distintas (no es una coincidencia de la comparación)", () => {
    const rngA = mulberry32(1);
    const rngB = mulberry32(2);

    const secuenciaA = Array.from({ length: 10 }, () => generarProblema("multiplicacion", 6, undefined, rngA));
    const secuenciaB = Array.from({ length: 10 }, () => generarProblema("multiplicacion", 6, undefined, rngB));

    expect(secuenciaA).not.toEqual(secuenciaB);
  });

  it("sin rng explícito, generarProblema sigue funcionando (práctica normal, no rompe nada)", () => {
    const p = generarProblema("division", 3);
    expect(p.problemType).toBe("division");
    expect(p.answer).toBe(p.a / p.b);
  });

  it("funciona igual para las 4 operaciones con la misma semilla", () => {
    for (const tipo of ["suma", "resta", "multiplicacion", "division"] as const) {
      const rngA = mulberry32(999);
      const rngB = mulberry32(999);
      const a = generarProblema(tipo, 8, undefined, rngA);
      const b = generarProblema(tipo, 8, undefined, rngB);
      expect(a).toEqual(b);
    }
  });
});

describe("rangoOperandos (rango que muestra el Modo Zen antes de jugar)", () => {
  it("todo problema generado cae dentro del rango que se anuncia", () => {
    const tipos = ["suma", "resta", "multiplicacion", "division"] as const;
    const mods = [undefined, "numeros_grandes", "negativos", "inverso"] as const;
    for (const tipo of tipos) {
      for (const mod of mods) {
        for (let nivel = 1; nivel <= 10; nivel++) {
          const r = rangoOperandos(tipo, nivel, mod);
          for (let k = 0; k < 40; k++) {
            const p = generarProblema(tipo, nivel, mod);
            const dentro = (x: number, [min, max]: [number, number]) => x >= min && x <= max;
            if (tipo === "suma" || tipo === "resta") {
              expect(dentro(p.a, r.a) && dentro(p.b, r.b), `${tipo}/${mod}/${nivel}: ${p.a}, ${p.b}`).toBe(true);
            } else if (tipo === "multiplicacion") {
              const b = p.incognitaB ? p.answer : p.b;
              expect(dentro(p.a, r.a) && dentro(b, r.b), `${tipo}/${mod}/${nivel}`).toBe(true);
            } else {
              expect(dentro(p.b, r.a) && dentro(p.answer, r.b), `${tipo}/${nivel}`).toBe(true);
            }
          }
        }
      }
    }
  });
});
