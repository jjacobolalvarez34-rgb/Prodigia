import type { VisualBase } from "@/lib/aprender/visuales";

// Visuales propios de Calculia (prefijo "calculia."). Mismo patrón que
// src/lib/trigonometria/visuales.ts y src/lib/naipia/visuales.ts: tipos
// livianos y serializables (jsonb), sin funciones — todo el cálculo real
// vive en visualesDatos.ts (funciones puras, testeadas contra un cálculo
// independiente) y los componentes de src/components/calculia/visuales/
// solo dibujan lo que esas funciones devuelven.
//
// REGLA DURA (igual que src/lib/practica/calculia.ts): nunca se parsea ni
// simplifica una expresión simbólica libre. Toda función que dibuja un
// visual es una SUMA de términos de dos formas conocidas:
//   - "potencia":     c·x^n
//   - "factorLineal": c·(a·x+b)^n
// que cubren exactamente los casos reales de Calculia (regla de la
// potencia, y el binomio lineal de la regla de la cadena / sustitución
// simple / EDO separable). La derivada y la antiderivada de cada término se
// calculan de forma FORMULAICA (regla de la potencia / regla de la cadena
// al revés), nunca por parseo.

export interface TerminoPotenciaCalculia {
  tipo: "potencia";
  // c·x^n
  c: number;
  n: number;
}

export interface TerminoFactorLinealCalculia {
  tipo: "factorLineal";
  // c·(a·x+b)^n
  c: number;
  a: number;
  b: number;
  n: number;
}

export type TerminoFuncionCalculia = TerminoPotenciaCalculia | TerminoFactorLinealCalculia;

// Pendiente de la recta tangente, animada: la curva de f, la secante entre
// (x0, f(x0)) y un punto cercano que se va acercando, y por último la recta
// tangente con la pendiente exacta (regla de la potencia / cadena).
export interface VisualCalculiaTangente extends VisualBase {
  tipo: "calculia.tangente";
  funcion: TerminoFuncionCalculia[];
  x0: number;
  // Dominio a dibujar; si falta se calcula alrededor de x0.
  rango?: [number, number];
}

// Área bajo la curva de f entre `desde` y `hasta`, rellenándose (rectángulos
// de Riemann que se afinan hasta el área exacta = antiderivada evaluada).
export interface VisualCalculiaArea extends VisualBase {
  tipo: "calculia.area";
  funcion: TerminoFuncionCalculia[];
  desde: number;
  hasta: number;
}

// Sumas parciales de una serie geométrica a + ar + ar² + ... acercándose
// (o no) a la suma infinita a/(1-r). r se da como fracción rNum/rDen para
// evitar decimales periódicos en los datos serializados.
export interface VisualCalculiaSerie extends VisualBase {
  tipo: "calculia.serie";
  a: number;
  rNum: number;
  rDen: number;
  // Cuántas sumas parciales animar (2..12).
  terminos: number;
}

// Familia de soluciones de una EDO separable dy/dx = k·x^n·y, que se resuelve
// separando variables: y = A·e^{k/(n+1)·x^(n+1)}. Muestra tres curvas (A = 1/2,
// 1 y 2) y, en x0, comprueba que la pendiente de la curva coincide con lo que
// dice la ecuación (k·x0^n·y0). k entero distinto de 0, n entero >= 0.
export interface VisualCalculiaEdo extends VisualBase {
  tipo: "calculia.edo";
  k: number;
  n: number;
  x0: number;
  // Dominio a dibujar; por defecto [-1.2, 1.2].
  rango?: [number, number];
}

export type VisualCalculia = VisualCalculiaTangente | VisualCalculiaArea | VisualCalculiaSerie | VisualCalculiaEdo;
