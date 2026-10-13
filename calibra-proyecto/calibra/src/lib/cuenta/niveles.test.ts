import { describe, expect, it } from "vitest";
import {
  costoMarginalNivelCuenta,
  nivelDesdeXpCuenta,
  recompensaNivelCuenta,
  cometasNivelCuenta,
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

describe("premio por subir de nivel (0280)", () => {
  it("100 Chispas por nivel y 25 Cometas en cada múltiplo de 10", () => {
    expect(recompensaNivelCuenta()).toBe(100);
    expect(cometasNivelCuenta(9)).toBe(0);
    expect(cometasNivelCuenta(10)).toBe(25);
    expect(cometasNivelCuenta(20)).toBe(25);
    expect(cometasNivelCuenta(21)).toBe(0);
  });
});

