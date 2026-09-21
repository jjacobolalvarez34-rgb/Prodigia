import type { EjeValores } from "@/lib/estadistica/tipos";
import { AREA_H, AREA_W, EjeVertical, MARGEN, Marco, yDe } from "./ejes";

interface Props {
  titulo: string;
  limites: number[];
  frecuencias: number[];
  eje: EjeValores;
  etiquetaX: string;
  colorHex?: string;
}

// Histograma: barras pegadas; cada clase es [límite inferior, superior).
export default function GraficoHistograma({ titulo, limites, frecuencias, eje, etiquetaX, colorHex = "#0D9488" }: Props) {
  const n = frecuencias.length;
  const ancho = AREA_W / n;
  const base = yDe(eje.min, eje);
  return (
    <Marco titulo={titulo} ariaLabel={`Histograma: ${titulo}`}>
      <EjeVertical eje={eje} />
      {frecuencias.map((f, i) => {
        const y = yDe(f, eje);
        return <rect key={i} x={MARGEN.izq + ancho * i} y={y} width={ancho} height={Math.max(0, base - y)} fill={colorHex} fillOpacity={0.8} stroke="var(--background)" strokeWidth={1.5} />;
      })}
      <line x1={MARGEN.izq} x2={MARGEN.izq + AREA_W} y1={base} y2={base} stroke="currentColor" strokeOpacity={0.6} />
      {limites.map((l, i) => (
        <text key={l} x={MARGEN.izq + ancho * i} y={MARGEN.arriba + AREA_H + 15} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.85}>
          {l}
        </text>
      ))}
      <text x={MARGEN.izq + AREA_W / 2} y={MARGEN.arriba + AREA_H + 32} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.75}>
        {etiquetaX}
      </text>
    </Marco>
  );
}
