"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import {
  ejemploEnlace,
  polaridad,
  valenciaDe,
  type EjemploCovalente,
  type EjemploIonico,
  type EjemploMetalico,
} from "@/lib/quimia/enlaces";
import { datosDe } from "@/lib/quimia/datos";
import { formulaUnicode } from "@/lib/quimia/formulas";
import type { VisualQuimiaEnlace } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, motion, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaEnlace;
}

const ELECTRON = "#F59E0B";
const COLOR_CATION = "#3B82F6";
const COLOR_ANION = "#EF4444";
const PASOS = 4;

const SUPERINDICE: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
// "Na⁺", "O²⁻" en texto plano (para las frases de los pasos).
function ionTexto(simbolo: string, carga: number): string {
  const n = Math.abs(carga);
  return `${simbolo}${n === 1 ? "" : SUPERINDICE[String(n)]}${carga > 0 ? "⁺" : "⁻"}`;
}

// Redondeada a 2 decimales A PROPÓSITO: Math.cos/Math.sin no dan el mismo
// último bit en Node (servidor) y en el navegador, y una coordenada sin
// redondear producía un mismatch de hidratación real (cy="43.62693304105358"
// contra 43.62693304105359), confirmado con Playwright. Mismo problema y misma
// solución que los <Marker> del mapa de Geografía.
function polar(cx: number, cy: number, radio: number, grados: number): { x: number; y: number } {
  const a = (grados * Math.PI) / 180;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return { x: r2(cx + radio * Math.cos(a)), y: r2(cy + radio * Math.sin(a)) };
}

interface PuntoElectron {
  x: number;
  y: number;
  color: string;
}

function Electron({ p, animar }: { p: PuntoElectron; animar: boolean }) {
  return (
    <motion.circle
      r={3.6}
      fill={p.color}
      stroke="var(--background)"
      strokeWidth={0.8}
      initial={false}
      animate={{ cx: p.x, cy: p.y }}
      transition={animar ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
    />
  );
}

// ---------- Iónico ----------
// Orden en que se van ocupando las 8 posiciones alrededor de un átomo; la
// última mira hacia el otro átomo.
const ANGULOS_ANION = [0, 45, -45, 90, -90, 135, -135, 180];
const ANGULOS_CATION = [0, -45, 45, -90, 90, -135, 135, 180];

function DibujoIonico({ datos, paso, animar }: { datos: EjemploIonico; paso: number; animar: boolean }) {
  const ec = valenciaDe(datos.cation) ?? 0;
  const ea = valenciaDe(datos.anion) ?? 0;
  const n = datos.transferidos;
  const cy = 80;
  const cxC = paso >= 4 ? 108 : 78;
  const cxA = paso >= 4 ? 200 : 242;
  const rC = paso >= 3 ? 24 : 32;
  const rA = paso >= 3 ? 42 : 36;
  const puntos: PuntoElectron[] = [];
  for (let i = 0; i < ec; i++) {
    const cede = i >= ec - n;
    if (paso >= 2 && cede) {
      const k = ea + (i - (ec - n));
      const pos = polar(cxA, cy, rA, ANGULOS_ANION[k]);
      puntos.push({ ...pos, color: ELECTRON });
    } else if (paso < 3) {
      const pos = polar(cxC, cy, rC, ANGULOS_CATION[i]);
      puntos.push({ ...pos, color: ELECTRON });
    }
  }
  for (let i = 0; i < ea; i++) {
    const pos = polar(cxA, cy, rA, ANGULOS_ANION[i]);
    puntos.push({ ...pos, color: "var(--foreground)" });
  }
  const carga = paso >= 3;
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full max-w-[420px]" role="presentation">
      <motion.circle initial={false} animate={{ cx: cxC, r: rC }} transition={animar ? { duration: 0.7 } : { duration: 0 }} cy={cy} fill={carga ? COLOR_CATION : "var(--surface-2)"} fillOpacity={carga ? 0.28 : 1} stroke={carga ? COLOR_CATION : "var(--border)"} strokeWidth={2} />
      <motion.circle initial={false} animate={{ cx: cxA, r: rA }} transition={animar ? { duration: 0.7 } : { duration: 0 }} cy={cy} fill={carga ? COLOR_ANION : "var(--surface-2)"} fillOpacity={carga ? 0.22 : 1} stroke={carga ? COLOR_ANION : "var(--border)"} strokeWidth={2} />
      <motion.text initial={false} animate={{ x: cxC }} transition={animar ? { duration: 0.7 } : { duration: 0 }} y={cy + 5} textAnchor="middle" fontSize={15} fontWeight={800} fill="var(--foreground)">
        {datos.cation}
      </motion.text>
      <motion.text initial={false} animate={{ x: cxA }} transition={animar ? { duration: 0.7 } : { duration: 0 }} y={cy + 5} textAnchor="middle" fontSize={15} fontWeight={800} fill="var(--foreground)">
        {datos.anion}
      </motion.text>
      {carga && (
        <>
          <text x={cxC} y={cy - rC - 6} textAnchor="middle" fontSize={12} fontWeight={800} fill={COLOR_CATION}>
            {ionTexto(datos.cation, n)}
          </text>
          <text x={cxA} y={cy - rA - 6} textAnchor="middle" fontSize={12} fontWeight={800} fill={COLOR_ANION}>
            {ionTexto(datos.anion, -n)}
          </text>
        </>
      )}
      {puntos.map((p, i) => (
        <Electron key={i} p={p} animar={animar} />
      ))}
      {paso >= 4 && (
        <g>
          <line x1={cxC + rC + 6} y1={cy} x2={cxA - rA - 6} y2={cy} stroke={COLOR_QUIMIA} strokeWidth={2.5} markerStart="url(#quimia-atrae)" markerEnd="url(#quimia-atrae)" />
          <defs>
            <marker id="quimia-atrae" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={COLOR_QUIMIA} />
            </marker>
          </defs>
        </g>
      )}
    </svg>
  );
}

