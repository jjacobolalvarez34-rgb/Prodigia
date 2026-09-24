"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosEpocas, textoEpocas, type BandaEpoca } from "@/lib/historia/visualesDatos";
import type { VisualHistoriaEpocas } from "@/lib/historia/visuales";
import { COLOR_EPOCA, COLOR_HISTORIA, Leyenda, MarcoVisual, transicion, useIdioma } from "./comun";

interface Props {
  visual: VisualHistoriaEpocas;
}

function calcular(v: VisualHistoriaEpocas): BandaEpoca[] | null {
  try {
    return datosEpocas(v);
  } catch {
    return null;
  }
}

// Las cinco épocas, de la más antigua a la más reciente, con el hecho que la
// convención escolar toma como frontera. Las franjas NO están a escala (la
// Prehistoria dura muchísimo más que todas las demás juntas) y la figura lo avisa.
export default function Epocas({ visual }: Props) {
  const t = useTranslations("Historia.visuales");
  const idioma = useIdioma();
  const bandas = calcular(visual);
  const total = bandas ? bandas.length : 0;
  const { alVer, ...r } = useReproductor({ total, ms: 1900, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!bandas) return null;

  const actual = bandas[Math.min(bandas.length, Math.max(1, r.paso)) - 1];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.epocas")}
      titulo={visual.titulo}
      alternativa={<p>{t("epocas.alternativa", { lista: textoEpocas(visual) })}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_HISTORIA} />}
    >
      <ol className="flex flex-col gap-2">
        {bandas.map((b, i) => {
          const visible = i < r.paso;
          const activa = i === r.paso - 1;
          const color = COLOR_EPOCA[b.id];
          return (
            <li
              key={b.id}
              className="flex gap-2 rounded-xl border px-2 py-2"
              style={{
                opacity: visible ? (b.resaltada ? 1 : 0.55) : 0,
                transition: transicion(r.reducir, "opacity", 450),
                borderColor: activa ? color : "var(--border)",
                background: `color-mix(in oklab, ${color} ${activa ? 14 : 7}%, var(--surface))`,
              }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: color }}>
                {b.numero}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold leading-tight text-foreground">
                  {idioma === "en" ? b.nombreEn : b.nombreEs} <span className="font-normal text-texto-secundario">· {b.rango}</span>
                </p>
                {b.frontera && (
                  <p className="mt-0.5 text-[11.5px] leading-snug text-foreground">
                    {t("epocas.empiezaCon")}: {b.frontera.nombre} ({b.frontera.anioTexto})
                  </p>
                )}
                {b.ejemplos.length > 0 && (
                  <ul className="mt-1 flex flex-wrap gap-1">
                    {b.ejemplos.map((e) => (
                      <li key={e.id} className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] leading-tight text-foreground">
                        {e.nombre} · {e.anioTexto}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <Leyenda acento={COLOR_EPOCA[actual.id]}>
        <span className="block font-semibold">{idioma === "en" ? actual.nombreEn : actual.nombreEs}</span>
        <span className="mt-1 block text-[12px] text-texto-secundario">{actual.frontera ? actual.frontera.nota : t("epocas.sinFrontera")}</span>
        <span className="mt-1 block text-[12px] text-texto-secundario">{t("epocas.sinEscala")}</span>
      </Leyenda>
    </MarcoVisual>
  );
}
