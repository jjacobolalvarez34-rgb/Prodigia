"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { VisualAnatomiaFlujo } from "@/lib/anatomia/visuales";
import { resolverEtapas, textoDeVisual } from "@/lib/anatomia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_ANATOMIA, fondoAcento } from "./comun";

interface Props {
  visual: VisualAnatomiaFlujo;
}

function Flecha({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mx-auto h-4 w-4 shrink-0 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0.2, color: COLOR_ANATOMIA }}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 2v11M3.5 9 8 13.5 12.5 9" />
    </svg>
  );
}

// Cadena de etapas con flechas, en vertical (cabe en un celular): una etapa
// por paso; las que faltan quedan atenuadas para que el diseño no salte.
export default function Flujo({ visual }: Props) {
  const t = useTranslations("Anatomia.visuales.flujo");
  const etapas = resolverEtapas(visual.etapas);
  const { alVer, ...r } = useReproductor({ total: etapas.length, ms: 1300, estatico: visual.estatico, inicio: etapas.length > 0 ? 1 : 0 });
  if (etapas.length === 0) return null;

  const alternativa = <p>{textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>)}</p>;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_ANATOMIA} />}
    >
      <ol className="mx-auto flex w-full max-w-sm flex-col gap-1">
        {etapas.map((e, i) => {
          const visible = i < r.paso;
          const actual = i === r.paso - 1;
          return (
            <Fragment key={i}>
              <motion.li
                initial={false}
                animate={{ opacity: visible ? 1 : 0.28 }}
                transition={{ duration: 0.35 }}
                className="flex items-start gap-2.5 rounded-xl border-2 px-2.5 py-2"
                style={{ borderColor: visible ? COLOR_ANATOMIA : "var(--border)", background: actual ? fondoAcento(14) : "var(--surface)" }}
              >
                <span
                  className="mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: visible ? COLOR_ANATOMIA : "var(--border)" }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="font-bold text-foreground">{e.titulo}</span>
                  {e.detalle && <span className="block text-[13px] text-texto-secundario">{e.detalle}</span>}
                </span>
              </motion.li>
              {i < etapas.length - 1 && <Flecha visible={i + 1 < r.paso} />}
            </Fragment>
          );
        })}
      </ol>
      {visual.ciclo && (
        <p className="text-center text-xs font-semibold" style={{ color: COLOR_ANATOMIA, opacity: r.alFinal ? 1 : 0.3 }}>
          {t("ciclo")}
        </p>
      )}
    </MarcoVisual>
  );
}
