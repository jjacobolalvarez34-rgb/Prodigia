import type { FiguraRitmica } from "@/lib/practica/melodia";

interface Props {
  figura: FiguraRitmica;
  colorHex?: string;
  className?: string;
}

// Ícono aislado de una figura rítmica (sin pentagrama, no hace falta
// altura real acá) — a diferencia de Pentagrama.tsx, esta SÍ necesita
// plica/corchete porque es lo único que distingue visualmente
// redonda/blanca (huecas) de negra (rellena) y negra de corchea (con
// corchete). Nomenclatura estándar de notación musical, no una forma
// inventada.
export default function FiguraRitmicaIcono({ figura, colorHex = "#B8860B", className = "" }: Props) {
  const hueca = figura === "redonda" || figura === "blanca";
  const conPlica = figura !== "redonda";
  const conCorchete = figura === "corchea";
  const cx = 30;
  const cy = 62;
  const rx = 11;
  const ry = 8;
  const xPlica = cx + rx - 1.5;
  const yPlicaTope = 14;

  return (
    <svg viewBox="0 0 60 76" width={64} height={80} className={className} role="img" aria-label={`Figura rítmica: ${figura}`}>
      {conPlica && <line x1={xPlica} y1={cy} x2={xPlica} y2={yPlicaTope} stroke={colorHex} strokeWidth={2.4} strokeLinecap="round" />}
      {conCorchete && (
        <path
          d={`M ${xPlica} ${yPlicaTope} C ${xPlica + 16} ${yPlicaTope + 6}, ${xPlica + 14} ${yPlicaTope + 20}, ${xPlica + 2} ${yPlicaTope + 26}`}
          fill="none"
          stroke={colorHex}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      )}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        transform={`rotate(-18 ${cx} ${cy})`}
        fill={hueca ? "none" : colorHex}
        stroke={colorHex}
        strokeWidth={hueca ? 2.6 : 0}
      />
    </svg>
  );
}
