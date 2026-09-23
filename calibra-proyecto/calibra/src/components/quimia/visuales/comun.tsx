"use client";

import { motion } from "framer-motion";
import type { ReactNode, RefCallback } from "react";
import MathText from "@/components/MathText";
import { COLOR_QUIMIA } from "@/app/[locale]/quimia/colores";

// Marco común de los visuales de Quimia: mismo patrón que
// src/components/enigmia/visuales/comun.tsx (figura accesible, alternativa
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
      style={{ borderTopColor: COLOR_QUIMIA, borderTopWidth: 3 }}
    >
      {titulo && (
        <p className="text-center text-sm font-semibold text-foreground">
          <MathText texto={titulo} />
        </p>
      )}
      <div aria-hidden="true" className="flex flex-col items-center gap-3">
        {children}
      </div>
      <figcaption className="sr-only">{alternativa}</figcaption>
      {controles}
    </figure>
  );
}

// Caja con el texto del paso actual (admite $...$).
export function TextoDelPaso({ children }: { children: ReactNode }) {
  return (
    <p
      className="w-full rounded-xl border px-3 py-2 text-center text-sm leading-relaxed text-foreground"
      style={{ borderColor: `color-mix(in oklab, ${COLOR_QUIMIA} 35%, transparent)`, background: `color-mix(in oklab, ${COLOR_QUIMIA} 8%, var(--surface))` }}
    >
      {children}
    </p>
  );
}

export { motion, COLOR_QUIMIA };
