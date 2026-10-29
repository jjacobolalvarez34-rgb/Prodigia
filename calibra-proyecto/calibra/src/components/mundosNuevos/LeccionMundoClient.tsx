"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCaminoPorTema } from "@/lib/aprender/caminoPorTema";
import { CONFIG_MUNDOS_NUEVOS, type SlugMundoNuevo } from "@/lib/mundosNuevos/config";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import { visualesDeContenido } from "@/lib/aprender/visuales";
import { useRegistrarGuardiaSalida } from "@/lib/navegacion/guardiaSalida";
import MathText from "@/components/MathText";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_MUNDO_NUEVO } from "./visuales/registro";
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
  slug: SlugMundoNuevo;
  nodo: NodoCaminoPorTema;
}

// Lección de Aprender de Dinamia o Vitalia: el mismo flujo que la de
// Estadística (explicación → ejemplo animado o paso a paso → quiz → festejo).
export default function LeccionMundoClient({ slug, nodo }: Props) {
  const cfg = CONFIG_MUNDOS_NUEVOS[slug];
  const t = useTranslations("MundoNuevo.leccion");
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("explicacion");
  const [pasoIdx, setPasoIdx] = useState(0);

  // Pedido 2026-09-24: salir por el Header a mitad de una lección (ya
  // viste el ejemplo, estás en el quiz) pide confirmación — en
  // "explicacion" (recién abierta, nada que perder) y en "celebracion"
  // (ya terminaste) no hace falta.
  useRegistrarGuardiaSalida({ activo: fase !== "explicacion" && fase !== "celebracion" });

  const pasos = nodo.contenido.pasos;
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
                style={{ background: `color-mix(in oklab, ${cfg.color} 12%, transparent)`, color: cfg.color }}
              >
                {nodo.requierePro ? t("clase") : t("tecnica")}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
                <MathText texto={nodo.nombre} />
              </h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <button
              onClick={() => setFase("ejemplo")}
              className="rounded-xl px-4 py-3 font-display font-semibold text-white shadow-lg"
              style={{ background: `linear-gradient(120deg, ${cfg.color}, ${cfg.colorClaro})` }}
            >
              {t("verElTruco")}
            </button>
          </motion.div>
        )}

        {fase === "ejemplo" && (
          <motion.div key="ejemplo" {...transicion} className="flex flex-col gap-6">
            {esVisual ? (
              <>
                <CuerpoVisual pasos={pasos} visuales={visuales} registro={REGISTRO_VISUALES_MUNDO_NUEVO[slug]} />
                <button
                  onClick={() => (tieneQuiz ? setFase("quiz") : completar())}
                  className="rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: cfg.color }}
                >
                  {tieneQuiz ? t("continuarAlQuiz") : t("marcarAprendida")}
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
                      style={{ background: cfg.color }}
                    >
                      {t("siguientePaso")}
                    </button>
                  ) : tieneQuiz ? (
                    <button
                      onClick={() => setFase("quiz")}
                      className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                      style={{ background: cfg.color }}
                    >
                      {t("continuarAlQuiz")}
                    </button>
                  ) : (
                    <button
                      onClick={() => completar()}
                      className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                      style={{ background: cfg.color }}
                    >
                      {t("marcarAprendida")}
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
              colorHex={cfg.color}
              incorrectasServidor={incorrectas}
              onTerminar={(r) => completar(r)}
            />
          </motion.div>
        )}

        {fase === "celebracion" && (
          <motion.div key="celebracion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <CelebracionLeccion
              titulo={t("completaste", { nombre: nodo.nombre })}
              colorHex={cfg.color}
              logros={logros}
              estado={estadoGuardado}
              onReintentar={reintentar}
            >
              <div className="mt-2 flex w-full flex-col gap-3">
                <button
                  onClick={() => router.push(hrefVolverAAprender(`/${slug}/aprender`, nodo.requierePro))}
                  className="rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: cfg.color }}
                >
                  {t("volverAAprender")}
                </button>
                <Link href={`/${slug}/elegir`} className="text-sm font-medium hover:underline" style={{ color: cfg.color }}>
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
