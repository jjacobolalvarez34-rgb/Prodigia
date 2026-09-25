"use client";

import type { ReactNode, RefCallback } from "react";
import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import type { TipoFallo } from "@/lib/codia/interprete";
import { COLOR_CODIA } from "@/app/[locale]/codia/colores";

export { COLOR_CODIA };

// Marco común de los visuales de Codia: mismo patrón que
// src/components/trigonometria/visuales/comun.tsx (figura accesible,
// alternativa textual sr-only, franja superior con el color del mundo).
// Todo el dibujo va en aria-hidden: lo que lee un lector de pantalla es
// la alternativa textual.
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
      className="flex w-full flex-col gap-3 overflow-x-hidden rounded-2xl border border-border bg-surface p-3 text-foreground [font-variant-ligatures:none]"
      style={{ borderTopColor: COLOR_CODIA, borderTopWidth: 3 }}
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
export function Leyenda({ children, acento = COLOR_CODIA }: { children: ReactNode; acento?: string }) {
  return (
    <div
      className="min-h-[3.25rem] rounded-xl border px-3 py-2 text-[13px] leading-snug text-foreground"
      style={{ borderColor: acento, background: `color-mix(in oklab, ${acento} 9%, var(--surface))` }}
    >
      {children}
    </div>
  );
}

// "Error: ZeroDivisionError (división por cero)" o, si no hay un nombre
// verificado para ese lenguaje, solo la descripción general.
export function useTextoError(): (fallo: TipoFallo, nombre: string | null) => string {
  const t = useTranslations("Codia.visuales");
  return (fallo, nombre) => {
    const descripcion = t(`fallos.${fallo}`);
    return t("error", { detalle: nombre ? `${nombre} (${descripcion})` : descripcion });
  };
}
