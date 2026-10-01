import type { RealtimeChannel } from "@supabase/supabase-js";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { sonar } from "~/lib/efectos";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { avisarEnVivo, canalConversacion, cargarConversacion, enviarMensajeDirecto, marcarConversacionLeida, type MensajeDirecto } from "~/lib/social";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Chat, { type MensajeChat } from "~/ui/Chat";
import { PantallaApilada } from "~/ui/Pantalla";

// Mensajes directos: mismo canal en vivo que la web (dm:<ids ordenados>), así la
// conversación se ve igual en los dos lados al instante.
export default function ChatDirecto() {
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre?: string }>();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? "";
  const { placa } = useJugador();
  const [mensajes, setMensajes] = useState<MensajeDirecto[]>([]);
  const canal = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!id || !miId) return;
    cargarConversacion(id)
      .then((m) => {
        setMensajes(m);
        recargarJugador();
      })
      .catch((e) => mostrarAviso(mensajeError(e), "error"));
    const c = supabase.channel(canalConversacion(miId, id));
    canal.current = c;
    c.on("broadcast", { event: "mensaje" }, ({ payload }) => {
      const m = payload as MensajeDirecto;
      setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      if (m.remitente_id !== miId) {
        sonar("tecla");
        marcarConversacionLeida(id);
      }
    });
    c.subscribe();
    return () => {
      canal.current = null;
      supabase.removeChannel(c);
    };
  }, [id, miId]);

  const lista: MensajeChat[] = mensajes.map((m) => ({
    id: m.id,
    autorId: m.remitente_id,
    autorNombre: m.remitente_id === miId ? "Tú" : nombre ?? null,
    autorAvatar: null,
    texto: m.texto,
    creado: m.created_at,
    citaTexto: m.responde_a_texto,
    citaAutor: m.responde_a_remitente_id ? (m.responde_a_remitente_id === miId ? "Tú" : nombre ?? "") : null,
  }));

  async function enviar(texto: string, cita: MensajeChat | null) {
    try {
      const fila = await enviarMensajeDirecto(id, texto, cita?.id ?? null);
      const nuevo: MensajeDirecto = {
        id: fila.id,
        remitente_id: miId,
        destinatario_id: id,
        texto,
        leido: false,
        created_at: fila.created_at,
        responde_a: cita?.id ?? null,
        responde_a_texto: cita ? cita.texto.slice(0, 140) : null,
        responde_a_remitente_id: cita?.autorId ?? null,
      };
      setMensajes((prev) => [...prev, nuevo]);
      canal.current?.send({ type: "broadcast", event: "mensaje", payload: nuevo });
      avisarEnVivo(`avisos-dm:${id}`, "dm", { mensajeId: fila.id, deId: miId, deNombre: placa?.nombre ?? null, deAvatarUrl: placa?.avatarUrl ?? null, texto });
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
      throw e;
    }
  }

  return (
    <PantallaApilada titulo={nombre || "Mensajes"} subtitulo="Mantén apretado un mensaje para responderlo" sinScroll>
      <Chat mensajes={lista} miId={miId} mostrarAutor={false} enviar={enviar} vacio="Todavía no hay mensajes. ¡Saluda!" />
    </PantallaApilada>
  );
}
