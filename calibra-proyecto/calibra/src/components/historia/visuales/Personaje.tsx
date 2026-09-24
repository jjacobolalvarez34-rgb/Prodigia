"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosPersonajes, textoPersonajes, type FichaPersonaje } from "@/lib/historia/visualesDatos";
import type { VisualHistoriaPersonaje } from "@/lib/historia/visuales";
import type { EpocaId } from "@/lib/historia/tipos";
import { EPOCAS } from "@/lib/historia/epocas";
import { COLOR_EPOCA, COLOR_HISTORIA, MarcoVisual, useIdioma } from "./comun";

interface Props {
  visual: VisualHistoriaPersonaje;
}

function calcular(v: VisualHistoriaPersonaje): FichaPersonaje[] | null {
  try {
    return datosPersonajes(v);
  } catch {
    return null;
  }
}

function epocaId(f: FichaPersonaje): EpocaId {
  return EPOCAS.find((e) => e.nombre.es === f.epocaEs)!.id;
}

// Fichas de personajes: cada paso muestra una ficha (rol, años de vida, época,
// región, un dato que lo identifica y los hechos de la tabla en los que figura).
// Todo sale de la tabla canónica; reconocer al personaje por su ROL es la técnica.
export default function Personaje({ visual }: Props) {
  const t = useTranslations("Historia.visuales");
  const idioma = useIdioma();
  const fichas = calcular(visual);
  const total = fichas ? fichas.length : 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!fichas) return null;

  const f = fichas[Math.min(fichas.length, Math.max(1, r.paso)) - 1];
  const color = COLOR_EPOCA[epocaId(f)];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.personaje")}
      titulo={visual.titulo}
      alternativa={<p>{t("personaje.alternativa", { lista: textoPersonajes(visual) })}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_HISTORIA} />}
    >
      <div
        key={f.id}
        className="rounded-xl border px-3 py-3"
        style={{ borderColor: color, background: `color-mix(in oklab, ${color} 9%, var(--surface))` }}
      >
        <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color }}>
          {t("personaje.rol")}
        </p>
        <p className="text-[15px] font-bold leading-tight text-foreground">{f.nombre}</p>
        <p className="text-[13px] text-foreground">{f.rol}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: color }}>
            {idioma === "en" ? f.epocaEn : f.epocaEs}
          </span>
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-foreground">{t(`regiones.${f.region}`)}</span>
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-foreground">{f.siglo}</span>
        </div>
        <p className="mt-2 text-[12.5px] leading-snug text-foreground">
          <strong>{t("personaje.vida")}:</strong> {f.vida}
        </p>
        <p className="mt-1 text-[12.5px] leading-snug text-foreground">{f.logro}</p>
        {f.hechos.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-texto-secundario">{t("personaje.aparece")}</p>
            <ul className="mt-1 flex flex-col gap-0.5 text-[12px] leading-snug text-foreground">
              {f.hechos.map((h) => (
                <li key={h.id}>
                  {h.nombre} · <strong>{h.anioTexto}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MarcoVisual>
  );
}
