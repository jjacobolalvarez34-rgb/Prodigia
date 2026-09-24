"use client";

import type { ReactNode, RefCallback } from "react";
import { useLocale } from "next-intl";
import MathText from "@/components/MathText";
import { COLOR_TRIGONOMETRIA } from "@/app/[locale]/trigonometria/colores";
import type { Decimal } from "@/lib/trigonometria/formato";

export { COLOR_TRIGONOMETRIA };

// Colores de los visuales (mismos que el truco de la mano: seno azul, coseno naranja).
export const COLOR_SENO = "#3B82F6";
export const COLOR_COSENO = "#F59E0B";
export const COLOR_TANGENTE = "#EC4899";
export const COLOR_HIPOTENUSA = "#8B5CF6";
export const COLOR_ALERTA = "#EF4444";

// Separador decimal de los textos que arman las funciones de datos.
export function useSeparadorDecimal(): Decimal {
  return useLocale() === "en" ? "." : ",";
}

// Marco común de los visuales de Trigonometría: mismo patrón que
// src/components/anatomia/visuales/comun.tsx (figura accesible, alternativa
// textual sr-only, franja superior con el color del mundo). Todo el dibujo va
// en aria-hidden: lo que lee un lector de pantalla es la alternativa textual.
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
      style={{ borderTopColor: COLOR_TRIGONOMETRIA, borderTopWidth: 3 }}
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

// Tarjeta con el texto del paso actual (admite $...$).
export function Leyenda({ children, acento = COLOR_TRIGONOMETRIA }: { children: ReactNode; acento?: string }) {
  return (
    <div
      className="min-h-[3.25rem] rounded-xl border px-3 py-2 text-[13px] leading-snug text-foreground"
      style={{ borderColor: acento, background: `color-mix(in oklab, ${acento} 9%, var(--surface))` }}
    >
      {children}
    </div>
  );
}

// Fórmula centrada y grande (LaTeX SIN los $). Se puede desplazar en horizontal si no cabe.
export function Formula({ tex, tamano = "text-base" }: { tex: string; tamano?: string }) {
  return (
    <div className={`overflow-x-auto py-0.5 text-center ${tamano} text-foreground`}>
      <MathText texto={`$${tex.replace(/\$/g, "")}$`} />
    </div>
  );
}

// Transición CSS que se apaga con "reducir movimiento".
export const transicion = (reducir: boolean, propiedad: string, ms = 450, retardo = 0): string =>
  reducir ? "none" : `${propiedad} ${ms}ms ease-in-out ${retardo}ms`;
