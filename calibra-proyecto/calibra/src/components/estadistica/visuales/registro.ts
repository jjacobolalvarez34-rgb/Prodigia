import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import ArbolProbabilidad from "./ArbolProbabilidad";
import Desvios from "./Desvios";
import Dispersion from "./Dispersion";
import Frecuencias from "./Frecuencias";
import GraficoLeccion from "./GraficoLeccion";
import Normal from "./Normal";
import Ordenar from "./Ordenar";

// Registro de los visuales de Estadística para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
export const REGISTRO_VISUALES_ESTADISTICA: RegistroVisuales = {
  "estadistica.ordenar": Ordenar as unknown as ComponenteVisual,
  "estadistica.frecuencias": Frecuencias as unknown as ComponenteVisual,
  "estadistica.desvios": Desvios as unknown as ComponenteVisual,
  "estadistica.grafico": GraficoLeccion as unknown as ComponenteVisual,
  "estadistica.dispersion": Dispersion as unknown as ComponenteVisual,
  "estadistica.arbol": ArbolProbabilidad as unknown as ComponenteVisual,
  "estadistica.normal": Normal as unknown as ComponenteVisual,
};
