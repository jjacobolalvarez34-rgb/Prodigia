// Sala en vivo de «Gánale al modelo» (2026-11-24): el proyector (?modo=sala) reparte una
// mano a todos los celulares a la vez por un canal de Supabase Realtime (solo mensajes,
// nada en la base). Todos juegan las mismas cartas; cada celular avisa cuántas cartas
// tiene y si se plantó, y el proyector recalcula todo con la mano que repartió (nunca
// confía en cartas que le manden). Lógica pura.
import type { Carta } from "@/lib/practica/naipia";
import { jugarCrupier, jugarModelo, registrarDecision, resultado, valorMano, type Accion, type Decision, type ManoComun } from "./blackjack";

export const CANAL_SALA = "ganale-al-modelo:sala";
// Cartas máximas que puede tener un jugador en una mano (la secuencia tiene 12).
const MAX_CARTAS = 12;

export interface AvisoJugador {
  id: string;
  nombre: string;
  manoId: string;
  // Cartas que tiene ahora (2 al empezar, una más por cada vez que pidió).
  nCartas: number;
  // true si se plantó con esas cartas.
  planto: boolean;
}

export interface EstadoJugadorMano {
  nombre: string;
  nCartas: number;
  planto: boolean;
  primera: Accion | null;
}

export interface MarcadorJugador {
  id: string;
  nombre: string;
  fichas: number;
  coincidencias: number;
  decisiones: number;
}

export function limpiarNombre(nombre: string): string {
  const n = nombre.replace(/\s+/g, " ").trim().slice(0, 18);
  return n || "Jugador";
}

// Aplica un aviso al estado de la mano. Ignora lo que no cuadra con la mano repartida.
export function aplicarAviso(estado: Record<string, EstadoJugadorMano>, a: AvisoJugador, mano: ManoComun): Record<string, EstadoJugadorMano> {
  if (!Number.isInteger(a.nCartas) || a.nCartas < 2 || a.nCartas > MAX_CARTAS) return estado;
  const previo = estado[a.id];
  if (previo && (previo.planto || a.nCartas < previo.nCartas)) return estado;
  const cartas = mano.jugador.slice(0, a.nCartas);
  // Si con menos cartas ya estaba pasado o en 21, no pudo seguir pidiendo.
  if (cartas.length > 2 && valorMano(cartas.slice(0, -1)).total >= 21) return estado;
  const primera: Accion | null = previo?.primera ?? (a.nCartas > 2 ? "pedir" : a.planto ? "plantarse" : null);
  return { ...estado, [a.id]: { nombre: limpiarNombre(a.nombre), nCartas: a.nCartas, planto: a.planto, primera } };
}

// Las decisiones que tomó un jugador, deducidas de cuántas cartas tiene y si se plantó.
export function decisionesDe(e: EstadoJugadorMano, mano: ManoComun): Decision[] {
  const visible = mano.crupier[0];
  const res: Decision[] = [];
  for (let k = 2; k < e.nCartas; k++) res.push(registrarDecision(mano.jugador.slice(0, k), visible, "pedir"));
  const final = mano.jugador.slice(0, e.nCartas);
  const v = valorMano(final);
  if (e.planto && !v.pasado && v.total < 21) res.push(registrarDecision(final, visible, "plantarse"));
  return res;
}

export function cartasDe(e: EstadoJugadorMano, mano: ManoComun): Carta[] {
  return mano.jugador.slice(0, e.nCartas);
}

// Quién terminó su mano (se plantó, se pasó o llegó a 21).
export function termino(e: EstadoJugadorMano, mano: ManoComun): boolean {
  return e.planto || valorMano(cartasDe(e, mano)).total >= 21;
}

export interface ConteoMano {
  jugando: number;
  pidieron: number;
  plantaron: number;
}

export function conteoMano(estado: Record<string, EstadoJugadorMano>, mano: ManoComun): ConteoMano {
  let jugando = 0;
  let pidieron = 0;
  let plantaron = 0;
  for (const e of Object.values(estado)) {
    if (!termino(e, mano)) jugando++;
    if (e.primera === "pedir") pidieron++;
    if (e.primera === "plantarse") plantaron++;
  }
  return { jugando, pidieron, plantaron };
}

export interface ResultadosMano {
  ganaron: number;
  empataron: number;
  perdieron: number;
  modelo: number;
}

// Al revelar al crupier: quien no terminó se planta con lo que tiene.
export function cerrarMano(estado: Record<string, EstadoJugadorMano>, mano: ManoComun): Record<string, EstadoJugadorMano> {
  const res: Record<string, EstadoJugadorMano> = {};
  for (const [id, e] of Object.entries(estado)) res[id] = termino(e, mano) ? e : { ...e, planto: true, primera: e.primera ?? "plantarse" };
  return res;
}

export function resultadosMano(estado: Record<string, EstadoJugadorMano>, mano: ManoComun): ResultadosMano {
  const crupier = jugarCrupier(mano.crupier);
  const r = { ganaron: 0, empataron: 0, perdieron: 0, modelo: resultado(jugarModelo(mano).cartas, crupier) };
  for (const e of Object.values(estado)) {
    const x = resultado(cartasDe(e, mano), crupier);
    if (x > 0) r.ganaron++;
    else if (x < 0) r.perdieron++;
    else r.empataron++;
  }
  return r;
}

export function acumular(marcador: Record<string, MarcadorJugador>, estado: Record<string, EstadoJugadorMano>, mano: ManoComun): Record<string, MarcadorJugador> {
  const crupier = jugarCrupier(mano.crupier);
  const res = { ...marcador };
  for (const [id, e] of Object.entries(estado)) {
    const ds = decisionesDe(e, mano);
    const prev = res[id] ?? { id, nombre: e.nombre, fichas: 0, coincidencias: 0, decisiones: 0 };
    res[id] = {
      id,
      nombre: e.nombre,
      fichas: prev.fichas + resultado(cartasDe(e, mano), crupier),
      coincidencias: prev.coincidencias + ds.filter((d) => d.eleccion === d.valores.accion).length,
      decisiones: prev.decisiones + ds.length,
    };
  }
  return res;
}

// Más fichas primero; a igualdad, quien más se pareció a π*.
export function ranking(marcador: Record<string, MarcadorJugador>): MarcadorJugador[] {
  const tasa = (m: MarcadorJugador) => (m.decisiones ? m.coincidencias / m.decisiones : 0);
  return Object.values(marcador).sort((a, b) => b.fichas - a.fichas || tasa(b) - tasa(a) || a.nombre.localeCompare(b.nombre));
}

export function idAlAzar(rng: () => number = Math.random): string {
  return Math.floor(rng() * 36 ** 8)
    .toString(36)
    .padStart(8, "0");
}
