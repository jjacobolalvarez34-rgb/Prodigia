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
// Duelo en vivo (pedido del usuario, 2026-10-06): si el rival no entra a la sala
// en 2 minutos, el reto se cancela solo (no se juega a solas contra su registro).
// A los 30 s, SalaEsperaDuelo pregunta si quieres seguir esperando.
const TIMEOUT_ESPERA_MS_DEFAULT = 120_000;
export const PREGUNTAR_SEGUIR_MS = 30_000;

// Extraído de SalaDuelo.tsx (Numeria, tanda "Rediseño de Rankeds") para
// reusarlo en los 4 mundos (Fase 2 de la tanda "Duelos: llevar el
// progreso en vivo...") — Geografía/Enigmia/Quimia usaban un countdown
// puramente local (cada cliente arrancaba su propia cuenta regresiva de
// 3s sin coordinarse con el otro), que en rigor NO garantizaba que los
// dos arrancaran en el mismo instante real. Esto usa Presence (saber si
// el rival ya está en la sala) + Broadcast (el instante exacto de
// arranque, decidido por el host determinístico — el user_id menor en
// orden alfabético) sobre el canal `duelo:<id>:sala` (topic propio de
// este hook; ver comentario en el channel()).
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
  // Bug 2026-10-13 (web + celular): el inicio viajaba como hora absoluta del reloj del
  // anfitrión, y cada lado la comparaba con SU reloj; con relojes desfasados uno
  // arrancaba al instante y el otro se quedaba esperando. Ahora el aviso lleva también
  // cuándo se mandó (enviadoEn), y cada lado arranca a los (startAt − enviadoEn) ms de
  // recibirlo, sin mirar la hora del otro. El anfitrión guarda su inicio para
  // reenviarlo si el rival entra tarde o vuelve a la sala.
  const inicioHostRef = useRef<number | null>(null);
  const cuentaIniciadaRef = useRef(false);
  const soyHost = !!miUserId && !!rivalId && miUserId < rivalId;

  function empezarUnaVez() {
    if (empezoRef.current) return;
    empezoRef.current = true;
    onEmpezar();
  }

  function arrancarCuentaRegresiva(startAt: number) {
    if (cuentaIniciadaRef.current) return;
    cuentaIniciadaRef.current = true;
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
    // Canal propio con sufijo `:sala`: supabase.channel() REUSA la
    // instancia existente si el topic ya está registrado en el cliente
    // (no la reemplaza). Si dos hooks comparten el topic `duelo:<id>`
    // (este + useProgresoEnVivo) y uno remonta mientras el otro canal
    // todavía está dado de baja (removeChannel es async), el hook que
    // reintenta termina agregando callbacks de presence/broadcast sobre
    // un canal YA suscripto y Supabase lanza
    // "cannot add presence callbacks after subscribe()" → error boundary
    // → "Algo no cargó bien". Topic por hook elimina la carrera. Los dos
    // rivales usan el mismo sufijo y el Presence/Broadcast del arranque
    // sigue viajando entre clientes sin cambio de comportamiento.
    const channel = supabase.channel(`duelo:${duelId}:sala`, {
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
      const p = payload as { startAt: number; enviadoEn?: number };
      // Clientes viejos solo mandan startAt (hora absoluta de su reloj).
      arrancarCuentaRegresiva(typeof p.enviadoEn === "number" ? Date.now() + (p.startAt - p.enviadoEn) : p.startAt);
    });

    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED" || cancelado) return;
      setEstado("esperando");
      await channel.track({ user_id: miUserId, en: Date.now() });
    });

    // "agotado" = el rival no llegó y el reto se canceló (se borra el duelo pendiente).
    const timeoutAgotado = setTimeout(() => {
      if (cancelado || empezoRef.current) return;
      setEstado((actual) => (actual === "cuenta-regresiva" ? actual : "agotado"));
      supabase.rpc("rechazar_duelo", { p_duel_id: duelId }).then(
        () => undefined,
        () => undefined
      );
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
  // El anfitrión fija el inicio una sola vez y lo (re)envía cada vez que ve llegar al
  // rival: si el otro entra tarde o sale y vuelve, recibe lo que falta.
  useEffect(() => {
    if (estado === "conectando" || estado === "agotado" || !rivalPresente || !soyHost) return;
    if (inicioHostRef.current == null) inicioHostRef.current = Date.now() + margenMs;
    const startAt = inicioHostRef.current;
    channelRef.current?.send({ type: "broadcast", event: "start", payload: { startAt, enviadoEn: Date.now() } });
    queueMicrotask(() => arrancarCuentaRegresiva(startAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, rivalPresente, soyHost]);

  return { estado, segundos, rivalPresente, empezarAhora: empezarUnaVez };
}
