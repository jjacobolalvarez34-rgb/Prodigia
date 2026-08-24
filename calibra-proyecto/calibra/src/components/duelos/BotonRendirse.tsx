"use client";

import { useState } from "react";

interface Props {
  duelId: string;
  onRendido: () => void;
  className?: string;
}

// Fase 3 ("Rankeds: Rendirse en vez de cancelar por click afuera") —
// reemplaza el abandono silencioso (navegar afuera con el Header, sin
// ninguna consecuencia) por un botón explícito con confirmación de dos
// pasos: un click accidental no te rinde, hace falta confirmar. Cuenta
// como derrota real (ver /api/duelos/rendirse, rendirse_duelo en
// 0088_rendirse_duelo.sql).
export default function BotonRendirse({ duelId, onRendido, className = "" }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/duelos/rendirse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duel_id: duelId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo rendir el duelo. Probá de nuevo.");
        setEnviando(false);
        return;
      }
      onRendido();
    } catch {
      setError("No se pudo rendir el duelo. Probá de nuevo.");
      setEnviando(false);
    }
  }

  if (confirmando) {
    return (
      <div className={`flex flex-col items-end gap-1.5 ${className}`}>
        <div className="flex items-center gap-2 rounded-xl border border-error/40 bg-error/5 px-3 py-2 text-xs">
          <span className="text-foreground">¿Rendirte? Cuenta como derrota.</span>
          <button
            onClick={confirmar}
            disabled={enviando}
            className="shrink-0 rounded-lg bg-error px-2.5 py-1 font-semibold text-white disabled:opacity-60"
          >
            {enviando ? "..." : "Sí, rendirme"}
          </button>
          <button
            onClick={() => setConfirmando(false)}
            disabled={enviando}
            className="shrink-0 text-texto-secundario hover:underline"
          >
            Seguir jugando
          </button>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className={`shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-texto-secundario transition-colors hover:border-error/40 hover:text-error ${className}`}
    >
      Rendirse
    </button>
  );
}
