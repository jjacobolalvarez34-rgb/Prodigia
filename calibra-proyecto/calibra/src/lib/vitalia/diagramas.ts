// Dibujos de Vitalia (célula animal y vegetal, fases de la mitosis), como
// lista de formas que la web y la app pintan igual. Los usan las preguntas
// («¿qué señala la flecha?») y las lecciones de Aprender.
import { puntaFlecha, r, type Dibujo, type Primitiva } from "@/lib/dibujo/primitivas";
import type { DiagramaVitalia, FaseMitosis, Organelo } from "./tipos";

const C = {
  nucleo: "#A78BFA",
  mitocondria: "#FB923C",
  ribosoma: "#F472B6",
  reticulo: "#C084FC",
  golgi: "#FBBF24",
  lisosoma: "#F87171",
  cloroplasto: "#4ADE80",
  vacuola: "#38BDF8",
  pared: "#65A30D",
  flecha: "#FACC15",
};

interface Pieza {
  prims: Primitiva[];
  // Punto al que apunta la flecha cuando se señala esta parte.
  punto: [number, number];
}

function mitocondria(cx: number, cy: number, rot: number): Primitiva[] {
  const a = (rot * Math.PI) / 180;
  const zig: string[] = [];
  for (let k = -3; k <= 3; k++) {
    const x = k * 4;
    const y = k % 2 === 0 ? -3 : 3;
    zig.push(`${r(cx + x * Math.cos(a) - y * Math.sin(a))} ${r(cy + x * Math.sin(a) + y * Math.cos(a))}`);
  }
  return [
    { t: "elipse", cx, cy, rx: 17, ry: 8, rot, fill: C.mitocondria, op: 0.55, stroke: C.mitocondria, sw: 1.5 },
    { t: "camino", d: "M" + zig.join(" L"), stroke: "#7C2D12", sw: 1.2 },
  ];
}

function cloroplasto(cx: number, cy: number, rot: number): Primitiva[] {
  const out: Primitiva[] = [{ t: "elipse", cx, cy, rx: 15, ry: 8, rot, fill: C.cloroplasto, op: 0.5, stroke: "#15803D", sw: 1.5 }];
  const a = (rot * Math.PI) / 180;
  for (const k of [-6, 0, 6]) {
    const x = cx + k * Math.cos(a);
    const y = cy + k * Math.sin(a);
    out.push({ t: "linea", x1: r(x - 3 * Math.sin(a)), y1: r(y + 3 * Math.cos(a)), x2: r(x + 3 * Math.sin(a)), y2: r(y - 3 * Math.cos(a)), stroke: "#166534", sw: 2 });
  }
  return out;
}

function reticulo(x: number, y: number): Primitiva[] {
  return [0, 8, 16].map((dy) => ({ t: "camino" as const, d: `M${x} ${y + dy} q6 -6 12 0 t12 0 t12 0`, stroke: C.reticulo, sw: 2.2 }));
}

function golgi(x: number, y: number): Primitiva[] {
  return [0, 6, 12].map((dy, i) => ({ t: "camino" as const, d: `M${x + i * 2} ${y + dy} q${14 - i * 2} -7 ${28 - i * 4} 0`, stroke: C.golgi, sw: 2.6 }));
}

function ribosomas(pts: [number, number][]): Primitiva[] {
  return pts.map(([cx, cy]) => ({ t: "circulo" as const, cx, cy, r: 2, fill: C.ribosoma }));
}

function piezasAnimal(): Record<Organelo, Pieza | null> {
  return {
    membrana: { prims: [{ t: "elipse", cx: 130, cy: 95, rx: 112, ry: 78, fill: "acento", op: 0.1, stroke: "acento", sw: 2.5 }], punto: [130, 17] },
    nucleo: { prims: [{ t: "elipse", cx: 130, cy: 88, rx: 30, ry: 24, fill: C.nucleo, op: 0.35, stroke: C.nucleo, sw: 2 }, { t: "circulo", cx: 136, cy: 84, r: 7, fill: C.nucleo, op: 0.8 }], punto: [130, 70] },
    mitocondria: { prims: mitocondria(62, 70, 20), punto: [62, 70] },
    ribosoma: { prims: ribosomas([[186, 58], [194, 64], [178, 66], [200, 76], [70, 128], [78, 134]]), punto: [194, 64] },
    reticulo: { prims: reticulo(168, 82), punto: [180, 90] },
    golgi: { prims: golgi(150, 128), punto: [164, 131] },
    lisosoma: { prims: [{ t: "circulo", cx: 95, cy: 140, r: 8, fill: C.lisosoma, op: 0.55, stroke: C.lisosoma, sw: 1.5 }], punto: [95, 140] },
    vacuola: { prims: [{ t: "circulo", cx: 205, cy: 118, r: 10, fill: C.vacuola, op: 0.4, stroke: C.vacuola, sw: 1.5 }], punto: [205, 118] },
    cloroplasto: null,
    pared: null,
  };
}

