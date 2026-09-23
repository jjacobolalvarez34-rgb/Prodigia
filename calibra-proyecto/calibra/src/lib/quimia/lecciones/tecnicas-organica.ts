import type { TecnicaQuimia } from "./tipos";

// Técnicas del grupo "organica" (química orgánica). VACÍO a propósito: lo
// llena la TANDA 2 del retrofit de Quimia. Para agregar una: sumar un
// objeto TecnicaQuimia a este arreglo (grupo: "organica", orden correlativo
// desde 1, requierePro: false, con pasos, visuales y quiz) y regenerar la
// migración de la tanda 2 (ver index.ts).
export const TECNICAS_QUIMIA_ORGANICA: TecnicaQuimia[] = [];
