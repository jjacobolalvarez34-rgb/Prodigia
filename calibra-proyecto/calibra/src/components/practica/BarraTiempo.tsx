"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BonusTiempo from "@/components/BonusTiempo";
import { reproducirTono } from "@/lib/sonido";

interface Props {
  remainingMs: number;
  duracionTotalMs: number;
  bonusTiempo: number | null;
  cardKey: number;
}

// Barra de tiempo compartida por todos los runners (Fase VV/C2, mismo
// criterio en Aritmética/Fracciones/Enigmia/Geografía): cabeza tipo
// cometa (Fase M2) que se mueve con la barra, y destella en dorado
// cuando hay un bonus de tiempo activo.
export default function BarraTiempo({ remainingMs, duracionTotalMs, bonusTiempo, cardKey }: Props) {
  // Cuenta regresiva de los últimos 10 segundos (un tic por segundo, más agudo en
  // los 3 últimos) y un sonido propio cuando se acaba el tiempo (pedido
  // 2026-10-09). Como todas las partidas usan esta barra, suena en todas.
  const ultimoSegundo = useRef(Infinity);
  useEffect(() => {
    const seg = Math.ceil(remainingMs / 1000);
    if (seg < ultimoSegundo.current) {
      if (seg >= 1 && seg <= 10) reproducirTono(seg <= 3 ? "tic_urgente" : "tic");
      else if (seg <= 0 && ultimoSegundo.current > 0 && ultimoSegundo.current !== Infinity) reproducirTono("tiempo_fin");
    }
    ultimoSegundo.current = seg;
  }, [remainingMs]);

  const pct = Math.min(100, Math.max(0, (remainingMs / duracionTotalMs) * 100));
  const color = bonusTiempo ? "#FFC53D" : "var(--primario)";

  return (
    <div className="relative h-1.5 w-full">
      <div className="h-full w-full overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          animate={{ width: `${pct}%`, background: color }}
          transition={{ duration: 0.3 }}
          className="h-full rounded-full"
        />
      </div>
      <motion.div
        animate={{ left: `${pct}%`, background: color }}
        transition={{ duration: 0.3 }}
        className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ boxShadow: `0 0 7px ${color}` }}
      />
      <AnimatePresence>{bonusTiempo && <BonusTiempo key={cardKey} segundos={bonusTiempo} />}</AnimatePresence>
    </div>
  );
}
