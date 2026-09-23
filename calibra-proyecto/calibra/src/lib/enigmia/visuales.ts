import type { VisualBase } from "@/lib/aprender/visuales";
import type { PasoAlgoritmoEntrada } from "./visualesDatos";

// Visuales propios de Enigmia (prefijo "enigmia."), pedido explícito del
// usuario: "revisa que esté de acuerdo a paridad, agregale animaciones a
// las lecciones, y agregale Clases" (docs/PARIDAD_MUNDOS.md filas 22/23).
// Mismo criterio que Numeria/Naipia: cada componente solo dibuja lo que ya
// calculó una función pura de src/lib/enigmia/visualesDatos.ts — nunca
// hardcodeado a mano en el JSON de contenido.

// Clase "Secuencias": diferencia constante (aritmética), razón constante
// (geométrica), o un patrón no numérico simple (letras, mismo criterio
// aritmético aplicado al código de la letra).
export type VisualEnigmiaSecuencia =
  | ({ tipo: "enigmia.secuencia"; modo: "aritmetica" | "geometrica"; primerTermino: number; paso: number; cantidad: number } & VisualBase)
  | ({ tipo: "enigmia.secuencia"; modo: "letras"; primeraLetra: string; paso: number; cantidad: number } & VisualBase);

// Cadena lógica tipo flowchart (A → B → C): silogismos simples y
// "si...entonces" / contrapositiva. 2 a 4 nodos, revelados uno a uno.
export interface VisualEnigmiaCadena extends VisualBase {
  tipo: "enigmia.cadena";
  nodos: string[];
  // true = el último nodo se resalta como "conclusión" (silogismos).
  concluir?: boolean;
}

// Chunking: una secuencia suelta de elementos que se reagrupa en bloques.
export interface VisualEnigmiaAgrupacion extends VisualBase {
  tipo: "enigmia.agrupacion";
  items: string[];
  tamanos: number[];
}

// Traza de un algoritmo simple: pasos numerados que se "ejecutan" uno a la
// vez, con una variable que cambia en pantalla (incluye condicionales).
export interface VisualEnigmiaAlgoritmo extends VisualBase {
  tipo: "enigmia.algoritmo";
  inicial: number;
  pasos: PasoAlgoritmoEntrada[];
  // Nombre de la variable a mostrar (por defecto "x").
  variable?: string;
}

// Eliminación por descarte (Deducción): candidatos que se van descartando
// uno a uno por un motivo, hasta que queda uno solo — la Técnica rápida
// "eliminacion-por-descarte" y la Clase "deduccion-por-eliminacion"
// (2026-09-22, expansión de contenido) comparten este primitivo.
export interface VisualEnigmiaEliminacion extends VisualBase {
  tipo: "enigmia.eliminacion";
  candidatos: string[];
  descartes: { candidato: string; motivo: string }[];
}

// Método de loci (Memoria): cada elemento a memorizar asociado a un lugar
// de un recorrido conocido, revelado un par a la vez.
export interface VisualEnigmiaLoci extends VisualBase {
  tipo: "enigmia.loci";
  lugares: string[];
  items: string[];
}

export type VisualEnigmia =
  | VisualEnigmiaSecuencia
  | VisualEnigmiaCadena
  | VisualEnigmiaAgrupacion
  | VisualEnigmiaAlgoritmo
  | VisualEnigmiaEliminacion
  | VisualEnigmiaLoci;
