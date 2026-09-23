import type { TecnicaQuimia } from "./tipos";
import { TECNICAS_QUIMIA_TABLA } from "./tecnicas-tabla";
import { TECNICAS_QUIMIA_SIMBOLOS } from "./tecnicas-simbolos";
import { TECNICAS_QUIMIA_FORMULAS } from "./tecnicas-formulas";
import { TECNICAS_QUIMIA_NOMENCLATURA } from "./tecnicas-nomenclatura";
import { TECNICAS_QUIMIA_REDOX } from "./tecnicas-redox";
import { TECNICAS_QUIMIA_ORGANICA } from "./tecnicas-organica";

// Técnicas de la tanda 1 del retrofit de Quimia (grupos tabla, símbolos,
// fórmulas y nomenclatura): se siembran con la migración 0209.
export const TECNICAS_QUIMIA_TANDA1: TecnicaQuimia[] = [
  ...TECNICAS_QUIMIA_TABLA,
  ...TECNICAS_QUIMIA_SIMBOLOS,
  ...TECNICAS_QUIMIA_FORMULAS,
  ...TECNICAS_QUIMIA_NOMENCLATURA,
];

// Técnicas de la tanda 2 (redox y orgánica): migración propia de la tanda 2.
export const TECNICAS_QUIMIA_TANDA2: TecnicaQuimia[] = [...TECNICAS_QUIMIA_REDOX, ...TECNICAS_QUIMIA_ORGANICA];

// Todas las Técnicas de Quimia (fuente única del camino y de los tests).
export const TECNICAS_QUIMIA: TecnicaQuimia[] = [...TECNICAS_QUIMIA_TANDA1, ...TECNICAS_QUIMIA_TANDA2];
