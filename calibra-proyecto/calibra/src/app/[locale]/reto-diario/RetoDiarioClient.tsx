"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PreguntaRetoDiario, MundoRetoDiario } from "@/lib/retoDiario";
import type { Achievement } from "@/types/database";
import { reproducirTono } from "@/lib/sonido";
import LogroBanner from "@/components/LogroBanner";
import Boton from "@/components/Boton";
import Pentagrama from "@/components/melodia/Pentagrama";
import FiguraRitmicaIcono from "@/components/melodia/FiguraRitmicaIcono";

type Fase = "intro" | "jugando" | "resumen";

interface Props {
  fecha: string;
  problemas: PreguntaRetoDiario[];
  yaCompletado: { correctos: number; puntosBonus: number } | null;
}

const COLOR_MUNDO: Record<MundoRetoDiario, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
  quimia: "#C026D3",
  anatomia: "#8B2942",
  melodia: "#B8860B",
  trigonometria: "#84CC16",
  historia: "#A0522D",
};
const NOMBRE_MUNDO: Record<MundoRetoDiario, string> = {
  numeria: "Numeria",
  enigmia: "Enigmia",
  geografia: "Geografía",
  quimia: "Quimia",
  anatomia: "Anatomía",
  melodia: "Melodía",
  trigonometria: "Trigonometría",
  historia: "Historia",
};

// Fase 3 (reto diario multi-ciudad, 2026-08-25): 45 preguntas de las
// ciudades que el usuario ya desbloqueó (mezcladas, ver
// generarRetoDelDia), no solo Numeria — un único renderer de opción
// múltiple para las 6 ciudades (incluida Numeria, que antes tenía
// teclado numérico propio) porque mezclar un teclado numérico con
// tarjetas de opción en la misma tanda de 45 se sentía más
// inconsistente que ganar en algo real.
export default function RetoDiarioClient({ fecha, problemas, yaCompletado }: Props) {
  const [fase, setFase] = useState<Fase>(yaCompletado ? "resumen" : "intro");
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [correctos, setCorrectos] = useState(0);
  const [resultado, setResultado] = useState<{ correctos: number; puntosBonus: number } | null>(yaCompletado);
  const [logrosNuevos, setLogrosNuevos] = useState<Achievement[]>([]);
  const [enviando, setEnviando] = useState(false);

  const pregunta = problemas[indice];
  const total = problemas.length;

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

  function handleElegir(opcion: string) {
    if (feedback !== "idle") return;
    const correct = opcion === pregunta.respuesta;
    setSeleccion(opcion);
    setFeedback(correct ? "correcto" : "incorrecto");
    reproducirTono(correct ? "correcto" : "error");
    const totalCorrectos = correct ? correctos + 1 : correctos;
    if (correct) setCorrectos(totalCorrectos);

    setTimeout(() => {
      const siguiente = indice + 1;
      if (siguiente >= total) {
        finalizar(totalCorrectos);
      } else {
        setIndice(siguiente);
        setSeleccion(null);
        setFeedback("idle");
      }
    }, correct ? 450 : 800);
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
                {total} preguntas, las mismas para todos hoy
              </h1>
              <p className="mt-2 text-sm text-texto-secundario">
                Repartidas entre tus ciudades desbloqueadas, al azar. Completalo para sumar Chispas extra y
                estirar tu racha de retos diarios.
              </p>
            </div>
            <Boton onClick={() => setFase("jugando")} className="py-4">
              Empezar
            </Boton>
          </motion.div>
        )}

        {fase === "jugando" && pregunta && (
          <motion.div
            key={`p-${indice}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-texto-secundario">
                <span className="font-medium" style={{ color: COLOR_MUNDO[pregunta.mundo] }}>
                  {NOMBRE_MUNDO[pregunta.mundo]}
                </span>
                <span className="font-mono">{indice + 1}/{total}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${((indice + 1) / total) * 100}%`, background: COLOR_MUNDO[pregunta.mundo] }}
                />
              </div>
            </div>

            <div
              className={`flex w-full flex-col items-center gap-5 rounded-3xl border-2 bg-surface px-6 py-8 transition-colors ${
                feedback === "correcto" ? "border-correcto" : feedback === "incorrecto" ? "border-error" : "border-border"
              }`}
            >
              {pregunta.notasMelodia && (
                <div className="w-full overflow-x-auto">
                  <Pentagrama notas={pregunta.notasMelodia} disposicion={pregunta.disposicionMelodia} colorHex={COLOR_MUNDO.melodia} />
                </div>
              )}
              {pregunta.figuraMelodia && <FiguraRitmicaIcono figura={pregunta.figuraMelodia} colorHex={COLOR_MUNDO.melodia} />}

              <p className="text-center font-medium text-foreground">{pregunta.enunciado}</p>

              <div className="grid w-full grid-cols-2 gap-2.5">
                {pregunta.opciones.map((op) => {
                  const esElegida = seleccion === op;
                  const esCorrecta = feedback !== "idle" && op === pregunta.respuesta;
                  return (
                    <button
                      key={op}
                      onClick={() => handleElegir(op)}
                      disabled={feedback !== "idle"}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-100 ${
                        esCorrecta
                          ? "border-correcto bg-correcto/10 text-correcto"
                          : esElegida
                            ? "border-error bg-error/10 text-error"
                            : "border-border bg-background text-foreground"
                      }`}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
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
            <p className="font-mono text-4xl font-bold text-logro">
              {resultado.correctos}/{total}
            </p>
            {resultado.puntosBonus > 0 && (
              <p className="text-sm text-texto-secundario">+{resultado.puntosBonus} Chispas de bonus</p>
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
