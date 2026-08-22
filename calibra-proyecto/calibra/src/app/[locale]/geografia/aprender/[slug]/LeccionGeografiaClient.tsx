"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCaminoGeografia } from "@/lib/geografia/path";
import type { Achievement } from "@/types/database";
import LogroBanner from "@/components/LogroBanner";
import { COLOR_GEOGRAFIA } from "../../GeografiaMapa";

type Fase = "explicacion" | "ejemplo" | "celebracion";

const transicion = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

interface Props {
  nodo: NodoCaminoGeografia;
}

// Las lecciones de Geografía son mnemotécnicas, no de cómputo — no hay
// una "práctica guiada" numérica que tenga sentido acá (esa práctica ya
// existe en el mapa real de /geografia/practica). El flujo es
// explicación -> pasos -> marcar como aprendida, mismo patrón que usan
// las lecciones de Fracciones para los slugs sin motor de una sola
// respuesta.
export default function LeccionGeografiaClient({ nodo }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("explicacion");
  const [pasoIdx, setPasoIdx] = useState(0);
  const [logrosNuevos, setLogrosNuevos] = useState<Achievement[]>([]);

  const pasos = nodo.contenido.pasos;

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
                Técnica
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{nodo.nombre}</h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <button
              onClick={() => setFase("ejemplo")}
              className="rounded-xl px-4 py-3 font-display font-semibold text-white shadow-lg"
              style={{ background: `linear-gradient(120deg, ${COLOR_GEOGRAFIA}, #3FB88B)` }}
            >
              Ver el truco
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
                  style={{ background: COLOR_GEOGRAFIA }}
                >
                  Siguiente paso
                </button>
              ) : (
                <button
                  onClick={completarLeccion}
                  className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: COLOR_GEOGRAFIA }}
                >
                  Marcar como aprendida
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
            <div className="mt-2 flex w-full flex-col gap-3">
              <button
                onClick={() => router.push("/geografia/aprender")}
                className="rounded-xl px-4 py-3 font-display font-semibold text-white"
                style={{ background: COLOR_GEOGRAFIA }}
              >
                Volver a Aprender
              </button>
              <Link href="/geografia/practica" className="text-sm font-medium hover:underline" style={{ color: COLOR_GEOGRAFIA }}>
                Ir a Practicar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
