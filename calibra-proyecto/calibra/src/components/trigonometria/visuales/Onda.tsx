"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import { VISTA_ONDA, datosOnda, esOndaJsonValida, textoOnda, type DatosOnda } from "@/lib/trigonometria/visualesDatos";
import type { PasoOnda, VisualTrigonometriaOnda } from "@/lib/trigonometria/visuales";
import { COLOR_ALERTA, COLOR_COSENO, COLOR_SENO, COLOR_TANGENTE, COLOR_TRIGONOMETRIA, Formula, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualTrigonometriaOnda;
}

function calcular(v: VisualTrigonometriaOnda): DatosOnda | null {
  try {
    if (!esOndaJsonValida(v.onda) || (v.base !== undefined && !esOndaJsonValida(v.base))) return null;
    if (!Array.isArray(v.rango) || v.rango.length !== 2) return null;
    return datosOnda(v);
  } catch {
    return null;
  }
}

const HALO = { stroke: "var(--surface)", strokeWidth: 3.5, paintOrder: "stroke" } as const;

// Gráfica de una función sinusoidal o de la tangente, dibujada por muestreo de
// la función pura (ondas.ts) con el eje x en múltiplos de π. Cada paso agrega
// una marca (amplitud, periodo, desfase, línea media, puntos clave o
// asíntotas). Todas las posiciones salen de datosOnda(): el componente solo pinta.
export default function Onda({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  const datos = useMemo(() => calcular(visual), [visual]);
  const pasos: PasoOnda[] = useMemo(() => (visual.pasos && visual.pasos.length > 0 ? visual.pasos : ["curva"]), [visual.pasos]);
  const { alVer, ...r } = useReproductor({ total: datos ? pasos.length : 0, ms: 2600, estatico: visual.estatico, inicio: datos ? 1 : 0 });
  if (!datos) return null;

  const { ancho, alto, izq, der, arriba, abajo } = VISTA_ONDA;
  const activos = new Set(pasos.slice(0, r.paso));
  const ultimo = pasos[Math.max(0, r.paso - 1)];
  const colorCurva = datos.onda.fn === "tan" ? COLOR_TANGENTE : datos.onda.fn === "cos" ? COLOR_COSENO : COLOR_SENO;
  const yTope = arriba;
  const yFondo = alto - abajo;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.onda")}
      titulo={visual.titulo}
      alternativa={<p>{textoOnda(visual)}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_TRIGONOMETRIA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[380px]">
        {/* cuadrícula suave y marcas */}
        {datos.ticksX.map((k) => (
          <g key={`x${k.pos}`}>
            <line x1={k.pos} y1={yTope} x2={k.pos} y2={yFondo} stroke="var(--border)" strokeWidth={1} opacity={0.6} />
            <text x={k.pos} y={alto - 12} textAnchor="middle" className="fill-foreground text-[10px]" opacity={0.8}>
              {k.etiqueta}
            </text>
          </g>
        ))}
        {datos.ticksY.map((k) => (
          <g key={`y${k.pos}`}>
            <line x1={izq} y1={k.pos} x2={ancho - der} y2={k.pos} stroke="var(--border)" strokeWidth={1} opacity={0.6} />
            <text x={izq - 5} y={k.pos + 3.5} textAnchor="end" className="fill-foreground text-[10px]" opacity={0.8}>
              {k.etiqueta}
            </text>
          </g>
        ))}
        <line x1={izq} y1={datos.ejeXpx} x2={ancho - der} y2={datos.ejeXpx} stroke="var(--foreground)" strokeOpacity={0.6} strokeWidth={1.5} />
        <line x1={datos.ejeYpx} y1={yTope} x2={datos.ejeYpx} y2={yFondo} stroke="var(--foreground)" strokeOpacity={0.6} strokeWidth={1.5} />
        <text x={izq - 5} y={datos.ejeXpx + 3.5} textAnchor="end" className="fill-foreground text-[10px]" opacity={0.8}>
          0
        </text>

        {/* curva de referencia, punteada */}
        {datos.curvaBase.map((d, i) => (
          <path key={`b${i}`} d={d} fill="none" stroke="var(--foreground)" strokeOpacity={0.45} strokeWidth={2} strokeDasharray="5 4" />
        ))}

        {/* asíntotas */}
        {activos.has("asintotas") &&
          datos.asintotas.map((x) => <line key={`a${x}`} x1={x} y1={yTope} x2={x} y2={yFondo} stroke={COLOR_ALERTA} strokeWidth={1.5} strokeDasharray="6 4" />)}

        {/* línea media */}
        {activos.has("vertical") && datos.lineaMedia && (
          <g>
            <line x1={izq} y1={datos.lineaMedia.y} x2={ancho - der} y2={datos.lineaMedia.y} stroke={COLOR_TRIGONOMETRIA} strokeWidth={2} strokeDasharray="7 4" />
            <text x={ancho - der - 4} y={datos.lineaMedia.y - 5} textAnchor="end" className="fill-foreground text-[11px] font-bold" {...HALO}>
              {`y = ${datos.lineaMedia.valor}`}
            </text>
          </g>
        )}

        {/* la curva, que se dibuja al aparecer */}
        {datos.curva.map((d, i) => (
          <path
            key={`c${i}`}
            d={d}
            pathLength={1}
            fill="none"
            stroke={colorCurva}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 1, strokeDashoffset: activos.has("curva") ? 0 : 1, transition: transicion(r.reducir, "stroke-dashoffset", 1100) }}
          />
        ))}

        {/* desfase */}
        {activos.has("desfase") && datos.desfase && (
          <g>
            <line x1={datos.ejeYpx} y1={datos.ejeXpx} x2={datos.desfase.x} y2={datos.ejeXpx} stroke={COLOR_ALERTA} strokeWidth={3} />
            <circle cx={datos.desfase.x} cy={datos.desfase.y} r={4.5} fill={COLOR_ALERTA} />
            <text x={datos.desfase.x} y={datos.ejeXpx + 15} textAnchor="middle" className="fill-foreground text-[11px] font-bold" {...HALO}>
              {`c = ${datos.valores.desfase}`}
            </text>
          </g>
        )}

        {/* amplitud */}
        {activos.has("amplitud") && datos.amplitud && (
          <g>
            <line x1={datos.amplitud.x} y1={datos.amplitud.yMedio} x2={datos.amplitud.x} y2={datos.amplitud.yExtremo} stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} />
            <line x1={datos.amplitud.x - 5} y1={datos.amplitud.yExtremo} x2={datos.amplitud.x + 5} y2={datos.amplitud.yExtremo} stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} />
            <line x1={datos.amplitud.x - 5} y1={datos.amplitud.yMedio} x2={datos.amplitud.x + 5} y2={datos.amplitud.yMedio} stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} />
            <text x={datos.amplitud.x + 9} y={(datos.amplitud.yMedio + datos.amplitud.yExtremo) / 2 + 4} className="fill-foreground text-[11px] font-bold" {...HALO}>
              {`a = ${datos.amplitud.valor}`}
            </text>
          </g>
        )}

        {/* periodo */}
        {activos.has("periodo") && datos.periodo && (
          <g>
            <line x1={datos.periodo.x0} y1={datos.periodo.y} x2={datos.periodo.x1} y2={datos.periodo.y} stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} />
            <line x1={datos.periodo.x0} y1={datos.periodo.y - 5} x2={datos.periodo.x0} y2={datos.periodo.y + 5} stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} />
            <line x1={datos.periodo.x1} y1={datos.periodo.y - 5} x2={datos.periodo.x1} y2={datos.periodo.y + 5} stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} />
            <text x={(datos.periodo.x0 + datos.periodo.x1) / 2} y={datos.periodo.y - 8} textAnchor="middle" className="fill-foreground text-[11px] font-bold" {...HALO}>
              {`P = ${datos.periodo.valor}`}
            </text>
          </g>
        )}

        {/* puntos clave */}
        {activos.has("puntos") && datos.puntos.map((p, i) => <circle key={`p${i}`} cx={p.x} cy={p.y} r={4.5} fill={COLOR_TRIGONOMETRIA} stroke="var(--surface)" strokeWidth={1.5} />)}
      </svg>

      <Formula tex={datos.valores.ecuacion} tamano="text-[15px]" />
      <Leyenda>
        <MathText
          texto={t(ultimo === "curva" ? `onda.curva.${datos.onda.fn}` : `onda.${ultimo}`, {
            amplitud: datos.valores.amplitud,
            periodo: datos.valores.periodo,
            desfase: datos.valores.desfase,
            medio: datos.valores.medio,
            maximo: datos.valores.maximo,
            minimo: datos.valores.minimo,
          })}
        />
      </Leyenda>
    </MarcoVisual>
  );
}
