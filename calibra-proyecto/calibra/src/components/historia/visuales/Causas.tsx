"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosCausas, textoCausas, type NodoCausa } from "@/lib/historia/visualesDatos";
import type { VisualHistoriaCausas } from "@/lib/historia/visuales";
import { COLOR_HISTORIA, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualHistoriaCausas;
}

function calcular(v: VisualHistoriaCausas): NodoCausa[] | null {
  try {
    return datosCausas(v);
  } catch {
    return null;
  }
}

const COLOR_ROL = { causa: "#D97706", hecho: "#A0522D", consecuencia: "#0D9488" } as const;

function Flecha({ color }: { color: string }) {
  return (
    <svg width={20} height={26} viewBox="0 0 20 26" className="mx-auto" aria-hidden="true">
      <path d="M10 2 V20" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <path d="M4 15 L10 22 L16 15" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Cadena causa -> hecho -> consecuencia. Cada eslabón es una relación de la tabla
// canónica (datosCausas lanza si no lo es). Cada paso agrega el eslabón siguiente.
export default function Causas({ visual }: Props) {
  const t = useTranslations("Historia.visuales");
  const nodos = calcular(visual);
  const total = nodos ? nodos.length : 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2000, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!nodos) return null;

  const actual = nodos[Math.min(nodos.length, Math.max(1, r.paso)) - 1];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.causas")}
      titulo={visual.titulo}
      alternativa={<p>{t("causas.alternativa", { lista: textoCausas(visual) })}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_HISTORIA} />}
    >
      <ol className="flex flex-col items-stretch">
        {nodos.map((n, i) => {
          const visible = i < r.paso;
          const activo = i === r.paso - 1;
          const color = COLOR_ROL[n.rol];
          return (
            <li key={n.id} className="flex flex-col" style={{ opacity: visible ? 1 : 0, transition: transicion(r.reducir, "opacity", 450) }}>
              {i > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-texto-secundario">{t("causas.provoco")}</span>
                  <Flecha color={COLOR_HISTORIA} />
                </div>
              )}
              <div
                className="rounded-xl border px-3 py-2"
                style={{
                  borderColor: activo ? color : "var(--border)",
                  background: `color-mix(in oklab, ${color} ${activo ? 14 : 7}%, var(--surface))`,
                }}
              >
                <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color }}>
                  {t(`causas.rol.${n.rol}`)}
                </p>
                <p className="text-[13px] font-semibold leading-snug text-foreground">{n.nombre}</p>
                <p className="text-[12px] text-texto-secundario">{n.anioTexto}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <Leyenda acento={COLOR_ROL[actual.rol]}>
        <span className="block font-semibold">{t(`causas.rol.${actual.rol}`)}</span>
        <span className="mt-1 block text-[12px] text-texto-secundario">{t(`causas.explica.${actual.rol}`)}</span>
      </Leyenda>
    </MarcoVisual>
  );
}
