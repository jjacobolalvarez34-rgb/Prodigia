// Registro de los adaptadores compartidos (web y app). Numeria y Geografía no están:
// tienen entradas propias (fracciones, mapa) y cada plataforma las maneja aparte.
import { ANATOMIA } from "./anatomia";
import { CALCULIA } from "./calculia";
import { CIRCUITIA } from "./circuitia";
import { CODIA } from "./codia";
import { DINAMIA } from "./dinamia";
import { ENIGMIA_BASE } from "./enigmia";
import { ESTADISTICA } from "./estadistica";
import { HISTORIA } from "./historia";
import { MELODIA } from "./melodia";
import { NAIPIA } from "./naipia";
import { QUIMIA } from "./quimia";
import { TRIGONOMETRIA } from "./trigonometria";
import { VITALIA } from "./vitalia";
import type { MundoJugable, MundoSlug } from "./tipos";

export const ADAPTADORES: Partial<Record<MundoSlug, MundoJugable>> = {
  enigmia: ENIGMIA_BASE,
  quimia: QUIMIA,
  anatomia: ANATOMIA,
  melodia: MELODIA,
  trigonometria: TRIGONOMETRIA,
  historia: HISTORIA,
  calculia: CALCULIA,
  circuitia: CIRCUITIA,
  estadistica: ESTADISTICA,
  naipia: NAIPIA,
  codia: CODIA,
  dinamia: DINAMIA,
  vitalia: VITALIA,
};

export { ANATOMIA, CALCULIA, CIRCUITIA, CODIA, DINAMIA, ENIGMIA_BASE, ESTADISTICA, HISTORIA, MELODIA, NAIPIA, QUIMIA, TRIGONOMETRIA, VITALIA };
export { CATEGORIAS_ENIGMIA } from "./enigmia";
export type { MundoJugable, PreguntaMundo, ModoMundo, Visual, Entrada, Memoria, CartaVisual, MundoSlug, ResultadoIntento } from "./tipos";
