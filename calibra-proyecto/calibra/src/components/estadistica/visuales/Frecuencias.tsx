"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { esListaNumeros, media, tablaFrecuencias } from "@/lib/estadistica/visualesDatos";
import type { VisualEstadisticaFrecuencias } from "@/lib/estadistica/visuales";
import { COLOR_ESTADISTICA, MarcoVisual, useNumero } from "./comun";

interface Props {
  visual: VisualEstadisticaFrecuencias;
}

const ALTO_MAX = 96;

// Barras que crecen (una por valor distinto) mostrando su frecuencia y
// resaltan la moda (el valor más repetido; solo cuenta si se repite). El
// conteo sale de tablaFrecuencias() y la media de media() (visualesDatos.ts),
// no de números sueltos en el jsonb.
export default function Frecuencias({ visual }: Props) {
  const t = useTranslations("Estadistica.visuales");
  const num = useNumero();
  const ok = esListaNumeros(visual.datos);
  const datos = ok ? visual.datos : [0, 0];
  const tabla = tablaFrecuencias(datos);
  const r = useReproductor({ total: tabla.valores.length, ms: 700, estatico: visual.estatico });
  if (!ok) return null;

  const maxFrec = tabla.maxFrecuencia;
  const unidad = visual.etiquetaUnidad ? ` ${visual.etiquetaUnidad}` : "";
  const mediaTexto = visual.mostrarMedia ? t("frecuenciasMedia", { media: num(media(datos)) }) : null;

  const etiquetaModa =
    tabla.indicesModa.length === 0
      ? t("frecuenciasSinModa")
      : tabla.indicesModa.length === 1
        ? t("frecuenciasModa", { moda: num(tabla.valores[tabla.indicesModa[0]]) })
        : t("frecuenciasModaVarias", { modas: tabla.indicesModa.map((i) => num(tabla.valores[i])).join(", ") });
  const etiqueta = mediaTexto ? `${etiquetaModa}. ${mediaTexto}` : etiquetaModa;

  const alternativa = (
    <>
      <p>{t("frecuenciasOriginales", { datos: datos.map(num).join(", ") + unidad })}</p>
      <ul>
        {tabla.valores.map((v, i) => (
          <li key={v}>{t("frecuenciasFila", { valor: num(v), frecuencia: tabla.frecuencias[i] })}</li>
        ))}
      </ul>
      <p>{etiqueta}</p>
    </>
  );

  return (
    <MarcoVisual refCont={r.alVer} etiqueta={etiqueta} titulo={visual.titulo} alternativa={alternativa} controles={<ControlesReproductor r={r} color={COLOR_ESTADISTICA} />}>
      <div className="flex w-full flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-3" style={{ minHeight: ALTO_MAX + 28 }}>
          {tabla.valores.map((v, i) => {
            const visible = i < r.paso;
            const esModa = tabla.indicesModa.includes(i);
            const alto = visible ? Math.max(6, (tabla.frecuencias[i] / maxFrec) * ALTO_MAX) : 0;
            return (
              <div key={v} className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold tabular-nums" style={{ color: esModa && visible ? COLOR_ESTADISTICA : "var(--texto-secundario)" }}>
                  {visible ? tabla.frecuencias[i] : ""}
                </span>
                <motion.div
                  initial={r.reducir ? false : { height: 0 }}
                  animate={{ height: alto }}
                  transition={{ type: "spring", stiffness: 210, damping: 24 }}
                  className="w-8 rounded-t-md"
                  style={{ background: esModa && visible ? COLOR_ESTADISTICA : "var(--surface-2)", border: `2px solid ${esModa && visible ? COLOR_ESTADISTICA : "var(--border)"}` }}
                />
                <span className="font-mono text-xs font-semibold tabular-nums text-foreground">{num(v)}</span>
              </div>
            );
          })}
        </div>
        {r.paso >= tabla.valores.length && (
          <motion.div initial={r.reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-0.5 text-center text-sm font-semibold" style={{ color: COLOR_ESTADISTICA }}>
            <p>{etiquetaModa}</p>
            {mediaTexto && <p>{mediaTexto}</p>}
          </motion.div>
        )}
      </div>
    </MarcoVisual>
  );
}
