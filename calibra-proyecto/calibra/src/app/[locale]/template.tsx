"use client";

import { motion } from "framer-motion";

// template.tsx (a diferencia de layout.tsx) remonta en cada navegación,
// que es justo lo que hace falta para una animación de entrada por
// pantalla. Sin animación de salida a propósito: coordinar exit
// animations entre server components del App Router pide bastante más
// maquinaria (AnimatePresence + estado compartido) para un beneficio
// chico acá.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
