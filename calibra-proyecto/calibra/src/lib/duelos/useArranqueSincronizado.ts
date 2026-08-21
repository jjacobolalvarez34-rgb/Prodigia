"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type EstadoArranque = "conectando" | "esperando" | "cuenta-regresiva" | "agotado";

interface Params {
  duelId?: string | null;
  miUserId?: string | null;
  rivalId?: string | null;
  // Fase 3 de Clanes: un rival del Clan de Bots nunca se conecta de
  // verdad — se salta directo a la cuenta regresiva sin abrir canal.
  rivalEsBot?: boolean;
  onEmpezar: () => void;
  margenMs?: number;
  timeoutEsperaMs?: number;
}

const MARGEN_ARRANQUE_MS_DEFAULT = 10_000;
const TIMEOUT_ESPERA_MS_DEFAULT = 45_000;

// Extraído de SalaDuelo.tsx (Numeria, tanda "Rediseño de Rankeds") para
// reusarlo en los 4 mundos (Fase 2 de la tanda "Duelos: llevar el
// progreso en vivo...") — Geografía/Enigmia/Quimia usaban un countdown
// puramente local (cada cliente arrancaba su propia cuenta regresiva de
// 3s sin coordinarse con el otro), que en rigor NO garantizaba que los
// dos arrancaran en el mismo instante real. Esto usa Presence (saber si
// el rival ya está en la sala) + Broadcast (el instante exacto de
// arranque, decidido por el host determinístico — el user_id menor en
// orden alfabético) sobre el mismo canal `duelo:<id>` que ya usa
// useProgresoEnVivo durante la partida en sí.
export function useArranqueSincronizado({
  duelId,
  miUserId,
  rivalId,
  rivalEsBot = false,
  onEmpezar,
  margenMs = MARGEN_ARRANQUE_MS_DEFAULT,
  timeoutEsperaMs = TIMEOUT_ESPERA_MS_DEFAULT,
}: Params) {
  const [estado, setEstado] = useState<EstadoArranque>("conectando");
  const [rivalPresente, setRivalPresente] = useState(false);
  const [segundos, setSegundos] = useState<number | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const empezoRef = useRef(false);
  const soyHost = !!miUserId && !!rivalId && miUserId < rivalId;

  function empezarUnaVez() {
    if (empezoRef.current) return;
    empezoRef.current = true;
    onEmpezar();
  }

  function arrancarCuentaRegresiva(startAt: number) {
    setEstado("cuenta-regresiva");
    const tick = () => {
      const faltanMs = startAt - Date.now();
      if (faltanMs <= 0) {
        empezarUnaVez();
        return;
      }
      setSegundos(Math.ceil(faltanMs / 1000));
      requestAnimationFrame(tick);
    };
    tick();
  }

  useEffect(() => {
    if (!rivalEsBot || !duelId || !miUserId) return;
    const startAt = Date.now() + margenMs;
    queueMicrotask(() => arrancarCuentaRegresiva(startAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rivalEsBot, duelId, miUserId]);

  useEffect(() => {
    if (rivalEsBot || !duelId || !miUserId || !rivalId) return;
    const supabase = createClient();
    const channel = supabase.channel(`duelo:${duelId}`, {
      config: { presence: { key: miUserId } },
    });
    channelRef.current = channel;
    let cancelado = false;

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      if (cancelado) return;
      setRivalPresente(rivalId in state);
    });

    channel.on("broadcast", { event: "start" }, ({ payload }) => {
      if (cancelado || empezoRef.current) return;
      arrancarCuentaRegresiva((payload as { startAt: number }).startAt);
    });

    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED" || cancelado) return;
      setEstado("esperando");
      await channel.track({ user_id: miUserId, en: Date.now() });
    });

    const timeoutAgotado = setTimeout(() => {
      if (!cancelado && !empezoRef.current) setEstado((actual) => (actual === "cuenta-regresiva" ? actual : "agotado"));
    }, timeoutEsperaMs);

    return () => {
      cancelado = true;
      clearTimeout(timeoutAgotado);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelId, miUserId, rivalId, rivalEsBot]);

  // Apenas los dos están presentes, el host (determinístico por id)
  // dispara el broadcast de arranque — el otro lado lo recibe por el
  // handler de "broadcast" de arriba.
  useEffect(() => {
    if (estado !== "esperando" || !rivalPresente || !soyHost) return;
    const startAt = Date.now() + margenMs;
    channelRef.current?.send({ type: "broadcast", event: "start", payload: { startAt } });
    queueMicrotask(() => arrancarCuentaRegresiva(startAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, rivalPresente, soyHost]);

  return { estado, segundos, rivalPresente, empezarAhora: empezarUnaVez };
}
