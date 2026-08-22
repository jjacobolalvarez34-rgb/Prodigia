"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { generarPreguntaAnatomia, type PreguntaAnatomia } from "@/lib/practica/anatomia";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import { COLOR_ANATOMIA } from "../colores";

type Fase = "intro" | "diagnostico" | "guardando" | "resultado";

const TOTAL_PREGUNTAS = 8;
const NIVEL_INICIAL = 3;

interface Props {
  destino: string;
}

// Mismo patrón que DiagnosticoQuimiaClient.tsx — acá con preguntas del
// Sistema óseo (el modo de entrada). Solo calibra "anatomia_oseo"; los
// otros 3 modos calibran solos a medida que se juegan, igual que
// Quimia con sus otros modos.
export default function DiagnosticoAnatomiaClient({ destino }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [indice, setIndice] = useState(0);
  const [pregunta, setPregunta] = useState<PreguntaAnatomia | null>(null);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [nivelFinal, setNivelFinal] = useState(NIVEL_INICIAL);
  const [guardadoOk, setGuardadoOk] = useState(true);

  const nivelRef = useRef(NIVEL_INICIAL);
  const usadosRef = useRef<Set<string>>(new Set());
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);

  function siguientePregunta() {
    const p = generarPreguntaAnatomia("oseo", nivelRef.current, usadosRef.current);
    usadosRef.current.add(p.clave);
    setPregunta(p);
    setSeleccion(null);
    setFeedback("idle");
    // eslint-disable-next-line react-hooks/purity
    shownAtRef.current = performance.now();
  }

  function empezar() {
    nivelRef.current = NIVEL_INICIAL;
    usadosRef.current = new Set();
    setIndice(0);
    setFase("diagnostico");
    siguientePregunta();
  }

  function handleResponder(opcion: string) {
    if (submittingRef.current || !pregunta) return;
    submittingRef.current = true;
    setSeleccion(opcion);

    // eslint-disable-next-line react-hooks/purity
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = opcion === pregunta.respuesta;
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
      if (sig >= TOTAL_PREGUNTAS) {
        finalizar();
      } else {
        siguientePregunta();
      }
    }, 500);
  }

  async function guardar(nivel: number): Promise<boolean> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    await supabase
      .from("skill_levels")
      .upsert({ user_id: user.id, problem_type: "anatomia_oseo", nivel, racha_actual: 0 }, { onConflict: "user_id,problem_type" });
    const { error } = await supabase.from("profiles").update({ onboarding_anatomia_completado: true }).eq("id", user.id);
    return !error;
  }

  async function finalizar() {
    setFase("guardando");
    setNivelFinal(nivelRef.current);
    const ok = await guardar(nivelRef.current);
    setGuardadoOk(ok);
    setFase("resultado");
  }

  async function saltear() {
    setFase("guardando");
    const ok = await guardar(NIVEL_INICIAL);
    if (!ok) {
      setGuardadoOk(false);
      setNivelFinal(NIVEL_INICIAL);
      setFase("resultado");
      return;
    }
    router.push(destino);
  }

  async function reintentarGuardado() {
    setFase("guardando");
    const ok = await guardar(nivelFinal);
    setGuardadoOk(ok);
    setFase("resultado");
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 text-center">
            <div>
              <span
                className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
                style={{ background: `color-mix(in oklab, ${COLOR_ANATOMIA} 10%, transparent)`, color: COLOR_ANATOMIA }}
              >
                Anatomía
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">Unos huesos para calibrar</h1>
              <p className="mt-2 text-sm text-texto-secundario">
                Sin presión — 8 preguntas variadas, solo para arrancar en el nivel justo.
              </p>
            </div>
            <button
              onClick={empezar}
              className="rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: `linear-gradient(120deg, ${COLOR_ANATOMIA}, #C9536F)` }}
            >
              Empezar
            </button>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              Prefiero arrancar en nivel 1
            </button>
          </motion.div>
        )}

        {fase === "diagnostico" && pregunta && (
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
                <span key={i} className="h-1.5 w-5 rounded-full" style={{ background: i <= indice ? COLOR_ANATOMIA : undefined }} />
              ))}
            </div>
            <div className="flex w-full flex-col items-center gap-6 rounded-3xl border-2 border-border bg-surface px-8 py-10">
              <p className="text-center font-medium text-foreground">{pregunta.enunciado}</p>
              <div className="grid w-full grid-cols-2 gap-2">
                {pregunta.opciones.map((op) => {
                  const esElegida = seleccion === op;
                  const esCorrecta = feedback !== "idle" && op === pregunta.respuesta;
                  return (
                    <button
                      key={op}
                      onClick={() => handleResponder(op)}
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
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              Prefiero arrancar en nivel 1
            </button>
          </motion.div>
        )}

        {fase === "guardando" && (
          <motion.p key="guardando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-texto-secundario">
            Guardando tu diagnóstico...
          </motion.p>
        )}

        {fase === "resultado" && (
          <motion.div key="resultado" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Así arrancás</h1>
            <p className="font-mono text-4xl font-bold" style={{ color: COLOR_ANATOMIA }}>
              Nivel {nivelFinal}
            </p>
            {!guardadoOk && (
              <p className="text-sm text-error">
                No pudimos guardar tu progreso — probá de nuevo antes de continuar.
              </p>
            )}
            <button
              onClick={guardadoOk ? () => router.push(destino) : reintentarGuardado}
              className="w-full rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: guardadoOk ? `linear-gradient(120deg, ${COLOR_ANATOMIA}, #C9536F)` : "var(--error)" }}
            >
              {guardadoOk ? "Continuar" : "Reintentar"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
