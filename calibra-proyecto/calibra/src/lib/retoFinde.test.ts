import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  chispasRetoFinde,
  ciudadesRetoFinde,
  cometasPorPuesto,
  generarRetoFinde,
  msHastaCambioFinde,
  proximoSabado,
  sabadoAnterior,
  sabadoDelFinde,
  TOTAL_PREGUNTAS_RETO_FINDE,
} from "./retoFinde";

const sql = readFileSync(path.join(__dirname, "..", "..", "supabase", "migrations", "0281_reto_fin_de_semana.sql"), "utf8");

describe("reto de fin de semana", () => {
  it("las fechas siguen a la base (UTC): sábado del finde, el próximo y el anterior", () => {
    // 2026-10-17 es sábado.
    expect(sabadoDelFinde(new Date("2026-10-17T10:00:00Z"))).toBe("2026-10-17");
    expect(sabadoDelFinde(new Date("2026-10-18T23:59:00Z"))).toBe("2026-10-17");
    expect(sabadoDelFinde(new Date("2026-10-19T00:01:00Z"))).toBeNull();
    expect(proximoSabado(new Date("2026-10-13T12:00:00Z"))).toBe("2026-10-17");
    expect(proximoSabado(new Date("2026-10-18T12:00:00Z"))).toBe("2026-10-17");
    expect(sabadoAnterior(new Date("2026-10-19T12:00:00Z"))).toBe("2026-10-17");
    expect(sabadoAnterior(new Date("2026-10-17T12:00:00Z"))).toBe("2026-10-10");
    expect(msHastaCambioFinde(new Date("2026-10-18T23:00:00Z"))).toBe(3_600_000);
    expect(msHastaCambioFinde(new Date("2026-10-16T23:00:00Z"))).toBe(3_600_000);
  });

  it("3 ciudades distintas y 10 preguntas iguales para todos", () => {
    const ciudades = ciudadesRetoFinde("2026-10-17");
    expect(new Set(ciudades).size).toBe(3);
    const a = generarRetoFinde("2026-10-17");
    expect(a).toHaveLength(TOTAL_PREGUNTAS_RETO_FINDE);
    expect(a).toEqual(generarRetoFinde("2026-10-17"));
    for (const p of a) {
      expect(ciudades).toContain(p.mundo);
      expect(p.opciones).toContain(p.respuesta);
    }
    expect(generarRetoFinde("2026-10-24")).not.toEqual(a);
  });

  it("los premios son los mismos que en 0281", () => {
    expect(chispasRetoFinde(0)).toBe(30);
    expect(chispasRetoFinde(10)).toBe(60);
    expect(sql).toContain("v_chispas := 30 + 3 * v_correctos;");
    expect(sql).toContain("case when v_rank.puesto <= 1 then 50 when v_rank.puesto <= 3 then 30 when v_rank.puesto <= 10 then 15 when v_rank.puesto <= 50 then 5 else 0 end");
    expect(sql).toContain("if v_rank.correctos < 5 then");
    expect([1, 2, 3, 4, 10, 11, 50, 51].map(cometasPorPuesto)).toEqual([50, 30, 30, 15, 15, 5, 5, 0]);
  });
});
