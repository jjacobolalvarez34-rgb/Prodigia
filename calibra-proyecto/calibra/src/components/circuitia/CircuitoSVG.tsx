import type { ReactNode } from "react";
import type { NodoCircuito } from "@/lib/circuitos/resolver";

interface Props {
  topologia: NodoCircuito;
  vFuente: number;
  resaltarId?: string;
  colorHex?: string;
}

const ANCHO = 360;
const ALTO = 220;
const X_BAT = 50;
const X_R = 310;
const Y_MID = 110;
const AMPLITUD_ZIGZAG = 8;
const SEGMENTOS_ZIGZAG = 6;

// Diagrama propio de Circuitia: SVG puro con geometría calculada desde
// la topología estructurada (nunca un glifo unicode ni una imagen
// externa) — mismo espíritu que TrianguloSVG.tsx de Trigonometría o el
// pentagrama hecho a mano de Melodía. Solo soporta la forma que el
// generador (circuitia.ts) realmente produce: raíz "serie" o
// "paralelo", con a lo sumo UN nivel de anidado (un hijo "paralelo"
// dentro de un "serie", nunca al revés ni más profundo) — así que el
// layout no necesita ser 100% genérico para cualquier árbol, solo para
// esos 2 niveles.
export default function CircuitoSVG({ topologia, resaltarId, colorHex = "#F59E0B" }: Props) {
  const elementos: ReactNode[] = [];
  let keySeq = 0;
  const k = () => `el-${keySeq++}`;

  function puntoJuntura(x: number, y: number) {
    elementos.push(<circle key={k()} cx={x} cy={y} r={3.2} fill={colorHex} />);
  }

  function lineaWire(x1: number, y1: number, x2: number, y2: number) {
    elementos.push(
      <line key={k()} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={2} className="text-foreground/70" />
    );
  }

  function zigzagHorizontal(x1: number, x2: number, y: number, id: string, ohmios: number) {
    const bodyStart = x1 + (x2 - x1) * 0.18;
    const bodyEnd = x1 + (x2 - x1) * 0.82;
    const step = (bodyEnd - bodyStart) / SEGMENTOS_ZIGZAG;
    const pts: string[] = [`${x1},${y}`, `${bodyStart},${y}`];
    for (let i = 1; i < SEGMENTOS_ZIGZAG; i++) {
      const xx = bodyStart + step * i;
      const yy = y + (i % 2 === 0 ? -AMPLITUD_ZIGZAG : AMPLITUD_ZIGZAG);
      pts.push(`${xx},${yy}`);
    }
    pts.push(`${bodyEnd},${y}`, `${x2},${y}`);

    const resaltado = resaltarId === id;
    elementos.push(
      <polyline
        key={k()}
        points={pts.join(" ")}
        fill="none"
        stroke={resaltado ? colorHex : "currentColor"}
        strokeWidth={resaltado ? 3 : 2}
        strokeLinejoin="round"
        strokeLinecap="round"
        className={resaltado ? undefined : "text-foreground/80"}
      />
    );

    const midX = (x1 + x2) / 2;
    elementos.push(
      <text
        key={k()}
        x={midX}
        y={y + AMPLITUD_ZIGZAG + 16}
        textAnchor="middle"
        className="fill-foreground font-mono text-[11px] font-semibold"
      >
        {id}: {ohmios}Ω
      </text>
    );

    if (resaltado) {
      const badgeY = y - AMPLITUD_ZIGZAG - 16;
      elementos.push(<circle key={k()} cx={midX} cy={badgeY} r={9} fill={colorHex} />);
      elementos.push(
        <text key={k()} x={midX} y={badgeY} textAnchor="middle" dominantBaseline="middle" className="fill-white text-[11px] font-bold">
          ?
        </text>
      );
    }
  }

  // Bloque en paralelo: 2 rieles verticales en xLeft/xRight, cada hijo
  // (siempre un resistor en la forma que produce el generador) es un
  // "peldaño" horizontal entre ambos rieles, repartidos parejo en
  // [yTop, yBottom]. Devuelve el y del punto donde el peldaño central
  // (el promedio vertical) debería conectar hacia afuera, para que un
  // cable entrante desde una rama en serie llegue justo al punto medio
  // del riel.
  function renderParalelo(nodo: Extract<NodoCircuito, { tipo: "paralelo" }>, xLeft: number, xRight: number, yTop: number, yBottom: number) {
    lineaWire(xLeft, yTop, xLeft, yBottom);
    lineaWire(xRight, yTop, xRight, yBottom);

    const n = nodo.hijos.length;
    const paso = (yBottom - yTop) / (n + 1);
    nodo.hijos.forEach((hijo, i) => {
      const y = yTop + paso * (i + 1);
      puntoJuntura(xLeft, y);
      puntoJuntura(xRight, y);
      if (hijo.tipo === "resistor") {
        zigzagHorizontal(xLeft, xRight, y, hijo.id, hijo.ohmios);
      }
    });
  }

  if (topologia.tipo === "paralelo") {
    // Raíz en paralelo pura: la batería y los 2 rieles comparten toda
    // la altura del canvas — los rieles SON los 2 terminales de la
    // fuente, con cada resistor como un peldaño horizontal entre ellos.
    const yTop = 55;
    const yBottom = 175;
    dibujarBateria(elementos, k, X_BAT, yTop, yBottom, colorHex);
    renderParalelo(topologia, X_BAT, X_R, yTop, yBottom);
  } else if (topologia.tipo === "serie") {
    // Raíz en serie: todos los elementos alineados en una sola línea
    // horizontal (Y_MID), cerrando el circuito como un rectángulo: la
    // batería a la izquierda, el camino de vuelta por abajo. Un hijo
    // "paralelo" (caso mixto) se expande verticalmente alrededor de
    // Y_MID dentro de su propio tramo de ancho.
    const yBottomLoop = Y_MID + 55;
    dibujarBateriaEnLinea(elementos, k, X_BAT, Y_MID, colorHex);

    const xInicioCadena = X_BAT + 22;
    const xFinCadena = X_R;
    const n = topologia.hijos.length;
    const anchoTramo = (xFinCadena - xInicioCadena) / n;

    topologia.hijos.forEach((hijo, i) => {
      const x1 = xInicioCadena + anchoTramo * i;
      const x2 = xInicioCadena + anchoTramo * (i + 1);
      if (hijo.tipo === "resistor") {
        // Wire de entrada/salida implícito: el zigzag ya ocupa todo
        // [x1,x2], no hace falta un <line> extra.
        zigzagHorizontal(x1 + 6, x2 - 6, Y_MID, hijo.id, hijo.ohmios);
        lineaWire(x1, Y_MID, x1 + 6, Y_MID);
        lineaWire(x2 - 6, Y_MID, x2, Y_MID);
      } else if (hijo.tipo === "paralelo") {
        const margen = 14;
        const railL = x1 + margen;
        const railR = x2 - margen;
        lineaWire(x1, Y_MID, railL, Y_MID);
        lineaWire(railR, Y_MID, x2, Y_MID);
        puntoJuntura(railL, Y_MID);
        puntoJuntura(railR, Y_MID);
        renderParalelo(hijo, railL, railR, Y_MID - 40, Y_MID + 40);
      }
    });

    // Cierre del lazo: sube/baja por la derecha y vuelve por abajo
    // hasta la batería.
    lineaWire(X_R, Y_MID, X_R, yBottomLoop);
    lineaWire(X_R, yBottomLoop, X_BAT, yBottomLoop);
    lineaWire(X_BAT, yBottomLoop, X_BAT, Y_MID + 14);
  }

  return (
    <svg width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`} className="mx-auto">
      {elementos}
    </svg>
  );
}

// Símbolo de batería "en línea" (dentro de una cadena en serie): una
// línea larga y fina (terminal +) seguida de una línea corta y gruesa
// (terminal -), con marcas de polaridad, cortando el cable horizontal.
function dibujarBateriaEnLinea(
  elementos: ReactNode[],
  k: () => string,
  x: number,
  y: number,
  colorHex: string
) {
  elementos.push(<line key={k()} x1={x - 14} y1={y} x2={x} y2={y} stroke="currentColor" strokeWidth={2} className="text-foreground/70" />);
  elementos.push(<line key={k()} x1={x} y1={y - 14} x2={x} y2={y + 14} stroke={colorHex} strokeWidth={2} />);
  elementos.push(<line key={k()} x1={x + 10} y1={y - 7} x2={x + 10} y2={y + 7} stroke={colorHex} strokeWidth={4} />);
  elementos.push(<line key={k()} x1={x + 10} y1={y} x2={x + 22} y2={y} stroke="currentColor" strokeWidth={2} className="text-foreground/70" />);
  elementos.push(
    <text key={k()} x={x - 6} y={y - 18} textAnchor="middle" className="fill-foreground/70 text-[10px] font-bold">
      +
    </text>
  );
  elementos.push(
    <text key={k()} x={x + 16} y={y - 18} textAnchor="middle" className="fill-foreground/70 text-[10px] font-bold">
      −
    </text>
  );
}

// Símbolo de batería "vertical" (cuando la raíz es un paralelo puro y
// la fuente conecta directo los 2 rieles que abarcan todo el alto).
function dibujarBateria(
  elementos: ReactNode[],
  k: () => string,
  x: number,
  yTop: number,
  yBottom: number,
  colorHex: string
) {
  const yMid = (yTop + yBottom) / 2;
  elementos.push(<line key={k()} x1={x} y1={yTop} x2={x} y2={yMid - 6} stroke="currentColor" strokeWidth={2} className="text-foreground/70" />);
  elementos.push(<line key={k()} x1={x - 12} y1={yMid - 6} x2={x + 12} y2={yMid - 6} stroke={colorHex} strokeWidth={2} />);
  elementos.push(<line key={k()} x1={x - 7} y1={yMid + 4} x2={x + 7} y2={yMid + 4} stroke={colorHex} strokeWidth={4} />);
  elementos.push(<line key={k()} x1={x} y1={yMid + 4} x2={x} y2={yBottom} stroke="currentColor" strokeWidth={2} className="text-foreground/70" />);
  elementos.push(
    <text key={k()} x={x - 20} y={yMid - 2} textAnchor="middle" className="fill-foreground/70 text-[10px] font-bold">
      +
    </text>
  );
  elementos.push(
    <text key={k()} x={x - 20} y={yMid + 18} textAnchor="middle" className="fill-foreground/70 text-[10px] font-bold">
      −
    </text>
  );
}
