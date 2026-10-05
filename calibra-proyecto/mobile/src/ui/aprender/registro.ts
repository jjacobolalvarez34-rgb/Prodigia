import type { ComponentType } from "react";
import CuadrosAnimados from "./CuadrosAnimados";
import * as Anatomia from "./anatomia/visuales";
import * as Geografia from "./geografia/visuales";
import * as Historia from "./historia/visuales";

// Registro de visuales de lecciones de la app: los MISMOS `tipo` que registran los
// `components/<mundo>/visuales/registro.ts` de la web (npm run paridad lo revisa).
// Cada componente recibe el visual completo en `visual` y se defiende de datos malos.
type ComponenteVisual = ComponentType<{ visual: any }>;
const c = (x: unknown) => x as ComponenteVisual;

export const REGISTRO_VISUALES: Record<string, ComponenteVisual> = {
  cuadros: c(CuadrosAnimados),
  "geografia.mapa": c(Geografia.Mapa),
  "anatomia.cuerpo": c(Anatomia.Cuerpo),
  "anatomia.esqueleto": c(Anatomia.Esqueleto),
  "anatomia.flujo": c(Anatomia.Flujo),
  "anatomia.grupos": c(Anatomia.Grupos),
  "historia.linea": c(Historia.Linea),
  "historia.epocas": c(Historia.Epocas),
  "historia.causas": c(Historia.Causas),
  "historia.siglos": c(Historia.Siglos),
  "historia.sincronia": c(Historia.Sincronia),
  "historia.personaje": c(Historia.Personaje),
};
