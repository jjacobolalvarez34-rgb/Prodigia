"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { esListaNumeros, ordenarYCuartiles, ordenarYMediana } from "@/lib/estadistica/visualesDatos";
import type { VisualEstadisticaOrdenar } from "@/lib/estadistica/visuales";
import { COLOR_ESTADISTICA, MarcoVisual, estiloFicha, useNumero } from "./comun";

interface Props {
  visual: VisualEstadisticaOrdenar;
}

const CLASE_FICHA = "flex min-w-9 items-center justify-center rounded-lg border-2 px-2 py-1.5 font-mono text-sm font-bold tabular-nums";

function posicionValida(v: VisualEstadisticaOrdenar): boolean {
  return typeof v.posicion === "number" && Number.isInteger(v.posicion) && v.posicion >= 1 && v.posicion <= v.datos.length;
}

// Un conjunto de datos que se ordena de a un valor por vez y resalta la
// mediana, los cuartiles (método de las mitades, el de la práctica) o una
// posición concreta (percentiles). Los datos y el cálculo salen SIEMPRE de
// src/lib/estadistica/visualesDatos.ts, nunca de un número suelto en el jsonb.
export default function Ordenar({ visual }: Props) {
  const t = useTranslations("Estadistica.visuales");
  const num = useNumero();
  const ok =
    esListaNumeros(visual.datos) &&
    (visual.resaltar === "mediana" || visual.resaltar === "cuartiles" || (visual.resaltar === "posicion" && posicionValida(visual)));
  const datos = ok ? visual.datos : [0, 0];
  const r = useReproductor({ total: datos.length, ms: 500, estatico: visual.estatico });
  if (!ok) return null;

  const ordenM = ordenarYMediana(datos);
  const ordenQ = visual.resaltar === "cuartiles" ? ordenarYCuartiles(datos) : null;
  const ordenados = ordenM.ordenados;
  const n = ordenados.length;

  // índice (en `ordenados`) -> marca corta debajo de la ficha. Con n par la
  // mediana no es un dato: la marca "M" va en los dos centrales.
  const marcas = new Map<number, string>();
  if (visual.resaltar === "mediana") for (const i of ordenM.indicesMediana) marcas.set(i, "M");
  else if (visual.resaltar === "posicion") marcas.set(visual.posicion! - 1, "▲");
  else {
    for (const i of ordenQ!.indicesQ1) marcas.set(i, "Q1");
    for (const i of ordenQ!.indicesMedianaExcluida) marcas.set(i, "M");
    for (const i of ordenQ!.indicesQ3) marcas.set(i, "Q3");
  }

  const etiqueta =
    visual.resaltar === "mediana"
      ? t("ordenarMediana", { mediana: num(ordenM.mediana) })
      : visual.resaltar === "posicion"
        ? t("ordenarPosicion", {
            etiqueta: visual.etiquetaPosicion ?? t("ordenarPosicionGenerica"),
            posicion: visual.posicion!,
            valor: num(ordenados[visual.posicion! - 1]),
          })
        : t("ordenarCuartiles", { q1: num(ordenQ!.q1), mediana: num(ordenQ!.mediana), q3: num(ordenQ!.q3), iqr: num(ordenQ!.iqr) });

  const unidad = visual.etiquetaUnidad ? ` ${visual.etiquetaUnidad}` : "";
  const alternativa = (
    <>
      <p>{t("ordenarOriginales", { datos: datos.map(num).join(", ") + unidad })}</p>
      <p>{t("ordenarResultado", { datos: ordenados.map(num).join(", ") + unidad })}</p>
      <p>{etiqueta}</p>
    </>
  );

  return (
    <MarcoVisual refCont={r.alVer} etiqueta={etiqueta} titulo={visual.titulo} alternativa={alternativa} controles={<ControlesReproductor r={r} color={COLOR_ESTADISTICA} />}>
      <div className="flex w-full flex-col items-center gap-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-texto-secundario">{t("ordenarEtiquetaOriginales")}</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {datos.map((d, i) => (
            <span key={i} className={CLASE_FICHA} style={estiloFicha(false)}>
              {num(d)}
            </span>
          ))}
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-texto-secundario">{t("ordenarEtiquetaOrdenados")}</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {ordenados.map((d, i) => {
            const visible = i < r.paso;
            const marca = marcas.get(i);
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <motion.span
                  initial={r.reducir ? false : { opacity: 0, y: 10, scale: 0.7 }}
                  animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10, scale: visible ? (marca ? 1.12 : 1) : 0.7 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={CLASE_FICHA}
                  style={estiloFicha(!!marca && visible)}
                >
                  {num(d)}
                </motion.span>
                <span className="h-3.5 text-[10px] font-bold leading-none" style={{ color: COLOR_ESTADISTICA }}>
                  {visible && marca ? marca : ""}
                </span>
              </div>
            );
          })}
        </div>
        {r.paso >= n && (
          <motion.p initial={r.reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm font-semibold" style={{ color: COLOR_ESTADISTICA }}>
            {etiqueta}
          </motion.p>
        )}
      </div>
    </MarcoVisual>
  );
}
