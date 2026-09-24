import type { ClaseMelodia } from "./tipos";
import { CLASES_FUNDAMENTOS } from "./fundamentos";
import { CLASES_LECTURA } from "./lectura";
import { CLASES_ALTERACIONES } from "./alteraciones";
import { CLASES_ESCALAS } from "./escalas";
import { CLASES_ACORDES } from "./acordes";
import { CLASES_OIDO } from "./oido";

// Las 18 Clases de Melodía (Pro): 3 fundamentos + 3 lectura + 3 alteraciones
// + 3 escalas + 4 acordes + 2 oído. Cada grupo es un curso independiente
// (ver src/lib/melodia/path.ts); la primera Clase de todas (el sonido y la
// nota) es preview gratis.
export const CLASES_MELODIA: ClaseMelodia[] = [
  ...CLASES_FUNDAMENTOS,
  ...CLASES_LECTURA,
  ...CLASES_ALTERACIONES,
  ...CLASES_ESCALAS,
  ...CLASES_ACORDES,
  ...CLASES_OIDO,
];
