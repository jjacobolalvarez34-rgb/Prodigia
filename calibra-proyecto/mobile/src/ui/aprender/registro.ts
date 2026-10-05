import type { ComponentType } from "react";
import CuadrosAnimados from "./CuadrosAnimados";
import * as Anatomia from "./anatomia/visuales";
import * as Calculia from "./calculia/visuales";
import * as Circuitia from "./circuitia/visuales";
import * as Codia from "./codia/visuales";
import * as Enigmia from "./enigmia/visuales";
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
  "enigmia.secuencia": c(Enigmia.Secuencia),
  "enigmia.agrupacion": c(Enigmia.Agrupacion),
  "enigmia.cadena": c(Enigmia.Cadena),
  "enigmia.eliminacion": c(Enigmia.Eliminacion),
  "enigmia.loci": c(Enigmia.Loci),
  "enigmia.algoritmo": c(Enigmia.Algoritmo),
  "calculia.tangente": c(Calculia.Tangente),
  "calculia.area": c(Calculia.Area),
  "calculia.serie": c(Calculia.Serie),
  "calculia.edo": c(Calculia.Edo),
  "codia.traza": c(Codia.Traza),
  "codia.comparar": c(Codia.Comparar),
  "codia.flujo": c(Codia.Flujo),
  "codia.crecimiento": c(Codia.Crecimiento),
  "circuitia.circuito": c(Circuitia.Circuito),
  "circuitia.resistenciaEquivalente": c(Circuitia.ResistenciaEquivalente),
  "circuitia.leyOhm": c(Circuitia.LeyOhm),
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
