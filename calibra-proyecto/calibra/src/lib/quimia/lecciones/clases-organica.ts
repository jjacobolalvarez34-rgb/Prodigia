import type { ClaseQuimia } from "./tipos";

// Clases del grupo "organica" (química orgánica completa). VACÍO a
// propósito: lo llena la TANDA 2 del retrofit de Quimia. Para agregar una:
// sumar un objeto ClaseQuimia a este arreglo (grupo: "organica", orden
// correlativo desde 1, requierePro: true, con pasos, visuales y quiz de 4-6
// preguntas con explicación) y regenerar la migración de la tanda 2 (ver
// index.ts).
export const CLASES_QUIMIA_ORGANICA: ClaseQuimia[] = [];
