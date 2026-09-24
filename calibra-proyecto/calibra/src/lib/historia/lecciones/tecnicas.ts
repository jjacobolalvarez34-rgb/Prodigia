import type { TecnicaHistoria } from "./tipos";
import { normalizarTextos } from "./ayudas";
import { TECNICAS_HISTORIA_PREHISTORIA } from "./tecnicas-prehistoria";
import { TECNICAS_HISTORIA_ANTIGUEDAD } from "./tecnicas-antiguedad";
import { TECNICAS_HISTORIA_EDAD_MEDIA } from "./tecnicas-edad-media";
import { TECNICAS_HISTORIA_EDAD_MODERNA } from "./tecnicas-edad-moderna";
import { TECNICAS_HISTORIA_CONTEMPORANEA } from "./tecnicas-contemporanea";

// Todas las Técnicas de Historia, en el orden de las 5 épocas (Prehistoria,
// Antigüedad, Edad Media, Edad Moderna y Edad Contemporánea).
const TECNICAS_HISTORIA_CRUDAS: TecnicaHistoria[] = [
  ...TECNICAS_HISTORIA_PREHISTORIA,
  ...TECNICAS_HISTORIA_ANTIGUEDAD,
  ...TECNICAS_HISTORIA_EDAD_MEDIA,
  ...TECNICAS_HISTORIA_EDAD_MODERNA,
  ...TECNICAS_HISTORIA_CONTEMPORANEA,
];

// Los textos pasan por normalizarTextos (un año que cierra la frase no deja «a. C..»).
export const TECNICAS_HISTORIA: TecnicaHistoria[] = normalizarTextos(TECNICAS_HISTORIA_CRUDAS);
