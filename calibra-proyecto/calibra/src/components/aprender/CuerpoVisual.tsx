"use client";

import MathText from "@/components/MathText";
import { agruparVisualesPorPaso, type VisualLeccion as DatosVisual } from "@/lib/aprender/visuales";
import VisualLeccion, { type RegistroVisuales } from "./VisualLeccion";

interface Props {
  // Introducción corta: cada paso es 1-3 frases (admite $...$).
  pasos: string[];
  // Ya validados con visualesDeContenido().
  visuales: DatosVisual[];
  registro?: RegistroVisuales;
}

// Cuerpo de una lección en formato visual: cada paso como párrafo cómodo
// de leer y, justo debajo, los visuales que le tocan (`despuesDePaso`).
// Compartido por todos los mundos (cada uno pasa su `registro`).
export default function CuerpoVisual({ pasos, visuales, registro }: Props) {
  const porPaso = agruparVisualesPorPaso(pasos.length, visuales);
  return (
    <div className="flex flex-col gap-5">
      {pasos.map((paso, i) => (
        <div key={i} className="flex flex-col gap-4">
          <p className="text-base leading-relaxed text-foreground">
            <MathText texto={paso} />
          </p>
          {(porPaso.get(i) ?? []).map((v, vi) => (
            <VisualLeccion key={vi} visual={v} registro={registro} />
          ))}
        </div>
      ))}
    </div>
  );
}
