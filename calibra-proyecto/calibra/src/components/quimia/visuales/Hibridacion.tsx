"use client";

import { useLocale, useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { hibridacionDe } from "@/lib/quimia/organica";
import { fichaDe } from "@/lib/quimia/moleculas";
import { formulaLatex } from "@/lib/quimia/formulas";
import type { VisualQuimiaHibridacion } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, motion, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaHibridacion;
}

const COLOR_PI = "#F59E0B";
const MOLECULAS = ["metano", "eteno", "etino"] as const;
const PASOS = 4;

// Dibujo PLANO de cada molécula: los ángulos son los de la proyección en el
// papel (para el metano se usa la convención de cuñas y líneas punteadas, que
// indica que un enlace sale hacia el frente o hacia atrás; no es una imagen 3D).
interface Enlace {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tipo: "sigma" | "pi" | "cuna" | "atras";
}
interface Dibujo {
  atomos: { x: number; y: number; texto: string; carbono: boolean }[];
  enlaces: Enlace[];
  // Arco del ángulo: centro, radio, ángulos (grados) y posición del texto.
  arco: { cx: number; cy: number; r: number; desde: number; hasta: number; tx: number; ty: number };
}

const DIBUJOS: Record<(typeof MOLECULAS)[number], Dibujo> = {
  metano: {
    atomos: [
      { x: 130, y: 78, texto: "C", carbono: true },
      { x: 130, y: 22, texto: "H", carbono: false },
      { x: 82, y: 112, texto: "H", carbono: false },
      { x: 184, y: 112, texto: "H", carbono: false },
      { x: 192, y: 52, texto: "H", carbono: false },
    ],
    enlaces: [
      { x1: 130, y1: 78, x2: 130, y2: 30, tipo: "sigma" },
      { x1: 130, y1: 78, x2: 90, y2: 106, tipo: "sigma" },
      { x1: 130, y1: 78, x2: 176, y2: 106, tipo: "cuna" },
      { x1: 130, y1: 78, x2: 184, y2: 56, tipo: "atras" },
    ],
    arco: { cx: 130, cy: 78, r: 44, desde: 90, hasta: 215, tx: 62, ty: 60 },
  },
  eteno: {
    atomos: [
      { x: 105, y: 75, texto: "C", carbono: true },
      { x: 165, y: 75, texto: "C", carbono: true },
      { x: 75, y: 30, texto: "H", carbono: false },
      { x: 75, y: 120, texto: "H", carbono: false },
      { x: 195, y: 30, texto: "H", carbono: false },
      { x: 195, y: 120, texto: "H", carbono: false },
    ],
    enlaces: [
      { x1: 105, y1: 75, x2: 165, y2: 75, tipo: "sigma" },
      { x1: 105, y1: 86, x2: 165, y2: 86, tipo: "pi" },
      { x1: 105, y1: 75, x2: 82, y2: 38, tipo: "sigma" },
      { x1: 105, y1: 75, x2: 82, y2: 112, tipo: "sigma" },
      { x1: 165, y1: 75, x2: 188, y2: 38, tipo: "sigma" },
      { x1: 165, y1: 75, x2: 188, y2: 112, tipo: "sigma" },
    ],
    arco: { cx: 105, cy: 75, r: 30, desde: 120, hasta: 240, tx: 62, ty: 79 },
  },
  etino: {
    atomos: [
      { x: 40, y: 75, texto: "H", carbono: false },
      { x: 100, y: 75, texto: "C", carbono: true },
      { x: 160, y: 75, texto: "C", carbono: true },
      { x: 220, y: 75, texto: "H", carbono: false },
    ],
    enlaces: [
      { x1: 50, y1: 75, x2: 92, y2: 75, tipo: "sigma" },
      { x1: 108, y1: 75, x2: 152, y2: 75, tipo: "sigma" },
      { x1: 108, y1: 65, x2: 152, y2: 65, tipo: "pi" },
      { x1: 108, y1: 85, x2: 152, y2: 85, tipo: "pi" },
      { x1: 168, y1: 75, x2: 210, y2: 75, tipo: "sigma" },
    ],
    arco: { cx: 100, cy: 75, r: 24, desde: 180, hasta: 180, tx: 130, ty: 42 },
  },
};

function puntoArco(cx: number, cy: number, r: number, grados: number) {
  const a = (grados * Math.PI) / 180;
  // Redondeado: Math.cos/sin no dan el mismo último bit en el servidor y en el navegador (hidratación).
  return { x: Math.round((cx + r * Math.cos(a)) * 100) / 100, y: Math.round((cy - r * Math.sin(a)) * 100) / 100 };
}

