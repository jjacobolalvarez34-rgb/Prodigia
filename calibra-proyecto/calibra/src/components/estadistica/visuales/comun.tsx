"use client";

import { useLocale } from "next-intl";
import type { CSSProperties, ReactNode, RefCallback } from "react";
import { COLOR_ESTADISTICA } from "@/app/[locale]/estadistica/colores";
import MathText from "@/components/MathText";

export { COLOR_ESTADISTICA };

// Números con la coma o el punto del idioma ("2,5" / "2.5") y el signo
// menos tipográfico (U+2212) para los negativos — mismo criterio que
// useNumero() de Naipia.
export function useNumero() {
  const locale = useLocale();
  return (n: number) => {
    const texto = Math.abs(n).toLocaleString(locale, { maximumFractionDigits: 2 });
    return n < 0 ? `−${texto}` : texto;
  };
}

export function signo(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}

// Estilo de resaltado: `activo` usa el acento del mundo, `neutro` el
// estilo por defecto de una ficha. El color nunca es lo único que
// distingue: el texto/label siempre lo dice también.
export function estiloFicha(activo: boolean): CSSProperties {
  if (!activo) return { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" };
  return {
    background: `color-mix(in oklab, ${COLOR_ESTADISTICA} 16%, var(--surface))`,
    borderColor: COLOR_ESTADISTICA,
    color: "var(--foreground)",
  };
}

// Color por signo de una desviación: +valor verde (por encima del
// centro), 0 gris (justo en el centro), −valor rojo (por debajo). El
// signo siempre está escrito en la ficha: el color nunca es lo único que
// distingue.
export function estiloDesvio(valor: number): CSSProperties {
  if (valor === 0) return { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" };
  const base = valor > 0 ? "var(--correcto)" : "var(--error)";
  return { background: `color-mix(in oklab, ${base} 22%, var(--surface))`, borderColor: base, color: "var(--foreground)" };
}

// Marco común: figura accesible con título opcional, contenido visual
// oculto a lectores de pantalla (aria-hidden) y una alternativa textual
// equivalente en <figcaption> sr-only. Mismo patrón que MarcoVisual de
// Naipia/Trigonometría.
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
      style={{ borderTopColor: COLOR_ESTADISTICA, borderTopWidth: 3 }}
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
