import type { ClaseAnatomia } from "./tipos";
import { CLASES_OSEO } from "./clasesOseo";
import { CLASES_MUSCULAR } from "./clasesMuscular";
import { CLASES_ORGANOS } from "./clasesOrganos";
import { CLASES_NERVIOSO } from "./clasesNervioso";

// Las 22 Clases de Anatomía (Pro): 6 óseo + 5 muscular + 5 órganos + 6
// nervioso. Cada sistema es un curso independiente (ver
// src/lib/anatomia/path.ts); la primera Clase de todas (posición
// anatómica y planos) es preview gratis.
export const CLASES_ANATOMIA: ClaseAnatomia[] = [...CLASES_OSEO, ...CLASES_MUSCULAR, ...CLASES_ORGANOS, ...CLASES_NERVIOSO];
