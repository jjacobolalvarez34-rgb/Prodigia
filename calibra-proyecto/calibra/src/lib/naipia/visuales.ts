import type { VisualBase } from "@/lib/aprender/visuales";
import type { SistemaConteo } from "@/lib/practica/naipia";

// Visuales propios de Naipia (prefijo "naipia."). Las cartas se escriben
// como texto "7♠", "10♥", "K♦" (mismo formato que cartaATexto de naipia.ts).
// Los VALORES nunca van en estos datos: los componentes los sacan de
// TABLA_SISTEMAS.

export type ReglaRedondeoVisual = "cercano" | "truncar" | "abajo";

// Tabla de valores del sistema, animada por grupos (+1 / 0 / −1 ...).
export interface VisualNaipiaValores extends VisualBase {
  tipo: "naipia.valores";
  sistema: SistemaConteo;
  // Si se da, los demás grupos se atenúan y se destaca el de ese valor.
  enfatizar?: number;
}

// Conteo corriente carta a carta (o por bloques si `bloque` > 1).
export interface VisualNaipiaConteo extends VisualBase {
  tipo: "naipia.conteo";
  sistema: SistemaConteo;
  cartas: string[];
  // Milisegundos entre cartas (o entre bloques). Por defecto 1300.
  velocidad?: number;
  // Tamaño del bloque (2-6). Por defecto 1 = carta a carta.
  bloque?: number;
}

// Pares que se cancelan (baja + alta) hasta dejar solo lo que sobra.
export interface VisualNaipiaCancelacion extends VisualBase {
  tipo: "naipia.cancelacion";
  sistema: SistemaConteo;
  cartas: string[];
  velocidad?: number;
}

// Conteo verdadero = conteo corriente ÷ mazos restantes, con la regla de
// redondeo declarada. Se da `mazosRestantes` directo, o `mazosTotales` +
// `cartasJugadas` (y los mazos restantes salen del cálculo, al medio mazo
// más cercano).
export interface VisualNaipiaVerdadero extends VisualBase {
  tipo: "naipia.verdadero";
  conteo: number;
  regla: ReglaRedondeoVisual;
  mazosRestantes?: number;
  mazosTotales?: number;
  cartasJugadas?: number;
}

// Suma del mazo completo (4 cartas por rango x valor): 0 si balanceado.
export interface VisualNaipiaMazo extends VisualBase {
  tipo: "naipia.mazo";
  sistema: SistemaConteo;
}

// Los mismos naipes valorados por varios sistemas, lado a lado.
export interface VisualNaipiaComparar extends VisualBase {
  tipo: "naipia.comparar";
  sistemas: SistemaConteo[];
  cartas: string[];
}

export type VisualNaipia =
  | VisualNaipiaValores
  | VisualNaipiaConteo
  | VisualNaipiaCancelacion
  | VisualNaipiaVerdadero
  | VisualNaipiaMazo
  | VisualNaipiaComparar;
