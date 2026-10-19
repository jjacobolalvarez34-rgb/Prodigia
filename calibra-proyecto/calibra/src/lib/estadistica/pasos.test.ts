import { describe, expect, it } from "vitest";
import { generarProblemaEstadistica, MODOS_ESTADISTICA } from "@/lib/practica/estadistica";

// Toda pregunta de Estadística trae su «cómo se resuelve» (pedido 2026-10-18).
describe("pasos de Estadística", () => {
  it("cada modo y nivel genera preguntas con pasos y sin NaN", () => {
    for (const modo of MODOS_ESTADISTICA) {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 25; i++) {
          const p = generarProblemaEstadistica(modo, nivel);
          expect(p.pasos?.length, `${modo} ${nivel} ${p.detalle.tipo}`).toBeGreaterThan(0);
          for (const paso of p.pasos ?? []) expect(paso).not.toMatch(/NaN|undefined|Infinity/);
        }
      }
    }
  });
});
