"use client";

import { motion } from "framer-motion";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import type {
  VisualNumeriaDecimal,
  VisualNumeriaDistributiva,
  VisualNumeriaEcuacion,
  VisualNumeriaExponentes,
  VisualNumeriaMetodoFraccion,
  VisualNumeriaPorcentaje,
  VisualNumeriaRaiz,
  VisualNumeriaTerminos,
} from "@/lib/numeria/visuales";
import {
  decimal,
  distributiva,
  ecuacion,
  expresionTex,
  exponentes,
  metodoFraccion,
  porcentaje,
  raiz,
  terminosSemejantes,
  type PasoCurso,
} from "@/lib/numeria/cursoDatos";
import { COLOR_NUMERIA, MarcoVisual } from "./comun";

// Visuales del curso completo de Numeria (2026-10-06). Cada uno es una figura
// animada (la carita feliz, la X de la división en cruz, las orejas, barras,
// cuadrícula, fichas, balanza…) más el pizarrón con los pasos, que se van
// escribiendo de a uno. Los números salen de src/lib/numeria/cursoDatos.ts.
// En la app: mobile/src/ui/aprender/numeria/curso.tsx (mismo diseño).

const C1 = "#4FE0F5";
const C2 = "#FF8A3D";
const C3 = "#3DDC97";
const ease = [0.16, 1, 0.3, 1] as const;

function Pizarra({ pasos, paso }: { pasos: PasoCurso[]; paso: number }) {
  const visibles = pasos.slice(0, Math.max(1, paso));
  return (
    <ol className="flex w-full flex-col gap-1.5">
      {visibles.map((p, i) => {
        const actual = i === visibles.length - 1;
        return (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease }}
            className={`rounded-xl border px-3 py-2 ${actual ? "border-primario/60 bg-primario/10" : "border-border bg-background/60 opacity-80"}`}
          >
            <div className="overflow-x-auto text-center text-base text-foreground">
              <MathText texto={`$${p.tex}$`} />
            </div>
            {actual && <p className="mt-1 text-center text-xs text-texto-secundario">{p.nota}</p>}
          </motion.li>
        );
      })}
    </ol>
  );
}

function Linea({ x1, y1, x2, y2, color, visible, ancho = 2.5 }: { x1: number; y1: number; x2: number; y2: number; color: string; visible: boolean; ancho?: number }) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={ancho}
      strokeLinecap="round"
      initial={false}
      animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6, ease }}
    />
  );
}

function Curva({ d, color, visible, ancho = 2.5 }: { d: string; color: string; visible: boolean; ancho?: number }) {
  return <motion.path d={d} fill="none" stroke={color} strokeWidth={ancho} strokeLinecap="round" initial={false} animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }} transition={{ duration: 0.7, ease }} />;
}

function Etiqueta({ x, y, texto, color, visible, tam = 14 }: { x: number; y: number; texto: string; color: string; visible: boolean; tam?: number }) {
  return (
    <motion.text x={x} y={y} textAnchor="middle" fontSize={tam} fontWeight={800} fill={color} initial={false} animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6 }} transition={{ duration: 0.35 }} style={{ transformOrigin: `${x}px ${y}px` }}>
      {texto}
    </motion.text>
  );
}

// Una fracción dibujada en SVG (numerador, raya y denominador).
function FraccionSvg({ x, y, n, d, color = "currentColor", tam = 22 }: { x: number; y: number; n: number | string; d: number | string; color?: string; tam?: number }) {
  return (
    <g>
      <text x={x} y={y - 8} textAnchor="middle" fontSize={tam} fontWeight={800} fill={color}>
        {n}
      </text>
      <line x1={x - tam * 0.8} y1={y} x2={x + tam * 0.8} y2={y} stroke={color} strokeWidth={2} />
      <text x={x} y={y + tam + 2} textAnchor="middle" fontSize={tam} fontWeight={800} fill={color}>
        {d}
      </text>
    </g>
  );
}

