import { CLASES_DINAMIA } from "./clases";
import { TECNICAS_DINAMIA } from "./tecnicas";

export { TECNICAS_DINAMIA, CLASES_DINAMIA };
export const LECCIONES_DINAMIA = [...TECNICAS_DINAMIA, ...CLASES_DINAMIA];
export { ORDEN_GRUPOS_DINAMIA, NOMBRES_GRUPOS_DINAMIA } from "./bloques";
export type { LeccionDinamia, GrupoDinamia, PreguntaLeccion } from "./tipos";
