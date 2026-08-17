"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  groupId: string;
  nombreGrupo: string;
}

export default function BorrarGrupo({ groupId, nombreGrupo }: Props) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function borrar() {
    setBorrando(true);
    setError(null);
    const res = await fetch("/api/profesor/borrar-grupo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo borrar el grupo.");
      setBorrando(false);
      return;
    }
    router.push("/social?tab=grupos");
    router.refresh();
  }

  if (!confirmando) {
    return (
      <button onClick={() => setConfirmando(true)} className="text-sm font-medium text-error hover:underline">
        Borrar grupo
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2 rounded-xl border border-error/30 bg-error/5 px-4 py-3">
      <p className="text-sm text-foreground">
        ¿Borrar <span className="font-semibold">{nombreGrupo}</span>? Se pierden las membresías de los alumnos, no
        se puede deshacer.
      </p>
      <div className="flex gap-3">
        <button
          onClick={borrar}
          disabled={borrando}
          className="rounded-lg bg-error px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {borrando ? "Borrando..." : "Confirmar"}
        </button>
        <button onClick={() => setConfirmando(false)} className="text-sm text-texto-secundario hover:underline">
          Cancelar
        </button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
