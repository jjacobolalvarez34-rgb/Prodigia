import { View } from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import { COMPUESTOS_ORGANICOS } from "@/lib/practica/quimicaOrganica";
import { color, fuente } from "~/tema";

// Fórmula estructural condensada (port de components/quimia/MoleculaSVG.tsx): cajas
// con cada grupo unidas por enlaces simples o dobles; el benceno, como hexágono con
// enlaces alternados.
const ALTO = 48;

function medidas(n: number) {
  return n >= 5 ? { anchoCaja: 46, gap: 16, letra: 14 } : { anchoCaja: 56, gap: 28, letra: 15 };
}

export default function Molecula({ id, acento }: { id: string; acento: string }) {
  const c = COMPUESTOS_ORGANICOS.find((x) => x.id === id);
  if (!c) return null;
  const trazo = color.texto;
  if (c.anillo) {
    const radio = 46;
    const puntos = c.grupos.map((_, i) => {
      const a = (Math.PI / 180) * (60 * i - 90);
      return { x: 60 + radio * Math.cos(a), y: 60 + radio * Math.sin(a) };
    });
    return (
      <Svg width={130} height={130} viewBox="0 0 120 120">
        {puntos.map((p, i) => {
          const q = puntos[(i + 1) % puntos.length];
          const dx = q.y - p.y;
          const dy = -(q.x - p.x);
          const l = Math.hypot(dx, dy) || 1;
          return (
            <G key={i} stroke={trazo} strokeWidth={2}>
              <Line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
              {i % 2 === 0 && <Line x1={p.x + (dx / l) * 3} y1={p.y + (dy / l) * 3} x2={q.x + (dx / l) * 3} y2={q.y + (dy / l) * 3} />}
            </G>
          );
        })}
        {puntos.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={12} fill={color.surface2} stroke={acento} strokeWidth={1.5} />
        ))}
      </Svg>
    );
  }
  const n = c.grupos.length;
  const { anchoCaja, gap, letra } = medidas(n);
  const ancho = n * anchoCaja + Math.max(0, n - 1) * gap;
  const cy = ALTO / 2;
  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Svg width="100%" height={ALTO * 1.3} viewBox={`0 0 ${ancho} ${ALTO}`}>
        {c.grupos.slice(0, -1).map((_, i) => {
          const x1 = i * (anchoCaja + gap) + anchoCaja;
          const x2 = x1 + gap;
          return (
            <G key={i} stroke={trazo} strokeWidth={2}>
              <Line x1={x1} y1={cy} x2={x2} y2={cy} />
              {c.enlaceDoble === i && <Line x1={x1} y1={cy + 5} x2={x2} y2={cy + 5} />}
            </G>
          );
        })}
        {c.grupos.map((g, i) => {
          const x = i * (anchoCaja + gap);
          return (
            <G key={i}>
              <Rect x={x} y={4} width={anchoCaja} height={ALTO - 8} rx={8} fill={color.surface2} stroke={acento} strokeWidth={1.2} />
              <SvgText x={x + anchoCaja / 2} y={ALTO / 2 + letra * 0.35} textAnchor="middle" fontSize={letra} fontFamily={fuente.cuerpoBold} fill={color.texto}>
                {subindices(g)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const SUB: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };

// Igual que partirSubindices de TextoQuimica.tsx: un número es subíndice solo si va
// pegado a una letra o a un ")" (Al2O3 → Al₂O₃, pero "+2" o "Periodo 3" quedan igual).
export function subindices(texto: string): string {
  return texto.replace(/([A-Za-z)])(\d+)/g, (_, a: string, d: string) => a + d.split("").map((x) => SUB[x] ?? x).join(""));
}
