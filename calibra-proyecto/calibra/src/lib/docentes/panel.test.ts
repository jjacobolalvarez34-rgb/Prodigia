import { describe, expect, it } from "vitest";
import {
  agruparTareas,
  alertasDelCurso,
  csvDelCurso,
  estadoTareaAlumno,
  finDelDiaBogota,
  ordenarMisTareas,
  plazoDe,
  resumenCurso,
  type FilaPanelAlumno,
  type FilaProgresoTarea,
  type MiTarea,
} from "./panel";

const AHORA = new Date("2026-11-23T15:00:00Z").getTime();
const haceDias = (n: number) => new Date(AHORA - n * 24 * 60 * 60 * 1000).toISOString();

function alumno(p: Partial<FilaPanelAlumno> & { user_id: string }): FilaPanelAlumno {
  return {
    display_name: p.user_id,
    avatar_url: null,
    unido_at: haceDias(30),
    ejercicios_7d: 0,
    correctos_7d: 0,
    ejercicios_total: 0,
    correctos_total: 0,
    ultima_actividad: null,
    mundo_top_7d: null,
    pro_colegio: false,
    ...p,
  };
}

describe("alertas del curso", () => {
  it("avisa de quien nunca jugó, quien lleva 7+ días y quien acierta poco", () => {
    const filas = [
      alumno({ user_id: "ana", ultima_actividad: haceDias(1), ejercicios_7d: 40, correctos_7d: 36 }),
      alumno({ user_id: "beto" }),
      alumno({ user_id: "caro", ultima_actividad: haceDias(9) }),
      alumno({ user_id: "dani", ultima_actividad: haceDias(2), ejercicios_7d: 20, correctos_7d: 8 }),
    ];
    const a = alertasDelCurso(filas, AHORA, "Sin nombre");
    expect(a.map((x) => [x.user_id, x.motivo])).toEqual([
      ["beto", "nunca"],
      ["caro", "inactivo"],
      ["dani", "precision"],
    ]);
    expect(a[1].dias).toBe(9);
  });

  it("no avisa de precisión baja con pocos ejercicios", () => {
    const filas = [alumno({ user_id: "eva", ultima_actividad: haceDias(0), ejercicios_7d: 5, correctos_7d: 1 })];
    expect(alertasDelCurso(filas, AHORA, "x")).toEqual([]);
  });
});

describe("resumen del curso", () => {
  it("suma la semana y cuenta activos", () => {
    const r = resumenCurso([
      alumno({ user_id: "a", ejercicios_7d: 30, correctos_7d: 24 }),
      alumno({ user_id: "b", ejercicios_7d: 10, correctos_7d: 6 }),
      alumno({ user_id: "c" }),
    ]);
    expect(r).toEqual({ alumnos: 3, activos7d: 2, ejercicios7d: 40, precision7d: 0.75 });
  });

  it("sin ejercicios la precisión es null", () => {
    expect(resumenCurso([]).precision7d).toBeNull();
  });
});

describe("tareas", () => {
  const base = { mundo: "numeria", titulo: "Fracciones", instrucciones: null, meta_ejercicios: 20, inicia_at: haceDias(3) };
  const filas: FilaProgresoTarea[] = [
    { ...base, tarea_id: "t1", vence_at: haceDias(-2), user_id: "a", hechos: 25, correctos: 20 },
    { ...base, tarea_id: "t1", vence_at: haceDias(-2), user_id: "b", hechos: 4, correctos: 4 },
    { ...base, tarea_id: "t1", vence_at: haceDias(-2), user_id: "c", hechos: 0, correctos: 0 },
    { ...base, tarea_id: "t0", vence_at: haceDias(1), user_id: "a", hechos: 0, correctos: 0 },
    { ...base, tarea_id: "t2", vence_at: haceDias(-5), user_id: "a", hechos: 1, correctos: 1 },
  ];

  it("estado por estudiante", () => {
    expect(estadoTareaAlumno(0, 20)).toBe("pendiente");
    expect(estadoTareaAlumno(3, 20)).toBe("en_curso");
    expect(estadoTareaAlumno(20, 20)).toBe("cumplida");
  });

  it("agrupa por tarea, cuenta estados y ordena vigentes antes que vencidas", () => {
    const g = agruparTareas(filas, AHORA);
    expect(g.map((t) => t.tarea_id)).toEqual(["t1", "t2", "t0"]);
    expect(g[0]).toMatchObject({ cumplidas: 1, enCurso: 1, pendientes: 1, vencida: false });
    expect(g[2].vencida).toBe(true);
  });

  it("la fecha límite es el final del día en Colombia", () => {
    expect(new Date(finDelDiaBogota("2026-11-30")).toISOString()).toBe("2026-12-01T04:59:59.000Z");
  });

  it("el plazo se cuenta en días de Colombia", () => {
    expect(plazoDe(haceDias(1), AHORA)).toEqual({ tipo: "vencida" });
    expect(plazoDe(finDelDiaBogota("2026-11-23"), AHORA)).toEqual({ tipo: "hoy" });
    expect(plazoDe(finDelDiaBogota("2026-11-24"), AHORA)).toEqual({ tipo: "manana" });
    expect(plazoDe(finDelDiaBogota("2026-11-27"), AHORA)).toEqual({ tipo: "dias", n: 4 });
  });

  it("las tareas del estudiante: pendientes vigentes primero", () => {
    const t = (id: string, vence: string, hechos: number): MiTarea => ({
      tarea_id: id, grupo: "10A", mundo: "numeria", titulo: id, instrucciones: null,
      meta_ejercicios: 10, inicia_at: haceDias(5), vence_at: vence, hechos, correctos: hechos,
    });
    const orden = ordenarMisTareas(
      [t("vencida", haceDias(1), 0), t("hecha", haceDias(-1), 10), t("lejana", haceDias(-6), 0), t("pronto", haceDias(-1), 2)],
      AHORA,
    ).map((x) => x.tarea_id);
    expect(orden).toEqual(["pronto", "lejana", "hecha", "vencida"]);
  });
});

describe("csv del curso", () => {
  it("usa ; y BOM, escapa comillas y agrega una columna por tarea", () => {
    const filas = [alumno({ user_id: "a", display_name: 'Ana "la ágil"', ejercicios_7d: 10, correctos_7d: 9, ultima_actividad: "2026-11-22T10:00:00Z", mundo_top_7d: "quimia" })];
    const tareas = agruparTareas(
      [{ tarea_id: "t", mundo: "quimia", titulo: "Tabla", instrucciones: null, meta_ejercicios: 15, inicia_at: haceDias(2), vence_at: haceDias(-2), user_id: "a", hechos: 7, correctos: 6 }],
      AHORA,
    );
    const csv = csvDelCurso(
      filas,
      tareas,
      { alumno: "Estudiante", ejercicios7d: "Ej. 7 días", precision7d: "Precisión 7 días", ejerciciosTotal: "Ej. total", precisionTotal: "Precisión total", ultima: "Última vez", ciudad: "Ciudad" },
      (s) => (s === "quimia" ? "Quimia" : s),
      "Sin nombre",
    );
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const [cab, fila] = csv.slice(1).split("\r\n");
    expect(cab.split(";").at(-1)).toBe("Tabla (15)");
    expect(fila).toBe('"Ana ""la ágil""";10;90 %;0;—;2026-11-22;Quimia;7');
  });
});
