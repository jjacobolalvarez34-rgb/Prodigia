import { describe, it, expect } from "vitest";
import { calcularXp, calcularXpDetallado, multiplicadorDeNivel, bonusDeVelocidad, tiempoEsperadoMs } from "./formulas";

describe("calcularXp", () => {
  it("una respuesta incorrecta nunca suma XP", () => {
    expect(calcularXp(5, false, 100)).toBe(0);
    expect(calcularXp(10, false, 1)).toBe(0);
  });

  it("nivel 1 con respuesta lenta (bonus mínimo) da el XP base redondeado", () => {
    const nivel = 1;
    const esperado = tiempoEsperadoMs(nivel);
    // responder justo en el tiempo esperado da bonus 1.0x
    expect(calcularXp(nivel, true, esperado)).toBe(10);
  });

  it("responder casi instantáneo da más XP que responder al borde del tiempo esperado", () => {
    const nivel = 4;
    const rapido = calcularXp(nivel, true, 1);
    const enElLimite = calcularXp(nivel, true, tiempoEsperadoMs(nivel));
    expect(rapido).toBeGreaterThan(enElLimite);
  });

  it("nunca resta puntos por responder lento — el piso es el XP base × multiplicador de nivel", () => {
    const nivel = 6;
    const xpMuyLento = calcularXp(nivel, true, 999_999);
    const base = 10 * multiplicadorDeNivel(nivel);
    expect(xpMuyLento).toBeGreaterThanOrEqual(Math.round(base));
  });

  it("el multiplicador de nivel crece de 1.0x en nivel 1 a 2.35x en nivel 10", () => {
    expect(multiplicadorDeNivel(1)).toBeCloseTo(1.0);
    expect(multiplicadorDeNivel(10)).toBeCloseTo(2.35);
  });

  it("el bonus de velocidad nunca baja de 1.0x ni sube de 1.5x", () => {
    expect(bonusDeVelocidad(0, 5)).toBeLessThanOrEqual(1.5);
    expect(bonusDeVelocidad(999_999, 5)).toBeGreaterThanOrEqual(1.0);
  });
});

describe("calcularXpDetallado", () => {
  it("el total es coherente con base × multiplicador de nivel × bonus de velocidad", () => {
    const nivel = 7;
    const timeMs = 1500;
    const desglose = calcularXpDetallado(nivel, timeMs);
    const esperado = Math.round(desglose.base * desglose.multiplicadorNivel * desglose.bonusVelocidad);
    expect(desglose.total).toBe(esperado);
  });
});
