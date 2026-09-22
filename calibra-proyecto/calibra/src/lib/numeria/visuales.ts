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

// Técnicas (2026-09-22): recta numérica (decimales), potencia/raíz
// (multiplicación repetida o cuadrícula de área), balanza (álgebra) y
// figura (geometría) — mismo criterio, props con datos crudos que cada
// componente recalcula con src/lib/numeria/visualesDatos.ts.

// Un punto marcado en la recta, con etiqueta opcional (admite $...$).
export interface MarcaRecta {
  valor: number;
  etiqueta?: string;
}

export interface VisualNumeriaRecta extends VisualBase {
  tipo: "numeria.recta";
  min: number;
  max: number;
  marcas: MarcaRecta[];
}

export interface VisualNumeriaPotencia extends VisualBase {
  tipo: "numeria.potencia";
  base: number;
  exponente: number;
  // "cadena": multiplicación repetida paso a paso (potencia).
  // "cuadricula": área de base×base (raíz cuadrada de un cuadrado perfecto).
  modo: "cadena" | "cuadricula";
}

export interface VisualNumeriaBalanza {
  tipo: "numeria.balanza";
  despuesDePaso?: number;
  titulo?: string;
  estatico?: boolean;
  coefX: number;
  constante: number;
  resultado: number;
  // "despejar": pasos de resta y división hasta llegar a x.
  // "verificar": sustituye x de vuelta y compara los dos lados.
  modo: "despejar" | "verificar";
}

export type VisualNumeriaFigura =
  | ({ tipo: "numeria.figura"; modo: "triangulo"; cateto1: number; cateto2: number } & VisualBase)
  | ({ tipo: "numeria.figura"; modo: "areaCompuesta"; anchoGrande: number; altoGrande: number; anchoRecorte: number; altoRecorte: number } & VisualBase)
  | ({ tipo: "numeria.figura"; modo: "circulo"; radio: number } & VisualBase)
  | ({ tipo: "numeria.figura"; modo: "angulos"; tipoAngulo: "complementario" | "suplementario"; conocido: number } & VisualBase);

export type VisualNumeria =
  | VisualNumeriaColumnas
  | VisualNumeriaMultiplicacion
  | VisualNumeriaDivision
  | VisualNumeriaMcm
  | VisualNumeriaFraccion
  | VisualNumeriaRecta
  | VisualNumeriaPotencia
  | VisualNumeriaBalanza
  | VisualNumeriaFigura;
