import { CLASES } from "./clases";
import { TECNICAS } from "./tecnicas";
import type { LeccionCircuitia } from "./tipos";

// Orden continuo: técnicas (gratis) y luego clases (Pro).
export const LECCIONES_CIRCUITIA: LeccionCircuitia[] = [...TECNICAS, ...CLASES];
export { TECNICAS, CLASES };
export type { LeccionCircuitia, PreguntaLeccion } from "./tipos";
