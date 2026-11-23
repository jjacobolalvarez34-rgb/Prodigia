import { describe, expect, it } from "vitest";
import { cursoDemo } from "./demo";
import { agruparTareas, alertasDelCurso, resumenCurso } from "./panel";

const AHORA = new Date("2026-11-23T15:00:00Z").getTime();

describe("curso de ejemplo del panel docente", () => {
  const { filas, tareas, actividad } = cursoDemo(AHORA);

  it("es el mismo para la misma hora", () => {
    expect(cursoDemo(AHORA)).toEqual(cursoDemo(AHORA));
  });

  it("muestra alertas de los tres tipos, para que la demo enseñe qué avisa", () => {
    const motivos = new Set(alertasDelCurso(filas, AHORA, "x").map((a) => a.motivo));
    expect(motivos).toEqual(new Set(["nunca", "inactivo", "precision"]));
  });

  it("cada tarea tiene una fila por estudiante, y hay vigentes y vencidas", () => {
    const g = agruparTareas(tareas, AHORA);
    expect(g).toHaveLength(3);
    for (const t of g) expect(t.alumnos).toHaveLength(filas.length);
    expect(g.filter((t) => t.vencida)).toHaveLength(1);
  });

  it("tiene 14 días de actividad y un resumen coherente", () => {
    expect(actividad).toHaveLength(14);
    expect(actividad.at(-1)?.fecha).toBe("2026-11-23");
    const r = resumenCurso(filas);
    expect(r.alumnos).toBe(12);
    expect(r.activos7d).toBe(10);
  });
});
