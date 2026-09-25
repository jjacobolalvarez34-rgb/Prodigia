import type { VisualBase } from "@/lib/aprender/visuales";
import type { Func, Lenguaje, Prog } from "./tipos";

// Visuales propios de Codia (prefijo "codia."). `programa` es el mismo
// IR chico que arma la práctica (src/lib/codia/tipos.ts): JSON puro, sin
// funciones, así que viaja tal cual en `contenido.visuales` (jsonb). Los
// componentes (src/components/codia/visuales/) NUNCA reciben una salida,
// una tabla de variables ni un veredicto tipeados a mano: los calculan
// ejecutando de verdad `programa` con las funciones de visualesDatos.ts
// (mismo renderizador y mismo intérprete que la práctica).

// Ejecución paso a paso: línea resaltada + tabla de variables que
// cambia, en el lenguaje elegido.
export interface VisualCodiaTraza extends VisualBase {
  tipo: "codia.traza";
  programa: Prog;
  lenguaje: Lenguaje;
}

// El mismo programa lado a lado en los 4 lenguajes, con su salida (o
// error) real en cada uno.
export interface VisualCodiaComparar extends VisualBase {
  tipo: "codia.comparar";
  programa: Prog;
}

// Diagrama de flujo del primer condicional (cadena if / elif / else) o
// bucle (while / for) del programa: qué condición se evalúa, si dio
// verdadero o falso, qué rama corre y con qué valores.
export interface VisualCodiaFlujo extends VisualBase {
  tipo: "codia.flujo";
  programa: Prog;
  lenguaje: Lenguaje;
}

// Cuánto trabajo hace una función `contar(n)` cuando n crece: se ejecuta
// para cada n de `ns` y se muestra el conteo y el factor de crecimiento.
export interface SerieCrecimiento {
  nombre: string; // "Un bucle"
  etiqueta: string; // "O(n)"
  funcion: Func;
}

export interface VisualCodiaCrecimiento extends VisualBase {
  tipo: "codia.crecimiento";
  series: SerieCrecimiento[];
  ns: number[];
}

export type VisualCodia = VisualCodiaTraza | VisualCodiaComparar | VisualCodiaFlujo | VisualCodiaCrecimiento;

export const TIPOS_VISUAL_CODIA = ["codia.traza", "codia.comparar", "codia.flujo", "codia.crecimiento"] as const;
