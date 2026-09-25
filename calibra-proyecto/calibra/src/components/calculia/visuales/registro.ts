import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Tangente from "./Tangente";
import Area from "./Area";
import Serie from "./Serie";
import Edo from "./Edo";

// Registro de los visuales de Calculia para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
export const REGISTRO_VISUALES_CALCULIA: RegistroVisuales = {
  "calculia.tangente": Tangente as unknown as ComponenteVisual,
  "calculia.area": Area as unknown as ComponenteVisual,
  "calculia.serie": Serie as unknown as ComponenteVisual,
  "calculia.edo": Edo as unknown as ComponenteVisual,
};
