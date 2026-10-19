import { describe, expect, it } from "vitest";
import { generarProblemaCalculia, type ModoCalculia } from "./calculia";
import { generarProblemaCircuitia, type ModoCircuitia } from "./circuitia";
import { generarProblemaCodia } from "./codia";
import { generarProblemaDinamia } from "./dinamia";
import { generarProblemaVitalia } from "./vitalia";
import { generarProblemaNaipia } from "./naipia";
import { generarProblemaTrigonometria } from "./trigonometria";

// Cada pregunta trae su «cómo se resuelve» (pedido 2026-10-18), sin huecos raros.
// En Codia «NaN», «Infinity» y «undefined» pueden ser la salida real de un programa (JS).
function revisar(pasos: string[] | undefined, donde: string, codigo = false) {
  expect(pasos?.length, donde).toBeGreaterThan(0);
  for (const p of pasos ?? []) expect(p, donde).not.toMatch(codigo ? /\[object|\f/ : /NaN|undefined|Infinity|\[object|\f/);
}

describe("pasos de cada mundo", () => {
  it("Calculia", () => {
    for (const modo of ["derivadas", "integrales", "series", "multivariable"] as ModoCalculia[])
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 20; i++) revisar(generarProblemaCalculia(modo, nivel).pasos, `calculia ${modo} ${nivel}`);
  });

  it("Circuitia", () => {
    for (const modo of ["serie", "paralelo", "mixto", "cualitativo"] as ModoCircuitia[])
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) revisar(generarProblemaCircuitia(modo, nivel).pasos, `circuitia ${modo} ${nivel}`);
  });

  it("Trigonometría", () => {
    for (const modo of ["razones", "circulo", "identidades", "leyes"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) revisar(generarProblemaTrigonometria(modo, nivel).pasos, `trigonometria ${modo} ${nivel}`);
  });

  it("Codia", () => {
    for (const modo of ["sintaxis", "salida", "error", "estructuras"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 8; i++) revisar(generarProblemaCodia(modo, nivel).pasos, `codia ${modo} ${nivel}`, true);
  });

  it("Naipia", () => {
    for (const modo of ["hilo", "ko", "hiopt2", "omega2", "verdadero"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 10; i++) revisar(generarProblemaNaipia(modo, nivel).pasos, `naipia ${modo} ${nivel}`);
  });

  it("Dinamia", () => {
    for (const modo of ["cinematica", "vectores", "newton", "energia", "termo", "fluidos"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) revisar(generarProblemaDinamia(modo, nivel).pasos, `dinamia ${modo} ${nivel}`);
  });

  it("Vitalia", () => {
    for (const modo of ["celula", "procesos", "genetica", "sistemas", "reinos", "ecologia"] as const)
      for (let nivel = 1; nivel <= 10; nivel++) for (let i = 0; i < 15; i++) {
        const p = generarProblemaVitalia(modo, nivel);
        revisar(p.pasos, `vitalia ${modo} ${nivel}`);
        expect(p.pasos?.[0], `vitalia sin idea propia: ${p.detalle.tipo}`).not.toMatch(/^Piensa en la idea/);
      }
  });
});
