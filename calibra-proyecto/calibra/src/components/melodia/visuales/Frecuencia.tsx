"use client";

import { Fragment } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { VisualMelodiaFrecuencia } from "@/lib/melodia/visuales";
import { formatoHz, formatoRazon, resolverFrecuencia, textoDeVisual } from "@/lib/melodia/visualesDatos";
import { nombreNota } from "@/lib/practica/melodia";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { BotonEscuchar, MarcoVisual, COLOR_MELODIA, fondoAcento } from "./comun";

// melodia.frecuencia: cada nota con su frecuencia (temperamento igual,
// La4 = 440 Hz) y la razón con la anterior. Las frecuencias salen de
// frecuenciaDeNota (la misma función que suena en el modo Oído absoluto).
export default function Frecuencia({ visual }: { visual: VisualMelodiaFrecuencia }) {
  const t = useTranslations("Melodia.visuales.frecuencia");
  const idioma = useLocale() === "en" ? "en" : "es";
  const filas = resolverFrecuencia(visual);
  const { alVer, ...r } = useReproductor({ total: filas.length, ms: 1300, estatico: visual.estatico, inicio: filas.length > 0 ? 1 : 0 });
  if (filas.length === 0) return null;

  const alternativa = <p>{textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>, idioma)}</p>;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      nota={t("nota")}
      controles={
        <>
          <ControlesReproductor r={r} color={COLOR_MELODIA} />
          {visual.escuchar && <BotonEscuchar notas={filas.map((f) => f.nota)} />}
        </>
      }
    >
      <ol className="mx-auto flex w-full max-w-xs flex-col items-stretch gap-1">
        {filas.map((f, i) => {
          const visible = i < r.paso;
          const actual = i === r.paso - 1;
          return (
            <Fragment key={i}>
              {f.razon !== null && (
                <li
                  aria-hidden="true"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold transition-opacity duration-300 motion-reduce:transition-none"
                  style={{ color: COLOR_MELODIA, opacity: visible ? 1 : 0.2 }}
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2v11M3.5 9 8 13.5 12.5 9" />
                  </svg>
                  {formatoRazon(f.razon, idioma)}
                </li>
              )}
              <li
                className="flex items-baseline justify-between gap-3 rounded-xl border-2 px-3 py-2 transition-opacity duration-300 motion-reduce:transition-none"
                style={{ opacity: visible ? 1 : 0.2, borderColor: visible ? COLOR_MELODIA : "var(--border)", background: actual ? fondoAcento(14) : "var(--surface)" }}
              >
                <span className="text-base font-bold">{nombreNota(f.nota)}</span>
                <span className="text-sm tabular-nums text-texto-secundario">{formatoHz(f.hz, idioma)}</span>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </MarcoVisual>
  );
}
