// Piezas compartidas por los generadores de Trigonometría (razones, círculo,
// identidades y leyes): azar con semilla opcional, formato de números y de
// LaTeX, elección ponderada y armado de opciones.
//
// Sin semilla en la práctica normal (Math.random por defecto), pero el Reto
// Diario necesita que las preguntas del día sean idénticas para cualquiera
// que las genere: conRngSembrado() reemplaza temporalmente el generador de
// números aleatorios durante la llamada (mismo patrón que melodia.ts). TODO el
// azar del mundo pasa por azar(); ningún generador usa Math.random ni la hora.

import { redondear } from "@/lib/trigonometria/triangulos";
import type { ActivoEscala } from "./trigonometriaEscala";

// null = la práctica normal (Math.random, leído en cada llamada).
let rngActual: (() => number) | null = null;

export function conRngSembrado<T>(rng: () => number, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

export const azar = (): number => (rngActual ? rngActual() : Math.random());

export function randomInt(min: number, max: number): number {
  return Math.floor(azar() * (max - min + 1)) + min;
}

export function elegir<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error("elegir() sobre una lista vacía");
  return arr[Math.floor(azar() * arr.length)];
}

export function mezclar<T>(arr: readonly T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Un tipo de problema según los pesos de la escala.
export function elegirPonderado(activos: ActivoEscala[]): ActivoEscala {
  const total = activos.reduce((s, a) => s + a.peso, 0);
  let x = azar() * total;
  for (const a of activos) {
    x -= a.peso;
    if (x < 0) return a;
  }
  return activos[activos.length - 1];
}

// Envuelve LaTeX en $...$ (convención de MathText, docs/PLAN_REVISION_CONTENIDO.md).
export const m = (expr: string): string => `$${expr}$`;

// Número para el texto del enunciado: coma decimal, sin ceros de más (12,5 · 8 · 0,75).
export function numTxt(n: number, decimales = 2): string {
  return String(redondear(n, decimales)).replace(".", ",");
}

// Número dentro de una fórmula ($...$): la coma decimal lleva llaves para que
// KaTeX no agregue espacio ("12{,}5").
export function numTex(n: number, decimales = 2): string {
  return String(redondear(n, decimales)).replace(".", "{,}");
}

export const gradosTexto = (g: number): string => m(`${numTex(g, 1)}^{\\circ}`);

// Tolerancia de una respuesta numérica: relativa al valor y nunca menor que `minimo`.
export function tolerancia(respuesta: number, relativa: number, minimo: number): number {
  return Math.round(Math.max(minimo, Math.abs(respuesta) * relativa) * 1000) / 1000;
}

// Las opciones de una pregunta: la correcta más hasta 3 distractores DISTINTOS
// entre sí y de la correcta (por `clave`), en orden aleatorio. Los distractores
// `preferidos` (errores típicos) van primero; el resto se completa desde `pool`.
export function armarOpciones<T>(
  correcta: T,
  preferidos: T[],
  pool: T[],
  clave: (x: T) => string,
  cantidad = 4
): T[] {
  const vistos = new Set<string>([clave(correcta)]);
  const elegidos: T[] = [];
  const agregar = (lista: T[]) => {
    for (const x of lista) {
      if (elegidos.length >= cantidad - 1) return;
      const k = clave(x);
      if (vistos.has(k)) continue;
      vistos.add(k);
      elegidos.push(x);
    }
  };
  agregar(mezclar(preferidos));
  agregar(mezclar(pool));
  return mezclar([correcta, ...elegidos]);
}
