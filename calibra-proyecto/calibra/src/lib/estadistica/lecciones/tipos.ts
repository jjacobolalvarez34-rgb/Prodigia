import type { VisualCuadros } from "@/lib/aprender/visuales";
import type { VisualEstadistica } from "@/lib/estadistica/visuales";

// Visuales permitidos en una lección de Estadística: los propios
// ("estadistica.*") y el primitivo genérico de cuadros animados.
export type VisualLeccionEstadistica = VisualEstadistica | VisualCuadros;

export interface PreguntaLeccionEstadistica {
  pregunta: string;
  opciones: string[];
  // Siempre una de las `opciones` (lecciones.test.ts lo comprueba).
  respuesta: string;
  // Por qué falla el error de cada distractor y por qué la respuesta es correcta.
  explicacion: string;
}

interface LeccionEstadisticaBase {
  slug: string;
  // Orden global de techniques.orden (1-5 Técnicas, 6-13 Clases), el sembrado
  // en 0191: la migración de visuales NO lo cambia.
  orden: number;
  nombre: string;
  descripcion: string;
  // Texto de la lección (admite $...$). Es el sembrado en 0191, salvo el
  // voseo corregido.
  pasos: string[];
  // Al menos uno por lección (lecciones.test.ts). Cada visual se ubica debajo
  // del paso `despuesDePaso` (base 0).
  visuales: VisualLeccionEstadistica[];
}

// Una Técnica de Estadística: atajo corto, gratis (`requierePro: false`), sin quiz.
export interface TecnicaEstadistica extends LeccionEstadisticaBase {
  requierePro: false;
}

// Una Clase de Estadística: lección del curso con ejemplo resuelto y quiz de
// 3 preguntas (`requierePro: true`); la primera es preview gratis. Desde el
// commit que agrega los visuales las Clases se desbloquean por tema
// (src/lib/estadistica/path.ts), no como un curso lineal único.
export interface ClaseEstadistica extends LeccionEstadisticaBase {
  requierePro: true;
  quiz: PreguntaLeccionEstadistica[];
}
