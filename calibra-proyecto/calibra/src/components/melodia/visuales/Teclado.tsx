"use client";

import { useTranslations } from "next-intl";
import type { VisualMelodiaTeclado } from "@/lib/melodia/visuales";
import { resolverTeclado, textoDeVisual } from "@/lib/melodia/visualesDatos";
import TecladoBase from "./TecladoBase";

// melodia.teclado: teclas de piano resaltadas una a una, con su nombre.
export default function Teclado({ visual }: { visual: VisualMelodiaTeclado }) {
  const t = useTranslations("Melodia.visuales.teclado");
  const datos = resolverTeclado(visual);
  return (
    <TecladoBase
      datos={datos}
      etiqueta={t("etiqueta")}
      titulo={visual.titulo}
      estatico={visual.estatico}
      alternativa={(idioma) => textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>, idioma)}
      nota={t("nota")}
      nombres={visual.nombres}
      grupos={visual.grupos}
      semitonosNaturales={visual.semitonosNaturales}
      saltos={visual.saltos}
      cifrado={visual.cifrado}
      escuchar={visual.escuchar}
    />
  );
}
