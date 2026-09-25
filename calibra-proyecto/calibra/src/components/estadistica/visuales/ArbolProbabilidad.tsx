"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { caminosArbol, esRamas, type NodoArbol } from "@/lib/estadistica/visualesDatos";
import type { VisualEstadisticaArbol } from "@/lib/estadistica/visuales";
import { COLOR_ESTADISTICA, MarcoVisual, useNumero } from "./comun";

interface Props {
  visual: VisualEstadisticaArbol;
}

function Rama({ nodo, num, nivel }: { nodo: NodoArbol; num: (n: number) => string; nivel: number }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div
        className="flex items-center gap-2 rounded-lg border-2 px-2.5 py-1.5 text-xs font-medium"
        style={{ borderColor: COLOR_ESTADISTICA, background: `color-mix(in oklab, ${COLOR_ESTADISTICA} ${10 + nivel * 6}%, var(--surface))`, color: "var(--foreground)" }}
      >
        <span>{nodo.etiqueta}</span>
        <span className="font-mono font-bold tabular-nums" style={{ color: COLOR_ESTADISTICA }}>
          {num(nodo.probabilidad)}
        </span>
      </div>
      {nodo.hijos && (
        <div className="ml-3 flex flex-col gap-1.5 border-l-2 pl-2" style={{ borderColor: "var(--border)" }}>
          {nodo.hijos.map((h, i) => (
            <Rama key={i} nodo={h} num={num} nivel={nivel + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Árbol de probabilidad simple: cada rama muestra su probabilidad
// condicional al padre; el pie muestra cada camino raíz -> hoja con la
// multiplicación de sus ramas y su probabilidad conjunta, calculadas por
// caminosArbol() (visualesDatos.ts) — nunca escritas a mano aparte.
export default function ArbolProbabilidad({ visual }: Props) {
  const t = useTranslations("Estadistica.visuales");
  const num = useNumero();
  const ok = typeof visual.raiz === "string" && visual.raiz.length > 0 && esRamas(visual.ramas);
  const ramas = ok ? visual.ramas : [];
  const r = useReproductor({ total: ramas.length, ms: 900, estatico: visual.estatico });
  if (!ok) return null;

  const caminos = caminosArbol(ramas);
  const producto = (factores: number[]) => factores.map(num).join(" × ");
  const etiqueta = t("arbolEtiqueta", { raiz: visual.raiz });
  const alternativa = (
    <>
      <p>{visual.raiz}</p>
      <ul>
        {caminos.map((c, i) => (
          <li key={i}>{t("arbolCamino", { camino: c.etiquetas.join(" → "), producto: producto(c.factores), probabilidad: num(c.probabilidad) })}</li>
        ))}
      </ul>
    </>
  );

  return (
    <MarcoVisual refCont={r.alVer} etiqueta={etiqueta} titulo={visual.titulo} alternativa={alternativa} controles={<ControlesReproductor r={r} color={COLOR_ESTADISTICA} />}>
      <div className="flex w-full flex-col gap-3">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-texto-secundario">{visual.raiz}</p>
        <div className="flex flex-col gap-2">
          {ramas.map((nodo, i) => {
            const visible = i < r.paso;
            return (
              <motion.div
                key={i}
                initial={r.reducir ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -10 }}
                transition={{ duration: 0.3 }}
              >
                <Rama nodo={nodo} num={num} nivel={0} />
              </motion.div>
            );
          })}
        </div>
        {r.paso >= ramas.length && (
          <motion.div initial={r.reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2 px-3 py-2">
            {caminos.map((c, i) => (
              <p key={i} className="text-xs font-semibold text-foreground">
                {c.etiquetas.join(" → ")}: {producto(c.factores)} = <span style={{ color: COLOR_ESTADISTICA }}>{num(c.probabilidad)}</span>
              </p>
            ))}
          </motion.div>
        )}
      </div>
    </MarcoVisual>
  );
}
