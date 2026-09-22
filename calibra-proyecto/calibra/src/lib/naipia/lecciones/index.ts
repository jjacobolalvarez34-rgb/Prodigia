import { CLASES } from "./clases";
import { TECNICAS } from "./tecnicas";
import type { LeccionNaipia } from "./tipos";

// Orden continuo: técnicas (gratis) y luego clases (Pro).
export const LECCIONES_NAIPIA: LeccionNaipia[] = [...TECNICAS, ...CLASES];
export { TECNICAS, CLASES };
export type { LeccionNaipia, PreguntaLeccion } from "./tipos";
