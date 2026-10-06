"use client";

import { motion } from "framer-motion";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import type { VisualNumeriaFigura } from "@/lib/numeria/visuales";
import { areaTriangulo, pitagorasCuadrados, rectangulo, sumaAngulos, volumen } from "@/lib/numeria/cursoDatos";
import { COLOR_NUMERIA, MarcoVisual, Resaltado } from "./comun";

// Figuras del curso completo de Numeria (2026-10-06): perímetro y área del
// rectángulo, área del triángulo (la mitad del rectángulo), los ángulos de un
// triángulo que juntos forman una recta, el volumen por capas de cubitos y
// Pitágoras con sus tres cuadrados. Mismo diseño en la app (curso.tsx).

const C1 = "#4FE0F5";
const C2 = "#FF8A3D";
const C3 = "#3DDC97";
type Modo<M> = Extract<VisualNumeriaFigura, { modo: M }>;

function Notas({ lineas, paso }: { lineas: string[]; paso: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {lineas.slice(0, paso).map((l, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={i === paso - 1 ? "" : "opacity-70"}>
          {i === paso - 1 ? <Resaltado><MathText texto={l} /></Resaltado> : <span className="text-sm text-foreground"><MathText texto={l} /></span>}
        </motion.div>
      ))}
    </div>
  );
}

function Rectangulo({ visual }: { visual: Modo<"rectangulo"> }) {
  const d = rectangulo(visual.ancho, visual.alto);
  const { alVer, ...r } = useReproductor({ total: 3, ms: 2400, estatico: visual.estatico, inicio: 1 });
  const c = Math.max(14, Math.min(30, Math.floor(260 / Math.max(d.ancho, d.alto))));
  const w = d.ancho * c;
  const h = d.alto * c;
  const lineas = [`$\\text{lados: } ${d.ancho} \\text{ y } ${d.alto}$`, `$P = 2 \\times (${d.ancho} + ${d.alto}) = ${d.perimetro}$`, `$A = ${d.ancho} \\times ${d.alto} = ${d.area}$`];
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Rectángulo"} titulo={visual.titulo} alternativa={<p>{lineas.join(". ")}</p>} controles={<ControlesReproductor r={r} />}>
      <svg viewBox={`-30 -24 ${w + 60} ${h + 50}`} className="h-auto w-full max-w-[340px]">
        {Array.from({ length: d.ancho * d.alto }, (_, i) => (
          <motion.rect key={i} x={(i % d.ancho) * c + 1} y={Math.floor(i / d.ancho) * c + 1} width={c - 2} height={c - 2} rx={3} initial={false} animate={{ fill: r.paso >= 3 ? C1 : "rgba(127,127,127,0.12)", opacity: 1 }} transition={{ delay: r.paso >= 3 ? i * 0.015 : 0 }} />
        ))}
        <motion.rect x={0} y={0} width={w} height={h} fill="none" stroke={C2} strokeWidth={3} initial={false} animate={{ pathLength: r.paso >= 2 ? 1 : 0 }} transition={{ duration: 1.2 }} />
        <text x={w / 2} y={-8} textAnchor="middle" fontSize={13} fontWeight={800} fill="currentColor">
          {d.ancho}
        </text>
        <text x={-12} y={h / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={800} fill="currentColor">
          {d.alto}
        </text>
      </svg>
      <Notas lineas={lineas} paso={r.paso} />
    </MarcoVisual>
  );
}

