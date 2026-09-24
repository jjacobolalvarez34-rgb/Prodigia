import type { ClaseHistoria } from "./tipos";
import { normalizarTextos } from "./ayudas";
import { CLASES_HISTORIA_PREHISTORIA } from "./clases-prehistoria";
import { CLASES_HISTORIA_ANTIGUEDAD } from "./clases-antiguedad";
import { CLASES_HISTORIA_EDAD_MEDIA } from "./clases-edad-media";
import { CLASES_HISTORIA_EDAD_MODERNA } from "./clases-edad-moderna";
import { CLASES_HISTORIA_CONTEMPORANEA } from "./clases-contemporanea";

// Las Clases se desbloquean POR ÉPOCA (la primera de cada época está abierta a la vez
// para un usuario Pro y el orden es lineal dentro de la época), no como un curso
// lineal único: cada Clase repasa en un paso «Contexto:» lo que usa de otras épocas.
// El arreglo YA está en el orden cronológico recomendado (el del menú lateral);
// lecciones.test.ts lo comprueba. La primera Clase de todas, la de la Prehistoria,
// es preview gratis.
const CLASES_HISTORIA_CRUDAS: ClaseHistoria[] = [
  ...CLASES_HISTORIA_PREHISTORIA,
  ...CLASES_HISTORIA_ANTIGUEDAD,
  ...CLASES_HISTORIA_EDAD_MEDIA,
  ...CLASES_HISTORIA_EDAD_MODERNA,
  ...CLASES_HISTORIA_CONTEMPORANEA,
];

// Los textos pasan por normalizarTextos (un año que cierra la frase no deja «a. C..»).
export const CLASES_HISTORIA: ClaseHistoria[] = normalizarTextos(CLASES_HISTORIA_CRUDAS);
