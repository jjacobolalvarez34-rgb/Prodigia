"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import type { CSSProperties, ReactNode, RefCallback } from "react";
import type { Carta, Palo, ValorCarta } from "@/lib/practica/naipia";
import { COLOR_NAIPIA } from "@/app/[locale]/naipia/colores";
import MathText from "@/components/MathText";

export { COLOR_NAIPIA };

// El signo menos tipográfico (U+2212): "−1", no "-1".
export function signo(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}

// Decimales con la coma o el punto del idioma ("2,5" / "2.5") y el signo
// menos tipográfico para los negativos.
export function useNumero() {
  const locale = useLocale();
  return (n: number) => {
    const texto = Math.abs(n).toLocaleString(locale, { maximumFractionDigits: 2 });
    return n < 0 ? `−${texto}` : texto;
  };
}

// Colores por valor con los tokens del proyecto: +valor verde (correcto),
// 0 gris, −valor rojo (error). El signo siempre está escrito en el chip:
// el color nunca es lo único que distingue.
export function estiloValor(valor: number): CSSProperties {
  if (valor === 0) {
    return { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" };
  }
  const base = valor > 0 ? "var(--correcto)" : "var(--error)";
  const fuerza = Math.abs(valor) >= 2 ? 48 : 26;
  return {
    background: `color-mix(in oklab, ${base} ${fuerza}%, var(--surface))`,
    borderColor: base,
    color: "var(--foreground)",
  };
}

export function ChipValor({ valor, grande = false }: { valor: number; grande?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border font-mono font-bold tabular-nums ${
        grande ? "min-w-10 px-2 py-1 text-base" : "min-w-8 px-1.5 py-0.5 text-xs"
      } ${Math.abs(valor) >= 2 ? "border-2" : ""}`}
      style={estiloValor(valor)}
    >
      {signo(valor)}
    </span>
  );
}

const PALOS_ROTATIVOS: Palo[] = ["picas", "corazones", "treboles", "diamantes"];

// Una carta por rango (para dibujar los grupos de la tabla de valores);
// los palos rotan para que la fila se vea natural.
export function cartaDeRango(valor: ValorCarta, indice: number): Carta {
  return { valor, palo: PALOS_ROTATIVOS[indice % PALOS_ROTATIVOS.length] };
}

// Marcador del conteo: el número cambia con una transición corta.
export function Marcador({ etiqueta, valor, texto }: { etiqueta: string; valor: number; texto?: string }) {
  const color = valor > 0 ? "var(--correcto)" : valor < 0 ? "var(--error)" : "var(--texto-secundario)";
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-2">
      <span className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{etiqueta}</span>
      <span className="relative inline-flex h-9 min-w-14 items-center justify-center overflow-hidden">
        <motion.span
          key={valor}
          initial={{ opacity: 0, y: -14, scale: 1.25 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="font-mono text-3xl font-black tabular-nums"
          style={{ color }}
          data-marcador
        >
          {texto ?? signo(valor)}
        </motion.span>
      </span>
    </div>
  );
}

// Marco común: figura accesible con título opcional, contenido visual
// oculto a lectores de pantalla (aria-hidden) y una alternativa textual
// equivalente en <figcaption> sr-only.
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
      style={{ borderTopColor: COLOR_NAIPIA, borderTopWidth: 3 }}
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
