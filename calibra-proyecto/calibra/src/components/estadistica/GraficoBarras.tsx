import type { EjeValores } from "@/lib/estadistica/tipos";
import { AREA_H, AREA_W, EjeVertical, MARGEN, Marco, yDe } from "./ejes";

interface Props {
  titulo: string;
  categorias: string[];
  valores: number[];
  eje: EjeValores;
  colorHex?: string;
}

// Gráfico de barras. El eje se dibuja tal cual viene: si `eje.min` > 0 el
// gráfico queda "truncado" (caso del gráfico engañoso por escala) y las
// alturas visuales exageran las diferencias — a propósito.
export default function GraficoBarras({ titulo, categorias, valores, eje, colorHex = "#0D9488" }: Props) {
  const n = categorias.length;
  const paso = AREA_W / n;
  const ancho = Math.min(46, paso * 0.62);
  const base = yDe(eje.min, eje);
  return (
    <Marco titulo={titulo} ariaLabel={`Gráfico de barras: ${titulo}`}>
      <EjeVertical eje={eje} />
      {valores.map((v, i) => {
        const x = MARGEN.izq + paso * i + (paso - ancho) / 2;
        const y = yDe(v, eje);
        return <rect key={categorias[i]} x={x} y={y} width={ancho} height={Math.max(0, base - y)} rx={2} fill={colorHex} fillOpacity={0.85} />;
      })}
      <line x1={MARGEN.izq} x2={MARGEN.izq + AREA_W} y1={base} y2={base} stroke="currentColor" strokeOpacity={0.6} />
      {categorias.map((c, i) => (
        <text key={c} x={MARGEN.izq + paso * i + paso / 2} y={MARGEN.arriba + AREA_H + 16} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.85}>
          {c}
        </text>
      ))}
    </Marco>
  );
}
