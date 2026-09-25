import { TECNICAS_CALCULIA } from "./tecnicas";
import { CLASES_CALCULIA } from "./clases";
import type { LeccionCalculia } from "./tipos";

// Orden de la base: Técnicas (gratis, orden 1..5) y luego Clases (Pro, 6..12).
export const LECCIONES_CALCULIA: LeccionCalculia[] = [...TECNICAS_CALCULIA, ...CLASES_CALCULIA];
export { TECNICAS_CALCULIA, CLASES_CALCULIA };
export type { LeccionCalculia, PreguntaLeccionCalculia, VisualLeccionCalculia } from "./tipos";
