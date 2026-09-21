import type { Lenguaje } from "./tipos";

export type ModoCodia = "sintaxis" | "salida" | "error" | "estructuras";

export type ClaseComplejidad = "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n²)" | "O(n³)";

export type MutacionError =
  | "sintaxis"
  | "nombre"
  | "indice"
  | "divcero"
  | "tipo"
  | "igualdad"
  | "logica";

// Cómo se verifica el problema ejecutándolo de verdad (lo usa
// codia.test.ts; la app no lo lee).
export type Verificacion =
  | { tipo: "salida"; ejecutable: string; stdout: string }
  | { tipo: "complejidad"; ejecutable: string; stdout: string; clase: ClaseComplejidad; ns: number[] }
  | {
      // Cada opción se sustituye en `plantilla` (marca «») y se ejecuta:
      // solo la correcta debe correr sin error e imprimir `stdout`.
      tipo: "hueco";
      plantilla: string;
      opciones: string[];
      correcta: string;
      stdout: string;
    }
  | {
      tipo: "error";
      forma: "consecuencia" | "linea" | "logica";
      mutacion: MutacionError;
      ejecutable: string; // programa con el defecto
      ejecutableOk: string; // programa corregido
      stdoutOk: string; // salida real esperada del corregido
      // Salida que el intérprete predice del programa con defecto (solo
      // para los que compilan y corren; para "logica" es la salida errónea).
      stdoutMal: string | null;
      // Línea del ejecutable donde debe reportarse el error (null: no aplica).
      lineaEjecutable: number | null;
      lineaPantalla: number | null;
    };

export interface ProblemaCodia {
  modo: ModoCodia;
  entrada: "opciones";
  lenguaje: Lenguaje;
  enunciado: string;
  // Fragmento de código a mostrar (puede ser "" en preguntas sin código).
  codigo: string;
  opciones: string[];
  respuesta: string;
  verificacion: Verificacion;
}

// Alias con el mismo espíritu que ProblemaCalculia (por si se lo usa genérico).
export type ProblemaCodiaOpciones = ProblemaCodia;
