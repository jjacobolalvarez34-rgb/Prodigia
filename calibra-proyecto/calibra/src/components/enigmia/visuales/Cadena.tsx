"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import type { VisualEnigmiaCadena } from "@/lib/enigmia/visuales";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_ENIGMIA, motion } from "./comun";

interface Props {
  visual: VisualEnigmiaCadena;
}

function nodosValidos(nodos: unknown): string[] {
  if (!Array.isArray(nodos)) return [];
  const limpios = nodos.filter((n): n is string => typeof n === "string" && n.trim().length > 0);
  return limpios.length >= 2 && limpios.length <= 4 ? limpios : [];
}

// Cadena lógica tipo flowchart (A → B → C): silogismos simples ("si A→B y
// B→C, entonces A→C") y el par condición/contrapositiva de "si...
// entonces" (Deducción). Se revela un nodo a la vez, con la flecha entre
// medio; con `concluir`, el último nodo queda resaltado como conclusión.
export default function Cadena({ visual }: Props) {
  const t = useTranslations("Enigmia.visuales.cadena");
  const nodos = nodosValidos(visual.nodos);
  const { alVer, ...r } = useReproductor({ total: nodos.length, ms: 900, estatico: visual.estatico, inicio: 1 });
  if (nodos.length === 0) return null;

  const alternativa = <p>{nodos.join(" → ")}</p>;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        {nodos.map((nodo, i) => {
          const revelado = i < r.paso;
          const esUltimo = i === nodos.length - 1;
          const esConclusion = !!visual.concluir && esUltimo && r.paso >= nodos.length;
          return (
            <div key={i} className="flex flex-col items-center gap-2 sm:flex-row">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: revelado ? 1 : 0.15, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`flex min-h-11 max-w-[220px] items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-sm font-medium ${
                  esConclusion ? "border-2" : ""
                }`}
                style={
                  esConclusion
                    ? { borderColor: COLOR_ENIGMIA, background: `color-mix(in oklab, ${COLOR_ENIGMIA} 18%, var(--surface))`, color: "var(--foreground)" }
                    : { borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }
                }
              >
                <MathText texto={nodo} />
              </motion.div>
              {!esUltimo && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i + 1 < r.paso ? 1 : 0.15 }}
                  className="rotate-90 text-lg font-bold sm:rotate-0"
                  style={{ color: COLOR_ENIGMIA }}
                  aria-hidden="true"
                >
                  →
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
      {visual.concluir && r.paso >= nodos.length && (
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLOR_ENIGMIA }}>
          {t("conclusion")}
        </p>
      )}
    </MarcoVisual>
  );
}
