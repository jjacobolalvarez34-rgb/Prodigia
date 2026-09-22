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

// Controles accesibles de los visuales animados: Anterior / Siguiente /
// Repetir / Reproducir-Pausa e indicador "2 de 5". Con "reducir
// movimiento" no hay Reproducir-Pausa (nada se mueve solo): solo se
// avanza a mano.
export default function ControlesReproductor({ r, color }: Props) {
  const t = useTranslations("Aprender.visual");
  return (
    <div role="group" aria-label={t("controles")} className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" className={boton} onClick={r.anterior} disabled={r.paso <= r.minimo}>
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
      <button type="button" className={boton} onClick={r.repetir}>
        {t("repetir")}
      </button>
      <span className="min-w-14 text-center text-xs tabular-nums text-texto-secundario" role="status">
        {t("indicador", { actual: r.paso, total: r.total })}
      </span>
    </div>
  );
}
