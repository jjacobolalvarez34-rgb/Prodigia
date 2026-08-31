"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

interface Paso {
  texto: string;
  variante: "grande" | "chico";
}

interface Props {
  onTerminar: () => void;
}

// Paso 6 del flujo nuevo (Fase 7): tour guiado por el resto de la app.
// Mismo mecanismo visual que el viejo DemoTour.tsx (overlay de a un
// paso, sin cola compartida ni localStorage — la demo entera es
// efímera), pero NO navega a las rutas reales (Ranking/Rankeds/
// Amigos-Clanes/Perfil): esas rutas están protegidas por requireUsuario
// (exige mundos_desbloqueados, que recién se completa en el paso 8) —
// navegar de verdad ahí adentro reproduciría el mismo bug de la Fase 4
// que este rediseño vino a sacar. Un resumen liviano alcanza para
// "mostrar" cada sección sin salir del flujo.
export default function FlujoTour({ onTerminar }: Props) {
  const t = useTranslations("Landing.tour");
  const [paso, setPaso] = useState(0);

  const pasos: Paso[] = [
    { texto: t("ranking"), variante: "grande" },
    { texto: t("rankeds"), variante: "grande" },
    { texto: t("amigos"), variante: "chico" },
    { texto: t("perfil"), variante: "chico" },
  ];

  const esUltimo = paso === pasos.length - 1;
  const actual = pasos[paso];

  function avanzar() {
    if (esUltimo) {
      onTerminar();
    } else {
      setPaso((p) => p + 1);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="overlay-flujo-tour"
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
            onClick={avanzar}
            className="mt-4 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white"
          >
            {esUltimo ? t("entendido") : t("siguiente")}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
