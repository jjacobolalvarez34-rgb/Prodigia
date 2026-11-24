import { describe, expect, it } from "vitest";
import type { Carta, ValorCarta } from "@/lib/practica/naipia";
import {
  conteoHiLo,
  decisionModelo,
  generarMano,
  jugarCrupier,
  jugarModelo,
  porCien,
  resultado,
  rngConSemilla,
  valorEsperadoModelo,
  valoresEstado,
  valorMano,
} from "./blackjack";

const c = (valor: ValorCarta): Carta => ({ valor, palo: "picas" });
const mano = (...vs: ValorCarta[]) => vs.map(c);
const AS = 1;

describe("valor de la mano", () => {
  it("A + A = suave 12", () => expect(valorMano(mano("A", "A"))).toEqual({ total: 12, suave: true, pasado: false }));
  it("suave 20 + 5 = duro 15", () => expect(valorMano(mano("A", "9", "5"))).toEqual({ total: 15, suave: false, pasado: false }));
  it("duro 16 + 10 = pasado", () => expect(valorMano(mano("10", "6", "K")).pasado).toBe(true));
  it("duro 10 + A = suave 21", () => expect(valorMano(mano("6", "4", "A"))).toEqual({ total: 21, suave: true, pasado: false }));
});

describe("π*", () => {
  const accion = (total: number, suave: boolean, visible: number) => valoresEstado(total, suave, visible).accion;
  it("duro 16 contra 7 pide", () => expect(accion(16, false, 7)).toBe("pedir"));
  it("duro 16 contra 6 se planta", () => expect(accion(16, false, 6)).toBe("plantarse"));
  it("duro 12 contra 4 se planta", () => expect(accion(12, false, 4)).toBe("plantarse"));
  it("duro 12 contra 3 pide", () => expect(accion(12, false, 3)).toBe("pedir"));
  it("suave 18 contra As pide", () => expect(accion(18, true, AS)).toBe("pedir"));
  it("suave 18 contra 8 se planta", () => expect(accion(18, true, 8)).toBe("plantarse"));
  it("suave 17 contra cualquier carta pide", () => {
    for (let u = 1; u <= 10; u++) expect(accion(17, true, u)).toBe("pedir");
  });
  it("duro 4 a 11 siempre pide", () => {
    for (let t = 4; t <= 11; t++) for (let u = 1; u <= 10; u++) expect(accion(t, false, u)).toBe("pedir");
  });
  it("21 se planta solo", () => {
    expect(accion(21, false, 10)).toBe("plantarse");
    expect(accion(21, true, 10)).toBe("plantarse");
  });
  it("duro 16 contra 7: plantarse pierde 48 y pedir 41 por cada 100 manos", () => {
    const v = valoresEstado(16, false, 7);
    expect(porCien(v.qPlantarse)).toBe(-48);
    expect(porCien(v.qPedir)).toBe(-41);
  });
  it("en promedio el modelo pierde unas 4.7 fichas por cada 100 manos", () => {
    expect(valorEsperadoModelo() * 100).toBeCloseTo(-4.7, 0);
  });
  it("decisionModelo lee las cartas", () => expect(decisionModelo(mano("10", "6"), c("7")).accion).toBe("pedir"));
});

describe("crupier S17", () => {
  it("A + 6 se planta (suave 17)", () => expect(jugarCrupier(mano("A", "6", "5", "5"))).toHaveLength(2));
  it("10 + 6 pide", () => expect(jugarCrupier(mano("10", "6", "2", "5"))).toHaveLength(3));
});

describe("resultado", () => {
  it("si el jugador se pasa pierde aunque el crupier también se pase", () => expect(resultado(mano("10", "6", "K"), mano("10", "6", "Q"))).toBe(-1));
  it("empate", () => expect(resultado(mano("10", "8"), mano("9", "9"))).toBe(0));
  it("el crupier se pasa", () => expect(resultado(mano("10", "2"), mano("10", "6", "9"))).toBe(1));
});

describe("números aleatorios comunes", () => {
  it("el jugador y el modelo reciben las mismas cartas", () => {
    const m = generarMano(rngConSemilla(7));
    const modelo = jugarModelo(m);
    expect(modelo.cartas).toEqual(m.jugador.slice(0, modelo.cartas.length));
    expect(generarMano(rngConSemilla(7))).toEqual(m);
  });
});

describe("Hi-Lo", () => {
  it("2,3,4,5,6 suman +5", () => expect(conteoHiLo(mano("2", "3", "4", "5", "6"))).toBe(5));
  it("10,J,Q,K,A suman −5", () => expect(conteoHiLo(mano("10", "J", "Q", "K", "A"))).toBe(-5));
});
