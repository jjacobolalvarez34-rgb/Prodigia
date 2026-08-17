"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  secuencia: string[];
  colorHex: string;
  onListo: () => void;
}

const MS_BASE = 1300;
const MS_POR_ITEM = 550;

// Fase W2: pantalla de memorización — se muestra SOLA, sin la pregunta
// ni las opciones a la vista, durante un tiempo que escala con la
// cantidad de ítems. `onListo` (llamado desde el callback async del
// timeout, no de forma síncrona en el cuerpo del efecto) recién ahí
// dispara que el runner revele la pregunta y oculte esto.
export default function AcertijoMemoria({ secuencia, colorHex, onListo }: Props) {
  const duracionMs = MS_BASE + secuencia.length * MS_POR_ITEM;

  useEffect(() => {
    const t = setTimeout(onListo, duracionMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secuencia]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <p className="text-sm font-medium text-texto-secundario">Memorizá esta secuencia...</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {secuencia.map((item, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.12, duration: 0.3, ease: "backOut" }}
            className="rounded-xl border-2 px-4 py-2.5 font-display text-lg font-bold"
            style={{ borderColor: colorHex, color: colorHex }}
          >
            {item}
          </motion.span>
        ))}
      </div>
      <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          key={secuencia.join(",")}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duracionMs / 1000, ease: "linear" }}
          className="h-full rounded-full"
          style={{ background: colorHex }}
        />
      </div>
    </div>
  );
}
