// Animaciones de las lecciones de Dinamia y Vitalia, escritas UNA vez para la web
// y la app: una «escena» dice cuántos pasos tiene y qué dibujar en cada momento.
// El reproductor de cada plataforma (useReproductor) avanza el paso y anima `t`
// de 0 a 1 dentro de cada paso; la escena solo calcula formas (primitivas.ts).
import type { Dibujo } from "./primitivas";

export interface Escena {
  // Pasos del reproductor (≥ 1). `paso` va de 0 (inicio) a `pasos` (final).
  pasos: number;
  // Milisegundos por paso cuando se reproduce solo.
  ms: number;
  // Dibujo en el paso `paso` (0..pasos), con `t` (0..1) el avance de la
  // transición hacia ese paso. Con t = 1 el paso queda quieto y completo.
  dibujar: (paso: number, t: number) => Dibujo;
  // Frase debajo del dibujo en cada paso (o null).
  leyenda: (paso: number) => string | null;
  // Resumen en texto para lectores de pantalla.
  alternativa: string;
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const suave = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const limitar = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

// Número con coma decimal y hasta `dec` decimales.
export function num(n: number, dec = 2): string {
  const p = 10 ** dec;
  const r = Math.round(n * p + (n >= 0 ? 1e-9 : -1e-9)) / p;
  return (Object.is(r, -0) ? 0 : r).toString().replace(".", ",");
}

// Pseudoazar fijo (mismas posiciones en la web y la app, sin estado).
export function ruido(i: number, k = 0): number {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function esNum(x: unknown, min = -Infinity, max = Infinity): x is number {
  return typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;
}
