"use client";

import { Component, Suspense, createElement, type ComponentType, type ReactNode } from "react";
import { esVisualLeccion, type VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";
import CuadrosAnimados from "./CuadrosAnimados";

// Cada componente recibe el visual completo en `visual` (con `tipo` y
// `despuesDePaso`) y se defiende de sus propios datos malos (devuelve null).
export type ComponenteVisual = ComponentType<{ visual: DatosVisual }>;
export type RegistroVisuales = Record<string, ComponenteVisual>;

// Registro base (primitivos genéricos). Cada mundo pasa el suyo en la prop
// `registro` (p. ej. REGISTRO_VISUALES_NAIPIA con los "naipia.*"):
//   registro[tipo] = Componente
export const REGISTRO_BASE: RegistroVisuales = {
  cuadros: CuadrosAnimados as unknown as ComponenteVisual,
};

// Un visual con datos rotos (o que tire una excepción al dibujar) se
// omite: la lección sigue funcionando sin él.
class LimiteVisual extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false };
  static getDerivedStateFromError() {
    return { fallo: true };
  }
  render() {
    return this.state.fallo ? null : this.props.children;
  }
}

// hasOwn: un `tipo` como "constructor" no debe resolver a Object.prototype.
function buscar(registro: RegistroVisuales | undefined, tipo: string): ComponenteVisual | undefined {
  return registro && Object.hasOwn(registro, tipo) ? registro[tipo] : undefined;
}

export function resolverComponente(tipo: string, registro?: RegistroVisuales): ComponenteVisual | undefined {
  return buscar(registro, tipo) ?? buscar(REGISTRO_BASE, tipo);
}

interface Props {
  visual: unknown;
  // Registro del mundo; se mezcla sobre REGISTRO_BASE.
  registro?: RegistroVisuales;
}

// Dispatcher genérico del formato de lección visual: busca el componente
// del `tipo` y lo dibuja; un tipo desconocido o un visual mal formado se
// ignora (no rompe). El Suspense sin fallback hace que una excepción
// durante el render del servidor se reintente en el cliente, donde la
// captura el límite de error.
export default function VisualLeccion({ visual, registro }: Props) {
  if (!esVisualLeccion(visual)) return null;
  const Componente = resolverComponente(visual.tipo, registro);
  if (!Componente) return null;
  return (
    <LimiteVisual>
      <Suspense fallback={null}>
        {createElement(Componente, { visual })}
      </Suspense>
    </LimiteVisual>
  );
}
