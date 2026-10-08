import Svg, { Circle, Ellipse, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import type { ColorDibujo, Dibujo } from "@/lib/dibujo/primitivas";
import { color, fuente } from "~/tema";

// Pinta un dibujo compartido con la web (lib/dibujo/primitivas.ts): Dinamia
// (gráficas, vectores) y Vitalia (célula, mitosis).
function pintar(c: ColorDibujo | undefined, acento: string): string | undefined {
  if (!c) return undefined;
  if (c === "texto") return color.texto;
  if (c === "texto2") return color.texto2;
  if (c === "borde") return color.border;
  if (c === "acento") return acento;
  return c;
}

export default function DibujoSvg({ dibujo, acento, ancho = "100%", maxAlto = 230 }: { dibujo: Dibujo; acento: string; ancho?: number | `${number}%`; maxAlto?: number }) {
  const p = (c?: ColorDibujo) => pintar(c, acento);
  return (
    <Svg width={ancho} height={maxAlto} viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`} preserveAspectRatio="xMidYMid meet">
      {dibujo.prims.map((x, i) => {
        switch (x.t) {
          case "elipse":
            return <Ellipse key={i} cx={x.cx} cy={x.cy} rx={x.rx} ry={x.ry} rotation={x.rot ?? 0} origin={`${x.cx}, ${x.cy}`} fill={p(x.fill) ?? "none"} stroke={p(x.stroke)} strokeWidth={x.sw} opacity={x.op} strokeDasharray={x.dash} />;
          case "circulo":
            return <Circle key={i} cx={x.cx} cy={x.cy} r={x.r} fill={p(x.fill) ?? "none"} stroke={p(x.stroke)} strokeWidth={x.sw} opacity={x.op} />;
          case "camino":
            return <Path key={i} d={x.d} fill={p(x.fill) ?? "none"} stroke={p(x.stroke)} strokeWidth={x.sw} opacity={x.op} strokeDasharray={x.dash} strokeLinecap="round" strokeLinejoin="round" />;
          case "linea":
            return <Line key={i} x1={x.x1} y1={x.y1} x2={x.x2} y2={x.y2} stroke={p(x.stroke)} strokeWidth={x.sw ?? 1} opacity={x.op} strokeDasharray={x.dash} strokeLinecap="round" />;
          case "rect":
            return <Rect key={i} x={x.x} y={x.y} width={x.w} height={x.h} rx={x.r} fill={p(x.fill) ?? "none"} stroke={p(x.stroke)} strokeWidth={x.sw} opacity={x.op} />;
          case "texto":
            return (
              <SvgText key={i} x={x.x} y={x.y} fontSize={x.size} fill={p(x.fill)} textAnchor={x.anchor ?? "start"} fontFamily={x.bold ? fuente.cuerpoBold : fuente.cuerpoMedio}>
                {x.s}
              </SvgText>
            );
        }
      })}
    </Svg>
  );
}
