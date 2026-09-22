"use client";

import { useTranslations } from "next-intl";
import type { VisualNumeriaMcm } from "@/lib/numeria/visuales";
import { mcmPorListado } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, Resaltado, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaMcm;
}

function FilaMultiplos({ etiqueta, valores, hasta, comun }: { etiqueta: string; valores: number[]; hasta: number; comun: number | null }) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">{etiqueta}</span>
      <div className="flex flex-wrap gap-1.5">
        {valores.slice(0, hasta).map((v, i) => {
          const esComun = v === comun;
          return (
            <motion.span
              key={i}
              animate={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-1.5 font-mono text-sm font-bold tabular-nums ${
                esComun ? "border-2" : ""
              }`}
              style={
                esComun
                  ? { borderColor: COLOR_NUMERIA, background: `color-mix(in oklab, ${COLOR_NUMERIA} 20%, var(--surface))`, color: "var(--foreground)" }
                  : { borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }
              }
            >
              {v}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

// Clase 4 de Numeria: mínimo común múltiplo por listado de múltiplos de
// cada número, animado, resaltando el primero que aparece en las dos
// listas (base del denominador común de la Clase 5).
export default function Mcm({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.mcm");
  const a = Math.trunc(visual.a);
  const b = Math.trunc(visual.b);
  const valido = Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0;
  const datos = valido ? mcmPorListado(a, b) : null;
  const { alVer, ...r } = useReproductor({
    total: datos?.multiplosA.length ?? 0,
    ms: 700,
    estatico: visual.estatico,
  });
  if (!datos) return null;
  const { multiplosA, multiplosB, primerComun, mcm } = datos;

  const alternativa = (
    <>
      <p>
        {t("multiplosDe", { n: a })}: {multiplosA.join(", ")}
      </p>
      <p>
        {t("multiplosDe", { n: b })}: {multiplosB.join(", ")}
      </p>
      <p>{t("resultado", { n: primerComun ?? mcm })}</p>
    </>
  );

  const hasta = Math.max(1, r.paso);

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { a, b })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <FilaMultiplos etiqueta={t("multiplosDe", { n: a })} valores={multiplosA} hasta={hasta} comun={primerComun} />
      <FilaMultiplos etiqueta={t("multiplosDe", { n: b })} valores={multiplosB} hasta={hasta} comun={primerComun} />
      {primerComun !== null && multiplosA.slice(0, hasta).includes(primerComun) && multiplosB.slice(0, hasta).includes(primerComun) && (
        <Resaltado>{t("resultado", { n: primerComun })}</Resaltado>
      )}
    </MarcoVisual>
  );
}
