"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { esSistemaConteo, filasMazo } from "@/lib/naipia/visualesDatos";
import { sumaMazoCompleto } from "@/lib/practica/naipia";
import type { VisualNaipiaMazo } from "@/lib/naipia/visuales";
import { COLOR_NAIPIA, ChipValor, Marcador, MarcoVisual, signo } from "./comun";

interface Props {
  visual: VisualNaipiaMazo;
}

const MS_POR_FILA = 1500;

// Suma del mazo completo de 52 cartas (4 por rango): cada grupo aporta
// cartas x valor, y el total dice si el sistema es balanceado (0) o no
// (KO: +4). Las filas salen de gruposDeSistema/TABLA_SISTEMAS.
export default function MazoCompleto({ visual }: Props) {
  const t = useTranslations("Naipia.visuales");
  const tm = useTranslations("Naipia.modos");
  const sistemaOk = esSistemaConteo(visual.sistema);
  const { filas, total } = sistemaOk ? filasMazo(visual.sistema) : { filas: [], total: 0 };
  // Un paso por grupo y un último paso con el total.
  const r = useReproductor({ total: filas.length + 1, ms: MS_POR_FILA, estatico: visual.estatico });
  if (!sistemaOk || filas.length === 0) return null;

  const nombre = tm(visual.sistema);
  const mayor = Math.max(1, ...filas.map((f) => Math.abs(f.aporte)));
  const enTotal = r.paso >= filas.length + 1;
  const acumuladoVisible = filas.slice(0, Math.min(r.paso, filas.length)).reduce((a, f) => a + f.aporte, 0);
  // Coincide con la función de referencia de naipia.ts.
  const coincide = total === sumaMazoCompleto(visual.sistema);
  if (!coincide) return null;

  const alternativa = (
    <>
      <p>{t("mazoEtiqueta", { sistema: nombre })}</p>
      <ul>
        {filas.map((f) => (
          <li key={f.valor}>
            {t("mazoFilaAlt", { cartas: f.cartas, rangos: f.rangos.join(", "), valor: signo(f.valor), aporte: signo(f.aporte) })}
          </li>
        ))}
      </ul>
      <p>{total === 0 ? t("mazoBalanceado", { n: signo(total) }) : t("mazoNoBalanceado", { n: signo(total) })}</p>
    </>
  );

  return (
    <MarcoVisual
      refCont={r.alVer}
      etiqueta={t("mazoEtiqueta", { sistema: nombre })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_NAIPIA} />}
    >
      <div className="flex w-full flex-col gap-2">
        {filas.map((f, i) => {
          const visible = i < r.paso;
          const color = f.valor > 0 ? "var(--correcto)" : f.valor < 0 ? "var(--error)" : "var(--border)";
          return (
            <motion.div
              key={f.valor}
              initial={r.reducir ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -14 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-1 rounded-xl border border-border bg-background px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                <ChipValor valor={f.valor} />
                <span className="flex-1 font-mono text-xs text-foreground">{f.rangos.join(" ")}</span>
                <span className="text-xs text-texto-secundario">{t("mazoCartas", { n: f.cartas })}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={false}
                    animate={{ width: visible ? `${(Math.abs(f.aporte) / mayor) * 100}%` : "0%" }}
                    transition={r.reducir ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  />
                </div>
                <span className="w-24 text-right font-mono text-xs tabular-nums text-foreground">
                  {f.cartas} {"×"} {signo(f.valor)} = {signo(f.aporte)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <Marcador
        etiqueta={enTotal ? t("mazoTotal") : t("mazoSumaHastaAhora")}
        valor={enTotal ? total : acumuladoVisible}
      />
      <p className="min-h-5 text-center text-xs text-texto-secundario">
        {enTotal ? (total === 0 ? t("mazoBalanceado", { n: signo(total) }) : t("mazoNoBalanceado", { n: signo(total) })) : ""}
      </p>
    </MarcoVisual>
  );
}
