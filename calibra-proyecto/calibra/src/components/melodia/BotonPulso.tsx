"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { reproducirPulso } from "@/lib/sonido";

interface Props {
  bpm: number;
  pulsos: number;
  acentoCada: number;
  colorHex?: string;
}

// Modo Tempo de Melodía: suena un metrónomo apenas aparece la pregunta y se
// puede volver a escuchar. Los puntos de abajo se encienden con cada clic (el
// grande es el tiempo fuerte), así el pulso también se ve. No muestra el BPM:
// es lo que se pregunta.
export default function BotonPulso({ bpm, pulsos, acentoCada, colorHex = "#B8860B" }: Props) {
  const t = useTranslations("Melodia.botonPulso");
  const [actual, setActual] = useState(-1);
  const parar = useRef<() => void>(() => {});

  const sonar = () => {
    parar.current();
    parar.current = reproducirPulso(bpm, pulsos, acentoCada, setActual);
  };

  useEffect(() => {
    sonar();
    return () => parar.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, pulsos, acentoCada]);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={sonar}
        className="flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white shadow-lg transition-transform active:scale-95"
        style={{ background: colorHex, transform: actual >= 0 && actual % acentoCada === 0 ? "scale(1.08)" : undefined }}
        aria-label={t("ariaLabel")}
      >
        🥁
      </button>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: acentoCada }, (_, i) => {
          const encendido = actual >= 0 && actual % acentoCada === i;
          const tam = i === 0 ? 14 : 10;
          return <span key={i} className="rounded-full transition-opacity duration-75" style={{ width: tam, height: tam, background: colorHex, opacity: encendido ? 1 : 0.2 }} />;
        })}
      </div>
      <p className="text-xs text-texto-secundario">{t("ayuda")}</p>
    </div>
  );
}
