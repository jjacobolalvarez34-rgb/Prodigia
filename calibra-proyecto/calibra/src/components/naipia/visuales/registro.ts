import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Cancelacion from "./Cancelacion";
import Comparar from "./Comparar";
import Conteo from "./Conteo";
import MazoCompleto from "./MazoCompleto";
import Valores from "./Valores";
import Verdadero from "./Verdadero";

// Registro de los visuales de Naipia para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
export const REGISTRO_VISUALES_NAIPIA: RegistroVisuales = {
  "naipia.valores": Valores as unknown as ComponenteVisual,
  "naipia.conteo": Conteo as unknown as ComponenteVisual,
  "naipia.cancelacion": Cancelacion as unknown as ComponenteVisual,
  "naipia.verdadero": Verdadero as unknown as ComponenteVisual,
  "naipia.mazo": MazoCompleto as unknown as ComponenteVisual,
  "naipia.comparar": Comparar as unknown as ComponenteVisual,
};
