import type { ComponentType } from "react";
import CuadrosAnimados from "./CuadrosAnimados";

// Registro de visuales de lecciones de la app: los MISMOS `tipo` que registran los
// `components/<mundo>/visuales/registro.ts` de la web (npm run paridad lo revisa).
// Cada componente recibe el visual completo en `visual` y se defiende de datos malos.
type ComponenteVisual = ComponentType<{ visual: any }>;
const c = (x: unknown) => x as ComponenteVisual;

export const REGISTRO_VISUALES: Record<string, ComponenteVisual> = {
  cuadros: c(CuadrosAnimados),
};
