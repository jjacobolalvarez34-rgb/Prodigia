import { describe, it, expect } from "vitest";
import { calcularNuevoNivel } from "./skillLevels";

describe("calcularNuevoNivel", () => {
  it("sube el nivel después de 3 aciertos seguidos y resetea la racha", () => {
    let estado = { nivel: 3, racha_actual: 0 };
    estado = calcularNuevoNivel(estado.nivel, estado.racha_actual, true);
    estado = calcularNuevoNivel(estado.nivel, estado.racha_actual, true);
    expect(estado).toEqual({ nivel: 3, racha_actual: 2 });
    estado = calcularNuevoNivel(estado.nivel, estado.racha_actual, true);
    expect(estado).toEqual({ nivel: 4, racha_actual: 0 });
  });

  it("baja el nivel con un error sin escudo", () => {
    const estado = calcularNuevoNivel(5, 2, false, false);
    expect(estado).toEqual({ nivel: 4, racha_actual: 0 });
  });

  it("un error resetea la racha pero NO baja el nivel si está protegido (escudo)", () => {
    const estado = calcularNuevoNivel(5, 2, false, true);
    expect(estado).toEqual({ nivel: 5, racha_actual: 0 });
  });

  it("nunca sube el nivel más allá de 10", () => {
    const estado = calcularNuevoNivel(10, 2, true);
    expect(estado.nivel).toBe(10);
  });

  it("nunca baja el nivel por debajo de 1", () => {
    const estado = calcularNuevoNivel(1, 0, false, false);
    expect(estado.nivel).toBe(1);
  });

  it("un acierto que no llega a 3 seguidos no cambia el nivel", () => {
    const estado = calcularNuevoNivel(5, 0, true);
    expect(estado).toEqual({ nivel: 5, racha_actual: 1 });
  });
});
