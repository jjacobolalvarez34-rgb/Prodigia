"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Carta } from "@/lib/practica/naipia";
import CartaSVG from "./CartaSVG";

interface Props {
  cartas: Carta[];
  ancho?: number;
}

// Tiempo total máximo de la "repartida": una secuencia larga no puede tardar
// más de esto en terminar de acomodarse (la partida tiene reloj — la
// animación es adorno, nunca debe frenar a quien ya sabe la respuesta; el
// input de respuesta está disponible desde el primer instante).
const DURACION_MAX_REPARTIDA_S = 1.8;
const PASO_MAX_S = 0.14;

// Secuencia de cartas en el orden en que "salieron", en filas que
// envuelven según el ancho disponible. Las cartas salen una a una desde el
// mazo (arriba a la derecha) y se acomodan en su lugar con un resorte;
// cada carta ya ocupa su casillero desde el principio, así que el layout
// no salta mientras llegan. Con "reducir movimiento" del sistema
// activado aparecen ya acomodadas, sin animación.
export default function FilaCartas({ cartas, ancho = 40 }: Props) {
  const t = useTranslations("Naipia.cartas");
  const reducirMovimiento = useReducedMotion();
  if (cartas.length === 0) return null;

  const paso = Math.min(PASO_MAX_S, DURACION_MAX_REPARTIDA_S / cartas.length);
  // key por contenido: al cambiar de pregunta la fila se remonta y la
  // repartida vuelve a empezar desde cero.
  const firma = cartas.map((c) => `${c.valor}${c.palo}`).join("-");

  return (
    <div
      key={firma}
      role="group"
      aria-label={t("filaEtiqueta", { n: cartas.length })}
      className="flex flex-wrap justify-center gap-1.5"
    >
      {cartas.map((c, i) => (
        <motion.div
          key={`${c.valor}-${c.palo}-${i}`}
          initial={reducirMovimiento ? false : { opacity: 0, x: 70, y: -80, rotate: 18, scale: 0.55 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20, mass: 0.8, delay: reducirMovimiento ? 0 : i * paso }}
        >
          <CartaSVG carta={c} ancho={ancho} />
        </motion.div>
      ))}
    </div>
  );
}
