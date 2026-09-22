"use client";

import type { ButtonHTMLAttributes } from "react";
import BorderGlow from "@/components/reactbits/BorderGlow";
import SpecularButton from "@/components/reactbits/SpecularButton";
import InsigniaCorte from "@/components/InsigniaCorte";
import { gradientePrimario, paradasPrimario } from "@/lib/degradeBoton";

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

// Fase G4: cuando `primario` va con `destacado`, el fondo/borde/recorte los
// pone InsigniaCorte por fuera (ver abajo) — el <button> de adentro queda
// transparente y sin el shadow propio de ESTILOS.primario (si no, su
// rectángulo/sombra tapa el recorte en diagonal). Solo aporta
// padding/tipografía/hover.
const ESTILO_PRIMARIO_DESTACADO = "px-5 py-3 text-white bg-transparent hover:-translate-y-0.5";

// Casi todos los llamadores de `destacado` pasan `className="w-full py-5
// text-lg"` (o con `max-w-md`) esperando un CTA que ocupe todo el ancho de
// su contenedor (ver TrigonometriaPracticaClient, SubtemaPicker, Rankeds,
// etc. — grep "destacado" en src/app). Antes ese className caía solo en el
// <button> interno; ahora que InsigniaCorte es un div aparte que lo envuelve
// (inline-flex, shrink-to-fit), un `w-full` en el botón de adentro ya no
// alcanza para estirar la placa completa si el contenedor real no fuerza
// stretch (ej. un padre `items-center`, como en TrigonometriaPracticaClient).
// Por eso las clases de ANCHO (w-*, max-w-*, min-w-*) del className del
// caller se reenvían también al wrapper de InsigniaCorte — así la placa
// entera (recorte + degradé + borde) ocupa el ancho pedido, no solo el
// texto de adentro.
function clasesDeAncho(className: string): string {
  const coincidencias = className.match(/(?:^|\s)(max-w-\S+|min-w-\S+|w-\S+)/g) ?? [];
  return coincidencias.map((c) => c.trim()).join(" ");
}

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
  // Fase G4: degradé cálido de 3 paradas (antes: 2 paradas planas que
  // SIEMPRE terminaban en #FFC53D amarillo, sin importar el mundo — ver
  // src/lib/degradeBoton.ts para la fórmula y el porqué). Cuando el botón
  // es `destacado`, el fondo lo pone InsigniaCorte (más abajo) y este
  // <button> queda transparente, así que acá no hace falta calcularlo.
  const esDestacadoPrimario = variante === "primario" && destacado;
  const estiloDegrade =
    variante === "primario" && !esDestacadoPrimario ? { background: gradientePrimario(colorHex) } : undefined;

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
      className={`${BASE} ${esDestacadoPrimario ? ESTILO_PRIMARIO_DESTACADO : ESTILOS[variante]} ${className}`}
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

  if (!esDestacadoPrimario) return boton;

  // BorderGlow dibuja un halo REDONDEADO (usa border-radius, no
  // clip-path) — decisión: se deja así (no se le pasa un clip-path con
  // esquinas cortadas) porque es un glow suave hacia afuera, no un borde
  // duro; un halo redondeado detrás de una placa con esquinas cortadas se
  // ve bien (glow difuso + forma nítida adentro), verificado con
  // screenshot real (Playwright + CSS compilado del dev server). `colors`
  // ahora usa las mismas 3 paradas del degradé del botón (antes terminaba
  // siempre en #FFC53D amarillo) para que el halo combine con el mundo/
  // color de cada CTA.
  return (
    <BorderGlow
      backgroundColor="transparent"
      borderRadius={12}
      glowRadius={18}
      colors={paradasPrimario(colorHex)}
      glowColor="255 65% 68%"
    >
      <InsigniaCorte colorHex={colorHex} disabled={disabled || cargando} className={clasesDeAncho(className)}>
        {boton}
      </InsigniaCorte>
    </BorderGlow>
  );
}
