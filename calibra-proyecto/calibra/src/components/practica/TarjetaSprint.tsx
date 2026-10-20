"use client";

import { AnimatePresence, motion } from "framer-motion";
import PuntajeCorner, { type IntensidadPuntaje } from "@/components/PuntajeCorner";
import DibujoTema from "@/components/temas/DibujoTema";
import { useTemaHoy } from "@/components/temas/useTemaHoy";
import { celebracionDe } from "@/lib/temas/celebracion";
import { PARTICULAS } from "@/lib/temas/dibujos";
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
// Usada igual en los 6 runners de práctica — nada de feedback viejo.
//
// Fase 4 (auditoría 2026-08-25 — "el contenedor no crece con la
// imagen, corta el pentagrama/la molécula/el esqueleto"): la causa
// real era `className="absolute inset-0"` en la tarjeta de acá abajo.
// Un elemento `position: absolute` NUNCA aporta altura a su padre —
// así que el wrapper de afuera quedaba fijo exactamente en `minHeight`
// pase lo que pase adentro, recortando/apretando cualquier contenido
// más alto que eso (pentagramas, el esqueleto de Anatomía, moléculas
// de Quimia orgánica). `AnimatePresence mode="popLayout"` YA saca del
// flujo (con su propio absolute, automático) solo a la tarjeta que se
// está yendo — la que está ENTRANDO/presente se queda en flujo normal
// a propósito, así que sacar el `absolute inset-0` de acá alcanza para
// que el wrapper vuelva a crecer con el contenido real, sin perder la
// superposición del swipe de salida (eso ya lo resuelve popLayout
// solo). `minHeight` pasa a ser un piso de verdad, no un techo.
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
  // Esquinas con la figura de la fecha durante un evento (PARIDAD_EVENTOS.md fila 6).
  const tema = useTemaHoy();
  const esquina = celebracionDe(tema)?.esquina ?? null;
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
        >
          <div
            className={`relative flex w-full flex-col items-center gap-6 rounded-3xl border-2 bg-surface ${padding} shadow-lg shadow-foreground/[0.03] transition-colors ${
              feedback === "correcto"
                ? "border-correcto"
                : feedback === "incorrecto"
                  ? "border-error"
                  : "border-border"
            }`}
          >
            {esquina && tema && (
              <>
                <DibujoTema dibujo={PARTICULAS[esquina]} color={tema.tema.acento} className="pointer-events-none absolute -right-2 -top-3 h-7 w-7 rotate-[18deg] drop-shadow" />
                <DibujoTema dibujo={PARTICULAS[esquina]} color={tema.tema.acento} className="pointer-events-none absolute -left-1.5 -top-2.5 h-5 w-5 -rotate-[18deg] drop-shadow" />
              </>
            )}
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
