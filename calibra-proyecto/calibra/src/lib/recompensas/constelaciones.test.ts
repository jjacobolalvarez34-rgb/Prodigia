import { describe, expect, it } from "vitest";
import { MUNDOS_LANDING as MUNDOS } from "@/lib/mundos";
import { ESTRELLAS_POR_CONSTELACION, FORMAS_CONSTELACION } from "./constelaciones";

describe("formas de las constelaciones", () => {
  it("hay una por cada una de las 13 ciudades, con 7 estrellas dentro de la caja de 100 × 100", () => {
    expect(Object.keys(FORMAS_CONSTELACION).sort()).toEqual(MUNDOS.map((m) => m.slug).sort());
    for (const [mundo, f] of Object.entries(FORMAS_CONSTELACION)) {
      expect(f.puntos.length, mundo).toBe(ESTRELLAS_POR_CONSTELACION);
      for (const [x, y] of f.puntos) {
        expect(x >= 0 && x <= 100 && y >= 0 && y <= 100, mundo).toBe(true);
      }
      expect(new Set(f.puntos.map((p) => p.join(","))).size, `${mundo}: estrellas repetidas`).toBe(7);
    }
  });

  it("las líneas unen estrellas que existen y no se repiten", () => {
    for (const [mundo, f] of Object.entries(FORMAS_CONSTELACION)) {
      expect(f.lineas.length, mundo).toBeGreaterThan(0);
      const vistas = new Set<string>();
      for (const [a, b] of f.lineas) {
        expect(a !== b && a >= 0 && b >= 0 && a < 7 && b < 7, mundo).toBe(true);
        const k = [Math.min(a, b), Math.max(a, b)].join("-");
        expect(vistas.has(k), `${mundo}: ${k}`).toBe(false);
        vistas.add(k);
      }
    }
  });
});
