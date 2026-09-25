"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosCrecimiento } from "@/lib/codia/visualesDatos";
import type { VisualCodiaCrecimiento } from "@/lib/codia/visuales";
import { COLOR_CODIA, MarcoVisual } from "./comun";

interface Props {
  visual: VisualCodiaCrecimiento;
}

// Cuánto trabajo hace una función contar(n) cuando n crece: cada función se
// ejecuta de VERDAD (datosCrecimiento -> intérprete) para cada n, y las
// barras y el factor de crecimiento salen de esos conteos, no de una
// fórmula tipeada.
export default function Crecimiento({ visual }: Props) {
  const t = useTranslations("Codia.visuales.crecimiento");
  const datos = useMemo(() => {
    try {
      if (!Array.isArray(visual.series) || !Array.isArray(visual.ns) || visual.ns.length === 0 || visual.series.length === 0) return null;
      return datosCrecimiento(visual.series, visual.ns);
    } catch {
      return null;
    }
  }, [visual.series, visual.ns]);
  const total = datos?.ns.length ?? 0;
  const { alVer, ...r } = useReproductor({ total, ms: 1300, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || total === 0) return null;

  const alternativa = (
    <ul>
      {datos.series.map((serie) => (
        <li key={serie.nombre}>
          {t("serieAlt", {
            nombre: serie.nombre,
            etiqueta: serie.etiqueta,
            valores: datos.ns.map((valorN, i) => t("valorAlt", { n: valorN, cuenta: serie.valores[i] })).join("; "),
          })}
        </li>
      ))}
    </ul>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_CODIA} />}
    >
      <div className="grid grid-cols-1 gap-3">
        {datos.series.map((serie) => {
          const maximo = Math.max(...serie.valores, 1);
          return (
            <div key={serie.nombre} className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-background p-2.5">
              <p className="flex flex-wrap items-baseline justify-between gap-x-2 text-[13px] font-semibold text-foreground">
                <span className="min-w-0 break-words">{serie.nombre}</span>
                <span className="font-mono" style={{ color: COLOR_CODIA }}>
                  {serie.etiqueta}
                </span>
              </p>
              {datos.ns.slice(0, r.paso).map((valorN, i) => {
                const porcentaje = Math.max(4, Math.round((serie.valores[i] / maximo) * 100));
                const factor = serie.factores[i];
                return (
                  <div key={valorN} className="flex items-center gap-2 font-mono text-[12px] text-foreground">
                    <span className="w-11 shrink-0 text-right text-texto-secundario">n = {valorN}</span>
                    <div className="h-4 min-w-0 flex-1 overflow-hidden rounded bg-surface-2">
                      <motion.div
                        className="h-full rounded"
                        style={{ background: COLOR_CODIA }}
                        initial={r.reducir ? false : { width: 0 }}
                        animate={{ width: `${porcentaje}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right font-semibold tabular-nums">{serie.valores[i]}</span>
                    <span className="w-9 shrink-0 text-[11px] text-texto-secundario">{factor !== null ? `×${factor}` : ""}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="text-center text-[12px] text-texto-secundario">{t("leyenda")}</p>
    </MarcoVisual>
  );
}