// ---------- Covalente ----------
function DibujoCovalente({ datos, paso, animar }: { datos: EjemploCovalente; paso: number; animar: boolean }) {
  const va = valenciaDe(datos.a) ?? 0;
  const vb = valenciaDe(datos.b) ?? 0;
  const pares = datos.pares;
  const cy = 80;
  const unidos = paso >= 2;
  const cxA = unidos ? 125 : 78;
  const cxB = unidos ? 195 : 242;
  const r = 40;
  const medio = 160;
  const compartidos = paso >= 3;
  const puntos: PuntoElectron[] = [];
  const dePar = (i: number) => cy + (i - (pares - 1) / 2) * 16;
  const distribuir = (
    cx: number,
    v: number,
    lado: 1 | -1,
    color: string,
    ladoDot: 1 | -1
  ) => {
    const sueltos = v - pares;
    for (let i = 0; i < v; i++) {
      if (compartidos && i < pares) {
        puntos.push({ x: medio + ladoDot * 4.5, y: dePar(i), color });
      } else if (compartidos) {
        const k = i - pares;
        const desde = lado === 1 ? -65 : 115;
        const g = sueltos === 1 ? desde + 32 : desde + (k * 130) / (sueltos - 1);
        const pos = polar(cx, cy, r + 2, g);
        puntos.push({ ...pos, color: "var(--foreground)" });
      } else {
        const pos = polar(cx, cy, r + 2, -90 + (i * 360) / v + (lado === 1 ? 0 : 180 / v));
        puntos.push({ ...pos, color: i < pares ? color : "var(--foreground)" });
      }
    }
  };
  distribuir(cxA, va, -1, ELECTRON, -1);
  distribuir(cxB, vb, 1, "#22C55E", 1);
  const polarAB = paso >= 4 && polaridad(datos.a, datos.b) === "polar";
  const rA = datos.a === "H" ? 30 : r;
  const rB = datos.b === "H" ? 30 : r;
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full max-w-[420px]" role="presentation">
      <motion.circle initial={false} animate={{ cx: cxA }} transition={animar ? { duration: 0.7 } : { duration: 0 }} cy={cy} r={rA} fill="var(--surface-2)" stroke="var(--border)" strokeWidth={2} />
      <motion.circle initial={false} animate={{ cx: cxB }} transition={animar ? { duration: 0.7 } : { duration: 0 }} cy={cy} r={rB} fill="var(--surface-2)" stroke="var(--border)" strokeWidth={2} />
      <motion.text initial={false} animate={{ x: unidos ? cxA - 22 : cxA }} transition={animar ? { duration: 0.7 } : { duration: 0 }} y={cy + 5} textAnchor="middle" fontSize={15} fontWeight={800} fill="var(--foreground)">
        {datos.a}
      </motion.text>
      <motion.text initial={false} animate={{ x: unidos ? cxB + 22 : cxB }} transition={animar ? { duration: 0.7 } : { duration: 0 }} y={cy + 5} textAnchor="middle" fontSize={15} fontWeight={800} fill="var(--foreground)">
        {datos.b}
      </motion.text>
      {puntos.map((p, i) => (
        <Electron key={i} p={p} animar={animar} />
      ))}
      {paso >= 4 &&
        Array.from({ length: pares }, (_, i) => (
          <line key={i} x1={medio - 12} x2={medio + 12} y1={dePar(i)} y2={dePar(i)} stroke={COLOR_QUIMIA} strokeWidth={2.2} strokeLinecap="round" strokeOpacity={0.9} />
        ))}
      {polarAB && (
        <g fontSize={13} fontWeight={800}>
          <text x={cxA - 4} y={cy + r + 22} textAnchor="middle" fill={COLOR_CATION}>
            δ+
          </text>
          <text x={cxB + 4} y={cy + r + 22} textAnchor="middle" fill={COLOR_ANION}>
            δ−
          </text>
        </g>
      )}
    </svg>
  );
}

