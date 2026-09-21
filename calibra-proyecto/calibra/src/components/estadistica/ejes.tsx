import type { ReactNode } from "react";
import type { EjeValores } from "@/lib/estadistica/tipos";

// Lienzo común de los gráficos de Estadística (SVG puro, sin imágenes ni
// librerías): mismo espíritu que CircuitoSVG.tsx de Circuitia. Los
// componentes reciben datos ya construidos por src/lib/estadistica/graficos.ts
// y solo los dibujan — nunca calculan ninguna respuesta.

export const ANCHO = 360;
export const ALTO = 250;
export const MARGEN = { izq: 44, der: 14, arriba: 34, abajo: 42 };
export const AREA_W = ANCHO - MARGEN.izq - MARGEN.der;
export const AREA_H = ALTO - MARGEN.arriba - MARGEN.abajo;

export function marcasDe(eje: EjeValores): number[] {
  const marcas: number[] = [];
  for (let v = eje.min; v <= eje.max + 1e-9; v += eje.tick) marcas.push(Math.round(v * 1000) / 1000);
  return marcas;
}

export function yDe(v: number, eje: EjeValores): number {
  return MARGEN.arriba + AREA_H * (1 - (v - eje.min) / (eje.max - eje.min));
}

export function xDe(v: number, eje: EjeValores): number {
  return MARGEN.izq + AREA_W * ((v - eje.min) / (eje.max - eje.min));
}

interface MarcoProps {
  titulo: string;
  ariaLabel: string;
  children: ReactNode;
}

export function Marco({ titulo, ariaLabel, children }: MarcoProps) {
  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={ariaLabel} className="h-auto w-full max-w-sm text-foreground">
      <text x={ANCHO / 2} y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
        {titulo}
      </text>
      {children}
    </svg>
  );
}

// Guías horizontales (eje de valores vertical) con guía secundaria en la
// mitad de cada tick, para poder leer valores intermedios.
export function EjeVertical({ eje }: { eje: EjeValores }) {
  const marcas = marcasDe(eje);
  return (
    <g>
      {marcas.slice(0, -1).map((v) => {
        const y = yDe(v + eje.tick / 2, eje);
        return <line key={`m-${v}`} x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.07} strokeDasharray="2 3" />;
      })}
      {marcas.map((v) => {
        const y = yDe(v, eje);
        return (
          <g key={v}>
            <line x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.2} />
            <text x={MARGEN.izq - 6} y={y + 3.5} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.75}>
              {v}
            </text>
          </g>
        );
      })}
      <line x1={MARGEN.izq} x2={MARGEN.izq} y1={MARGEN.arriba} y2={MARGEN.arriba + AREA_H} stroke="currentColor" strokeOpacity={0.5} />
      <text x={MARGEN.izq - 32} y={MARGEN.arriba - 10} fontSize={10} fill="currentColor" fillOpacity={0.75}>
        {eje.etiqueta}
      </text>
    </g>
  );
}
