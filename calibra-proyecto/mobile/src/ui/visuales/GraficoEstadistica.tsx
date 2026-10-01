import type { ReactNode } from "react";
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import type { EjeValores, GraficoEstadistica as Grafico } from "@/lib/estadistica/tipos";
import { color, fuente } from "~/tema";

// Gráficos de Estadística (port de components/estadistica/*): barras, líneas,
// histograma y diagrama de caja, con las mismas medidas y ejes que la web.
const ANCHO = 360;
const ALTO = 250;
const M = { izq: 44, der: 14, arriba: 34, abajo: 42 };
const AW = ANCHO - M.izq - M.der;
const AH = ALTO - M.arriba - M.abajo;
const TINTA = color.texto;

function marcas(eje: EjeValores): number[] {
  const r: number[] = [];
  for (let v = eje.min; v <= eje.max + 1e-9; v += eje.tick) r.push(Math.round(v * 1000) / 1000);
  return r;
}
const yDe = (v: number, eje: EjeValores) => M.arriba + AH * (1 - (v - eje.min) / (eje.max - eje.min));
const xDe = (v: number, eje: EjeValores) => M.izq + AW * ((v - eje.min) / (eje.max - eje.min));

function T({ x, y, t, tam = 10, op = 0.85, anchor = "middle", bold }: { x: number; y: number; t: string | number; tam?: number; op?: number; anchor?: "middle" | "end" | "start"; bold?: boolean }) {
  return (
    <SvgText x={x} y={y} textAnchor={anchor} fontSize={tam} fontFamily={bold ? fuente.cuerpoBold : fuente.cuerpoMedio} fill={TINTA} fillOpacity={op}>
      {String(t)}
    </SvgText>
  );
}

function EjeVertical({ eje }: { eje: EjeValores }) {
  const ms = marcas(eje);
  return (
    <G>
      {ms.slice(0, -1).map((v) => {
        const y = yDe(v + eje.tick / 2, eje);
        return <Line key={`m${v}`} x1={M.izq} x2={ANCHO - M.der} y1={y} y2={y} stroke={TINTA} strokeOpacity={0.07} strokeDasharray="2 3" />;
      })}
      {ms.map((v) => (
        <G key={v}>
          <Line x1={M.izq} x2={ANCHO - M.der} y1={yDe(v, eje)} y2={yDe(v, eje)} stroke={TINTA} strokeOpacity={0.2} />
          <T x={M.izq - 6} y={yDe(v, eje) + 3.5} t={v} anchor="end" op={0.75} />
        </G>
      ))}
      <Line x1={M.izq} x2={M.izq} y1={M.arriba} y2={M.arriba + AH} stroke={TINTA} strokeOpacity={0.5} />
      <T x={M.izq - 32} y={M.arriba - 10} t={eje.etiqueta} anchor="start" op={0.75} />
    </G>
  );
}

