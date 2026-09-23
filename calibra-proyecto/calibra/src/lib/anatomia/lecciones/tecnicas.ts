import type { TecnicaAnatomia } from "./tipos";
import { TECNICAS_OSEO } from "./tecnicasOseo";
import { TECNICAS_MUSCULAR } from "./tecnicasMuscular";
import { TECNICAS_ORGANOS } from "./tecnicasOrganos";
import { TECNICAS_NERVIOSO } from "./tecnicasNervioso";

// Las 21 Técnicas de Anatomía (gratis), en orden de grupo. Las 5 históricas
// (0081_mundo_anatomia.sql) conservan su slug y se REESCRIBEN con un
// UPDATE en la migración; las otras 16 son INSERT nuevos.
export const TECNICAS_ANATOMIA: TecnicaAnatomia[] = [...TECNICAS_OSEO, ...TECNICAS_MUSCULAR, ...TECNICAS_ORGANOS, ...TECNICAS_NERVIOSO];

// Slugs sembrados por 0081_mundo_anatomia.sql (+ quiz de 0173): el
// generador de SQL los actualiza en vez de insertarlos.
export const SLUGS_TECNICAS_HISTORICAS = [
  "anatomia-craneo-por-zona",
  "anatomia-nombre-del-musculo",
  "anatomia-nervios-por-funcion",
  "anatomia-simple-a-compuesto",
  "anatomia-organos-por-cavidad",
];
