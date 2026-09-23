"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import type { VisualEnigmiaLoci } from "@/lib/enigmia/visuales";
import { asociarLoci } from "@/lib/enigmia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_ENIGMIA, motion } from "./comun";

interface Props {
  visual: VisualEnigmiaLoci;
}

function listaValida(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const limpios = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return limpios.length >= 2 && limpios.length <= 8 ? limpios : [];
}

// Técnica "Método de loci" (Memoria): asocia cada elemento a memorizar con
// un lugar de un recorrido conocido — se revela un par lugar→elemento a la
// vez, como si se caminara por el recorrido. Los datos salen de
// asociarLoci() (zip de las dos listas), nunca hardcodeados acá.
export default function Loci({ visual }: Props) {
  const t = useTranslations("Enigmia.visuales.loci");
  const lugares = listaValida(visual.lugares);
  const items = listaValida(visual.items);
  const datos = lugares.length > 0 && items.length > 0 && lugares.length === items.length ? asociarLoci(lugares, items) : null;

  const { alVer, ...r } = useReproductor({ total: datos?.pares.length ?? 0, ms: 1000, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;

  const alternativa = (
    <ol>
      {datos.pares.map((p, i) => (
        <li key={i}>{t("resultado", { lugar: p.lugar, item: p.item })}</li>
      ))}
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <ol className="flex w-full flex-col items-stretch gap-2">
        {datos.pares.slice(0, Math.max(1, r.paso)).map((p, i) => {
          const actual = i === Math.max(0, r.paso - 1);
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl border px-3 py-2 text-sm"
              style={
                actual
                  ? { borderColor: COLOR_ENIGMIA, background: `color-mix(in oklab, ${COLOR_ENIGMIA} 10%, var(--surface))` }
                  : { borderColor: "var(--border)", background: "var(--surface)" }
              }
            >
              <span className="font-semibold" style={{ color: COLOR_ENIGMIA }}>
                <MathText texto={p.lugar} />
              </span>
              <span aria-hidden="true">→</span>
              <span className="text-foreground">
                <MathText texto={p.item} />
              </span>
            </motion.li>
          );
        })}
      </ol>
    </MarcoVisual>
  );
}
