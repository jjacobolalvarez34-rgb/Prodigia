"use client";

import { useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Emotes de duelo (tienda ampliada, 0248): viajan por el MISMO canal en vivo del
// duelo (`duelo:<id>:vivo`, evento "emote", payload { userId, emote }), igual que
// en la app (mobile/src/lib/duelos.ts). useProgresoEnVivo registra acá su canal,
// así cualquier pantalla de duelo puede mandar y mostrar emotes sin abrir otro.

let canal: RealtimeChannel | null = null;
let miId: string | null = null;
let recibido: { valor: string; id: number } | null = null;
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((o) => o());
}

export function registrarCanalEmotes(c: RealtimeChannel | null, userId: string | null) {
  canal = c;
  miId = userId;
  if (!c) {
    recibido = null;
    emitir();
  }
}

export function recibirEmote(payload: unknown) {
  const d = payload as { userId?: string; emote?: string };
  if (!d || d.userId === miId || typeof d.emote !== "string") return;
  const id = Date.now();
  recibido = { valor: d.emote, id };
  emitir();
  setTimeout(() => {
    if (recibido?.id === id) {
      recibido = null;
      emitir();
    }
  }, 2500);
}

export function enviarEmote(valor: string) {
  if (!canal || !miId) return;
  canal.send({ type: "broadcast", event: "emote", payload: { userId: miId, emote: valor } });
}

export function useEmoteRecibido() {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => recibido,
    () => null
  );
}
