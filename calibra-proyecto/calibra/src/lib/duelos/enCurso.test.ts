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
});
