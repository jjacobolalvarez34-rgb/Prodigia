"use client";

import { AnimatePresence, motion } from "framer-motion";
import PuntajeCorner, { type IntensidadPuntaje } from "@/components/PuntajeCorner";
import RevelarRespuesta from "@/components/practica/RevelarRespuesta";

export interface PuntajeTarjeta {
  total: number;
  intensidad: IntensidadPuntaje;
}

interface Props {
  cardKey: number;
  feedback: "idle" | "correcto" | "incorrecto";
  puntaje: PuntajeTarjeta | null;
  miRespuesta?: string;
  respuestaCorrecta?: string;
  minHeight?: number;
  padding?: string;
  children: React.ReactNode;
}

// Tarjeta de feedback compartida (Fase VV): correcto pulsa en verde y se
// desliza como una flashcard descartada mientras la siguiente entra por
// el mismo lado; incorrecto se oscurece y desliza un poco más lento a
// propósito. El reveal de la respuesta correcta usa PixelTransition
// (Fase K3) en vez de las partículas de "desintegración" de antes.
// Usada igual en los 4 runners de práctica — nada de feedback viejo.
export default function TarjetaSprint({
  cardKey,
  feedback,
  puntaje,
  miRespuesta,
  respuestaCorrecta,
  minHeight = 300,
  padding = "px-10 py-14",
  children,
}: Props) {
  return (
    <div className="relative w-full max-w-lg" style={{ minHeight }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={cardKey}
          initial={{ opacity: 0, x: 220, rotate: 5 }}
          animate={{
            opacity: 1,
            x: 0,
            rotate: 0,
            scale: feedback === "correcto" ? [1, 1.02, 1] : 1,
            filter: feedback === "incorrecto" ? "brightness(0.88)" : "brightness(1)",
          }}
          exit={{
            opacity: 0,
            x: -220,
            rotate: -6,
            transition: { duration: feedback === "incorrecto" ? 0.45 : 0.32, ease: "easeIn" },
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <div
            className={`relative flex h-full w-full flex-col items-center gap-6 rounded-3xl border-2 bg-surface ${padding} shadow-lg shadow-foreground/[0.03] transition-colors ${
              feedback === "correcto"
                ? "border-correcto"
                : feedback === "incorrecto"
                  ? "border-error"
                  : "border-border"
            }`}
          >
            {feedback === "correcto" && puntaje && <PuntajeCorner total={puntaje.total} intensidad={puntaje.intensidad} />}

            {children}

            {feedback === "incorrecto" && miRespuesta !== undefined && respuestaCorrecta !== undefined && (
              <RevelarRespuesta activo miRespuesta={miRespuesta} respuestaCorrecta={respuestaCorrecta} />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
