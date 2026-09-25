"use client";

import { useTranslations } from "next-intl";

interface Props {
  hielos: number;
  tiemposExtra: number;
  usando: TipoUso;
  onUsarHielo: () => void;
  onUsarTiempoExtra: () => void;
}

export type TipoUso = "hielo" | "tiempo_extra" | null;

// Pedido en vivo (2026-09-15): botones para gastar los consumibles de
// partida (hielo = detiene el reloj 10s, tiempo_extra = +3s) A MITAD de
// un sprint. "Prohibidos en partidas multijugador" se resuelve en el
// punto de uso: cada *SprintRunner solo renderiza esto cuando NO hay un
// duelo activo (mismo criterio que ya usan para fantasma/duelId en
// otros lados) — nunca se importa este componente dentro de la rama de
// duelo. Si no tienes ninguno de los dos comprados, no se renderiza nada
// (nada que ofrecer).
export default function ConsumiblesPartida({ hielos, tiemposExtra, usando, onUsarHielo, onUsarTiempoExtra }: Props) {
  const t = useTranslations("Practica.consumibles");
  if (hielos <= 0 && tiemposExtra <= 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {hielos > 0 && (
        <button
          type="button"
          onClick={onUsarHielo}
          disabled={usando !== null}
          aria-label={t("usarHielo")}
          title={t("usarHielo")}
          className="flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground transition-opacity hover:border-primario/50 disabled:opacity-50"
        >
          🧊 {hielos}
        </button>
      )}
      {tiemposExtra > 0 && (
        <button
          type="button"
          onClick={onUsarTiempoExtra}
          disabled={usando !== null}
          aria-label={t("usarTiempoExtra")}
          title={t("usarTiempoExtra")}
          className="flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground transition-opacity hover:border-primario/50 disabled:opacity-50"
        >
          ⏱️ {tiemposExtra}
        </button>
      )}
    </div>
  );
}
