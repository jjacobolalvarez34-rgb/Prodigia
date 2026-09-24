"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import { VISTA_ECUACION, VISTA_ECUACION_CIRCULO, datosEcuacion, type DatosEcuacion } from "@/lib/trigonometria/visualesDatos";
import type { VisualTrigonometriaEcuacion } from "@/lib/trigonometria/visuales";
import { COLOR_ALERTA, COLOR_COSENO, COLOR_SENO, COLOR_TANGENTE, COLOR_TRIGONOMETRIA, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualTrigonometriaEcuacion;
}

function calcular(v: VisualTrigonometriaEcuacion): DatosEcuacion | null {
  try {
    return datosEcuacion(v);
  } catch {
    return null;
  }
}

const HALO = { stroke: "var(--surface)", strokeWidth: 3.5, paintOrder: "stroke" } as const;
const TOTAL_PASOS = 5;

// Una ecuación trigonométrica básica en [0, 2π) vista de dos maneras: como los
// cortes de la gráfica de la función con la recta y = k, y como los puntos del
// círculo unitario que tienen ese valor. Las soluciones salen de
// solucionesEcuacion() (comparación EXACTA de valores) y las posiciones de
// datosEcuacion().
export default function Ecuacion({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  const datos = useMemo(() => calcular(visual), [visual]);
  const { alVer, ...r } = useReproductor({ total: datos ? TOTAL_PASOS : 0, ms: 2600, estatico: visual.estatico, inicio: datos ? 1 : 0 });
  if (!datos) return null;

  const g = VISTA_ECUACION;
  const c = VISTA_ECUACION_CIRCULO;
  const colorFn = datos.fn === "tan" ? COLOR_TANGENTE : datos.fn === "cos" ? COLOR_COSENO : COLOR_SENO;
  const clave = ["curva", "recta", "cortes", "circulo", "resumen"][Math.max(0, r.paso - 1)];
  const nombreFn = datos.fn === "sen" ? "\\operatorname{sen}" : `\\${datos.fn}`;
  const ecuacion = `$${nombreFn}\\,x=${datos.valorTex}$`;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.ecuacion")}
      titulo={visual.titulo}
      alternativa={<p>{datos.textoPlano}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_TRIGONOMETRIA} />}
    >
      <p className="text-center text-base text-foreground">
        <MathText texto={ecuacion} />
      </p>

      {/* gráfica y recta */}
      <svg viewBox={`0 0 ${g.ancho} ${g.alto}`} className="mx-auto h-auto w-full max-w-[380px]">
        {datos.ticksX.map((k) => (
          <g key={k.pos}>
            <line x1={k.pos} y1={g.arriba} x2={k.pos} y2={g.alto - g.abajo} stroke="var(--border)" strokeWidth={1} opacity={0.6} />
            <text x={k.pos} y={g.alto - 9} textAnchor="middle" className="fill-foreground text-[10px]" opacity={0.8}>
              {k.etiqueta}
            </text>
          </g>
        ))}
        <line x1={g.izq} y1={datos.ejeX} x2={g.ancho - g.der} y2={datos.ejeX} stroke="var(--foreground)" strokeOpacity={0.6} strokeWidth={1.5} />
        <line x1={g.izq} y1={g.arriba} x2={g.izq} y2={g.alto - g.abajo} stroke="var(--foreground)" strokeOpacity={0.6} strokeWidth={1.5} />
        {datos.curva.map((d, i) => (
          <path key={i} d={d} pathLength={1} fill="none" stroke={colorFn} strokeWidth={3} strokeLinecap="round" style={{ strokeDasharray: 1, strokeDashoffset: r.paso >= 1 ? 0 : 1, transition: transicion(r.reducir, "stroke-dashoffset", 1000) }} />
        ))}
        <g style={{ opacity: r.paso >= 2 ? 1 : 0, transition: transicion(r.reducir, "opacity", 500) }}>
          <line x1={g.izq} y1={datos.rectaY} x2={g.ancho - g.der} y2={datos.rectaY} stroke={COLOR_TRIGONOMETRIA} strokeWidth={2.5} strokeDasharray="7 4" />
          <text x={g.ancho - g.der - 3} y={datos.rectaY - 5} textAnchor="end" className="fill-foreground text-[11px] font-bold" {...HALO}>
            {`y = ${datos.valorPlano}`}
          </text>
        </g>
        <g style={{ opacity: r.paso >= 3 ? 1 : 0, transition: transicion(r.reducir, "opacity", 500) }}>
          {datos.cortes.map((p, i) => (
            <g key={i}>
              <line x1={p.x} y1={p.y} x2={p.x} y2={datos.ejeX} stroke={COLOR_ALERTA} strokeWidth={1.5} strokeDasharray="3 3" />
              <circle cx={p.x} cy={p.y} r={5} fill={COLOR_ALERTA} stroke="var(--surface)" strokeWidth={1.5} />
              <text x={p.x} y={p.y < datos.ejeX ? datos.ejeX + 13 : datos.ejeX - 6} textAnchor="middle" className="text-[11px] font-bold" fill={COLOR_ALERTA} {...HALO}>
                {datos.solucionesPiPlano[i]}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* círculo unitario */}
      <svg viewBox={`0 0 ${c.ancho} ${c.alto}`} className="mx-auto h-auto w-full max-w-[380px]" style={{ opacity: r.paso >= 4 ? 1 : 0.15, transition: transicion(r.reducir, "opacity", 500) }}>
        <line x1={c.cx - c.radio - 20} y1={c.cy} x2={c.cx + c.radio + 20} y2={c.cy} stroke="var(--border)" strokeWidth={1.5} />
        <line x1={c.cx} y1={c.cy - c.radio - 20} x2={c.cx} y2={c.cy + c.radio + 20} stroke="var(--border)" strokeWidth={1.5} />
        <circle cx={c.cx} cy={c.cy} r={c.radio} fill={`color-mix(in oklab, ${COLOR_TRIGONOMETRIA} 6%, transparent)`} stroke="var(--foreground)" strokeOpacity={0.55} strokeWidth={1.5} />
        <line x1={datos.rectaCirculo.x1} y1={datos.rectaCirculo.y1} x2={datos.rectaCirculo.x2} y2={datos.rectaCirculo.y2} stroke={COLOR_TRIGONOMETRIA} strokeWidth={2.5} strokeDasharray="7 4" />
        {datos.puntosCirculo.map((p, i) => {
          const derecha = p.x >= c.cx;
          return (
            <g key={i}>
              <line x1={c.cx} y1={c.cy} x2={p.x} y2={p.y} stroke={COLOR_ALERTA} strokeWidth={2} opacity={0.8} />
              <circle cx={p.x} cy={p.y} r={5.5} fill={COLOR_ALERTA} stroke="var(--surface)" strokeWidth={1.5} />
              <text x={p.x + (derecha ? 9 : -9)} y={p.y + (p.y < c.cy ? -6 : 14)} textAnchor={derecha ? "start" : "end"} className="text-[12px] font-bold" fill={COLOR_ALERTA} {...HALO}>
                {datos.solucionesPiPlano[i]}
              </text>
            </g>
          );
        })}
        <circle cx={c.cx} cy={c.cy} r={2.5} fill="var(--foreground)" />
      </svg>

      <Leyenda>
        <MathText
          texto={t(`ecuacion.${clave}`, {
            n: datos.soluciones.length,
            soluciones: datos.solucionesPiPlano.join(t("ecuacion.y")),
            fn: datos.fn === "sen" ? t("ecuacion.nombres.sen") : datos.fn === "cos" ? t("ecuacion.nombres.cos") : t("ecuacion.nombres.tan"),
            valor: datos.valorPlano,
          })}
        />
      </Leyenda>
      <p className="hidden">{VISTA_ECUACION.ancho}</p>
    </MarcoVisual>
  );
}
