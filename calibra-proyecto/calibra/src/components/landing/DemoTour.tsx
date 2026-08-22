"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

interface Paso {
  texto: string;
  variante: "grande" | "chico";
}

// Tour de la demo pre-cuenta (landing pública, Fase 3): mismo mecanismo
// visual que PrimeraVezTip.tsx (overlay oscurecido + tarjeta, un paso a
// la vez), pero NO reusa su cola compartida a nivel de módulo — esa cola
// es a propósito una única secuencia de la home autenticada (ver
// comentario en PrimeraVezTip.tsx), y mezclar un contexto pre-cuenta ahí
// arriesgaba romper esa garantía. Este es su propio estado local, nunca
// persiste en localStorage (la demo entera es efímera).
export default function DemoTour() {
  const t = useTranslations("Landing.tour");
  const [paso, setPaso] = useState(0);

  const pasos: Paso[] = [
    { texto: t("sprint"), variante: "grande" },
    { texto: t("rankeds"), variante: "grande" },
    { texto: t("social"), variante: "chico" },
    { texto: t("tienda"), variante: "chico" },
    { texto: t("clanes"), variante: "chico" },
  ];

  if (paso >= pasos.length) return null;
  const actual = pasos[paso];
  const esUltimo = paso === pasos.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay-demo-tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 px-4 backdrop-blur-[2px]"
      >
        <motion.div
          key={paso}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl border border-border bg-surface text-center shadow-xl ${
            actual.variante === "grande" ? "max-w-sm px-6 py-6" : "max-w-xs px-5 py-4"
          }`}
        >
          <p
            className={
              actual.variante === "grande"
                ? "text-base font-medium leading-snug text-foreground"
                : "text-sm text-foreground"
            }
          >
            {actual.texto}
          </p>
          <button
            onClick={() => setPaso((p) => p + 1)}
            className="mt-4 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white"
          >
            {esUltimo ? t("entendido") : t("siguiente")}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
