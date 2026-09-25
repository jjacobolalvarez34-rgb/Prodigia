import type { VisualBase } from "@/lib/aprender/visuales";
import type { GraficoEstadistica } from "./tipos";
import type { NodoArbol } from "./visualesDatos";

// Visuales propios de Estadística (prefijo "estadistica."). Los NÚMEROS
// mostrados nunca van sueltos en el jsonb sin más: cada componente los
// recalcula con src/lib/estadistica/visualesDatos.ts (o los toma tal cual
// si ya son la lista de datos cruda) — visualesDatos.test.ts los contrasta
// con un cálculo independiente.

// Un conjunto de datos que se ordena y resalta la mediana o los cuartiles
// (método de las mitades, el mismo que usa la práctica) o una posición
// concreta (percentiles).
export interface VisualEstadisticaOrdenar extends VisualBase {
  tipo: "estadistica.ordenar";
  datos: number[];
  resaltar: "mediana" | "cuartiles" | "posicion";
  // Solo con resaltar:"posicion" — posición 1-based en la lista YA
  // ordenada (p. ej. la posición de un percentil).
  posicion?: number;
  etiquetaPosicion?: string;
  etiquetaUnidad?: string;
}

// Barras que crecen mostrando la frecuencia de cada valor y resaltan la moda.
export interface VisualEstadisticaFrecuencias extends VisualBase {
  tipo: "estadistica.frecuencias";
  datos: number[];
  // Agrega la media (suma ÷ cantidad) debajo de la moda, para contrastar
  // las dos medidas sobre los mismos datos.
  mostrarMedia?: boolean;
  etiquetaUnidad?: string;
}

// Puntos en una recta numérica que se alejan de un centro (la media o una
// media provisoria), con su desviación coloreada. `mostrarCuadrados`
// agrega el cuadrado de cada desviación (para varianza/desvío). `sigma`
// agrega el puntaje z de cada punto (desviación ÷ sigma).
export interface VisualEstadisticaDesvios extends VisualBase {
  tipo: "estadistica.desvios";
  datos: number[];
  centro: number;
  etiquetaCentro: string;
  mostrarCuadrados?: boolean;
  sigma?: number;
}

// Reusa los SVG existentes de src/components/estadistica (mismo tipo que
// genera la práctica en el modo 5) para un gráfico de barras, líneas,
// histograma o diagrama de caja ya armado (datos fijos del ejemplo de la
// lección, no aleatorios).
export interface VisualEstadisticaGrafico extends VisualBase {
  tipo: "estadistica.grafico";
  grafico: GraficoEstadistica;
}

// Diagrama de dispersión con, opcionalmente, la recta de mínimos
// cuadrados (correlación y regresión lineal simple).
export interface VisualEstadisticaDispersion extends VisualBase {
  tipo: "estadistica.dispersion";
  x: number[];
  y: number[];
  etiquetaX?: string;
  etiquetaY?: string;
  mostrarRecta?: boolean;
}

// Árbol de probabilidad simple (2 niveles como mucho): cada rama tiene su
// probabilidad condicional al padre; el producto de cada camino es la
// probabilidad conjunta.
export interface VisualEstadisticaArbol extends VisualBase {
  tipo: "estadistica.arbol";
  raiz: string;
  ramas: NodoArbol[];
}

// Curva normal con las bandas de la regla empírica (68 / 95 / 99.7 %) y,
// opcionalmente, un punto marcado (para puntaje z).
export interface VisualEstadisticaNormal extends VisualBase {
  tipo: "estadistica.normal";
  media: number;
  sigma: number;
  marcarX?: number;
  etiquetaUnidad?: string;
}

export type VisualEstadistica =
  | VisualEstadisticaOrdenar
  | VisualEstadisticaFrecuencias
  | VisualEstadisticaDesvios
  | VisualEstadisticaGrafico
  | VisualEstadisticaDispersion
  | VisualEstadisticaArbol
  | VisualEstadisticaNormal;
