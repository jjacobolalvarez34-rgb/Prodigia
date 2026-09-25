"use client";

import VisualLeccion from "@/components/aprender/VisualLeccion";
import TextoConCodigo from "@/components/codia/TextoConCodigo";
import { REGISTRO_VISUALES_CODIA } from "@/components/codia/visuales/registro";
import { agruparVisualesPorPaso, type VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";

interface Props {
  // Cada paso puede traer bloques de código (```lenguaje) y salidas (```salida).
  pasos: string[];
  // Ya validados con visualesDeContenido().
  visuales: DatosVisual[];
}

// Cuerpo de una lección de Codia en formato visual: igual que
// src/components/aprender/CuerpoVisual.tsx pero cada paso pasa por
// TextoConCodigo (bloques de código con resaltado y salida real) en vez de
// MathText a secas, y debajo de cada paso van los visuales que le tocan
// (`despuesDePaso`): trazas paso a paso, comparaciones en los 4 lenguajes,
// diagramas de flujo y gráficas de crecimiento.
export default function CuerpoLeccionCodia({ pasos, visuales }: Props) {
  const porPaso = agruparVisualesPorPaso(pasos.length, visuales);
  return (
    <div className="flex flex-col gap-5">
      {pasos.map((paso, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="flex gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
            <span className="font-bold text-logro">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <TextoConCodigo texto={paso} />
            </div>
          </div>
          {(porPaso.get(i) ?? []).map((v, vi) => (
            <VisualLeccion key={vi} visual={v} registro={REGISTRO_VISUALES_CODIA} />
          ))}
        </div>
      ))}
    </div>
  );
}
