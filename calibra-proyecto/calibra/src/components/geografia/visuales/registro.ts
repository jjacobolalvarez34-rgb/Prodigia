import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Mapa from "./Mapa";

// Registro de los visuales de Geografía para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
// Mismo patrón que REGISTRO_VISUALES_ENIGMIA/NAIPIA/NUMERIA.
export const REGISTRO_VISUALES_GEOGRAFIA: RegistroVisuales = {
  "geografia.mapa": Mapa as unknown as ComponenteVisual,
};
