import Svg, { Polygon, Polyline, Text as SvgText } from "react-native-svg";
import type { TrianguloDiagrama } from "@/lib/practica/trigonometriaTipos";
import { color, conAlfa, fuente } from "~/tema";

// Triángulo de Trigonometría (port de components/trigonometria/TrianguloSVG.tsx, la
// variante del sprint): vértices calculados con los lados reales, lados con su
// medida o "?", ángulos con su valor y la marca del ángulo recto.

interface Punto {
  x: number;
  y: number;
}

const ANCHO = 300;
const ALTO = 220;
const PAD_X = 46;
const PAD_Y = 40;
const r2 = (n: number) => Math.round(n * 100) / 100;

function anguloDesdeLados(opuesto: number, l1: number, l2: number) {
  const c = (l1 * l1 + l2 * l2 - opuesto * opuesto) / (2 * l1 * l2);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

function vertices(t: TrianguloDiagrama): { A: Punto; B: Punto; C: Punto } {
  if (t.marcarRectoEn === "C") return { A: { x: 0, y: 0 }, B: { x: r2(t.ladoB), y: r2(t.ladoA) }, C: { x: r2(t.ladoB), y: 0 } };
  const a = (anguloDesdeLados(t.ladoA, t.ladoB, t.ladoC) * Math.PI) / 180;
  return { A: { x: 0, y: 0 }, B: { x: r2(t.ladoC), y: 0 }, C: { x: r2(t.ladoB * Math.cos(a)), y: r2(t.ladoB * Math.sin(a)) } };
}

function alejar(p: Punto, c: Punto, d: number): Punto {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / l) * d, y: p.y + (dy / l) * d };
}

const lado = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");
const angulo = (g: number) => `${String(Math.round(g * 10) / 10).replace(".", ",")}°`;

export default function Triangulo({ t, acento }: { t: TrianguloDiagrama; acento: string }) {
  const { A, B, C } = vertices(t);
  const xs = [A.x, B.x, C.x];
  const ys = [A.y, B.y, C.y];
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const anchoReal = Math.max(...xs) - minX || 1;
  const altoReal = Math.max(...ys) - minY || 1;
  const escala = Math.min((ANCHO - PAD_X * 2) / anchoReal, (ALTO - PAD_Y * 2) / altoReal);
  const offX = (ANCHO - anchoReal * escala) / 2;
  const offY = (ALTO - altoReal * escala) / 2;
  const svg = (p: Punto): Punto => ({ x: offX + (p.x - minX) * escala, y: ALTO - offY - (p.y - minY) * escala });
  const pA = svg(A);
  const pB = svg(B);
  const pC = svg(C);
  const centro = { x: (pA.x + pB.x + pC.x) / 3, y: (pA.y + pB.y + pC.y) / 3 };
  const ocultos = new Set([...(t.ocultarLados ?? []), ...(t.ocultar ? [t.ocultar] : [])]);
  const omitidos = new Set(t.omitirLados ?? []);
  const angulosOcultos = new Set(t.ocultarAngulos ?? []);
  const medio = (p: Punto, q: Punto) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const lados = [
    { k: "ladoA" as const, pos: alejar(medio(pB, pC), centro, 15) },
    { k: "ladoB" as const, pos: alejar(medio(pA, pC), centro, 15) },
    { k: "ladoC" as const, pos: alejar(medio(pA, pB), centro, 15) },
  ];
  const vs = [
    { n: "A" as const, p: pA, a: t.anguloA },
    { n: "B" as const, p: pB, a: t.anguloB },
    { n: "C" as const, p: pC, a: t.anguloC },
  ];

  let recto: string | null = null;
  if (t.marcarRectoEn) {
    const mapa = { A: pA, B: pB, C: pC };
    const v = mapa[t.marcarRectoEn];
    const otros = (["A", "B", "C"] as const).filter((k) => k !== t.marcarRectoEn).map((k) => mapa[k]);
    const u = (h: Punto) => {
      const dx = h.x - v.x;
      const dy = h.y - v.y;
      const l = Math.hypot(dx, dy) || 1;
      return { x: dx / l, y: dy / l };
    };
    const u1 = u(otros[0]);
    const u2 = u(otros[1]);
    const tam = 14;
    recto = `${v.x + u1.x * tam},${v.y + u1.y * tam} ${v.x + (u1.x + u2.x) * tam},${v.y + (u1.y + u2.y) * tam} ${v.x + u2.x * tam},${v.y + u2.y * tam}`;
  }

  return (
    <Svg width="100%" height={200} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
      <Polygon points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`} fill={conAlfa(acento, 0.12)} stroke={acento} strokeWidth={2.5} strokeLinejoin="round" />
      {recto && <Polyline points={recto} fill="none" stroke={acento} strokeWidth={1.5} />}
      {lados.map(({ k, pos }) =>
        omitidos.has(k) ? null : (
          <SvgText key={k} x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={13} fontFamily={fuente.mono} fill={ocultos.has(k) ? color.logro : color.texto}>
            {ocultos.has(k) ? "?" : lado(t[k])}
          </SvgText>
        )
      )}
      {vs.map(({ n, p, a }) => {
        const pos = alejar(p, centro, 20);
        const conValor = !angulosOcultos.has(n) && n !== t.marcarRectoEn;
        return (
          <SvgText key={n} x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={11} fontFamily={fuente.cuerpoFuerte} fill={acento}>
            {conValor ? `${n} (${angulo(a)})` : n}
          </SvgText>
        );
      })}
    </Svg>
  );
}
