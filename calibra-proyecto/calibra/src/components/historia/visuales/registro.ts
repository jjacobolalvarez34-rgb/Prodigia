import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Linea from "./Linea";
import Epocas from "./Epocas";
import Causas from "./Causas";
import Siglos from "./Siglos";
import Sincronia from "./Sincronia";
import Personaje from "./Personaje";

// Registro de los visuales de Historia para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
// Mismo patrón que REGISTRO_VISUALES_TRIGONOMETRIA. Para agregar un visual nuevo,
// ver el comentario de src/lib/historia/visuales.ts.
export const REGISTRO_VISUALES_HISTORIA: RegistroVisuales = {
  "historia.linea": Linea as unknown as ComponenteVisual,
  "historia.epocas": Epocas as unknown as ComponenteVisual,
  "historia.causas": Causas as unknown as ComponenteVisual,
  "historia.siglos": Siglos as unknown as ComponenteVisual,
  "historia.sincronia": Sincronia as unknown as ComponenteVisual,
  "historia.personaje": Personaje as unknown as ComponenteVisual,
};
