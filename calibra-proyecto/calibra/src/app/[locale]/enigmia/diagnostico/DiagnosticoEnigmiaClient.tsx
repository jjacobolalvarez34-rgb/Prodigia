"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import type { LogicPuzzle } from "@/types/database";
import AcertijoMemoria from "@/components/AcertijoMemoria";

type Fase = "intro" | "diagnostico" | "guardando" | "resultado";

const TOTAL_PREGUNTAS = 8;
const NIVEL_INICIAL = 3;

function elegirAlAzar(puzzles: LogicPuzzle[], nivel: number, usados: Set<string>): LogicPuzzle | null {
  const min = Math.max(1, nivel - 1);
  const max = Math.min(10, nivel + 1);
  const candidatos = puzzles.filter((p) => p.dificultad >= min && p.dificultad <= max && !usados.has(p.id));
  const pool = candidatos.length > 0 ? candidatos : puzzles.filter((p) => !usados.has(p.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface Props {
  puzzles: LogicPuzzle[];
  destino: string;
}

export default function DiagnosticoEnigmiaClient({ puzzles, destino }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [indice, setIndice] = useState(0);
  const [puzzle, setPuzzle] = useState<LogicPuzzle | null>(null);
  const [faseMemoria, setFaseMemoria] = useState<"memorizando" | "respondiendo">("respondiendo");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [nivelFinal, setNivelFinal] = useState(NIVEL_INICIAL);

  const nivelRef = useRef(NIVEL_INICIAL);
  const usadosRef = useRef<Set<string>>(new Set());
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);

  function siguientePuzzle() {
    const p = elegirAlAzar(puzzles, nivelRef.current, usadosRef.current);
    if (p) usadosRef.current.add(p.id);
    setPuzzle(p);
    setSeleccion(null);
    setFeedback("idle");
    if (p?.contenido.secuencia) {
      // Fase W2: mismo criterio que la práctica — el cronómetro arranca
      // recién cuando termina la memorización, no antes.
      setFaseMemoria("memorizando");
    } else {
      setFaseMemoria("respondiendo");
      shownAtRef.current = performance.now();
    }
  }

  function empezar() {
    nivelRef.current = NIVEL_INICIAL;
    usadosRef.current = new Set();
    setIndice(0);
    setFase("diagnostico");
    siguientePuzzle();
  }

  function handleResponder(e: React.MouseEvent<HTMLButtonElement>) {
    const opcion = e.currentTarget.dataset.opcion;
    if (!opcion || submittingRef.current || !puzzle) return;
    submittingRef.current = true;
    setSeleccion(opcion);

    // Este handler solo corre en respuesta a un click (ver onClick={handleResponder}
    // más abajo, dentro del .map() de opciones) — el linter de purity no logra
    // seguir esa cadena y lo marca como si corriera durante el render.
    // eslint-disable-next-line react-hooks/purity
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = opcion === puzzle.respuesta;
    setFeedback(correct ? "correcto" : "incorrecto");

    const esperado = tiempoEsperadoMs(nivelRef.current);
    if (correct && timeMs < esperado * 0.8) {
      nivelRef.current = Math.min(10, nivelRef.current + 1);
    } else if (!correct) {
      nivelRef.current = Math.max(1, nivelRef.current - 1);
    }

    setTimeout(() => {
      submittingRef.current = false;
      const sig = indice + 1;
      setIndice(sig);
      if (sig >= TOTAL_PREGUNTAS || usadosRef.current.size >= puzzles.length) {
        finalizar();
      } else {
        siguientePuzzle();
      }
    }, 500);
  }

  async function guardar(nivel: number) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("logic_skill_levels")
      .upsert({ user_id: user.id, nivel, racha_actual: 0 }, { onConflict: "user_id" });
    await supabase.from("profiles").update({ onboarding_enigmia_completado: true }).eq("id", user.id);
  }

  async function finalizar() {
    setFase("guardando");
    setNivelFinal(nivelRef.current);
    await guardar(nivelRef.current);
    setFase("resultado");
  }

  async function saltear() {
    setFase("guardando");
    await guardar(NIVEL_INICIAL);
    router.push(destino);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 text-center"
          >
            <div>
              <span className="rounded-full bg-[#0E9F6E]/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#0E9F6E]">
                Enigmia
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
                Unos acertijos para calibrar
              </h1>
              <p className="mt-2 text-sm text-texto-secundario">
                Sin presión — 8 acertijos variados, solo para arrancar en el nivel justo.
              </p>
            </div>
            <button
              onClick={empezar}
              className="rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: "linear-gradient(120deg, #0E9F6E, #3FB88B)" }}
            >
              Empezar
            </button>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              Prefiero arrancar en nivel 1
            </button>
          </motion.div>
        )}

        {fase === "diagnostico" && puzzle && (
          <motion.div
            key={`diag-${indice}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_PREGUNTAS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-5 rounded-full ${i <= indice ? "bg-[#0E9F6E]" : "bg-foreground/15"}`}
                />
              ))}
            </div>
            <div className="flex w-full flex-col items-center gap-6 rounded-3xl border-2 border-border bg-surface px-8 py-10">
              {faseMemoria === "memorizando" && puzzle.contenido.secuencia ? (
                <AcertijoMemoria
                  secuencia={puzzle.contenido.secuencia}
                  colorHex="#0E9F6E"
                  onListo={() => {
                    setFaseMemoria("respondiendo");
                    shownAtRef.current = performance.now();
                  }}
                />
              ) : (
                <>
                  <p className="text-center font-medium text-foreground">{puzzle.contenido.enunciado}</p>
                  <div className="grid w-full grid-cols-2 gap-2">
                    {puzzle.contenido.opciones.map((op) => {
                      const esElegida = seleccion === op;
                      const esCorrecta = feedback !== "idle" && op === puzzle.respuesta;
                      return (
                        <button
                          key={op}
                          data-opcion={op}
                          onClick={handleResponder}
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
                </>
              )}
            </div>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              Prefiero arrancar en nivel 1
            </button>
          </motion.div>
        )}

        {fase === "guardando" && (
          <motion.p
            key="guardando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-texto-secundario"
          >
            Guardando tu diagnóstico...
          </motion.p>
        )}

        {fase === "resultado" && (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Así arrancás</h1>
            <p className="font-mono text-4xl font-bold text-[#0E9F6E]">Nivel {nivelFinal}</p>
            <button
              onClick={() => router.push(destino)}
              className="w-full rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: "linear-gradient(120deg, #0E9F6E, #3FB88B)" }}
            >
              Continuar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
