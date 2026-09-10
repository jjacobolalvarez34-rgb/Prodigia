import { describe, expect, it } from "vitest";
import { faltanteParaSubir, nivelDesdeFracciones } from "./progresoNivel";

describe("nivelDesdeFracciones", () => {
  it("devuelve 1 para nada de progreso", () => {
    expect(nivelDesdeFracciones(0, 0, 0)).toBe(1);
  });

  it("plica la fórmula 34/45/21 con la curva de 0117", () => {
    expect(nivelDesdeFracciones(1, 1, 1)).toBe(100);
  });

  it("un solo eje nunca lleva al techo", () => {
    expect(nivelDesdeFracciones(1, 0, 0)).toBe(34);
  });

  it("clampa valores fuera de rango", () => {
    expect(nivelDesdeFracciones(2, -1, NaN)).toBe(34);
  });
});

describe("faltanteParaSubir", () => {
  it("dice maximo en nivel 100", () => {
    expect(faltanteParaSubir({ puntos: 90000, nivel: 100, fracVolumen: 1, fracDominio: 1, fracLecciones: 1 })).toEqual({
      tipo: "maximo",
    });
  });

  it("convierte el gap en XP de volumen cuando alcanza", () => {
    // w = 0.34*0.235294 ≈ 0.08 → nivel 8 (round(8.0)). meta(9) = 0.085,
    // gap 0.005 alcanza con volumen (v<1) → 0.005/0.34*25000 = 367.6 → 368.
    const p = { puntos: 5882, nivel: 8, fracVolumen: 0.23529411764705882, fracDominio: 0, fracLecciones: 0 };
    expect(faltanteParaSubir(p)).toEqual({ tipo: "xp", xpFaltante: 368 });
  });

  it("pide dominio cuando el gap excede lo que puede dar el volumen", () => {
    // w = 0.34 con volumen al 99%: resta 0.005 para el nivel 35, pero el
    // volumen ya no aporta → imposible subir solo con XP.
    const p = { puntos: 24750, nivel: 34, fracVolumen: 0.99, fracDominio: 0, fracLecciones: 0 };
    expect(faltanteParaSubir(p)).toEqual({ tipo: "dominio" });
  });
});