import { describe, expect, it } from "vitest";
import { CONFIG_MUNDOS_NUEVOS, leerNumero, respuestaComoTexto } from "./config";
import { dibujoCelula } from "@/lib/vitalia/diagramas";
import type { Organelo } from "@/lib/vitalia/tipos";

function numerosDe(o: unknown): number[] {
  if (typeof o === "number") return [o];
  if (Array.isArray(o)) return o.flatMap(numerosDe);
  if (o && typeof o === "object") return Object.values(o).flatMap(numerosDe);
  return [];
}

describe("mundos 14 y 15", () => {
  for (const cfg of Object.values(CONFIG_MUNDOS_NUEVOS)) {
    it(`${cfg.slug}: cada modo genera preguntas y sus dibujos no tienen números rotos`, { timeout: 30_000 }, () => {
      for (const modo of cfg.modos)
        for (let nivel = 1; nivel <= 10; nivel++)
          for (let i = 0; i < 60; i++) {
            const p = cfg.generar(modo, nivel);
            expect(p.modo).toBe(modo);
            expect(cfg.clave(p).length).toBeGreaterThan(0);
            if (p.diagrama) {
              const d = cfg.dibujo(p.diagrama);
              expect(d.prims.length, p.enunciado).toBeGreaterThan(0);
              for (const n of numerosDe(d.prims)) expect(Number.isFinite(n), p.enunciado).toBe(true);
              for (const x of d.prims) if (x.t === "camino") expect(x.d, p.enunciado).not.toMatch(/NaN|undefined/);
            }
          }
    });
  }

  it("la flecha de la célula apunta a cada parte que existe", () => {
    const partes: Organelo[] = ["nucleo", "mitocondria", "ribosoma", "reticulo", "golgi", "vacuola", "membrana"];
    for (const v of ["animal", "vegetal"] as const) {
      const sin = dibujoCelula(v).prims.length;
      for (const o of partes) expect(dibujoCelula(v, o).prims.length, `${v} ${o}`).toBe(sin + 2);
    }
    expect(dibujoCelula("vegetal", "cloroplasto").prims.length).toBeGreaterThan(dibujoCelula("vegetal").prims.length);
  });

  it("lee números con coma o punto y muestra la respuesta con coma", () => {
    expect(leerNumero("12,5")).toBe(12.5);
    expect(leerNumero(" -3.2 ")).toBe(-3.2);
    expect(respuestaComoTexto({ modo: "x", enunciado: "", entrada: "numero", respuesta: 4.9 })).toBe("4,9");
  });
});
