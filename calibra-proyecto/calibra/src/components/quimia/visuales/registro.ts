import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import TablaPeriodica from "./TablaPeriodica";
import FichaElemento from "./FichaElemento";
import Enlace from "./Enlace";
import Cruce from "./Cruce";
import Cuadro from "./Cuadro";
import Orbitales from "./Orbitales";

// Registro de los visuales de Quimia para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
// Mismo patrón que REGISTRO_VISUALES_GEOGRAFIA/ENIGMIA/NAIPIA/NUMERIA.
// Para agregar un visual nuevo, ver el comentario de src/lib/quimia/visuales.ts.
export const REGISTRO_VISUALES_QUIMIA: RegistroVisuales = {
  "quimia.tabla": TablaPeriodica as unknown as ComponenteVisual,
  "quimia.elemento": FichaElemento as unknown as ComponenteVisual,
  "quimia.enlace": Enlace as unknown as ComponenteVisual,
  "quimia.cruce": Cruce as unknown as ComponenteVisual,
  "quimia.cuadro": Cuadro as unknown as ComponenteVisual,
  "quimia.orbitales": Orbitales as unknown as ComponenteVisual,
};
