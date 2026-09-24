// Aritmética exacta con fracciones de enteros pequeños. La usan los valores
// exactos (exactos.ts), los ángulos en múltiplos de π (angulos.ts) y las ondas
// (ondas.ts): nunca se compara ni se formatea un decimal cuando se puede
// trabajar con la fracción.

export interface Frac {
  readonly n: number;
  readonly d: number;
}

export function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function mcm(a: number, b: number): number {
  return (Math.abs(a) / mcd(a, b)) * Math.abs(b);
}

export function frac(n: number, d = 1): Frac {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error(`Fracción inválida ${n}/${d}`);
  const g = mcd(n, d) || 1;
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}

export const CERO: Frac = frac(0);
export const UNO: Frac = frac(1);

export const sumaF = (a: Frac, b: Frac): Frac => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const restaF = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const mulF = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d);
export const divF = (a: Frac, b: Frac): Frac => {
  if (b.n === 0) throw new Error("División por cero");
  return frac(a.n * b.d, a.d * b.n);
};
export const negF = (a: Frac): Frac => frac(-a.n, a.d);
export const igualF = (a: Frac, b: Frac): boolean => a.n === b.n && a.d === b.d;
export const esCeroF = (a: Frac): boolean => a.n === 0;
export const aNumero = (a: Frac): number => a.n / a.d;

// Fracción de un decimal "limpio" (a lo sumo 6 decimales): 0.25 -> 1/4.
export function fracDeDecimal(x: number): Frac {
  const d = 1_000_000;
  return frac(Math.round(x * d), d);
}
