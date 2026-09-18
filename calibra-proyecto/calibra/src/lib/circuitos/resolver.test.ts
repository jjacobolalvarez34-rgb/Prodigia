import { describe, expect, it } from "vitest";
import {
  compararTrasPerturbacion,
  resistenciaEquivalente,
  resolverCircuito,
  type NodoCircuito,
} from "./resolver";

describe("resistenciaEquivalente / resolverCircuito", () => {
  it("resuelve un circuito serie puro: R1=2Ω + R2=3Ω, V=10V", () => {
    const circuito: NodoCircuito = {
      tipo: "serie",
      hijos: [
        { tipo: "resistor", id: "R1", ohmios: 2 },
        { tipo: "resistor", id: "R2", ohmios: 3 },
      ],
    };

    expect(resistenciaEquivalente(circuito)).toBeCloseTo(5, 9);

    const resultado = resolverCircuito(circuito, 10);

    // Serie: misma corriente en ambos resistores.
    expect(resultado.get("R1")!.corriente).toBeCloseTo(2, 9);
    expect(resultado.get("R2")!.corriente).toBeCloseTo(2, 9);

    // Divisor de voltaje: 4V + 6V = 10V.
    expect(resultado.get("R1")!.voltaje).toBeCloseTo(4, 9);
    expect(resultado.get("R2")!.voltaje).toBeCloseTo(6, 9);
  });

  it("resuelve un circuito paralelo puro: R1=4Ω ∥ R2=4Ω, V=8V", () => {
    const circuito: NodoCircuito = {
      tipo: "paralelo",
      hijos: [
        { tipo: "resistor", id: "R1", ohmios: 4 },
        { tipo: "resistor", id: "R2", ohmios: 4 },
      ],
    };

    expect(resistenciaEquivalente(circuito)).toBeCloseTo(2, 9);

    const resultado = resolverCircuito(circuito, 8);

    // I_total = V / R_eq = 8 / 2 = 4A, repartida en partes iguales.
    expect(resultado.get("R1")!.corriente).toBeCloseTo(2, 9);
    expect(resultado.get("R2")!.corriente).toBeCloseTo(2, 9);

    // Paralelo: mismo voltaje en ambas ramas.
    expect(resultado.get("R1")!.voltaje).toBeCloseTo(8, 9);
    expect(resultado.get("R2")!.voltaje).toBeCloseTo(8, 9);
  });

  it("resuelve un circuito mixto: R1=2Ω serie con (R2=6Ω ∥ R3=3Ω), V=12V", () => {
    const paralelo: NodoCircuito = {
      tipo: "paralelo",
      hijos: [
        { tipo: "resistor", id: "R2", ohmios: 6 },
        { tipo: "resistor", id: "R3", ohmios: 3 },
      ],
    };
    const circuito: NodoCircuito = {
      tipo: "serie",
      hijos: [{ tipo: "resistor", id: "R1", ohmios: 2 }, paralelo],
    };

    // 1/(1/6 + 1/3) = 2
    expect(resistenciaEquivalente(paralelo)).toBeCloseTo(2, 9);
    // 2 (R1) + 2 (paralelo) = 4
    expect(resistenciaEquivalente(circuito)).toBeCloseTo(4, 9);

    const resultado = resolverCircuito(circuito, 12);

    // I_total = 12 / 4 = 3A, es la corriente que atraviesa R1 (serie).
    expect(resultado.get("R1")!.corriente).toBeCloseTo(3, 9);
    expect(resultado.get("R1")!.voltaje).toBeCloseTo(6, 9); // 3A * 2Ω

    // Voltaje restante sobre el bloque paralelo: 12 - 6 = 6V.
    expect(resultado.get("R2")!.voltaje).toBeCloseTo(6, 9);
    expect(resultado.get("R3")!.voltaje).toBeCloseTo(6, 9);

    // I_R2 = 6V / 6Ω = 1A ; I_R3 = 6V / 3Ω = 2A
    expect(resultado.get("R2")!.corriente).toBeCloseTo(1, 9);
    expect(resultado.get("R3")!.corriente).toBeCloseTo(2, 9);

    // La suma de las corrientes de las ramas en paralelo debe igualar
    // la corriente total (conservación de la corriente).
    expect(resultado.get("R2")!.corriente + resultado.get("R3")!.corriente).toBeCloseTo(3, 9);
  });
});

describe("compararTrasPerturbacion", () => {
  it("en serie, al duplicar R2 la corriente en R1 (mismo camino) disminuye", () => {
    const original: NodoCircuito = {
      tipo: "serie",
      hijos: [
        { tipo: "resistor", id: "R1", ohmios: 2 },
        { tipo: "resistor", id: "R2", ohmios: 3 },
      ],
    };
    const perturbado: NodoCircuito = {
      tipo: "serie",
      hijos: [
        { tipo: "resistor", id: "R1", ohmios: 2 },
        { tipo: "resistor", id: "R2", ohmios: 6 }, // R2 duplicado
      ],
    };

    const comparacion = compararTrasPerturbacion(original, perturbado, 10, "R1", "corriente");
    expect(comparacion).toBe("disminuye");
  });

  it("en paralelo con 3 ramas, duplicar una rama no cambia la corriente de una rama hermana", () => {
    const original: NodoCircuito = {
      tipo: "paralelo",
      hijos: [
        { tipo: "resistor", id: "R1", ohmios: 4 },
        { tipo: "resistor", id: "R2", ohmios: 6 },
        { tipo: "resistor", id: "R3", ohmios: 12 },
      ],
    };
    const perturbado: NodoCircuito = {
      tipo: "paralelo",
      hijos: [
        { tipo: "resistor", id: "R1", ohmios: 4 },
        { tipo: "resistor", id: "R2", ohmios: 12 }, // R2 duplicado
        { tipo: "resistor", id: "R3", ohmios: 12 },
      ],
    };

    // La corriente de R3 depende solo de su propia R y del voltaje
    // compartido de la fuente (que no cambia en un nodo paralelo raíz),
    // así que no debería cambiar aunque R2 se duplique.
    const comparacion = compararTrasPerturbacion(original, perturbado, 12, "R3", "corriente");
    expect(comparacion).toBe("no_cambia");
  });
});
