// Registro de los mundos que la app juega con el sprint genérico. Numeria y
// Geografía tienen pantallas propias (teclado de fracciones, mapa), el resto vive acá.
import type { MundoSlug } from "~/tema";
import { ANATOMIA } from "./anatomia";
import { CALCULIA } from "./calculia";
import { CIRCUITIA } from "./circuitia";
import { CODIA } from "./codia";
import { ENIGMIA } from "./enigmia";
import { ESTADISTICA } from "./estadistica";
import { HISTORIA } from "./historia";
import { MELODIA } from "./melodia";
import { NAIPIA } from "./naipia";
import { QUIMIA } from "./quimia";
import { TRIGONOMETRIA } from "./trigonometria";
import type { MundoJugable } from "./tipos";

export const MUNDOS_JUGABLES: Partial<Record<MundoSlug, MundoJugable>> = {
  enigmia: ENIGMIA,
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
};

export function mundoJugable(slug: string | undefined): MundoJugable | null {
  return slug ? MUNDOS_JUGABLES[slug as MundoSlug] ?? null : null;
}

export function problemTypeDe(m: MundoJugable, modo: string): string {
  return m.problemType ? m.problemType(modo) : `${m.slug}_${modo}`;
}

export type { MundoJugable, PreguntaMundo, ModoMundo, Visual, Entrada } from "./tipos";
