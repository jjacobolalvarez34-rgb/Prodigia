import type { VisualCuadros } from "@/lib/aprender/visuales";
import type { GrupoQuimia } from "@/lib/quimia/grupos";
import type { VisualQuimia } from "@/lib/quimia/visuales";

// Visuales permitidos en una lección de Quimia: los propios ("quimia.*") y
// el primitivo genérico de cuadros animados.
export type VisualLeccionQuimia = VisualQuimia | VisualCuadros;

export interface PreguntaLeccionQuimia {
  pregunta: string;
  opciones: string[];
  // Siempre una de las `opciones` (lecciones.test.ts lo comprueba).
  respuesta: string;
  explicacion: string;
}

// Una Técnica de Quimia: atajo corto (3-5 pasos) + visual + quiz, gratis
// (`requierePro: false`). Vive en el grupo temático `grupo`; dentro de cada
// grupo las Técnicas son estrictamente lineales por `orden` y cada grupo
// tiene su propio puntero "activo" independiente (src/lib/quimia/path.ts).
export interface TecnicaQuimia {
  slug: string;
  grupo: GrupoQuimia;
  // 1..n dentro del grupo, correlativo y sin repetidos.
  orden: number;
  requierePro: false;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccionQuimia[];
  quiz: PreguntaLeccionQuimia[];
  // true si la fila ya existía en la base (sembrada en 0056 y con quiz en
  // 0175): la migración generada la ACTUALIZA en vez de insertarla.
  existente?: boolean;
}

// Una Clase de Quimia: lección del curso (explicación desarrollada, ejemplos
// resueltos, visuales y quiz de 4-6 preguntas). `requierePro: true`. Las
// Clases forman UN curso lineal en orden de curso (grupo en
// ORDEN_GRUPOS_QUIMIA, después `orden`): la primera es preview gratis y el
// resto exige Pro. Ver src/lib/quimia/path.ts.
export interface ClaseQuimia {
  slug: string;
  grupo: GrupoQuimia;
  orden: number;
  requierePro: true;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccionQuimia[];
  quiz: PreguntaLeccionQuimia[];
}
