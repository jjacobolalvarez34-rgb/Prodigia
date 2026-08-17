"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Boton from "@/components/Boton";

interface Props {
  userId: string;
  nombreActual: string | null;
}

export default function NombreEditable({ userId, nombreActual }: Props) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(nombreActual ?? "");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (nombre.trim().length < 2) return;
    setGuardando(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ display_name: nombre.trim() }).eq("id", userId);
    setGuardando(false);
    setEditando(false);
    router.refresh();
  }

  if (!editando) {
    return (
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{nombreActual}</h1>
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
          setEditando(false);
        }}
        className="text-sm text-texto-secundario hover:underline"
      >
        Cancelar
      </button>
    </div>
  );
}
