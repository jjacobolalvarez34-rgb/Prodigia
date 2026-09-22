import { conteoCorriente, sumaMazoCompleto, TABLA_SISTEMAS, type SistemaConteo, type ValorCarta } from "@/lib/practica/naipia";
import { parsearCartas } from "../visualesDatos";
import type { ReglaRedondeoVisual } from "../visuales";
import { dividirConRegla } from "../visualesDatos";

// Ayudas para escribir el texto de las lecciones SIN números a mano: todo
// número que aparece en un texto sale de TABLA_SISTEMAS / de estas
// funciones (que usan las mismas tablas y reglas que el generador).

// "7♠ K♥ 3♦" -> ["7♠", "K♥", "3♦"]
export function cartas(secuencia: string): string[] {
  return secuencia.split(" ");
}

// Conteo corriente de una secuencia con un sistema.
export function cuenta(sistema: SistemaConteo, secuencia: string): number {
  const parsed = parsearCartas(cartas(secuencia));
  if (!parsed) throw new Error(`Secuencia inválida: ${secuencia}`);
  return conteoCorriente(sistema, parsed);
}

// Valor de un rango en un sistema.
export function valor(sistema: SistemaConteo, rango: ValorCarta): number {
  return TABLA_SISTEMAS[sistema][rango];
}

export function mazoCompleto(sistema: SistemaConteo): number {
  return sumaMazoCompleto(sistema);
}

// Número con signo para MathText: "$+3$", "$0$", "$-2$".
export function m(n: number): string {
  return `$${n > 0 ? `+${n}` : n}$`;
}

// Número plano (sin KaTeX) con coma decimal y a lo sumo 2 decimales.
export function dec(n: number): string {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

// Los valores de una secuencia como suma escrita en LaTeX (sin $):
// "0 + 1 - 1 + 1" (con el conteo final igual a la suma).
export function sumaEscrita(sistema: SistemaConteo, secuencia: string): string {
  const parsed = parsearCartas(cartas(secuencia));
  if (!parsed) throw new Error(`Secuencia inválida: ${secuencia}`);
  const vals = parsed.map((c) => TABLA_SISTEMAS[sistema][c.valor]);
  const cuerpo = vals.map((v, i) => (i === 0 ? String(v) : v < 0 ? `- ${Math.abs(v)}` : `+ ${v}`)).join(" ");
  return `${cuerpo} = ${vals.reduce((a, v) => a + v, 0)}`;
}

export function dividir(conteo: number, mazos: number, regla: ReglaRedondeoVisual): number {
  return dividirConRegla(conteo, mazos, regla);
}
