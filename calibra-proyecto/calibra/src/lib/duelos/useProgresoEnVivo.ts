"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface ProgresoDuelo {
  respondidos: number;
  correctos: number;
  racha: number;
}

interface Params {
  duelId?: string | null;
  miUserId?: string | null;
}

// Fase 6: progreso del rival EN VIVO durante un duelo — no confundir con
// el "fantasma" de Numeria (SprintRunner.tsx), que reproduce respuestas
// YA guardadas de un rival que terminó antes que vos. Esto es para
// cuando los dos están jugando al mismo tiempo: reusa el mismo canal de
// Realtime que ya arma SalaDuelo para la sala de espera (`duelo:<id>`),
// ahora en Broadcast puro durante la partida en sí. Si el rival no está
// conectado en este momento, simplemente no llega nada — `rival` queda
// en null y el componente que lo use no debe mostrar nada (nunca hace
// falta un estado de "esperando", el resto del duelo ya funciona sin
// que el rival esté presente en simultáneo).
export function useProgresoEnVivo({ duelId, miUserId }: Params) {
  const [rival, setRival] = useState<ProgresoDuelo | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!duelId || !miUserId) return;
    const supabase = createClient();
    const channel = supabase.channel(`duelo:${duelId}`);
    channelRef.current = channel;

    channel.on("broadcast", { event: "progreso" }, ({ payload }) => {
      const data = payload as ProgresoDuelo & { userId: string };
      if (data.userId === miUserId) return;
      setRival({ respondidos: data.respondidos, correctos: data.correctos, racha: data.racha });
    });

    channel.subscribe();

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [duelId, miUserId]);

  function emitirProgreso(progreso: ProgresoDuelo) {
    if (!miUserId || !channelRef.current) return;
    channelRef.current.send({ type: "broadcast", event: "progreso", payload: { ...progreso, userId: miUserId } });
  }

  return { rival, emitirProgreso };
}
