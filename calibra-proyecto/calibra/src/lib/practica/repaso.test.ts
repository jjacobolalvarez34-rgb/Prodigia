import { describe, expect, it } from "vitest";
import { generarProblema, type Problem } from "./problems";
import { pasosAritmetica, pasosFraccion } from "./repaso";
import { generarProblemaDecimal } from "./decimales";
import { generarProblemaPotencia } from "./potencias";
import { generarProblemaAlgebra } from "./algebra";
import { generarProblemaGeometria } from "./geometria";
import { generarProblemaFraccion } from "./fracciones";

const p = (a: number, symbol: Problem["symbol"], b: number, answer: number, incognitaB = false): Problem => ({ problemType: "suma", nivel: 1, a, b, symbol, answer, incognitaB });

describe("pasos del repaso", () => {
  it("suma por posición y termina en el resultado", () => {
    const pasos = pasosAritmetica(p(47, "+", 38, 85));
    expect(pasos[0]).toContain("Separa 38 en 30 + 8");
    expect(pasos.at(-1)).toMatch(/= 85$/);
  });

  it("completa la decena con dos cifras chicas", () => {
    expect(pasosAritmetica(p(7, "+", 8, 15))).toEqual(["Completa la decena: 7 + 3 = 10", "Te quedan 5 por sumar: 10 + 5 = 15"]);
  });

  it("resta por posición y comprueba", () => {
    const pasos = pasosAritmetica(p(83, "−", 47, 36));
    expect(pasos).toContain("Resta las decenas: 83 − 40 = 43");
    expect(pasos).toContain("Resta las unidades: 43 − 7 = 36");
  });

  it("multiplica separando el factor más grande", () => {
    const pasos = pasosAritmetica(p(48, "×", 25, 1200));
    expect(pasos.at(-1)).toBe("Suma los resultados: 1000 + 200 = 1200");
  });

  it("divide por partes", () => {
    const pasos = pasosAritmetica(p(156, "÷", 12, 13));
    expect(pasos.at(-1)).toBe("Comprueba: 13 × 12 = 156");
  });

  it("despeja la incógnita del modificador inverso", () => {
    expect(pasosAritmetica(p(7, "×", 56, 8, true))[0]).toBe("Si 7 × ? = 56, entonces ? = 56 ÷ 7");
  });

  it("explica los signos con negativos", () => {
    const pasos = pasosAritmetica(p(-6, "×", 4, -24));
    expect(pasos.at(-1)).toContain("negativo: −24");
  });

  it("toda pregunta de aritmética tiene pasos en todos los niveles", () => {
    for (const tipo of ["suma", "resta", "multiplicacion", "division"] as const) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 30; i++) expect(pasosAritmetica(generarProblema(tipo, nivel)).length).toBeGreaterThan(0);
      }
    }
  });

  it("las fracciones y los temas con enunciado traen pasos", () => {
    for (let nivel = 1; nivel <= 10; nivel++) {
      for (let i = 0; i < 20; i++) {
        expect(pasosFraccion(generarProblemaFraccion({ simplificar: nivel, comparar: nivel, sumar: nivel })).length).toBeGreaterThan(0);
        expect(generarProblemaDecimal({ convertir: nivel, porcentaje: nivel, redondear: nivel }).pasos?.length).toBeGreaterThan(0);
        expect(generarProblemaPotencia({ potencia: nivel, raiz: nivel, notacion: nivel }).pasos?.length).toBeGreaterThan(0);
        expect(generarProblemaAlgebra({ evaluar: nivel, "un-paso": nivel, "dos-pasos": nivel }).pasos?.length).toBeGreaterThan(0);
        expect(generarProblemaGeometria({ perimetro: nivel, area: nivel, angulos: nivel, ternas: nivel }).pasos?.length).toBeGreaterThan(0);
      }
    }
  });
});
