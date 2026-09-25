"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosTangente, esVisualCalculiaTangente, type DatosTangente } from "@/lib/calculia/visualesDatos";
import type { VisualCalculiaTangente } from "@/lib/calculia/visuales";
import { COLOR_CURVA, COLOR_SECANTE, COLOR_TANGENTE_FINAL, MarcoVisual, Leyenda, VISTA_CALCULIA, escalaCalculia, formulaFuncion, transicion, useNumeroCalculia } from "./comun";

interface Props {
  visual: VisualCalculiaTangente;
}

type PasoTangente = "curva" | "secante1" | "secante2" | "tangente";
const PASOS: PasoTangente[] = ["curva", "secante1", "secante2", "tangente"];

function calcular(v: VisualCalculiaTangente): DatosTangente | null {
  try {
    if (!esVisualCalculiaTangente(v)) return null;
    return datosTangente(v);
  } catch {
    return null;
  }
}

// Pendiente de la recta tangente, animada por pasos: la curva sola, dos
// secantes que se acercan cada vez más al punto de tangencia, y por último
// la recta tangente con la pendiente exacta (regla de la potencia / cadena,
// calculada en src/lib/calculia/visualesDatos.ts). Todas las coordenadas
// salen de datosTangente(): el componente solo pinta.
export default function Tangente({ visual }: Props) {
  const t = useTranslations("Calculia.visuales");
  const numero = useNumeroCalculia();
  const datos = useMemo(() => calcular(visual), [visual]);
  const { alVer, ...r } = useReproductor({ total: datos ? PASOS.length : 0, ms: 2200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;

  const { ancho, alto, izq, der, arriba } = VISTA_CALCULIA;
  const escala = escalaCalculia(datos.rango, datos.curva.map((p) => p.y));
  const formula = formulaFuncion(datos.funcion);
  const activos = new Set(PASOS.slice(0, r.paso));
  const ultimo = PASOS[Math.max(0, r.paso - 1)];

  const curvaPath = datos.curva.map((p, i) => `${i === 0 ? "M" : "L"}${escala.px(p.x)} ${escala.py(p.y)}`).join(" ");
  const px0 = escala.px(datos.x0);
  const py0 = escala.py(datos.y0);

  // Recta tangente final: se dibuja atravesando TODO el dominio visible
  // (no solo hasta el punto secante), con la pendiente exacta.
  const [xMin, xMax] = datos.rango;
  const yEnXmin = datos.y0 + datos.pendiente * (xMin - datos.x0);
  const yEnXmax = datos.y0 + datos.pendiente * (xMax - datos.x0);

  const pendienteTexto = numero(datos.pendiente);
  const x0Texto = numero(datos.x0);
  const y0Texto = numero(datos.y0);

  const alternativa = (
    <p><MathText texto={t("tangente.alt", { formula, x0: x0Texto, y0: y0Texto, pendiente: pendienteTexto })} /></p>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.tangente")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_CURVA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[380px]">
        <line x1={izq} y1={escala.ejeXpx} x2={ancho - der} y2={escala.ejeXpx} stroke="var(--foreground)" strokeOpacity={0.5} strokeWidth={1.5} />
        <line x1={escala.ejeYpx} y1={arriba} x2={escala.ejeYpx} y2={alto - VISTA_CALCULIA.abajo} stroke="var(--foreground)" strokeOpacity={0.5} strokeWidth={1.5} />

        {/* curva de f */}
        <path
          d={curvaPath}
          pathLength={1}
          fill="none"
          stroke={COLOR_CURVA}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 1, strokeDashoffset: activos.has("curva") ? 0 : 1, transition: transicion(r.reducir, "stroke-dashoffset", 900) }}
        />

        {/* secante 1 (más lejana) */}
        {activos.has("secante1") && !activos.has("secante2") && (
          <line
            x1={escala.px(datos.secante1.x1)}
            y1={escala.py(datos.secante1.y1)}
            x2={escala.px(datos.secante1.x2)}
            y2={escala.py(datos.secante1.y2)}
            stroke={COLOR_SECANTE}
            strokeWidth={2.5}
            strokeDasharray="6 4"
          />
        )}

        {/* secante 2 (más cercana) */}
        {activos.has("secante2") && !activos.has("tangente") && (
          <line
            x1={escala.px(datos.secante2.x1)}
            y1={escala.py(datos.secante2.y1)}
            x2={escala.px(datos.secante2.x2)}
            y2={escala.py(datos.secante2.y2)}
            stroke={COLOR_SECANTE}
            strokeWidth={2.5}
            strokeDasharray="4 3"
          />
        )}

        {/* recta tangente final */}
        {activos.has("tangente") && (
          <line
            x1={escala.px(xMin)}
            y1={escala.py(yEnXmin)}
            x2={escala.px(xMax)}
            y2={escala.py(yEnXmax)}
            stroke={COLOR_TANGENTE_FINAL}
            strokeWidth={2.5}
          />
        )}

        {/* punto de tangencia, siempre visible */}
        <circle cx={px0} cy={py0} r={4.5} fill={COLOR_TANGENTE_FINAL} stroke="var(--surface)" strokeWidth={1.5} />
      </svg>

      <Leyenda>
        {ultimo === "curva" && <MathText texto={t("tangente.pasoCurva", { formula })} />}
        {ultimo === "secante1" && <MathText texto={t("tangente.pasoSecante1")} />}
        {ultimo === "secante2" && <MathText texto={t("tangente.pasoSecante2")} />}
        {ultimo === "tangente" && <MathText texto={t("tangente.pasoTangente", { pendiente: pendienteTexto })} />}
      </Leyenda>
    </MarcoVisual>
  );
}
