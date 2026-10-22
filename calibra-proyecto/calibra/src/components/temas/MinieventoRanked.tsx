"use client";

import type { CSSProperties } from "react";
import { useTemaHoy } from "./useTemaHoy";
import { celebracionDe } from "@/lib/temas/celebracion";

// Minievento de la fecha en las Rankeds (celebracion.ts; los premios los da la base, 0292).
export default function MinieventoRanked() {
  const tema = useTemaHoy();
  const m = celebracionDe(tema)?.ranked;
  if (!tema || !m) return null;
  return (
    <div className="mt-6 rounded-2xl border-2 bg-surface px-5 py-4" style={{ borderColor: tema.tema.acento, background: `linear-gradient(120deg, ${tema.tema.acento}22, transparent 70%)` }}>
      <p className="texto-acento font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ "--acento": tema.tema.acento } as CSSProperties}>
        Minievento de Rankeds
      </p>
      <p className="font-display text-lg font-bold text-foreground">{m.nombre}</p>
      <p className="text-sm text-texto-secundario">{m.texto}</p>
    </div>
  );
}
