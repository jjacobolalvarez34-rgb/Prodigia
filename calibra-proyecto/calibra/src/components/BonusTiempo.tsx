"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";

interface Props {
  segundos: number;
}

const PARTICULAS = 5;

// Fase C2/BB2: el bonus de tiempo tiene que sentirse con el MISMO peso
// que el resto de los momentos grandes de la tanda (PuntajeCorner,
// GestoLogo) — no un número chico al costado. Golpe de escala grande,
// tipografía Black grande, y un estallido de partículas doradas igual
// que el de PuntajeCorner (gateado por el toggle de efectos, Fase P2).
export default function BonusTiempo({ segundos }: Props) {
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3, y: 4 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.7, 1.25, 1.1], y: [4, -2, -2, -4] }}
      transition={{ duration: 0.9, times: [0, 0.32, 0.65, 1], ease: "backOut" }}
      className="pointer-events-none absolute -top-8 right-0 font-display text-2xl font-black"
      style={{ color: "#FFC53D" }}
    >
      +{segundos}s
      {efectos && (
        <div className="absolute left-1/2 top-1/2">
          {Array.from({ length: PARTICULAS }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{
                opacity: 0,
                x: Math.cos((i / PARTICULAS) * Math.PI * 2) * 26,
                y: Math.sin((i / PARTICULAS) * Math.PI * 2) * 26,
                scale: 0.3,
              }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="absolute h-1 w-1 rounded-full"
              style={{ background: "#FFC53D" }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
