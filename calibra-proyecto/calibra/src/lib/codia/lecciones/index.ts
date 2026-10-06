import { CLASES } from "./clases";
import { TECNICAS } from "./tecnicas";
import type { LeccionCodia } from "./tipos";

// Orden continuo: técnicas (gratis) y luego clases (Pro).
export const LECCIONES_CODIA: LeccionCodia[] = [...TECNICAS, ...CLASES];
export { TECNICAS, CLASES };
// Codia por lenguaje (0255): Python, Java, JavaScript y TypeScript por separado.
export { TECNICAS_LENGUAJES, CLASES_LENGUAJES, LECCIONES_LENGUAJES, GRUPOS_LENGUAJES, GRUPO_DE_LECCION_LENGUAJE } from "./lenguajes";
export type { LeccionCodia, PreguntaLeccion } from "./tipos";
