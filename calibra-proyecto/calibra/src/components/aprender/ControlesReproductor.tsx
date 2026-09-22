"use client";

import { useTranslations } from "next-intl";
import type { Reproductor } from "./useReproductor";

interface Props {
  r: Omit<Reproductor, "alVer">;
  // Color de acento del mundo (por defecto el primario del proyecto).
  color?: string;
}

const boton =
  "min-h-10 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40";

// Mismo tamaño y forma que `boton` — solo el color cambia. Se usa en
// Anterior/Repetir (pedido del usuario 2026-09-22: "más visibles, no
// más grandes" — antes eran gris liso y se perdían al lado de
// Siguiente, que ya tenía el acento del mundo).
function botonAcentuado(color: string | undefined): React.CSSProperties | undefined {
  if (!color) return undefined;
  return { borderColor: color, color, background: `color-mix(in oklab, ${color} 10%, var(--surface))` };
}

function IconoAnterior() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3 5 8l5 5" />
    </svg>
  );
}

function IconoRepetir() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 8A5 5 0 1 1 11.5 4.5" />
      <path d="M13 2.5V5.5H10" />
    </svg>
  );
}

// Controles accesibles de los visuales animados: Anterior / Siguiente /
// Repetir / Reproducir-Pausa e indicador "2 de 5". Con "reducir
// movimiento" no hay Reproducir-Pausa (nada se mueve solo): solo se
// avanza a mano.
export default function ControlesReproductor({ r, color }: Props) {
  const t = useTranslations("Aprender.visual");
  const acento = botonAcentuado(color);
  return (
    <div role="group" aria-label={t("controles")} className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className={`${boton} inline-flex items-center gap-1 font-semibold`}
        style={acento}
        onClick={r.anterior}
        disabled={r.paso <= r.minimo}
      >
        <IconoAnterior />
        {t("anterior")}
      </button>
      <button
        type="button"
        className={`${boton} font-semibold`}
        style={color ? { borderColor: color, color } : undefined}
        onClick={r.siguiente}
        disabled={r.alFinal}
      >
        {t("siguiente")}
      </button>
      {!r.reducir && (
        <button type="button" className={boton} onClick={r.alternar} aria-pressed={r.reproduciendo}>
          {r.reproduciendo ? t("pausa") : t("reproducir")}
        </button>
      )}
      <button type="button" className={`${boton} inline-flex items-center gap-1 font-semibold`} style={acento} onClick={r.repetir}>
        <IconoRepetir />
        {t("repetir")}
      </button>
      <span className="min-w-14 text-center text-xs tabular-nums text-texto-secundario" role="status">
        {t("indicador", { actual: r.paso, total: r.total })}
      </span>
    </div>
  );
}
