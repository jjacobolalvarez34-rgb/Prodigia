"use client";

import { useEffect, useRef } from "react";
import GestoLogo from "@/components/GestoLogo";
import { reproducirTono } from "@/lib/sonido";

export interface NivelMundoInfo {
  world: string;
  nivel_mundo: number;
  subio: boolean;
}

const NOMBRE_MUNDO: Record<string, string> = {
  numeria: "Numeria",
  enigmia: "Enigmia",
  geografia: "Geografía",
};

const COLOR_MUNDO: Record<string, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
};

// Cierre de Fase DD2: el nivel de mundo ahora tiene el mismo gesto que
// los demás hitos grandes (subir nivel de operación, logro, ganar
// duelo) — el anillo abriéndose + la chispa escapando (GestoLogo, Fase
// K2) en vez de quedar como un dato que solo se actualiza en silencio.
export default function NivelMundoSubio({ nivelMundo }: { nivelMundo: NivelMundoInfo | null | undefined }) {
  const sonoRef = useRef(false);

  useEffect(() => {
    if (nivelMundo?.subio && !sonoRef.current) {
      sonoRef.current = true;
      reproducirTono("nivel");
    }
  }, [nivelMundo]);

  if (!nivelMundo?.subio) return null;
  const color = COLOR_MUNDO[nivelMundo.world] ?? "#6C4CF1";
  const nombre = NOMBRE_MUNDO[nivelMundo.world] ?? nivelMundo.world;

  return (
    <div className="relative flex flex-col items-center gap-1 pb-2 pt-2 text-center">
      <div className="pointer-events-none -mb-4 -mt-6">
        <GestoLogo size={120} colorHex={color} />
      </div>
      <p className="font-display text-lg font-black tracking-tight" style={{ color }}>
        {nombre} subió a nivel {nivelMundo.nivel_mundo}
      </p>
    </div>
  );
}
