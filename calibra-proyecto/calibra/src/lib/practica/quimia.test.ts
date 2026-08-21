import { describe, it, expect } from "vitest";
import { generarPreguntaQuimia, type ModoQuimia } from "./quimia";
import { generarPreguntaOrganica, COMPUESTOS_ORGANICOS } from "./quimicaOrganica";

// Sección 5 (auditoría de variedad, tanda nocturna): 2 modos nuevos
// (nomenclatura, orgánica) + el escalón nuevo de "tabla" (número
// atómico / estado de oxidación). Mismo contrato que ya se prueba en
// Enigmia: 4 opciones únicas, la respuesta está entre ellas.
const MODOS: ModoQuimia[] = ["simbolos", "formulas", "tabla", "nomenclatura"];

describe("generarPreguntaQuimia en los modos nuevos y en tabla (todos los niveles)", () => {
  for (const modo of MODOS) {
    for (let nivel = 1; nivel <= 10; nivel++) {
      it(`modo=${modo} nivel=${nivel}: 15 preguntas válidas`, () => {
        const usados = new Set<string>();
        for (let i = 0; i < 15; i++) {
          const p = generarPreguntaQuimia(modo, nivel, usados, Math.random);
          expect(new Set(p.opciones).size).toBe(p.opciones.length);
          expect(p.opciones).toContain(p.respuesta);
          usados.add(p.clave);
        }
      });
    }
  }
});

describe("tabla periódica progresiva: escalones por nivel", () => {
  it("nivel bajo (1-3) pregunta número atómico", () => {
    const p = generarPreguntaQuimia("tabla", 2, new Set(), Math.random);
    expect(p.enunciado).toMatch(/número atómico/);
  });
  it("nivel alto (8-10) pregunta estado de oxidación", () => {
    const p = generarPreguntaQuimia("tabla", 9, new Set(), Math.random);
    expect(p.enunciado).toMatch(/estado de oxidación/);
  });
});

describe("generarPreguntaOrganica", () => {
  it("siempre 4 opciones únicas, respuesta incluida, y diagramaId apunta a un compuesto real", () => {
    const usados = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const p = generarPreguntaOrganica(5, usados, Math.random);
      expect(new Set(p.opciones).size).toBe(p.opciones.length);
      expect(p.opciones).toContain(p.respuesta);
      expect(p.diagramaId).toBeDefined();
      expect(COMPUESTOS_ORGANICOS.some((c) => c.id === p.diagramaId)).toBe(true);
      usados.add(p.clave);
    }
  });

  it("nunca repite un compuesto ya usado mientras queden otros disponibles", () => {
    const usados = new Set<string>();
    const vistos = new Set<string>();
    for (let i = 0; i < COMPUESTOS_ORGANICOS.length; i++) {
      const p = generarPreguntaOrganica(5, usados, Math.random);
      expect(vistos.has(p.clave)).toBe(false);
      vistos.add(p.clave);
      usados.add(p.clave);
    }
  });
});

describe("COMPUESTOS_ORGANICOS: datos consistentes para MoleculaSVG", () => {
  it("todo compuesto sin anillo tiene al menos 1 grupo, y enlaceDoble (si existe) es un índice válido", () => {
    for (const c of COMPUESTOS_ORGANICOS) {
      expect(c.grupos.length).toBeGreaterThan(0);
      if (c.enlaceDoble !== undefined) {
        expect(c.enlaceDoble).toBeGreaterThanOrEqual(0);
        expect(c.enlaceDoble).toBeLessThan(c.grupos.length - 1);
      }
    }
  });
});
