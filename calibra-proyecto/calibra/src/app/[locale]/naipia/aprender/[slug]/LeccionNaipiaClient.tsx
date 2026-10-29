"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCaminoNaipia } from "@/lib/naipia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import MathText from "@/components/MathText";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_NAIPIA } from "@/components/naipia/visuales/registro";
import { visualesDeContenido } from "@/lib/aprender/visuales";
import { useRegistrarGuardiaSalida } from "@/lib/navegacion/guardiaSalida";
import { COLOR_NAIPIA } from "../../colores";
import Boton from "@/components/Boton";
import QuizLeccion from "@/components/aprender/QuizLeccion";
import CelebracionLeccion from "@/components/aprender/CelebracionLeccion";
import { useCompletarLeccion } from "@/components/aprender/useCompletarLeccion";

type Fase = "explicacion" | "ejemplo" | "quiz" | "celebracion";

const transicion = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

interface Props {
  nodo: NodoCaminoNaipia;
}

// Mismo patrón exacto que LeccionTrigonometriaClient.tsx, extendido en
// Fase C con una fase "quiz" opcional — SOLO cuando `nodo.contenido.quiz`
// tiene preguntas (las "Clases" Pro de Naipia). Las
// técnicas rápidas de siempre no tienen `quiz`, así que para ellas el
// flujo queda idéntico al de antes: explicación -> ejemplo -> completar.
export default function LeccionNaipiaClient({ nodo }: Props) {
  const t = useTranslations("Naipia.leccion");
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("explicacion");
  const [pasoIdx, setPasoIdx] = useState(0);

  // Pedido 2026-09-24: salir por el Header a mitad de una lección (ya
  // viste el ejemplo, estás practicando o en el quiz) pide confirmación —
  // en "explicacion" (recién abriste, nada que perder todavía) y en
  // "celebracion" (ya terminaste) no hace falta.
  useRegistrarGuardiaSalida({ activo: fase !== "explicacion" && fase !== "celebracion" });

  const pasos = nodo.contenido.pasos;
  // Formato visual (contenido.visuales): los pasos son una introducción
  // corta y la explicación real son los visuales animados. Sin visuales,
  // la lección se ve exactamente como siempre (paso a paso).
  const visuales = useMemo(() => visualesDeContenido(nodo.contenido.visuales), [nodo.contenido.visuales]);
  const esVisual = visuales.length > 0;
  const quiz = useMemo(() => nodo.contenido.quiz ?? [], [nodo.contenido.quiz]);
  const tieneQuiz = quiz.length > 0;

  const { completar, reintentar, estado: estadoGuardado, logros, incorrectas } = useCompletarLeccion({
    techniqueId: nodo.id,
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
                style={{ background: `color-mix(in oklab, ${COLOR_NAIPIA} 12%, transparent)`, color: COLOR_NAIPIA }}
              >
                {t("tecnica")}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{nodo.nombre}</h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <button
              onClick={() => setFase("ejemplo")}
              className="rounded-xl px-4 py-3 font-display font-semibold text-white shadow-lg"
              style={{ background: `linear-gradient(120deg, ${COLOR_NAIPIA}, #F87171)` }}
            >
              {t("verElTruco")}
            </button>
          </motion.div>
        )}

        {fase === "ejemplo" && (
          <motion.div key="ejemplo" {...transicion} className="flex flex-col gap-6">
            {esVisual ? (
              <div className="flex flex-col gap-5">
                <h1 className="text-center font-display text-xl font-bold tracking-tight text-foreground">{nodo.nombre}</h1>
                <CuerpoVisual pasos={pasos} visuales={visuales} registro={REGISTRO_VISUALES_NAIPIA} />
              </div>
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
                  style={{ background: COLOR_NAIPIA }}
                >
                  {t("siguientePaso")}
                </button>
              ) : tieneQuiz ? (
                <button
                  onClick={() => setFase("quiz")}
                  className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: COLOR_NAIPIA }}
                >
                  {t("continuarAlQuiz")}
                </button>
              ) : (
                <button
                  onClick={() => completar()}
                  className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: COLOR_NAIPIA }}
                >
                  {t("marcarAprendida")}
                </button>
              )}
            </div>
              </>
            )}
            {esVisual && (
              <button
                onClick={() => (tieneQuiz ? setFase("quiz") : completar())}
                className="rounded-xl px-4 py-3 font-display font-semibold text-white"
                style={{ background: COLOR_NAIPIA }}
              >
                {tieneQuiz ? t("continuarAlQuiz") : t("marcarAprendida")}
              </button>
            )}
          </motion.div>
        )}

        {fase === "quiz" && (
          <motion.div key="quiz" {...transicion}>
            <QuizLeccion
              quiz={quiz}
              titulo={t("quizTitulo")}
              subtitulo={t("quizSubtitulo")}
              colorHex={COLOR_NAIPIA}
              incorrectasServidor={incorrectas}
              onTerminar={(r) => completar(r)}
            />
          </motion.div>
        )}

        {fase === "celebracion" && (
          <motion.div key="celebracion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <CelebracionLeccion
              titulo={t("completaste", { nombre: nodo.nombre })}
              colorHex={COLOR_NAIPIA}
              logros={logros}
              estado={estadoGuardado}
              onReintentar={reintentar}
            >
              <div className="mt-2 flex w-full flex-col gap-3">
                <Boton atras colorHex={COLOR_NAIPIA} onClick={() => router.push(hrefVolverAAprender("/naipia/aprender", nodo.requierePro))}>
                  {t("volverAAprender")}
                </Boton>
                <Link href="/naipia/practica" className="text-sm font-medium hover:underline" style={{ color: COLOR_NAIPIA }}>
                  {t("irAPracticar")}
                </Link>
              </div>
            </CelebracionLeccion>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
