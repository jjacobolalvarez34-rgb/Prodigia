import type { ReactNode } from "react";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import type { NodoCircuito } from "@/lib/circuitos/resolver";
import { color, fuente } from "~/tema";

// Diagrama del circuito (port de components/circuitia/CircuitoSVG.tsx): batería,
// resistencias en zigzag en serie y en paralelo, y la resistencia que se pregunta
// resaltada con un "?".
const ANCHO = 360;
const ALTO = 220;
const X_BAT = 50;
const X_R = 310;
const Y_MID = 110;
const AMP = 8;
const SEG = 6;

interface Props {
  topologia: unknown;
  vFuente: number;
  resaltarId?: string;
  acento: string;
}

export default function Circuito({ topologia: topo, resaltarId, acento }: Props) {
  const topologia = topo as NodoCircuito;
  const el: ReactNode[] = [];
  let n = 0;
  const k = () => `c${n++}`;
  const cable = "rgba(244,246,251,0.7)";

  const junta = (x: number, y: number) => el.push(<Circle key={k()} cx={x} cy={y} r={3.2} fill={acento} />);
  const linea = (x1: number, y1: number, x2: number, y2: number) => el.push(<Line key={k()} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cable} strokeWidth={2} />);
  const texto = (x: number, y: number, t: string, c: string, tam = 11, f: string = fuente.mono) =>
    el.push(
      <SvgText key={k()} x={x} y={y} textAnchor="middle" fontSize={tam} fontFamily={f} fill={c}>
        {t}
      </SvgText>
    );

  function zigzag(x1: number, x2: number, y: number, id: string, ohmios: number) {
    const a = x1 + (x2 - x1) * 0.18;
    const b = x1 + (x2 - x1) * 0.82;
    const paso = (b - a) / SEG;
    const pts = [`${x1},${y}`, `${a},${y}`];
    for (let i = 1; i < SEG; i++) pts.push(`${a + paso * i},${y + (i % 2 === 0 ? -AMP : AMP)}`);
    pts.push(`${b},${y}`, `${x2},${y}`);
    const res = resaltarId === id;
    el.push(<Polyline key={k()} points={pts.join(" ")} fill="none" stroke={res ? acento : "rgba(244,246,251,0.85)"} strokeWidth={res ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" />);
    const mx = (x1 + x2) / 2;
    texto(mx, y + AMP + 18, `${id}: ${ohmios}Ω`, color.texto);
    if (res) {
      el.push(<Circle key={k()} cx={mx} cy={y - AMP - 16} r={9} fill={acento} />);
      texto(mx, y - AMP - 12, "?", "#fff", 11, fuente.cuerpoBold);
    }
  }

  function paralelo(nodo: Extract<NodoCircuito, { tipo: "paralelo" }>, xl: number, xr: number, yt: number, yb: number) {
    linea(xl, yt, xl, yb);
    linea(xr, yt, xr, yb);
    const paso = (yb - yt) / (nodo.hijos.length + 1);
    nodo.hijos.forEach((h, i) => {
      const y = yt + paso * (i + 1);
      junta(xl, y);
      junta(xr, y);
      if (h.tipo === "resistor") zigzag(xl, xr, y, h.id, h.ohmios);
    });
  }

  if (topologia.tipo === "paralelo") {
    const yt = 55;
    const yb = 175;
    const ym = (yt + yb) / 2;
    linea(X_BAT, yt, X_BAT, ym - 6);
    el.push(<Line key={k()} x1={X_BAT - 12} y1={ym - 6} x2={X_BAT + 12} y2={ym - 6} stroke={acento} strokeWidth={2} />);
    el.push(<Line key={k()} x1={X_BAT - 7} y1={ym + 4} x2={X_BAT + 7} y2={ym + 4} stroke={acento} strokeWidth={4} />);
    linea(X_BAT, ym + 4, X_BAT, yb);
    texto(X_BAT - 20, ym - 2, "+", color.texto2, 10, fuente.cuerpoBold);
    texto(X_BAT - 20, ym + 18, "−", color.texto2, 10, fuente.cuerpoBold);
    paralelo(topologia, X_BAT, X_R, yt, yb);
  } else if (topologia.tipo === "serie") {
    const yLoop = Y_MID + 55;
    linea(X_BAT - 14, Y_MID, X_BAT, Y_MID);
    el.push(<Line key={k()} x1={X_BAT} y1={Y_MID - 14} x2={X_BAT} y2={Y_MID + 14} stroke={acento} strokeWidth={2} />);
    el.push(<Line key={k()} x1={X_BAT + 10} y1={Y_MID - 7} x2={X_BAT + 10} y2={Y_MID + 7} stroke={acento} strokeWidth={4} />);
    linea(X_BAT + 10, Y_MID, X_BAT + 22, Y_MID);
    texto(X_BAT - 6, Y_MID - 18, "+", color.texto2, 10, fuente.cuerpoBold);
    texto(X_BAT + 16, Y_MID - 18, "−", color.texto2, 10, fuente.cuerpoBold);
    const x0 = X_BAT + 22;
    const tramo = (X_R - x0) / topologia.hijos.length;
    topologia.hijos.forEach((h, i) => {
      const x1 = x0 + tramo * i;
      const x2 = x0 + tramo * (i + 1);
      if (h.tipo === "resistor") {
        zigzag(x1 + 6, x2 - 6, Y_MID, h.id, h.ohmios);
        linea(x1, Y_MID, x1 + 6, Y_MID);
        linea(x2 - 6, Y_MID, x2, Y_MID);
      } else if (h.tipo === "paralelo") {
        const l = x1 + 14;
        const r = x2 - 14;
        linea(x1, Y_MID, l, Y_MID);
        linea(r, Y_MID, x2, Y_MID);
        junta(l, Y_MID);
        junta(r, Y_MID);
        paralelo(h, l, r, Y_MID - 40, Y_MID + 40);
      }
    });
    linea(X_R, Y_MID, X_R, yLoop);
    linea(X_R, yLoop, X_BAT, yLoop);
    linea(X_BAT, yLoop, X_BAT, Y_MID + 14);
  }

  return (
    <Svg width="100%" height={200} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
      {el}
    </Svg>
  );
}
