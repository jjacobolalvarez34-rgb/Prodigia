import { describe, it, expect } from "vitest";
import { generarRetoDelDia, generarRetoSemanal, TOTAL_PREGUNTAS_RETO_DIARIO, TOTAL_PREGUNTAS_RETO_SEMANAL, type MundoRetoDiario } from "./retoDiario";

const TODOS_LOS_MUNDOS: MundoRetoDiario[] = ["numeria", "geografia", "enigmia", "quimia", "anatomia", "melodia"];

describe("generarRetoDelDia", () => {
  it(`da ${TOTAL_PREGUNTAS_RETO_DIARIO} preguntas, cada una con 4 opciones únicas y la respuesta incluida`, () => {
    const preguntas = generarRetoDelDia("2026-08-25", TODOS_LOS_MUNDOS);
    expect(preguntas.length).toBe(TOTAL_PREGUNTAS_RETO_DIARIO);
    for (const p of preguntas) {
      expect(p.opciones.length, `${p.mundo}: ${p.enunciado}`).toBeGreaterThanOrEqual(2);
      expect(new Set(p.opciones).size, `${p.mundo}: opciones duplicadas`).toBe(p.opciones.length);
      expect(p.opciones, `${p.mundo}: falta "${p.respuesta}" entre las opciones`).toContain(p.respuesta);
    }
  });

  it("misma fecha + mismas ciudades desbloqueadas → exactamente las mismas preguntas (semilla compartida)", () => {
    const a = generarRetoDelDia("2026-08-25", TODOS_LOS_MUNDOS);
    const b = generarRetoDelDia("2026-08-25", TODOS_LOS_MUNDOS);
    expect(a).toEqual(b);
  });

  it("una fecha distinta da un reto distinto", () => {
    const a = generarRetoDelDia("2026-08-25", TODOS_LOS_MUNDOS);
    const b = generarRetoDelDia("2026-08-26", TODOS_LOS_MUNDOS);
    expect(a).not.toEqual(b);
  });

  it("solo elige entre las ciudades desbloqueadas — nunca una que el usuario no tiene", () => {
    const soloDos: MundoRetoDiario[] = ["numeria", "melodia"];
    const preguntas = generarRetoDelDia("2026-08-25", soloDos);
    for (const p of preguntas) {
      expect(soloDos, `apareció ${p.mundo}, que no estaba desbloqueada`).toContain(p.mundo);
    }
  });

  it("recorre las 6 ciudades por separado (aisladas, no solo mezcladas) sin generar nada roto", () => {
    for (const mundo of TODOS_LOS_MUNDOS) {
      const preguntas = generarRetoDelDia(`2026-0${(TODOS_LOS_MUNDOS.indexOf(mundo) % 9) + 1}-01`, [mundo]);
      expect(preguntas.length).toBe(TOTAL_PREGUNTAS_RETO_DIARIO);
      for (const p of preguntas) {
        expect(p.mundo).toBe(mundo);
        expect(p.opciones).toContain(p.respuesta);
      }
    }
  });

  it("si no hay ninguna ciudad desbloqueada, cae a Numeria (nunca una lista vacía de preguntas)", () => {
    const preguntas = generarRetoDelDia("2026-08-25", []);
    expect(preguntas.length).toBe(TOTAL_PREGUNTAS_RETO_DIARIO);
    expect(preguntas.every((p) => p.mundo === "numeria")).toBe(true);
  });
});

describe("generarRetoSemanal", () => {
  it(`da ${TOTAL_PREGUNTAS_RETO_SEMANAL} preguntas`, () => {
    const preguntas = generarRetoSemanal("2026-08-24", TODOS_LOS_MUNDOS);
    expect(preguntas.length).toBe(TOTAL_PREGUNTAS_RETO_SEMANAL);
    for (const p of preguntas) {
      expect(p.opciones, `${p.mundo}: falta "${p.respuesta}" entre las opciones`).toContain(p.respuesta);
    }
  });

  it("misma semana + mismas ciudades → mismas preguntas; otra semana difiere", () => {
    const a = generarRetoSemanal("2026-08-24", TODOS_LOS_MUNDOS);
    const b = generarRetoSemanal("2026-08-24", TODOS_LOS_MUNDOS);
    const c = generarRetoSemanal("2026-08-31", TODOS_LOS_MUNDOS);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("no repite, pregunta por pregunta, el reto diario del mismo lunes", () => {
    const diario = generarRetoDelDia("2026-08-24", TODOS_LOS_MUNDOS);
    const semanal = generarRetoSemanal("2026-08-24", TODOS_LOS_MUNDOS);
    expect(semanal.slice(0, diario.length)).not.toEqual(diario);
  });

  it("con solo 2 ciudades en el pool, en 45 preguntas tienen que aparecer las dos", () => {
    const soloDos: MundoRetoDiario[] = ["numeria", "melodia"];
    const preguntas = generarRetoSemanal("2026-08-24", soloDos);
    const mundosVistos = new Set(preguntas.map((p) => p.mundo));
    expect(mundosVistos.size).toBe(2);
  });
});
