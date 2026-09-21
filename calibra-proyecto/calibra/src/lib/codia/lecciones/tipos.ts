import type { Lenguaje } from "../tipos";

// Contenido de Aprender de Codia (5 Técnicas gratis + 8 Clases Pro).
// Fuente ÚNICA del contenido: de acá sale la migración
// supabase/migrations/0193_codia_contenido.sql (lecciones/sql.ts) y
// lecciones/lecciones.test.ts EJECUTA de verdad cada fragmento de código
// (Python, Java, JavaScript, TypeScript): la salida mostrada en la
// lección es la salida real.
//
// Convención de los textos (en los .ts se escribe ~~~ y se convierte a
// ``` al generar, para no chocar con los template literals):
//   ~~~python ... ~~~     bloque de código (python | java | javascript | typescript)
//   ~~~python! ... ~~~    código que DEBE fallar (sintaxis/compilación/excepción)
//   ~~~salida ... ~~~     salida real del/los bloque(s) inmediatamente anteriores
//                         (para un bloque "!" es el tipo de error, o
//                         "error de compilación" en Java/TypeScript)
// Los fragmentos de Java son sentencias (van dentro de main); una función
// va como método `static` en la columna 0, y los `import` arriba.
// Nunca se usa el signo de dólar en el texto (MathText lo interpretaría).

export type VerificaPregunta =
  // La respuesta es la salida real del bloque de código de la pregunta.
  | { tipo: "salida" }
  // El bloque de la pregunta debe fallar con este error (aparece en la respuesta).
  | { tipo: "error"; error: string }
  // Cada opción es un fragmento en `lang`: solo la respuesta corre (o solo ella falla).
  | { tipo: "opciones"; lang: Lenguaje; respuestaFunciona: boolean };

export interface PreguntaLeccion {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
  verifica?: VerificaPregunta;
}

export interface LeccionCodia {
  slug: string;
  nombre: string;
  descripcion: string;
  orden: number;
  requierePro: boolean;
  pasos: string[];
  quiz: PreguntaLeccion[];
}

export function fences(s: string): string {
  return s.replace(/~~~/g, "```");
}
