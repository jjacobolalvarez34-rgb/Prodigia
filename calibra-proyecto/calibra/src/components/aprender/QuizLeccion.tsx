"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { TechniqueQuizPregunta } from "@/types/database";
import { cuantasBien, estadoPregunta, quizListoParaEnviar } from "@/lib/aprender/calificarQuiz";
import { reproducirTono } from "@/lib/sonido";
import MathText from "@/components/MathText";
import Boton from "@/components/Boton";

interface Props {
  quiz: TechniqueQuizPregunta[];
  titulo: string;
  subtitulo: string;
  // Acento del mundo (sin esto, el violeta de marca).
  colorHex?: string;
  // Preguntas que el servidor rechazó (raro: contenido desfasado). Se vuelven a abrir.
  incorrectasServidor?: number[] | null;
  onTerminar: (respuestas: string[]) => void;
}

// Quiz de una Técnica o Clase con calificación al momento
// (docs/avance/CLASES_CALIFICACION.md): cada pregunta dice enseguida si está
// bien o mal, con la explicación si la tiene; las mal respondidas se pueden
// corregir (la opción errada queda tachada) y se envía cuando todo está bien.
export default function QuizLeccion({ quiz, titulo, subtitulo, colorHex, incorrectasServidor, onTerminar }: Props) {
  const t = useTranslations("LeccionQuiz");
  const [respuestas, setRespuestas] = useState<string[]>(() => quiz.map(() => ""));
  const [descartadas, setDescartadas] = useState<string[][]>(() => quiz.map(() => []));
  const [rechazadas, setRechazadas] = useState<number[]>([]);

  // Si el servidor rechaza alguna, se reabre para responderla de nuevo
  // (ajuste de estado durante el render, sin efecto).
  const [rechazoVisto, setRechazoVisto] = useState(incorrectasServidor);
  if (incorrectasServidor !== rechazoVisto) {
    setRechazoVisto(incorrectasServidor);
    if (incorrectasServidor && incorrectasServidor.length > 0) {
      setRechazadas(incorrectasServidor);
      setRespuestas((prev) => prev.map((r, i) => (incorrectasServidor.includes(i) ? "" : r)));
    }
  }

  const bien = cuantasBien(quiz, respuestas);
  const listo = quizListoParaEnviar(quiz, respuestas) && rechazadas.every((i) => respuestas[i]);
  const acento = colorHex ?? "var(--primario)";

  function elegir(qi: number, opcion: string) {
    const actual = estadoPregunta(quiz[qi], respuestas[qi]);
    if (actual === "bien") return;
    const nuevo = estadoPregunta(quiz[qi], opcion);
    setRespuestas((prev) => prev.map((v, i) => (i === qi ? opcion : v)));
    setRechazadas((prev) => prev.filter((i) => i !== qi));
    if (nuevo === "mal") {
      setDescartadas((prev) => prev.map((d, i) => (i === qi && !d.includes(opcion) ? [...d, opcion] : d)));
      reproducirTono("error");
    } else if (nuevo === "bien") {
      reproducirTono("correcto");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">{titulo}</h1>
        <p className="mt-1 text-sm text-texto-secundario">{subtitulo}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: acento }}
              initial={false}
              animate={{ width: `${quiz.length ? (bien / quiz.length) * 100 : 0}%` }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-texto-secundario">
            {t("progreso", { bien, total: quiz.length })}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {quiz.map((pregunta, qi) => {
          const estado = estadoPregunta(pregunta, respuestas[qi]);
          const rechazada = rechazadas.includes(qi);
          const cerrada = estado === "bien";
          return (
            <div
              key={qi}
              className={`flex flex-col gap-2 rounded-xl border bg-surface p-4 transition-colors duration-300 ${
                estado === "bien" ? "border-correcto/60" : estado === "mal" || rechazada ? "border-error/60" : "border-border"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">
                {qi + 1}. <MathText texto={pregunta.pregunta} />
              </p>
              <div className="flex flex-col gap-2">
                {pregunta.opciones.map((opcion) => {
                  const elegida = respuestas[qi] === opcion;
                  const descartada = descartadas[qi]?.includes(opcion) && !elegida;
                  const clase =
                    elegida && estado === "bien"
                      ? "border-correcto bg-correcto/10 text-foreground"
                      : elegida && estado === "mal"
                        ? "border-error bg-error/10 text-error"
                        : elegida
                          ? "border-logro/50 bg-logro/10 text-foreground"
                          : descartada
                            ? "border-border bg-background text-foreground/40 line-through"
                            : cerrada
                              ? "border-border bg-background text-foreground/50"
                              : "border-border bg-background text-foreground hover:border-foreground/30";
                  return (
                    <motion.button
                      key={opcion}
                      type="button"
                      disabled={cerrada}
                      aria-pressed={elegida}
                      onClick={() => elegir(qi, opcion)}
                      animate={elegida && estado === "mal" ? { x: [0, -6, 6, -4, 4, 0] } : elegida && estado === "bien" ? { scale: [1, 1.03, 1] } : {}}
                      transition={{ duration: 0.35 }}
                      className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-default ${clase}`}
                    >
                      <span>
                        <MathText texto={opcion} />
                      </span>
                      {elegida && estado === "bien" && <MarcaCorrecta />}
                      {elegida && estado === "mal" && <MarcaIncorrecta />}
                    </motion.button>
                  );
                })}
              </div>
              <AnimatePresence initial={false} mode="wait">
                {(estado === "bien" || estado === "mal" || rechazada) && (
                  <motion.p
                    key={rechazada && estado === "sin-responder" ? "rechazada" : estado}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    aria-live="polite"
                    className={`text-xs font-medium ${estado === "bien" ? "text-correcto" : "text-error"}`}
                  >
                    {estado === "bien" ? t("bien") : estado === "mal" ? t("mal") : t("revisala")}
                    {pregunta.explicacion && estado !== "sin-responder" ? (
                      <span className="font-normal text-texto-secundario">
                        {" "}
                        <MathText texto={pregunta.explicacion} />
                      </span>
                    ) : null}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <Boton className="w-full" colorHex={colorHex} onClick={() => onTerminar(respuestas)} disabled={!listo}>
        {listo ? t("terminar") : t("faltan", { faltan: quiz.length - bien })}
      </Boton>
    </div>
  );
}

function MarcaCorrecta() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-correcto" aria-hidden="true">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
}

function MarcaIncorrecta() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-error" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
