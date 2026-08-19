"use client";

import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";
import { formatearProblema, type Problem } from "@/lib/practica/problems";
import { IconCheck } from "@/components/icons";
import BotonesFinPartida from "@/components/BotonesFinPartida";
import LogroBanner from "@/components/LogroBanner";
import ApuestaResultado from "@/components/ApuestaResultado";
import NivelMundoSubio, { type NivelMundoInfo } from "@/components/NivelMundoSubio";
import ResultadoDueloBlock, { type ResultadoDuelo } from "@/components/duelos/ResultadoDueloBlock";
import type { Achievement } from "@/types/database";

export interface FinishResponse {
  sprint: {
    total: number;
    correctos: number;
    precision: number | null;
    xpGanado: number;
    avgTimeMs: number | null;
  };
  historico: {
    total: number;
    correctos: number;
    precision: number | null;
    avgTimeMs: number | null;
    avgXpDiario: number | null;
  };
  puntosTotal: number;
  xpGanadoHoy: number;
  metaAlcanzada: boolean;
  metaXpDiaria: number;
  logrosNuevos: Achievement[];
  apuesta?: { gano: boolean; monto: number } | null;
  nivelMundo?: NivelMundoInfo | null;
}

export type { ResultadoDuelo };

interface Props {
  resumen: FinishResponse;
  errores: Problem[];
  duelo?: ResultadoDuelo | null;
  onOtraVez: () => void;
  volverHref?: string;
}

function pct(x: number | null): string {
  return x === null ? "—" : `${Math.round(x * 100)}%`;
}

function segundos(ms: number | null): string {
  return ms === null ? "—" : `${(ms / 1000).toFixed(1)}s`;
}

function Comparacion({
  label,
  actual,
  historico,
}: {
  label: string;
  actual: string;
  historico: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5 last:border-0">
      <span className="text-sm text-texto-secundario">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-semibold text-foreground">{actual}</span>
        <span className="text-xs text-texto-secundario">vs. {historico} tu promedio</span>
      </div>
    </div>
  );
}

export default function SprintSummary({ resumen, errores, duelo, onOtraVez, volverHref = "/numeria" }: Props) {
  const { sprint, historico } = resumen;
  const hayHistorial = historico.total > 0;
  const sprintPerfecto = sprint.total === 10 && sprint.correctos === 10;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20">
      <LogroBanner logros={resumen.logrosNuevos} />
      <NivelMundoSubio nivelMundo={resumen.nivelMundo} />
      <ApuestaResultado apuesta={resumen.apuesta ?? null} />

      {sprintPerfecto && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          className="rounded-full bg-logro/20 px-5 py-2 text-sm font-bold text-foreground"
        >
          ✨ Partida perfecta — 10/10
        </motion.div>
      )}

      <ResultadoDueloBlock duelo={duelo} />

      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primario/10 text-primario">
          <IconCheck className="h-5 w-5" />
        </span>
        <p className="font-display text-lg font-bold text-foreground">Ahí quedó.</p>
        <p className="font-mono text-3xl font-bold text-foreground">
          +<CountUp value={sprint.xpGanado} />{" "}
          <span className="text-base font-medium text-texto-secundario">Experiencia</span>
        </p>
      </div>

      {resumen.metaAlcanzada && (
        <div className="rounded-full bg-logro/20 px-4 py-1.5 text-sm font-medium text-foreground">
          🎉 Rompiste tu meta de hoy — {resumen.xpGanadoHoy}/{resumen.metaXpDiaria} de experiencia
        </div>
      )}

      <div className="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
        <Comparacion
          label="Aciertos"
          actual={`${sprint.correctos}/${sprint.total}`}
          historico={hayHistorial ? pct(historico.precision) : "sin historial"}
        />
        <Comparacion
          label="Precisión"
          actual={pct(sprint.precision)}
          historico={hayHistorial ? pct(historico.precision) : "sin historial"}
        />
        <Comparacion
          label="Velocidad promedio"
          actual={segundos(sprint.avgTimeMs)}
          historico={hayHistorial ? segundos(historico.avgTimeMs) : "sin historial"}
        />
        <Comparacion
          label="Experiencia hoy"
          actual={`${resumen.xpGanadoHoy}`}
          historico={
            historico.avgXpDiario !== null ? Math.round(historico.avgXpDiario).toString() : "sin historial"
          }
        />
      </div>

      <p className="font-mono text-xs text-texto-secundario">Chispas totales: {resumen.puntosTotal}</p>

      {errores.length > 0 ? (
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
          <p className="mb-3 font-display text-sm font-semibold text-foreground">Repasemos esto</p>
          <div className="flex flex-col gap-2.5">
            {errores.map((p, i) => (
              <div key={i} className="flex items-center justify-between font-mono text-sm">
                <span className="text-texto-secundario">{formatearProblema(p)}</span>
                <span className="text-texto-secundario">
                  la respuesta era <span className="font-semibold text-error">{p.answer}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-texto-secundario">Ninguno fallado — así se hace. 🎯</p>
      )}

      <BotonesFinPartida onOtraVez={onOtraVez} volverHref={volverHref} />
    </div>
  );
}
