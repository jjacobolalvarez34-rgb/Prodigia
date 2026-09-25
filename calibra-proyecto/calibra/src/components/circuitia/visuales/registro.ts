import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Circuito from "./Circuito";
import ResistenciaEquivalente from "./ResistenciaEquivalente";
import LeyOhm from "./LeyOhm";

// Registro de los visuales de Circuitia (prefijo "circuitia."), mismo
// patrón que REGISTRO_VISUALES_NAIPIA / REGISTRO_VISUALES_TRIGONOMETRIA.
export const REGISTRO_VISUALES_CIRCUITIA: RegistroVisuales = {
  "circuitia.circuito": Circuito as unknown as ComponenteVisual,
  "circuitia.resistenciaEquivalente": ResistenciaEquivalente as unknown as ComponenteVisual,
  "circuitia.leyOhm": LeyOhm as unknown as ComponenteVisual,
};
