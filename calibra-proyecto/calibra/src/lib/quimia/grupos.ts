// Grupos ("temas de curso") de Aprender en Quimia. Se separaron de path.ts
// para que el contenido tipado (src/lib/quimia/lecciones/) y el cargador del
// camino (path.ts) puedan importarlos sin ciclos.
//
// Orden de curso: tabla, símbolos, fórmulas, nomenclatura, redox, orgánica.
// Cada grupo se corresponde con un bloque temático del curso:
//   tabla         átomo, tabla periódica, configuración, propiedades periódicas
//   simbolos      leer un elemento, símbolos y nombres
//   formulas      enlaces, fórmulas, masa molar, número de oxidación y cruce
//   nomenclatura  nombrar y escribir compuestos inorgánicos
//   redox         estados de oxidación completos, método redox y balanceo
//   organica      química orgánica
// "redox" y "organica" los llenó la tanda 2 del retrofit (ver
// docs/PARIDAD_MUNDOS.md); un grupo sin lecciones NO aparece en el sidebar
// de Aprender, así que estos aparecen solos al tener contenido.
export type GrupoQuimia = "tabla" | "simbolos" | "formulas" | "nomenclatura" | "redox" | "organica";

export const ORDEN_GRUPOS_QUIMIA: GrupoQuimia[] = ["tabla", "simbolos", "formulas", "nomenclatura", "redox", "organica"];

export function esGrupoQuimia(valor: unknown): valor is GrupoQuimia {
  return typeof valor === "string" && (ORDEN_GRUPOS_QUIMIA as string[]).includes(valor);
}
