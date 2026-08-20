"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { NodoCaminoQuimia } from "@/lib/quimia/path";
import type { Achievement } from "@/types/database";
import LogroBanner from "@/components/LogroBanner";
import { COLOR_QUIMIA } from "../../colores";

type Fase = "explicacion" | "ejemplo" | "celebracion";

const transicion = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

interface Props {
  nodo: NodoCaminoQuimia;
}

// Lecciones mnemotécnicas, no de cómputo — mismo patrón exacto que
// LeccionGeografiaClient.tsx.
export default function LeccionQuimiaClient({ nodo }: Props) {
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
      // Si falla el guardado, igual mostramos la celebración.
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
                style={{ background: `color-mix(in oklab, ${COLOR_QUIMIA} 12%, transparent)`, color: COLOR_QUIMIA }}
              >
                Técnica
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{nodo.nombre}</h1>
              <p className="mt-2 text-texto-secundario">{nodo.descripcion}</p>
            </div>
            <button
              onClick={() => setFase("ejemplo")}
              className="rounded-xl px-4 py-3 font-display font-semibold text-white shadow-lg"
              style={{ background: `linear-gradient(120deg, ${COLOR_QUIMIA}, #A794FF)` }}
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
                  style={{ background: COLOR_QUIMIA }}
                >
                  Siguiente paso
                </button>
              ) : (
                <button
                  onClick={completarLeccion}
                  className="flex-1 rounded-xl px-4 py-3 font-display font-semibold text-white"
                  style={{ background: COLOR_QUIMIA }}
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
                onClick={() => router.push("/quimia/aprender")}
                className="rounded-xl px-4 py-3 font-display font-semibold text-white"
                style={{ background: COLOR_QUIMIA }}
              >
                Volver a Aprender
              </button>
              <Link href="/quimia/practica" className="text-sm font-medium hover:underline" style={{ color: COLOR_QUIMIA }}>
                Ir a Practicar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
