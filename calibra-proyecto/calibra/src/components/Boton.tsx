"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import BorderGlow from "@/components/reactbits/BorderGlow";
import { colorSolidoPrimario, paradasPrimario } from "@/lib/degradeBoton";
import { IconFlechaAtras, IconJugar } from "@/components/icons";

type Variante = "primario" | "secundario" | "fantasma" | "peligro";
type LadoIcono = "izquierda" | "derecha";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
  colorHex?: string; // acento del botón en mundos con su propio color (ej. Enigmia); sin esto usa el violeta de marca — "en momentos normales" (fuera de una ciudad) queda con ese color por defecto, pedido 2026-09-24.
  // Fase G3: solo los CTAs primarios GRANDES (Practicar, Jugar) llevan el
  // halo de BorderGlow — un botón de confirmar chico en un formulario no.
  destacado?: boolean;
  // Rediseño 2026-09-24 (referencia visual del usuario: pastilla redondeada
  // + placa circular con un ícono a un lado, 4 estados normal/hover/
  // presionado/deshabilitado). `atras` es el atajo para "Volver": agrega la
  // placa con flecha a la izquierda. Un primario `destacado` YA trae la
  // placa de "jugar" a la derecha automáticamente — no hace falta marcarlo,
  // así el look nuevo queda en TODOS los CTAs grandes existentes sin tocar
  // cada llamador (todos ya pasan `destacado`). `icono`/`iconoLado` cubren
  // cualquier otro caso (ej. un ícono propio del mundo en vez de flecha/jugar).
  atras?: boolean;
  icono?: ReactNode;
  iconoLado?: LadoIcono;
}

const BASE =
  "relative inline-flex items-center justify-center gap-2.5 rounded-full font-display font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45 disabled:grayscale disabled:hover:translate-y-0 disabled:active:scale-100";

const ESTILOS: Record<Variante, string> = {
  primario: "px-5 py-3 text-white shadow-[0_10px_24px_-8px_color-mix(in_oklab,var(--primario)_55%,transparent)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  secundario:
    "px-5 py-3 border bg-surface-2 text-foreground " +
    "border-[color-mix(in_oklab,var(--boton-acento)_45%,var(--border))] " +
    "hover:border-[color-mix(in_oklab,var(--boton-acento)_75%,var(--border))] " +
    "hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--boton-acento)_30%,transparent),0_0_20px_-6px_var(--boton-acento)] " +
    "active:bg-[color-mix(in_oklab,var(--boton-acento)_12%,var(--surface-2))] active:scale-[0.98]",
  fantasma: "px-3 py-1.5 text-sm font-medium text-texto-secundario hover:text-foreground hover:bg-surface-2 active:scale-[0.98]",
  peligro: "px-4 py-2 bg-error text-white hover:bg-error/90 active:scale-[0.98]",
};

// Fase G4 → rediseño 2026-09-24: antes esta variante llevaba un fondo/borde
// aparte pintado por InsigniaCorte (placa con esquinas cortadas, "cupón/
// ticket" — pedido de referencia previo que el usuario terminó rechazando).
// Ahora el botón `destacado` es una pastilla lisa como cualquier primario;
// el único agregado es BorderGlow por fuera para el halo.
const ESTILO_PRIMARIO_DESTACADO = "px-5 py-3 text-white hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

function clasesDeAncho(className: string): string {
  const coincidencias = className.match(/(?:^|\s)(max-w-\S+|min-w-\S+|w-\S+)/g) ?? [];
  return coincidencias.map((c) => c.trim()).join(" ");
}

// Placa circular con un ícono, a un lado del texto — la pieza central de la
// referencia visual (2026-09-24): "Volver" la lleva a la izquierda con una
// flecha, "Iniciar/Jugar" a la derecha con un triángulo de reproducir.
// `tono="clara"` es para fondos sólidos de color (primario): un círculo
// translúcido blanco, como en la referencia. `tono="acento"` es para fondos
// neutros (secundario): el círculo toma el color del botón (mundo o marca).
function PlacaIcono({ children, tono }: { children: ReactNode; tono: "clara" | "acento" }) {
  return (
    <span
      aria-hidden="true"
      className={
        tono === "clara"
          ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-white"
          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--boton-acento)_20%,transparent)] text-[color-mix(in_oklab,var(--boton-acento)_85%,var(--foreground))]"
      }
    >
      {children}
    </span>
  );
}

