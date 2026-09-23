import { describe, it, expect, vi, afterEach } from "vitest";
import type { LogicPuzzle } from "@/types/database";
import { elegirDelBanco } from "./seleccionDificultad";

function puzzle(id: string, dificultad: number): LogicPuzzle {
  return { id, tipo: "deduccion", dificultad, contenido: { enunciado: `p${id}`, opciones: ["a", "b"] }, respuesta: "a" };
}

// Banco con un puzzle por cada dificultad 1-10 — suficiente para probar
// la ventana ±1 sin ambigüedad (a lo sumo 3 candidatos por nivel).
const BANCO = Array.from({ length: 10 }, (_, i) => puzzle(`d${i + 1}`, i + 1));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("elegirDelBanco", () => {
  it("banco vacío: nunca devuelve un puzzle", () => {
    expect(elegirDelBanco([], 5, new Set())).toBeNull();
  });

  it("elige solo dentro de la ventana [nivel-1, nivel+1] cuando hay opciones ahí", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    // nivel=5 → ventana [4,6] → candidatos d4,d5,d6, el mock de random
    // agarra el último de esa ventana.
    const elegido = elegirDelBanco(BANCO, 5, new Set());
    expect(elegido).not.toBeNull();
    expect(elegido!.dificultad).toBeGreaterThanOrEqual(4);
    expect(elegido!.dificultad).toBeLessThanOrEqual(6);
  });

  it("recorta la ventana en los bordes (nivel 1 no baja de 1, nivel 10 no sube de 10)", () => {
    for (let i = 0; i < 40; i++) {
      const bajo = elegirDelBanco(BANCO, 1, new Set())!;
      expect(bajo.dificultad).toBeGreaterThanOrEqual(1);
      expect(bajo.dificultad).toBeLessThanOrEqual(2);
      const alto = elegirDelBanco(BANCO, 10, new Set())!;
      expect(alto.dificultad).toBeGreaterThanOrEqual(9);
      expect(alto.dificultad).toBeLessThanOrEqual(10);
    }
  });

  it("nunca repite un id ya usado mientras queden puzzles nuevos disponibles", () => {
    const usados = new Set(["d4", "d5", "d6"]);
    for (let i = 0; i < 30; i++) {
      const elegido = elegirDelBanco(BANCO, 5, usados)!;
      expect(usados.has(elegido.id)).toBe(false);
    }
  });

  it("si la ventana está completamente usada, cae a cualquier puzzle sin usar del banco entero", () => {
    // Ventana de nivel=5 es [4,6] — la marco toda como usada.
    const usados = new Set(["d4", "d5", "d6"]);
    const elegido = elegirDelBanco(BANCO, 5, usados)!;
    expect(elegido).not.toBeNull();
    expect(usados.has(elegido.id)).toBe(false);
  });

  it("si TODO el banco ya se usó, vuelve a repetir en vez de devolver null (última red de seguridad)", () => {
    const usados = new Set(BANCO.map((p) => p.id));
    const elegido = elegirDelBanco(BANCO, 5, usados);
    expect(elegido).not.toBeNull();
    expect(BANCO.some((p) => p.id === elegido!.id)).toBe(true);
  });

  it("con un banco de un solo puzzle, siempre lo devuelve a él (esté o no en la ventana)", () => {
    const solo = [puzzle("unico", 1)];
    const elegido = elegirDelBanco(solo, 9, new Set());
    expect(elegido!.id).toBe("unico");
  });
});
