"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ciudadDe, tono } from "@/lib/recompensas/catalogo";
import { FORMAS_CONSTELACION, polvoDeEstrellas } from "@/lib/recompensas/constelaciones";

// Una constelación en el cielo de su ciudad (0259), igual que
// mobile/src/ui/recompensas/Constelacion.tsx: 7 estrellas con la forma del glifo;
// las encendidas brillan con el color de la ciudad. Con `celebrar`, las estrellas
// se encienden de a una y las líneas se dibujan solas.
export default function Constelacion({ mundo, estrellas, tam = 96, celebrar = false }: { mundo: string; estrellas: number; tam?: number; celebrar?: boolean }) {
  const forma = FORMAS_CONSTELACION[mundo] ?? FORMAS_CONSTELACION.numeria;
  const base = ciudadDe(mundo)?.color ?? "#6C4CF1";
  const brillo = tono(base, 0.35);
  const fondo = tono(base, -0.78);
  const polvo = useMemo(() => polvoDeEstrellas(mundo), [mundo]);
  const id = `cielo-${mundo}-${tam}`;
  const completa = celebrar || estrellas >= 7;

  return (
    <svg width={tam} height={tam} viewBox="-6 -6 112 112" className="shrink-0 rounded-2xl" role="img" aria-label={`${estrellas} de 7 estrellas`}>
      <defs>
        <radialGradient id={id} cx="50%" cy="35%" r="75%">
          <stop offset="0" stopColor={fondo} />
          <stop offset="1" stopColor="#05070D" />
        </radialGradient>
        <filter id={`${id}-brillo`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <rect x={-6} y={-6} width={112} height={112} fill={`url(#${id})`} />
      {polvo.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.25} />
      ))}
      {forma.lineas.map(([a, b], i) => {
        const [x1, y1] = forma.puntos[a];
        const [x2, y2] = forma.puntos[b];
        if (celebrar)
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={brillo}
              strokeWidth={1.6}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ delay: 1.4 + (i * 1.1) / forma.lineas.length, duration: 1.1 / forma.lineas.length }}
            />
          );
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={brillo} strokeOpacity={completa ? 0.85 : 0.12} strokeWidth={completa ? 1.6 : 1} strokeDasharray={completa ? undefined : "2 3"} />;
      })}
      {forma.puntos.map(([x, y], i) => {
        const encendida = completa || i < estrellas;
        if (celebrar)
          return (
            <motion.g key={i} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.2, duration: 0.25 }}>
              <circle cx={x} cy={y} r={7} fill={brillo} opacity={0.35} filter={`url(#${id}-brillo)`} />
              <circle cx={x} cy={y} r={3.6} fill={brillo} />
            </motion.g>
          );
        return encendida ? (
          <g key={i}>
            <circle cx={x} cy={y} r={7} fill={brillo} opacity={0.35} filter={`url(#${id}-brillo)`} />
            <circle cx={x} cy={y} r={3.6} fill={brillo} />
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r={2.4} fill="none" stroke={brillo} strokeOpacity={0.45} strokeWidth={1} />
        );
      })}
    </svg>
  );
}
