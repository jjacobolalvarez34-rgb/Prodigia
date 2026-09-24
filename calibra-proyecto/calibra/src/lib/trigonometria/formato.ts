import { redondear } from "./triangulos";

// Formato de números para los textos que arman las funciones de datos de los
// visuales: coma decimal en español ("6,88"), punto en inglés ("6.88"). Dentro
// de una fórmula ($...$) la coma lleva llaves ("6{,}88") para que KaTeX no
// agregue un espacio después de ella.
export type Decimal = "," | ".";

export function dec(x: number, decimales: number, sep: Decimal = ","): string {
  return String(redondear(x, decimales)).replace(".", sep);
}

export function decTex(x: number, decimales: number, sep: Decimal = ","): string {
  return String(redondear(x, decimales)).replace(".", sep === "," ? "{,}" : ".");
}

export const r2 = (n: number): number => Math.round(n * 100) / 100;