// ---------- Metálico ----------
const COLUMNAS = 4;
const FILAS = 3;

function DibujoMetalico({ datos, paso, animar, reducir }: { datos: EjemploMetalico; paso: number; animar: boolean; reducir: boolean }) {
  const n = datos.aportados;
  const liberados = paso >= 2;
  const cationes: { x: number; y: number; i: number }[] = [];
  for (let j = 0; j < FILAS; j++) for (let i = 0; i < COLUMNAS; i++) cationes.push({ x: 62 + i * 65, y: 35 + j * 45, i: j * COLUMNAS + i });
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full max-w-[420px]" role="presentation">
      {paso >= 4 && <rect x={22} y={8} width={276} height={144} rx={18} fill={ELECTRON} fillOpacity={0.14} stroke={ELECTRON} strokeOpacity={0.5} strokeDasharray="4 4" />}
      {cationes.map((c) => (
        <g key={c.i}>
          <circle cx={c.x} cy={c.y} r={liberados ? 14 : 17} fill={liberados ? COLOR_CATION : "var(--surface-2)"} fillOpacity={liberados ? 0.3 : 1} stroke={liberados ? COLOR_CATION : "var(--border)"} strokeWidth={1.8} />
          <text x={c.x} y={c.y + 3.5} textAnchor="middle" fontSize={liberados && n > 1 ? 8 : 9.5} fontWeight={800} fill="var(--foreground)">
            {liberados ? ionTexto(datos.simbolo, n) : datos.simbolo}
          </text>
        </g>
      ))}
      {cationes.flatMap((c) =>
        Array.from({ length: n }, (_, k) => {
          // Sin liberar: pegado al átomo; liberado: en el hueco entre cationes.
          const propio = polar(c.x, c.y, 17, -45 + k * 180);
          const hueco = { x: c.x + 32 + k * 7, y: c.y + 22 - k * 5 };
          const dest = liberados ? hueco : propio;
          const vaga = liberados && paso >= 3 && !reducir && animar;
          const sem = ((c.i * 7 + k * 3) % 5) - 2;
          return (
            <motion.circle
              key={`${c.i}-${k}`}
              r={3.2}
              fill={ELECTRON}
              stroke="var(--background)"
              strokeWidth={0.7}
              initial={false}
              animate={
                vaga
                  ? { cx: [dest.x, dest.x + 26 + sem * 3, dest.x - 14, dest.x], cy: [dest.y, dest.y - 16 - sem * 2, dest.y + 8, dest.y] }
                  : { cx: dest.x, cy: dest.y }
              }
              transition={vaga ? { duration: 4 + ((c.i + k) % 3), repeat: Infinity, ease: "easeInOut" } : animar ? { duration: 0.8 } : { duration: 0 }}
            />
          );
        })
      )}
    </svg>
  );
}

