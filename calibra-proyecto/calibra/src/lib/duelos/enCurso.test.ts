import { describe, expect, it } from "vitest";
import { elegirDueloEnCurso } from "./enCurso";

describe("reconexión a un duelo en curso", () => {
  it("elige el duelo pendiente donde todavía no mandaste tu resultado", () => {
    const duelos = [
      { id: "ya-jugado", mundo: "numeria", serie_id: null },
      { id: "a-medias", mundo: "quimia", serie_id: "s1" },
    ];
    expect(elegirDueloEnCurso(duelos, new Set(["ya-jugado"]))).toEqual({ id: "a-medias", mundo: "quimia", serieId: "s1", operacion: null, subTipo: null });
  });

  it("sin duelos a medias no hay nada que retomar", () => {
    expect(elegirDueloEnCurso([{ id: "x", mundo: "numeria", serie_id: null }], new Set(["x"]))).toBeNull();
    expect(elegirDueloEnCurso([], new Set())).toBeNull();
  });

  it("un reto recibido sin aceptar no es una partida en curso", () => {
    const reto = { id: "reto", mundo: "numeria", serie_id: null, retado_id: "yo", emparejado: false, ronda_numero: null };
    const sinArrancar = { userId: "yo", arrancados: new Set<string>() };
    expect(elegirDueloEnCurso([reto], new Set(), sinArrancar)).toBeNull();
    // Ya lo aceptó y arrancó en este dispositivo: sí se puede retomar.
    expect(elegirDueloEnCurso([reto], new Set(), { userId: "yo", arrancados: new Set(["reto"]) })?.id).toBe("reto");
    // Quien retó, los del emparejamiento y las rondas 2-3 de una serie sí cuentan.
    expect(elegirDueloEnCurso([{ ...reto, retado_id: "otro" }], new Set(), sinArrancar)?.id).toBe("reto");
    expect(elegirDueloEnCurso([{ ...reto, emparejado: true }], new Set(), sinArrancar)?.id).toBe("reto");
    expect(elegirDueloEnCurso([{ ...reto, ronda_numero: 2 }], new Set(), sinArrancar)?.id).toBe("reto");
  });
});
