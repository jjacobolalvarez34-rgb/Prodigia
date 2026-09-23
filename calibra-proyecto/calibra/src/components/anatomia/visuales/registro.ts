import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Esqueleto from "./Esqueleto";
import Cuerpo from "./Cuerpo";
import Grupos from "./Grupos";
import Flujo from "./Flujo";

// Registro de los visuales de Anatomía para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
// Mismo patrón que REGISTRO_VISUALES_GEOGRAFIA/ENIGMIA/NAIPIA/NUMERIA.
export const REGISTRO_VISUALES_ANATOMIA: RegistroVisuales = {
  "anatomia.esqueleto": Esqueleto as unknown as ComponenteVisual,
  "anatomia.cuerpo": Cuerpo as unknown as ComponenteVisual,
  "anatomia.grupos": Grupos as unknown as ComponenteVisual,
  "anatomia.flujo": Flujo as unknown as ComponenteVisual,
};
