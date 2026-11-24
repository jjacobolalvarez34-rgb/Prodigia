// «Gánale al modelo» (2026-11-24): blackjack simplificado modelado como proceso de
// decisión de Markov (proyecto de Computación Científica, Konrad Lorenz). Lógica pura.
//
// Reglas (las del modelo, no cambiarlas):
// - Baraja infinita: cada valor sale con probabilidad 1/13; el 10 con 4/13 (10, J, Q, K).
// - El jugador solo pide o se planta. Si pasa de 21 pierde aunque el crupier también se pase.
// - El As vale 11 si no te pasas; si no, 1. Una mano con un As que vale 11 es suave.
// - El crupier pide hasta 17 y se planta con todo 17, incluido el suave (S17). No revisa
//   su carta oculta.
// - Pagos: ganar +1, empatar 0, perder −1. El blackjack natural es un 21 cualquiera.
import { PALOS, TABLA_SISTEMAS, VALORES_CARTA, type Carta, type ValorCarta } from "@/lib/practica/naipia";

export const MANOS_POR_PARTIDA = 3;
// Cartas que se sacan por mano para cada lado; con baraja infinita nadie necesita más.
const CARTAS_POR_SECUENCIA = 12;

export type Accion = "pedir" | "plantarse";

export interface ValorMano {
  total: number;
  suave: boolean;
  pasado: boolean;
}

// Valor numérico de una carta: el As cuenta 1 aquí y se sube a 11 en valorMano.
export function puntosCarta(valor: ValorCarta): number {
  if (valor === "A") return 1;
  if (valor === "J" || valor === "Q" || valor === "K") return 10;
  return Number(valor);
}

export function valorDePuntos(puntos: number[]): ValorMano {
  const duro = puntos.reduce((a, b) => a + b, 0);
  const hayAs = puntos.includes(1);
  if (hayAs && duro + 10 <= 21) return { total: duro + 10, suave: true, pasado: false };
  return { total: duro, suave: false, pasado: duro > 21 };
}

export function valorMano(cartas: Carta[]): ValorMano {
  return valorDePuntos(cartas.map((c) => puntosCarta(c.valor)));
}

// Probabilidad de cada valor (1 = As, 10 = 10/J/Q/K) con baraja infinita.
export const PROB_PUNTOS: [number, number][] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => [p, p === 10 ? 4 / 13 : 1 / 13]);

// ---------- El crupier (S17) ----------

// Distribución del total final del crupier partiendo de su carta visible (su oculta
// todavía sin sacar). Claves 17..21 y 22 = se pasa.
const memoCrupier = new Map<string, Map<number, number>>();
function distCrupierDesde(duro: number, hayAs: boolean): Map<number, number> {
  const clave = `${duro}|${hayAs}`;
  const guardado = memoCrupier.get(clave);
  if (guardado) return guardado;
  const total = hayAs && duro + 10 <= 21 ? duro + 10 : duro;
  const res = new Map<number, number>();
  if (duro > 21) res.set(22, 1);
  else if (total >= 17) res.set(total, 1);
  else {
    for (const [p, prob] of PROB_PUNTOS) {
      for (const [t, q] of distCrupierDesde(duro + p, hayAs || p === 1)) res.set(t, (res.get(t) ?? 0) + prob * q);
    }
  }
  memoCrupier.set(clave, res);
  return res;
}

export function distribucionCrupier(visible: number): Map<number, number> {
  return distCrupierDesde(visible, visible === 1);
}

// ---------- La política óptima π* ----------

// Un estado del jugador: total (con el As como 11 si cabe) y si es suave. Con la carta
// visible del crupier (1 = As .. 10) son 280 situaciones: duro 4–21 y suave 12–21.
export interface ValoresEstado {
  qPlantarse: number;
  qPedir: number;
  accion: Accion;
}

function siguienteEstado(total: number, suave: boolean, p: number): { total: number; suave: boolean } | null {
  if (suave) {
    const n = total + p;
    return n > 21 ? { total: n - 10, suave: false } : { total: n, suave: true };
  }
  if (p === 1 && total + 11 <= 21) return { total: total + 11, suave: true };
  const n = total + p;
  return n > 21 ? null : { total: n, suave: false };
}

function valorPlantarse(total: number, visible: number): number {
  let v = 0;
  for (const [t, prob] of distribucionCrupier(visible)) {
    if (t === 22 || t < total) v += prob;
    else if (t > total) v -= prob;
  }
  return v;
}

