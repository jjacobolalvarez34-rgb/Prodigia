"use client";

import type { ReactNode, RefCallback } from "react";
import { useLocale } from "next-intl";
import MathText from "@/components/MathText";
import { COLOR_HISTORIA } from "@/app/[locale]/historia/colores";
import type { EpocaId } from "@/lib/historia/tipos";

export { COLOR_HISTORIA };

// Un color por época (contraste suficiente sobre fondo claro y oscuro).
export const COLOR_EPOCA: Record<EpocaId, string> = {
  prehistoria: "#78716C",
  antiguedad: "#D97706",
  "edad-media": "#7C3AED",
  "edad-moderna": "#0D9488",
  contemporanea: "#2563EB",
};

export function useIdioma(): "es" | "en" {
  return useLocale() === "en" ? "en" : "es";
}

// Marco común de los visuales de Historia: mismo patrón que
// src/components/trigonometria/visuales/comun.tsx (figura accesible, alternativa
// textual sr-only, franja superior con el color del mundo). Todo el dibujo va en
// aria-hidden: lo que lee un lector de pantalla es la alternativa textual.
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
      style={{ borderTopColor: COLOR_HISTORIA, borderTopWidth: 3 }}
    >
      {titulo && (
        <p className="text-center text-sm font-semibold text-foreground">
          <MathText texto={titulo} />
        </p>
      )}
      <div aria-hidden="true" className="flex min-w-0 flex-col items-stretch gap-3">
        {children}
      </div>
      <figcaption className="sr-only">{alternativa}</figcaption>
      {controles}
    </figure>
  );
}

// Tarjeta con el texto del paso actual.
export function Leyenda({ children, acento = COLOR_HISTORIA }: { children: ReactNode; acento?: string }) {
  return (
    <div
      className="min-h-[3.25rem] rounded-xl border px-3 py-2 text-[13px] leading-snug text-foreground"
      style={{ borderColor: acento, background: `color-mix(in oklab, ${acento} 9%, var(--surface))` }}
    >
      {children}
    </div>
  );
}

// Transición CSS que se apaga con «reducir movimiento».
export const transicion = (reducir: boolean, propiedad: string, ms = 450, retardo = 0): string =>
  reducir ? "none" : `${propiedad} ${ms}ms ease-in-out ${retardo}ms`;
