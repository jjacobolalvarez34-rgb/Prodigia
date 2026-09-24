import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import TablaPeriodica from "./TablaPeriodica";
import FichaElemento from "./FichaElemento";
import Enlace from "./Enlace";
import Cruce from "./Cruce";
import Cuadro from "./Cuadro";
import Orbitales from "./Orbitales";
import Redox from "./Redox";
import Oxidacion from "./Oxidacion";
import Balanceo from "./Balanceo";
import Pila from "./Pila";
import Cadena from "./Cadena";
import Grupos from "./Grupos";
import Isomeria from "./Isomeria";
import Hibridacion from "./Hibridacion";

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
  // Tanda 2: redox y orgánica.
  "quimia.redox": Redox as unknown as ComponenteVisual,
  "quimia.oxidacion": Oxidacion as unknown as ComponenteVisual,
  "quimia.balanceo": Balanceo as unknown as ComponenteVisual,
  "quimia.pila": Pila as unknown as ComponenteVisual,
  "quimia.cadena": Cadena as unknown as ComponenteVisual,
  "quimia.grupos": Grupos as unknown as ComponenteVisual,
  "quimia.isomeria": Isomeria as unknown as ComponenteVisual,
  "quimia.hibridacion": Hibridacion as unknown as ComponenteVisual,
};