function piezasVegetal(): Record<Organelo, Pieza | null> {
  return {
    pared: { prims: [{ t: "rect", x: 14, y: 14, w: 232, h: 162, r: 14, stroke: C.pared, sw: 7 }], punto: [246, 120] },
    membrana: { prims: [{ t: "rect", x: 22, y: 22, w: 216, h: 146, r: 10, fill: "acento", op: 0.08, stroke: "acento", sw: 1.5 }], punto: [130, 22] },
    vacuola: { prims: [{ t: "elipse", cx: 150, cy: 98, rx: 52, ry: 40, fill: C.vacuola, op: 0.28, stroke: C.vacuola, sw: 1.5 }], punto: [150, 98] },
    nucleo: { prims: [{ t: "elipse", cx: 62, cy: 62, rx: 24, ry: 20, fill: C.nucleo, op: 0.35, stroke: C.nucleo, sw: 2 }, { t: "circulo", cx: 66, cy: 58, r: 6, fill: C.nucleo, op: 0.8 }], punto: [62, 48] },
    cloroplasto: { prims: [...cloroplasto(54, 136, -15), ...cloroplasto(212, 44, 20), ...cloroplasto(220, 150, 0)], punto: [54, 136] },
    mitocondria: { prims: mitocondria(104, 150, 0), punto: [104, 150] },
    ribosoma: { prims: ribosomas([[100, 40], [108, 46], [92, 48], [36, 100], [44, 106]]), punto: [100, 40] },
    reticulo: { prims: reticulo(34, 82), punto: [46, 90] },
    golgi: { prims: golgi(176, 140), punto: [190, 143] },
    lisosoma: null,
  };
}

const ANCHO = 260;
const ALTO = 190;

export function dibujoCelula(variante: "animal" | "vegetal", senalado?: Organelo, resaltar?: Organelo): Dibujo {
  const piezas = variante === "animal" ? piezasAnimal() : piezasVegetal();
  const orden: Organelo[] = variante === "animal" ? ["membrana", "nucleo", "reticulo", "golgi", "mitocondria", "lisosoma", "vacuola", "ribosoma"] : ["pared", "membrana", "vacuola", "nucleo", "reticulo", "golgi", "cloroplasto", "mitocondria", "ribosoma"];
  const prims: Primitiva[] = [];
  for (const o of orden) {
    const p = piezas[o];
    if (!p) continue;
    const apagar = resaltar && resaltar !== o && o !== "membrana" && o !== "pared";
    for (const x of p.prims) prims.push(apagar ? ({ ...x, op: ((x as { op?: number }).op ?? 1) * 0.3 } as Primitiva) : x);
  }
  const objetivo = senalado ? piezas[senalado] : null;
  if (objetivo) {
    const [tx, ty] = objetivo.punto;
    // La flecha entra desde el borde más cercano.
    const sx = tx < ANCHO / 2 ? Math.max(4, tx - 46) : Math.min(ANCHO - 4, tx + 46);
    const sy = ty < ALTO / 2 ? Math.max(4, ty - 34) : Math.min(ALTO - 4, ty + 34);
    prims.push({ t: "linea", x1: r(sx), y1: r(sy), x2: tx, y2: ty, stroke: C.flecha, sw: 3.5 });
    prims.push({ t: "camino", d: puntaFlecha(sx, sy, tx, ty, 11, 6), fill: C.flecha });
  }
  return { ancho: ANCHO, alto: ALTO, prims };
}

