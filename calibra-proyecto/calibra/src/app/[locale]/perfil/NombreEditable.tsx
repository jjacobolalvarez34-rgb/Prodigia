"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";
import NombreConFuente from "@/components/NombreConFuente";
import type { FuenteNombre } from "@/types/database";

// Fase 6 (mercado): cambiar de nombre después del primero cuesta
// Chispas — nunca Experiencia, que es semanal/temporal y mediría mal si
// se pudiera gastar. cambiar_nombre_usuario (0054) cobra server-side;
// acá solo se muestra el costo antes de confirmar.
const COSTO_RENOMBRAR = 100;

interface Props {
  nombreActual: string | null;
  fuente?: FuenteNombre;
}

export default function NombreEditable({ nombreActual, fuente }: Props) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(nombreActual ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    if (nombre.trim().length < 2) return;
    setGuardando(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("cambiar_nombre_usuario", { p_nombre: nombre.trim() });
    setGuardando(false);
    if (rpcError) {
      setError(rpcError.message ?? "No se pudo guardar. Probá de nuevo.");
      return;
    }
    setEditando(false);
    router.refresh();
  }

  if (!editando) {
    return (
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          <NombreConFuente nombre={nombreActual} fuente={fuente} />
        </h1>
        <button
          onClick={() => setEditando(true)}
          className="text-xs font-medium text-primario hover:underline"
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          minLength={2}
          maxLength={40}
          autoFocus
          className="rounded-lg border border-border bg-background px-3 py-1.5 font-display text-lg font-bold text-foreground outline-none focus:border-primario"
        />
        <Boton onClick={guardar} disabled={nombre.trim().length < 2} cargando={guardando} className="px-3 py-1.5 text-sm">
          {guardando ? "Guardando..." : "Guardar"}
        </Boton>
        <button
          onClick={() => {
            setNombre(nombreActual ?? "");
            setError(null);
            setEditando(false);
          }}
          className="text-sm text-texto-secundario hover:underline"
        >
          Cancelar
        </button>
      </div>
      <p className="text-xs text-texto-secundario">Cambiar de nombre cuesta {COSTO_RENOMBRAR} Chispas.</p>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
