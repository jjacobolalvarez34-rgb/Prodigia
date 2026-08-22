"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ArithmeticProblemType } from "@/types/database";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";

export interface Solicitud {
  user_id: string;
  display_name: string | null;
}

export interface Amigo {
  friend_id: string;
  display_name: string | null;
  elo_rating: number;
}

export interface ResultadoBusqueda {
  id: string;
  display_name: string | null;
}

// Fase 3 del rediseño de Social: la lógica de amigos (buscar, pedir,
// aceptar/rechazar, retar) se usa en DOS lugares ahora — la pestaña
// "Amigos" (gestión completa) y la barra lateral fija del Feed (acceso
// rápido). Vive acá, en un solo hook, para que ninguno de los dos
// termine con su propia copia divergente — SocialClient lo llama UNA
// vez y reparte el mismo estado a los dos.
export function useAmigos(solicitudesIniciales: Solicitud[], amigosIniciales: Amigo[]) {
  const router = useRouter();
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [amigos, setAmigos] = useState(amigosIniciales);
  const [enviadas, setEnviadas] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function buscar(query: string) {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("buscar_usuarios", { p_query: query.trim() });
    setBuscando(false);
    if (rpcError) {
      setError("No se pudo buscar. Probá de nuevo.");
      return;
    }
    setResultados((data ?? []) as ResultadoBusqueda[]);
  }

  async function enviarSolicitud(friendId: string) {
    setError(null);
    const res = await fetch("/api/amigos/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: friendId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar la solicitud.");
      return;
    }
    setEnviadas((prev) => new Set(prev).add(friendId));
  }

  async function responder(userId: string, aceptar: boolean) {
    setError(null);
    const res = await fetch("/api/amigos/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, aceptar }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo procesar la solicitud.");
      return;
    }
    const solicitud = solicitudes.find((s) => s.user_id === userId);
    setSolicitudes((prev) => prev.filter((s) => s.user_id !== userId));
    if (aceptar && solicitud) {
      setAmigos((prev) => [...prev, { friend_id: userId, display_name: solicitud.display_name, elo_rating: 800 }]);
    }
  }

  // `opcion` es la operación (Numeria) o el sub_tipo (continente de
  // Geografía, categoría de Enigmia, modo de Quimia) — a diferencia del
  // matchmaking (que lo sortea por rango), acá lo elige quien reta, es
  // un desafío directo a una persona puntual.
  async function retar(friendId: string, mundo: MundoDuelo, opcion: string) {
    setError(null);
    const esNumeria = mundo === "numeria";
    const res = await fetch("/api/amigos/retar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        friend_id: friendId,
        mundo,
        operation_type: esNumeria ? opcion : null,
        sub_tipo: esNumeria ? null : opcion,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el duelo.");
      return;
    }
    router.push(hrefDuelo(mundo, esNumeria ? (opcion as ArithmeticProblemType) : null, data.duel_id, esNumeria ? null : opcion));
  }

  return {
    consulta,
    setConsulta,
    resultados,
    buscando,
    solicitudes,
    amigos,
    enviadas,
    error,
    buscar,
    enviarSolicitud,
    responder,
    retar,
  };
}

export type UseAmigosReturn = ReturnType<typeof useAmigos>;
