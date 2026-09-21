import type { EjeValores } from "@/lib/estadistica/tipos";
import { AREA_H, AREA_W, EjeVertical, MARGEN, Marco, yDe } from "./ejes";

interface Props {
  titulo: string;
  etiquetas: string[];
  valores: number[];
  eje: EjeValores;
  colorHex?: string;
}

export default function GraficoLineas({ titulo, etiquetas, valores, eje, colorHex = "#0D9488" }: Props) {
  const n = etiquetas.length;
  const paso = AREA_W / n;
  const puntos = valores.map((v, i) => ({ x: MARGEN.izq + paso * i + paso / 2, y: yDe(v, eje) }));
  return (
    <Marco titulo={titulo} ariaLabel={`Gráfico de líneas: ${titulo}`}>
      <EjeVertical eje={eje} />
      {puntos.map((p, i) => (
        <line key={`v-${i}`} x1={p.x} x2={p.x} y1={MARGEN.arriba} y2={MARGEN.arriba + AREA_H} stroke="currentColor" strokeOpacity={0.06} />
      ))}
      <polyline points={puntos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={colorHex} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {puntos.map((p, i) => (
        <circle key={etiquetas[i]} cx={p.x} cy={p.y} r={4} fill={colorHex} stroke="var(--background)" strokeWidth={1.5} />
      ))}
      <line x1={MARGEN.izq} x2={MARGEN.izq + AREA_W} y1={MARGEN.arriba + AREA_H} y2={MARGEN.arriba + AREA_H} stroke="currentColor" strokeOpacity={0.6} />
      {etiquetas.map((e, i) => (
        <text key={e} x={puntos[i].x} y={MARGEN.arriba + AREA_H + 16} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.85}>
          {e}
        </text>
      ))}
    </Marco>
  );
}
