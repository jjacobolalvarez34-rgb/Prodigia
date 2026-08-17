"use client";

import { motion, AnimatePresence } from "framer-motion";
import BonusTiempo from "@/components/BonusTiempo";

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
