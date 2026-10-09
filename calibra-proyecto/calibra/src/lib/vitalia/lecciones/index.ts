import { CLASES_VITALIA } from "./clases";
import { TECNICAS_VITALIA } from "./tecnicas";

export { TECNICAS_VITALIA, CLASES_VITALIA };
export const LECCIONES_VITALIA = [...TECNICAS_VITALIA, ...CLASES_VITALIA];
export { ORDEN_GRUPOS_VITALIA, NOMBRES_GRUPOS_VITALIA } from "./bloques";
export type { LeccionVitalia, GrupoVitalia, PreguntaLeccion } from "./tipos";
