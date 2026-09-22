import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Columnas from "./Columnas";
import Multiplicacion from "./Multiplicacion";
import Division from "./Division";
import Mcm from "./Mcm";
import Fraccion from "./Fraccion";
import Recta from "./Recta";
import Potencia from "./Potencia";
import Balanza from "./Balanza";
import Figura from "./Figura";

// Registro de los visuales de Numeria para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
export const REGISTRO_VISUALES_NUMERIA: RegistroVisuales = {
  "numeria.columnas": Columnas as unknown as ComponenteVisual,
  "numeria.multiplicacion": Multiplicacion as unknown as ComponenteVisual,
  "numeria.division": Division as unknown as ComponenteVisual,
  "numeria.mcm": Mcm as unknown as ComponenteVisual,
  "numeria.fraccion": Fraccion as unknown as ComponenteVisual,
  "numeria.recta": Recta as unknown as ComponenteVisual,
  "numeria.potencia": Potencia as unknown as ComponenteVisual,
  "numeria.balanza": Balanza as unknown as ComponenteVisual,
  "numeria.figura": Figura as unknown as ComponenteVisual,
};
