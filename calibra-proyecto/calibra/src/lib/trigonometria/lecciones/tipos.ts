import type { VisualCuadros } from "@/lib/aprender/visuales";
import type { GrupoTrigonometria } from "@/lib/trigonometria/bloques";
import type { VisualTrigonometria } from "@/lib/trigonometria/visuales";

// Visuales permitidos en una lección de Trigonometría: los propios
// ("trigonometria.*") y el primitivo genérico de cuadros animados.
export type VisualLeccionTrigonometria = VisualTrigonometria | VisualCuadros;

export interface PreguntaLeccionTrigonometria {
  pregunta: string;
  opciones: string[];
  // Siempre una de las `opciones` (lecciones.test.ts lo comprueba).
  respuesta: string;
  // Por qué falla el error de cada distractor y por qué la respuesta es correcta.
  explicacion: string;
}

// Grafo de dependencias del currículo (src/lib/trigonometria/lecciones/conceptos.ts):
// qué conceptos INTRODUCE cada lección y cuáles USA. lecciones.test.ts falla si
// una lección usa un concepto que ninguna lección anterior (ni ella misma)
// introduce y que no es un conocimiento previo del colegio. No se guarda en la
// base: es solo la estructura que hace comprobable el orden pedagógico.
export interface ConceptosLeccion {
  introduce: string[];
  usa: string[];
}

// Una Técnica de Trigonometría: atajo corto (3-5 pasos) + visual + quiz de 4
// preguntas, gratis (`requierePro: false`). Vive en un bloque del currículo;
// dentro de cada bloque las Técnicas son estrictamente lineales por `orden` y
// cada bloque tiene su propio puntero "activo" independiente
// (src/lib/trigonometria/path.ts).
export interface TecnicaTrigonometria {
  slug: string;
  grupo: GrupoTrigonometria;
  // 1..n dentro del bloque, correlativo y sin repetidos.
  orden: number;
  requierePro: false;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccionTrigonometria[];
  quiz: PreguntaLeccionTrigonometria[];
  conceptos: ConceptosLeccion;
  // true si la fila ya existía en la base (sembrada en 0108 y con quiz en
  // 0177): la migración generada la ACTUALIZA en vez de insertarla.
  existente?: boolean;
}

// Una Clase de Trigonometría: lección del curso (objetivo, intuición antes de la
// fórmula, ejemplo resuelto, errores comunes, visuales y quiz de 4 a 6
// preguntas). `requierePro: true`. Las Clases forman UN curso lineal en orden
// pedagógico (bloque en ORDEN_GRUPOS_TRIGONOMETRIA, después `orden`): la
// primera es preview gratis y el resto exige Pro. Ver
// src/lib/trigonometria/path.ts.
export interface ClaseTrigonometria {
  slug: string;
  grupo: GrupoTrigonometria;
  orden: number;
  requierePro: true;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccionTrigonometria[];
  quiz: PreguntaLeccionTrigonometria[];
  conceptos: ConceptosLeccion;
}
