import { describe, it, expect } from "vitest";
import { generarMemoria, generarComputacional, generarPatron } from "./generadores";

// Sección 3 (auditoría de variedad, tanda nocturna): computacional pasó
// de un único generador plano a 4 formas distintas gateadas por
// dificultad (secuencial, bucle, condicional, ordenar pasos) — la
// forma "ordenar pasos" en particular arma sus opciones a partir de
// permutaciones dedupeadas por resultado, con más superficie real de
// bug que el resto. Estos tests no verifican "se ve bien" (eso es
// visual), verifican el contrato que el runner de Enigmia asume de
// cualquier LogicPuzzle: 4 opciones únicas, y la respuesta está
// literalmente entre ellas.
describe("generarComputacional en todas las dificultades", () => {
  for (let dificultad = 1; dificultad <= 10; dificultad++) {
    it(`dificultad ${dificultad}: 20 acertijos, todos con 4 opciones únicas y respuesta incluida`, () => {
      for (let i = 0; i < 20; i++) {
        const p = generarComputacional(dificultad);
        expect(p.contenido.opciones.length).toBe(4);
        expect(new Set(p.contenido.opciones).size).toBe(4);
        expect(p.contenido.opciones).toContain(p.respuesta);
      }
    });
  }
});

describe("generarMemoria escala de verdad con la dificultad", () => {
  it("dificultad 1 da secuencias cortas, dificultad 10 llega a 10 elementos", () => {
    const facil = generarMemoria(1);
    const dificil = generarMemoria(10);
    expect(facil.contenido.secuencia?.length).toBeLessThan(5);
    expect(dificil.contenido.secuencia?.length).toBe(10);
  });

  it("nunca repite palabras dentro de la misma secuencia ni entre las opciones", () => {
    for (let dificultad = 1; dificultad <= 10; dificultad += 3) {
      const p = generarMemoria(dificultad);
      const secuencia = p.contenido.secuencia ?? [];
      expect(new Set(secuencia).size).toBe(secuencia.length);
      expect(new Set(p.contenido.opciones).size).toBe(p.contenido.opciones.length);
    }
  });
});

describe("generarPatron sigue funcionando igual (sin cambios de esta tanda)", () => {
  it("siempre da 4 opciones únicas con la respuesta adentro", () => {
    for (let dificultad = 1; dificultad <= 10; dificultad++) {
      const p = generarPatron(dificultad);
      expect(p.contenido.opciones.length).toBe(4);
      expect(p.contenido.opciones).toContain(p.respuesta);
    }
  });
});
