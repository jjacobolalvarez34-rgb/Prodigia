import type { ComponenteVisual, RegistroVisuales } from "@/components/aprender/VisualLeccion";
import Triangulo from "./Triangulo";
import Resolver from "./Resolver";
import Circulo from "./Circulo";
import Cuadrantes from "./Cuadrantes";
import Onda from "./Onda";
import Ley from "./Ley";
import Ecuacion from "./Ecuacion";
import Identidad from "./Identidad";
import Mano from "./Mano";

// Registro de los visuales de Trigonometría para el dispatcher genérico
// (src/components/aprender/VisualLeccion.tsx): registro[tipo] = Componente.
// Mismo patrón que REGISTRO_VISUALES_QUIMIA/ANATOMIA/GEOGRAFIA. Para agregar
// un visual nuevo, ver el comentario de src/lib/trigonometria/visuales.ts.
export const REGISTRO_VISUALES_TRIGONOMETRIA: RegistroVisuales = {
  "trigonometria.triangulo": Triangulo as unknown as ComponenteVisual,
  "trigonometria.resolver": Resolver as unknown as ComponenteVisual,
  "trigonometria.circulo": Circulo as unknown as ComponenteVisual,
  "trigonometria.cuadrantes": Cuadrantes as unknown as ComponenteVisual,
  "trigonometria.onda": Onda as unknown as ComponenteVisual,
  "trigonometria.ley": Ley as unknown as ComponenteVisual,
  "trigonometria.ecuacion": Ecuacion as unknown as ComponenteVisual,
  "trigonometria.identidad": Identidad as unknown as ComponenteVisual,
  "trigonometria.mano": Mano as unknown as ComponenteVisual,
};
