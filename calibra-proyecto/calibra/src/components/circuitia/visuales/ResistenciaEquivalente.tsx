"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { disenarEquivalente, type EsquemaEquivalente, type ResistorEsquema } from "@/lib/circuitia/esquema";
import { datosResistenciaEquivalente, type DatosResistenciaEquivalente } from "@/lib/circuitia/visualesDatos";
import type { VisualCircuitiaResistenciaEquivalente } from "@/lib/circuitia/visuales";
import { COLOR_CIRCUITIA, Formula, Leyenda, MarcoVisual } from "./comun";

interface Props {
  visual: VisualCircuitiaResistenciaEquivalente;
}

interface Calculado {
  datos: DatosResistenciaEquivalente;
  dibujo: EsquemaEquivalente;
}

function calcular(v: VisualCircuitiaResistenciaEquivalente): Calculado | null {
  try {
    const datos = datosResistenciaEquivalente(v.modo, v.ohmios);
    return { datos, dibujo: disenarEquivalente(v.modo, v.ohmios, datos.total) };
  } catch {
    return null;
  }
}

function Zigzag({ r, resaltado }: { r: ResistorEsquema; resaltado?: boolean }) {
  return (
    <polyline
      points={r.puntos.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="none"
      stroke={resaltado ? COLOR_CIRCUITIA : "currentColor"}
      strokeWidth={resaltado ? 3.2 : 2}
      strokeLinejoin="round"
      strokeLinecap="round"
      className={resaltado ? undefined : "text-foreground/80"}
    />
  );
}

// Resistencia equivalente armada paso a paso: los resistores aparecen de a
// uno EN SU ARREGLO (en fila si es serie; entre dos rieles si es paralelo),
// se revela la fórmula (suma directa en serie; suma de recíprocos e
// inversión en paralelo) y al final el arreglo se funde en un único resistor
// equivalente. El valor SIEMPRE sale de datosResistenciaEquivalente, que
// delega en resistenciaEquivalente() de resolver.ts.
export default function ResistenciaEquivalente({ visual }: Props) {
  const t = useTranslations("Circuitia.visuales");
  const calculado = useMemo(() => calcular(visual), [visual]);
  const totalPasos = (calculado?.datos.ohmios.length ?? 0) + (calculado?.datos.formulas.length ?? 0);
  const { alVer, ...r } = useReproductor({ total: totalPasos, ms: 1600, estatico: visual.estatico, inicio: totalPasos > 0 ? 1 : 0 });
  if (!calculado) return null;

  const { datos, dibujo } = calculado;
  const nResistores = Math.min(r.paso, datos.ohmios.length);
  const nFormulas = Math.max(0, Math.min(datos.formulas.length, r.paso - datos.ohmios.length));
  const fundido = r.alFinal;
  const fade = (i: number) => ({
    initial: r.reducir ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.35, delay: r.reducir ? 0 : i * 0.02 },
  });

  const valores = datos.ohmios.map((o) => `${o} Ω`);
  const textoAlternativo =
    visual.modo === "serie"
      ? t("alternativa.resistenciaEquivalenteSerie", { valores: valores.join(" + "), total: datos.total })
      : t("alternativa.resistenciaEquivalenteParalelo", { valores: valores.join(", "), total: datos.total });

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t(`etiqueta.resistenciaEquivalente.${visual.modo}`)}
      titulo={visual.titulo}
      alternativa={<p>{textoAlternativo}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_CIRCUITIA} />}
    >
      <svg viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`} className="mx-auto h-auto w-full max-w-[440px]" focusable="false">
        {fundido ? (
          <motion.g key="equivalente" {...fade(0)}>
            {dibujo.cablesEquivalente.map((c, i) => (
              <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-foreground/70" />
            ))}
            <Zigzag r={dibujo.equivalente} resaltado />
            <text x={dibujo.equivalente.xCentro} y={dibujo.equivalente.yEtiqueta} textAnchor="middle" fill={COLOR_CIRCUITIA} className="text-[12px] font-black">
              R<tspan dy={3} fontSize={8.5}>eq</tspan>
              <tspan dy={-3}> = {dibujo.equivalente.ohmios} Ω</tspan>
            </text>
          </motion.g>
        ) : (
          <g>
            {dibujo.cables
              .filter((c) => c.desde <= nResistores)
              .map((c, i) => (
                <line key={`c${i}`} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-foreground/70" />
              ))}
            {nResistores >= 2 && dibujo.uniones.map((u, i) => <circle key={`u${i}`} cx={u.x} cy={u.y} r={3} fill="currentColor" className="text-foreground/80" />)}
            {dibujo.resistores.slice(0, nResistores).map((res, i) => (
              <motion.g key={res.id} {...fade(i)}>
                <Zigzag r={res} />
                <text x={res.xCentro} y={res.yEtiqueta} textAnchor="middle" className="fill-foreground text-[11.5px] font-semibold">
                  {res.id} = {res.ohmios} Ω
                </text>
              </motion.g>
            ))}
          </g>
        )}
      </svg>
      {nFormulas > 0 && !fundido && datos.formulas.slice(0, nFormulas).map((f, i) => <Formula key={i} tex={f} />)}
      {fundido && <Formula tex={datos.formulas[datos.formulas.length - 1]} />}
      <Leyenda>
        {fundido
          ? t(`resistenciaEquivalente.resultado.${visual.modo}`, { total: datos.total })
          : nFormulas > 0
            ? t(`resistenciaEquivalente.formula.${visual.modo}`)
            : t("resistenciaEquivalente.resistores", { n: nResistores })}
      </Leyenda>
    </MarcoVisual>
  );
}
