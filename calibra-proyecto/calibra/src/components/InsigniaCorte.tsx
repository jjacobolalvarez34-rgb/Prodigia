"use client";

import type { ReactNode } from "react";
import { gradientePrimario } from "@/lib/degradeBoton";
import "./InsigniaCorte.css";

interface Props {
  children: ReactNode;
  colorHex?: string;
  className?: string;
  disabled?: boolean;
}

// Esquinas cortadas: arriba-izquierda y abajo-derecha (opuestas), como en
// la placa/ticket de referencia del usuario. `CORTE_BORDE` es el corte del
// borde blanco exterior; `CORTE_CUERPO` es 2px más chico porque el cuerpo
// (el degradé) va 2px hacia adentro — así el borde blanco se ve parejo
// alrededor de todo el contorno, incluidas las diagonales.
const CORTE_BORDE = 10; // px
const CORTE_CUERPO = 8; // px

function recorte(corte: number): string {
  return `polygon(${corte}px 0, 100% 0, 100% calc(100% - ${corte}px), calc(100% - ${corte}px) 100%, 0 100%, 0 ${corte}px)`;
}

/**
 * Placa con dos esquinas cortadas en diagonal + degradé cálido + borde
 * blanco fino — la estética "cupón/ticket premium" de la referencia
 * visual. Reservada a los CTAs grandes de Boton.tsx (`primario` +
 * `destacado`, ej. "Practicar"/"Jugar"): NO se usa en botones comunes
 * (formularios chicos, checkboxes de UI) porque el recorte sería ruidoso
 * ahí — ver Boton.tsx, que solo la aplica cuando `destacado` es true.
 *
 * Tamaño: no fuerza medidas propias, hereda el tamaño de `children` (así
 * respeta el padding que ya trae el <button> de Boton.tsx) y solo agrega
 * `min-height` para asegurar el mínimo táctil de ~40px.
 *
 * Decisión sobre los adornos de la referencia (triángulos, rombo hueco,
 * flechas finas alrededor de la placa): NO se replicaron. En un botón real
 * de UI el ancho es variable (texto corto/largo, mobile vs. desktop) y esos
 * elementos sueltos posicionados en coordenadas fijas se solaparían con el
 * texto o quedarían "flotando" mal ubicados en anchos distintos, además de
 * competir con el halo de BorderGlow que ya envuelve el botón. En su lugar
 * se agregó un brillo diagonal sutil (`::after` sobre el cuerpo, ver
 * InsigniaCorte.css) que insinúa el mismo espíritu "premium" sin piezas
 * sueltas que puedan romper el layout responsive.
 */
export default function InsigniaCorte({ children, colorHex, className = "", disabled = false }: Props) {
  return (
    <div
      className={`insignia-corte relative inline-flex min-h-[40px] ${disabled ? "opacity-60" : ""} ${className}`}
    >
      <span className="insignia-corte__borde" style={{ clipPath: recorte(CORTE_BORDE) }} aria-hidden="true" />
      <span
        className="insignia-corte__cuerpo"
        style={{ clipPath: recorte(CORTE_CUERPO), background: gradientePrimario(colorHex) }}
        aria-hidden="true"
      />
      <span className="insignia-corte__contenido relative z-10 inline-flex items-center justify-center">
        {children}
      </span>
    </div>
  );
}
