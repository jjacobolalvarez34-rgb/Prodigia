"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { CANAL_SALA, idAlAzar } from "@/lib/ganaleModelo/sala";

// Canal en vivo de la sala de «Gánale al modelo» (Supabase Realtime: solo mensajes y
// presencia, nada en la base). El proyector entra como «mesa» y cada celular como
// «jugador» cuando pone su nombre.

export type RolSala = "mesa" | "jugador";
export interface Presente {
  id: string;
  rol: RolSala;
  nombre: string;
}
type Oyente = (evento: string, payload: Record<string, unknown>) => void;

const EVENTOS = ["mano", "crupier", "fin", "estado", "hola", "aviso"] as const;

export function useCanalSala(rol: RolSala) {
  const [id] = useState(() => idAlAzar());
  const [conectado, setConectado] = useState(false);
  const [presentes, setPresentes] = useState<Presente[]>([]);
  // Una vez que se vio la mesa, el celular se queda en la sala aunque la conexión parpadee.
  const [huboMesa, setHuboMesa] = useState(false);
  const canalRef = useRef<RealtimeChannel | null>(null);
  const oyentes = useRef(new Set<Oyente>());

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase.channel(CANAL_SALA, { config: { presence: { key: id }, broadcast: { self: false } } });
    canal.on("presence", { event: "sync" }, () => {
      const estado = canal.presenceState() as Record<string, { rol?: RolSala; nombre?: string }[]>;
      const lista = Object.entries(estado).map(([k, metas]) => ({ id: k, rol: metas[0]?.rol ?? "jugador", nombre: metas[0]?.nombre ?? "" }));
      setPresentes(lista);
      if (lista.some((p) => p.rol === "mesa")) setHuboMesa(true);
    });
    for (const evento of EVENTOS) {
      canal.on("broadcast", { event: evento }, ({ payload }) => {
        for (const o of oyentes.current) o(evento, (payload ?? {}) as Record<string, unknown>);
      });
    }
    canal.subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      setConectado(true);
      if (rol === "mesa") canal.track({ rol: "mesa", nombre: "mesa" });
      else canal.send({ type: "broadcast", event: "hola", payload: { id } });
    });
    canalRef.current = canal;
    return () => {
      canalRef.current = null;
      supabase.removeChannel(canal);
    };
  }, [id, rol]);

  const enviar = useCallback((evento: (typeof EVENTOS)[number], payload: Record<string, unknown>) => {
    canalRef.current?.send({ type: "broadcast", event: evento, payload });
  }, []);

  const presentarse = useCallback((nombre: string) => {
    canalRef.current?.track({ rol: "jugador", nombre });
  }, []);

  const escuchar = useCallback((o: Oyente) => {
    oyentes.current.add(o);
    return () => {
      oyentes.current.delete(o);
    };
  }, []);

  const mesaPresente = presentes.some((p) => p.rol === "mesa");
  const jugadores = presentes.filter((p) => p.rol === "jugador");
  return { id, conectado, presentes, jugadores, mesaPresente, huboMesa, enviar, presentarse, escuchar };
}

export type CanalSala = ReturnType<typeof useCanalSala>;
