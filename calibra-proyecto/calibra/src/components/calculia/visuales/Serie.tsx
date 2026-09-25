"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosSerie, esVisualCalculiaSerie, type DatosSerie } from "@/lib/calculia/visualesDatos";
import type { VisualCalculiaSerie } from "@/lib/calculia/visuales";
import { COLOR_AREA, COLOR_CURVA, MarcoVisual, redondear1, Leyenda, VISTA_CALCULIA, transicion, useNumeroCalculia } from "./comun";

interface Props {
  visual: VisualCalculiaSerie;
}

function calcular(v: VisualCalculiaSerie): DatosSerie | null {
  try {
    if (!esVisualCalculiaSerie(v)) return null;
    return datosSerie(v);
  } catch {
    return null;
  }
}

const COLOR_DIVERGE = "#DC2626";

// Sumas parciales de una serie geométrica, animadas de a una barra: cada
// paso agrega el siguiente término y muestra en qué queda la suma
// acumulada. Si converge, una línea punteada marca la suma infinita
// (a/(1-r)) a la que se acercan las barras; si diverge, se marca así (las
// barras crecen sin límite). Todos los valores salen de datosSerie(): el
// componente solo pinta.
export default function Serie({ visual }: Props) {
  const t = useTranslations("Calculia.visuales");
  const numero = useNumeroCalculia();
  const datos = useMemo(() => calcular(visual), [visual]);
  const { alVer, ...r } = useReproductor({ total: datos ? datos.parciales.length : 0, ms: 1100, estatico: visual.estatico });
  if (!datos) return null;

  const { ancho, alto, izq, der, arriba, abajo } = VISTA_CALCULIA;
  const anchoUtil = ancho - izq - der;
  const altoUtil = alto - arriba - abajo;
  const n = datos.parciales.length;

  // El eje se coloca según el rango real de los valores (0, las sumas parciales
  // y la suma infinita): con todas las sumas positivas no se desperdicia la
  // mitad de abajo; con signos alternados el eje queda entre las dos mitades.
  const valores = [0, ...datos.parciales, ...(datos.converge && datos.sumaInfinita !== null ? [datos.sumaInfinita] : [])];
  const rango = Math.max(Math.max(...valores) - Math.min(...valores), 1e-6);
  const techo = Math.max(...valores) + rango * 0.1;
  const piso = Math.min(...valores) - (Math.min(...valores) < 0 ? rango * 0.1 : 0);
  const yDe = (v: number) => redondear1(arriba + ((techo - v) / (techo - piso)) * altoUtil);
  const ejeXpx = yDe(0);

  const anchoBarra = anchoUtil / n;
  const visibles = datos.parciales.slice(0, r.paso);

  const aTexto = numero(datos.a);
  const rTexto = numero(datos.r, 4);
  const sumaTexto = datos.sumaInfinita === null ? null : numero(datos.sumaInfinita);
  const ultimaSuma = visibles.length > 0 ? visibles[visibles.length - 1] : null;

  const alternativa = (
    <>
      <p><MathText texto={t("serie.alt", { a: aTexto, r: rTexto })} /></p>
      <p><MathText texto={datos.converge ? t("serie.altConverge", { total: sumaTexto ?? "" }) : t("serie.altDiverge")} /></p>
      <ol>
        {datos.parciales.map((s, i) => (
          <li key={i}><MathText texto={t("serie.sumaParcial", { n: i + 1, valor: numero(s) })} /></li>
        ))}
      </ol>
    </>
  );

  const textoLeyenda =
    (ultimaSuma === null ? t("serie.alt", { a: aTexto, r: rTexto }) : t("serie.sumaParcial", { n: visibles.length, valor: numero(ultimaSuma) })) +
    (r.alFinal && datos.converge && sumaTexto !== null ? ` — ${t("serie.altConverge", { total: sumaTexto })}` : "") +
    (r.alFinal && !datos.converge ? ` — ${t("serie.altDiverge")}` : "");

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.serie")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_CURVA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[380px]">
        <line x1={izq} y1={ejeXpx} x2={ancho - der} y2={ejeXpx} stroke="var(--foreground)" strokeOpacity={0.5} strokeWidth={1.5} />

        {datos.converge && sumaTexto !== null && (
          <line
            x1={izq}
            y1={yDe(datos.sumaInfinita as number)}
            x2={ancho - der}
            y2={yDe(datos.sumaInfinita as number)}
            stroke={COLOR_AREA}
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
        )}

        {visibles.map((s, i) => {
          const x = redondear1(izq + anchoBarra * i + anchoBarra * 0.15);
          const w = redondear1(anchoBarra * 0.7);
          const yTop = Math.min(yDe(s), ejeXpx);
          const h = Math.max(1, redondear1(Math.abs(yDe(s) - ejeXpx)));
          const esUltima = i === visibles.length - 1;
          return (
            <rect
              key={i}
              x={x}
              y={yTop}
              width={w}
              height={h}
              fill={COLOR_CURVA}
              fillOpacity={esUltima ? 0.9 : 0.5}
              style={{ transition: transicion(r.reducir, "height, y", 350) }}
            />
          );
        })}
      </svg>

      <Leyenda acento={datos.converge ? COLOR_AREA : COLOR_DIVERGE}>
        <MathText texto={textoLeyenda} />
      </Leyenda>
    </MarcoVisual>
  );
}
