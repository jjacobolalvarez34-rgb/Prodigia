import { describe, it, expect } from "vitest";
import { generarProblemaNaipia } from "@/lib/practica/naipia";
import {
  acumulados,
  dividirConRegla,
  esSistemaConteo,
  filasMazo,
  mediosMazosRestantes,
  parsearCarta,
  parsearCartas,
  planCancelacion,
  valoresDe,
} from "./visualesDatos";

describe("visualesDatos: cartas", () => {
  it("parsea las 52 cartas en su formato de texto y rechaza lo demás", () => {
    const simbolos = ["♠", "♥", "♦", "♣"];
    for (const v of ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]) {
      for (const s of simbolos) expect(parsearCarta(`${v}${s}`)).not.toBeNull();
    }
    expect(parsearCarta("10♥")).toEqual({ valor: "10", palo: "corazones" });
    for (const malo of ["", "7", "♠", "1♠", "11♠", "7x", "Z♠", 7, null, undefined]) expect(parsearCarta(malo)).toBeNull();
    expect(parsearCartas(["7♠", "K♥"])).toHaveLength(2);
    expect(parsearCartas(["7♠", "??"])).toBeNull();
    expect(parsearCartas([])).toBeNull();
    expect(parsearCartas("7♠")).toBeNull();
    expect(esSistemaConteo("hilo")).toBe(true);
    expect(esSistemaConteo("verdadero")).toBe(false);
  });
});

describe("visualesDatos: cancelación de pares", () => {
  it("cancelar no cambia el conteo: la suma de lo que sobra es el conteo (todos los sistemas, secuencias al azar)", () => {
    const sistemas = ["hilo", "ko", "hiopt2", "omega2"] as const;
    const rangos = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let semilla = 12345;
    const azar = () => (semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let n = 0; n < 400; n++) {
      const largo = 3 + Math.floor(azar() * 12);
      const cartas = Array.from({ length: largo }, () => `${rangos[Math.floor(azar() * 13)]}♠`);
      for (const s of sistemas) {
        const valores = valoresDe(s, parsearCartas(cartas)!);
        const plan = planCancelacion(valores);
        for (const [a, b] of plan.pares) expect(valores[a] + valores[b]).toBe(0);
        const usados = [...plan.neutras, ...plan.pares.flat(), ...plan.sobran];
        expect(new Set(usados).size).toBe(valores.length); // ninguna carta en dos pares, ninguna perdida
        expect(usados).toHaveLength(valores.length);
        expect(plan.neutras.every((i) => valores[i] === 0)).toBe(true);
        expect(plan.sobran.reduce((a, i) => a + valores[i], 0)).toBe(valores.reduce((a, v) => a + v, 0));
      }
    }
  });

  it("el ejemplo de la técnica de pares: 3 pares, 2 neutras, nada sobra (Hi-Lo)", () => {
    const valores = valoresDe("hilo", parsearCartas("K♠ 3♥ 9♦ 5♣ A♠ 2♦ 7♥ Q♣".split(" "))!);
    const plan = planCancelacion(valores);
    expect(plan.neutras).toEqual([2, 6]);
    expect(plan.pares).toEqual([[0, 1], [3, 4], [5, 7]]);
    expect(plan.sobran).toEqual([]);
    expect(acumulados(valores).at(-1)).toBe(0);
  });
});

describe("visualesDatos: mazo completo", () => {
  it("las filas suman 52 cartas y el total es 0 (balanceados) o +4 (KO)", () => {
    for (const [s, esperado] of [["hilo", 0], ["ko", 4], ["hiopt2", 0], ["omega2", 0]] as const) {
      const { filas, total } = filasMazo(s);
      expect(filas.reduce((a, f) => a + f.cartas, 0)).toBe(52);
      expect(total).toBe(esperado);
    }
  });
});

describe("visualesDatos: conteo verdadero coincide con el generador de Naipia", () => {
  const regla = (t: string) =>
    t.includes("redondeando al entero más cercano") ? "cercano" : t.includes("truncando hacia cero") ? "truncar" : "abajo";
  const num = (s: string) => Number(s.replace(",", ".").replace("+", ""));

  it("dividirConRegla y mediosMazosRestantes reproducen la respuesta de 900 problemas reales", () => {
    let directos = 0;
    let dosPasos = 0;
    let mazos = 0;
    for (let i = 0; i < 300; i++) {
      for (const nivel of [9, 10]) {
        const p = generarProblemaNaipia("verdadero", nivel);
        const e = p.enunciado;
        if (p.tipo === "verdadero") {
          const m = /el conteo corriente es ([+-]?\d+) y quedan ([\d,]+) mazos/.exec(e)!;
          expect(dividirConRegla(num(m[1]), num(m[2]), regla(e))).toBe(p.respuesta);
          directos++;
        } else if (p.tipo === "verdadero2") {
          const m = /conjunto de (\d+) mazos de 52 cartas: el conteo corriente es ([+-]?\d+) y ya salieron (\d+) cartas/.exec(e)!;
          const restantes = mediosMazosRestantes(num(m[1]), num(m[3])) / 2;
          expect(dividirConRegla(num(m[2]), restantes, regla(e))).toBe(p.respuesta);
          dosPasos++;
        } else if (p.tipo === "mazos") {
          const m = /conjunto de (\d+) mazos de 52 cartas y ya salieron (\d+) cartas/.exec(e)!;
          expect(mediosMazosRestantes(num(m[1]), num(m[2])) / 2).toBe(p.respuesta);
          mazos++;
        }
      }
    }
    expect(directos).toBeGreaterThan(50);
    expect(dosPasos).toBeGreaterThan(20);
    expect(mazos).toBeGreaterThan(50);
  });

  it("los ejemplos de la lección: 112 cartas quedan = 2 mazos; -7 entre 3 mazos según la regla", () => {
    expect(mediosMazosRestantes(4, 96) / 2).toBe(2);
    expect(dividirConRegla(10, 2, "cercano")).toBe(5);
    expect(dividirConRegla(-7, 3, "cercano")).toBe(-2);
    expect(dividirConRegla(-7, 3, "truncar")).toBe(-2);
    expect(dividirConRegla(-7, 3, "abajo")).toBe(-3);
    expect(dividirConRegla(11, 2.5, "cercano")).toBe(4);
    expect(dividirConRegla(11, 2.5, "truncar")).toBe(4);
    expect(Object.is(dividirConRegla(-1, 4, "truncar"), 0)).toBe(true); // sin -0
  });
});
