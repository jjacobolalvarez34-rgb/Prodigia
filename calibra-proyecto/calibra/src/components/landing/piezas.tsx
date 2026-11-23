"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

// Piezas compartidas por la presentación (LandingPublica) y /docentes, con la estética
// «Noche de Prodigia» (2026-11-23: neón que no se vea hecho con IA): fondo liso, sin
// manchas borrosas, sin vidrio, sin degradés en el texto ni etiquetas en mayúsculas.

export const SUAVE = [0.16, 1, 0.3, 1] as const;

export function Aparece({ children, retraso = 0, className, desde = 24 }: { children: ReactNode; retraso?: number; className?: string; desde?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: desde }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: retraso, ease: SUAVE }}
    >
      {children}
    </motion.div>
  );
}

export function Encabezado({ titulo, texto, alinear = "centro" }: { titulo: ReactNode; texto?: string; alinear?: "centro" | "izquierda" }) {
  return (
    <Aparece className={alinear === "centro" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{titulo}</h2>
      {texto && <p className="mt-3 text-lg text-texto-secundario">{texto}</p>}
    </Aparece>
  );
}

// El panel del docente en miniatura: tarjeta lisa, barras del color de cada ciudad que
// crecen al entrar en pantalla.
const COLORES_BARRAS = ["#9B85FF", "#2FD89B", "#3FC1D6", "#F2C14E", "#E36BF2", "#4FE0F5", "#FF8A3D"];

export function MiniPanel() {
  const barras = [38, 62, 45, 80, 70, 92, 58];
  return (
    <div aria-hidden="true" className="rounded-3xl border border-[#232B47] bg-[#10152A] p-5">
      <div className="grid grid-cols-3 gap-2">
        {[
          ["28", "#F4F6FB"],
          ["24", "#3DDC97"],
          ["86 %", "#9B85FF"],
        ].map(([v, c], i) => (
          <div key={i} className="rounded-xl border border-[#232B47] bg-[#0C1022] px-3 py-2">
            <div className="h-1.5 w-8 rounded-full bg-[#232B47]" />
            <p className="mt-1.5 font-mono text-lg font-bold" style={{ color: c }}>
              {v}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-28 items-end gap-2">
        {barras.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ background: COLORES_BARRAS[i] }}
            initial={{ height: "6%" }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.07, ease: SUAVE }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {[72, 100, 40].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#1E2542]" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1E2542]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: w === 100 ? "#3DDC97" : w < 50 ? "#FF5D5D" : "#9B85FF" }}
                initial={{ width: 0 }}
                whileInView={{ width: `${w}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: 0.3 + i * 0.15, ease: SUAVE }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Botón de la presentación: la pastilla de la web (components/Boton.tsx) con su placa
// circular, en color sólido, sin brillos que lo crucen.
export function clasesBoton(variante: "primario" | "secundario", grande = false) {
  const tam = grande ? "px-7 py-4 text-lg" : "px-5 py-3 text-base";
  return variante === "primario"
    ? `inline-flex items-center justify-center gap-3 rounded-full bg-[#6C4CF1] font-display font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${tam}`
    : `inline-flex items-center justify-center gap-3 rounded-full border border-[#3A3F66] bg-[#171D34] font-display font-semibold text-[#F4F6FB] transition-colors hover:border-[#7C5CFF] ${tam}`;
}