// Visual "quimia.hibridacion": hibridación del carbono en metano, eteno y
// etino. Los enlaces sigma y pi, la hibridación y el ángulo salen de
// hibridacionDe (src/lib/quimia/organica.ts), calculados a partir de la
// conectividad de la molécula del catálogo.
export default function Hibridacion({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.hibridacion");
  const locale = useLocale();
  const nombre = (MOLECULAS as readonly string[]).includes(visual.molecula) ? visual.molecula : null;
  const { alVer, ...r } = useReproductor({ total: PASOS, ms: 3000, estatico: visual.estatico, inicio: 1 });
  if (!nombre) return null;
  const ficha = fichaDe(nombre);
  const info = hibridacionDe(ficha.molecula, 0);
  const dibujo = DIBUJOS[nombre as (typeof MOLECULAS)[number]];
  const paso = Math.min(PASOS, Math.max(1, r.paso));
  const animar = !r.reducir;
  const angulo = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(info.angulo);
  const aprox = info.hibridacion === "sp2" ? "≈ " : "";
  const hibTexto = info.hibridacion === "sp3" ? "$\\mathrm{sp^{3}}$" : info.hibridacion === "sp2" ? "$\\mathrm{sp^{2}}$" : "$\\mathrm{sp}$";

  const textos = [
    t("p1", { formula: `$${formulaLatex(ficha.formula)}$` }),
    t("p2", { sigma: info.sigma, pi: info.pi }),
    t("p3", { sigma: info.sigma, hib: hibTexto, mezcla: t(`mezcla.${info.hibridacion}`) }),
    t("p4", { hib: hibTexto, angulo: `${aprox}${angulo}`, geometria: t(`geometria.${info.hibridacion}`) }),
  ];
  const a = dibujo.arco;
  const p1 = puntoArco(a.cx, a.cy, a.r, a.desde);
  const p2 = puntoArco(a.cx, a.cy, a.r, a.hasta);
  const colorSigma = paso >= 2 ? COLOR_QUIMIA : "var(--foreground)";
  const mostrarArco = paso >= 4 && info.hibridacion !== "sp";

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { nombre: ficha.nombre })}
      titulo={visual.titulo}
      alternativa={
        <div>
          <p>{t(nombre === "metano" ? "nota" : "notaPlana")}</p>
          <ol>
            {textos.map((x, i) => (
              <li key={i}>
                <MathText texto={x} />
              </li>
            ))}
          </ol>
        </div>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <svg viewBox="0 0 260 150" className="h-auto w-full max-w-[380px]" role="presentation" data-paso={paso}>
        <defs>
          <marker id="quimia-hib-flecha" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--foreground)" />
          </marker>
        </defs>
        {dibujo.enlaces.map((e, i) => {
          if (e.tipo === "pi") {
            return (
              <motion.line
                key={i}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                strokeWidth={3}
                strokeDasharray="5 4"
                strokeLinecap="round"
                initial={false}
                animate={{ stroke: paso >= 2 ? COLOR_PI : "var(--foreground)" }}
                transition={{ duration: animar ? 0.5 : 0 }}
              />
            );
          }
          if (e.tipo === "cuna") {
            const dx = e.x2 - e.x1;
            const dy = e.y2 - e.y1;
            const n = Math.hypot(dx, dy);
            const nx = (-dy / n) * 6;
            const ny = (dx / n) * 6;
            const r2 = (v: number) => Math.round(v * 100) / 100;
            return <polygon key={i} points={`${e.x1},${e.y1} ${r2(e.x2 + nx)},${r2(e.y2 + ny)} ${r2(e.x2 - nx)},${r2(e.y2 - ny)}`} fill={colorSigma} />;
          }
          return (
            <motion.line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={e.tipo === "atras" ? "3 4" : undefined}
              initial={false}
              animate={{ stroke: colorSigma }}
              transition={{ duration: animar ? 0.5 : 0 }}
            />
          );
        })}
        {dibujo.atomos.map((at, i) => (
          <g key={i}>
            <circle cx={at.x} cy={at.y} r={11} fill="var(--surface)" />
            <text x={at.x} y={at.y} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={at.carbono ? COLOR_QUIMIA : "var(--foreground)"}>
              {at.texto}
            </text>
          </g>
        ))}
        {mostrarArco && (
          <g>
            <path d={`M ${p1.x} ${p1.y} A ${a.r} ${a.r} 0 0 1 ${p2.x} ${p2.y}`} fill="none" stroke="var(--foreground)" strokeWidth={1.5} />
            <text x={a.tx} y={a.ty} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--foreground)">
              {aprox}
              {angulo}°
            </text>
          </g>
        )}
        {paso >= 4 && info.hibridacion === "sp" && (
          <g>
            <line x1={50} y1={112} x2={210} y2={112} stroke="var(--foreground)" strokeWidth={1.5} markerStart="url(#quimia-hib-flecha)" markerEnd="url(#quimia-hib-flecha)" />
            <text x={130} y={132} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--foreground)">
              {angulo}°
            </text>
          </g>
        )}
        {paso >= 2 && (
          <g fontSize={11} fontWeight={700}>
            <line x1={14} y1={140} x2={30} y2={140} stroke={COLOR_QUIMIA} strokeWidth={3} />
            <text x={34} y={143} fill="var(--foreground)">
              σ
            </text>
            {info.pi > 0 && (
              <>
                <line x1={52} y1={140} x2={68} y2={140} stroke={COLOR_PI} strokeWidth={3} strokeDasharray="4 3" />
                <text x={72} y={143} fill="var(--foreground)">
                  π
                </text>
              </>
            )}
          </g>
        )}
      </svg>
      <p className="text-center text-[11px] text-texto-secundario">{t(nombre === "metano" ? "nota" : "notaPlana")}</p>
      <TextoDelPaso>
        <MathText texto={textos[paso - 1]} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}
