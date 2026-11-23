// Anclas del tutorial guiado (docs/PLAN_TUTORIAL_GUIADO.md): cada pantalla marca sus
// elementos importantes con useAncla("nombre") y el recorrido los mide para enfocarlos.
// Un mismo nombre puede estar en varias pantallas montadas a la vez (las pestañas no se
// desmontan): se usa la que está a la vista.
import { useEffect, useRef } from "react";
import type { View } from "react-native";

export type Rect = { x: number; y: number; w: number; h: number };
type Medidor = () => Promise<Rect | null>;

const anclas = new Map<string, Set<Medidor>>();

export function useAncla(nombre: string) {
  const ref = useRef<View>(null);
  useEffect(() => {
    const medir: Medidor = () =>
      new Promise((resolver) => {
        const v = ref.current;
        if (!v) return resolver(null);
        v.measureInWindow((x, y, w, h) => resolver(w > 0 && h > 0 ? { x, y, w, h } : null));
      });
    const set = anclas.get(nombre) ?? new Set();
    set.add(medir);
    anclas.set(nombre, set);
    return () => {
      set.delete(medir);
    };
  }, [nombre]);
  return ref;
}

// El rectángulo del ancla si está entera dentro de la zona visible.
export async function medirAncla(nombre: string, zona: { arriba: number; abajo: number; ancho: number }): Promise<Rect | null> {
  for (const medir of anclas.get(nombre) ?? []) {
    const r = await medir();
    if (r && r.y >= zona.arriba && r.y + r.h <= zona.abajo && r.x >= -2 && r.x + r.w <= zona.ancho + 2) return r;
  }
  return null;
}
