"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { esSistemaConteo, parsearCartas, planCancelacion, valoresDe } from "@/lib/naipia/visualesDatos";
import type { VisualNaipiaCancelacion } from "@/lib/naipia/visuales";
import CartaSVG from "../CartaSVG";
import { COLOR_NAIPIA, ChipValor, Marcador, MarcoVisual, signo } from "./comun";

interface Props {
  visual: VisualNaipiaCancelacion;
}

const VELOCIDAD_POR_DEFECTO_MS = 2200;
const ANCHO_FILA = 30;
const ANCHO_ESCENA = 46;

// Pares que se cancelan: una carta con su opuesta se tocan y desaparecen
// (suman 0), las neutras no cuentan, y lo que sobra es el conteo. Los
// pares salen de planCancelacion() sobre los valores de TABLA_SISTEMAS.
export default function Cancelacion({ visual }: Props) {
  const t = useTranslations("Naipia.visuales");
  const tc = useTranslations("Naipia.cartas");
  const tm = useTranslations("Naipia.modos");
  const sistemaOk = esSistemaConteo(visual.sistema);
  const cartas = sistemaOk ? parsearCartas(visual.cartas) : null;
  const valores = cartas && sistemaOk ? valoresDe(visual.sistema, cartas) : [];
  const plan = planCancelacion(valores);
  // Pasos: primero las neutras (si hay), luego un paso por par.
  const hayNeutras = plan.neutras.length > 0;
  const totalPasos = (hayNeutras ? 1 : 0) + plan.pares.length;
  const ms =
    typeof visual.velocidad === "number" && visual.velocidad >= 500 && visual.velocidad <= 10000
      ? visual.velocidad
      : VELOCIDAD_POR_DEFECTO_MS;
  const r = useReproductor({ total: totalPasos, ms, estatico: visual.estatico });
  if (!sistemaOk || !cartas) return null;

  const nombre = tm(visual.sistema);
  const total = valores.reduce((a, v) => a + v, 0);
  const textoCarta = (i: number) =>
    tc("etiqueta", { valor: tc(`valores.${cartas[i].valor}`), palo: tc(`palos.${cartas[i].palo}`) });

  // Índice del paso en curso (el último ya mostrado) y estado por carta.
  const pasoActual = r.paso - 1;
  const parDelPaso = (k: number): [number, number] | null => {
    const idx = hayNeutras ? k - 1 : k;
    return idx >= 0 ? (plan.pares[idx] ?? null) : null;
  };
  const resuelta = (i: number): boolean => {
    if (hayNeutras && plan.neutras.includes(i)) return r.paso >= 1;
    const p = plan.pares.findIndex((par) => par.includes(i));
    if (p < 0) return false;
    return r.paso >= p + 1 + (hayNeutras ? 1 : 0);
  };
  const parActual = pasoActual >= 0 ? parDelPaso(pasoActual) : null;
  const esPasoNeutras = hayNeutras && pasoActual === 0;
  const fin = r.paso >= totalPasos;
  const izquierda = -ANCHO_ESCENA / 2 - 2;
  const derecha = ANCHO_ESCENA / 2 + 2;

  const alternativa = (
    <>
      <p>{t("cancelacionEtiqueta", { sistema: nombre, n: cartas.length })}</p>
      <ul>
        {hayNeutras && <li>{t("cancelacionNeutrasAlt", { cartas: plan.neutras.map(textoCarta).join(", ") })}</li>}
        {plan.pares.map(([a, b]) => (
          <li key={`${a}-${b}`}>
            {t("cancelacionParAlt", { a: textoCarta(a), va: signo(valores[a]), b: textoCarta(b), vb: signo(valores[b]) })}
          </li>
        ))}
        <li>
          {plan.sobran.length > 0
            ? t("cancelacionSobranAlt", { cartas: plan.sobran.map(textoCarta).join(", "), n: signo(total) })
            : t("cancelacionNadaSobraAlt", { n: signo(total) })}
        </li>
      </ul>
      <p>{t("conteoFinal", { n: signo(total) })}</p>
    </>
  );

  return (
    <MarcoVisual
      refCont={r.alVer}
      etiqueta={t("cancelacionEtiqueta", { sistema: nombre, n: cartas.length })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_NAIPIA} />}
    >
      <Marcador etiqueta={t("cancelacionConteo")} valor={total} />

      {/* Escenario: el par del paso actual se acerca, se toca y suma 0. */}
      <div className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-border bg-background">
        {parActual ? (
          <div key={pasoActual} className="relative flex items-center justify-center" style={{ width: 220, height: 96 }}>
            {[parActual[0], parActual[1]].map((idx, lado) => (
              <motion.div
                key={idx}
                className="absolute"
                initial={r.reducir ? false : { x: lado === 0 ? -80 : 80, opacity: 1, scale: 1 }}
                animate={
                  r.reducir
                    ? { x: lado === 0 ? izquierda : derecha, opacity: 1, scale: 1 }
                    : {
                        x: [lado === 0 ? -80 : 80, lado === 0 ? izquierda + 6 : derecha - 6, lado === 0 ? izquierda : derecha],
                        opacity: [1, 1, 0.55],
                        scale: [1, 1, 0.9],
                      }
                }
                transition={{ duration: 1.1, times: [0, 0.55, 1], ease: "easeInOut" }}
              >
                <CartaSVG carta={cartas[idx]} ancho={ANCHO_ESCENA} />
              </motion.div>
            ))}
            <motion.div
              className="absolute -bottom-1 flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5"
              initial={r.reducir ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: r.reducir ? 0 : 1, type: "spring", stiffness: 320, damping: 16 }}
            >
              <ChipValor valor={valores[parActual[0]]} />
              <ChipValor valor={valores[parActual[1]]} />
              <span className="font-mono text-sm font-bold text-foreground">= 0</span>
            </motion.div>
          </div>
        ) : esPasoNeutras ? (
          <motion.p
            key="neutras"
            initial={r.reducir ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 text-center text-sm font-medium text-foreground"
          >
            {t("cancelacionNeutras")}
          </motion.p>
        ) : (
          <p className="px-3 text-center text-sm text-texto-secundario">
            {fin && totalPasos === 0 ? t("cancelacionNadaQueCancelar") : t("cancelacionBuscar")}
          </p>
        )}
      </div>

      {/* Fila de cartas: las ya resueltas se apagan; lo que queda es el conteo. */}
      <div className="flex w-full flex-wrap justify-center gap-x-1.5 gap-y-2">
        {cartas.map((c, i) => {
          const apagada = resuelta(i);
          const enParActual = parActual !== null && parActual.includes(i) && !fin;
          return (
            <div key={i} className="flex flex-col items-center gap-1" style={{ width: ANCHO_FILA }}>
              <motion.div
                animate={{ opacity: apagada ? 0.22 : 1, scale: enParActual ? 1.08 : 1, filter: apagada ? "grayscale(1)" : "grayscale(0)" }}
                transition={{ duration: 0.4, delay: apagada && !r.reducir ? 0.9 : 0 }}
                className="rounded-md"
                style={enParActual ? { outline: `2px solid ${COLOR_NAIPIA}`, outlineOffset: 2 } : undefined}
              >
                <CartaSVG carta={c} ancho={ANCHO_FILA} />
              </motion.div>
              <motion.div animate={{ opacity: apagada ? 0.3 : 1 }}>
                <ChipValor valor={valores[i]} />
              </motion.div>
            </div>
          );
        })}
      </div>

      <motion.p
        key={fin ? "fin" : "sigue"}
        initial={r.reducir ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-sm font-medium text-foreground"
      >
        {fin
          ? plan.sobran.length > 0
            ? t("cancelacionSobran", { n: signo(total) })
            : t("cancelacionNadaSobra", { n: signo(total) })
          : t("cancelacionSigueIgual")}
      </motion.p>
    </MarcoVisual>
  );
}
