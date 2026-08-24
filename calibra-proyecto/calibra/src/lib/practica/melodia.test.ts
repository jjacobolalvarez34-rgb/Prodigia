import { describe, it, expect } from "vitest";
import {
  generarPreguntaMelodia, MODOS_MELODIA, construirEscala, construirAcorde,
  semitonoAbsoluto, LETRAS, type TipoEscala, type TipoAcorde, type NotaMusical,
} from "./melodia";

function fundamentalAlAzar(): NotaMusical {
  const letra = LETRAS[Math.floor(Math.random() * LETRAS.length)];
  const octava = 3 + Math.floor(Math.random() * 2);
  return { letra, octava, alteracion: null };
}

describe("generarPreguntaMelodia — contrato para todos los modos", () => {
  for (const modo of MODOS_MELODIA) {
    it(`modo ${modo}: en las 10 dificultades, 4 opciones únicas y la respuesta incluida`, () => {
      for (let nivel = 1; nivel <= 10; nivel++) {
        for (let i = 0; i < 30; i++) {
          const p = generarPreguntaMelodia(modo, nivel);
          expect(p.opciones.length, `${modo} nivel ${nivel}: ${JSON.stringify(p.opciones)}`).toBe(4);
          expect(new Set(p.opciones).size, `${modo} nivel ${nivel}: opciones duplicadas ${JSON.stringify(p.opciones)}`).toBe(4);
          expect(p.opciones, `${modo} nivel ${nivel}: falta la respuesta "${p.respuesta}"`).toContain(p.respuesta);
        }
      }
    });
  }
});

describe("construirEscala — la fórmula de intervalos suma una octava completa", () => {
  it("las 4 escalas, sobre 20 fundamentales al azar cada una, cierran en +12 semitonos", () => {
    const tipos: TipoEscala[] = ["mayor", "menor_natural", "pentatonica_mayor", "pentatonica_menor"];
    for (const tipo of tipos) {
      for (let i = 0; i < 20; i++) {
        const fundamental = fundamentalAlAzar();
        const notas = construirEscala(fundamental, tipo, i % 2 === 0);
        const inicio = semitonoAbsoluto(notas[0]);
        const fin = semitonoAbsoluto(notas[notas.length - 1]);
        expect(fin - inicio, `${tipo} desde ${fundamental.letra}${fundamental.octava}`).toBe(12);
      }
    }
  });
});

describe("construirAcorde — cada nota cae exactamente en el semitono de su fórmula", () => {
  it("los 14 tipos de acorde, sobre 10 fundamentales al azar cada uno, respetan la fórmula al semitono", () => {
    const formulas: Record<TipoAcorde, number[]> = {
      mayor: [0, 4, 7], menor: [0, 3, 7], disminuido: [0, 3, 6], aumentado: [0, 4, 8],
      maj7: [0, 4, 7, 11], dominante7: [0, 4, 7, 10], menor7: [0, 3, 7, 10], disminuido7: [0, 3, 6, 9],
      sus2: [0, 2, 7], sus4: [0, 5, 7], add9: [0, 4, 7, 14],
      novena: [0, 4, 7, 10, 14], oncena: [0, 4, 7, 10, 14, 17], trecena: [0, 4, 7, 10, 14, 17, 21],
    };
    for (const tipo of Object.keys(formulas) as TipoAcorde[]) {
      for (let i = 0; i < 10; i++) {
        const fundamental = fundamentalAlAzar();
        const notas = construirAcorde(fundamental, tipo, i % 2 === 0);
        const base = semitonoAbsoluto(fundamental);
        const offsets = notas.map((n) => semitonoAbsoluto(n) - base);
        expect(offsets, tipo).toEqual(formulas[tipo]);
      }
    }
  });
});
