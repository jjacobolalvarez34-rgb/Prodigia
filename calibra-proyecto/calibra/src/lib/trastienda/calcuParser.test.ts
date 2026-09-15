import { describe, expect, it } from "vitest";
import { parsearSecuenciaCalcu, type FichaCalcu } from "./calcuParser";

let contador = 0;
function num(valor: number): FichaCalcu {
  return { id: `n${contador++}`, tipo: "num", valor };
}
function op(valor: "+" | "-" | "×" | "÷"): FichaCalcu {
  return { id: `o${contador++}`, tipo: "op", valor };
}
function paren(valor: "(" | ")"): FichaCalcu {
  return { id: `p${contador++}`, tipo: "paren", valor };
}

describe("parsearSecuenciaCalcu", () => {
  it("arma una cadena simple sin paréntesis", () => {
    // 4 + 3 - 2
    const ast = parsearSecuenciaCalcu([num(4), op("+"), num(3), op("-"), num(2)]);
    expect(ast).toEqual(["-", ["+", 4, 3], 2]);
  });

  it("respeta la precedencia de × y ÷ sobre + y -", () => {
    // 3 + 4 × 5  =  3 + (4×5), no (3+4)×5
    const ast = parsearSecuenciaCalcu([num(3), op("+"), num(4), op("×"), num(5)]);
    expect(ast).toEqual(["+", 3, ["*", 4, 5]]);
  });

  it("agrupa con un par de paréntesis", () => {
    // 4 × (10 - 5)
    const ast = parsearSecuenciaCalcu([num(4), op("×"), paren("("), num(10), op("-"), num(5), paren(")")]);
    expect(ast).toEqual(["*", 4, ["-", 10, 5]]);
  });

  it("mapea ÷ a / para el server", () => {
    const ast = parsearSecuenciaCalcu([num(10), op("÷"), num(2)]);
    expect(ast).toEqual(["/", 10, 2]);
  });

  it("devuelve null con secuencia vacía", () => {
    expect(parsearSecuenciaCalcu([])).toBeNull();
  });

  it("devuelve null con operador sin segundo operando", () => {
    expect(parsearSecuenciaCalcu([num(4), op("+")])).toBeNull();
  });

  it("devuelve null con dos números seguidos sin operador", () => {
    expect(parsearSecuenciaCalcu([num(4), num(3)])).toBeNull();
  });

  it("devuelve null con paréntesis sin cerrar", () => {
    expect(parsearSecuenciaCalcu([paren("("), num(4), op("+"), num(3)])).toBeNull();
  });

  it("devuelve null con paréntesis vacío", () => {
    expect(parsearSecuenciaCalcu([paren("("), paren(")")])).toBeNull();
  });

  it("devuelve null si sobran fichas después de una expresión completa", () => {
    // "(4+3) 2" — el paréntesis cierra una expresión completa, "2" sobra sin operador.
    expect(parsearSecuenciaCalcu([paren("("), num(4), op("+"), num(3), paren(")"), num(2)])).toBeNull();
  });

  it("acepta un único número como expresión completa", () => {
    expect(parsearSecuenciaCalcu([num(7)])).toBe(7);
  });
});
