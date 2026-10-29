"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCaminoNumeria } from "@/lib/aprender/pathClases";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import { generarProblemaTecnica, type Problem } from "@/lib/practica/problems";
import MathText from "@/components/MathText";
import Boton from "@/components/Boton";
import CuerpoVisual from "@/components/aprender/CuerpoVisual";
import { REGISTRO_VISUALES_NUMERIA } from "@/components/numeria/visuales/registro";
import { visualesDeContenido } from "@/lib/aprender/visuales";
import { useRegistrarGuardiaSalida } from "@/lib/navegacion/guardiaSalida";
import BotonEnlace from "@/components/BotonEnlace";
import QuizLeccion from "@/components/aprender/QuizLeccion";
import CelebracionLeccion from "@/components/aprender/CelebracionLeccion";
import { useCompletarLeccion } from "@/components/aprender/useCompletarLeccion";

type Fase = "explicacion" | "ejemplo" | "practica" | "quiz" | "celebracion";

const PROBLEMAS_PRACTICA = 4;

// Las lecciones de Fracciones (Fase OO) no calzan en el motor de práctica
// numérica de una sola respuesta (necesitan mostrar num/den o comparar) —
// para esas, "Practicar" pasa directo a completar la lección: la práctica
// real pasa en /practica/fracciones, que tiene su propio motor.
const SLUGS_FRACCIONES = new Set([
  "sumar-fracciones-igual-denominador",
  "simplificar-con-mcd",
  "minimo-comun-denominador",
  "comparar-con-producto-cruzado",
]);

// Mismo motivo que Fracciones: las lecciones de Álgebra (Fase EE2) no
// calzan en el motor de "a symbol b = ?" — la práctica real de despejar
// pasa en /practica/algebra, que tiene su propio motor de enunciados.
const SLUGS_ALGEBRA = new Set(["despejar-paso-a-paso", "que-es-una-variable", "verificar-sustituyendo"]);

const transicion = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

interface Props {
  nodo: NodoCaminoNumeria;
  desbloquea: { nombre: string; descripcion: string | null }[];
}

