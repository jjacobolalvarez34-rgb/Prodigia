import type { TecnicaMelodia } from "./tipos";
import { TECNICAS_FUNDAMENTOS } from "./fundamentos";
import { TECNICAS_LECTURA } from "./lectura";
import { TECNICAS_ALTERACIONES } from "./alteraciones";
import { TECNICAS_ESCALAS } from "./escalas";
import { TECNICAS_ACORDES } from "./acordes";
import { TECNICAS_OIDO } from "./oido";

// Las 18 Técnicas de Melodía (gratis), en orden de grupo (el de los modos de
// práctica). Las 5 históricas (0089_mundo_melodia.sql, con quiz en 0174)
// conservan su slug y se REESCRIBEN con un UPDATE en la migración; las otras
// 13 son INSERT nuevos.
export const TECNICAS_MELODIA: TecnicaMelodia[] = [
  ...TECNICAS_FUNDAMENTOS,
  ...TECNICAS_LECTURA,
  ...TECNICAS_ALTERACIONES,
  ...TECNICAS_ESCALAS,
  ...TECNICAS_ACORDES,
  ...TECNICAS_OIDO,
];

// Slugs sembrados por 0089_mundo_melodia.sql (+ quiz de 0174): el generador
// de SQL los actualiza en vez de insertarlos.
export const SLUGS_TECNICAS_HISTORICAS = [
  "melodia-lineas-y-espacios",
  "melodia-truco-lineas-espacios",
  "melodia-triada-fundamental-3-5",
  "melodia-de-triada-a-septima",
  "melodia-sostenidos-bemoles",
];
