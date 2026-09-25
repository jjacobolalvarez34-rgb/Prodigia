"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import BloqueCodigo from "@/components/codia/BloqueCodigo";
import { datosComparar } from "@/lib/codia/visualesDatos";
import { NOMBRE_LENGUAJE } from "@/lib/codia/tipos";
import type { VisualCodiaComparar } from "@/lib/codia/visuales";
import { COLOR_CODIA, MarcoVisual, useTextoError } from "./comun";

interface Props {
  visual: VisualCodiaComparar;
}

// El MISMO programa (IR de la práctica) renderizado y ejecutado en los 4
// lenguajes (datosComparar -> render.ts + interprete.ts): lado a lado se ve
// la sintaxis real de cada uno y su salida real (o su error real, con la
// semántica propia de cada lenguaje).
export default function Comparar({ visual }: Props) {
  const t = useTranslations("Codia.visuales.comparar");
  const textoError = useTextoError();
  const datos = useMemo(() => {
    try {
      return datosComparar(visual.programa);
    } catch {
      return null;
    }
  }, [visual.programa]);
  const total = datos?.resultados.length ?? 0;
  const { alVer, ...r } = useReproductor({ total, ms: 1400, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || total === 0) return null;

  const alternativa = (
    <ul>
      {datos.resultados.map((res) => (
        <li key={res.lenguaje}>
          {NOMBRE_LENGUAJE[res.lenguaje]}: {res.codigo}
          {" — "}
          {res.fallo ? textoError(res.fallo, res.nombreError) : t("salidaAlt", { salida: res.salida || t("sinSalida") })}
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
        {datos.resultados.slice(0, r.paso).map((res) => (
          <motion.div
            key={res.lenguaje}
            initial={r.reducir ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-w-0 flex-col gap-1.5"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-texto-secundario">{NOMBRE_LENGUAJE[res.lenguaje]}</p>
            <BloqueCodigo codigo={res.codigo} lenguaje={res.lenguaje} numeros={false} />
            <div className="rounded-lg border border-dashed border-border bg-background px-2.5 py-1.5 font-mono text-[12px] text-foreground">
              <span className="mr-1.5 select-none text-texto-secundario">&gt;</span>
              {res.fallo ? (
                <span className="font-semibold text-error">{textoError(res.fallo, res.nombreError)}</span>
              ) : (
                <span className="whitespace-pre-wrap break-words">{res.salida || t("sinSalida")}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </MarcoVisual>
  );
}
