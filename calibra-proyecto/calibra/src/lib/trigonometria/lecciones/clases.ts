import type { ClaseTrigonometria } from "./tipos";
import { CLASES_TRIGONOMETRIA_RAZONES } from "./clases-razones";
import { CLASES_TRIGONOMETRIA_CIRCULO } from "./clases-circulo";
import { CLASES_TRIGONOMETRIA_GRAFICAS } from "./clases-graficas";
import { CLASES_TRIGONOMETRIA_LEYES } from "./clases-leyes";
import { CLASES_TRIGONOMETRIA_IDENTIDADES } from "./clases-identidades";
import { CLASES_TRIGONOMETRIA_ECUACIONES } from "./clases-ecuaciones";

// Las Clases forman UN curso lineal, en orden pedagógico y acumulativo: primero
// las razones del triángulo rectángulo, después el círculo unitario (que
// generaliza las razones a cualquier ángulo), las gráficas, las leyes de seno y
// coseno, las identidades y por último las ecuaciones (que usan todo lo anterior).
// El arreglo YA está en orden de curso; lecciones.test.ts lo comprueba.
export const CLASES_TRIGONOMETRIA: ClaseTrigonometria[] = [
  ...CLASES_TRIGONOMETRIA_RAZONES,
  ...CLASES_TRIGONOMETRIA_CIRCULO,
  ...CLASES_TRIGONOMETRIA_GRAFICAS,
  ...CLASES_TRIGONOMETRIA_LEYES,
  ...CLASES_TRIGONOMETRIA_IDENTIDADES,
  ...CLASES_TRIGONOMETRIA_ECUACIONES,
];
