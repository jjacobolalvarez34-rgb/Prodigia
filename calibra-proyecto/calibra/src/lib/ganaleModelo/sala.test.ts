import { describe, expect, it } from "vitest";
import type { Carta, ValorCarta } from "@/lib/practica/naipia";
import type { ManoComun } from "./blackjack";
import { acumular, aplicarAviso, cerrarMano, conteoMano, decisionesDe, limpiarNombre, ranking, resultadosMano, type EstadoJugadorMano } from "./sala";

const c = (valor: ValorCarta): Carta => ({ valor, palo: "picas" });
// Jugador: 10, 6, luego 3, K... Crupier: 7 visible, 10 oculta (17, se planta).
const mano: ManoComun = {
  jugador: ["10", "6", "3", "K", "2", "2", "2", "2", "2", "2", "2", "2"].map((v) => c(v as ValorCarta)),
  crupier: ["7", "10", "5", "5", "5", "5", "5", "5", "5", "5", "5", "5"].map((v) => c(v as ValorCarta)),
};
const aviso = (id: string, nCartas: number, planto: boolean) => ({ id, nombre: id, manoId: "m1", nCartas, planto });

describe("sala en vivo", () => {
  it("cuenta la primera decisión de cada uno", () => {
    let e: Record<string, EstadoJugadorMano> = {};
    e = aplicarAviso(e, aviso("ana", 3, false), mano);
    e = aplicarAviso(e, aviso("beto", 2, true), mano);
    e = aplicarAviso(e, aviso("caro", 2, false), mano);
    expect(conteoMano(e, mano)).toEqual({ jugando: 2, pidieron: 1, plantaron: 1 });
  });

  it("deduce las decisiones y las compara con π*", () => {
    const e = aplicarAviso({}, aviso("ana", 3, true), mano);
    const ds = decisionesDe(e.ana, mano);
    // Duro 16 contra 7: pidió (igual que π*). Duro 19 contra 7: se plantó (igual que π*).
    expect(ds.map((d) => d.eleccion)).toEqual(["pedir", "plantarse"]);
    expect(ds.every((d) => d.eleccion === d.valores.accion)).toBe(true);
  });

  it("ignora avisos imposibles: pedir después de pasarse o volver atrás", () => {
    let e = aplicarAviso({}, aviso("ana", 4, false), mano);
    expect(e.ana.nCartas).toBe(4);
    e = aplicarAviso(e, aviso("ana", 5, false), mano);
    expect(e.ana.nCartas).toBe(4);
    e = aplicarAviso(e, aviso("ana", 2, true), mano);
    expect(e.ana.nCartas).toBe(4);
    expect(aplicarAviso({}, aviso("x", 1, false), mano)).toEqual({});
  });

  it("al revelar, quien seguía jugando se planta, y se cuentan resultados", () => {
    let e = aplicarAviso({}, aviso("ana", 3, true), mano);
    e = aplicarAviso(e, aviso("beto", 2, false), mano);
    e = cerrarMano(e, mano);
    expect(e.beto.planto).toBe(true);
    // Crupier 17: ana 19 gana, beto 16 pierde. El modelo pide con 16 y queda en 19: gana.
    expect(resultadosMano(e, mano)).toEqual({ ganaron: 1, empataron: 0, perdieron: 1, modelo: 1 });
  });

  it("ranking por fichas y luego por parecido con π*", () => {
    let e = aplicarAviso({}, aviso("ana", 3, true), mano);
    e = aplicarAviso(e, aviso("beto", 2, true), mano);
    const m = acumular({}, e, mano);
    expect(ranking(m).map((x) => x.id)).toEqual(["ana", "beto"]);
    expect(m.ana).toMatchObject({ fichas: 1, coincidencias: 2, decisiones: 2 });
    expect(m.beto).toMatchObject({ fichas: -1, coincidencias: 0, decisiones: 1 });
  });

  it("limpia los nombres", () => {
    expect(limpiarNombre("   ")).toBe("Jugador");
    expect(limpiarNombre("Un nombre larguísimo de verdad")).toHaveLength(18);
  });
});
