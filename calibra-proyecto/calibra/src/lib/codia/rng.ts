// RNG de Codia: misma convención que calculia.ts (referencia mutable a
// nivel de módulo que conRngSembrado() reemplaza durante la llamada).
let rngActual: () => number = Math.random;

export function conRngSembrado<T>(rng: () => number, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

export function azar(): number {
  return rngActual();
}

export function randomInt(min: number, max: number): number {
  return Math.floor(rngActual() * (max - min + 1)) + min;
}

export function elegir<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export function mezclar<T>(arr: readonly T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rngActual() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
