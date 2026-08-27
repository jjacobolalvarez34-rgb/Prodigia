"use client";

import { useEffect } from "react";
import { frecuenciaDeNota, type NotaMusical } from "@/lib/practica/melodia";
import { reproducirNotaMusical } from "@/lib/sonido";

interface Props {
  nota: NotaMusical;
  colorHex?: string;
}

// Fase 7 (Melodía, "oído absoluto"): reproduce la nota automáticamente
// al aparecer la pregunta, y deja re-escucharla las veces que haga
// falta con el mismo botón — nunca se ve el pentagrama (sería trampa,
// el modo es de oído).
export default function BotonEscucharNota({ nota, colorHex = "#B8860B" }: Props) {
  useEffect(() => {
    reproducirNotaMusical(frecuenciaDeNota(nota));
  }, [nota]);

  return (
    <button
      type="button"
      onClick={() => reproducirNotaMusical(frecuenciaDeNota(nota))}
      className="flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white shadow-lg transition-transform active:scale-95"
      style={{ background: colorHex }}
      aria-label="Escuchar la nota otra vez"
    >
      🔊
    </button>
  );
}
