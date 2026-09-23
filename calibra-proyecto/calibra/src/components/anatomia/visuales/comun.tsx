"use client";

import type { ReactNode, RefCallback } from "react";
import MathText from "@/components/MathText";
import { COLOR_ANATOMIA } from "@/app/[locale]/anatomia/colores";

export { COLOR_ANATOMIA };

// Marco común de los visuales de Anatomía: mismo patrón que
// src/components/enigmia/visuales/comun.tsx (figura accesible, alternativa
// textual sr-only, franja superior con el color del mundo). `nota` es una
// línea chica al pie para decir qué es el dibujo (esquema, no anatomía).
export function MarcoVisual({
  refCont,
  etiqueta,
  titulo,
  alternativa,
  children,
  controles,
  nota,
}: {
  refCont: RefCallback<HTMLElement>;
  etiqueta: string;
  titulo?: string;
  alternativa: ReactNode;
  children: ReactNode;
  controles?: ReactNode;
  nota?: string;
}) {
  return (
    <figure
      ref={refCont}
      role="group"
      aria-label={etiqueta}
      className="flex w-full flex-col gap-3 overflow-x-hidden rounded-2xl border border-border bg-surface p-3 text-foreground"
      style={{ borderTopColor: COLOR_ANATOMIA, borderTopWidth: 3 }}
    >
      {titulo && (
        <p className="text-center text-sm font-semibold text-foreground">
          <MathText texto={titulo} />
        </p>
      )}
      <div aria-hidden="true" className="flex min-w-0 flex-col items-stretch gap-3">
        {children}
      </div>
      {nota && (
        <p aria-hidden="true" className="text-center text-[11px] leading-snug text-texto-secundario">
          {nota}
        </p>
      )}
      <figcaption className="sr-only">{alternativa}</figcaption>
      {controles}
    </figure>
  );
}

// Fondo de acento suave reutilizado por los cuatro visuales.
export const fondoAcento = (pct: number) => `color-mix(in oklab, ${COLOR_ANATOMIA} ${pct}%, var(--surface))`;
