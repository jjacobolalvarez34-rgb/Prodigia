"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { generarProblemaNaipia, claveNaipia, type ProblemaNaipia } from "@/lib/practica/naipia";
import FilaCartas from "@/components/naipia/FilaCartas";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import { COLOR_NAIPIA } from "../colores";

type Fase = "intro" | "diagnostico" | "guardando" | "resultado";

const TOTAL_PREGUNTAS = 8;
const NIVEL_INICIAL = 3;

interface Props {
  destino: string;
}

// Mismo patrón que DiagnosticoCalculiaClient, con entrada numérica exacta
// (conteo corriente Hi-Lo) y las cartas dibujadas en SVG.
export default function DiagnosticoNaipiaClient({ destino }: Props) {
  const t = useTranslations("Naipia");
  const tInicio = useTranslations("Common.errorBoundario");
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [indice, setIndice] = useState(0);
  const [pregunta, setPregunta] = useState<ProblemaNaipia | null>(null);
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
      () => generarProblemaNaipia("hilo", nivelRef.current),
      claveNaipia,
      usadosRef.current
    );
    setPregunta(p);
    setRespuestaTexto("");
    setFeedback("idle");
    shownAtRef.current = performance.now();
  }

  function empezar() {
    nivelRef.current = NIVEL_INICIAL;
    usadosRef.current = new Set();
    setIndice(0);
    setFase("diagnostico");
    siguientePregunta();
  }

  function alternarSigno() {
    setRespuestaTexto((actual) => {
      if (actual === "" || actual === "0") return "-";
      return actual.startsWith("-") ? actual.slice(1) : `-${actual}`;
    });
  }

  function handleResponder(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || !pregunta || respuestaTexto === "" || respuestaTexto === "-") return;
    submittingRef.current = true;

    // eslint-disable-next-line react-hooks/purity
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = Number(respuestaTexto) === pregunta.respuesta;
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
      .upsert({ user_id: user.id, problem_type: "naipia_hilo", nivel, racha_actual: 0 }, { onConflict: "user_id,problem_type" });
    const { error } = await supabase.from("profiles").update({ onboarding_naipia_completado: true }).eq("id", user.id);
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
                style={{ background: `color-mix(in oklab, ${COLOR_NAIPIA} 10%, transparent)`, color: COLOR_NAIPIA }}
              >
                {t("nombreMundo")}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{t("diagnostico.introTitulo")}</h1>
              <p className="mt-2 text-sm text-texto-secundario">{t("diagnostico.introSubtitulo")}</p>
            </div>
            <button
              onClick={empezar}
              className="rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: `linear-gradient(120deg, ${COLOR_NAIPIA}, #F87171)` }}
            >
              {t("diagnostico.empezar")}
            </button>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              {t("diagnostico.arrancarNivel1")}
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
                <span key={i} className="h-1.5 w-5 rounded-full" style={{ background: i <= indice ? COLOR_NAIPIA : undefined }} />
              ))}
            </div>
            <div className="flex w-full flex-col items-center gap-6 rounded-3xl border-2 border-border bg-surface px-8 py-10">
              <p className="text-center font-medium text-foreground">{pregunta.enunciado}</p>
              <FilaCartas cartas={pregunta.cartas} />
              <form onSubmit={handleResponder} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={alternarSigno}
                  disabled={feedback !== "idle"}
                  aria-label={t("sprintRunner.cambiarSigno")}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-lg font-semibold text-foreground disabled:opacity-60"
                >
                  ±
                </button>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={respuestaTexto}
                  onChange={(e) => setRespuestaTexto(e.target.value)}
                  disabled={feedback !== "idle"}
                  autoFocus
                  aria-label={t("sprintRunner.tuRespuesta")}
                  className={`w-28 rounded-xl border-2 bg-background px-3 py-2 text-center font-mono text-lg font-semibold outline-none disabled:opacity-100 ${
                    feedback === "correcto"
                      ? "border-correcto bg-correcto/10 text-correcto"
                      : feedback === "incorrecto"
                        ? "border-error bg-error/10 text-error"
                        : "border-border text-foreground focus:border-primario"
                  }`}
                />
                <button
                  type="submit"
                  disabled={feedback !== "idle"}
                  className="rounded-xl px-4 py-2.5 font-display font-semibold text-white disabled:opacity-60"
                  style={{ background: COLOR_NAIPIA }}
                >
                  {t("diagnostico.ok")}
                </button>
              </form>
              {feedback === "incorrecto" && (
                <p className="font-mono text-sm text-correcto">{t("diagnostico.respuestaCorrecta", { n: pregunta.respuesta })}</p>
              )}
            </div>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              {t("diagnostico.arrancarNivel1")}
            </button>
          </motion.div>
        )}

        {fase === "guardando" && (
          <motion.p key="guardando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-texto-secundario">
            {t("diagnostico.guardando")}
          </motion.p>
        )}

        {fase === "resultado" && (
          <motion.div key="resultado" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("diagnostico.resultadoTitulo")}</h1>
            <p className="font-mono text-4xl font-bold" style={{ color: COLOR_NAIPIA }}>
              {t("diagnostico.nivel", { n: nivelFinal })}
            </p>
            {!guardadoOk && <p className="text-sm text-error">{t("diagnostico.errorGuardado")}</p>}
            <button
              onClick={() => router.push(guardadoOk ? destino : "/")}
              className="w-full rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: guardadoOk ? `linear-gradient(120deg, ${COLOR_NAIPIA}, #F87171)` : "var(--error)" }}
            >
              {guardadoOk ? t("diagnostico.continuar") : tInicio("irAlInicio")}
            </button>
            {!guardadoOk && (
              <button onClick={reintentarGuardado} className="text-sm text-texto-secundario hover:underline">
                {t("diagnostico.reintentar")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
