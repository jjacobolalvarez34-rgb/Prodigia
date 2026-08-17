"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";

interface Props {
  size?: number;
  colorHex?: string;
  onDone?: () => void;
}

const PUNTAS = 8;

// Fase K2: el mismo gesto del logo (el anillo se abre, la chispa
// escapa) reutilizado como animación real en los 3 momentos grandes —
// subir de nivel, desbloquear un logro, ganar un duelo — en vez de
// confetti genérico. Tiene que reconocerse como "de Prodigia" sin ver
// el logo al lado.
export default function GestoLogo({ size = 120, colorHex = "#6C4CF1", onDone }: Props) {
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);
  if (!efectos) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gesto-logo-gradiente" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A794FF" />
          <stop offset="50%" stopColor="#E4CBA0" />
          <stop offset="100%" stopColor="#FFC53D" />
        </linearGradient>
      </defs>

      <motion.circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke={colorHex}
        strokeWidth="14"
        strokeDasharray="158.6 55"
        initial={{ strokeDashoffset: 27.5 }}
        animate={{ strokeDashoffset: [27.5, 8, 27.5] }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px", transform: "rotate(-10deg)" }}
        onAnimationComplete={onDone}
      />

      {Array.from({ length: PUNTAS }).map((_, i) => {
        const angulo = (i / PUNTAS) * Math.PI * 2;
        return (
          <motion.circle
            key={i}
            r="2.6"
            fill="url(#gesto-logo-gradiente)"
            initial={{ opacity: 0, scale: 0, cx: 82, cy: 44 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.4],
              cx: 82 + Math.cos(angulo) * 42,
              cy: 44 + Math.sin(angulo) * 42,
            }}
            transition={{ duration: 0.85, delay: 0.15 + i * 0.025, ease: "easeOut" }}
          />
        );
      })}
    </svg>
  );
}
