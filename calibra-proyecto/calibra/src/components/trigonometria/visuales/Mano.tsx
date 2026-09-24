"use client";

import { useTranslations } from "next-intl";
import ManoCirculoSVG from "@/components/trigonometria/ManoCirculoSVG";
import type { VisualTrigonometriaMano } from "@/lib/trigonometria/visuales";
import { COLOR_TRIGONOMETRIA, MarcoVisual } from "./comun";

interface Props {
  visual: VisualTrigonometriaMano;
}

// El truco de la mano (componente interactivo que ya existía): sen(dedo_k) =
// √k/2 y cos(dedo_k) = √(4 − k)/2, con los dedos numerados 0 (pulgar) a 4
// (meñique). Los valores se calculan en ManoCirculoSVG, nunca se escriben a mano.
export default function Mano({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  return (
    <MarcoVisual
      refCont={() => undefined}
      etiqueta={visual.titulo ?? t("etiqueta.mano")}
      titulo={visual.titulo}
      alternativa={<p>{t("mano.alternativa")}</p>}
    >
      <ManoCirculoSVG colorHex={COLOR_TRIGONOMETRIA} />
    </MarcoVisual>
  );
}
