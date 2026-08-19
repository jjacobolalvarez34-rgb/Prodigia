"use client";

import { useSyncExternalStore } from "react";
import PixelTransition from "@/components/reactbits/PixelTransition";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";

interface Props {
  activo: boolean;
  miRespuesta: string;
  respuestaCorrecta: string;
}

// Bug reportado en celular (no reproducido en PC): en TarjetaSprint.tsx
// (Geografía/Enigmia/Fracciones/Decimales/Potencias/Álgebra — no en
// Numeria, que monta esto una sola vez) este componente se remonta
// entero en CADA error, porque vive dentro del motion.div con
// key={cardKey} de la tarjeta. Cada montaje reconstruye la grilla de
// PixelTransition desde cero (gridSize=9 → 81 <div> creados a mano vía
// document.createElement, más dos tandas de tweens de GSAP en stagger
// sobre esos 81 nodos) — de sobra en desktop, pero de a poco notorio en
// hardware de gama media/baja. Se aliviana (menos "píxeles", animación
// más corta) en vez de sacarse: se detecta con el mismo criterio que ya
// usa PixelTransition.tsx para touch/puntero grueso.
function dispositivoLiviano(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
}

// Fase K3: reemplaza las partículas de "desintegración" que usaban los
// runners de práctica en el caso de error — ahora el pixel-transition va
// de "tu respuesta" a "la respuesta correcta" en vez de solo mostrar
// puntitos disolviéndose alrededor de un texto estático. Si el toggle de
// efectos está apagado, se cae directo al texto final sin animación.
export default function RevelarRespuesta({ activo, miRespuesta, respuestaCorrecta }: Props) {
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);

  if (!activo) return null;

  if (!efectos) {
    return <span className="font-mono text-sm font-semibold text-error">La respuesta era {respuestaCorrecta}</span>;
  }

  const liviano = dispositivoLiviano();

  return (
    <PixelTransition
      activeControlled={activo}
      once
      gridSize={liviano ? 4 : 9}
      pixelColor="#FF6B6B"
      animationStepDuration={liviano ? 0.22 : 0.35}
      aspectRatio="0"
      style={{ minHeight: 24 }}
      firstContent={
        <span className="flex h-full w-full items-center justify-center font-mono text-sm font-semibold text-error">
          Tu respuesta: {miRespuesta || "—"}
        </span>
      }
      secondContent={
        <span className="flex h-full w-full items-center justify-center font-mono text-sm font-semibold text-error">
          La respuesta era {respuestaCorrecta}
        </span>
      }
    />
  );
}
