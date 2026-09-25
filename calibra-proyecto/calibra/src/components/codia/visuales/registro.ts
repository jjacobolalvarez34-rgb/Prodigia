import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Comparar from "./Comparar";
import Crecimiento from "./Crecimiento";
import Flujo from "./Flujo";
import Traza from "./Traza";

// Registro de los visuales de Codia para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
export const REGISTRO_VISUALES_CODIA: RegistroVisuales = {
  "codia.traza": Traza as unknown as ComponenteVisual,
  "codia.comparar": Comparar as unknown as ComponenteVisual,
  "codia.flujo": Flujo as unknown as ComponenteVisual,
  "codia.crecimiento": Crecimiento as unknown as ComponenteVisual,
};