// Visual "quimia.enlace": los tres tipos de enlace, animados, con un ejemplo
// real de cada uno (NaCl/MgO, H2/O2/N2/HCl, Na/Mg). Todos los números de
// los dibujos salen de src/lib/quimia/enlaces.ts y datos.ts.
export default function Enlace({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.enlace");
  const ejemplo = ejemploEnlace(visual.ejemplo);
  const valido = ejemplo !== undefined && ejemplo.tipo === visual.enlace;
  const { alVer, ...r } = useReproductor({ total: PASOS, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (!valido || !ejemplo) return null;

  const paso = Math.min(PASOS, Math.max(1, r.paso));
  const animar = !r.reducir;
  const params = parametros(ejemplo);
  const clave = ejemplo.tipo;
  const textos = Array.from({ length: PASOS }, (_, i) => {
    const base = `${clave}.p${i + 1}`;
    // El último paso del covalente distingue polar/apolar.
    if (ejemplo.tipo === "covalente" && i === PASOS - 1) {
      return t(`covalente.p4${polaridad(ejemplo.a, ejemplo.b) === "polar" ? "Polar" : "Apolar"}`, params);
    }
    return t(base, params);
  });

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={
        <ol>
          {textos.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      {ejemplo.tipo === "ionico" && <DibujoIonico datos={ejemplo} paso={paso} animar={animar} />}
      {ejemplo.tipo === "covalente" && <DibujoCovalente datos={ejemplo} paso={paso} animar={animar} />}
      {ejemplo.tipo === "metalico" && <DibujoMetalico datos={ejemplo} paso={paso} animar={animar} reducir={r.reducir} />}
      <TextoDelPaso>
        <MathText texto={textos[paso - 1]} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}

function coma(n: number): string {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

function parametros(e: ReturnType<typeof ejemploEnlace> & object): Record<string, string | number> {
  if (e.tipo === "ionico") {
    return {
      cation: e.cation,
      anion: e.anion,
      ec: valenciaDe(e.cation) ?? 0,
      ea: valenciaDe(e.anion) ?? 0,
      n: e.transferidos,
      ionCation: ionTexto(e.cation, e.transferidos),
      ionAnion: ionTexto(e.anion, -e.transferidos),
      formula: formulaUnicode(e.formula),
    };
  }
  if (e.tipo === "covalente") {
    const dif = Math.abs((datosDe(e.a)?.electronegatividad ?? 0) - (datosDe(e.b)?.electronegatividad ?? 0));
    const masElec = (datosDe(e.a)?.electronegatividad ?? 0) >= (datosDe(e.b)?.electronegatividad ?? 0) ? e.a : e.b;
    return {
      a: e.a,
      b: e.b,
      va: valenciaDe(e.a) ?? 0,
      vb: valenciaDe(e.b) ?? 0,
      pares: e.pares,
      tipo: e.pares === 1 ? "simple" : e.pares === 2 ? "doble" : "triple",
      dif: coma(dif),
      masElectronegativo: masElec,
      formula: formulaUnicode(e.formula),
    };
  }
  return { simbolo: e.simbolo, n: e.aportados, ion: ionTexto(e.simbolo, e.aportados) };
}
