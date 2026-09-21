import { CLASES } from "./clases";
import { TECNICAS } from "./tecnicas";
import type { LeccionCodia } from "./tipos";

// Orden continuo: técnicas (gratis) y luego clases (Pro).
export const LECCIONES_CODIA: LeccionCodia[] = [...TECNICAS, ...CLASES];
export { TECNICAS, CLASES };
export type { LeccionCodia, PreguntaLeccion } from "./tipos";
