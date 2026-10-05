import { Component, createElement, type ReactNode } from "react";
import { esVisualLeccion } from "@/lib/aprender/visuales";
import { REGISTRO_VISUALES } from "./registro";

// Dibuja un visual de lección según su `tipo` (VisualLeccion.tsx de la web). Un tipo
// que la app no conoce, o un visual con datos rotos, se omite: la lección sigue.
class LimiteVisual extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false };
  static getDerivedStateFromError() {
    return { fallo: true };
  }
  render() {
    return this.state.fallo ? null : this.props.children;
  }
}

export default function VisualLeccion({ visual }: { visual: unknown }) {
  if (!esVisualLeccion(visual)) return null;
  const Componente = Object.hasOwn(REGISTRO_VISUALES, visual.tipo) ? REGISTRO_VISUALES[visual.tipo] : undefined;
  if (!Componente) return null;
  return <LimiteVisual>{createElement(Componente, { visual })}</LimiteVisual>;
}
