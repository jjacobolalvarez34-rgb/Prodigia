import Svg, { Circle, Ellipse, G, Line, Path, Text as SvgText } from "react-native-svg";
import { indiceDiatonicoAbsoluto, type FiguraRitmica, type NotaMusical } from "@/lib/practica/melodia";
import { color } from "~/tema";

// Pentagrama de Melodía (port compacto de components/melodia/Pentagrama.tsx): clave
// de sol dibujada a mano (no depende de que el teléfono tenga el glifo 𝄞), notas
// con líneas adicionales y alteraciones.

const ESPACIO = 12;
const RADIO = 6.5;
const INDICE_LINEA_INFERIOR = 4 * 7 + 2; // Mi4
const Y_INF = 90;

function pasos(n: NotaMusical) {
  return indiceDiatonicoAbsoluto(n) - INDICE_LINEA_INFERIOR;
}
function yDe(p: number) {
  return Y_INF - (p * ESPACIO) / 2;
}
function adicionales(p: number): number[] {
  const r: number[] = [];
  if (p < 0) for (let k = -2; k >= p; k -= 2) r.push(k);
  else if (p > 8) for (let k = 10; k <= p; k += 2) r.push(k);
  return r;
}

// `visibles`, `etiquetas` y `destacada` los usan los visuales de Aprender (las notas
// van apareciendo de a una, con su nombre debajo); en el sprint no se pasan.
export default function Pentagrama({
  notas,
  disposicion = "secuencial",
  acento = "#F2C14E",
  visibles,
  etiquetas,
  destacada,
}: {
  notas: NotaMusical[];
  disposicion?: "secuencial" | "simultanea";
  acento?: string;
  visibles?: number;
  etiquetas?: string[];
  destacada?: number;
}) {
  const x0 = 56;
  const paso = 34;
  const conEtiquetas = !!etiquetas && etiquetas.some((e) => e !== "");
  const ancho = Math.max(150, disposicion === "secuencial" ? x0 + paso * Math.max(0, notas.length - 1) + 28 : x0 + 44 + (conEtiquetas ? 44 : 0));
  let minY = 0;
  let maxY = 140;
  for (const n of notas) {
    const y = yDe(pasos(n));
    minY = Math.min(minY, y - RADIO - 4);
    maxY = Math.max(maxY, y + RADIO + 4);
  }
  if (conEtiquetas && disposicion === "secuencial") maxY = Math.max(maxY, Y_INF + 40);
  const trazo = "rgba(244,246,251,0.75)";
  return (
    <Svg width="100%" height={150} viewBox={`0 ${minY} ${ancho} ${maxY - minY}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Line key={i} x1={8} y1={Y_INF - i * ESPACIO} x2={ancho - 8} y2={Y_INF - i * ESPACIO} stroke={trazo} strokeWidth={1.2} />
      ))}
      <G transform={`translate(11, ${Y_INF - 66})`}>
        <Path
          d="M21 8C15 8 12 13 14 19C16 25 24 33 26 42C27.5 49 20 51 17 46C14.5 42 18 38 22 39C27 40.3 27 47 22 49.5C16 52.5 10 47 12 40C13.5 34.5 20 33 24 37L22 12C21.3 9.5 18 9 17 12C16 15 18.5 17 20.5 15.5"
          stroke={color.texto}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path d="M21 20L21 70" stroke={color.texto} strokeWidth={2.6} strokeLinecap="round" />
        <Circle cx={21} cy={70} r={3.4} fill={color.texto} />
      </G>
      {notas.map((n, i) => {
        const p = pasos(n);
        const x = disposicion === "secuencial" ? x0 + i * paso : x0 + 16;
        const y = yDe(p);
        const simbolo = n.alteracion === "sostenido" ? "♯" : n.alteracion === "bemol" ? "♭" : null;
        const arriba = p < 4;
        const visible = visibles === undefined || i < visibles;
        const esDestacada = destacada === i;
        const etiqueta = etiquetas?.[i];
        return (
          <G key={i} opacity={visible ? 1 : 0}>
            {adicionales(p).map((k) => (
              <Line key={k} x1={x - RADIO - 5} y1={yDe(k)} x2={x + RADIO + 5} y2={yDe(k)} stroke={trazo} strokeWidth={1.2} />
            ))}
            {simbolo && (
              <SvgText x={x - RADIO - 14} y={y + 5} fontSize={17} fill={color.texto}>
                {simbolo}
              </SvgText>
            )}
            <Ellipse cx={x} cy={y} rx={RADIO} ry={RADIO - 1.3} fill={acento} stroke={esDestacada ? color.texto : "none"} strokeWidth={esDestacada ? 1.6 : 0} transform={`rotate(-18 ${x} ${y})`} />
            {conEtiquetas && etiqueta ? (
              <SvgText
                x={disposicion === "secuencial" ? x : x + RADIO + 8}
                y={disposicion === "secuencial" ? maxY - 5 : y + 3.5}
                fontSize={10.5}
                fontWeight={esDestacada ? "700" : "500"}
                textAnchor={disposicion === "secuencial" ? "middle" : "start"}
                fill={color.texto}
              >
                {etiqueta}
              </SvgText>
            ) : null}
            {disposicion === "secuencial" && <Line x1={arriba ? x + RADIO - 0.8 : x - RADIO + 0.8} y1={y} x2={arriba ? x + RADIO - 0.8 : x - RADIO + 0.8} y2={arriba ? y - 34 : y + 34} stroke={acento} strokeWidth={1.6} />}
          </G>
        );
      })}
    </Svg>
  );
}

export function FiguraRitmicaIcono({ figura, acento = "#F2C14E" }: { figura: FiguraRitmica; acento?: string }) {
  const hueca = figura === "redonda" || figura === "blanca";
  return (
    <Svg width={70} height={90} viewBox="0 0 70 90">
      <Ellipse cx={30} cy={68} rx={11} ry={8} fill={hueca ? "none" : acento} stroke={acento} strokeWidth={3} transform="rotate(-18 30 68)" />
      {figura !== "redonda" && <Line x1={40} y1={66} x2={40} y2={12} stroke={acento} strokeWidth={3} />}
      {figura === "corchea" && <Path d="M40 12 C50 22 58 28 52 44" stroke={acento} strokeWidth={3} fill="none" />}
    </Svg>
  );
}
