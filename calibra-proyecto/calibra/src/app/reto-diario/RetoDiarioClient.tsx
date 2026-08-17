"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { ProblemaReto } from "@/lib/retoDiario";
import type { Achievement } from "@/types/database";
import { reproducirTono } from "@/lib/sonido";
import LogroBanner from "@/components/LogroBanner";
import Boton from "@/components/Boton";

type Fase = "intro" | "jugando" | "resumen";

interface Props {
  fecha: string;
  problemas: ProblemaReto[];
  yaCompletado: { correctos: number; puntosBonus: number } | null;
}

export default function RetoDiarioClient({ fecha, problemas, yaCompletado }: Props) {
  const [fase, setFase] = useState<Fase>(yaCompletado ? "resumen" : "intro");
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [correctos, setCorrectos] = useState(0);
  const [resultado, setResultado] = useState<{ correctos: number; puntosBonus: number } | null>(yaCompletado);
  const [logrosNuevos, setLogrosNuevos] = useState<Achievement[]>([]);
  const [enviando, setEnviando] = useState(false);

  const problema = problemas[indice];

  async function finalizar(correctosFinal: number) {
    setEnviando(true);
    try {
      const res = await fetch("/api/reto-diario/completar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, correctos: correctosFinal }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultado({ correctos: correctosFinal, puntosBonus: data.puntos_bonus });
        if (Array.isArray(data.logrosNuevos)) setLogrosNuevos(data.logrosNuevos);
      } else {
        setResultado({ correctos: correctosFinal, puntosBonus: 0 });
      }
    } catch {
      setResultado({ correctos: correctosFinal, puntosBonus: 0 });
    }
    setEnviando(false);
    setFase("resumen");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (feedback !== "idle" || respuesta === "") return;
    const correct = Number(respuesta) === problema.answer;
    setFeedback(correct ? "correcto" : "incorrecto");
    reproducirTono(correct ? "correcto" : "error");
    const totalCorrectos = correct ? correctos + 1 : correctos;
    if (correct) setCorrectos(totalCorrectos);

    setTimeout(() => {
      const siguiente = indice + 1;
      if (siguiente >= problemas.length) {
        finalizar(totalCorrectos);
      } else {
        setIndice(siguiente);
        setRespuesta("");
        setFeedback("idle");
      }
    }, correct ? 500 : 900);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 text-center">
            <div>
              <span className="rounded-full bg-logro/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-logro">
                Reto diario
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
                5 problemas, los mismos para todos hoy
              </h1>
              <p className="mt-2 text-sm text-texto-secundario">
                Completalo para sumar Puntos extra y estirar tu racha de retos diarios.
              </p>
            </div>
            <Boton onClick={() => setFase("jugando")} className="py-4">
              Empezar
            </Boton>
          </motion.div>
        )}

        {fase === "jugando" && problema && (
          <motion.div
            key={`p-${indice}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex gap-1.5">
              {problemas.map((_, i) => (
                <span key={i} className={`h-1.5 w-6 rounded-full ${i <= indice ? "bg-logro" : "bg-foreground/15"}`} />
              ))}
            </div>
            <div
              className={`flex w-full flex-col items-center gap-6 rounded-3xl border-2 bg-surface px-8 py-14 transition-colors ${
                feedback === "correcto" ? "border-correcto" : feedback === "incorrecto" ? "border-error" : "border-border"
              }`}
            >
              <span className="font-mono text-4xl font-bold text-foreground">
                {problema.a} <span className="text-primario">{problema.symbol}</span> {problema.b}
              </span>
              <form onSubmit={handleSubmit} className="flex w-full max-w-xs gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  disabled={feedback !== "idle"}
                  autoFocus
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-xl font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={feedback !== "idle"}
                  className="rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white disabled:opacity-60"
                >
                  Ok
                </button>
              </form>
              {feedback === "incorrecto" && (
                <p className="font-mono text-sm font-semibold text-error">Era {problema.answer}</p>
              )}
            </div>
          </motion.div>
        )}

        {fase === "resumen" && resultado && (
          <motion.div
            key="resumen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <LogroBanner logros={logrosNuevos} />
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {yaCompletado || resultado.puntosBonus === 0
                ? "Ya completaste el reto de hoy"
                : "Ahí quedó."}
            </h1>
            <p className="font-mono text-4xl font-bold text-logro">{resultado.correctos}/5</p>
            {resultado.puntosBonus > 0 && (
              <p className="text-sm text-texto-secundario">+{resultado.puntosBonus} Puntos de bonus</p>
            )}
            <p className="text-sm text-texto-secundario">Volvé mañana por el próximo.</p>
            <Link
              href="/"
              className="w-full rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: "linear-gradient(120deg, var(--primario), var(--logro))" }}
            >
              Volver a Inicio
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      {enviando && <p className="text-center text-xs text-texto-secundario">Guardando...</p>}
    </div>
  );
}
