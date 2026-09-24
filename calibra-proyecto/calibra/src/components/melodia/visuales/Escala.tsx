"use client";

import { useTranslations } from "next-intl";
import type { VisualMelodiaEscala } from "@/lib/melodia/visuales";
import { resolverTecladoEscala, textoDeVisual } from "@/lib/melodia/visualesDatos";
import TecladoBase from "./TecladoBase";

// melodia.escala: la escala se construye nota a nota sobre el teclado con
// los saltos (T = tono, S = semitono) entre una nota y la siguiente. Las
// notas salen de construirEscala (la misma función que la Práctica).
export default function Escala({ visual }: { visual: VisualMelodiaEscala }) {
  const t = useTranslations("Melodia.visuales.escala");
  const datos = resolverTecladoEscala(visual);
  return (
    <TecladoBase
      datos={datos}
      etiqueta={t("etiqueta")}
      titulo={visual.titulo}
      estatico={visual.estatico}
      alternativa={(idioma) => textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>, idioma)}
      nota={t("nota")}
      saltos
      escuchar={visual.escuchar}
    />
  );
}
