"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { gruposDeSistema } from "@/lib/practica/naipia";
import { esSistemaConteo, ordenarRangos } from "@/lib/naipia/visualesDatos";
import type { VisualNaipiaValores } from "@/lib/naipia/visuales";
import CartaSVG from "../CartaSVG";
import { COLOR_NAIPIA, ChipValor, MarcoVisual, cartaDeRango, estiloValor, signo } from "./comun";

interface Props {
  visual: VisualNaipiaValores;
}

const MS_POR_GRUPO = 1500;

// Tabla de valores animada: los grupos de cartas aparecen de a uno (cada
// grupo con su color: verde sube, gris no cuenta, rojo baja) con su valor
// debajo. Los valores salen de TABLA_SISTEMAS (gruposDeSistema), nunca de
// los datos de la lección.
export default function Valores({ visual }: Props) {
  const t = useTranslations("Naipia.visuales");
  const tc = useTranslations("Naipia.cartas");
  const tm = useTranslations("Naipia.modos");
  const sistemaOk = esSistemaConteo(visual.sistema);
  const grupos = sistemaOk ? gruposDeSistema(visual.sistema).map((g) => ({ ...g, rangos: ordenarRangos(g.rangos) })) : [];
  const r = useReproductor({ total: grupos.length, ms: MS_POR_GRUPO, estatico: visual.estatico });
  if (!sistemaOk || grupos.length === 0) return null;

  const nombre = tm(visual.sistema);
  const nombreRango = (v: string) => tc(`valores.${v}`);
  const anchoCarta = 30;
  const alternativa = (
    <>
      <p>{t("valoresEtiqueta", { sistema: nombre })}</p>
      <ul>
        {grupos.map((g) => (
          <li key={g.valor}>
            {t("valoresGrupo", { rangos: g.rangos.map(nombreRango).join(", "), valor: signo(g.valor) })}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <MarcoVisual
      refCont={r.alVer}
      etiqueta={t("valoresEtiqueta", { sistema: nombre })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_NAIPIA} />}
    >
      <div className="flex w-full flex-col gap-2.5">
        {grupos.map((g, gi) => {
          const visible = gi < r.paso;
          const atenuado = visual.enfatizar !== undefined && visual.enfatizar !== g.valor;
          return (
            <motion.div
              key={g.valor}
              initial={r.reducir ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: visible ? (atenuado ? 0.35 : 1) : 0, y: visible ? 0 : 12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5"
              style={{ ...estiloValor(g.valor), background: "var(--background)", borderWidth: 2 }}
            >
              <div className="flex flex-wrap justify-center gap-1">
                {g.rangos.map((rango, ri) => (
                  <motion.div
                    key={rango}
                    initial={r.reducir ? false : { opacity: 0, x: 24, rotate: 10, scale: 0.7 }}
                    animate={visible ? { opacity: 1, x: 0, rotate: 0, scale: 1 } : { opacity: 0, x: 24, rotate: 10, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: visible && !r.reducir ? ri * 0.07 : 0 }}
                  >
                    <CartaSVG carta={cartaDeRango(rango, ri)} ancho={anchoCarta} />
                  </motion.div>
                ))}
              </div>
              <motion.div
                animate={{ scale: visible ? 1 : 0.6, opacity: visible ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 18, delay: visible && !r.reducir ? 0.3 : 0 }}
              >
                <ChipValor valor={g.valor} grande />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </MarcoVisual>
  );
}
