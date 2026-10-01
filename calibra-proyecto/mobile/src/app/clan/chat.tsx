import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { enviarMensajeClan, mensajesDeClan, type MensajeClan } from "~/lib/clanes";
import { sonar } from "~/lib/efectos";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { avisarEnVivo } from "~/lib/social";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Chat, { type MensajeChat } from "~/ui/Chat";
import { PantallaApilada, Vacio } from "~/ui/Pantalla";

// Chat del clan: canal en vivo clan-chat:<id>, el mismo que ChatDeClan.tsx de la web.
export default function ChatClan() {
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? "";
  const { placa } = useJugador();
  const [clan, setClan] = useState<{ id: string; nombre: string } | null | undefined>(undefined);
  const [mensajes, setMensajes] = useState<MensajeClan[]>([]);
  const canal = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    supabase.rpc("mi_clan").then(({ data }) => {
      const c = (data as { clan_id: string; nombre: string }[] | null)?.[0];
      setClan(c ? { id: c.clan_id, nombre: c.nombre } : null);
    });
  }, []);

  useEffect(() => {
    if (!clan) return;
    mensajesDeClan(clan.id).then((m) => {
      setMensajes(m);
      recargarJugador();
    });
    const c = supabase.channel(`clan-chat:${clan.id}`);
    canal.current = c;
    c.on("broadcast", { event: "mensaje" }, ({ payload }) => {
      const m = payload as MensajeClan;
      setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      if (m.autor_id !== miId) {
        sonar("tecla");
        supabase.rpc("marcar_chat_clan_leido");
      }
    });
    c.subscribe();
    return () => {
      canal.current = null;
      supabase.removeChannel(c);
    };
  }, [clan, miId]);

  if (clan === null) {
    return (
      <PantallaApilada titulo="Chat del clan">
        <Vacio titulo="No estás en un clan" texto="Únete a uno desde Social → Clan." />
      </PantallaApilada>
    );
  }

  const lista: MensajeChat[] = mensajes.map((m) => ({
    id: m.id,
    autorId: m.autor_id,
    autorNombre: m.autor_id === miId ? placa?.nombre ?? "Tú" : m.autor_nombre,
    autorAvatar: m.autor_id === miId ? placa?.avatarUrl ?? null : m.autor_avatar_url,
    texto: m.texto,
    creado: m.created_at,
    citaTexto: m.responde_a_texto,
    citaAutor: m.responde_a_autor_nombre,
  }));

  async function enviar(texto: string, cita: MensajeChat | null) {
    if (!clan) return;
    try {
      const fila = await enviarMensajeClan(texto, cita?.id ?? null);
      const nuevo: MensajeClan = {
        id: fila.id,
        autor_id: miId,
        autor_nombre: placa?.nombre ?? null,
        autor_avatar_url: placa?.avatarUrl ?? null,
        texto,
        created_at: fila.created_at,
        responde_a: cita?.id ?? null,
        responde_a_texto: cita ? cita.texto.slice(0, 140) : null,
        responde_a_autor_id: cita?.autorId ?? null,
        responde_a_autor_nombre: cita?.autorNombre ?? null,
      };
      setMensajes((prev) => [...prev, nuevo]);
      canal.current?.send({ type: "broadcast", event: "mensaje", payload: nuevo });
      avisarEnVivo(`avisos-clan:${clan.id}`, "clan", { mensajeId: fila.id, autorId: miId, autorNombre: placa?.nombre ?? null, texto });
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
      throw e;
    }
  }

  return (
    <PantallaApilada titulo={clan?.nombre ?? "Chat del clan"} subtitulo="Chat del clan" sinScroll>
      <Chat mensajes={lista} miId={miId} mostrarAutor enviar={enviar} vacio="Nadie escribió todavía. ¡Rompe el hielo!" />
    </PantallaApilada>
  );
}
