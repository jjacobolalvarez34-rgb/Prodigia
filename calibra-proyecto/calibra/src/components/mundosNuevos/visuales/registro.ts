import type { RegistroVisuales } from "@/components/aprender/VisualLeccion";
import type { SlugMundoNuevo } from "@/lib/mundosNuevos/config";

// Animaciones propias de las lecciones de Dinamia ("dinamia.*") y Vitalia
// ("vitalia.*"). Cada lección las nombra en `contenido.visuales[].tipo`.
export const REGISTRO_VISUALES_MUNDO_NUEVO: Record<SlugMundoNuevo, RegistroVisuales> = {
  dinamia: {},
  vitalia: {},
};
