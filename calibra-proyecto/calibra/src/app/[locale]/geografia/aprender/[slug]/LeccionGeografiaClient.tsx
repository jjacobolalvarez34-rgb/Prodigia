"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCaminoGeografia } from "@/lib/geografia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import { visualesDeContenido } from "@/lib/aprender/visuales";
import type { Achievement } from "@/types/database";
import LogroBanner from "@/components/LogroBanner";
import MathText from "@/components/MathText";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_GEOGRAFIA } from "@/components/geografia/visuales/registro";
import { COLOR_GEOGRAFIA } from "../../GeografiaMapa";

type Fase = "explicacion" | "ejemplo" | "quiz" | "celebracion";

const transicion = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

interface Props {
  nodo: NodoCaminoGeografia;
}

// Retrofit a Técnicas | Clases por continente (2026-09-23, ver
// docs/PARIDAD_MUNDOS.md fila 1 + fila 22/23): mismo criterio que
// LeccionEnigmiaClient.tsx — cuando la lección trae `contenido.visuales`
// (las 20 Técnicas y 16 Clases nuevas, todas con el mapa animado
// "geografia.mapa"), la fase "ejemplo" muestra CuerpoVisual en vez del
// paso-a-paso de texto plano de las 3 Técnicas históricas (que no traen
// visuales). "Volver a Aprender" respeta de qué pestaña vino la lección
// (Técnicas o Clases) vía hrefVolverAAprender.
export default function LeccionGeografiaClient({ nodo }: Props) {
  const t = useTranslations("Geografia");
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("explicacion");
  const [pasoIdx, setPasoIdx] = useState(0);
  const [logrosNuevos, setLogrosNuevos] = useState<Achievement[]>([]);

  const pasos = nodo.contenido.pasos;
  const visuales = useMemo(() => visualesDeContenido(nodo.contenido.visuales), [nodo.contenido.visuales]);
  const esVisual = visuales.length > 0;
  const quiz = useMemo(() => nodo.contenido.quiz ?? [], [nodo.contenido.quiz]);
  const tieneQuiz = quiz.length > 0;

  const [respuestas, setRespuestas] = useState<string[]>(() => quiz.map(() => ""));
  const [enviandoQuiz, setEnviandoQuiz] = useState(false);
  const [resultadoQuiz, setResultadoQuiz] = useState<{ incorrectas: number[] } | null>(null);

  async function completarLeccion(respuestasEnviadas?: string[]) {
    try {
      const res = await fetch("/api/aprender/completar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          respuestasEnviadas
            ? { technique_id: nodo.id, respuestas: respuestasEnviadas }
            : { technique_id: nodo.id }
        ),
      });
      const data = await res.json();
      if (data.ok === false || data.aprobado === false) {
        setResultadoQuiz({ incorrectas: Array.isArray(data.incorrectas) ? data.incorrectas : [] });
        setEnviandoQuiz(false);
        return;
      }
      if (Array.isArray(data.logrosNuevos)) setLogrosNuevos(data.logrosNuevos);
    } catch {
      // Si falla el guardado, igual mostramos la celebración: no vale la
      // pena trabar al usuario por un error de red puntual acá. Un quiz
      // que falla de red no debería festejar sin confirmación del
      // server, así que ahí sí se corta.
      if (respuestasEnviadas) {
        setEnviandoQuiz(false);
        return;
      }
    }
    setEnviandoQuiz(false);
    setFase("celebracion");
  }

  async function enviarQuiz() {
    setEnviandoQuiz(true);
    setResultadoQuiz(null);
    await completarLeccion(respuestas);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "explicacion" && (
          <motion.div key="explicacion" {...transicion} className="flex flex-col gap-6 text-center">
            <div>
              <span
                className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
                style={{ background: `color-mix(in oklab, ${COLOR_GEOGRAFIA} 12%, transparent)`, color: COLOR_GEOGRAFIA }}
              >
                {nodo.requierePro ? t("leccion.clase") : t("leccion.tecnica")}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{nodo.nombre}</h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <button
              onClick={() => setFase("ejemplo")}
              className="rounded-xl px-4 py-3 font-display font-semibold text-white shadow-lg"
              style={{ background: `linear-gradient(120deg, ${COLOR_GEOGRAFIA}, #3FB88B)` }}
            >
              {t("leccion.verElTruco")}
            </button>
          </motion.div>
        )}

        {fase === "ejemplo" && (
          <motion.div key="ejemplo" {...transicion} className="flex flex-col gap-6">
            {esVisual ? (
              <>
                <CuerpoVisual pasos={pasos} visuales={visuales} registro={REGISTRO_VISUALES_GEOGRAFIA} />
                <button
                  onClick={() => (tieneQuiz ? setFase("quiz") : completarLeccion())}
                  className="rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: COLOR_GEOGRAFIA }}
                >
                  {tieneQuiz ? t("leccion.continuarAlQuiz") : t("leccion.marcarComoAprendida")}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {pasos.map((paso, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border px-4 py-3 text-sm transition-all duration-300 ${
                        i === pasoIdx
                          ? "border-logro/50 bg-logro/10 text-foreground"
                          : i < pasoIdx
                            ? "border-border bg-surface text-foreground/40"
                            : "border-border bg-surface text-foreground/25"
                      }`}
                    >
                      <span className="mr-2 font-bold text-logro">{i + 1}</span>
                      <MathText texto={paso} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPasoIdx((p) => Math.max(0, p - 1))}
                    disabled={pasoIdx === 0}
                    className="rounded-xl border border-border px-4 py-3 font-medium text-foreground disabled:opacity-40"
                  >
                    {t("leccion.anterior")}
                  </button>
                  {pasoIdx < pasos.length - 1 ? (
                    <button
                      onClick={() => setPasoIdx((p) => Math.min(pasos.length - 1, p + 1))}
                      className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                      style={{ background: COLOR_GEOGRAFIA }}
                    >
                      {t("leccion.siguientePaso")}
                    </button>
                  ) : tieneQuiz ? (
                    <button
                      onClick={() => setFase("quiz")}
                      className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                      style={{ background: COLOR_GEOGRAFIA }}
                    >
                      {t("leccion.continuarAlQuiz")}
                    </button>
                  ) : (
                    <button
                      onClick={() => completarLeccion()}
                      className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                      style={{ background: COLOR_GEOGRAFIA }}
                    >
                      {t("leccion.marcarComoAprendida")}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {fase === "quiz" && (
          <motion.div key="quiz" {...transicion} className="flex flex-col gap-6">
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">{t("leccion.quizTitulo")}</h1>
              <p className="mt-1 text-sm text-texto-secundario">{t("leccion.quizSubtitulo")}</p>
            </div>
            <div className="flex flex-col gap-4">
              {quiz.map((pregunta, qi) => {
                const estaMal = resultadoQuiz?.incorrectas.includes(qi) ?? false;
                return (
                  <div key={qi} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {qi + 1}. <MathText texto={pregunta.pregunta} />
                    </p>
                    <div className="flex flex-col gap-2">
                      {pregunta.opciones.map((opcion) => {
                        const seleccionada = respuestas[qi] === opcion;
                        return (
                          <button
                            key={opcion}
                            type="button"
                            onClick={() => setRespuestas((prev) => prev.map((v, i) => (i === qi ? opcion : v)))}
                            className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                              seleccionada && estaMal
                                ? "border-error bg-error/10 text-error"
                                : seleccionada
                                  ? "border-logro/50 bg-logro/10 text-foreground"
                                  : "border-border bg-background text-foreground"
                            }`}
                          >
                            <MathText texto={opcion} />
                          </button>
                        );
                      })}
                    </div>
                    {estaMal && (
                      <p className="text-xs font-medium text-error">
                        {t("leccion.respuestaIncorrecta")}
                        {pregunta.explicacion ? ` — ${pregunta.explicacion}` : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={enviarQuiz}
              disabled={enviandoQuiz || respuestas.some((r) => !r)}
              className="rounded-xl px-4 py-3 font-display font-semibold text-white disabled:opacity-50"
              style={{ background: COLOR_GEOGRAFIA }}
            >
              {enviandoQuiz ? t("leccion.enviando") : t("leccion.enviarRespuestas")}
            </button>
            {resultadoQuiz && (
              <p className="text-center text-sm text-texto-secundario">{t("leccion.reintentaCuandoQuieras")}</p>
            )}
          </motion.div>
        )}

        {fase === "celebracion" && (
          <motion.div
            key="celebracion"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <span className="text-5xl">🎉</span>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
              {t("leccion.completaste", { nombre: nodo.nombre })}
            </h1>
            <LogroBanner logros={logrosNuevos} />
            <div className="mt-2 flex w-full flex-col gap-3">
              <button
                onClick={() => router.push(hrefVolverAAprender("/geografia/aprender", nodo.requierePro))}
                className="rounded-xl px-4 py-3 font-display font-semibold text-white"
                style={{ background: COLOR_GEOGRAFIA }}
              >
                {t("leccion.volverAAprender")}
              </button>
              <Link href="/geografia/practica" className="text-sm font-medium hover:underline" style={{ color: COLOR_GEOGRAFIA }}>
                {t("leccion.irAPracticar")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
