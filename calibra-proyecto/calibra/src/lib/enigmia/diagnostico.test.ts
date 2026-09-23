import { describe, it, expect } from "vitest";
import { filasDiagnostico, CATEGORIAS_ENIGMIA } from "./diagnostico";

describe("filasDiagnostico", () => {
  it("produce exactamente 4 filas, una por categoría", () => {
    const filas = filasDiagnostico("U1", "patrones", 7);
    expect(filas).toHaveLength(4);
    expect(new Set(filas.map((f) => f.categoria))).toEqual(new Set(CATEGORIAS_ENIGMIA));
  });

  it("la categoría diagnosticada recibe el nivel real calculado", () => {
    const filas = filasDiagnostico("U1", "patrones", 7);
    const patrones = filas.find((f) => f.categoria === "patrones");
    expect(patrones?.nivel).toBe(7);
  });

  it("las otras 3 categorías arrancan en nivel 1, no en el nivel diagnosticado", () => {
    const filas = filasDiagnostico("U1", "patrones", 7);
    const otras = filas.filter((f) => f.categoria !== "patrones");
    expect(otras).toHaveLength(3);
    expect(otras.every((f) => f.nivel === 1)).toBe(true);
  });

  it("todas las filas arrancan con racha_actual en 0", () => {
    const filas = filasDiagnostico("U1", "deduccion", 5);
    expect(filas.every((f) => f.racha_actual === 0)).toBe(true);
  });

  it("todas las filas quedan asociadas al mismo user_id recibido", () => {
    const filas = filasDiagnostico("abc-123", "memoria", 4);
    expect(filas.every((f) => f.user_id === "abc-123")).toBe(true);
  });

  it("funciona para cualquiera de las 4 categorías como diagnosticada", () => {
    for (const cat of CATEGORIAS_ENIGMIA) {
      const filas = filasDiagnostico("U", cat, 9);
      expect(filas.find((f) => f.categoria === cat)?.nivel).toBe(9);
      expect(filas.filter((f) => f.categoria !== cat).every((f) => f.nivel === 1)).toBe(true);
    }
  });

  it("nivel 1 en salteo (saltear diagnóstico): la categoría diagnosticada también queda en 1, indistinguible de las otras 3", () => {
    const filas = filasDiagnostico("U", "patrones", 1);
    expect(filas.every((f) => f.nivel === 1)).toBe(true);
  });
});
