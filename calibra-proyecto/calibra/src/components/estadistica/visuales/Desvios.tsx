"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { calcularDesvios, esListaNumeros, esNumeroFinito, zScore } from "@/lib/estadistica/visualesDatos";
import type { VisualEstadisticaDesvios } from "@/lib/estadistica/visuales";
import { COLOR_ESTADISTICA, MarcoVisual, estiloDesvio, useNumero } from "./comun";

interface Props {
  visual: VisualEstadisticaDesvios;
}

function conSigno(n: number, num: (n: number) => string): string {
  if (n > 0) return `+${num(n)}`;
  return num(n);
}

// Puntos que se alejan de un centro (la media, o una media provisoria) con
// su desviación coloreada (verde por encima, rojo por debajo; el signo
// siempre está escrito). Con `mostrarCuadrados` agrega el cuadrado de cada
// desviación (varianza); con `sigma`, el puntaje z. Todo sale de
// calcularDesvios() y zScore() (visualesDatos.ts), nunca de un número
// suelto en el jsonb.
export default function Desvios({ visual }: Props) {
  const t = useTranslations("Estadistica.visuales");
  const num = useNumero();
  const ok =
    esListaNumeros(visual.datos, 1) &&
    esNumeroFinito(visual.centro) &&
    typeof visual.etiquetaCentro === "string" &&
    visual.etiquetaCentro.length > 0 &&
    (visual.sigma === undefined || (esNumeroFinito(visual.sigma) && visual.sigma > 0));
  const d = calcularDesvios(ok ? visual.datos : [0], ok ? visual.centro : 0);
  const r = useReproductor({ total: d.datos.length, ms: 700, estatico: visual.estatico });
  if (!ok) return null;

  const sigma = visual.sigma;
  const centro = t("desviosCentro", { etiqueta: visual.etiquetaCentro, centro: num(visual.centro) });
  const etiqueta = visual.mostrarCuadrados
    ? t("desviosEtiquetaCuadrados", { suma: num(d.sumaCuadrados) })
    : sigma !== undefined
      ? t("desviosEtiquetaZ", { sigma: num(sigma) })
      : t("desviosEtiquetaSuma", { suma: conSigno(d.sumaDesviaciones, num) });

  const alternativa = (
    <>
      <p>{centro}</p>
      <ul>
        {d.datos.map((v, i) => (
          <li key={i}>
            {t("desviosFila", { valor: num(v), desvio: conSigno(d.desviaciones[i], num) })}
            {visual.mostrarCuadrados ? ` ${t("desviosCuadradoInline", { cuadrado: num(d.cuadrados[i]) })}` : ""}
            {sigma !== undefined ? ` ${t("desviosZInline", { z: conSigno(zScore(v, visual.centro, sigma), num) })}` : ""}
          </li>
        ))}
      </ul>
      <p>{etiqueta}</p>
    </>
  );

  return (
    <MarcoVisual refCont={r.alVer} etiqueta={etiqueta} titulo={visual.titulo} alternativa={alternativa} controles={<ControlesReproductor r={r} color={COLOR_ESTADISTICA} />}>
      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-center text-xs font-medium text-texto-secundario">{centro}</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {d.datos.map((v, i) => {
            const visible = i < r.paso;
            return (
              <motion.div
                key={i}
                initial={r.reducir ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
                transition={{ duration: 0.35 }}
                className="flex min-w-12 flex-col items-center gap-1 rounded-xl border-2 px-2 py-1.5"
                style={estiloDesvio(visible ? d.desviaciones[i] : 0)}
              >
                <span className="font-mono text-sm font-bold tabular-nums">{num(v)}</span>
                <span className="font-mono text-xs font-semibold tabular-nums">{visible ? conSigno(d.desviaciones[i], num) : "…"}</span>
                {visual.mostrarCuadrados && <span className="text-[10px] tabular-nums text-texto-secundario">{visible ? `² = ${num(d.cuadrados[i])}` : " "}</span>}
                {sigma !== undefined && (
                  <span className="text-[10px] tabular-nums text-texto-secundario">{visible ? `z = ${conSigno(zScore(v, visual.centro, sigma), num)}` : " "}</span>
                )}
              </motion.div>
            );
          })}
        </div>
        {r.paso >= d.datos.length && (
          <motion.p initial={r.reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm font-semibold" style={{ color: COLOR_ESTADISTICA }}>
            {etiqueta}
          </motion.p>
        )}
      </div>
    </MarcoVisual>
  );
}
