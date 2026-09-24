import type { TecnicaTrigonometria } from "./tipos";
import { TECNICAS_TRIGONOMETRIA_RAZONES } from "./tecnicas-razones";
import { TECNICAS_TRIGONOMETRIA_CIRCULO } from "./tecnicas-circulo";
import { TECNICAS_TRIGONOMETRIA_GRAFICAS } from "./tecnicas-graficas";
import { TECNICAS_TRIGONOMETRIA_LEYES } from "./tecnicas-leyes";
import { TECNICAS_TRIGONOMETRIA_IDENTIDADES } from "./tecnicas-identidades";
import { TECNICAS_TRIGONOMETRIA_ECUACIONES } from "./tecnicas-ecuaciones";

// Todas las Técnicas de Trigonometría, en el orden de los 6 bloques del currículo
// (razones, círculo, gráficas, leyes, identidades y ecuaciones).
export const TECNICAS_TRIGONOMETRIA: TecnicaTrigonometria[] = [
  ...TECNICAS_TRIGONOMETRIA_RAZONES,
  ...TECNICAS_TRIGONOMETRIA_CIRCULO,
  ...TECNICAS_TRIGONOMETRIA_GRAFICAS,
  ...TECNICAS_TRIGONOMETRIA_LEYES,
  ...TECNICAS_TRIGONOMETRIA_IDENTIDADES,
  ...TECNICAS_TRIGONOMETRIA_ECUACIONES,
];
