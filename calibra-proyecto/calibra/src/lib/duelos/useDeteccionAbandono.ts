"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Params {
  duelId?: string | null;
  miUserId?: string | null;
  rivalId?: string | null;
  // Fase 3: un rival del Clan de Bots nunca se desconecta de verdad
  // (no abre canal — ver useArranqueSincronizado) así que este hook no
  // tiene nada que detectar ahí.
  rivalEsBot?: boolean;
  activo: boolean;
  onAbandonoDetectado: () => void;
}

const TIMEOUT_ABANDONO_MS = 60_000;

// Fase 3 ("Rankeds: rendición automática por desconexión") — durante
// la partida en sí (no la sala de espera, que ya tiene su propio
// timeout de 45s en useArranqueSincronizado), si el rival deja de
// responder al Presence de Realtime por más de 1 minuto seguido, se
// dispara onAbandonoDetectado (el caller decide qué hacer — normalmente
// llamar a /api/duelos/reclamar-abandono). Mismo canal `duelo:<id>` que
// ya usan useArranqueSincronizado y useProgresoEnVivo — Supabase permite
// varias suscripciones propias al mismo topic sin conflicto.
export function useDeteccionAbandono({ duelId, miUserId, rivalId, rivalEsBot = false, activo, onAbandonoDetectado }: Params) {
  const [rivalAusenteDesde, setRivalAusenteDesde] = useState<number | null>(null);
  const disparadoRef = useRef(false);

  useEffect(() => {
    if (!activo || rivalEsBot || !duelId || !miUserId || !rivalId) return;
    disparadoRef.current = false;
    const supabase = createClient();
    const channel = supabase.channel(`duelo:${duelId}`, {
      config: { presence: { key: `${miUserId}:vivo` } },
    });
    let cancelado = false;

    channel.on("presence", { event: "sync" }, () => {
      if (cancelado) return;
      const state = channel.presenceState();
      const presente = Object.keys(state).some((key) => key.startsWith(rivalId));
      setRivalAusenteDesde((prev) => {
        if (presente) return null;
        return prev ?? Date.now();
      });
    });

    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED" || cancelado) return;
      await channel.track({ user_id: miUserId, en: Date.now() });
    });

    return () => {
      cancelado = true;
      supabase.removeChannel(channel);
    };
  }, [activo, rivalEsBot, duelId, miUserId, rivalId]);

  useEffect(() => {
    if (rivalAusenteDesde === null || disparadoRef.current) return;
    const faltanMs = TIMEOUT_ABANDONO_MS - (Date.now() - rivalAusenteDesde);
    if (faltanMs <= 0) {
      disparadoRef.current = true;
      onAbandonoDetectado();
      return;
    }
    const timeout = setTimeout(() => {
      if (disparadoRef.current) return;
      disparadoRef.current = true;
      onAbandonoDetectado();
    }, faltanMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rivalAusenteDesde]);
}
