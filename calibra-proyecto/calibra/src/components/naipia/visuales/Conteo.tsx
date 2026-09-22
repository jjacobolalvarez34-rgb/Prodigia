"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { acumulados, esSistemaConteo, parsearCartas, valoresDe } from "@/lib/naipia/visualesDatos";
import type { VisualNaipiaConteo } from "@/lib/naipia/visuales";
import CartaSVG from "../CartaSVG";
import { COLOR_NAIPIA, ChipValor, Marcador, MarcoVisual, estiloValor, signo, useNumero } from "./comun";

interface Props {
  visual: VisualNaipiaConteo;
}

const VELOCIDAD_POR_DEFECTO_MS = 1300;
const ANCHO_CARTA = 34;
const ALTO_CARTA = Math.round((ANCHO_CARTA * 84) / 60);

// Conteo corriente animado: las cartas salen una a una del mazo (o de a
// bloque), debajo de cada una aparece su valor y el marcador del conteo
// sube o baja. Todo el conteo se CALCULA con TABLA_SISTEMAS.
export default function Conteo({ visual }: Props) {
  const t = useTranslations("Naipia.visuales");
  const tc = useTranslations("Naipia.cartas");
  const tm = useTranslations("Naipia.modos");
  const numero = useNumero();
  const sistemaOk = esSistemaConteo(visual.sistema);
  const cartas = sistemaOk ? parsearCartas(visual.cartas) : null;
  const tamBloque = Number.isInteger(visual.bloque) && (visual.bloque as number) >= 2 ? Math.min(6, visual.bloque as number) : 1;
  const bloques: number[][] = [];
  if (cartas) {
    for (let i = 0; i < cartas.length; i += tamBloque) {
      bloques.push(cartas.slice(i, i + tamBloque).map((_, k) => i + k));
    }
  }
  const ms =
    typeof visual.velocidad === "number" && visual.velocidad >= 300 && visual.velocidad <= 10000
      ? visual.velocidad
      : VELOCIDAD_POR_DEFECTO_MS;
  const r = useReproductor({ total: bloques.length, ms, estatico: visual.estatico });
  if (!sistemaOk || !cartas) return null;

  const valores = valoresDe(visual.sistema, cartas);
  const acum = acumulados(valores);
  const cartasMostradas = bloques.slice(0, r.paso).flat().length;
  const conteoActual = cartasMostradas > 0 ? acum[cartasMostradas - 1] : 0;
  const total = acum[acum.length - 1];
  const nombre = tm(visual.sistema);
  const etiquetaCarta = (i: number) =>
    tc("etiqueta", { valor: tc(`valores.${cartas[i].valor}`), palo: tc(`palos.${cartas[i].palo}`) });

  const alternativa = (
    <>
      <p>{t("conteoEtiqueta", { sistema: nombre, n: cartas.length })}</p>
      <ol>
        {cartas.map((_, i) => (
          <li key={i}>
            {t("conteoCartaAlt", { carta: etiquetaCarta(i), valor: signo(valores[i]), conteo: signo(acum[i]) })}
          </li>
        ))}
      </ol>
      <p>{t("conteoFinal", { n: signo(total) })}</p>
    </>
  );

  const segundos = numero(ms / 1000);

  return (
    <MarcoVisual
      refCont={r.alVer}
      etiqueta={t("conteoEtiqueta", { sistema: nombre, n: cartas.length })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_NAIPIA} />}
    >
      <Marcador etiqueta={t("conteoCorriente")} valor={conteoActual} />
      <div className="flex w-full flex-wrap justify-center gap-x-2 gap-y-3">
        {bloques.map((idxs, bi) => {
          const visibleBloque = bi < r.paso;
          const sumaBloque = idxs.reduce((a, i) => a + valores[i], 0);
          return (
            <div
              key={bi}
              className={`flex flex-col items-center gap-1.5 ${tamBloque > 1 ? "rounded-xl border border-dashed border-border px-1.5 py-2" : ""}`}
            >
              <div className="flex gap-1">
                {idxs.map((i, k) => (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ width: ANCHO_CARTA }}>
                    <div
                      className="rounded-md border border-dashed border-border"
                      style={{ width: ANCHO_CARTA, height: ALTO_CARTA }}
                    >
                      <motion.div
                        initial={r.reducir ? false : { opacity: 0, x: 60, y: -70, rotate: 16, scale: 0.55 }}
                        animate={
                          visibleBloque
                            ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
                            : { opacity: 0, x: 60, y: -70, rotate: 16, scale: 0.55 }
                        }
                        transition={{ type: "spring", stiffness: 240, damping: 20, mass: 0.8, delay: visibleBloque && !r.reducir ? k * 0.12 : 0 }}
                      >
                        <CartaSVG carta={cartas[i]} ancho={ANCHO_CARTA} />
                      </motion.div>
                    </div>
                    <motion.div
                      animate={{ opacity: visibleBloque ? 1 : 0, y: visibleBloque ? 0 : -6 }}
                      transition={{ duration: 0.3, delay: visibleBloque && !r.reducir ? 0.35 + k * 0.12 : 0 }}
                    >
                      <ChipValor valor={valores[i]} />
                    </motion.div>
                    {tamBloque === 1 && (
                      <motion.span
                        animate={{ opacity: visibleBloque ? 1 : 0 }}
                        transition={{ duration: 0.3, delay: visibleBloque && !r.reducir ? 0.6 : 0 }}
                        className="font-mono text-[11px] tabular-nums text-texto-secundario"
                      >
                        {"→ "}
                        {signo(acum[i])}
                      </motion.span>
                    )}
                  </div>
                ))}
              </div>
              {tamBloque > 1 && (
                <motion.span
                  animate={{ opacity: visibleBloque ? 1 : 0, scale: visibleBloque ? 1 : 0.7 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: visibleBloque && !r.reducir ? 0.5 : 0 }}
                  className="rounded-md border px-2 py-0.5 font-mono text-xs font-bold tabular-nums"
                  style={estiloValor(sumaBloque)}
                >
                  {t("bloqueEtiqueta", { n: bi + 1, valor: signo(sumaBloque) })}
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-texto-secundario">
        {tamBloque > 1 ? t("ritmoBloque", { n: tamBloque, s: segundos }) : t("ritmo", { s: segundos })}
      </p>
    </MarcoVisual>
  );
}