// Barra partida en `den` piezas con `num` pintadas (num puede pasar de den: varias barras).
function Barra({ num, den, ancho = 300, color, visible = true }: { num: number; den: number; ancho?: number; color: string; visible?: boolean }) {
  const barras = Math.max(1, Math.ceil(num / den));
  return (
    <motion.div className="flex flex-wrap justify-center gap-1.5" initial={false} animate={{ opacity: visible ? 1 : 0.15 }} transition={{ duration: 0.4 }}>
      {Array.from({ length: barras }, (_, bi) => (
        <div key={bi} className="flex overflow-hidden rounded-md border" style={{ width: Math.min(ancho, 300), borderColor: COLOR_NUMERIA }}>
          {Array.from({ length: den }, (_, i) => {
            const lleno = bi * den + i < num;
            return (
              <motion.span
                key={i}
                className="h-6 flex-1 border-r border-border last:border-r-0"
                initial={false}
                animate={{ backgroundColor: lleno ? color : "rgba(0,0,0,0)" }}
                transition={{ duration: 0.3, delay: visible ? (bi * den + i) * 0.03 : 0 }}
              />
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}

// ---------- Fracciones: todos los métodos ----------
export function MetodoFraccion({ visual }: { visual: VisualNumeriaMetodoFraccion }) {
  const datos = metodoFraccion({ modo: visual.modo, fracciones: visual.fracciones, operacion: visual.operacion, factor: visual.factor });
  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const [[a, b], [c, d] = [0, 1]] = datos.fracciones;
  const op = visual.operacion === "resta" ? "−" : "+";
  const [rn, rd] = datos.resultado;
  const fin = p >= datos.pasos.length;
  let figura: React.ReactNode = null;

  if (visual.modo === "carita" || visual.modo === "cruz") {
    const esCarita = visual.modo === "carita";
    figura = (
      <svg viewBox="0 0 360 190" className="h-auto w-full max-w-[380px] text-foreground">
        <FraccionSvg x={100} y={92} n={a} d={b} />
        <text x={155} y={100} textAnchor="middle" fontSize={24} fontWeight={800} fill={COLOR_NUMERIA}>
          {esCarita ? op : "÷"}
        </text>
        <FraccionSvg x={210} y={92} n={c} d={d} />
        <Linea x1={108} y1={74} x2={200} y2={110} color={C1} visible={p >= 2} />
        <Linea x1={108} y1={110} x2={200} y2={74} color={C2} visible={p >= 3} />
        {esCarita ? (
          <>
            <motion.circle cx={70} cy={40} r={16} fill="none" stroke={C1} strokeWidth={2.5} initial={false} animate={{ opacity: p >= 2 ? 1 : 0, scale: p >= 2 ? 1 : 0.4 }} />
            <Etiqueta x={70} y={45} texto={String(datos.productos[0])} color={C1} visible={p >= 2} />
            <motion.circle cx={240} cy={40} r={16} fill="none" stroke={C2} strokeWidth={2.5} initial={false} animate={{ opacity: p >= 3 ? 1 : 0, scale: p >= 3 ? 1 : 0.4 }} />
            <Etiqueta x={240} y={45} texto={String(datos.productos[1])} color={C2} visible={p >= 3} />
            <Curva d="M88 150 Q155 205 222 150" color={C3} visible={p >= 4} ancho={3} />
            <Etiqueta x={155} y={186} texto={String(datos.productos[2])} color={C3} visible={p >= 4} />
          </>
        ) : (
          <>
            <Etiqueta x={154} y={40} texto={`${a}×${d} = ${datos.productos[0]}`} color={C1} visible={p >= 2} />
            <Etiqueta x={154} y={160} texto={`${b}×${c} = ${datos.productos[1]}`} color={C2} visible={p >= 3} />
          </>
        )}
        <motion.g initial={false} animate={{ opacity: p >= (esCarita ? 5 : 4) ? 1 : 0, x: p >= (esCarita ? 5 : 4) ? 0 : -20 }} transition={{ duration: 0.4 }}>
          <text x={258} y={100} fontSize={22} fontWeight={800} fill={COLOR_NUMERIA}>
            =
          </text>
          <FraccionSvg x={312} y={92} n={fin ? rn : esCarita ? datos.productos[0] + (visual.operacion === "resta" ? -datos.productos[1] : datos.productos[1]) : datos.productos[0]} d={fin ? rd : esCarita ? datos.productos[2] : datos.productos[1]} color={COLOR_NUMERIA} />
        </motion.g>
      </svg>
    );
  } else if (visual.modo === "oreja") {
    figura = (
      <svg viewBox="0 0 340 200" className="h-auto w-full max-w-[360px] text-foreground">
        <text x={120} y={36} textAnchor="middle" fontSize={22} fontWeight={800} fill="currentColor">
          {a}
        </text>
        <line x1={102} y1={46} x2={138} y2={46} stroke="currentColor" strokeWidth={2} />
        <text x={120} y={72} textAnchor="middle" fontSize={22} fontWeight={800} fill="currentColor">
          {b}
        </text>
        <line x1={84} y1={92} x2={156} y2={92} stroke={COLOR_NUMERIA} strokeWidth={3.5} />
        <text x={120} y={128} textAnchor="middle" fontSize={22} fontWeight={800} fill="currentColor">
          {c}
        </text>
        <line x1={102} y1={138} x2={138} y2={138} stroke="currentColor" strokeWidth={2} />
        <text x={120} y={164} textAnchor="middle" fontSize={22} fontWeight={800} fill="currentColor">
          {d}
        </text>
        <Curva d="M134 28 C210 20 210 170 134 160" color={C1} visible={p >= 2} ancho={3} />
        <Curva d="M134 66 C170 72 170 116 134 122" color={C2} visible={p >= 3} ancho={3} />
        <Etiqueta x={232} y={60} texto={`${a}×${d} = ${datos.productos[0]}`} color={C1} visible={p >= 2} tam={13} />
        <Etiqueta x={232} y={130} texto={`${b}×${c} = ${datos.productos[1]}`} color={C2} visible={p >= 3} tam={13} />
        <motion.g initial={false} animate={{ opacity: p >= 4 ? 1 : 0 }}>
          <FraccionSvg x={300} y={100} n={fin ? rn : datos.productos[0]} d={fin ? rd : datos.productos[1]} color={COLOR_NUMERIA} />
        </motion.g>
      </svg>
    );
  } else if (visual.modo === "multiplicar") {
    const [k1, k2] = datos.factores ?? [1, 1];
    figura = (
      <svg viewBox="0 0 360 170" className="h-auto w-full max-w-[380px] text-foreground">
        <FraccionSvg x={90} y={80} n={a} d={b} />
        <text x={145} y={88} textAnchor="middle" fontSize={22} fontWeight={800} fill={COLOR_NUMERIA}>
          ×
        </text>
        <FraccionSvg x={200} y={80} n={c} d={d} />
        {(k1 > 1 || k2 > 1) && (
          <>
            <Linea x1={98} y1={62} x2={192} y2={98} color={C1} visible={p >= 2 && k1 > 1} ancho={1.5} />
            <Linea x1={98} y1={98} x2={192} y2={62} color={C2} visible={p >= 2 && k2 > 1} ancho={1.5} />
            {k1 > 1 && <Etiqueta x={90} y={36} texto={String(a / k1)} color={C1} visible={p >= 2} tam={13} />}
            {k1 > 1 && <Etiqueta x={200} y={140} texto={String(d / k1)} color={C1} visible={p >= 2} tam={13} />}
            {k2 > 1 && <Etiqueta x={200} y={36} texto={String(c / k2)} color={C2} visible={p >= 2} tam={13} />}
            {k2 > 1 && <Etiqueta x={90} y={140} texto={String(b / k2)} color={C2} visible={p >= 2} tam={13} />}
          </>
        )}
        <motion.g initial={false} animate={{ opacity: fin ? 1 : 0.15 }}>
          <text x={250} y={88} fontSize={22} fontWeight={800} fill={COLOR_NUMERIA}>
            =
          </text>
          <FraccionSvg x={305} y={80} n={rn} d={rd} color={COLOR_NUMERIA} />
        </motion.g>
      </svg>
    );
  } else if (visual.modo === "mcmVarias") {
    const fs = datos.fracciones;
    const paso = 320 / fs.length;
    figura = (
      <svg viewBox="0 0 360 200" className="h-auto w-full max-w-[380px] text-foreground">
        {fs.map((f, i) => {
          const x = 30 + paso * i + paso / 2;
          return (
            <g key={i}>
              <FraccionSvg x={x} y={50} n={f[0]} d={f[1]} tam={20} />
              <Etiqueta x={x} y={104} texto={`×${datos.factores?.[i]}`} color={C2} visible={p >= 3} tam={13} />
              <Linea x1={x} y1={82} x2={x} y2={120} color={C2} visible={p >= 3} ancho={1.5} />
              <motion.g initial={false} animate={{ opacity: p >= 3 ? 1 : 0, y: p >= 3 ? 0 : -10 }} transition={{ delay: i * 0.15 }}>
                <FraccionSvg x={x} y={150} n={datos.productos[i]} d={datos.mcm ?? 1} color={C1} tam={18} />
              </motion.g>
            </g>
          );
        })}
        <Etiqueta x={180} y={20} texto={`MCM = ${datos.mcm}`} color={C3} visible={p >= 2} />
      </svg>
    );
  } else if (visual.modo === "amplificar" || visual.modo === "simplificar") {
    const k = datos.factores?.[0] ?? 1;
    const [n2, d2] = visual.modo === "amplificar" ? [a * k, b * k] : [rn, rd];
    figura = (
      <div className="flex w-full flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="w-12 text-center">
            <MathText texto={`$\\frac{${a}}{${b}}$`} />
          </span>
          <Barra num={a} den={b} color={C1} />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 text-center">
            <MathText texto={`$\\frac{${n2}}{${d2}}$`} />
          </span>
          <Barra num={n2} den={d2} color={C2} visible={p >= 2} />
        </div>
        {p >= 3 && <p className="text-sm font-semibold text-correcto">Las dos barras pintadas miden lo mismo.</p>}
      </div>
    );
  } else if (visual.modo === "igualDen") {
    figura = (
      <div className="flex w-full flex-col items-center gap-3">
        <Barra num={a} den={b} color={C1} />
        <Barra num={c} den={d} color={C2} />
        <Barra num={datos.productos[0]} den={b} color={C3} visible={p >= 2} />
      </div>
    );
  } else if (visual.modo === "mixto") {
    figura = (
      <div className="flex w-full flex-col items-center gap-2">
        <Barra num={a} den={b} color={C1} />
        {p >= 2 && (
          <p className="text-sm font-semibold text-foreground">
            {datos.entero} {datos.entero === 1 ? "entero completo" : "enteros completos"} y {datos.resto} {datos.resto === 1 ? "pieza" : "piezas"} de {b}
          </p>
        )}
      </div>
    );
  }

  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Fracciones"} titulo={visual.titulo} alternativa={<ol>{datos.pasos.map((x, i) => <li key={i}>{x.nota}</li>)}</ol>} controles={<ControlesReproductor r={r} />}>
      {figura}
      <Pizarra pasos={datos.pasos} paso={p} />
    </MarcoVisual>
  );
}

// ---------- Decimales ----------
export function Decimal({ visual }: { visual: VisualNumeriaDecimal }) {
  const datos = decimal({ modo: visual.modo, a: visual.a, b: visual.b, operacion: visual.operacion, num: visual.num, den: visual.den });
  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2400, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const fin = p >= datos.pasos.length;
  let figura: React.ReactNode = null;
  if (datos.celdas) {
    const enteros = datos.celdas.filter((c) => c.posicion >= 0);
    const decs = datos.celdas.filter((c) => c.posicion < 0);
    const celda = (c: (typeof datos.celdas)[number], i: number) => (
      <motion.div key={c.posicion} className="flex flex-col items-center gap-1" initial={false} animate={{ opacity: i < p ? 1 : 0.25, y: i === p - 1 ? -4 : 0 }}>
        <span className="text-[10px] font-semibold uppercase text-texto-secundario">{c.nombre}</span>
        <span className={`flex h-12 w-11 items-center justify-center rounded-lg border-2 font-mono text-2xl font-bold ${i === p - 1 ? "border-primario bg-primario/15" : "border-border bg-surface"}`}>{c.digito}</span>
      </motion.div>
    );
    figura = (
      <div className="flex items-end gap-1.5 overflow-x-auto">
        {enteros.map((c, i) => celda(c, i))}
        <span className="pb-2 font-mono text-3xl font-black text-logro">,</span>
        {decs.map((c, i) => celda(c, enteros.length + i))}
      </div>
    );
  } else if (datos.filas) {
    const op = visual.modo === "multiplicar" ? "×" : visual.operacion === "resta" ? "−" : "+";
    const filas = [...datos.filas, fin ? datos.resultado : ""];
    const ancho = Math.max(...filas.map((f) => f.length));
    figura = (
      <div className="flex flex-col items-end gap-1 font-mono text-2xl font-bold text-foreground">
        {filas.map((f, i) => (
          <motion.div key={i} className="flex items-center gap-2" initial={false} animate={{ opacity: i < 2 || fin ? 1 : 0 }}>
            <span className="w-5 text-center text-lg" style={{ color: COLOR_NUMERIA }}>
              {i === 1 ? op : ""}
            </span>
            <span className={i === 2 ? "text-correcto" : ""} style={{ whiteSpace: "pre" }}>
              {visual.modo === "multiplicar" ? f.padStart(ancho, " ") : f.padStart(ancho, " ")}
            </span>
          </motion.div>
        ))}
        {visual.modo === "sumaResta" && p >= 1 && <span className="text-xs font-semibold text-logro">Comas alineadas</span>}
      </div>
    );
  } else {
    figura = (
      <div className="flex items-center gap-3 font-mono text-3xl font-black text-foreground">
        <MathText texto={`$\\frac{${visual.num}}{${visual.den}}$`} />
        <span style={{ color: COLOR_NUMERIA }}>=</span>
        <motion.span key={p} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className={fin ? "text-correcto" : ""}>
          {fin ? datos.resultado : datos.resultado.slice(0, Math.min(datos.resultado.length, 2 + Math.max(0, p - 2)))}
        </motion.span>
      </div>
    );
  }
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Decimales"} titulo={visual.titulo} alternativa={<ol>{datos.pasos.map((x, i) => <li key={i}>{x.nota}</li>)}</ol>} controles={<ControlesReproductor r={r} />}>
      {figura}
      <Pizarra pasos={datos.pasos} paso={p} />
    </MarcoVisual>
  );
}

// ---------- Porcentajes ----------
export function Porcentaje({ visual }: { visual: VisualNumeriaPorcentaje }) {
  const datos = porcentaje({ modo: visual.modo, porcentaje: visual.porcentaje, base: visual.base, tipo: visual.tipoCambio });
  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2400, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  let figura: React.ReactNode;
  if (visual.modo === "cuadricula") {
    figura = (
      <div className="grid grid-cols-10 gap-0.5 rounded-lg border border-border p-1.5">
        {Array.from({ length: 100 }, (_, i) => (
          <motion.span key={i} className="h-4 w-4 rounded-[3px] sm:h-5 sm:w-5" initial={false} animate={{ backgroundColor: i < datos.parte ? COLOR_NUMERIA : "rgba(127,127,127,0.15)" }} transition={{ delay: i < datos.parte ? i * 0.012 : 0 }} />
        ))}
      </div>
    );
  } else if (visual.modo === "de") {
    const decenas = Math.floor(datos.porcentaje / 10);
    const unidades = datos.porcentaje % 10;
    figura = (
      <div className="flex w-full max-w-sm flex-col gap-2">
        <div className="flex h-9 overflow-hidden rounded-lg border-2" style={{ borderColor: COLOR_NUMERIA }}>
          {Array.from({ length: 10 }, (_, i) => (
            <motion.span key={i} className="flex flex-1 items-center justify-center border-r border-border text-[10px] font-bold text-white last:border-r-0" initial={false} animate={{ backgroundColor: p >= 4 && i < decenas ? C1 : p >= 2 && i === 0 ? `${C1}88` : "rgba(0,0,0,0)" }}>
              10%
            </motion.span>
          ))}
        </div>
        <div className="flex h-6 w-1/10 overflow-hidden rounded border border-border" style={{ width: "10%" }}>
          {Array.from({ length: 10 }, (_, i) => (
            <motion.span key={i} className="flex-1 border-r border-border last:border-r-0" initial={false} animate={{ backgroundColor: p >= 4 && i < unidades ? C2 : p >= 3 && i === 0 ? `${C2}88` : "rgba(0,0,0,0)" }} />
          ))}
        </div>
        <p className="text-center text-xs text-texto-secundario">
          {datos.base} = 100 % · cada cuadro grande es 10 %
        </p>
      </div>
    );
  } else {
    const aumento = (visual.tipoCambio ?? "aumento") === "aumento";
    const total = aumento ? 100 + datos.porcentaje : 100;
    figura = (
      <div className="flex w-full max-w-sm flex-col gap-1">
        <div className="relative flex h-10 overflow-hidden rounded-lg border-2" style={{ borderColor: COLOR_NUMERIA }}>
          <motion.span className="h-full" style={{ background: C1 }} initial={false} animate={{ width: `${((aumento ? 100 : 100 - (p >= 2 ? datos.porcentaje : 0)) / total) * 100}%` }} transition={{ duration: 0.6 }} />
          <motion.span className="h-full" style={{ background: aumento ? C3 : C2, opacity: aumento ? 1 : 0.35 }} initial={false} animate={{ width: `${(p >= 2 ? datos.porcentaje / total : 0) * 100}%` }} transition={{ duration: 0.6 }} />
        </div>
        <div className="flex justify-between text-xs font-semibold text-texto-secundario">
          <span>{datos.base} (100 %)</span>
          <span style={{ color: aumento ? C3 : C2 }}>
            {aumento ? "+" : "−"}
            {datos.porcentaje} %
          </span>
        </div>
      </div>
    );
  }
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Porcentajes"} titulo={visual.titulo} alternativa={<ol>{datos.pasos.map((x, i) => <li key={i}>{x.nota}</li>)}</ol>} controles={<ControlesReproductor r={r} />}>
      {figura}
      <Pizarra pasos={datos.pasos} paso={p} />
    </MarcoVisual>
  );
}

// ---------- Leyes de los exponentes ----------
function Ficha({ base, color, tachada = false, i }: { base: number; color: string; tachada?: boolean; i: number }) {
  return (
    <motion.span
      layout
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border-2 font-mono text-base font-bold text-foreground"
      style={{ borderColor: color, background: `${color}22` }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: tachada ? 0.3 : 1, scale: 1 }}
      transition={{ delay: i * 0.05, duration: 0.3 }}
    >
      {base}
      {tachada && <span className="absolute inset-0 m-auto h-0.5 w-10 -rotate-45 bg-error" />}
    </motion.span>
  );
}

export function Exponentes({ visual }: { visual: VisualNumeriaExponentes }) {
  const datos = exponentes(visual.ley, visual.base, visual.m, visual.n);
  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  let figura: React.ReactNode;
  if (datos.ley === "producto") {
    const junto = p >= 3;
    figura = (
      <motion.div layout className={`flex flex-wrap items-center justify-center ${junto ? "gap-1" : "gap-4"}`}>
        <motion.div layout className="flex gap-1">
          {Array.from({ length: datos.m }, (_, i) => (
            <Ficha key={`a${i}`} base={datos.base} color={C1} i={i} />
          ))}
        </motion.div>
        {!junto && <span className="font-bold text-texto-secundario">·</span>}
        <motion.div layout className="flex gap-1">
          {Array.from({ length: datos.n }, (_, i) => (
            <Ficha key={`b${i}`} base={datos.base} color={C2} i={i} />
          ))}
        </motion.div>
      </motion.div>
    );
  } else if (datos.ley === "cociente" || datos.ley === "cero") {
    const tachar = p >= 2;
    figura = (
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length: datos.m }, (_, i) => (
            <Ficha key={`a${i}`} base={datos.base} color={C1} tachada={tachar && i < datos.n} i={i} />
          ))}
        </div>
        <span className="h-0.5 w-full bg-foreground/60" />
        <div className="flex gap-1">
          {Array.from({ length: datos.n }, (_, i) => (
            <Ficha key={`b${i}`} base={datos.base} color={C2} tachada={tachar} i={i} />
          ))}
        </div>
      </div>
    );
  } else {
    figura = (
      <div className="flex flex-wrap justify-center gap-3">
        {datos.grupos.map((g, gi) => (
          <motion.div key={gi} className="flex gap-1 rounded-xl border border-dashed p-1.5" style={{ borderColor: [C1, C2, C3, COLOR_NUMERIA][gi % 4] }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: p >= 2 || gi === 0 ? 1 : 0.2, y: 0 }} transition={{ delay: gi * 0.15 }}>
            {Array.from({ length: g }, (_, i) => (
              <Ficha key={i} base={datos.base} color={[C1, C2, C3, COLOR_NUMERIA][gi % 4]} i={i} />
            ))}
          </motion.div>
        ))}
      </div>
    );
  }
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Potencias"} titulo={visual.titulo} alternativa={<ol>{datos.pasos.map((x, i) => <li key={i}>{x.nota}</li>)}</ol>} controles={<ControlesReproductor r={r} />}>
      {figura}
      <Pizarra pasos={datos.pasos} paso={p} />
    </MarcoVisual>
  );
}

