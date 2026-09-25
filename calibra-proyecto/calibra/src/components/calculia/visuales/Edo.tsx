"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosEdo, esVisualCalculiaEdo, type DatosEdo } from "@/lib/calculia/visualesDatos";
import type { VisualCalculiaEdo } from "@/lib/calculia/visuales";
import { COLOR_CURVA, COLOR_TANGENTE_FINAL, MarcoVisual, Leyenda, VISTA_CALCULIA, escalaCalculia, transicion, useNumeroCalculia } from "./comun";

interface Props {
  visual: VisualCalculiaEdo;
}

type PasoEdo = "familia" | "punto" | "pendiente";
const PASOS: PasoEdo[] = ["familia", "punto", "pendiente"];

function calcular(v: VisualCalculiaEdo): DatosEdo | null {
  try {
    if (!esVisualCalculiaEdo(v)) return null;
    return datosEdo(v);
  } catch {
    return null;
  }
}

// LaTeX (sin los $) de la ecuación y de su solución, a partir de k y n.
function ecuacion(k: number, n: number): string {
  const coef = k === 1 ? "" : k === -1 ? "-" : `${k}`;
  const potencia = n === 0 ? "" : n === 1 ? "x" : `x^{${n}}`;
  return `\\dfrac{dy}{dx} = ${coef}${potencia}${potencia ? "\\," : ""}y`;
}

function solucion(k: number, n: number): string {
  // k/(n+1) siempre se muestra como fracción reducida entera cuando divide.
  const m = k / (n + 1);
  const coef = Number.isInteger(m) ? (m === 1 ? "" : m === -1 ? "-" : `${m}`) : `\\dfrac{${k}}{${n + 1}}`;
  return `y = A\\,e^{${coef}x^{${n + 1}}}`;
}

// Familia de soluciones de una EDO separable dy/dx = k·x^n·y: tres curvas
// (una por constante A) y, en un punto, la comprobación de que la pendiente
// de la curva es la que pide la ecuación. Todo sale de datosEdo() (funciones
// puras, verificadas por diferencia finita en visualesDatos.test.ts).
export default function Edo({ visual }: Props) {
  const t = useTranslations("Calculia.visuales");
  const numero = useNumeroCalculia();
  const datos = useMemo(() => calcular(visual), [visual]);
  const { alVer, ...r } = useReproductor({ total: datos ? PASOS.length : 0, ms: 2200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;

  const { ancho, alto, izq, der, arriba } = VISTA_CALCULIA;
  const escala = escalaCalculia(datos.rango, datos.curvas.flatMap((c) => c.puntos.map((p) => p.y)));
  const activos = new Set(PASOS.slice(0, r.paso));
  const ultimo = PASOS[Math.max(0, r.paso - 1)];
  const eq = ecuacion(datos.k, datos.n);
  const sol = solucion(datos.k, datos.n);

  const trazo = (puntos: { x: number; y: number }[]) => puntos.map((p, i) => `${i === 0 ? "M" : "L"}${escala.px(p.x)} ${escala.py(p.y)}`).join(" ");
  const px0 = escala.px(datos.x0);
  const py0 = escala.py(datos.y0);
  const x0Texto = numero(datos.x0);
  const y0Texto = numero(datos.y0);
  const pendienteTexto = numero(datos.pendiente);

  const alternativa = <p><MathText texto={t("edo.alt", { eq, sol, x0: x0Texto, y0: y0Texto, pendiente: pendienteTexto })} /></p>;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.edo")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_CURVA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[380px]">
        <line x1={izq} y1={escala.ejeXpx} x2={ancho - der} y2={escala.ejeXpx} stroke="var(--foreground)" strokeOpacity={0.5} strokeWidth={1.5} />
        <line x1={escala.ejeYpx} y1={arriba} x2={escala.ejeYpx} y2={alto - VISTA_CALCULIA.abajo} stroke="var(--foreground)" strokeOpacity={0.5} strokeWidth={1.5} />

        {datos.curvas.map((c) => (
          <path
            key={c.A}
            d={trazo(c.puntos)}
            pathLength={1}
            fill="none"
            stroke={COLOR_CURVA}
            strokeOpacity={c.A === 1 ? 1 : 0.35}
            strokeWidth={c.A === 1 ? 3 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 1, strokeDashoffset: activos.has("familia") ? 0 : 1, transition: transicion(r.reducir, "stroke-dashoffset", 900) }}
          />
        ))}

        {activos.has("pendiente") && (
          <line
            x1={escala.px(datos.tangente.x1)}
            y1={escala.py(datos.tangente.y1)}
            x2={escala.px(datos.tangente.x2)}
            y2={escala.py(datos.tangente.y2)}
            stroke={COLOR_TANGENTE_FINAL}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {activos.has("punto") && <circle cx={px0} cy={py0} r={4.5} fill={COLOR_TANGENTE_FINAL} stroke="var(--surface)" strokeWidth={1.5} />}
      </svg>

      <Leyenda>
        {ultimo === "familia" && <MathText texto={t("edo.pasoFamilia", { eq, sol })} />}
        {ultimo === "punto" && <MathText texto={t("edo.pasoPunto", { x0: x0Texto, y0: y0Texto })} />}
        {ultimo === "pendiente" && <MathText texto={t("edo.pasoPendiente", { x0: x0Texto, y0: y0Texto, pendiente: pendienteTexto })} />}
      </Leyenda>
    </MarcoVisual>
  );
}