function AreaTriangulo({ visual }: { visual: Modo<"areaTriangulo"> }) {
  const d = areaTriangulo(visual.base, visual.altura);
  const { alVer, ...r } = useReproductor({ total: 3, ms: 2600, estatico: visual.estatico, inicio: 1 });
  const esc = Math.min(28, 260 / Math.max(d.base, d.altura));
  const w = d.base * esc;
  const h = d.altura * esc;
  const vx = w * 0.4;
  const lineas = [`$\\text{base } ${d.base}, \\text{ altura } ${d.altura}$`, `$\\text{rectángulo: } ${d.base} \\times ${d.altura} = ${d.rectangulo}$`, `$A = \\frac{${d.base} \\times ${d.altura}}{2} = ${String(d.area).replace(".", ",")}$`];
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Área del triángulo"} titulo={visual.titulo} alternativa={<p>{lineas.join(". ")}</p>} controles={<ControlesReproductor r={r} />}>
      <svg viewBox={`-26 -20 ${w + 52} ${h + 44}`} className="h-auto w-full max-w-[340px]">
        <motion.rect x={0} y={0} width={w} height={h} fill={`${C2}33`} stroke={C2} strokeWidth={2} strokeDasharray="5 4" initial={false} animate={{ opacity: r.paso >= 2 ? 1 : 0 }} />
        <polygon points={`0,${h} ${w},${h} ${vx},0`} fill={`${C1}66`} stroke={C1} strokeWidth={2.5} />
        <line x1={vx} y1={0} x2={vx} y2={h} stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={w / 2} y={h + 18} textAnchor="middle" fontSize={13} fontWeight={800} fill="currentColor">
          {d.base}
        </text>
        <text x={vx + 12} y={h / 2} fontSize={13} fontWeight={800} fill="currentColor">
          {d.altura}
        </text>
        {r.paso >= 3 && (
          <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={w / 2} y={-6} textAnchor="middle" fontSize={12} fontWeight={700} fill={C3}>
            el triángulo es la mitad del rectángulo
          </motion.text>
        )}
      </svg>
      <Notas lineas={lineas} paso={r.paso} />
    </MarcoVisual>
  );
}

function arco(cx: number, cy: number, r: number, desde: number, hasta: number) {
  const p = (g: number) => [cx + r * Math.cos((g * Math.PI) / 180), cy - r * Math.sin((g * Math.PI) / 180)];
  const [x1, y1] = p(desde);
  const [x2, y2] = p(hasta);
  return `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${hasta - desde > 180 ? 1 : 0} 0 ${x2} ${y2} Z`;
}