// Valores exactos por recursión: pedir siempre sube el total (o lo vuelve duro), así que
// el grafo de estados no tiene ciclos y la ecuación de Bellman se resuelve hacia atrás.
// Es la misma solución que da la iteración de políticas del proyecto.
const memoPolitica = new Map<string, ValoresEstado>();
export function valoresEstado(total: number, suave: boolean, visible: number): ValoresEstado {
  const clave = `${total}|${suave}|${visible}`;
  const guardado = memoPolitica.get(clave);
  if (guardado) return guardado;
  const qPlantarse = valorPlantarse(total, visible);
  let qPedir = 0;
  for (const [p, prob] of PROB_PUNTOS) {
    const sig = siguienteEstado(total, suave, p);
    if (!sig) qPedir -= prob;
    else {
      const v = valoresEstado(sig.total, sig.suave, visible);
      qPedir += prob * Math.max(v.qPlantarse, v.qPedir);
    }
  }
  // Con 21 no hay nada que decidir: se planta solo.
  const accion: Accion = total >= 21 ? "plantarse" : qPedir > qPlantarse ? "pedir" : "plantarse";
  const res = { qPlantarse, qPedir, accion };
  memoPolitica.set(clave, res);
  return res;
}

export function decisionModelo(cartas: Carta[], visible: Carta): ValoresEstado {
  const v = valorMano(cartas);
  return valoresEstado(v.total, v.suave, puntosCarta(visible.valor));
}

// Ganancia esperada del modelo por mano (antes de ver ninguna carta), en fichas.
export function valorEsperadoModelo(): number {
  let total = 0;
  for (const [a, pa] of PROB_PUNTOS) {
    for (const [b, pb] of PROB_PUNTOS) {
      const v = valorDePuntos([a, b]);
      for (const [u, pu] of PROB_PUNTOS) {
        const e = valoresEstado(v.total, v.suave, u);
        total += pa * pb * pu * Math.max(e.qPlantarse, e.qPedir);
      }
    }
  }
  return total;
}

// ---------- Una mano con números aleatorios comunes ----------

export interface ManoComun {
  // El jugador y el modelo sacan de esta misma secuencia, cada uno desde el principio.
  jugador: Carta[];
  // [0] visible, [1] oculta, después las que pide.
  crupier: Carta[];
}

export function cartaAlAzar(rng: () => number): Carta {
  const valor = VALORES_CARTA[Math.min(12, Math.floor(rng() * 13))];
  const palo = PALOS[Math.min(3, Math.floor(rng() * 4))];
  return { valor, palo };
}

export function generarMano(rng: () => number = Math.random): ManoComun {
  const jugador = Array.from({ length: CARTAS_POR_SECUENCIA }, () => cartaAlAzar(rng));
  const crupier = Array.from({ length: CARTAS_POR_SECUENCIA }, () => cartaAlAzar(rng));
  return { jugador, crupier };
}

// Cartas finales del crupier: pide hasta 17 y se planta con 17 suave.
export function jugarCrupier(secuencia: Carta[]): Carta[] {
  const mano = secuencia.slice(0, 2);
  let i = 2;
  while (valorMano(mano).total < 17 && i < secuencia.length) mano.push(secuencia[i++]);
  return mano;
}

export function resultado(jugador: Carta[], crupier: Carta[]): -1 | 0 | 1 {
  const j = valorMano(jugador);
  if (j.pasado) return -1;
  const c = valorMano(crupier);
  if (c.pasado || j.total > c.total) return 1;
  return j.total === c.total ? 0 : -1;
}

export interface Decision {
  total: number;
  suave: boolean;
  visible: Carta;
  eleccion: Accion;
  valores: ValoresEstado;
}

// Cómo juega el modelo la mano: pide mientras π* diga pedir.
export function jugarModelo(mano: ManoComun): { cartas: Carta[]; decisiones: Decision[] } {
  const visible = mano.crupier[0];
  const cartas = mano.jugador.slice(0, 2);
  const decisiones: Decision[] = [];
  let i = 2;
  for (;;) {
    const v = valorMano(cartas);
    if (v.pasado || v.total >= 21 || i >= mano.jugador.length) break;
    const valores = valoresEstado(v.total, v.suave, puntosCarta(visible.valor));
    decisiones.push({ total: v.total, suave: v.suave, visible, eleccion: valores.accion, valores });
    if (valores.accion === "plantarse") break;
    cartas.push(mano.jugador[i++]);
  }
  return { cartas, decisiones };
}

// Una decisión del jugador, con los valores de π* para ese estado.
export function registrarDecision(cartas: Carta[], visible: Carta, eleccion: Accion): Decision {
  const v = valorMano(cartas);
  return { total: v.total, suave: v.suave, visible, eleccion, valores: valoresEstado(v.total, v.suave, puntosCarta(visible.valor)) };
}

export function coincide(d: Decision): boolean {
  return d.eleccion === d.valores.accion;
}

// Valor por cada 100 manos, redondeado («pierde 48», «gana 12»).
export function porCien(q: number): number {
  return Math.round(q * 100);
}

// ---------- Conteo Hi-Lo ----------

export function conteoHiLo(cartas: Carta[]): number {
  return cartas.reduce((a, c) => a + TABLA_SISTEMAS.hilo[c.valor], 0);
}

export function conteoVerdadero(corriente: number, cartasVistas: number, barajas: number): number {
  const restantes = Math.max(0.5, barajas - cartasVistas / 52);
  return corriente / restantes;
}

// RNG con semilla (pruebas): mulberry32.
export function rngConSemilla(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
