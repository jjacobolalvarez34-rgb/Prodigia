"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GestoLogo from "./GestoLogo";
import GlareHover from "@/components/reactbits/GlareHover";
import { reproducirTono } from "@/lib/sonido";
import type { Achievement } from "@/types/database";

interface Props {
  logros: Achievement[];
}

// Banner de logro compartido por toda la app (Fase F2: un solo
// tratamiento, no uno por pantalla) — usa el gesto del logo (Fase K2),
// la tipografía Black exclusiva de celebraciones (Fase E2), y la
// fanfarria de logro (Fase I2).
export default function LogroBanner({ logros }: Props) {
  const sonoReproducido = useRef(false);
  const [destello, setDestello] = useState(false);

  useEffect(() => {
    if (logros.length > 0 && !sonoReproducido.current) {
      sonoReproducido.current = true;
      reproducirTono("logro");
    }
  }, [logros.length]);

  if (logros.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      className="relative flex flex-col items-center gap-1 rounded-2xl bg-logro/15 px-6 pb-4 pt-2 text-center"
    >
      <div className="pointer-events-none -mb-4 -mt-6">
        {/* Fase J3: el destello de GlareHover cruza justo cuando el anillo
            del gesto del logo termina de abrirse — un solo momento, no
            dos efectos superpuestos por separado. */}
        <GestoLogo size={80} colorHex="#FFC53D" onDone={() => setDestello(true)} />
      </div>
      <GlareHover
        trigger={destello}
        playOnce
        width="100%"
        height="auto"
        background="transparent"
        borderColor="transparent"
        borderRadius="16px"
        glareColor="#FFC53D"
        glareOpacity={0.35}
        glareAngle={-30}
        glareSize={300}
        transitionDuration={900}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-2xl">🏅</span>
        {logros.map((l) => (
          <p key={l.slug} className="font-display text-lg font-black tracking-tight text-foreground">
            Nuevo logro: {l.nombre}
          </p>
        ))}
      </GlareHover>
    </motion.div>
  );
}
