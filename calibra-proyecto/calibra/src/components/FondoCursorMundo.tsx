"use client";

import { useSyncExternalStore } from "react";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";
import GhostCursor from "@/components/reactbits/GhostCursor";

export type MundoCursor = "numeria" | "enigmia" | "geografia";

const COLOR_MUNDO: Record<MundoCursor, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
};

// Fase L3: solo en las homes de mundo, nunca durante una partida activa
// (por eso vive en un componente aparte, wireado únicamente en los 3
// page.tsx de home — jamás dentro de un runner de práctica). Respeta el
// mismo gate que FondoMundo.tsx (efectosHabilitados, que ya cubre tanto
// el toggle manual como la detección de conexión lenta de la Fase P2,
// porque esa detección termina apagando el mismo flag).
export default function FondoCursorMundo({ mundo }: { mundo: MundoCursor }) {
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);
  if (!efectos) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden">
      <GhostCursor
        color={COLOR_MUNDO[mundo]}
        // Recortado respecto al ejemplo de la librería (trailLength 50,
        // bloom 0.1/1.0/0.025): el shader corre un fbm de 5 octavas por
        // cada punto del trail, así que menos puntos y menos bloom
        // importan bastante para un adorno de fondo que corre siempre.
        trailLength={16}
        inertia={0.5}
        bloomStrength={0.1}
        bloomRadius={0.8}
        bloomThreshold={0.05}
        grainIntensity={0.03}
        brightness={0.7}
        edgeIntensity={0.2}
        maxDevicePixelRatio={0.5}
      />
    </div>
  );
}
