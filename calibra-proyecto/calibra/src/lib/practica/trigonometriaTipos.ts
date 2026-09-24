import type { ModoTrigonometria } from "./trigonometriaEscala";

export type { ModoTrigonometria };

// Geometría de un triángulo para el diagrama (TrianguloSVG) — SIEMPRE los 3
// lados y los 3 ángulos reales (nunca solo los "dados" del enunciado), así el
// dibujo queda geométricamente correcto incluso cuando uno de esos valores es
// la incógnita. `ocultar*` es lo único que le dice al SVG qué etiqueta
// reemplazar por "?" (lados) o esconder (el valor del ángulo, que queda solo
// como letra de vértice) en vez de mostrar el número. Convención estándar:
// ladoA opuesto a anguloA, etc. En los rectángulos el ángulo recto está en C
// y se dibuja con los catetos horizontal y vertical.
export interface TrianguloDiagrama {
  ladoA: number;
  ladoB: number;
  ladoC: number;
  anguloA: number;
  anguloB: number;
  anguloC: number;
  // Compatibilidad: un solo lado oculto ("?").
  ocultar?: "ladoA" | "ladoB" | "ladoC";
  ocultarLados?: ("ladoA" | "ladoB" | "ladoC")[];
  // Lados que se dibujan SIN etiqueta (ni número ni "?"): datos que el enunciado no da.
  omitirLados?: ("ladoA" | "ladoB" | "ladoC")[];
  // Ángulos cuyo valor NO se muestra (solo la letra del vértice).
  ocultarAngulos?: ("A" | "B" | "C")[];
  marcarRectoEn?: "A" | "B" | "C";
}

interface ProblemaBase {
  enunciado: string;
  triangulo?: TrianguloDiagrama;
}

export interface ProblemaTrigonometriaNumero extends ProblemaBase {
  modo: "razones" | "leyes";
  entrada: "numero";
  respuesta: number;
  tolerancia: number;
}

export interface ProblemaTrigonometriaOpciones extends ProblemaBase {
  modo: "circulo" | "identidades";
  entrada: "opciones";
  opciones: string[];
  respuesta: string;
}

export type ProblemaTrigonometria = ProblemaTrigonometriaNumero | ProblemaTrigonometriaOpciones;
