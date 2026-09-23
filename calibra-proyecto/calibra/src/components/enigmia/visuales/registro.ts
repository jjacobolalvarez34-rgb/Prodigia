import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Secuencia from "./Secuencia";
import Cadena from "./Cadena";
import Agrupacion from "./Agrupacion";
import Algoritmo from "./Algoritmo";

// Registro de los visuales de Enigmia para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
export const REGISTRO_VISUALES_ENIGMIA: RegistroVisuales = {
  "enigmia.secuencia": Secuencia as unknown as ComponenteVisual,
  "enigmia.cadena": Cadena as unknown as ComponenteVisual,
  "enigmia.agrupacion": Agrupacion as unknown as ComponenteVisual,
  "enigmia.algoritmo": Algoritmo as unknown as ComponenteVisual,
};
