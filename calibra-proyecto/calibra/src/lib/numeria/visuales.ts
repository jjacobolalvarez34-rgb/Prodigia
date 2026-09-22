import type { VisualBase } from "@/lib/aprender/visuales";
import type { OperacionFraccion } from "./visualesDatos";

// Visuales propios de Numeria (prefijo "numeria."): tablero/pizarra en
// columna, animado paso a paso, mostrando de dónde sale cada número — el
// pedido explícito del usuario (docs/PARIDAD_MUNDOS.md, fila 23, rollout
// Numeria). Los NÚMEROS de cada visual son datos fijos, pero el
// resultado/columnas que se muestran siempre se recalculan con las
// funciones puras de src/lib/numeria/visualesDatos.ts — nunca hardcodeados
// a mano en el JSON de contenido.

// Clase 1: valor posicional + suma/resta en columna con acarreo/préstamo.
export interface VisualNumeriaColumnas extends VisualBase {
  tipo: "numeria.columnas";
  operacion: "suma" | "resta";
  a: number;
  b: number;
}

// Clase 2: multiplicación en columna con productos parciales apilados.
export interface VisualNumeriaMultiplicacion extends VisualBase {
  tipo: "numeria.multiplicacion";
  a: number;
  b: number;
}

// Clase 3: división larga ("casita"), paso a paso.
export interface VisualNumeriaDivision extends VisualBase {
  tipo: "numeria.division";
  dividendo: number;
  divisor: number;
}

// Clase 4: MCM por listado de múltiplos, resaltando el primero en común.
export interface VisualNumeriaMcm extends VisualBase {
  tipo: "numeria.mcm";
  a: number;
  b: number;
}

// Clase 5: operaciones entre fracciones (barras fraccionarias).
export interface VisualNumeriaFraccion extends VisualBase {
  tipo: "numeria.fraccion";
  operacion: OperacionFraccion;
  num1: number;
  den1: number;
  num2: number;
  den2: number;
}

export type VisualNumeria =
  | VisualNumeriaColumnas
  | VisualNumeriaMultiplicacion
  | VisualNumeriaDivision
  | VisualNumeriaMcm
  | VisualNumeriaFraccion;