export default function GraficoEstadistica({ grafico: g, acento }: { grafico: Grafico; acento: string }) {
  let cuerpo: ReactNode = null;
  if (g.tipo === "barras") {
    const paso = AW / g.categorias.length;
    const ancho = Math.min(46, paso * 0.62);
    const base = yDe(g.eje.min, g.eje);
    cuerpo = (
      <>
        <EjeVertical eje={g.eje} />
        {g.valores.map((v, i) => {
          const y = yDe(v, g.eje);
          return <Rect key={i} x={M.izq + paso * i + (paso - ancho) / 2} y={y} width={ancho} height={Math.max(0, base - y)} rx={2} fill={acento} fillOpacity={0.85} />;
        })}
        <Line x1={M.izq} x2={M.izq + AW} y1={base} y2={base} stroke={TINTA} strokeOpacity={0.6} />
        {g.categorias.map((c, i) => (
          <T key={c} x={M.izq + paso * i + paso / 2} y={M.arriba + AH + 16} t={c} />
        ))}
      </>
    );
  } else if (g.tipo === "lineas") {
    const paso = AW / g.etiquetas.length;
    const pts = g.valores.map((v, i) => ({ x: M.izq + paso * i + paso / 2, y: yDe(v, g.eje) }));
    cuerpo = (
      <>
        <EjeVertical eje={g.eje} />
        <Polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={acento} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={acento} stroke={color.surface1} strokeWidth={1.5} />
        ))}
        <Line x1={M.izq} x2={M.izq + AW} y1={M.arriba + AH} y2={M.arriba + AH} stroke={TINTA} strokeOpacity={0.6} />
        {g.etiquetas.map((e, i) => (
          <T key={e} x={pts[i].x} y={M.arriba + AH + 16} t={e} />
        ))}
      </>
    );
  } else if (g.tipo === "histograma") {
    const ancho = AW / g.frecuencias.length;
    const base = yDe(g.eje.min, g.eje);
    cuerpo = (
      <>
        <EjeVertical eje={g.eje} />
        {g.frecuencias.map((f, i) => {
          const y = yDe(f, g.eje);
          return <Rect key={i} x={M.izq + ancho * i} y={y} width={ancho} height={Math.max(0, base - y)} fill={acento} fillOpacity={0.8} stroke={color.surface1} strokeWidth={1.5} />;
        })}
        <Line x1={M.izq} x2={M.izq + AW} y1={base} y2={base} stroke={TINTA} strokeOpacity={0.6} />
        {g.limites.map((l, i) => (
          <T key={l} x={M.izq + ancho * i} y={M.arriba + AH + 15} t={l} />
        ))}
        <T x={M.izq + AW / 2} y={M.arriba + AH + 32} t={g.etiquetaX} op={0.75} />
      </>
    );
  } else {
    const ms = marcas(g.eje);
    const yc = M.arriba + AH / 2 - 6;
    const alto = 24;
    const inf = M.arriba + AH;
    cuerpo = (
      <>
        {ms.map((v) => (
          <G key={v}>
            <Line x1={xDe(v, g.eje)} x2={xDe(v, g.eje)} y1={M.arriba} y2={inf} stroke={TINTA} strokeOpacity={0.2} />
            <T x={xDe(v, g.eje)} y={inf + 14} t={v} op={0.75} />
          </G>
        ))}
        <Line x1={M.izq} x2={ANCHO - M.der} y1={inf} y2={inf} stroke={TINTA} strokeOpacity={0.5} />
        <T x={M.izq + AW / 2} y={ALTO - 6} t={g.eje.etiqueta} op={0.75} />
        <Line x1={xDe(g.min, g.eje)} x2={xDe(g.q1, g.eje)} y1={yc} y2={yc} stroke={TINTA} strokeWidth={2} />
        <Line x1={xDe(g.q3, g.eje)} x2={xDe(g.max, g.eje)} y1={yc} y2={yc} stroke={TINTA} strokeWidth={2} />
        <Line x1={xDe(g.min, g.eje)} x2={xDe(g.min, g.eje)} y1={yc - 9} y2={yc + 9} stroke={TINTA} strokeWidth={2} />
        <Line x1={xDe(g.max, g.eje)} x2={xDe(g.max, g.eje)} y1={yc - 9} y2={yc + 9} stroke={TINTA} strokeWidth={2} />
        <Rect x={xDe(g.q1, g.eje)} y={yc - alto / 2} width={xDe(g.q3, g.eje) - xDe(g.q1, g.eje)} height={alto} fill={acento} fillOpacity={0.3} stroke={acento} strokeWidth={2} />
        <Line x1={xDe(g.mediana, g.eje)} x2={xDe(g.mediana, g.eje)} y1={yc - alto / 2} y2={yc + alto / 2} stroke={acento} strokeWidth={3.5} />
        {g.atipicos.map((a) => (
          <Circle key={a} cx={xDe(a, g.eje)} cy={yc} r={4} fill="none" stroke={TINTA} strokeWidth={2} />
        ))}
      </>
    );
  }
  return (
    <Svg width="100%" height={230} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
      <T x={ANCHO / 2} y={18} t={g.titulo} tam={12} op={1} bold />
      {cuerpo}
    </Svg>
  );
}
