"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CountUp from "@/components/CountUp";

// Podio del final de un duelo o de una serie (2026-11-02, igual que ResultadoVersus de
// la app): los dos en su pedestal (el que ganó más alto, con corona y el 1), el
// puntaje contando, por qué ganó quien ganó y la comparación fila por fila con lo
// mejor de cada fila resaltado. Entra en orden, de arriba abajo.

export interface FilaPodio {
  etiqueta: string;
  mio: string;
  suyo: string;
  mejor?: "mio" | "suyo" | null;
}

const ALTO = { gana: 118, pierde: 74, empate: 96 };
const SALIDA = [0.16, 1, 0.3, 1] as const;

function Corona({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden>
      <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />
    </svg>
  );
}

function Pedestal({ nombre, puntaje, alto, gana, propio, demora }: { nombre: string; puntaje: number | null; alto: number; gana: boolean; propio: boolean; demora: number }) {
  const tono = gana ? "var(--logro)" : propio ? "var(--primario)" : "var(--texto-secundario)";
  return (
    <div className="flex max-w-[9.5rem] flex-1 flex-col items-center gap-2">
      <motion.div className="flex flex-col items-center gap-1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: demora + 0.25, duration: 0.35, ease: SALIDA }}>
        <div className="flex h-6 items-end">{gana && <Corona className="h-6 w-6 text-logro" />}</div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] font-display text-2xl font-bold" style={{ borderColor: tono, color: tono, background: `color-mix(in oklab, ${tono} 14%, transparent)` }}>
          {(nombre.trim()[0] ?? "?").toUpperCase()}
        </div>
        <p className="max-w-full truncate text-sm font-bold text-foreground">{nombre}</p>
        {puntaje != null && <CountUp from={0} value={puntaje} className={`font-display text-2xl font-black tabular-nums ${gana ? "text-logro" : "text-foreground"}`} />}
      </motion.div>
      <motion.div
        className="flex w-full items-start justify-center overflow-hidden rounded-t-xl border-2 border-b-0 pt-2 font-display text-3xl font-black"
        style={{ borderColor: `color-mix(in oklab, ${tono} 70%, transparent)`, background: `color-mix(in oklab, ${tono} ${gana ? 22 : 10}%, transparent)`, color: tono }}
        initial={{ height: 0 }}
        animate={{ height: alto }}
        transition={{ delay: demora, type: "spring", damping: 14, stiffness: 140 }}
      >
        {gana ? "1" : "2"}
      </motion.div>
    </div>
  );
}

export default function PodioDuelo({
  gane,
  empate,
  rival,
  puntajes,
  motivo,
  filas,
}: {
  gane: boolean;
  empate: boolean;
  rival: string;
  puntajes: [number | null, number | null];
  motivo?: string;
  filas?: FilaPodio[];
}) {
  const t = useTranslations("Duelos.resultado");
  const altoMio = empate ? ALTO.empate : gane ? ALTO.gana : ALTO.pierde;
  const altoSuyo = empate ? ALTO.empate : gane ? ALTO.pierde : ALTO.gana;
  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <div className="flex w-full items-end justify-center gap-4 px-2">
        <Pedestal nombre={t("tu")} puntaje={puntajes[0]} alto={altoMio} gana={gane && !empate} propio demora={0.15} />
        <Pedestal nombre={rival} puntaje={puntajes[1]} alto={altoSuyo} gana={!gane && !empate} propio={false} demora={0.3} />
      </div>
      <div className="h-[3px] w-full rounded-full bg-foreground/15" />
      {motivo && (
        <motion.p
          className="mt-3 rounded-xl border border-border bg-foreground/[0.04] px-4 py-2 text-center text-sm font-bold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.3 }}
        >
          {motivo}
        </motion.p>
      )}
      {filas && filas.length > 0 && (
        <motion.div className="mt-4 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-2 gap-y-1.5 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.3 }}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primario">{t("tu")}</span>
          <span />
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-texto-secundario">{rival}</span>
          {filas.map((f) => (
            <FilaComparacion key={f.etiqueta} fila={f} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function FilaComparacion({ fila }: { fila: FilaPodio }) {
  const celda = (mejor: boolean) => `rounded-lg py-1.5 font-mono text-sm font-bold ${mejor ? "bg-logro/15 text-logro" : "bg-foreground/[0.04] text-foreground"}`;
  return (
    <>
      <span className={celda(fila.mejor === "mio")}>{fila.mio}</span>
      <span className="w-24 text-[10px] uppercase tracking-wide text-texto-secundario">{fila.etiqueta}</span>
      <span className={celda(fila.mejor === "suyo")}>{fila.suyo}</span>
    </>
  );
}

// Quién gana una fila (más es mejor, salvo el tiempo).
export function mejorDe(mio: number | null | undefined, suyo: number | null | undefined, masEsMejor: boolean): "mio" | "suyo" | null {
  if (mio == null || suyo == null || mio === suyo) return null;
  return mio > suyo === masEsMejor ? "mio" : "suyo";
}
