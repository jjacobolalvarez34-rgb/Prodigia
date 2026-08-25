"use client";

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Fase (Rankeds: "usuarios en línea", tercera vez que se pide):
// se llama una sola vez, desde Header.tsx — Header renderiza en TODA
// página autenticada, así que esto alcanza para trackear presencia a
// nivel de app entera, no solo dentro de Rankeds. La key del presence
// es el user_id: si la misma persona tiene 2 pestañas abiertas, las
// dos trackean bajo la MISMA key, así que se cuenta una sola vez del
// lado de quien lee el conteo (useConteoUsuariosEnLinea), no dos.
//
// Este hook NUNCA lee el conteo — solo trackea. Mantenerlo así (en vez
// de devolver también el número) evita cualquier ambigüedad sobre si
// esta suscripción cuenta como una entrada de presence aparte de la
// que lee el conteo — acá la única que trackea.
export function useTrackearPresenciaGlobal() {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let cancelado = false;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelado || !user) return;

      const channel = supabase.channel("presencia:global", {
        config: { presence: { key: user.id } },
      });
      channelRef.current = channel;

      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || cancelado) return;
        await channel.track({ online_at: new Date().toISOString() });
      });
    });

    return () => {
      cancelado = true;
      if (channelRef.current) {
        createClient().removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);
}
