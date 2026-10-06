import { TECNICAS_CALCULIA as TECNICAS_BASE } from "./tecnicas";
import { CLASES_CALCULIA as CLASES_BASE } from "./clases";
import { CLASES_CURSO_CALCULIA, ORDEN_CURSO_CALCULIA, TECNICAS_CURSO_CALCULIA } from "./curso";
import type { LeccionCalculia } from "./tipos";

// Las 12 lecciones sembradas, tal como están en la base antes del curso
// (orden 1..5 Técnicas y 6..12 Clases). lecciones.test.ts las compara contra
// las migraciones que las sembraron y la 0216 se genera de ellas.
export const TECNICAS_CALCULIA_BASE: LeccionCalculia[] = TECNICAS_BASE;
export const CLASES_CALCULIA_BASE: LeccionCalculia[] = CLASES_BASE;
export const LECCIONES_CALCULIA_BASE: LeccionCalculia[] = [...TECNICAS_BASE, ...CLASES_BASE];

// El curso completo (2026-10-06, migración 0254): las 12 sembradas con su orden
// nuevo (ORDEN_CURSO_CALCULIA) y las lecciones nuevas, ordenadas por `orden`.
const conOrdenNuevo = (l: LeccionCalculia): LeccionCalculia => ({ ...l, orden: ORDEN_CURSO_CALCULIA[l.slug] ?? l.orden });
const porOrden = (a: LeccionCalculia, b: LeccionCalculia) => a.orden - b.orden;
export const TECNICAS_CALCULIA: LeccionCalculia[] = [...TECNICAS_BASE.map(conOrdenNuevo), ...TECNICAS_CURSO_CALCULIA].sort(porOrden);
export const CLASES_CALCULIA: LeccionCalculia[] = [...CLASES_BASE.map(conOrdenNuevo), ...CLASES_CURSO_CALCULIA].sort(porOrden);
export const LECCIONES_CALCULIA: LeccionCalculia[] = [...TECNICAS_CALCULIA, ...CLASES_CALCULIA];
export { TECNICAS_CURSO_CALCULIA, CLASES_CURSO_CALCULIA, ORDEN_CURSO_CALCULIA };
export type { LeccionCalculia, PreguntaLeccionCalculia, VisualLeccionCalculia } from "./tipos";
