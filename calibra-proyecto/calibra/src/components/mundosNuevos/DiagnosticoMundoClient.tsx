"use client";

import MathText from "@/components/MathText";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CONFIG_MUNDOS_NUEVOS, leerNumero, respuestaComoTexto, type ProblemaMundoNuevo, type SlugMundoNuevo } from "@/lib/mundosNuevos/config";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import DibujoWeb from "./DibujoWeb";

type Fase = "intro" | "diagnostico" | "guardando" | "resultado";

const TOTAL_PREGUNTAS = 8;
const NIVEL_INICIAL = 3;

// Diagnóstico de Dinamia o Vitalia: 8 preguntas del primer modo, sube o baja el
// nivel según cada respuesta (mismo criterio que DiagnosticoEstadisticaClient) y lo
// guarda con guardar_diagnostico_mundo (0261).
export default function DiagnosticoMundoClient({ slug, destino }: { slug: SlugMundoNuevo; destino: string }) {
  const cfg = CONFIG_MUNDOS_NUEVOS[slug];
  const t = useTranslations("MundoNuevo.diagnostico");
  const tm = useTranslations(cfg.ns);
  const tInicio = useTranslations("Common.errorBoundario");
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("intro");
  const [indice, setIndice] = useState(0);
  const [pregunta, setPregunta] = useState<ProblemaMundoNuevo | null>(null);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [elegida, setElegida] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [nivelFinal, setNivelFinal] = useState(NIVEL_INICIAL);
  const [guardadoOk, setGuardadoOk] = useState(true);

  const nivelRef = useRef(NIVEL_INICIAL);
  const usadosRef = useRef<Set<string>>(new Set());
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const dibujo = useMemo(() => (pregunta?.diagrama ? cfg.dibujo(pregunta.diagrama) : null), [pregunta, cfg]);

  function siguientePregunta() {
    setPregunta(generarSinRepetir(() => cfg.generar(cfg.modoDiagnostico, nivelRef.current), cfg.clave, usadosRef.current));
    setRespuestaTexto("");
    setElegida(null);
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

  function responder(valor: string) {
    if (submittingRef.current || !pregunta || valor === "") return;
    submittingRef.current = true;
    // eslint-disable-next-line react-hooks/purity
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = pregunta.entrada === "numero" ? Math.abs(leerNumero(valor) - (pregunta.respuesta as number)) <= (pregunta.tolerancia ?? 0) + 1e-9 : valor === pregunta.respuesta;
    setFeedback(correct ? "correcto" : "incorrecto");
    const esperado = tiempoEsperadoMs(nivelRef.current);
    if (correct && timeMs < esperado * 0.8) nivelRef.current = Math.min(10, nivelRef.current + 1);
    else if (!correct) nivelRef.current = Math.max(1, nivelRef.current - 1);
    setTimeout(() => {
      submittingRef.current = false;
      const sig = indice + 1;
      setIndice(sig);
      if (sig >= TOTAL_PREGUNTAS) finalizar();
      else siguientePregunta();
    }, correct ? 500 : 1100);
  }

  async function guardar(nivel: number): Promise<boolean> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { error: errorNivel } = await supabase.rpc("guardar_diagnostico_mundo", { p_problem_type: `${slug}_${cfg.modoDiagnostico}`, p_nivel: nivel });
    if (errorNivel) return false;
    const { error } = await supabase.from("profiles").update({ [`onboarding_${slug}_completado`]: true }).eq("id", user.id);
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

  const degradado = `linear-gradient(120deg, ${cfg.color}, ${cfg.colorClaro})`;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 text-center">
            <div>
              <span className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide" style={{ background: `color-mix(in oklab, ${cfg.color} 10%, transparent)`, color: cfg.color }}>
                {tm("nombreMundo")}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{t("introTitulo")}</h1>
              <p className="mt-2 text-sm text-texto-secundario">{tm("diagnosticoIntro")}</p>
            </div>
            <button onClick={empezar} className="rounded-2xl px-6 py-4 font-display font-semibold text-white" style={{ background: degradado }}>
              {t("empezar")}
            </button>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              {t("arrancarNivel1")}
            </button>
          </motion.div>
        )}

        {fase === "diagnostico" && pregunta && (
          <motion.div key={`diag-${indice}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-6">
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_PREGUNTAS }).map((_, i) => (
                <span key={i} className="h-1.5 w-5 rounded-full bg-border" style={{ background: i <= indice ? cfg.color : undefined }} />
              ))}
            </div>
            <div className="flex w-full flex-col items-center gap-5 rounded-3xl border-2 border-border bg-surface px-6 py-8">
              {dibujo && <DibujoWeb dibujo={dibujo} acento={cfg.color} />}
              <p className="text-center font-medium text-foreground">
                <MathText texto={pregunta.enunciado} />
              </p>
              {pregunta.entrada === "numero" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    responder(respuestaTexto);
                  }}
                  className="flex w-full flex-col items-center gap-3"
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    value={respuestaTexto}
                    onChange={(e) => setRespuestaTexto(e.target.value.replace(/[^\d.,-]/g, ""))}
                    disabled={feedback !== "idle"}
                    autoFocus
                    aria-label={t("tuRespuesta")}
                    className={`w-36 rounded-xl border-2 bg-background px-3 py-2 text-center font-mono text-lg font-semibold outline-none transition-colors disabled:opacity-100 ${
                      feedback === "correcto" ? "border-correcto bg-correcto/10 text-correcto" : feedback === "incorrecto" ? "border-error bg-error/10 text-error" : "border-border text-foreground focus:border-primario"
                    }`}
                  />
                  <button type="submit" disabled={feedback !== "idle" || respuestaTexto === ""} className="rounded-xl px-5 py-2.5 font-display font-semibold text-white disabled:opacity-60" style={{ background: cfg.color }}>
                    {t("ok")}
                  </button>
                </form>
              ) : (
                <div className="grid w-full gap-2">
                  {(pregunta.opciones ?? []).map((op) => {
                    const correcta = feedback !== "idle" && op === pregunta.respuesta;
                    const mal = feedback === "incorrecto" && op === elegida;
                    return (
                      <button
                        key={op}
                        disabled={feedback !== "idle"}
                        onClick={() => {
                          setElegida(op);
                          responder(op);
                        }}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-100 ${correcta ? "border-correcto bg-correcto/10 text-correcto" : mal ? "border-error bg-error/10 text-error" : "border-border bg-background text-foreground"}`}
                      >
                        <MathText texto={op} />
                      </button>
                    );
                  })}
                </div>
              )}
              {feedback === "incorrecto" && <p className="text-sm font-medium text-error">{t("laCorrectaEra", { valor: respuestaComoTexto(pregunta) })}</p>}
            </div>
            <button onClick={saltear} className="text-sm text-texto-secundario hover:underline">
              {t("arrancarNivel1")}
            </button>
          </motion.div>
        )}

        {fase === "guardando" && (
          <motion.p key="guardando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-texto-secundario">
            {t("guardando")}
          </motion.p>
        )}

        {fase === "resultado" && (
          <motion.div key="resultado" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("resultadoTitulo")}</h1>
            <p className="font-mono text-4xl font-bold" style={{ color: cfg.color }}>
              {t("nivel", { n: nivelFinal })}
            </p>
            {!guardadoOk && <p className="text-sm text-error">{t("errorGuardado")}</p>}
            <button onClick={() => router.push(guardadoOk ? destino : "/")} className="w-full rounded-2xl px-6 py-4 font-display font-semibold text-white" style={{ background: guardadoOk ? degradado : "var(--error)" }}>
              {guardadoOk ? t("continuar") : tInicio("irAlInicio")}
            </button>
            {!guardadoOk && (
              <button onClick={reintentarGuardado} className="text-sm text-texto-secundario hover:underline">
                {t("reintentar")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
