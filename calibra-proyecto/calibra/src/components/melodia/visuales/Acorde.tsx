"use client";

import { useTranslations } from "next-intl";
import type { VisualMelodiaAcorde } from "@/lib/melodia/visuales";
import { nombreSinOctava, resolverTecladoAcorde, textoDeVisual } from "@/lib/melodia/visualesDatos";
import TecladoBase from "./TecladoBase";
import { COLOR_MELODIA, fondoAcento } from "./comun";

// melodia.acorde: el acorde se apila nota a nota sobre el teclado; debajo,
// el grado de cada nota (1, 3, 5, 7...) y sus semitonos desde la
// fundamental. Las notas salen de construirAcorde (la misma función que la
// Práctica).
export default function Acorde({ visual }: { visual: VisualMelodiaAcorde }) {
  const t = useTranslations("Melodia.visuales.acorde");
  const datos = resolverTecladoAcorde(visual);
  return (
    <TecladoBase
      datos={datos}
      etiqueta={t("etiqueta")}
      titulo={visual.titulo}
      estatico={visual.estatico}
      alternativa={(idioma) => textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>, idioma)}
      nota={t("nota")}
      escuchar={visual.escuchar}
      juntas
      extra={(visibles) =>
        datos && (
          <ol className="mx-auto flex flex-wrap justify-center gap-1.5">
            {datos.notas.map((n, i) => (
              <li
                key={i}
                className="rounded-lg border px-2 py-1 text-center text-xs leading-tight transition-opacity duration-300"
                style={{ opacity: i < visibles ? 1 : 0.25, borderColor: i < visibles ? COLOR_MELODIA : "var(--border)", background: i === visibles - 1 ? fondoAcento(16) : "var(--surface)" }}
              >
                <span className="block text-[10px] uppercase tracking-wide text-texto-secundario">{t("grado", { grado: datos.grados[i] })}</span>
                <span className="block text-sm font-bold">{nombreSinOctava(n)}</span>
                <span className="block text-[11px] text-texto-secundario">{i === 0 ? t("fundamental") : t("semitonos", { n: datos.semitonos[i] })}</span>
              </li>
            ))}
          </ol>
        )
      }
    />
  );
}