// Sistema de botones único para todo el proyecto (Fase F2, rediseño de
// forma 2026-09-24) — antes convivían el degradé de la landing original, el
// bg-primario sólido de las partidas, y botones sueltos de formulario, cada
// uno con su propio estado de hover/disabled/loading. Ahora es un solo
// componente con variantes explícitas y una única pastilla redondeada con
// placa circular opcional.
export default function Boton({
  variante = "primario",
  cargando = false,
  colorHex,
  className = "",
  children,
  disabled,
  destacado = false,
  atras = false,
  icono,
  iconoLado,
  style,
  ...rest
}: Props) {
  const acento = colorHex ?? "#6C4CF1";
  const esDestacadoPrimario = variante === "primario" && destacado;

  // Qué ícono mostrar y de qué lado: `icono` explícito gana siempre; si no,
  // `atras` es el atajo de "Volver" (flecha, izquierda); si no, un primario
  // `destacado` trae "jugar" (triángulo, derecha) automáticamente.
  let iconoFinal: ReactNode | null = icono ?? null;
  let lado: LadoIcono = iconoLado ?? "izquierda";
  if (!iconoFinal && atras) {
    iconoFinal = <IconFlechaAtras className="h-4 w-4" />;
    lado = iconoLado ?? "izquierda";
  } else if (!iconoFinal && esDestacadoPrimario) {
    iconoFinal = <IconJugar className="h-4 w-4 translate-x-px" />;
    lado = iconoLado ?? "derecha";
  }
  const tonoPlaca = variante === "primario" ? "clara" : "acento";

  // El fondo sólido lo pinta SIEMPRE este <button> (destacado o no) — antes
  // de este rediseño, el destacado lo pintaba InsigniaCorte por fuera y acá
  // se dejaba sin fondo a propósito; ahora que ya no hay esa capa aparte,
  // saltear esto en destacado dejaba el CTA grande totalmente transparente
  // (bug real, visto en captura 2026-09-24).
  const estiloDegrade = variante === "primario" ? { background: colorSolidoPrimario(colorHex) } : undefined;
  const estiloFinal = {
    ...style,
    ...estiloDegrade,
    // CSS var que leen las clases de arriba (secundario, y la placa de
    // ícono en tono "acento") — así el color del botón "viaja" con el
    // mundo sin tener que armar cada clase a mano con colorHex.
    ["--boton-acento" as string]: acento,
  };

  const boton = (
    <button
      className={`${BASE} ${esDestacadoPrimario ? ESTILO_PRIMARIO_DESTACADO : ESTILOS[variante]} ${className}`}
      style={estiloFinal}
      disabled={disabled || cargando}
      {...rest}
    >
      {cargando ? (
        <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      ) : (
        iconoFinal && lado === "izquierda" && <PlacaIcono tono={tonoPlaca}>{iconoFinal}</PlacaIcono>
      )}
      {children}
      {!cargando && iconoFinal && lado === "derecha" && <PlacaIcono tono={tonoPlaca}>{iconoFinal}</PlacaIcono>}
    </button>
  );

  if (esDestacadoPrimario && !disabled && !cargando) {
    // El halo solo se ve con el botón habilitado (deshabilitado ya queda
    // apagado por `disabled:opacity-45 disabled:grayscale`; un halo de
    // color detrás de un botón gris se leía como un bug, no como estado).
    return (
      <BorderGlow
        backgroundColor="transparent"
        borderRadius={999}
        glowRadius={18}
        colors={paradasPrimario(colorHex)}
        glowColor="255 65% 68%"
        className={clasesDeAncho(className)}
      >
        {boton}
      </BorderGlow>
    );
  }

  return boton;
}
