"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import { datosLey, VISTA_LEY, type DatosLey, type PuntoPx, type TrianguloLey } from "@/lib/trigonometria/visualesLey";
import { dec } from "@/lib/trigonometria/formato";
import type { VisualTrigonometriaLey } from "@/lib/trigonometria/visuales";
import { COLOR_ALERTA, COLOR_COSENO, COLOR_HIPOTENUSA, COLOR_SENO, COLOR_TRIGONOMETRIA, Formula, Leyenda, MarcoVisual, transicion, useSeparadorDecimal } from "./comun";

interface Props {
  visual: VisualTrigonometriaLey;
}

function calcular(v: VisualTrigonometriaLey, sep: "," | "."): DatosLey | null {
  try {
    if (typeof v.datos !== "object" || v.datos === null) return null;
    return datosLey(v, sep);
  } catch {
    return null;
  }
}

type Lado = "a" | "b" | "c";
type Vertice = "A" | "B" | "C";

interface Resalte {
  lados: Partial<Record<Lado, string>>;
  angulos: Partial<Record<Vertice, string>>;
  altura: boolean;
  circunferencia: boolean;
  triangulos: boolean;
  incognita: Lado | null;
}

const NADA: Resalte = { lados: {}, angulos: {}, altura: false, circunferencia: false, triangulos: true, incognita: null };

// Qué se resalta en cada paso de cada ley (colores por pareja ángulo–lado opuesto).
function resalte(ley: DatosLey["ley"], clave: string): Resalte {
  const A = COLOR_SENO;
  const B = COLOR_COSENO;
  const C = COLOR_HIPOTENUSA;
  if (ley === "seno") {
    if (clave === "parejaA") return { ...NADA, lados: { a: A }, angulos: { A } };
    if (clave === "parejaB") return { ...NADA, lados: { b: B }, angulos: { B } };
    if (clave === "datos") return { ...NADA, lados: { a: A }, angulos: { A, B }, incognita: "b" };
    return { ...NADA, lados: { a: A, b: B }, angulos: { A, B }, incognita: clave === "resultado" ? null : "b" };
  }
  if (ley === "coseno") {
    if (clave === "resultado" || clave === "calcular") return { ...NADA, lados: { a: A, b: B, c: COLOR_ALERTA }, angulos: { C } };
    return { ...NADA, lados: { a: A, b: B }, angulos: { C }, incognita: "c" };
  }
  if (ley === "area") {
    if (clave === "datos") return { ...NADA, lados: { a: A, b: B }, angulos: { C } };
    return { ...NADA, lados: { a: A, b: B }, angulos: { C }, altura: true };
  }
  // ambiguo
  if (clave === "datos") return { ...NADA, lados: { b: B }, angulos: { A }, triangulos: false };
  if (clave === "altura") return { ...NADA, lados: { b: B }, angulos: { A }, altura: true, triangulos: false };
  if (clave === "comparar") return { ...NADA, lados: { b: B }, angulos: { A }, altura: true, circunferencia: true, triangulos: false };
  return { ...NADA, lados: { a: A, b: B }, angulos: { A }, altura: true, circunferencia: true, triangulos: true };
}

const centro = (t: TrianguloLey): PuntoPx => ({ x: (t.A.x + t.B.x + t.C.x) / 3, y: (t.A.y + t.B.y + t.C.y) / 3 });
const fuera = (p: PuntoPx, c: PuntoPx, d: number): PuntoPx => {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: Math.round((p.x + (dx / l) * d) * 100) / 100, y: Math.round((p.y + (dy / l) * d) * 100) / 100 };
};
const medio = (p: PuntoPx, q: PuntoPx): PuntoPx => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });

const HALO = { stroke: "var(--surface)", strokeWidth: 3.5, paintOrder: "stroke" } as const;

