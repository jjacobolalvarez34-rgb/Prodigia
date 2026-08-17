"use client";

import { useSyncExternalStore } from "react";
import PixelTransition from "@/components/reactbits/PixelTransition";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";

interface Props {
  activo: boolean;
  miRespuesta: string;
  respuestaCorrecta: string;
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

  return (
    <PixelTransition
      activeControlled={activo}
      once
      gridSize={9}
      pixelColor="#FF6B6B"
      animationStepDuration={0.35}
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
