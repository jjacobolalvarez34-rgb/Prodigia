import type { VisualCuadros } from "@/lib/aprender/visuales";
import type { GrupoHistoria } from "@/lib/historia/bloques";
import type { VisualHistoria } from "@/lib/historia/visuales";

// Visuales permitidos en una lección de Historia: los propios ("historia.*") y el
// primitivo genérico de cuadros animados.
export type VisualLeccionHistoria = VisualHistoria | VisualCuadros;

export interface PreguntaLeccionHistoria {
  pregunta: string;
  opciones: string[];
  // Siempre una de las `opciones` (lecciones.test.ts lo comprueba).
  respuesta: string;
  // Por qué falla el error de cada distractor y por qué la respuesta es correcta.
  explicacion: string;
}

// Grafo de dependencias del currículo (src/lib/historia/lecciones/conceptos.ts):
// qué conceptos INTRODUCE cada lección, cuáles USA y cuáles REPASA. Como las épocas
// se pueden empezar en cualquier orden (las Clases y las Técnicas se desbloquean
// por época, no como un curso lineal único), una lección solo puede USAR un
// concepto que se introdujo ANTES EN LA MISMA ÉPOCA o que ella misma REPASA: en
// ese caso lo re-explica brevemente en un paso «Contexto:» (Clases) o «Recuerda:»
// (Técnicas). lecciones.test.ts falla si una lección usa un concepto sin que se
// cumpla alguna de las tres cosas.
export interface ConceptosLeccion {
  introduce: string[];
  usa: string[];
  repasa?: string[];
}

// Lo que la lección ENSEÑA: ids de la tabla canónica (hechos.ts y personajes.ts).
// Los visuales se arman a partir de estos ids (nombre y año salen de la tabla, no
// se escriben dos veces) y lecciones.test.ts comprueba que cada id declarado se
// vea en algún visual y que ningún visual muestre un id no declarado. Es la base
// del test de cobertura: todo lo que la práctica puede preguntar se enseña.
export interface EnsenaLeccion {
  hechos: string[];
  personajes: string[];
}

interface LeccionBase {
  slug: string;
  // La época (bloque de Aprender).
  grupo: GrupoHistoria;
  // 1..n dentro de la época, correlativo y sin repetidos.
  orden: number;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccionHistoria[];
  quiz: PreguntaLeccionHistoria[];
  conceptos: ConceptosLeccion;
  ensena: EnsenaLeccion;
}

// Una Técnica de Historia: atajo corto (3-5 pasos) + visuales + quiz de 4
// preguntas, gratis. Dentro de cada época las Técnicas son estrictamente lineales
// por `orden` y cada época tiene su propio puntero «activo» independiente
// (src/lib/historia/path.ts).
export interface TecnicaHistoria extends LeccionBase {
  requierePro: false;
  // true si la fila ya existía en la base (sembrada en 0109 y con quiz en 0176):
  // la migración generada la ACTUALIZA en vez de insertarla.
  existente?: boolean;
}

// Una Clase de Historia: lección de una época (objetivo, contexto, línea de
// tiempo animada, personajes clave, causas y consecuencias, conexiones con otras
// épocas y regiones, errores comunes y quiz de 4 a 6 preguntas). `requierePro:
// true`. Las Clases se desbloquean POR ÉPOCA (la primera de cada época está abierta
// a la vez para un usuario Pro y el orden es lineal dentro de la época); la
// primera del mundo es preview gratis. Ver src/lib/historia/path.ts.
export interface ClaseHistoria extends LeccionBase {
  requierePro: true;
}

export type LeccionHistoria = TecnicaHistoria | ClaseHistoria;
