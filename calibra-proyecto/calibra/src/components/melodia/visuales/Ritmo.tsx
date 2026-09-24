"use client";

import { useLocale, useTranslations } from "next-intl";
import type { VisualMelodiaRitmo } from "@/lib/melodia/visuales";
import { NOMBRE_FIGURA_EN, resolverRitmo, textoDeVisual } from "@/lib/melodia/visualesDatos";
import { NOMBRE_FIGURA } from "@/lib/practica/melodia";
import FiguraRitmicaIcono from "@/components/melodia/FiguraRitmicaIcono";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_MELODIA, fondoAcento } from "./comun";

// melodia.ritmo: cada figura aparece con su nombre, su duración en pulsos y
// una barra proporcional dentro de un compás de 4/4 (negra = un pulso). La
// duración sale de DURACION_FIGURA (la de la Práctica).
export default function Ritmo({ visual }: { visual: VisualMelodiaRitmo }) {
  const t = useTranslations("Melodia.visuales.ritmo");
  const idioma = useLocale() === "en" ? "en" : "es";
  const figuras = resolverRitmo(visual);
  const { alVer, ...r } = useReproductor({ total: figuras.length, ms: 1200, estatico: visual.estatico, inicio: figuras.length > 0 ? 1 : 0 });
  if (figuras.length === 0) return null;

  const alternativa = <p>{textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>, idioma)}</p>;
  const pulsos = (n: number) => (n === 0.5 ? t("mediaPulso") : t("pulsos", { count: n }));

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      nota={t("nota")}
      controles={<ControlesReproductor r={r} color={COLOR_MELODIA} />}
    >
      <ul className="mx-auto flex w-full max-w-sm flex-col gap-1.5">
        {figuras.map((f, i) => {
          const visible = i < r.paso;
          const actual = i === r.paso - 1;
          return (
            <li
              key={f.figura}
              className="flex items-center gap-2.5 rounded-xl border-2 px-2 py-1 transition-opacity duration-300 motion-reduce:transition-none"
              style={{ opacity: visible ? 1 : 0.2, borderColor: visible ? COLOR_MELODIA : "var(--border)", background: actual ? fondoAcento(14) : "var(--surface)" }}
            >
              <span className="w-11 shrink-0">
                <FiguraRitmicaIcono figura={f.figura} colorHex={COLOR_MELODIA} className="h-14 w-auto" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{idioma === "en" ? NOMBRE_FIGURA_EN[f.figura] : NOMBRE_FIGURA[f.figura]}</span>
                <span className="block text-xs text-texto-secundario">{pulsos(f.pulsos)}</span>
                <span className="mt-1 block h-2.5 w-full rounded-full bg-border/60" aria-hidden="true">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${(visible ? f.fraccionCompas : 0) * 100}%`, background: COLOR_MELODIA }}
                  />
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </MarcoVisual>
  );
}