export default function LeccionClient({ nodo, desbloquea }: Props) {
  const t = useTranslations("Aprender.leccion");
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("explicacion");
  const [pasoIdx, setPasoIdx] = useState(0);
  const [problemaIdx, setProblemaIdx] = useState(0);
  const [problema, setProblema] = useState<Problem | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");

  const pasos = nodo.contenido.pasos;
  const esFraccion = SLUGS_FRACCIONES.has(nodo.slug);
  // Las Clases nuevas (Pro, con visuales animados) usan quiz en vez de la
  // práctica numérica de "a symbol b = ?" — mismo motivo que Fracciones y
  // Álgebra: no calzan en ese motor. Ver CuerpoVisual/REGISTRO_VISUALES_NUMERIA.
  const visuales = useMemo(() => visualesDeContenido(nodo.contenido.visuales), [nodo.contenido.visuales]);
  const esVisual = visuales.length > 0;
  const saltaPractica = esFraccion || SLUGS_ALGEBRA.has(nodo.slug) || esVisual;

  // Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): mismo patrón de quiz que
  // los otros 9 mundos — SOLO aparece cuando nodo.contenido.quiz tiene
  // preguntas. Cuando una lección tiene quiz, este reemplaza a la
  // práctica numérica de siempre como paso final: son las lecciones que
  // menos calzan en el motor de "a symbol b = ?" (geometría, técnicas
  // avanzadas de números grandes) las que más se benefician de un
  // chequeo de comprensión real en vez de un ejercicio genérico.
  const quiz = useMemo(() => nodo.contenido.quiz ?? [], [nodo.contenido.quiz]);
  const tieneQuiz = quiz.length > 0;

  const { completar, reintentar, estado: estadoGuardado, logros, incorrectas } = useCompletarLeccion({
    techniqueId: nodo.id,
    alCelebrar: () => setFase("celebracion"),
    alRechazar: () => setFase("quiz"),
    // Que el camino de Aprender se recalcule al volver (Router Cache de Next).
    alGuardar: () => router.refresh(),
  });

  // Pedido 2026-09-24: salir por el Header a mitad de una lección (ya
  // viste el ejemplo, estás practicando o en el quiz) pide confirmación —
  // en "explicacion" (recién abriste, nada que perder todavía) y en
  // "celebracion" (ya terminaste) no hace falta.
  useRegistrarGuardiaSalida({ activo: fase !== "explicacion" && fase !== "celebracion" });

  function empezarPractica() {
    setProblemaIdx(0);
    setProblema(generarProblemaTecnica(nodo.slug));
    setRespuesta("");
    setFeedback("idle");
    setFase("practica");
  }

  function handleResponder(e: React.FormEvent) {
    e.preventDefault();
    if (!problema || feedback !== "idle" || respuesta === "") return;
    const correct = Number(respuesta) === problema.answer;
    setFeedback(correct ? "correcto" : "incorrecto");
    setTimeout(() => {
      const siguiente = problemaIdx + 1;
      if (siguiente >= PROBLEMAS_PRACTICA) {
        completar();
      } else {
        setProblemaIdx(siguiente);
        setProblema(generarProblemaTecnica(nodo.slug));
        setRespuesta("");
        setFeedback("idle");
      }
    }, 700);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "explicacion" && (
          <motion.div key="explicacion" {...transicion} className="flex flex-col gap-6 text-center">
            <div>
              <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primario">
                {t("tecnica")}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
                {nodo.nombre}
              </h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <Boton onClick={() => setFase("ejemplo")}>{t("verElEjemplo")}</Boton>
          </motion.div>
        )}

        {fase === "ejemplo" && (
          <motion.div key="ejemplo" {...transicion} className="flex flex-col gap-6">
            {esVisual ? (
              <CuerpoVisual pasos={pasos} visuales={visuales} registro={REGISTRO_VISUALES_NUMERIA} />
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {pasos.map((paso, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border px-4 py-3 font-mono text-sm transition-all duration-300 ${
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
                  <Boton variante="secundario" atras onClick={() => setPasoIdx((p) => Math.max(0, p - 1))} disabled={pasoIdx === 0}>
                    {t("anterior")}
                  </Boton>
                  {pasoIdx < pasos.length - 1 ? (
                    <Boton className="flex-1" onClick={() => setPasoIdx((p) => Math.min(pasos.length - 1, p + 1))}>
                      {t("siguientePaso")}
                    </Boton>
                  ) : tieneQuiz ? (
                    <Boton className="flex-1" onClick={() => setFase("quiz")}>
                      {t("continuarAlQuiz")}
                    </Boton>
                  ) : saltaPractica ? (
                    <Boton className="flex-1" onClick={() => completar()}>
                      {t("marcarComoAprendida")}
                    </Boton>
                  ) : (
                    <Boton className="flex-1" onClick={empezarPractica}>
                      {t("practicar")}
                    </Boton>
                  )}
                </div>
              </>
            )}
            {esVisual && (
              <Boton onClick={() => (tieneQuiz ? setFase("quiz") : completar())}>
                {tieneQuiz ? t("continuarAlQuiz") : t("marcarComoAprendida")}
              </Boton>
            )}
          </motion.div>
        )}

        {fase === "practica" && problema && (
          <motion.div
            key={`practica-${problemaIdx}`}
            {...transicion}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex gap-1.5">
              {Array.from({ length: PROBLEMAS_PRACTICA }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-6 rounded-full ${i <= problemaIdx ? "bg-primario" : "bg-foreground/15"}`}
                />
              ))}
            </div>
            <div
              className={`flex w-full flex-col items-center gap-6 rounded-3xl border-2 bg-surface px-8 py-12 transition-colors ${
                feedback === "correcto"
                  ? "border-correcto"
                  : feedback === "incorrecto"
                    ? "border-error"
                    : "border-border"
              }`}
            >
              <span className="font-mono text-3xl font-bold text-foreground">
                {problema.a} <span className="text-primario">{problema.symbol}</span> {problema.b}
              </span>
              <form onSubmit={handleResponder} className="flex w-full gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  disabled={feedback !== "idle"}
                  autoFocus
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-xl font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={feedback !== "idle"}
                  className="rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white disabled:opacity-60"
                >
                  {t("ok")}
                </button>
              </form>
            </div>
            <button
              onClick={() => {
                setFase("ejemplo");
                setPasoIdx(0);
              }}
              className="text-sm text-foreground/50 underline-offset-2 hover:underline"
            >
              {t("teTrabaste")}
            </button>
          </motion.div>
        )}

        {fase === "quiz" && (
          <motion.div key="quiz" {...transicion}>
            <QuizLeccion
              quiz={quiz}
              titulo={t("quizTitulo")}
              subtitulo={t("quizSubtitulo")}
              incorrectasServidor={incorrectas}
              onTerminar={(r) => completar(r)}
            />
          </motion.div>
        )}

        {fase === "celebracion" && (
          <motion.div key="celebracion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <CelebracionLeccion
              titulo={t("completaste", { nombre: nodo.nombre })}
              logros={logros}
              estado={estadoGuardado}
              onReintentar={reintentar}
            >
              {desbloquea.length > 0 && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-texto-secundario">{t("desbloqueasteEnPracticar")}</p>
                  {desbloquea.map((m) => (
                    <span
                      key={m.nombre}
                      className="rounded-full bg-logro/15 px-4 py-1.5 text-sm font-medium text-foreground"
                    >
                      {m.nombre}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex w-full flex-col gap-3">
                <Boton atras onClick={() => router.push(hrefVolverAAprender("/aprender", nodo.requierePro))}>{t("volverAAprender")}</Boton>
                {/* Primero se elige la habilidad (tema) y recién ahí el sub-tema:
                    /practica/temas, no directo al selector de operaciones. */}
                <BotonEnlace href="/practica/temas" variante="secundario">
                  {t("irAPracticar")}
                </BotonEnlace>
              </div>
            </CelebracionLeccion>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