// ---------- Raíz cuadrada ----------
export function Raiz({ visual }: { visual: VisualNumeriaRaiz }) {
  const datos = raiz(visual.n);
  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const lado = datos.arriba;
  const celda = Math.max(10, Math.min(22, Math.floor(220 / lado)));
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Raíz cuadrada"} titulo={visual.titulo} alternativa={<ol>{datos.pasos.map((x, i) => <li key={i}>{x.nota}</li>)}</ol>} controles={<ControlesReproductor r={r} />}>
      <div className="relative" style={{ width: lado * (celda + 2), height: lado * (celda + 2) }}>
        {Array.from({ length: lado * lado }, (_, i) => {
          const fila = Math.floor(i / lado);
          const col = i % lado;
          const enAbajo = fila < datos.abajo && col < datos.abajo;
          // Cuadritos: primero el cuadrado de abajo; los que sobran (n − abajo²) van
          // por el borde: la columna de la derecha y después la fila de abajo.
          const indiceExtra = enAbajo ? -1 : col === datos.abajo && fila < datos.abajo ? fila : fila === datos.abajo ? datos.abajo + col : -1;
          const lleno = enAbajo ? true : indiceExtra >= 0 && indiceExtra < datos.n - datos.abajo * datos.abajo;
          return (
            <motion.span
              key={i}
              className="absolute rounded-[3px]"
              style={{ left: col * (celda + 2), top: fila * (celda + 2), width: celda, height: celda }}
              initial={false}
              animate={{ backgroundColor: !lleno ? "rgba(127,127,127,0.12)" : enAbajo ? C1 : C2, opacity: p >= 2 || datos.exacta ? 1 : 0.2 }}
              transition={{ delay: (fila + col) * 0.02 }}
            />
          );
        })}
      </div>
      <p className="text-sm font-semibold text-foreground">
        {datos.exacta ? `Lado: ${datos.abajo}` : `Entre ${datos.abajo} y ${datos.arriba} de lado`}
      </p>
      <Pizarra pasos={datos.pasos} paso={p} />
    </MarcoVisual>
  );
}

