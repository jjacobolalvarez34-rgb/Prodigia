"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";

export type IntensidadPuntaje = "chico" | "medio" | "grande";

interface Props {
  total: number;
  intensidad: IntensidadPuntaje;
}

const ESCALA: Record<IntensidadPuntaje, number> = { chico: 1, medio: 1.25, grande: 1.6 };
const PARTICULAS: Record<IntensidadPuntaje, number> = { chico: 0, medio: 3, grande: 6 };

// Fase VV/C2: el número de puntos ganados aparece UNA sola vez, ya
// combinado (nada de desglose paso a paso durante la partida — eso
// queda para el resumen final), en una esquina de la tarjeta, y se
// desvanece rápido. La intensidad (tamaño, si dispara partículas)
// escala con lo ganado en esa respuesta puntual.
export default function PuntajeCorner({ total, intensidad }: Props) {
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);
  const escala = ESCALA[intensidad];
  // Las partículas son puramente decorativas (Fase P2) — el número en sí
  // (la parte con información real) se queda aunque los efectos estén
  // apagados.
  const particulas = efectos ? PARTICULAS[intensidad] : 0;

  return (
    <div className="pointer-events-none absolute right-4 top-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.4, y: 6 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.4, escala, escala, escala * 0.9], y: [6, 0, 0, -8] }}
        transition={{ duration: 0.7, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
        className="font-display font-black"
        style={{ color: "#FFC53D", fontSize: 20 * escala }}
      >
        +{total}
      </motion.div>
      {particulas > 0 && (
        <div className="absolute left-1/2 top-1/2">
          {Array.from({ length: particulas }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{
                opacity: 0,
                x: Math.cos((i / particulas) * Math.PI * 2) * (18 + escala * 10),
                y: Math.sin((i / particulas) * Math.PI * 2) * (18 + escala * 10),
                scale: 0.3,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute h-1 w-1 rounded-full"
              style={{ background: "#FFC53D" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
