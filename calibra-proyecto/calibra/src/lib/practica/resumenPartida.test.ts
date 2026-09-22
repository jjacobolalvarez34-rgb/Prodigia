import { describe, expect, it } from "vitest";
import { estadoResumenPartida } from "./resumenPartida";

describe("estadoResumenPartida", () => {
  const OBJETIVO = 10;

  it("con errores, siempre repasemosEsto sin importar total/objetivo", () => {
    expect(estadoResumenPartida(10, 8, 2, OBJETIVO)).toBe("repasemosEsto");
    expect(estadoResumenPartida(3, 1, 2, OBJETIVO)).toBe("repasemosEsto");
    expect(estadoResumenPartida(0, 0, 1, OBJETIVO)).toBe("repasemosEsto");
  });

  it("sin ninguna respuesta (total 0), sinRespuestas", () => {
    expect(estadoResumenPartida(0, 0, 0, OBJETIVO)).toBe("sinRespuestas");
  });

  it("con algunas respuestas pero sin completar el objetivo y sin errores, incompletaSinErrores", () => {
    expect(estadoResumenPartida(1, 1, 0, OBJETIVO)).toBe("incompletaSinErrores");
    expect(estadoResumenPartida(9, 9, 0, OBJETIVO)).toBe("incompletaSinErrores");
  });

  it("partida completa (total >= objetivo) y sin errores, ningunoFallado", () => {
    expect(estadoResumenPartida(10, 10, 0, OBJETIVO)).toBe("ningunoFallado");
  });

  it("total mayor al objetivo y sin errores, sigue siendo ningunoFallado (límite superior)", () => {
    expect(estadoResumenPartida(15, 15, 0, OBJETIVO)).toBe("ningunoFallado");
  });

  it("respeta un objetivo distinto de 10 (por si algún mundo cambia su tamaño de partida)", () => {
    expect(estadoResumenPartida(4, 4, 0, 5)).toBe("incompletaSinErrores");
    expect(estadoResumenPartida(5, 5, 0, 5)).toBe("ningunoFallado");
  });
});
