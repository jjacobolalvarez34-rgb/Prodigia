"use client";

import { useTranslations } from "next-intl";
import type { AyudasPartida } from "@/lib/practica/useAyudasPartida";

interface Props {
  hielos: number;
  tiemposExtra: number;
  usando: TipoUso;
  onUsarHielo: () => void;
  onUsarTiempoExtra: () => void;
  // Tienda ampliada (0248): pista (solo con `onPista`, donde hay opciones) y
  // segunda oportunidad.
  ayudas?: AyudasPartida;
  onPista?: () => void;
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
export default function ConsumiblesPartida({ hielos, tiemposExtra, usando, onUsarHielo, onUsarTiempoExtra, ayudas, onPista }: Props) {
  const t = useTranslations("Practica.consumibles");
  const tA = useTranslations("Recompensas.ayudas");
  const hayPista = !!ayudas && !!onPista && ayudas.pistas > 0 && ayudas.ocultas.size === 0;
  const haySegunda = !!ayudas && (ayudas.segundas > 0 || ayudas.armada);
  if (hielos <= 0 && tiemposExtra <= 0 && !hayPista && !haySegunda) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ayudas?.aviso && (
        <span className="rounded-full bg-correcto/15 px-2 py-1 text-xs font-semibold text-correcto" role="status">
          {tA("otraVez")}
        </span>
      )}
      {hayPista && (
        <button
          type="button"
          onClick={onPista}
          disabled={ayudas!.usando}
          className="flex items-center gap-1 rounded-full border border-primario/50 bg-surface px-2 py-1 text-xs font-medium text-foreground disabled:opacity-50"
        >
          {tA("pista", { n: ayudas!.pistas })}
        </button>
      )}
      {haySegunda && (
        <button
          type="button"
          onClick={() => ayudas!.armarSegunda()}
          disabled={ayudas!.usando || ayudas!.armada}
          className={`flex items-center gap-1 rounded-full border border-correcto/60 px-2 py-1 text-xs font-medium text-foreground disabled:opacity-80 ${ayudas!.armada ? "bg-correcto/15" : "bg-surface"}`}
        >
          {ayudas!.armada ? tA("segundaLista") : tA("segunda", { n: ayudas!.segundas })}
        </button>
      )}
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
