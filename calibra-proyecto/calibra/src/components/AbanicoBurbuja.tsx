"use client";

import { Children, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";

interface Props {
  abierto: boolean;
  children: React.ReactNode;
  staggerDelay?: number;
  animationDuration?: number;
  className?: string;
}

// Fase N3: técnica de apertura de BubbleMenu (cada burbuja escala de 0 a
// 1, en abanico escalonado) aplicada a los items reales del desplegable
// de cuenta (Fase S2) — no se adoptó el chrome completo de BubbleMenu
// (logo bubble + toggle bubble propios, overlay a pantalla completa)
// porque ProfileMenu ya tiene su propio disparador y no es una
// navegación de sitio, es un dropdown de cuenta anclado.
// Nota: la versión original usaba gsap directo (mismo motor que
// SplitText, que resultó no disparar de forma confiable en este
// entorno) — se reemplazó por framer-motion, ya probado en el resto
// del proyecto, para no repetir ese mismo problema acá.
export default function AbanicoBurbuja({ abierto, children, staggerDelay = 0.06, animationDuration = 0.3, className }: Props) {
  const items = Children.toArray(children);
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);

  return (
    <div className={className}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={efectos ? { scale: 0.4, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            efectos
              ? { duration: animationDuration, delay: abierto ? i * staggerDelay : 0, ease: "backOut" }
              : { duration: 0 }
          }
          style={{ transformOrigin: "top center" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
