"use client";

import { useLocale, useTranslations } from "next-intl";
import type { VisualMelodiaPentagrama } from "@/lib/melodia/visuales";
import { resolverPentagrama, textoDeVisual } from "@/lib/melodia/visualesDatos";
import PentagramaBase from "@/components/melodia/Pentagrama";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_MELODIA } from "./comun";

interface Props {
  visual: VisualMelodiaPentagrama;
}

// melodia.pentagrama: las notas aparecen una a una sobre el pentagrama en
// clave de sol (el MISMO componente que usa la Práctica), con su nombre.
export default function PentagramaVisual({ visual }: Props) {
  const t = useTranslations("Melodia.visuales.pentagrama");
  const idioma = useLocale() === "en" ? "en" : "es";
  const datos = resolverPentagrama(visual);
  const total = datos?.notas.length ?? 0;
  const { alVer, ...r } = useReproductor({ total, ms: 1100, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;

  const alternativa = <p>{textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>, idioma)}</p>;
  const conEtiquetas = datos.etiquetas.some((e) => e !== "");

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      nota={t("nota")}
      controles={<ControlesReproductor r={r} color={COLOR_MELODIA} />}
    >
      <div className={`mx-auto w-full ${datos.disposicion === "simultanea" ? "max-w-[15rem]" : "max-w-md"}`}>
        <PentagramaBase
          notas={datos.notas}
          disposicion={datos.disposicion}
          colorHex={COLOR_MELODIA}
          visibles={r.paso}
          etiquetas={conEtiquetas ? datos.etiquetas : undefined}
          destacada={r.paso - 1}
        />
      </div>
    </MarcoVisual>
  );
}
