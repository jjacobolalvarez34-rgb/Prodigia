"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosArea, esVisualCalculiaArea, type DatosArea } from "@/lib/calculia/visualesDatos";
import type { VisualCalculiaArea } from "@/lib/calculia/visuales";
import { COLOR_AREA, COLOR_CURVA, MarcoVisual, redondear1, Leyenda, VISTA_CALCULIA, escalaCalculia, formulaFuncion, transicion, useNumeroCalculia } from "./comun";

interface Props {
  visual: VisualCalculiaArea;
}

type PasoArea = "curva" | "rectangulos1" | "rectangulos2" | "area";
const PASOS: PasoArea[] = ["curva", "rectangulos1", "rectangulos2", "area"];

function calcular(v: VisualCalculiaArea): DatosArea | null {
  try {
    if (!esVisualCalculiaArea(v)) return null;
    return datosArea(v);
  } catch {
    return null;
  }
}

// Área bajo la curva, animada por pasos: la curva sola, rectángulos de
// Riemann (punto medio) con 4 y con 12 divisiones que se afinan, y por
// último el área exacta rellena (antiderivada evaluada en los extremos,
// calculada en src/lib/calculia/visualesDatos.ts). Todas las coordenadas
// salen de datosArea(): el componente solo pinta.
export default function Area({ visual }: Props) {
  const t = useTranslations("Calculia.visuales");
  const numero = useNumeroCalculia();
  const datos = useMemo(() => calcular(visual), [visual]);
  const { alVer, ...r } = useReproductor({ total: datos ? PASOS.length : 0, ms: 2200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;

  const { ancho, alto, izq, der, arriba } = VISTA_CALCULIA;
  const alturasRects = [...datos.rectangulos4, ...datos.rectangulos12].map((rt) => rt.alto);
  const escala = escalaCalculia(datos.rango, [...datos.curva.map((p) => p.y), ...alturasRects]);
  const formula = formulaFuncion(datos.funcion);
  const activos = new Set(PASOS.slice(0, r.paso));
  const ultimo = PASOS[Math.max(0, r.paso - 1)];

  const curvaPath = datos.curva.map((p, i) => `${i === 0 ? "M" : "L"}${escala.px(p.x)} ${escala.py(p.y)}`).join(" ");

  // Región exacta rellena entre `desde` y `hasta` (borde superior = f
  // muestreada exactamente entre los dos extremos).
  const areaPath =
    datos.relleno.length > 1
      ? `M${escala.px(datos.desde)} ${escala.ejeXpx} ` +
        datos.relleno.map((p) => `L${escala.px(p.x)} ${escala.py(p.y)}`).join(" ") +
        ` L${escala.px(datos.hasta)} ${escala.ejeXpx} Z`
      : "";

  const areaTexto = numero(datos.area);
  const desdeTexto = numero(datos.desde);
  const hastaTexto = numero(datos.hasta);

  const alternativa = <p><MathText texto={t("area.alt", { formula, desde: desdeTexto, hasta: hastaTexto, area: areaTexto })} /></p>;

  // (Función que devuelve elementos, no un componente: se llama, no se monta.)
  const rectangulos = (rects: { x: number; ancho: number; alto: number }[]) => (
    <>
      {rects.map((rt, i) => {
        const x1 = escala.px(rt.x);
        const x2 = escala.px(rt.x + rt.ancho);
        const yTop = escala.py(rt.alto);
        return (
          <rect
            key={i}
            x={Math.min(x1, x2)}
            y={Math.min(yTop, escala.ejeXpx)}
            width={redondear1(Math.abs(x2 - x1))}
            height={redondear1(Math.abs(escala.ejeXpx - yTop))}
            fill={COLOR_AREA}
            fillOpacity={0.35}
            stroke={COLOR_AREA}
            strokeWidth={1}
          />
        );
      })}
    </>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.area")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_CURVA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[380px]">
        <line x1={izq} y1={escala.ejeXpx} x2={ancho - der} y2={escala.ejeXpx} stroke="var(--foreground)" strokeOpacity={0.5} strokeWidth={1.5} />
        <line x1={escala.ejeYpx} y1={arriba} x2={escala.ejeYpx} y2={alto - VISTA_CALCULIA.abajo} stroke="var(--foreground)" strokeOpacity={0.5} strokeWidth={1.5} />

        {activos.has("rectangulos1") && !activos.has("rectangulos2") && !activos.has("area") && rectangulos(datos.rectangulos4)}
        {activos.has("rectangulos2") && !activos.has("area") && rectangulos(datos.rectangulos12)}
        {activos.has("area") && areaPath && (
          <path d={areaPath} fill={COLOR_AREA} fillOpacity={0.4} stroke={COLOR_AREA} strokeWidth={1.5} style={{ transition: transicion(r.reducir, "opacity", 500) }} />
        )}

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
      </svg>

      <Leyenda>
        {ultimo === "curva" && <MathText texto={t("area.pasoCurva", { formula, desde: desdeTexto, hasta: hastaTexto })} />}
        {ultimo === "rectangulos1" && <MathText texto={t("area.pasoRectangulos1")} />}
        {ultimo === "rectangulos2" && <MathText texto={t("area.pasoRectangulos2")} />}
        {ultimo === "area" && <MathText texto={t("area.pasoArea", { area: areaTexto })} />}
      </Leyenda>
    </MarcoVisual>
  );
}
