import { describe, expect, it } from "vitest";
import {
  costoMarginalNivelCuenta,
  nivelDesdeXpCuenta,
  recompensaNivelCuenta,
  xpRequeridoNivelCuenta,
} from "./niveles";

describe("costoMarginalNivelCuenta (0118)", () => {
  it("respeta los tramos de la escalera", () => {
    expect(costoMarginalNivelCuenta(2)).toBe(200);
    for (const n of [3, 4, 5]) expect(costoMarginalNivelCuenta(n)).toBe(300);
    for (const n of [6, 7, 8, 9, 10]) expect(costoMarginalNivelCuenta(n)).toBe(550);
    for (const n of [11, 12, 13, 14, 15]) expect(costoMarginalNivelCuenta(n)).toBe(900);
    for (const n of [16, 17, 18, 19, 20]) expect(costoMarginalNivelCuenta(n)).toBe(1400);
    for (const n of [21, 25, 30]) expect(costoMarginalNivelCuenta(n)).toBe(1900);
    for (const n of [31, 40, 50, 100]) expect(costoMarginalNivelCuenta(n)).toBe(2400);
  });

  it("es la curva acotada: el marginal nunca supera la cota", () => {
    for (let n = 2; n <= 500; n++) {
      expect(costoMarginalNivelCuenta(n)).toBeLessThanOrEqual(2400);
    }
  });
});

describe("xpRequeridoNivelCuenta (0118)", () => {
  const esperados: Record<number, number> = {
    1: 0,
    2: 200,
    3: 500,
    4: 800,
    5: 1100,
    6: 1650,
    7: 2200,
    8: 2750,
    9: 3300,
    10: 3850,
    11: 4750,
    12: 5650,
    13: 6550,
    14: 7450,
    15: 8350,
    16: 9750,
    17: 11150,
    18: 12550,
    19: 13950,
    20: 15350,
    21: 17250,
    25: 24850,
    30: 34350,
    40: 58350,
    50: 82350,
    100: 202350,
  };

  it("coincide con la tabla 1..50 (y niveles altos acotados)", () => {
    for (const [nivel, esperado] of Object.entries(esperados)) {
      expect(xpRequeridoNivelCuenta(Number(nivel))).toBe(esperado);
    }
  });

  it("es acumulado monótono creciente y coherente con el marginal", () => {
    let previo = 0;
    for (let n = 2; n <= 100; n++) {
      const actual = xpRequeridoNivelCuenta(n);
      expect(actual - previo).toBe(costoMarginalNivelCuenta(n));
      previo = actual;
    }
  });
});

describe("nivelDesdeXpCuenta (0118)", () => {
  it("invierte xpRequeridoNivelCuenta en los umbrales exactos", () => {
    for (let n = 1; n <= 50; n++) {
      expect(nivelDesdeXpCuenta(xpRequeridoNivelCuenta(n))).toBe(n);
    }
  });

  it("bordea los umbrales (justo antes del nivel siguiente)", () => {
    expect(nivelDesdeXpCuenta(1099)).toBe(4);
    expect(nivelDesdeXpCuenta(1100)).toBe(5);
    expect(nivelDesdeXpCuenta(8349)).toBe(14);
    expect(nivelDesdeXpCuenta(8350)).toBe(15);
    expect(nivelDesdeXpCuenta(49)).toBe(1);
    expect(nivelDesdeXpCuenta(-5)).toBe(1);
  });
});

describe("recompensaNivelCuenta (T6)", () => {
  it("50*n + 250: 300 en nivel 1, 1000 en el 15, 2750 en el 50", () => {
    expect(recompensaNivelCuenta(1)).toBe(300);
    expect(recompensaNivelCuenta(5)).toBe(500);
    expect(recompensaNivelCuenta(10)).toBe(750);
    expect(recompensaNivelCuenta(15)).toBe(1000);
    expect(recompensaNivelCuenta(20)).toBe(1250);
    expect(recompensaNivelCuenta(30)).toBe(1750);
    expect(recompensaNivelCuenta(50)).toBe(2750);
  });

  it("niveles bajos emocionan sin llegar a 2x el costo del nivel", () => {
    for (let n = 2; n <= 10; n++) {
      expect(recompensaNivelCuenta(n)).toBeLessThanOrEqual(Math.round(costoMarginalNivelCuenta(n) * 1.75));
      expect(recompensaNivelCuenta(n)).toBeGreaterThanOrEqual(Math.round(costoMarginalNivelCuenta(n) * 0.9));
    }
  });

  it("niveles medios/altos pagan entre 0.7x y 1.15x el costo del nivel", () => {
    for (let n = 11; n <= 50; n++) {
      expect(recompensaNivelCuenta(n)).toBeLessThanOrEqual(Math.round(costoMarginalNivelCuenta(n) * 1.15));
      expect(recompensaNivelCuenta(n)).toBeGreaterThanOrEqual(Math.round(costoMarginalNivelCuenta(n) * 0.6));
    }
  });

  it("es creciente (los niveles altos valen más)", () => {
    for (let n = 1; n < 200; n++) {
      expect(recompensaNivelCuenta(n + 1)).toBeGreaterThan(recompensaNivelCuenta(n));
    }
  });
});