"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ArithmeticProblemType, FondoPerfil, FuenteNombre, AnimacionNombre } from "@/types/database";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";

export interface Solicitud {
  user_id: string;
  display_name: string | null;
}

// Rediseño "placa de amigo" (2026-09-22): antes solo traía nombre+ELO —
// ahora trae todo lo que PlacaAmigo.tsx necesita para verse igual que
// la tarjeta de /perfil/[userId] (fondo, marco, fuente, animación,
// color, título ya resuelto a texto). Mismas columnas que devuelve la
// RPC mis_amigos() (0197_amigos_placa_y_quitar.sql).
export interface Amigo {
  friend_id: string;
  display_name: string | null;
  elo_rating: number;
  avatar_url: string | null;
  marco_perfil: string;
  fondo_perfil: FondoPerfil;
  fondo_perfil_url: string | null;
  titulo_activo: string | null;
  titulo_nombre: string | null;
  color_nombre: string | null;
  fuente_nombre: FuenteNombre;
  animacion_nombre: AnimacionNombre;
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
  const t = useTranslations("Social");
  const router = useRouter();
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [amigos, setAmigos] = useState(amigosIniciales);
  const [enviadas, setEnviadas] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Descarta una respuesta que llega tarde si mientras tanto se disparó
  // una búsqueda más nueva (typeahead rápido puede desordenar las
  // respuestas de red) — cada llamada a buscar() se identifica con un
  // número creciente, solo la última en salir puede escribir resultados.
  const idBusquedaRef = useRef(0);

  async function buscar(query: string) {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    const miId = ++idBusquedaRef.current;
    setBuscando(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("buscar_usuarios", { p_query: query.trim() });
    if (miId !== idBusquedaRef.current) return;
    setBuscando(false);
    if (rpcError) {
      setError(t("hook.errorBuscar"));
      return;
    }
    setResultados((data ?? []) as ResultadoBusqueda[]);
  }

  // Pedido en vivo (2026-09-15): "sería bueno que se cargara automático,
  // en vez de darle a buscar" — typeahead con debounce de 350ms en vez
  // de esperar el submit del form (que sigue funcionando igual, por si
  // alguien prefiere Enter).
  useEffect(() => {
    // setTimeout incluso para el caso "borrar resultados" — nunca
    // setState directo en el cuerpo del efecto (react-hooks/set-state-in-effect),
    // mismo criterio que el resto del proyecto (ver DecryptedText.tsx/Shuffle.tsx).
    if (consulta.trim().length < 2) {
      const id = setTimeout(() => setResultados([]), 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      void buscar(consulta);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- buscar es estable dentro del hook, no hace falta como dep
  }, [consulta]);

  async function enviarSolicitud(friendId: string) {
    setError(null);
    const res = await fetch("/api/amigos/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: friendId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t("hook.errorEnviarSolicitud"));
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
      setError(data.error ?? t("hook.errorProcesarSolicitud"));
      return;
    }
    const solicitud = solicitudes.find((s) => s.user_id === userId);
    setSolicitudes((prev) => prev.filter((s) => s.user_id !== userId));
    if (aceptar && solicitud) {
      // Datos de placa mínimos (sin fondo/marco/fuente/animación/título
      // propios): el resto de los campos de Amigo llegan recién en el
      // próximo mis_amigos() real (recarga de página) — no vale la pena
      // ir a buscarlos acá solo para pintar una placa neutra un rato.
      setAmigos((prev) => [
        ...prev,
        {
          friend_id: userId,
          display_name: solicitud.display_name,
          elo_rating: 800,
          avatar_url: null,
          marco_perfil: "ninguno",
          fondo_perfil: "ninguno",
          fondo_perfil_url: null,
          titulo_activo: null,
          titulo_nombre: null,
          color_nombre: null,
          fuente_nombre: "default",
          animacion_nombre: "ninguna",
        },
      ]);
    }
  }

  async function quitarAmigo(friendId: string) {
    setError(null);
    const res = await fetch("/api/amigos/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_id: friendId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? t("hook.errorQuitarAmigo"));
      return;
    }
    setAmigos((prev) => prev.filter((a) => a.friend_id !== friendId));
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
      setError(data.error ?? t("hook.errorCrearDuelo"));
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
    quitarAmigo,
  };
}

export type UseAmigosReturn = ReturnType<typeof useAmigos>;
