import type { ClaseQuimia } from "./tipos";

// Clases del grupo "redox" (estados de oxidación completos, método redox con
// trucos mentales y balanceo). VACÍO a propósito: lo llena la TANDA 2 del
// retrofit de Quimia. Para agregar una: sumar un objeto ClaseQuimia a este
// arreglo (grupo: "redox", orden correlativo desde 1, requierePro: true, con
// pasos, visuales y quiz de 4-6 preguntas con explicación) y regenerar la
// migración de la tanda 2 (ver index.ts). Las Clases forman UN curso lineal
// (tabla, símbolos, fórmulas, nomenclatura, redox, orgánica), así que las de
// este grupo se desbloquean después de las de nomenclatura.
export const CLASES_QUIMIA_REDOX: ClaseQuimia[] = [];
