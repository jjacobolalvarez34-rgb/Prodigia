import { textoResistor, textoValores, type Esquema } from "@/lib/circuitia/esquema";

export interface ValorResistor {
  voltaje: number;
  corriente: number;
}

interface Props {
  esquema: Esquema;
  vFuente: number;
  colorHex: string;
  resaltarId?: string;
  // Qué magnitud mostrar bajo cada resistor (solo los ya revelados).
  mostrar: "ninguna" | "voltaje" | "corriente" | "ambas";
  valores: Map<string, ValorResistor>;
  // Pulsos de corriente en movimiento (false con "reducir movimiento" o en pausa).
  animar: boolean;
}

// Duración por defecto del pulso si un camino no trae la suya.
const CICLO_PATRON = 12;

// Esquema de circuito (SVG puro) calculado por disenarEsquema(): símbolos
// estándar (batería, resistor en zigzag, cables y uniones) y la corriente
// convencional como puntos que avanzan por los cables y ATRAVIESAN cada
// resistor, con velocidad proporcional a la corriente de ese tramo. Las
// flechas fijas marcan el sentido aunque no haya animación.
export default function EsquemaCircuito({ esquema, vFuente, colorHex, resaltarId, mostrar, valores, animar }: Props) {
  const { bateria } = esquema;
  return (
    <svg viewBox={`0 0 ${esquema.ancho} ${esquema.alto}`} className="mx-auto h-auto w-full max-w-[440px]" focusable="false">
      {animar && (
        <style>{`@keyframes circuitia-pulso { to { stroke-dashoffset: -${CICLO_PATRON}; } } @media (prefers-reduced-motion: reduce) { .circuitia-pulso { animation: none !important; } }`}</style>
      )}

      {/* Cables */}
      {esquema.cables.map((c, i) => (
        <line key={`c${i}`} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-foreground/70" />
      ))}

      {/* Batería: placa corta y gruesa (−) a la izquierda, larga y fina (+) a la derecha. */}
      <line x1={bateria.xNegativa} y1={bateria.y - 8} x2={bateria.xNegativa} y2={bateria.y + 8} stroke={colorHex} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={bateria.xPositiva} y1={bateria.y - 15} x2={bateria.xPositiva} y2={bateria.y + 15} stroke={colorHex} strokeWidth={2} strokeLinecap="round" />
      <text x={bateria.xNegativa - 9} y={bateria.y - 12} textAnchor="middle" className="fill-foreground/70 text-[12px] font-bold">
        −
      </text>
      <text x={bateria.xPositiva + 9} y={bateria.y - 12} textAnchor="middle" className="fill-foreground/70 text-[12px] font-bold">
        +
      </text>
      <text x={bateria.xTexto} y={bateria.yTexto} textAnchor="middle" fill={colorHex} className="text-[12px] font-bold">
        {vFuente} V
      </text>

      {/* Resistores */}
      {esquema.resistores.map((r) => {
        const resaltado = r.id === resaltarId;
        const textoV = textoValores(valores.get(r.id), mostrar);
        return (
          <g key={r.id}>
            <polyline
              points={r.puntos.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={resaltado ? colorHex : "currentColor"}
              strokeWidth={resaltado ? 3.2 : 2}
              strokeLinejoin="round"
              strokeLinecap="round"
              className={resaltado ? undefined : "text-foreground/80"}
            />
            <text x={r.xCentro} y={r.yEtiqueta} textAnchor="middle" className={`fill-foreground text-[12px] ${resaltado ? "font-black" : "font-semibold"}`}>
              {textoResistor(r)}
            </text>
            {textoV !== "" && (
              <text x={r.xCentro} y={r.yValor} textAnchor="middle" fill={colorHex} className="text-[11.5px] font-bold">
                {textoV}
              </text>
            )}
          </g>
        );
      })}

      {/* Uniones */}
      {esquema.uniones.map((u, i) => (
        <circle key={`u${i}`} cx={u.x} cy={u.y} r={3} fill="currentColor" className="text-foreground/80" />
      ))}

      {/* Sentido de la corriente (fijo): una flecha por camino. */}
      {esquema.flechas.map((f, i) => (
        <polygon key={`f${i}`} points="-4.5,-3.6 4.5,0 -4.5,3.6" transform={`translate(${f.x} ${f.y}) rotate(${f.grados})`} className="fill-foreground/70" />
      ))}

      {/* Pulsos de corriente: puntos que avanzan en el sentido de la corriente. */}
      {animar &&
        esquema.pulsos.map((p, i) => (
          <polyline
            key={`p${i}`}
            points={p.puntos.map((q) => `${q.x},${q.y}`).join(" ")}
            fill="none"
            stroke={colorHex}
            strokeWidth={3.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`0.1 ${CICLO_PATRON - 0.1}`}
            className="circuitia-pulso"
            style={{ animation: `circuitia-pulso ${p.duracionMs}ms linear infinite` }}
          />
        ))}
    </svg>
  );
}
