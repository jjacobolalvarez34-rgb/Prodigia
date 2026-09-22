// Cálculos puros de los visuales de Naipia (sin React): así se testean
// contra el cálculo independiente y los componentes solo dibujan.
import {
  PALOS,
  SIMBOLO_PALO,
  SISTEMAS_CONTEO,
  TABLA_SISTEMAS,
  VALORES_CARTA,
  gruposDeSistema,
  type Carta,
  type Palo,
  type SistemaConteo,
  type ValorCarta,
} from "@/lib/practica/naipia";
import type { ReglaRedondeoVisual } from "./visuales";

export function esSistemaConteo(valor: unknown): valor is SistemaConteo {
  return typeof valor === "string" && (SISTEMAS_CONTEO as string[]).includes(valor);
}

const PALO_POR_SIMBOLO = new Map<string, Palo>(PALOS.map((p) => [SIMBOLO_PALO[p], p]));

// "10♥" -> { valor: "10", palo: "corazones" }. null si el texto no es una carta.
export function parsearCarta(texto: unknown): Carta | null {
  if (typeof texto !== "string") return null;
  const t = texto.trim();
  if (t.length < 2) return null;
  const simbolo = t.slice(-1);
  const valor = t.slice(0, -1);
  const palo = PALO_POR_SIMBOLO.get(simbolo);
  if (!palo || !(VALORES_CARTA as string[]).includes(valor)) return null;
  return { valor: valor as ValorCarta, palo };
}

// null si la lista está vacía, no es una lista, o tiene alguna carta inválida
// (el visual entonces se omite en vez de romper).
export function parsearCartas(textos: unknown): Carta[] | null {
  if (!Array.isArray(textos) || textos.length === 0) return null;
  const cartas: Carta[] = [];
  for (const t of textos) {
    const c = parsearCarta(t);
    if (!c) return null;
    cartas.push(c);
  }
  return cartas;
}

export function valoresDe(sistema: SistemaConteo, cartas: Carta[]): number[] {
  return cartas.map((c) => TABLA_SISTEMAS[sistema][c.valor]);
}

// Conteo acumulado después de cada carta: acumulado[i] = suma de las
// primeras i+1 cartas.
export function acumulados(valores: number[]): number[] {
  const salida: number[] = [];
  let suma = 0;
  for (const v of valores) {
    suma += v;
    salida.push(suma);
  }
  return salida;
}

// ---------- Cancelación de pares ----------

export interface PlanCancelacion {
  // Índices de las cartas neutras (valor 0): no se cuentan.
  neutras: number[];
  // Pares [i, j] cuyos valores suman 0 (una carta con su opuesta).
  pares: [number, number][];
  // Índices de las cartas sin pareja: lo único que queda por contar.
  sobran: number[];
}

// Empareja cada carta con la primera posterior de valor opuesto; ninguna
// carta se usa en dos pares. La suma de `sobran` es siempre el conteo
// total: cancelar no cambia el conteo.
export function planCancelacion(valores: number[]): PlanCancelacion {
  const usada = valores.map(() => false);
  const neutras: number[] = [];
  const pares: [number, number][] = [];
  valores.forEach((v, i) => {
    if (v === 0) {
      neutras.push(i);
      usada[i] = true;
    }
  });
  for (let i = 0; i < valores.length; i++) {
    if (usada[i]) continue;
    for (let j = i + 1; j < valores.length; j++) {
      if (!usada[j] && valores[j] === -valores[i]) {
        usada[i] = true;
        usada[j] = true;
        pares.push([i, j]);
        break;
      }
    }
  }
  const sobran = valores.map((_, i) => i).filter((i) => !usada[i]);
  return { neutras, pares, sobran };
}

// ---------- Mazo completo ----------

export interface FilaMazo {
  valor: number;
  rangos: ValorCarta[];
  cartas: number; // 4 por rango
  aporte: number; // cartas * valor
}

// Los rangos de un grupo en orden de lectura (2..10, J, Q, K, A: el As es
// una carta ALTA), no en el orden interno A,2..K.
const ORDEN_LECTURA: ValorCarta[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export function ordenarRangos(rangos: ValorCarta[]): ValorCarta[] {
  return ORDEN_LECTURA.filter((r) => rangos.includes(r));
}

export function filasMazo(sistema: SistemaConteo): { filas: FilaMazo[]; total: number } {
  const filas = gruposDeSistema(sistema).map((g) => ({
    valor: g.valor,
    rangos: ordenarRangos(g.rangos),
    cartas: 4 * g.rangos.length,
    aporte: 4 * g.rangos.length * g.valor,
  }));
  return { filas, total: filas.reduce((a, f) => a + f.aporte, 0) };
}

// ---------- Conteo verdadero ----------
// Mismas reglas que naipia.ts (divisionEntera / mediosMazosRestantes, que no
// se exportan): aritmética entera exacta, con los mazos como número de
// medios mazos. Un test contrasta esta función con problemas reales del
// generador de Naipia.

export function mediosMazosRestantes(mazosTotales: number, cartasJugadas: number): number {
  return Math.round((52 * mazosTotales - cartasJugadas) / 26);
}

export function dividirConRegla(conteo: number, mazos: number, regla: ReglaRedondeoVisual): number {
  const num = Math.round(conteo * 2);
  const den = Math.round(mazos * 2);
  const q = Math.trunc(num / den);
  const resto = num - q * den;
  const piso = resto !== 0 && num < 0 ? q - 1 : q;
  let r: number;
  if (regla === "truncar") r = q;
  else if (regla === "abajo") r = piso;
  else {
    const restoPiso = num - piso * den;
    r = restoPiso * 2 > den ? piso + 1 : piso;
  }
  return r || 0; // normaliza -0
}

export function esReglaRedondeo(valor: unknown): valor is ReglaRedondeoVisual {
  return valor === "cercano" || valor === "truncar" || valor === "abajo";
}
