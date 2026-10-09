import { describe, expect, it } from "vitest";
import { esCorrectaZen, generarZen, MEZCLA, solucionZen, temasZen } from "./preguntas";

const MUNDOS = ["numeria", "geografia", "enigmia", "quimia", "anatomia", "melodia", "trigonometria", "historia", "calculia", "circuitia", "estadistica", "naipia", "codia", "dinamia", "vitalia"];

describe("Modo Zen: preguntas de los 15 mundos", () => {
  for (const mundo of MUNDOS) {
    it(`${mundo}: cada tema y la mezcla generan preguntas válidas en los niveles 1, 5 y 10`, () => {
      const temas = temasZen(mundo);
      expect(temas.length).toBeGreaterThan(0);
      for (const tema of [...temas.map((t) => t.id), MEZCLA]) {
        for (const nivel of [1, 5, 10]) {
          const usados = new Set<string>();
          for (let k = 0; k < 4; k++) {
            const q = generarZen(mundo, tema, nivel, usados, []);
            expect(q, `${mundo}/${tema}/${nivel}`).not.toBeNull();
            usados.add(q!.tipo === "mundo" ? q!.p.clave : q!.clave);
            if (q!.tipo === "mundo") {
              const e = q!.p.entrada;
              if (e.tipo === "opciones") expect(e.opciones, `${mundo}/${tema}`).toContain(e.respuesta);
              if (e.tipo === "numero") expect(Number.isFinite(e.respuesta)).toBe(true);
            }
            // La respuesta correcta se reconoce como correcta.
            const correcta = q!.tipo === "mapa" ? q!.id : q!.p.entrada.tipo === "numero" ? String(q!.p.entrada.respuesta) : q!.p.entrada.tipo === "esqueleto" ? q!.p.entrada.objetivo : q!.p.entrada.respuesta;
            expect(esCorrectaZen(q!, correcta)).toBe(true);
            expect(solucionZen(q!).length).toBeGreaterThan(0);
          }
        }
      }
    }, 60_000);
  }
});
