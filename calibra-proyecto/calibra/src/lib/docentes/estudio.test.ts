import { describe, expect, it } from "vitest";
import { cursoDemo, estudioDemo } from "./demo";
import { distribucionPrecision, horasDelCurso, matrizConstancia, perfilAlumno, recomendaciones, temasDelCurso, tendencia, type FilaEstudio } from "./estudio";
import { NOMBRE_TEMA, nombreTema } from "./temas";

const AHORA = new Date("2026-11-23T15:00:00Z").getTime();
const { filas } = cursoDemo(AHORA);
const { estudio, habitos } = estudioDemo(AHORA);
const temas = temasDelCurso(estudio);
const perfiles = filas.map((f) => perfilAlumno(f.user_id, estudio, temas, habitos, AHORA));
const perfil = (nombre: string) => perfiles[filas.findIndex((f) => f.display_name === nombre)];

describe("estudio del curso", () => {
  it("la tendencia exige datos en las dos quincenas", () => {
    expect(tendencia(9, 10, 6, 10)).toBe(30);
    expect(tendencia(9, 10, 6, 5)).toBeNull();
  });

  it("los temas que más cuestan quedan primero", () => {
    expect(temas[0].tema).toBe("fracciones_sumar");
    expect(temas[0].conDificultad.length).toBeGreaterThan(0);
    const geo = temas.find((t) => t.tema === "geografia_america")!;
    expect(geo.precision!).toBeGreaterThan(temas[0].precision!);
  });

  it("cada estudiante recibe una etiqueta que tiene sentido", () => {
    expect(perfil("Samuel P.").etiqueta).toBe("apurado");
    expect(perfil("Mariana C.").etiqueta).toBe("lento_seguro");
    expect(perfil("Mateo L.").etiqueta).toBe("progresa");
    expect(perfil("Gabriela N.").etiqueta).toBe("en_riesgo");
    expect(perfil("Tomás B.").etiqueta).toBe("sin_actividad");
    expect(perfil("Valentina R.").fuertes.length).toBeGreaterThan(0);
    expect(perfil("Luciana V.").debiles[0].precision).toBeLessThan(0.7);
  });

  it("las recomendaciones empiezan por lo urgente y proponen una tarea", () => {
    const r = recomendaciones(temas, perfiles);
    expect(r[0].prioridad).toBe(1);
    const critico = r.find((x) => x.tipo === "tema_critico");
    expect(critico?.tema).toBe("fracciones_sumar");
    expect(critico?.tarea).toEqual({ mundo: "numeria", tema: "fracciones_sumar", meta: 20 });
    expect(r.find((x) => x.tipo === "contactar")?.alumnos).toEqual(expect.arrayContaining(["demo-10", "demo-11"]));
    expect(r.map((x) => x.tipo)).toEqual(expect.arrayContaining(["apurados", "fluidez", "reconocer"]));
    const prioridades = r.map((x) => x.prioridad);
    expect([...prioridades].sort()).toEqual(prioridades);
  });

  it("no opina con pocos datos", () => {
    const pocos: FilaEstudio[] = [{ user_id: "a", mundo: "numeria", tema: "suma", intentos: 5, correctos: 1, intentos_rec: 5, correctos_rec: 1, intentos_ant: 0, correctos_ant: 0, tiempo_mediano_ms: 3000, nivel_max: 1, nivel_rec: 1, ultimo: new Date(AHORA).toISOString() }];
    const t = temasDelCurso(pocos);
    expect(recomendaciones(t, [perfilAlumno("a", pocos, t, [], AHORA)]).filter((x) => x.tipo === "tema_critico")).toEqual([]);
  });

  it("hábitos: matriz de 28 días, horas y distribución", () => {
    const m = matrizConstancia(habitos, filas.map((f) => f.user_id), 28, AHORA);
    expect(m.fechas).toHaveLength(28);
    expect(m.fechas.at(-1)).toBe("2026-11-23");
    expect(m.filas.get("demo-0")!.filter((x) => x > 0).length).toBeGreaterThan(m.filas.get("demo-9")!.filter((x) => x > 0).length);
    expect(horasDelCurso(habitos).reduce((a, b) => a + b, 0)).toBe(habitos.reduce((a, h) => a + h.ejercicios, 0));
    expect(distribucionPrecision(perfiles).reduce((a, b) => a + b.cantidad, 0)).toBeGreaterThan(0);
  });

  it("todos los temas tienen nombre en los dos idiomas", () => {
    for (const t of temas) expect(NOMBRE_TEMA[t.tema]).toBeDefined();
    expect(nombreTema("quimia_tabla", "es")).toBe("Tabla periódica");
    expect(nombreTema("quimia_tabla", "en")).toBe("Periodic table");
    expect(nombreTema("raro_tema_nuevo", "es")).toBe("Tema nuevo");
  });
});