// Triángulo oblicuo con las partes que usa cada ley (seno, coseno, área con la
// altura, caso ambiguo con la circunferencia de radio a). Toda la geometría sale
// de datosLey() (visualesLey.ts); el componente solo pinta y resalta.
export default function Ley({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  const sep = useSeparadorDecimal();
  const datos = useMemo(() => calcular(visual, sep), [visual, sep]);
  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 2800, estatico: visual.estatico, inicio: datos ? 1 : 0 });
  if (!datos) return null;

  const { ancho, alto } = VISTA_LEY;
  const paso = datos.pasos[Math.max(0, r.paso - 1)];
  const rs = resalte(datos.ley, paso.clave);
  const tri = datos.triangulo;
  const c0 = centro(tri);
  const otro = datos.segundo;
  const conocidos: Record<Lado, boolean> = { a: true, b: datos.ley !== "seno", c: false };
  const incognitaFinal: Lado | null = datos.ley === "seno" ? "b" : datos.ley === "coseno" ? "c" : null;
  const angulosConocidos: Record<Vertice, boolean> = { A: datos.ley === "seno" || datos.ley === "ambiguo", B: datos.ley === "seno", C: datos.ley === "coseno" || datos.ley === "area" };
  const t0 = tri.t;
  const valorLado = (l: Lado): string => `${l} = ${dec(t0[l], 2, sep)}`;
  const enResultado = paso.clave === "resultado" || paso.clave === "calcular" || paso.clave === "conclusion";
  const ambiguo = datos.ley === "ambiguo";

  const lados: { l: Lado; p: PuntoPx; q: PuntoPx }[] = [
    { l: "a", p: tri.B, q: tri.C },
    { l: "b", p: tri.A, q: tri.C },
    { l: "c", p: tri.A, q: tri.B },
  ];
  const vertices: { v: Vertice; p: PuntoPx }[] = [
    { v: "A", p: tri.A },
    { v: "B", p: tri.B },
    { v: "C", p: tri.C },
  ];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.ley")}
      titulo={visual.titulo}
      alternativa={<p>{datos.textoPlano}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_TRIGONOMETRIA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[340px]">
        {ambiguo && (
          <>
            {/* la base, más larga que el triángulo, para ver dónde puede caer B */}
            <line x1={tri.A.x - 6} y1={tri.A.y} x2={ancho - 14} y2={tri.A.y} stroke="var(--foreground)" strokeOpacity={0.4} strokeWidth={1.5} />
            <line x1={tri.A.x} y1={tri.A.y} x2={tri.C.x} y2={tri.C.y} stroke={rs.lados.b ?? COLOR_TRIGONOMETRIA} strokeWidth={4} strokeLinecap="round" />
            {datos.arcoCircunferencia && (
              <path d={datos.arcoCircunferencia} fill="none" stroke={COLOR_HIPOTENUSA} strokeWidth={2.5} strokeDasharray="6 4" style={{ opacity: rs.circunferencia ? 1 : 0, transition: transicion(r.reducir, "opacity", 500) }} />
            )}
          </>
        )}

        {/* triángulos: uno o dos (ambiguo) */}
        {[tri, ...(otro ? [otro] : [])].map((tt, i) => {
          const visible = ambiguo ? rs.triangulos && datos.cantidad > 0 && (i === 0 || datos.cantidad === 2) : true;
          return (
            <g key={i} style={{ opacity: visible ? (ambiguo && i === 1 ? 0.9 : 1) : 0, transition: transicion(r.reducir, "opacity", 500) }}>
              <polygon
                points={`${tt.A.x},${tt.A.y} ${tt.B.x},${tt.B.y} ${tt.C.x},${tt.C.y}`}
                fill={`color-mix(in oklab, ${COLOR_TRIGONOMETRIA} ${i === 1 ? 6 : 10}%, transparent)`}
                stroke={i === 1 ? COLOR_ALERTA : COLOR_TRIGONOMETRIA}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeDasharray={i === 1 ? "6 3" : undefined}
              />
            </g>
          );
        })}

        {/* lados resaltados */}
        {!ambiguo &&
          lados.map(({ l, p, q }) => (
            <line key={l} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={rs.lados[l] ?? "transparent"} strokeWidth={5} strokeLinecap="round" style={{ transition: transicion(r.reducir, "stroke", 300) }} />
          ))}
        {ambiguo && rs.triangulos && datos.cantidad > 0 && (
          <line x1={tri.B.x} y1={tri.B.y} x2={tri.C.x} y2={tri.C.y} stroke={rs.lados.a ?? COLOR_SENO} strokeWidth={4} strokeLinecap="round" />
        )}
        {ambiguo && rs.triangulos && otro && <line x1={otro.B.x} y1={otro.B.y} x2={otro.C.x} y2={otro.C.y} stroke={COLOR_ALERTA} strokeWidth={4} strokeLinecap="round" strokeDasharray="6 3" />}

        {/* ángulos */}
        {vertices.map(({ v }) =>
          rs.angulos[v] || angulosConocidos[v] ? (
            <path key={`arc${v}`} d={tri.arcos[v]} fill="none" stroke={rs.angulos[v] ?? "var(--foreground)"} strokeWidth={rs.angulos[v] ? 3 : 1.5} strokeOpacity={rs.angulos[v] ? 1 : 0.6} />
          ) : null
        )}

        {/* altura */}
        {datos.altura && rs.altura && (
          <g>
            <line x1={datos.altura.desde.x} y1={datos.altura.desde.y} x2={datos.altura.hasta.x} y2={datos.altura.hasta.y} stroke={COLOR_ALERTA} strokeWidth={2.5} strokeDasharray="5 3" />
            <text x={(datos.altura.desde.x + datos.altura.hasta.x) / 2 + 7} y={(datos.altura.desde.y + datos.altura.hasta.y) / 2 + 4} className="text-[12px] font-bold" fill={COLOR_ALERTA} {...HALO}>
              h
            </text>
          </g>
        )}

        {/* vértices */}
        {vertices.map(({ v, p }) => {
          const pos = fuera(p, c0, 15);
          return (
            <text key={v} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="text-[13px] font-bold" fill={rs.angulos[v] ?? "var(--foreground)"} {...HALO}>
              {v}
              {angulosConocidos[v] ? ` = ${t0[v] % 1 === 0 ? t0[v] : dec(t0[v], 1, sep)}°` : ""}
            </text>
          );
        })}
        {ambiguo && otro && rs.triangulos && (
          <text x={otro.B.x} y={otro.B.y + 15} textAnchor="middle" className="text-[13px] font-bold" fill={COLOR_ALERTA} {...HALO}>
            B₂
          </text>
        )}

        {/* lados: letra, con su valor si es un dato (o el resultado) y "?" si es la incógnita */}
        {lados.map(({ l, p, q }) => {
          if (ambiguo && (l === "c" || (l === "a" && (!rs.triangulos || datos.cantidad === 0)))) return null;
          const esIncognita = l === incognitaFinal;
          const mostrarValor = conocidos[l] || (esIncognita && enResultado);
          const texto = mostrarValor ? valorLado(l) : esIncognita ? `${l} = ?` : l;
          const pos = fuera(medio(p, q), c0, 17);
          return (
            <text key={l} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" className="text-[12px] font-bold" fill={rs.lados[l] ?? "var(--foreground)"} {...HALO}>
              {texto}
            </text>
          );
        })}
      </svg>

      {paso.clave !== "conclusion" && paso.formulas.map((f, i) => <Formula key={i} tex={f} tamano="text-[15px]" />)}
      <Leyenda>
        <MathText texto={t(`ley.${datos.ley}.${paso.clave}`, { n: datos.cantidad })} />
      </Leyenda>
    </MarcoVisual>
  );
}
