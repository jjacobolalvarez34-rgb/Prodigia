// Modo mesa de «Gánale al modelo» (?modo=mesa): el presentador registra las cartas reales
// en orden de reparto y lo que hizo el voluntario. Estado puro y transiciones sin efectos.
import { PALOS, type Carta, type ValorCarta } from "@/lib/practica/naipia";
import { registrarDecision, valorMano, type Decision } from "./blackjack";

export type PasoMesa = "j1" | "cv" | "j2" | "decide" | "cartaJugador" | "crupier" | "fin";

export interface EstadoMesa {
  jugador: Carta[];
  crupier: Carta[];
  paso: PasoMesa;
  decisiones: Decision[];
  // Todas las cartas registradas desde el último «Barajar» (para el conteo).
  vistas: Carta[];
}

export const MESA_VACIA: EstadoMesa = { jugador: [], crupier: [], paso: "j1", decisiones: [], vistas: [] };

function trasCartaJugador(jugador: Carta[]): PasoMesa {
  const v = valorMano(jugador);
  return v.pasado || v.total >= 21 ? "crupier" : "decide";
}

export function agregarCarta(e: EstadoMesa, valor: ValorCarta): EstadoMesa {
  if (e.paso === "fin") return e;
  // El palo no importa para el modelo: se reparte en orden para que se vean distintas.
  const c: Carta = { valor, palo: PALOS[e.vistas.length % PALOS.length] };
  const vistas = [...e.vistas, c];
  switch (e.paso) {
    case "j1":
      return { ...e, jugador: [c], paso: "cv", vistas };
    case "cv":
      return { ...e, crupier: [c], paso: "j2", vistas };
    case "j2": {
      const jugador = [...e.jugador, c];
      return { ...e, jugador, paso: trasCartaJugador(jugador), vistas };
    }
    case "decide": {
      // Si el presentador olvidó marcar «pide», una carta nueva lo cuenta como pedir.
      const d = registrarDecision(e.jugador, e.crupier[0], "pedir");
      const jugador = [...e.jugador, c];
      return { ...e, jugador, decisiones: [...e.decisiones, d], paso: trasCartaJugador(jugador), vistas };
    }
    case "cartaJugador": {
      const jugador = [...e.jugador, c];
      return { ...e, jugador, paso: trasCartaJugador(jugador), vistas };
    }
    case "crupier": {
      const crupier = [...e.crupier, c];
      const fin = crupier.length >= 2 && valorMano(crupier).total >= 17;
      return { ...e, crupier, paso: fin ? "fin" : "crupier", vistas };
    }
  }
}

export function jugadorPide(e: EstadoMesa): EstadoMesa {
  if (e.paso !== "decide") return e;
  return { ...e, decisiones: [...e.decisiones, registrarDecision(e.jugador, e.crupier[0], "pedir")], paso: "cartaJugador" };
}

export function jugadorPlanta(e: EstadoMesa): EstadoMesa {
  if (e.paso !== "decide") return e;
  return { ...e, decisiones: [...e.decisiones, registrarDecision(e.jugador, e.crupier[0], "plantarse")], paso: "crupier" };
}

// Nueva mano: el conteo sigue (las cartas ya salieron del zapato).
export function nuevaMano(e: EstadoMesa): EstadoMesa {
  return { ...MESA_VACIA, vistas: e.vistas };
}

export function barajar(e: EstadoMesa): EstadoMesa {
  return { ...e, vistas: [] };
}
