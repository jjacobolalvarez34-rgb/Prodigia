"use client";

import type { ButtonHTMLAttributes } from "react";
import BorderGlow from "@/components/reactbits/BorderGlow";
import SpecularButton from "@/components/reactbits/SpecularButton";

type Variante = "primario" | "secundario" | "fantasma" | "peligro";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
  colorHex?: string; // degradé del primario en mundos con su propio acento (ej. Enigmia)
  // Fase G3: solo los CTAs primarios GRANDES (Practicar, Jugar) llevan el
  // halo de BorderGlow — un botón de confirmar chico en un formulario no.
  destacado?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const ESTILOS: Record<Variante, string> = {
  primario: "px-5 py-3 text-white shadow-[0_10px_24px_-8px_color-mix(in_oklab,var(--primario)_55%,transparent)] hover:-translate-y-0.5",
  // Fase G3: el look de "secundario" ya no lo pone esta clase — lo pone
  // SpecularButton (el brillo especular reemplaza el borde+hover viejo).
  secundario: "px-5 py-3",
  fantasma: "px-3 py-1.5 text-sm font-medium text-texto-secundario hover:text-foreground",
  peligro: "px-4 py-2 bg-error text-white hover:bg-error/90",
};

// Sistema de botones único para todo el proyecto (Fase F2) — antes
// convivían el degradé de la landing original, el bg-primario sólido de
// las partidas, y botones sueltos de formulario, cada uno con su propio
// estado de hover/disabled/loading. Ahora es un solo componente con
// variantes explícitas.
export default function Boton({
  variante = "primario",
  cargando = false,
  colorHex,
  className = "",
  children,
  disabled,
  destacado = false,
  ...rest
}: Props) {
  const estiloDegrade =
    variante === "primario"
      ? {
          background: colorHex
            ? `linear-gradient(120deg, ${colorHex}, #FFC53D)`
            : "linear-gradient(120deg, var(--primario), var(--logro))",
        }
      : undefined;

  if (variante === "secundario") {
    return (
      <SpecularButton
        lineColor={colorHex ?? "#6C4CF1"}
        baseColor="#8a8a8a"
        textColor="var(--foreground)"
        radius={12}
        disabled={disabled || cargando}
        className={`${BASE} ${ESTILOS.secundario} ${className}`}
        {...rest}
      >
        {cargando && (
          <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        )}
        {children}
      </SpecularButton>
    );
  }

  const boton = (
    <button
      className={`${BASE} ${ESTILOS[variante]} ${className}`}
      style={estiloDegrade}
      disabled={disabled || cargando}
      {...rest}
    >
      {cargando && (
        <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      )}
      {children}
    </button>
  );

  if (variante !== "primario" || !destacado) return boton;

  return (
    <BorderGlow
      backgroundColor="transparent"
      borderRadius={12}
      glowRadius={18}
      colors={["#6C4CF1", "#A794FF", "#FFC53D"]}
      glowColor="255 65% 68%"
    >
      {boton}
    </BorderGlow>
  );
}
