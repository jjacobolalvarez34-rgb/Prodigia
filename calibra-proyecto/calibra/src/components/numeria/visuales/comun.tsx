"use client";

import { motion } from "framer-motion";
import type { ReactNode, RefCallback } from "react";
import MathText from "@/components/MathText";

// Violeta de Numeria (mismo valor que AprenderShell.tsx / numeria/page.tsx).
export const COLOR_NUMERIA = "#6C4CF1";

// Un dígito en su casillero del tablero de columnas. `activo` resalta la
// columna que se está procesando ahora mismo; `chico` es para las cifras
// de acarreo/préstamo que van arriba/abajo de la fila principal.
export function CasillaDigito({
  valor,
  activo = false,
  chico = false,
  tachado = false,
}: {
  valor: number | string;
  activo?: boolean;
  chico?: boolean;
  tachado?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border font-mono font-bold tabular-nums transition-colors ${
        chico ? "h-5 min-w-5 text-[11px]" : "h-10 min-w-10 text-lg"
      } ${tachado ? "line-through opacity-50" : ""}`}
      style={
        activo
          ? { borderColor: COLOR_NUMERIA, background: `color-mix(in oklab, ${COLOR_NUMERIA} 16%, var(--surface))`, color: "var(--foreground)" }
          : { borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }
      }
    >
      {valor}
    </span>
  );
}

// Marco común de los visuales de Numeria: mismo patrón que
// src/components/naipia/visuales/comun.tsx (figura accesible, alternativa
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
      style={{ borderTopColor: COLOR_NUMERIA, borderTopWidth: 3 }}
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

// Etiqueta pequeña "= 12" / "resto 1" al pie de un paso.
export function Resaltado({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-sm font-semibold"
      style={{ background: `color-mix(in oklab, ${COLOR_NUMERIA} 14%, transparent)`, color: COLOR_NUMERIA }}
    >
      {children}
    </span>
  );
}

export function animarEntrada(reducir: boolean) {
  return reducir
    ? { initial: false as const }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } };
}

export { motion };
