"use client";

import { motion } from "framer-motion";
import { Fragment } from "react";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { acumulados, esSistemaConteo, parsearCartas, valoresDe } from "@/lib/naipia/visualesDatos";
import type { VisualNaipiaComparar } from "@/lib/naipia/visuales";
import type { SistemaConteo } from "@/lib/practica/naipia";
import CartaSVG from "../CartaSVG";
import { COLOR_NAIPIA, ChipValor, MarcoVisual, estiloValor, signo } from "./comun";

interface Props {
  visual: VisualNaipiaComparar;
}

const MS_POR_CARTA = 1300;
const ANCHO_CARTA = 26;

// Los mismos naipes valorados por varios sistemas, lado a lado: cada fila
// que aparece es una carta con su valor en cada sistema, y la fila de
// abajo lleva el conteo de cada uno hasta ese momento. Todo sale de
// TABLA_SISTEMAS.
export default function Comparar({ visual }: Props) {
  const t = useTranslations("Naipia.visuales");
  const tc = useTranslations("Naipia.cartas");
  const tm = useTranslations("Naipia.modos");
  const sistemas: SistemaConteo[] = Array.isArray(visual.sistemas) ? visual.sistemas.filter(esSistemaConteo) : [];
  const sistemasOk = sistemas.length >= 2 && sistemas.length === visual.sistemas.length && new Set(sistemas).size === sistemas.length;
  const cartas = sistemasOk ? parsearCartas(visual.cartas) : null;
  const r = useReproductor({ total: cartas?.length ?? 0, ms: MS_POR_CARTA, estatico: visual.estatico });
  if (!sistemasOk || !cartas) return null;

  const valores = sistemas.map((s) => valoresDe(s, cartas));
  const acum = valores.map((v) => acumulados(v));
  const totales = acum.map((a) => a[a.length - 1]);
  const hasta = r.paso; // cartas mostradas
  const columnas = `${ANCHO_CARTA + 12}px repeat(${sistemas.length}, minmax(0, 1fr))`;
  const textoCarta = (i: number) =>
    tc("etiqueta", { valor: tc(`valores.${cartas[i].valor}`), palo: tc(`palos.${cartas[i].palo}`) });

  const alternativa = (
    <>
      <p>{t("compararEtiqueta", { n: cartas.length })}</p>
      <ul>
        {cartas.map((_, i) => (
          <li key={i}>
            {textoCarta(i)}: {sistemas.map((s, si) => `${tm(s)} ${signo(valores[si][i])}`).join(", ")}
          </li>
        ))}
      </ul>
      <p>
        {t("compararTotalesAlt", {
          totales: sistemas.map((s, si) => `${tm(s)} ${signo(totales[si])}`).join(", "),
        })}
      </p>
    </>
  );

  return (
    <MarcoVisual
      refCont={r.alVer}
      etiqueta={t("compararEtiqueta", { n: cartas.length })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_NAIPIA} />}
    >
      <div className="grid w-full items-center gap-x-1.5 gap-y-1.5" style={{ gridTemplateColumns: columnas }}>
        <span />
        {sistemas.map((s) => (
          <span key={s} className="text-center text-[11px] font-bold leading-tight text-foreground">
            {tm(s)}
          </span>
        ))}
        {cartas.map((c, i) => {
          const visible = i < hasta;
          return (
            <Fragment key={i}>
              <motion.div
                className="flex justify-center"
                initial={r.reducir ? false : { x: 30, opacity: 0 }}
                animate={visible ? { x: 0, opacity: 1 } : { x: 30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <CartaSVG carta={c} ancho={ANCHO_CARTA} />
              </motion.div>
              {sistemas.map((s, si) => (
                <motion.div
                  key={s}
                  className="flex justify-center"
                  initial={false}
                  animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18, delay: visible && !r.reducir ? 0.2 + si * 0.08 : 0 }}
                >
                  <ChipValor valor={valores[si][i]} />
                </motion.div>
              ))}
            </Fragment>
          );
        })}
        <span className="col-span-full my-0.5 h-px bg-border" />
        <span className="text-center text-[11px] font-semibold leading-tight text-texto-secundario">{t("compararConteo")}</span>
        {sistemas.map((s, si) => {
          const valor = hasta > 0 ? acum[si][hasta - 1] : 0;
          return (
            <motion.span
              key={`${s}-${valor}`}
              initial={r.reducir ? false : { scale: 1.3, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="mx-auto inline-flex min-w-10 items-center justify-center rounded-lg border-2 px-2 py-1 font-mono text-lg font-black tabular-nums"
              style={estiloValor(valor)}
            >
              {signo(valor)}
            </motion.span>
          );
        })}
      </div>
    </MarcoVisual>
  );
}