function SumaAngulos({ visual }: { visual: Modo<"sumaAngulos"> }) {
  const d = sumaAngulos(visual.a, visual.b);
  const { alVer, ...r } = useReproductor({ total: 3, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (d.c <= 0) return null;
  // Triángulo con los ángulos reales en A (izquierda) y B (derecha).
  const L = 220;
  const ta = Math.tan((d.a * Math.PI) / 180);
  const tb = Math.tan((d.b * Math.PI) / 180);
  const px = (L * tb) / (ta + tb);
  const py = px * ta;
  const esc = Math.min(1, 150 / py);
  const A = [20, 170];
  const B = [20 + L * esc, 170];
  const P = [20 + px * esc, 170 - py * esc];
  const lineas = [`$\\hat{A} = ${d.a}°, \\ \\hat{B} = ${d.b}°$`, `$\\hat{A} + \\hat{B} + \\hat{C} = 180°$`, `$\\hat{C} = 180° - ${d.a}° - ${d.b}° = ${d.c}°$`];
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Ángulos del triángulo"} titulo={visual.titulo} alternativa={<p>{lineas.join(". ")}</p>} controles={<ControlesReproductor r={r} />}>
      <svg viewBox="0 0 360 260" className="h-auto w-full max-w-[360px]">
        <polygon points={`${A} ${B} ${P}`} fill={`${COLOR_NUMERIA}22`} stroke={COLOR_NUMERIA} strokeWidth={2.5} />
        <path d={arco(A[0], A[1], 26, 0, d.a)} fill={`${C1}aa`} />
        <path d={arco(B[0], B[1], 26, 180 - d.b, 180)} fill={`${C2}aa`} />
        <path d={arco(P[0], P[1], 22, 180 + d.a, 360 - d.b)} fill={`${C3}${r.paso >= 3 ? "dd" : "33"}`} />
        <text x={A[0] + 34} y={A[1] - 6} fontSize={12} fontWeight={800} fill={C1}>
          {d.a}°
        </text>
        <text x={B[0] - 56} y={B[1] - 6} fontSize={12} fontWeight={800} fill={C2}>
          {d.b}°
        </text>
        <text x={P[0] - 10} y={P[1] + 40} fontSize={12} fontWeight={800} fill={C3}>
          {r.paso >= 3 ? `${d.c}°` : "?"}
        </text>
        {/* Los tres ángulos juntos forman media vuelta (una recta) */}
        <motion.g initial={false} animate={{ opacity: r.paso >= 2 ? 1 : 0 }}>
          <line x1={210} y1={240} x2={350} y2={240} stroke="currentColor" strokeWidth={2} />
          <path d={arco(280, 240, 40, 0, d.a)} fill={`${C1}aa`} />
          <path d={arco(280, 240, 40, d.a, d.a + d.c)} fill={`${C3}aa`} />
          <path d={arco(280, 240, 40, d.a + d.c, 180)} fill={`${C2}aa`} />
          <text x={280} y={192} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
            180°: una recta
          </text>
        </motion.g>
      </svg>
      <Notas lineas={lineas} paso={r.paso} />
    </MarcoVisual>
  );
}

function Volumen({ visual }: { visual: Modo<"volumen"> }) {
  const d = volumen(visual.largo, visual.ancho, visual.alto);
  const { alVer, ...r } = useReproductor({ total: d.alto + 2, ms: 1500, estatico: visual.estatico, inicio: 1 });
  const s = Math.max(10, Math.min(22, 120 / Math.max(d.largo, d.ancho, d.alto)));
  const iso = (x: number, y: number, z: number) => [160 + (x - y) * s * 0.87, 200 + (x + y) * s * 0.5 - z * s];
  const capas = Math.min(d.alto, Math.max(0, r.paso - 1));
  const cubos: { x: number; y: number; z: number }[] = [];
  for (let z = 0; z < capas; z++) for (let y = d.ancho - 1; y >= 0; y--) for (let x = d.largo - 1; x >= 0; x--) cubos.push({ x, y, z });
  cubos.sort((u, v) => u.z - v.z || v.x + v.y - (u.x + u.y));
  const cara = (pts: number[][], fill: string) => <polygon points={pts.map((q) => q.join(",")).join(" ")} fill={fill} stroke="#0B1020" strokeWidth={0.8} />;
  const lineas = [`$\\text{caja de } ${d.largo} \\times ${d.ancho} \\times ${d.alto}$`, `$\\text{una capa: } ${d.largo} \\times ${d.ancho} = ${d.capa} \\text{ cubitos}$`, `$V = ${d.capa} \\times ${d.alto} = ${d.volumen}$`];
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Volumen"} titulo={visual.titulo} alternativa={<p>{lineas.join(". ")}</p>} controles={<ControlesReproductor r={r} />}>
      <svg viewBox="0 0 320 240" className="h-auto w-full max-w-[340px]">
        {cubos.map((q, i) => {
          const a = iso(q.x, q.y, q.z + 1);
          const b = iso(q.x + 1, q.y, q.z + 1);
          const c = iso(q.x + 1, q.y + 1, q.z + 1);
          const e = iso(q.x, q.y + 1, q.z + 1);
          const b0 = iso(q.x + 1, q.y, q.z);
          const c0 = iso(q.x + 1, q.y + 1, q.z);
          const e0 = iso(q.x, q.y + 1, q.z);
          return (
            <motion.g key={`${q.x}-${q.y}-${q.z}`} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % (d.largo * d.ancho)) * 0.02 }}>
              {cara([a, b, c, e], C1)}
              {cara([b, c, c0, b0], "#2BA9BD")}
              {cara([e, c, c0, e0], "#1F7E8E")}
            </motion.g>
          );
        })}
      </svg>
      <Notas lineas={lineas.slice(0, r.paso >= d.alto + 1 ? 3 : r.paso >= 2 ? 2 : 1)} paso={r.paso >= d.alto + 1 ? 3 : r.paso >= 2 ? 2 : 1} />
    </MarcoVisual>
  );
}

