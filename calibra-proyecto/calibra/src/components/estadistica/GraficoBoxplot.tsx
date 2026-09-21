import type { EjeValores } from "@/lib/estadistica/tipos";
import { ALTO, ANCHO, AREA_H, AREA_W, MARGEN, Marco, marcasDe, xDe } from "./ejes";

interface Props {
  titulo: string;
  min: number;
  q1: number;
  mediana: number;
  q3: number;
  max: number;
  atipicos: number[];
  eje: EjeValores;
  colorHex?: string;
}

// Diagrama de caja horizontal: bigotes hasta el último dato no atípico,
// caja Q1-Q3 con la mediana, y puntos aislados para los atípicos.
export default function GraficoBoxplot({ titulo, min, q1, mediana, q3, max, atipicos, eje, colorHex = "#0D9488" }: Props) {
  const marcas = marcasDe(eje);
  const yc = MARGEN.arriba + AREA_H / 2 - 6;
  const alto = 24;
  const inferior = MARGEN.arriba + AREA_H;
  return (
    <Marco titulo={titulo} ariaLabel={`Diagrama de caja: ${titulo}`}>
      {marcas.slice(0, -1).map((v) => (
        <line key={`m-${v}`} x1={xDe(v + eje.tick / 2, eje)} x2={xDe(v + eje.tick / 2, eje)} y1={MARGEN.arriba} y2={inferior} stroke="currentColor" strokeOpacity={0.07} strokeDasharray="2 3" />
      ))}
      {marcas.map((v) => (
        <g key={v}>
          <line x1={xDe(v, eje)} x2={xDe(v, eje)} y1={MARGEN.arriba} y2={inferior} stroke="currentColor" strokeOpacity={0.2} />
          <text x={xDe(v, eje)} y={inferior + 14} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.75}>
            {v}
          </text>
        </g>
      ))}
      <line x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={inferior} y2={inferior} stroke="currentColor" strokeOpacity={0.5} />
      <text x={MARGEN.izq + AREA_W / 2} y={ALTO - 6} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.75}>
        {eje.etiqueta}
      </text>
      <line x1={xDe(min, eje)} x2={xDe(q1, eje)} y1={yc} y2={yc} stroke="currentColor" strokeWidth={2} />
      <line x1={xDe(q3, eje)} x2={xDe(max, eje)} y1={yc} y2={yc} stroke="currentColor" strokeWidth={2} />
      <line x1={xDe(min, eje)} x2={xDe(min, eje)} y1={yc - 9} y2={yc + 9} stroke="currentColor" strokeWidth={2} />
      <line x1={xDe(max, eje)} x2={xDe(max, eje)} y1={yc - 9} y2={yc + 9} stroke="currentColor" strokeWidth={2} />
      <rect x={xDe(q1, eje)} y={yc - alto / 2} width={xDe(q3, eje) - xDe(q1, eje)} height={alto} fill={colorHex} fillOpacity={0.3} stroke={colorHex} strokeWidth={2} />
      <line x1={xDe(mediana, eje)} x2={xDe(mediana, eje)} y1={yc - alto / 2} y2={yc + alto / 2} stroke={colorHex} strokeWidth={3.5} />
      {atipicos.map((a) => (
        <circle key={a} cx={xDe(a, eje)} cy={yc} r={4} fill="none" stroke="currentColor" strokeWidth={2} />
      ))}
    </Marco>
  );
}
