import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Pentagrama from "./Pentagrama";
import Teclado from "./Teclado";
import Escala from "./Escala";
import Acorde from "./Acorde";
import Ritmo from "./Ritmo";
import Frecuencia from "./Frecuencia";

// Registro de los visuales de Melodía para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
// Mismo patrón que REGISTRO_VISUALES_ANATOMIA/GEOGRAFIA/QUIMIA.
export const REGISTRO_VISUALES_MELODIA: RegistroVisuales = {
  "melodia.pentagrama": Pentagrama as unknown as ComponenteVisual,
  "melodia.teclado": Teclado as unknown as ComponenteVisual,
  "melodia.escala": Escala as unknown as ComponenteVisual,
  "melodia.acorde": Acorde as unknown as ComponenteVisual,
  "melodia.ritmo": Ritmo as unknown as ComponenteVisual,
  "melodia.frecuencia": Frecuencia as unknown as ComponenteVisual,
};