function Pitagoras({ visual }: { visual: Modo<"pitagoras"> }) {
  const d = pitagorasCuadrados(visual.cateto1, visual.cateto2);
  const { alVer, ...r } = useReproductor({ total: 4, ms: 2600, estatico: visual.estatico, inicio: 1 });
  const esc = Math.min(16, 90 / Math.max(d.c1, d.c2));
  const a = d.c1 * esc;
  const b = d.c2 * esc;
  const O = [150, 170];
  const X = [O[0] + a, O[1]];
  const Y = [O[0], O[1] - b];
  const h = Math.hypot(a, b);
  const nx = b / h;
  const ny = a / h;
  const sq = (p: number[], q: number[], dx: number, dy: number) => `${p} ${q} ${q[0] + dx},${q[1] + dy} ${p[0] + dx},${p[1] + dy}`;
  const hTxt = Number.isInteger(d.h) ? String(d.h) : d.h.toFixed(2).replace(".", ",");
  const lineas = [`$\\text{catetos } ${d.c1} \\text{ y } ${d.c2}$`, `$${d.c1}^2 = ${d.a1}, \\quad ${d.c2}^2 = ${d.a2}$`, `$c^2 = ${d.a1} + ${d.a2} = ${d.h2}$`, `$c = \\sqrt{${d.h2}} = ${hTxt}$`];
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Pitágoras"} titulo={visual.titulo} alternativa={<p>{lineas.join(". ")}</p>} controles={<ControlesReproductor r={r} />}>
      <svg viewBox="0 0 340 300" className="h-auto w-full max-w-[340px]">
        <motion.polygon points={sq(O, X, 0, a)} fill={`${C1}55`} stroke={C1} strokeWidth={2} initial={false} animate={{ opacity: r.paso >= 2 ? 1 : 0.1 }} />
        <motion.polygon points={sq(Y, O, -b, 0)} fill={`${C2}55`} stroke={C2} strokeWidth={2} initial={false} animate={{ opacity: r.paso >= 2 ? 1 : 0.1 }} />
        <motion.polygon points={sq(X, Y, h * nx, -h * ny)} fill={`${C3}55`} stroke={C3} strokeWidth={2} initial={false} animate={{ opacity: r.paso >= 3 ? 1 : 0.1 }} />
        <polygon points={`${O} ${X} ${Y}`} fill={`${COLOR_NUMERIA}55`} stroke={COLOR_NUMERIA} strokeWidth={2.5} />
        <text x={O[0] + a / 2} y={O[1] + a / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill={C1}>
          {d.a1}
        </text>
        <text x={O[0] - b / 2} y={O[1] - b / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill={C2}>
          {d.a2}
        </text>
        <text x={(X[0] + Y[0]) / 2 + (h * nx) / 2} y={(X[1] + Y[1]) / 2 - (h * ny) / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill={C3}>
          {r.paso >= 3 ? d.h2 : "?"}
        </text>
      </svg>
      <Notas lineas={lineas} paso={r.paso} />
    </MarcoVisual>
  );
}

export function FiguraCurso({ visual }: { visual: VisualNumeriaFigura }) {
  if (visual.modo === "rectangulo") return <Rectangulo visual={visual} />;
  if (visual.modo === "areaTriangulo") return <AreaTriangulo visual={visual} />;
  if (visual.modo === "sumaAngulos") return <SumaAngulos visual={visual} />;
  if (visual.modo === "volumen") return <Volumen visual={visual} />;
  if (visual.modo === "pitagoras") return <Pitagoras visual={visual} />;
  return null;
}
