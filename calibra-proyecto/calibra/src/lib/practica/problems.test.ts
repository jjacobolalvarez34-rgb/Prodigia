import { describe, it, expect } from "vitest";
import { generarProblema } from "./problems";
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
