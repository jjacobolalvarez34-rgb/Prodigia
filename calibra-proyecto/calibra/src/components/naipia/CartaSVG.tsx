"use client";

import { useTranslations } from "next-intl";
import type { Carta, Palo } from "@/lib/practica/naipia";

interface Props {
  carta: Carta;
  // Ancho en px; el alto sale de la proporción 60:84 de la carta.
  ancho?: number;
}

const ANCHO_VB = 60;
const ALTO_VB = 84;
const COLOR_ROJO = "#C62828";
const COLOR_NEGRO = "#111827";

// Silueta de cada palo dibujada por código en una caja de 24x24 (sin
// glifos unicode ni imágenes externas — mismo criterio que CircuitoSVG
// de Circuitia): así se ve igual en cualquier fuente y escala limpia.
function SiluetaPalo({ palo }: { palo: Palo }) {
  if (palo === "corazones") {
    return <path d="M12 21.5C5 15.5 2 11.8 2 8.2A5 5 0 0 1 12 6.3 5 5 0 0 1 22 8.2c0 3.6-3 7.3-10 13.3z" />;
  }
  if (palo === "diamantes") {
    return <path d="M12 2l9 10-9 10-9-10z" />;
  }
  if (palo === "picas") {
    return (
      <path d="M12 2C12 2 3 9 3 14a4.5 4.5 0 0 0 8 2.7c-.3 2.3-1 3.9-3 5.3h8c-2-1.4-2.7-3-3-5.3a4.5 4.5 0 0 0 8-2.7C21 9 12 2 12 2z" />
    );
  }
  return (
    <g>
      <circle cx="12" cy="7.2" r="4.4" />
      <circle cx="6.6" cy="14" r="4.4" />
      <circle cx="17.4" cy="14" r="4.4" />
      <path d="M12 11.5v5c0 2.8-1.4 4.4-3.5 5.5h7c-2.1-1.1-3.5-2.7-3.5-5.5z" />
    </g>
  );
}

// Carta de la baraja como SVG: esquina con valor y palo, palo grande al
// centro. Accesible: role="img" con aria-label ("7 de picas").
export default function CartaSVG({ carta, ancho = 44 }: Props) {
  const t = useTranslations("Naipia.cartas");
  const color = carta.palo === "corazones" || carta.palo === "diamantes" ? COLOR_ROJO : COLOR_NEGRO;
  const etiqueta = t("etiqueta", { valor: t(`valores.${carta.valor}`), palo: t(`palos.${carta.palo}`) });
  const tamanoValor = carta.valor === "10" ? 13 : 15;
  const escalaEsquina = 0.42;
  const escalaCentro = 1.5;

  return (
    <svg
      role="img"
      aria-label={etiqueta}
      width={ancho}
      height={(ancho * ALTO_VB) / ANCHO_VB}
      viewBox={`0 0 ${ANCHO_VB} ${ALTO_VB}`}
      className="shrink-0 drop-shadow-sm"
    >
      <rect x={1} y={1} width={ANCHO_VB - 2} height={ALTO_VB - 2} rx={6} fill="#FFFFFF" stroke="#D1D5DB" strokeWidth={1.5} />
      <text x={7} y={17} fontSize={tamanoValor} fontWeight={700} fill={color} fontFamily="ui-sans-serif, system-ui, sans-serif">
        {carta.valor}
      </text>
      <g fill={color} transform={`translate(${5.5} ${21}) scale(${escalaEsquina})`}>
        <SiluetaPalo palo={carta.palo} />
      </g>
      <g fill={color} transform={`translate(${30 - 12 * escalaCentro} ${46 - 12 * escalaCentro}) scale(${escalaCentro})`}>
        <SiluetaPalo palo={carta.palo} />
      </g>
    </svg>
  );
}
