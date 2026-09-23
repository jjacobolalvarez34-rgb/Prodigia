"use client";

import { motion } from "framer-motion";
import type { ReactNode, RefCallback } from "react";
import MathText from "@/components/MathText";

// Verde de Enigmia (mismo valor que src/lib/enigmia/path.ts / la página de
// Aprender de Enigmia y LeccionEnigmiaClient.tsx).
export const COLOR_ENIGMIA = "#0E9F6E";

// Marco común de los visuales de Enigmia: mismo patrón que
// src/components/numeria/visuales/comun.tsx (figura accesible, alternativa
// textual sr-only, franja superior con el color del mundo).
export function MarcoVisual({
  refCont,
  etiqueta,
  titulo,
  alternativa,
  children,
  controles,
}: {
  refCont: RefCallback<HTMLElement>;
  etiqueta: string;
  titulo?: string;
  alternativa: ReactNode;
  children: ReactNode;
  controles?: ReactNode;
}) {
  return (
    <figure
      ref={refCont}
      role="group"
      aria-label={etiqueta}
      className="flex w-full flex-col gap-3 overflow-x-hidden rounded-2xl border border-border bg-surface p-3 text-foreground"
      style={{ borderTopColor: COLOR_ENIGMIA, borderTopWidth: 3 }}
    >
      {titulo && (
        <p className="text-center text-sm font-semibold text-foreground">
          <MathText texto={titulo} />
        </p>
      )}
      <div aria-hidden="true" className="flex flex-col items-center gap-3 overflow-x-auto">
        {children}
      </div>
      <figcaption className="sr-only">{alternativa}</figcaption>
      {controles}
    </figure>
  );
}

// Casillero para un término/letra/dígito individual.
export function Casilla({ valor, activo = false, chico = false }: { valor: string | number; activo?: boolean; chico?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border font-mono font-bold tabular-nums transition-colors ${
        chico ? "h-8 min-w-8 text-sm" : "h-11 min-w-11 text-lg"
      }`}
      style={
        activo
          ? { borderColor: COLOR_ENIGMIA, background: `color-mix(in oklab, ${COLOR_ENIGMIA} 16%, var(--surface))`, color: "var(--foreground)" }
          : { borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }
      }
    >
      {valor}
    </span>
  );
}

// Etiqueta pequeña "+4" / "×3" / "= 21" al pie de un paso.
export function Resaltado({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-sm font-semibold"
      style={{ background: `color-mix(in oklab, ${COLOR_ENIGMIA} 14%, transparent)`, color: COLOR_ENIGMIA }}
    >
      {children}
    </span>
  );
}

export { motion };
