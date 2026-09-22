"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import type { VisualNumeriaRecta } from "@/lib/numeria/visuales";
import { posicionEnRecta } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaRecta;
}

// Técnicas de Decimales: recta numérica con uno o más valores marcados —
// ver DÓNDE cae un decimal (o un porcentaje expresado como decimal) entre
// dos referencias, en vez de solo leer el número suelto.
export default function Recta({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.recta");
  const min = visual.min;
  const max = visual.max;
  const marcas = Array.isArray(visual.marcas) ? visual.marcas.filter((m) => typeof m?.valor === "number" && Number.isFinite(m.valor)) : [];
  const valido = Number.isFinite(min) && Number.isFinite(max) && max > min && marcas.length > 0;
  const { alVer, ...r } = useReproductor({ total: marcas.length, ms: 1400, estatico: visual.estatico, inicio: 1 });
  if (!valido) return null;

  const alternativa = (
    <ol>
      {marcas.map((m, i) => (
        <li key={i}>{m.etiqueta ?? t("valor", { n: m.valor })}</li>
      ))}
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { min, max })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <div className="relative h-20 w-full">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ background: COLOR_NUMERIA, opacity: 0.3 }} />
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-texto-secundario">{min}</span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-texto-secundario">{max}</span>
        {marcas.slice(0, r.paso).map((m, i) => {
          const pos = posicionEnRecta(m.valor, min, max);
          return (
            <motion.div
              key={i}
              initial={r.reducir ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${pos}%` }}
            >
              <span className="h-3.5 w-3.5 rounded-full border-2" style={{ borderColor: COLOR_NUMERIA, background: COLOR_NUMERIA }} />
              {m.etiqueta && (
                <span
                  className="mt-3 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-bold text-foreground"
                  style={{ background: `color-mix(in oklab, ${COLOR_NUMERIA} 16%, var(--surface))` }}
                >
                  <MathText texto={m.etiqueta} />
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </MarcoVisual>
  );
}
