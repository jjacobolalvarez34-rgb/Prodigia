"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconEscudo } from "@/components/icons";

interface Props {
  activo: boolean;
  claseActivo?: string; // color vía clase Tailwind, ej. "text-primario/70"
  colorActivo?: string; // color vía hex inline (mundos con acento dinámico, ej. Geografía)
  className?: string;
}

const FRAGMENTOS = [
  { x: -9, y: -7, rot: -50 },
  { x: 9, y: -7, rot: 50 },
  { x: -7, y: 8, rot: -100 },
  { x: 7, y: 8, rot: 100 },
];

// Fase CC2: cuando un escudo se consume, no alcanza con que se apague
// de opacidad — tiene que leerse como que se ROMPIÓ. Fragmentos que se
// separan y desvanecen antes de asentarse en el estado "gastado". El
// paso activo->inactivo se detecta ajustando estado durante el render
// (mismo patrón que MundoSelector usa para resetear en un cambio de
// prop, sin efecto) y el propio callback de framer-motion
// (`onAnimationComplete`, no un efecto) apaga la animación al terminar.
export default function EscudoIcon({ activo, claseActivo, colorActivo, className = "h-3.5 w-3.5" }: Props) {
  const [activoAnterior, setActivoAnterior] = useState(activo);
  const [rompiendo, setRompiendo] = useState(false);

  if (activo !== activoAnterior) {
    setActivoAnterior(activo);
    if (!activo) setRompiendo(true);
  }

  return (
    <span
      className={`relative inline-flex ${activo ? (claseActivo ?? "") : "text-foreground/15"}`}
      style={activo && colorActivo ? { color: colorActivo } : undefined}
    >
      <IconEscudo className={`${className} transition-all duration-300 ${activo ? "" : "scale-90"}`} />
      <AnimatePresence>
        {rompiendo && (
          <span className="pointer-events-none absolute inset-0">
            {FRAGMENTOS.map((f, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                animate={{ opacity: 0, x: f.x, y: f.y, rotate: f.rot, scale: 0.4 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                onAnimationComplete={i === 0 ? () => setRompiendo(false) : undefined}
                className="absolute left-1/2 top-1/2 h-1 w-1.5 -translate-x-1/2 -translate-y-1/2"
                style={{ background: "currentColor" }}
              />
            ))}
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}
