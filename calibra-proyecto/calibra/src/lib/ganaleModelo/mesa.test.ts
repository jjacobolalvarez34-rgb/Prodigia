import { describe, expect, it } from "vitest";
import type { ValorCarta } from "@/lib/practica/naipia";
import { conteoHiLo } from "./blackjack";
import { MESA_VACIA, agregarCarta, barajar, jugadorPide, jugadorPlanta, nuevaMano, type EstadoMesa } from "./mesa";

const reparte = (e: EstadoMesa, ...vs: ValorCarta[]) => vs.reduce(agregarCarta, e);

describe("modo mesa", () => {
  it("reparte en orden: jugador, visible del crupier, jugador", () => {
    const e = reparte(MESA_VACIA, "10", "7", "6");
    expect(e.jugador.map((c) => c.valor)).toEqual(["10", "6"]);
    expect(e.crupier.map((c) => c.valor)).toEqual(["7"]);
    expect(e.paso).toBe("decide");
  });

  it("pedir registra la decisión y la carta siguiente va al jugador", () => {
    const e = agregarCarta(jugadorPide(reparte(MESA_VACIA, "10", "7", "6")), "3");
    expect(e.decisiones[0].eleccion).toBe("pedir");
    expect(e.decisiones[0].valores.accion).toBe("pedir");
    expect(e.jugador).toHaveLength(3);
    expect(e.paso).toBe("decide");
  });

  it("plantarse pasa al crupier, que termina al llegar a 17", () => {
    let e = jugadorPlanta(reparte(MESA_VACIA, "10", "7", "8"));
    expect(e.paso).toBe("crupier");
    e = reparte(e, "K");
    expect(e.paso).toBe("fin");
  });

  it("si el jugador se pasa, juega el crupier", () => {
    const e = agregarCarta(jugadorPide(reparte(MESA_VACIA, "10", "7", "6")), "K");
    expect(e.paso).toBe("crupier");
  });

  it("nueva mano conserva el conteo y barajar lo borra", () => {
    const e = reparte(MESA_VACIA, "2", "3", "4");
    expect(conteoHiLo(nuevaMano(e).vistas)).toBe(3);
    expect(barajar(e).vistas).toHaveLength(0);
  });
});
