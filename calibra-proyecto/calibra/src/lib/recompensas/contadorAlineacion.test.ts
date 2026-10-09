import { describe, expect, it } from "vitest";
import { CICLO_TOTAL_MS, DURACION_EVENTO_MS, PRIMERA_ALINEACION_MS } from "@/lib/ciudades/cicloDia";
import { estadoAlineacion, partesTiempo } from "./contadorAlineacion";

describe("contador de la Gran Alineación", () => {
  it("antes de la primera cuenta hacia ella", () => {
    const e = estadoAlineacion(PRIMERA_ALINEACION_MS - 90_000);
    expect(e).toEqual({ enCurso: false, objetivo: PRIMERA_ALINEACION_MS, restanteMs: 90_000 });
  });
  it("durante el evento cuenta hasta el fin", () => {
    const e = estadoAlineacion(PRIMERA_ALINEACION_MS + 1000);
    expect(e.enCurso).toBe(true);
    expect(e.objetivo).toBe(PRIMERA_ALINEACION_MS + DURACION_EVENTO_MS);
  });
  it("después del evento cuenta hasta la siguiente (28 días)", () => {
    const e = estadoAlineacion(PRIMERA_ALINEACION_MS + DURACION_EVENTO_MS + 1);
    expect(e.enCurso).toBe(false);
    expect(e.objetivo).toBe(PRIMERA_ALINEACION_MS + CICLO_TOTAL_MS);
    expect(CICLO_TOTAL_MS).toBe(672 * 3_600_000);
  });
  it("parte el tiempo en días, horas, minutos y segundos", () => {
    expect(partesTiempo(((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000)).toEqual({ dias: 2, horas: 3, minutos: 4, segundos: 5 });
    expect(partesTiempo(-5)).toEqual({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  });
});
