// Duelos en vivo: port de useArranqueSincronizado.ts y useProgresoEnVivo.ts de la
// web, con los MISMOS canales (duelo:<id>:sala y duelo:<id>:vivo), así un duelo
// entre alguien en la app y alguien en la web arranca al mismo tiempo y cada uno ve
// el avance del otro.
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

export type EstadoArranque = "conectando" | "esperando" | "cuenta-regresiva" | "agotado";

const MARGEN_MS = 4_000;
// Duelo en vivo: a los 30 s sin rival se pregunta si seguir esperando; a los 2 min
// el reto se cancela solo (no se juega a solas contra su registro).
const PREGUNTAR_MS = 30_000;
const CANCELAR_MS = 120_000;

export function useArranqueSincronizado({
  duelId,
  miUserId,
  rivalId,
  sinEspera,
  onEmpezar,
}: {
  duelId: string | null;
  miUserId: string | null;
  rivalId: string | null;
  // Rival bot o que ya jugó su lado (fantasma): no hace falta esperarlo.
  sinEspera: boolean;
  onEmpezar: () => void;
}) {
  const [estado, setEstado] = useState<EstadoArranque>("conectando");
  const [rivalPresente, setRivalPresente] = useState(false);
  const [segundos, setSegundos] = useState<number | null>(null);
  const [preguntar, setPreguntar] = useState(false);
  const canalRef = useRef<RealtimeChannel | null>(null);
  const empezoRef = useRef(false);
  const onEmpezarRef = useRef(onEmpezar);
  useEffect(() => {
    onEmpezarRef.current = onEmpezar;
  }, [onEmpezar]);
  const soyHost = !!miUserId && !!rivalId && miUserId < rivalId;

  function empezarUnaVez() {
    if (empezoRef.current) return;
    empezoRef.current = true;
    onEmpezarRef.current();
  }

  function cuentaRegresiva(startAt: number) {
    setEstado("cuenta-regresiva");
    const tick = () => {
      const faltan = startAt - Date.now();
      if (faltan <= 0) {
        setSegundos(0);
        empezarUnaVez();
        return;
      }
      setSegundos(Math.ceil(faltan / 1000));
      setTimeout(tick, 100);
    };
    tick();
  }

  useEffect(() => {
    if (!sinEspera || !duelId || !miUserId) return;
    const startAt = Date.now() + MARGEN_MS;
    queueMicrotask(() => cuentaRegresiva(startAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinEspera, duelId, miUserId]);

  useEffect(() => {
    if (sinEspera || !duelId || !miUserId || !rivalId) return;
    let cancelado = false;
    const canal = supabase.channel(`duelo:${duelId}:sala`, { config: { presence: { key: miUserId } } });
    canalRef.current = canal;
    canal.on("presence", { event: "sync" }, () => {
      if (!cancelado) setRivalPresente(rivalId in canal.presenceState());
    });
    canal.on("broadcast", { event: "start" }, ({ payload }) => {
      if (cancelado || empezoRef.current) return;
      cuentaRegresiva((payload as { startAt: number }).startAt);
    });
    canal.subscribe(async (s) => {
      if (s !== "SUBSCRIBED" || cancelado) return;
      setEstado("esperando");
      await canal.track({ user_id: miUserId, en: Date.now() });
    });
    const pregunta = setTimeout(() => {
      if (!cancelado && !empezoRef.current) setPreguntar(true);
    }, PREGUNTAR_MS);
    // "agotado" = el rival no llegó: el reto se cancela (se borra el duelo pendiente).
    const agotado = setTimeout(() => {
      if (cancelado || empezoRef.current) return;
      setPreguntar(false);
      setEstado((e) => (e === "cuenta-regresiva" ? e : "agotado"));
      supabase.rpc("rechazar_duelo", { p_duel_id: duelId }).then(
        () => undefined,
        () => undefined
      );
    }, CANCELAR_MS);
    return () => {
      cancelado = true;
      clearTimeout(pregunta);
      clearTimeout(agotado);
      supabase.removeChannel(canal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelId, miUserId, rivalId, sinEspera]);

  useEffect(() => {
    if (estado !== "esperando" || !rivalPresente || !soyHost) return;
    const startAt = Date.now() + 10_000;
    canalRef.current?.send({ type: "broadcast", event: "start", payload: { startAt } });
    queueMicrotask(() => cuentaRegresiva(startAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, rivalPresente, soyHost]);

  return { estado, segundos, rivalPresente, preguntar: preguntar && estado === "esperando" && !rivalPresente, seguirEsperando: () => setPreguntar(false) };
}

export interface ProgresoDuelo {
  respondidos: number;
  correctos: number;
  racha: number;
}

export function useProgresoEnVivo(duelId: string | null, miUserId: string | null) {
  const [rival, setRival] = useState<ProgresoDuelo | null>(null);
  // Emote que mandó el rival (tienda ampliada, 0248), con un id para volver a animarlo.
  const [emote, setEmote] = useState<{ valor: string; id: number } | null>(null);
  const canalRef = useRef<RealtimeChannel | null>(null);
  useEffect(() => {
    if (!duelId || !miUserId) return;
    const canal = supabase.channel(`duelo:${duelId}:vivo`);
    canalRef.current = canal;
    canal.on("broadcast", { event: "progreso" }, ({ payload }) => {
      const d = payload as ProgresoDuelo & { userId: string };
      if (d.userId !== miUserId) setRival({ respondidos: d.respondidos, correctos: d.correctos, racha: d.racha });
    });
    canal.on("broadcast", { event: "emote" }, ({ payload }) => {
      const d = payload as { userId: string; emote: string };
      if (d.userId !== miUserId && typeof d.emote === "string") {
        const id = Date.now();
        setEmote({ valor: d.emote, id });
        setTimeout(() => setEmote((x) => (x?.id === id ? null : x)), 2500);
      }
    });
    canal.subscribe();
    return () => {
      canalRef.current = null;
      supabase.removeChannel(canal);
    };
  }, [duelId, miUserId]);

  function emitir(p: ProgresoDuelo) {
    if (miUserId) canalRef.current?.send({ type: "broadcast", event: "progreso", payload: { ...p, userId: miUserId } });
  }
  function enviarEmote(valor: string) {
    if (miUserId) canalRef.current?.send({ type: "broadcast", event: "emote", payload: { userId: miUserId, emote: valor } });
  }
  return { rival, emitir, emote, enviarEmote };
}
