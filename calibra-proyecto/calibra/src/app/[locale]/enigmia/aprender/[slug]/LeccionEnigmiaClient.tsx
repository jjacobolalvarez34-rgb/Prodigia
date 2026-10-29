"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCaminoEnigmiaClases } from "@/lib/enigmia/pathClases";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import { visualesDeContenido } from "@/lib/aprender/visuales";
import { useRegistrarGuardiaSalida } from "@/lib/navegacion/guardiaSalida";
import MathText from "@/components/MathText";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_ENIGMIA } from "@/components/enigmia/visuales/registro";
import Boton from "@/components/Boton";
import QuizLeccion from "@/components/aprender/QuizLeccion";
import CelebracionLeccion from "@/components/aprender/CelebracionLeccion";
import { useCompletarLeccion } from "@/components/aprender/useCompletarLeccion";

type Fase = "explicacion" | "ejemplo" | "quiz" | "celebracion";

const COLOR = "#0E9F6E";

const transicion = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

interface Props {
  nodo: NodoCaminoEnigmiaClases;
}

// Bug real corregido (migración 0186, ver docs/PLAN_REVISION_CONTENIDO.md):
// antes esto tenía un solo "ejemplo" cuyo botón "Listo" se habilitaba con
// CUALQUIER opción elegida, sin verificar si era la correcta. Ahora usa el
// mismo patrón de fase "quiz" que el resto de los mundos, validado en el
// servidor.
//
// Retrofit a Clases (2026-09-22, docs/PARIDAD_MUNDOS.md fila 22 + fila
// 23): cuando la lección trae `contenido.visuales` (las 6 Clases nuevas),
// la fase "ejemplo" muestra CuerpoVisual (explicación animada) en vez del
// paso-a-paso de texto plano de las 6 Técnicas rápidas — mismo criterio
// que Numeria/Naipia.
export default function LeccionEnigmiaClient({ nodo }: Props) {
  const t = useTranslations("Enigmia.leccion");
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("explicacion");
  const [pasoIdx, setPasoIdx] = useState(0);

  // Pedido 2026-09-24: salir por el Header a mitad de una lección (ya
  // viste el ejemplo, estás practicando o en el quiz) pide confirmación —
  // en "explicacion" (recién abriste, nada que perder todavía) y en
  // "celebracion" (ya terminaste) no hace falta.
  useRegistrarGuardiaSalida({ activo: fase !== "explicacion" && fase !== "celebracion" });

  const pasos = nodo.contenido.pasos;
  const visuales = useMemo(() => visualesDeContenido(nodo.contenido.visuales), [nodo.contenido.visuales]);
  const esVisual = visuales.length > 0;
  const quiz = useMemo(() => nodo.contenido.quiz ?? [], [nodo.contenido.quiz]);
  const tieneQuiz = quiz.length > 0;

  const { completar, reintentar, estado: estadoGuardado, logros, incorrectas } = useCompletarLeccion({
    techniqueId: nodo.id,
    endpoint: "/api/enigmia/completar-leccion",
    alCelebrar: () => setFase("celebracion"),
    alRechazar: () => setFase("quiz"),
    // Que el camino de Aprender se recalcule al volver (Router Cache de Next).
    alGuardar: () => router.refresh(),
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "explicacion" && (
          <motion.div key="explicacion" {...transicion} className="flex flex-col gap-6 text-center">
            <div>
              <span
                className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide"
                style={{ background: "rgba(14,159,110,0.1)", color: COLOR }}
              >
                {nodo.requierePro ? t("clase") : t("tecnica")}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{nodo.nombre}</h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <button
              onClick={() => setFase("ejemplo")}
              className="rounded-xl px-4 py-3 font-display font-semibold text-white shadow-lg"
              style={{ background: `linear-gradient(120deg, ${COLOR}, #3FB88B)` }}
            >
              {t("verElEjemplo")}
            </button>
          </motion.div>
        )}

        {fase === "ejemplo" && (
          <motion.div key="ejemplo" {...transicion} className="flex flex-col gap-6">
            {esVisual ? (
              <>
                <CuerpoVisual pasos={pasos} visuales={visuales} registro={REGISTRO_VISUALES_ENIGMIA} />
                <button
                  onClick={() => (tieneQuiz ? setFase("quiz") : completar())}
                  className="rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: COLOR }}
                >
                  {tieneQuiz ? t("continuarAlQuiz") : t("listo")}
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
                    {t("anterior")}
                  </button>
                  {pasoIdx < pasos.length - 1 ? (
                    <button
                      onClick={() => setPasoIdx((p) => Math.min(pasos.length - 1, p + 1))}
                      className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                      style={{ background: COLOR }}
                    >
                      {t("siguientePaso")}
                    </button>
                  ) : tieneQuiz ? (
                    <button
                      onClick={() => setFase("quiz")}
                      className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                      style={{ background: COLOR }}
                    >
                      {t("continuarAlQuiz")}
                    </button>
                  ) : (
                    <button
                      onClick={() => completar()}
                      className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                      style={{ background: COLOR }}
                    >
                      {t("listo")}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {fase === "quiz" && (
          <motion.div key="quiz" {...transicion}>
            <QuizLeccion
              quiz={quiz}
              titulo={t("quizTitulo")}
              subtitulo={t("quizSubtitulo")}
              colorHex={COLOR}
              incorrectasServidor={incorrectas}
              onTerminar={(r) => completar(r)}
            />
          </motion.div>
        )}

        {fase === "celebracion" && (
          <motion.div key="celebracion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <CelebracionLeccion
              titulo={t("completaste", { nombre: nodo.nombre })}
              colorHex={COLOR}
              logros={logros}
              estado={estadoGuardado}
              onReintentar={reintentar}
            >
              <Boton atras colorHex={COLOR} className="mt-2 w-full" onClick={() => router.push(hrefVolverAAprender("/enigmia/aprender", nodo.requierePro))}>
                {t("volverAAprender")}
              </Boton>
            </CelebracionLeccion>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
