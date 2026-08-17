"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCaminoEnigmia } from "@/lib/enigmia/path";
import type { Achievement } from "@/types/database";
import LogroBanner from "@/components/LogroBanner";

type Fase = "explicacion" | "ejemplo" | "celebracion";

const COLOR = "#0E9F6E";

const transicion = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

interface Props {
  nodo: NodoCaminoEnigmia;
}

export default function LeccionEnigmiaClient({ nodo }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("explicacion");
  const [pasoIdx, setPasoIdx] = useState(0);
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [logrosNuevos, setLogrosNuevos] = useState<Achievement[]>([]);

  const pasos = nodo.contenido.pasos;
  const ejemplo = nodo.contenido.ejemplo;

  async function completar() {
    try {
      const res = await fetch("/api/enigmia/completar-leccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technique_id: nodo.id }),
      });
      const data = await res.json();
      if (Array.isArray(data.logrosNuevos)) setLogrosNuevos(data.logrosNuevos);
    } catch {
      // No vale la pena trabar la celebración por un error de red puntual.
    }
    setFase("celebracion");
  }

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
                Técnica
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{nodo.nombre}</h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <button
              onClick={() => setFase("ejemplo")}
              className="rounded-xl px-4 py-3 font-display font-semibold text-white shadow-lg"
              style={{ background: `linear-gradient(120deg, ${COLOR}, #3FB88B)` }}
            >
              Ver el ejemplo
            </button>
          </motion.div>
        )}

        {fase === "ejemplo" && (
          <motion.div key="ejemplo" {...transicion} className="flex flex-col gap-6">
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
                  {paso}
                </div>
              ))}
            </div>

            {pasoIdx >= pasos.length - 1 && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-surface px-6 py-8">
                <p className="text-center text-sm font-medium text-foreground">{ejemplo.enunciado}</p>
                <div className="grid w-full grid-cols-2 gap-2">
                  {ejemplo.opciones.map((op) => {
                    const esCorrecta = respuesta !== null && op === ejemplo.respuesta;
                    const esElegida = respuesta === op;
                    return (
                      <button
                        key={op}
                        onClick={() => setRespuesta(op)}
                        disabled={respuesta !== null}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-100 ${
                          esCorrecta
                            ? "border-correcto bg-correcto/10 text-correcto"
                            : esElegida
                              ? "border-error bg-error/10 text-error"
                              : "border-border bg-background text-foreground"
                        }`}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setPasoIdx((p) => Math.max(0, p - 1))}
                disabled={pasoIdx === 0}
                className="rounded-xl border border-border px-4 py-3 font-medium text-foreground disabled:opacity-40"
              >
                Anterior
              </button>
              {pasoIdx < pasos.length - 1 ? (
                <button
                  onClick={() => setPasoIdx((p) => Math.min(pasos.length - 1, p + 1))}
                  className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: COLOR }}
                >
                  Siguiente paso
                </button>
              ) : (
                <button
                  onClick={completar}
                  disabled={respuesta === null}
                  className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white disabled:opacity-40"
                  style={{ background: COLOR }}
                >
                  Listo
                </button>
              )}
            </div>
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
            <LogroBanner logros={logrosNuevos} />
            <button
              onClick={() => router.push("/enigmia/aprender")}
              className="mt-2 w-full rounded-xl px-4 py-3 font-display font-semibold text-white"
              style={{ background: COLOR }}
            >
              Volver a Aprender
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
