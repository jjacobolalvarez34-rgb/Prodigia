import type { ClaseQuimia } from "./tipos";
import { CLASES_QUIMIA_TABLA } from "./clases-tabla";
import { CLASES_QUIMIA_SIMBOLOS } from "./clases-simbolos";
import { CLASES_QUIMIA_FORMULAS } from "./clases-formulas";
import { CLASES_QUIMIA_NOMENCLATURA } from "./clases-nomenclatura";
import { CLASES_QUIMIA_REDOX } from "./clases-redox";
import { CLASES_QUIMIA_ORGANICA } from "./clases-organica";

// Clases de la tanda 1 del retrofit de Quimia (grupos tabla, símbolos,
// fórmulas y nomenclatura): se siembran con la migración 0209. El ORDEN del
// arreglo es el orden de curso (el mismo que ORDEN_GRUPOS_QUIMIA).
export const CLASES_QUIMIA_TANDA1: ClaseQuimia[] = [
  ...CLASES_QUIMIA_TABLA,
  ...CLASES_QUIMIA_SIMBOLOS,
  ...CLASES_QUIMIA_FORMULAS,
  ...CLASES_QUIMIA_NOMENCLATURA,
];

// Clases de la tanda 2 (redox y orgánica): migración propia de la tanda 2.
export const CLASES_QUIMIA_TANDA2: ClaseQuimia[] = [...CLASES_QUIMIA_REDOX, ...CLASES_QUIMIA_ORGANICA];

// Todas las Clases de Quimia (fuente única del camino y de los tests).
export const CLASES_QUIMIA: ClaseQuimia[] = [...CLASES_QUIMIA_TANDA1, ...CLASES_QUIMIA_TANDA2];
