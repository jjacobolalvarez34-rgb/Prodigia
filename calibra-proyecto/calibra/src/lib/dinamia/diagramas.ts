// Dibujo de las preguntas de Dinamia (gráficas x-t / v-t y vectores en
// cuadrícula), como lista de formas que la web y la app pintan igual.
import { pasoLindo, puntaFlecha, r, type Dibujo, type Primitiva } from "@/lib/dibujo/primitivas";
import type { DiagramaDinamia } from "./tipos";

const COLORES_VECTOR = ["#60A5FA", "#F59E0B", "#34D399", "#F472B6"];

function fmt(n: number): string {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

function grafica(d: Extract<DiagramaDinamia, { tipo: "grafica" }>): Dibujo {
  const W = 260;
  const H = 170;
  const izq = 38;
  const der = 14;
  const arriba = 12;
  const abajo = 30;
  const xs = d.puntos.map((p) => p[0]);
  const ys = d.puntos.map((p) => p[1]);
  const tMax = Math.max(...xs, 1);
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(...ys, 1);
  const pasoY = pasoLindo(yMax - yMin, 4);
  const y0 = Math.floor(yMin / pasoY) * pasoY;
  const y1 = Math.ceil(yMax / pasoY) * pasoY;
  const pasoT = pasoLindo(tMax, 5);
  const t1 = Math.ceil(tMax / pasoT) * pasoT;
  const X = (t: number) => izq + ((W - izq - der) * t) / t1;
  const Y = (v: number) => H - abajo - ((H - abajo - arriba) * (v - y0)) / (y1 - y0 || 1);
  const prims: Primitiva[] = [];
  for (let v = y0; v <= y1 + 1e-9; v += pasoY) {
    prims.push({ t: "linea", x1: izq, y1: r(Y(v)), x2: W - der, y2: r(Y(v)), stroke: "borde", sw: 1, op: v === 0 ? 1 : 0.6 });
    prims.push({ t: "texto", x: izq - 5, y: r(Y(v) + 4), s: fmt(v), size: 10, fill: "texto2", anchor: "end" });
  }
  for (let t = 0; t <= t1 + 1e-9; t += pasoT) {
    prims.push({ t: "linea", x1: r(X(t)), y1: arriba, x2: r(X(t)), y2: H - abajo, stroke: "borde", sw: 1, op: 0.35 });
    prims.push({ t: "texto", x: r(X(t)), y: H - abajo + 14, s: fmt(t), size: 10, fill: "texto2", anchor: "middle" });
  }
  prims.push({ t: "linea", x1: izq, y1: arriba, x2: izq, y2: H - abajo, stroke: "texto2", sw: 1.5 });
  prims.push({ t: "linea", x1: izq, y1: r(Y(Math.max(0, y0))), x2: W - der, y2: r(Y(Math.max(0, y0))), stroke: "texto2", sw: 1.5 });
  if (d.eje === "v-t") {
    // Área sombreada: la distancia recorrida.
    const pts = d.puntos.map(([t, v]) => `${r(X(t))} ${r(Y(v))}`).join(" L");
    const ult = d.puntos[d.puntos.length - 1][0];
    prims.push({ t: "camino", d: `M${r(X(0))} ${r(Y(0))} L${pts} L${r(X(ult))} ${r(Y(0))} Z`, fill: "acento", op: 0.18 });
  }
  prims.push({ t: "camino", d: "M" + d.puntos.map(([t, v]) => `${r(X(t))} ${r(Y(v))}`).join(" L"), stroke: "acento", sw: 3 });
  for (const [t, v] of d.puntos) prims.push({ t: "circulo", cx: r(X(t)), cy: r(Y(v)), r: 3.5, fill: "acento" });
  prims.push({ t: "texto", x: W - der, y: H - 4, s: "t (s)", size: 10, fill: "texto2", anchor: "end", bold: true });
  prims.push({ t: "texto", x: 4, y: arriba - 2, s: d.eje === "x-t" ? "x (m)" : "v (m/s)", size: 10, fill: "texto2", bold: true });
  return { ancho: W, alto: H, prims };
}

function vectores(d: Extract<DiagramaDinamia, { tipo: "vectores" }>): Dibujo {
  const R = Math.max(4, ...d.vectores.flatMap((v) => [Math.abs(v.x), Math.abs(v.y)])) + 1;
  const L = 220;
  const c = L / 2;
  const u = (L / 2 - 14) / R;
  const P = (x: number, y: number): [number, number] => [r(c + x * u), r(c - y * u)];
  const prims: Primitiva[] = [];
  for (let k = -R; k <= R; k++) {
    const op = k === 0 ? 0.9 : 0.35;
    const [ax, ay] = P(k, -R);
    const [bx, by] = P(k, R);
    prims.push({ t: "linea", x1: ax, y1: ay, x2: bx, y2: by, stroke: k === 0 ? "texto2" : "borde", sw: k === 0 ? 1.5 : 1, op });
    const [cx1, cy1] = P(-R, k);
    const [dx1, dy1] = P(R, k);
    prims.push({ t: "linea", x1: cx1, y1: cy1, x2: dx1, y2: dy1, stroke: k === 0 ? "texto2" : "borde", sw: k === 0 ? 1.5 : 1, op });
  }
  d.vectores.forEach((v, i) => {
    const col = COLORES_VECTOR[i % COLORES_VECTOR.length];
    const [x0, y0] = P(0, 0);
    const [x1, y1] = P(v.x, v.y);
    prims.push({ t: "linea", x1: x0, y1: y0, x2: x1, y2: y1, stroke: col, sw: 3 });
    prims.push({ t: "camino", d: puntaFlecha(x0, y0, x1, y1, 10, 6), fill: col });
    const dx = v.x >= 0 ? 6 : -6;
    const dy = v.y >= 0 ? -6 : 14;
    prims.push({ t: "texto", x: r(x1 + dx), y: r(y1 + dy), s: v.nombre, size: 13, fill: col, anchor: v.x >= 0 ? "start" : "end", bold: true });
  });
  return { ancho: L, alto: L, prims };
}

export function dibujoDinamia(d: DiagramaDinamia): Dibujo {
  return d.tipo === "grafica" ? grafica(d) : vectores(d);
}
