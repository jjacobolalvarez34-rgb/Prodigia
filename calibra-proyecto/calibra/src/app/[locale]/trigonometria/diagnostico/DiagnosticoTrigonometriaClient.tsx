"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { generarProblemaTrigonometria, type ProblemaTrigonometriaNumero } from "@/lib/practica/trigonometria";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import TrianguloSVG from "@/components/trigonometria/TrianguloSVG";
import { COLOR_TRIGONOMETRIA } from "../colores";

type Fase = "intro" | "diagnostico" | "guardando" | "resultado";

const TOTAL_PREGUNTAS = 8;
const NIVEL_INICIAL = 3;

interface Props {
  destino: string;
}

function claveRazones(p: ProblemaTrigonometriaNumero): string {
  return `${p.enunciado}|${p.respuesta}`;
}

// Mismo patrón que DiagnosticoMelodiaClient.tsx — acá con preguntas del
// modo "razones" (SOHCAHTOA), el único de entrada numérica entre los 4
// modos de Trigonometría, así que la calibración inicial (siempre sobre
// el modo de entrada) se resuelve con un input numérico simple en vez
// de la grilla de opciones que usan los demás mundos.
export default function DiagnosticoTrigonometriaClient({ destino }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [indice, setIndice] = useState(0);
  const [pregunta, setPregunta] = useState<ProblemaTrigonometriaNumero | null>(null);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [nivelFinal, setNivelFinal] = useState(NIVEL_INICIAL);
  const [guardadoOk, setGuardadoOk] = useState(true);

  const nivelRef = useRef(NIVEL_INICIAL);
  const usadosRef = useRef<Set<string>>(new Set());
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);

  function siguientePregunta() {
    const p = generarSinRepetir(
      () => generarProblemaTrigonometria("razones", nivelRef.current) as ProblemaTrigonometriaNumero,
      claveRazones,
      usadosRef.current
    );
    setPregunta(p);
    setRespuestaTexto("");
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

  function handleResponder(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || !pregunta || respuestaTexto === "") return;
    submittingRef.current = true;

    // eslint-disable-next-line react-hooks/purity
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const valor = Number(respuestaTexto);
    const correct = Math.abs(valor - pregunta.respuesta) <= pregunta.tolerancia + 1e-9;
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
      .upsert({ user_id: user.id, problem_type: "trigonometria_razones", nivel, racha_actual: 0 }, { onConflict: "user_id,problem_type" });
    const { error } = await supabase.from("profiles").update({ onboarding_trigonometria_completado: true }).eq("id", user.id);
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
                style={{ background: `color-mix(in oklab, ${COLOR_TRIGONOMETRIA} 10%, transparent)`, color: COLOR_TRIGONOMETRIA }}
              >
                Trigonometría
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">Unos triángulos para calibrar</h1>
              <p className="mt-2 text-sm text-texto-secundario">
                Sin presión — 8 preguntas variadas, solo para arrancar en el nivel justo.
              </p>
            </div>
            <button
              onClick={empezar}
              className="rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: `linear-gradient(120deg, ${COLOR_TRIGONOMETRIA}, #BEF264)` }}
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
                <span key={i} className="h-1.5 w-5 rounded-full" style={{ background: i <= indice ? COLOR_TRIGONOMETRIA : undefined }} />
              ))}
            </div>
            <div className="flex w-full flex-col items-center gap-6 rounded-3xl border-2 border-border bg-surface px-8 py-10">
              {pregunta.triangulo && (
                <div className="w-full overflow-x-auto">
                  <TrianguloSVG triangulo={pregunta.triangulo} colorHex={COLOR_TRIGONOMETRIA} />
                </div>
              )}
              <p className="text-center font-medium text-foreground">{pregunta.enunciado}</p>
              <form onSubmit={handleResponder} className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  disabled={feedback !== "idle"}
                  autoFocus
                  className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-center font-mono text-lg font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={feedback !== "idle"}
                  className="rounded-xl px-4 py-2.5 font-display font-semibold text-white disabled:opacity-60"
                  style={{ background: COLOR_TRIGONOMETRIA }}
                >
                  Ok
                </button>
              </form>
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
            <p className="font-mono text-4xl font-bold" style={{ color: COLOR_TRIGONOMETRIA }}>
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
              style={{ background: guardadoOk ? `linear-gradient(120deg, ${COLOR_TRIGONOMETRIA}, #BEF264)` : "var(--error)" }}
            >
              {guardadoOk ? "Continuar" : "Reintentar"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