// Un cromosoma duplicado (dos cromátidas unidas en el centro) o una cromátida suelta.
function cromosoma(x: number, y: number, col: string, solo?: "izq" | "der"): Primitiva[] {
  if (solo) {
    const s = solo === "izq" ? -1 : 1;
    return [{ t: "camino", d: `M${x - 6 * s} ${y - 9} L${x} ${y} L${x - 6 * s} ${y + 9}`, stroke: col, sw: 3.5 }];
  }
  return [
    { t: "camino", d: `M${x - 6} ${y - 10} Q${x} ${y} ${x - 6} ${y + 10}`, stroke: col, sw: 3.5 },
    { t: "camino", d: `M${x + 6} ${y - 10} Q${x} ${y} ${x + 6} ${y + 10}`, stroke: col, sw: 3.5 },
  ];
}

const COLS_CROMO = ["#F472B6", "#60A5FA", "#F472B6", "#60A5FA"];

export function dibujoDivision(fase: FaseMitosis): Dibujo {
  const W = 260;
  const H = 160;
  const prims: Primitiva[] = [];
  const cy = 80;
  const huso = (px: number, objetivos: [number, number][]) => {
    for (const [x, y] of objetivos) prims.push({ t: "linea", x1: px, y1: cy, x2: x, y2: y, stroke: "texto2", sw: 1, op: 0.5 });
    prims.push({ t: "circulo", cx: px, cy, r: 4, fill: "texto2" });
  };
  if (fase === "telofase") {
    prims.push({ t: "camino", d: "M130 22 C70 10 14 40 14 80 C14 120 70 150 130 138 C190 150 246 120 246 80 C246 40 190 10 130 22 Z", fill: "acento", op: 0.1, stroke: "acento", sw: 2.5 });
    prims.push({ t: "camino", d: "M130 22 Q122 80 130 138", stroke: "acento", sw: 2, dash: "5 4" });
    for (const nx of [72, 188]) {
      prims.push({ t: "elipse", cx: nx, cy, rx: 30, ry: 24, fill: "#A78BFA", op: 0.25, stroke: "#A78BFA", sw: 2 });
      prims.push({ t: "camino", d: `M${nx - 16} ${cy - 6} q8 12 16 0 t16 0 M${nx - 14} ${cy + 8} q7 -10 14 0 t14 0`, stroke: "#F472B6", sw: 2, op: 0.8 });
    }
    return { ancho: W, alto: H, prims };
  }
  prims.push({ t: "elipse", cx: 130, cy, rx: 118, ry: 68, fill: "acento", op: 0.1, stroke: "acento", sw: 2.5 });
  if (fase === "profase") {
    prims.push({ t: "elipse", cx: 130, cy, rx: 48, ry: 40, stroke: "#A78BFA", sw: 2, dash: "5 5", op: 0.8 });
    const pos: [number, number][] = [
      [108, 62],
      [146, 66],
      [118, 98],
      [152, 96],
    ];
    pos.forEach(([x, y], i) => prims.push(...cromosoma(x, y, COLS_CROMO[i])));
    prims.push({ t: "circulo", cx: 64, cy, r: 4, fill: "texto2" }, { t: "circulo", cx: 196, cy, r: 4, fill: "texto2" });
    return { ancho: W, alto: H, prims };
  }
  if (fase === "metafase") {
    const ys = [44, 68, 92, 116];
    huso(30, ys.map((y) => [124, y]));
    huso(230, ys.map((y) => [136, y]));
    ys.forEach((y, i) => prims.push(...cromosoma(130, y, COLS_CROMO[i])));
    return { ancho: W, alto: H, prims };
  }
  // anafase
  const ys = [50, 70, 90, 110];
  huso(30, ys.map((y) => [74, y]));
  huso(230, ys.map((y) => [186, y]));
  ys.forEach((y, i) => {
    prims.push(...cromosoma(80, y, COLS_CROMO[i], "izq"));
    prims.push(...cromosoma(180, y, COLS_CROMO[i], "der"));
  });
  return { ancho: W, alto: H, prims };
}

export function dibujoVitalia(d: DiagramaVitalia): Dibujo {
  return d.tipo === "celula" ? dibujoCelula(d.variante, d.senalado) : dibujoDivision(d.fase);
}
