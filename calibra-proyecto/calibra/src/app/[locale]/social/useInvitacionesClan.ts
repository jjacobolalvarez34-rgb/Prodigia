"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface InvitacionClan {
  invitacion_id: string;
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  nivel_clan: number;
  invitador_nombre: string | null;
  creado_at: string;
}

// Mismo criterio que useAmigos/useRetosPendientes: un solo hook, para
// que la campanita y cualquier otro lugar que en el futuro necesite
// esto no terminen con su propia copia divergente del estado.
export function useInvitacionesClan(iniciales: InvitacionClan[]) {
  const [invitaciones, setInvitaciones] = useState(iniciales);
  const [respondiendoId, setRespondiendoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function responder(invitacionId: string, aceptar: boolean) {
    setRespondiendoId(invitacionId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("responder_invitacion_clan", {
      p_invitacion_id: invitacionId,
      p_aceptar: aceptar,
    });
    setRespondiendoId(null);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setInvitaciones((prev) => prev.filter((i) => i.invitacion_id !== invitacionId));
  }

  return { invitaciones, respondiendoId, error, responder };
}

export type UseInvitacionesClanReturn = ReturnType<typeof useInvitacionesClan>;
