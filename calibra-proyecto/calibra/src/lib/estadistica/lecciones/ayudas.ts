import type { CuadroLeccion } from "@/lib/aprender/visuales";
import { fraccion } from "@/lib/estadistica/util";
import { combinaciones, factorial, permutaciones, productoDescendente } from "@/lib/estadistica/visualesDatos";

// Ayudas para escribir los visuales de las lecciones: los números y las
// fórmulas que muestran los cuadros salen de funciones puras
// (src/lib/estadistica/visualesDatos.ts), nunca de memoria.
// lecciones.test.ts los contrasta con un cálculo independiente (triángulo de
// Pascal, listado de casos).

// Fracción simplificada en LaTeX (sin los $): 6/45 -> \dfrac{2}{15}; entera -> "2".
export function fraccionTex(numerador: number, denominador: number): string {
  const f = fraccion(numerador, denominador);
  return f.den === 1 ? String(f.num) : `\\dfrac{${f.num}}{${f.den}}`;
}

// Repite cada valor tantas veces como diga su frecuencia: ([1, 2, 3], [2, 5, 3])
// -> [1, 1, 2, 2, 2, 2, 2, 3, 3, 3].
export function expandir(valores: readonly number[], frecuencias: readonly number[]): number[] {
  return valores.flatMap((v, i) => Array.from({ length: frecuencias[i] }, () => v));
}

export function cuadroFactorial(n: number): CuadroLeccion[] {
  return [
    { texto: `Son las formas de ordenar $${n}$ objetos distintos.` },
    { formula: `${n}! = ${productoDescendente(n, n)}`, resaltar: `$= ${factorial(n)}$` },
  ];
}

export function cuadrosPermutacion(n: number, r: number): CuadroLeccion[] {
  return [
    { texto: `El orden importa: se multiplican $${r}$ factores hacia abajo desde $${n}$, sin dividir.` },
    { formula: `P(${n}, ${r}) = ${productoDescendente(n, r)}`, resaltar: `$= ${permutaciones(n, r)}$` },
  ];
}

export function cuadrosCombinacion(n: number, r: number): CuadroLeccion[] {
  return [
    { texto: `El orden no importa: se dividen las permutaciones entre $${r}!$.` },
    {
      formula: `C(${n}, ${r}) = \\dfrac{${productoDescendente(n, r)}}{${productoDescendente(r, r)}} = \\dfrac{${permutaciones(n, r)}}{${factorial(r)}}`,
      resaltar: `$= ${combinaciones(n, r)}$`,
    },
  ];
}

// Simetría C(n, r) = C(n, n - r): se calcula con el factor más chico.
export function cuadrosSimetria(n: number, r: number): CuadroLeccion[] {
  const chico = Math.min(r, n - r);
  return [
    { texto: `Por simetría, $C(${n}, ${r}) = C(${n}, ${n - r})$: conviene calcular con el número más chico.` },
    {
      formula: `C(${n}, ${r}) = C(${n}, ${chico}) = \\dfrac{${productoDescendente(n, chico)}}{${productoDescendente(chico, chico)}}`,
      resaltar: `$= ${combinaciones(n, r)}$`,
    },
  ];
}