// ---------- Términos semejantes ----------
function FichaTermino({ coef, variable }: { coef: number; variable: string }) {
  const color = variable === "" ? C3 : variable === "x" ? C1 : C2;
  return (
    <motion.span layout className={`flex items-center justify-center rounded-lg border-2 px-2 font-mono text-sm font-bold ${variable ? "h-12 min-w-10" : "h-8 min-w-8"}`} style={{ borderColor: coef < 0 ? "#FF5D5D" : color, background: `${coef < 0 ? "#FF5D5D" : color}22` }}>
      {coef < 0 ? "−" : "+"}
      {Math.abs(coef) === 1 && variable ? "" : Math.abs(coef)}
      {variable}
    </motion.span>
  );
}

export function Terminos({ visual }: { visual: VisualNumeriaTerminos }) {
  const datos = terminosSemejantes(visual.terminos);
  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const agrupado = p >= 2;
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Términos semejantes"} titulo={visual.titulo} alternativa={<p>{expresionTex(datos.resultado)}</p>} controles={<ControlesReproductor r={r} />}>
      {agrupado ? (
        <div className="flex flex-wrap justify-center gap-4">
          {datos.grupos.map((g, gi) => (
            <motion.div key={g.var || "num"} layout className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border p-2" initial={{ opacity: 0.4 }} animate={{ opacity: p >= 2 + gi ? 1 : 0.4 }}>
              <div className="flex gap-1">
                {g.terminos.map((t, i) => (
                  <FichaTermino key={i} coef={t.coef} variable={t.var} />
                ))}
              </div>
              {p >= 2 + gi && (
                <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-sm font-bold text-correcto">
                  = <MathText texto={`$${expresionTex([{ coef: g.total, var: g.var }])}$`} />
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-1.5">
          {datos.terminos.map((t, i) => (
            <FichaTermino key={i} coef={t.coef} variable={t.var} />
          ))}
        </div>
      )}
      <Pizarra pasos={datos.pasos} paso={p} />
    </MarcoVisual>
  );
}

// ---------- Propiedad distributiva (modelo de área) ----------
export function Distributiva({ visual }: { visual: VisualNumeriaDistributiva }) {
  const datos = distributiva(visual.factor, visual.sumandos);
  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2600, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const p = r.paso;
  const colores = [C1, C2, C3];
  const anchos = datos.sumandos.map((t) => (t.var ? 110 : Math.max(36, Math.min(110, Math.abs(t.coef) * 18))));
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Propiedad distributiva"} titulo={visual.titulo} alternativa={<p>{expresionTex(datos.productos)}</p>} controles={<ControlesReproductor r={r} />}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg font-bold" style={{ color: COLOR_NUMERIA }}>
          {datos.factor}
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex">
            {datos.sumandos.map((t, i) => (
              <span key={i} className="text-center font-mono text-sm font-bold text-texto-secundario" style={{ width: anchos[i] }}>
                <MathText texto={`$${expresionTex([t])}$`} />
              </span>
            ))}
          </div>
          <div className="flex h-20 overflow-hidden rounded-lg border-2" style={{ borderColor: COLOR_NUMERIA }}>
            {datos.sumandos.map((t, i) => (
              <motion.span key={i} className="flex items-center justify-center border-r-2 border-dashed border-foreground/30 font-mono text-sm font-bold text-foreground last:border-r-0" style={{ width: anchos[i] }} initial={false} animate={{ backgroundColor: p >= 2 ? `${colores[i % 3]}55` : "rgba(0,0,0,0)" }} transition={{ delay: i * 0.25 }}>
                {p >= 2 && <MathText texto={`$${expresionTex([datos.productos[i]])}$`} />}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
      <Pizarra pasos={datos.pasos} paso={p} />
    </MarcoVisual>
  );
}

// ---------- Ecuaciones con x en los dos lados (balanza) ----------
export function Ecuacion({ visual }: { visual: VisualNumeriaEcuacion }) {
  const datos = ecuacion(visual.a, visual.b, visual.c, visual.d);
  const { alVer, ...r } = useReproductor({ total: datos?.etapas.length ?? 0, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;
  const etapa = datos.etapas[Math.min(datos.etapas.length, Math.max(1, r.paso)) - 1];
  return (
    <MarcoVisual refCont={alVer} etiqueta={visual.titulo ?? "Ecuación"} titulo={visual.titulo} alternativa={<p>x = {datos.x}</p>} controles={<ControlesReproductor r={r} />}>
      <svg viewBox="0 0 320 70" className="h-auto w-full max-w-[340px]" aria-hidden="true">
        <polygon points="160,30 146,66 174,66" fill={COLOR_NUMERIA} opacity={0.7} />
        <motion.line x1={30} y1={30} x2={290} y2={30} stroke={COLOR_NUMERIA} strokeWidth={4} strokeLinecap="round" initial={{ rotate: -4 }} animate={{ rotate: 0 }} style={{ transformOrigin: "160px 30px" }} transition={{ type: "spring", damping: 6 }} key={r.paso} />
      </svg>
      <motion.div key={r.paso} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="-mt-14 flex w-full max-w-[340px] items-center justify-between gap-2">
        <span className="min-w-24 rounded-xl border-2 bg-surface px-3 py-2 text-center font-mono text-lg font-bold text-foreground" style={{ borderColor: C1 }}>
          <MathText texto={`$${expresionTex(etapa.izq)}$`} />
        </span>
        <span className="font-bold" style={{ color: COLOR_NUMERIA }}>
          =
        </span>
        <span className="min-w-24 rounded-xl border-2 bg-surface px-3 py-2 text-center font-mono text-lg font-bold text-foreground" style={{ borderColor: C2 }}>
          <MathText texto={`$${expresionTex(etapa.der)}$`} />
        </span>
      </motion.div>
      <p className="mt-6 text-center text-sm text-texto-secundario">{etapa.nota}</p>
      {r.paso >= datos.etapas.length && <p className="font-semibold text-correcto">x = {datos.x}</p>}
    </MarcoVisual>
  );
}
