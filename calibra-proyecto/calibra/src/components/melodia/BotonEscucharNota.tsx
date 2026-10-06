"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { frecuenciaDeNota, type NotaMusical } from "@/lib/practica/melodia";
import { reproducirAcorde, reproducirNotaMusical } from "@/lib/sonido";

interface Props {
  nota: NotaMusical;
  // Oído de acordes: suenan todas estas notas juntas en vez de `nota`.
  acorde?: NotaMusical[];
  colorHex?: string;
}

// Fase 7 (Melodía, "oído absoluto"): reproduce la nota (o el acorde)
// automáticamente al aparecer la pregunta, y deja re-escucharla las veces
// que haga falta con el mismo botón — nunca se ve el pentagrama (sería
// trampa, el modo es de oído).
export default function BotonEscucharNota({ nota, acorde, colorHex = "#B8860B" }: Props) {
  const t = useTranslations("Melodia.botonEscuchar");
  const sonar = () => {
    if (acorde && acorde.length > 0) reproducirAcorde(acorde.map(frecuenciaDeNota));
    else reproducirNotaMusical(frecuenciaDeNota(nota));
  };
  useEffect(() => {
    sonar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nota, acorde]);

  return (
    <button
      type="button"
      onClick={sonar}
      className="flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white shadow-lg transition-transform active:scale-95"
      style={{ background: colorHex }}
      aria-label={acorde ? t("ariaLabelAcorde") : t("ariaLabel")}
    >
      {acorde ? "🎹" : "🔊"}
    </button>
  );
}
