"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCamino } from "@/lib/aprender/path";
import { generarProblemaTecnica, type Problem } from "@/lib/practica/problems";
import type { Achievement } from "@/types/database";
import LogroBanner from "@/components/LogroBanner";
import Boton from "@/components/Boton";

type Fase = "explicacion" | "ejemplo" | "practica" | "celebracion";

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
  nodo: NodoCamino;
  desbloquea: { nombre: string; descripcion: string | null }[];
}

export default function LeccionClient({ nodo, desbloquea }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("explicacion");
  const [pasoIdx, setPasoIdx] = useState(0);
  const [problemaIdx, setProblemaIdx] = useState(0);
  const [problema, setProblema] = useState<Problem | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [logrosNuevos, setLogrosNuevos] = useState<Achievement[]>([]);

  const pasos = nodo.contenido.pasos;
  const esFraccion = SLUGS_FRACCIONES.has(nodo.slug);
  const saltaPractica = esFraccion || SLUGS_ALGEBRA.has(nodo.slug);

  function empezarPractica() {
    setProblemaIdx(0);
    setProblema(generarProblemaTecnica(nodo.slug));
    setRespuesta("");
    setFeedback("idle");
    setFase("practica");
  }

  async function completarLeccion() {
    try {
      const res = await fetch("/api/aprender/completar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technique_id: nodo.id }),
      });
      const data = await res.json();
      if (Array.isArray(data.logrosNuevos)) setLogrosNuevos(data.logrosNuevos);
    } catch {
      // Si falla el guardado, igual mostramos la celebración: no vale la
      // pena trabar al usuario por un error de red puntual acá.
    }
    setFase("celebracion");
  }

  function handleResponder(e: React.FormEvent) {
    e.preventDefault();
    if (!problema || feedback !== "idle" || respuesta === "") return;
    const correct = Number(respuesta) === problema.answer;
    setFeedback(correct ? "correcto" : "incorrecto");
    setTimeout(() => {
      const siguiente = problemaIdx + 1;
      if (siguiente >= PROBLEMAS_PRACTICA) {
        completarLeccion();
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
                Técnica
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
                {nodo.nombre}
              </h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <Boton onClick={() => setFase("ejemplo")}>Ver el ejemplo</Boton>
          </motion.div>
        )}

        {fase === "ejemplo" && (
          <motion.div key="ejemplo" {...transicion} className="flex flex-col gap-6">
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
                  {paso}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Boton variante="secundario" onClick={() => setPasoIdx((p) => Math.max(0, p - 1))} disabled={pasoIdx === 0}>
                Anterior
              </Boton>
              {pasoIdx < pasos.length - 1 ? (
                <Boton className="flex-1" onClick={() => setPasoIdx((p) => Math.min(pasos.length - 1, p + 1))}>
                  Siguiente paso
                </Boton>
              ) : saltaPractica ? (
                <Boton className="flex-1" onClick={completarLeccion}>
                  Marcar como aprendida
                </Boton>
              ) : (
                <Boton className="flex-1" onClick={empezarPractica}>
                  Practicar
                </Boton>
              )}
            </div>
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
                  Ok
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
              ¿Te trabaste? Ver el ejemplo de nuevo
            </button>
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
              ¡Completaste {nodo.nombre}!
            </h1>
            {desbloquea.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-texto-secundario">Desbloqueaste en Practicar:</p>
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
            <LogroBanner logros={logrosNuevos} />
            <div className="mt-2 flex w-full flex-col gap-3">
              <Boton onClick={() => router.push("/aprender")}>Volver a Aprender</Boton>
              <Link
                href={esFraccion ? "/practica/fracciones" : SLUGS_ALGEBRA.has(nodo.slug) ? "/practica/algebra" : "/practica"}
                className="text-sm font-medium text-primario hover:underline"
              >
                Ir a Practicar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
