import type { RealtimeChannel } from "@supabase/supabase-js";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { fondoChatDe } from "@/lib/mensajes/fondosChat";
import { cargarRetosChat, hayRetoPendiente, mandarRetoAlChat, responderRetoChat, type AccionReto, type EstadoReto, type LlamarRpc, type RetoChat } from "@/lib/mensajes/retosChat";
import { sonar } from "~/lib/efectos";
import { cargarEstadoEdad, errorDeChat, useEdad } from "~/lib/edad";
import { recargarJugador, useJugador } from "~/lib/jugador";
import { useSesion } from "~/lib/sesion";
import { avisarEnVivo, borrarMensajeDirecto, canalConversacion, cargarConversacion, enviarMensajeDirecto, fondoDeChat, marcarConversacionLeida, TEXTO_ELIMINADO, type MensajeDirecto } from "~/lib/social";
import { placaBasica } from "~/lib/placa";
import { mensajeError, supabase } from "~/lib/supabase";
import { mostrarAviso } from "~/ui/Aviso";
import Chat, { type MensajeChat } from "~/ui/Chat";
import ElegirFondoChat from "~/ui/ElegirFondoChat";
import FondoChat from "~/ui/FondoChat";
import { IconoCompetir } from "~/ui/Iconos";
import RetarAmigo from "~/ui/RetarAmigo";
import RetoChatTarjeta from "~/ui/RetoChatTarjeta";
import { PantallaApilada } from "~/ui/Pantalla";
import PreguntaEdad from "~/ui/PreguntaEdad";
import { color } from "~/tema";

// 0298: un mensaje puede ser un reto a duelo (llega así por el canal en vivo).
type MensajeConReto = MensajeDirecto & { reto?: RetoChat };

const rpc: LlamarRpc = (fn, args) => supabase.rpc(fn, args);

function hora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Marca un mensaje como borrado (y su cita en las respuestas) sin sacarlo de la lista.
function marcarBorrado(lista: MensajeDirecto[], id: string): MensajeDirecto[] {
  return lista.map((x) =>
    x.id === id ? { ...x, borrado: true, texto: TEXTO_ELIMINADO } : x.responde_a === id ? { ...x, responde_a_texto: TEXTO_ELIMINADO } : x
  );
}

// Mensajes directos: mismo canal en vivo que la web (dm:<ids ordenados>), así la
// conversación se ve igual en los dos lados al instante.
export default function ChatDirecto() {
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre?: string }>();
  const { sesion } = useSesion();
  const miId = sesion?.user.id ?? "";
  const { placa } = useJugador();
  const [mensajes, setMensajes] = useState<MensajeDirecto[]>([]);
  const edad = useEdad();
  const [pidiendoEdad, setPidiendoEdad] = useState(false);
  // La base avisa si el amigo es menor de 13: desde ahí, solo frases en esta charla.
  const [frasesPorAmigo, setFrasesPorAmigo] = useState(false);
  // Fondo de la conversación (0262): lo ven los dos y cambia en vivo.
  const [fondo, setFondo] = useState<string | null>(null);
  const [eligiendoFondo, setEligiendoFondo] = useState(false);
  // Retos a duelo dentro del chat (0298), por id de mensaje. Sin la migración
  // queda vacío y los retos se ven como texto.
  const router = useRouter();
  const [retos, setRetos] = useState<Record<string, RetoChat>>({});
  const [retando, setRetando] = useState(false);
  const [retoOcupado, setRetoOcupado] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    cargarEstadoEdad();
  }, []);
  const canal = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!id || !miId) return;
    fondoDeChat(id).then(setFondo);
    cargarRetosChat(rpc, id).then(setRetos);
    cargarConversacion(id)
      .then((m) => {
        setMensajes(m);
        recargarJugador();
      })
      .catch((e) => mostrarAviso(mensajeError(e), "error"));
    const c = supabase.channel(canalConversacion(miId, id));
    canal.current = c;
    c.on("broadcast", { event: "mensaje" }, ({ payload }) => {
      const m = payload as MensajeConReto;
      setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      const reto = m.reto;
      if (reto) setRetos((prev) => ({ ...prev, [m.id]: reto }));
      if (m.remitente_id !== miId) {
        sonar("tecla");
        marcarConversacionLeida(id);
      }
    });
    c.on("broadcast", { event: "reto" }, ({ payload }) => {
      const { mensajeId, estado } = payload as { mensajeId: string; estado: EstadoReto };
      setRetos((prev) => (prev[mensajeId] ? { ...prev, [mensajeId]: { ...prev[mensajeId], estado } } : prev));
    });
    c.on("broadcast", { event: "fondo" }, ({ payload }) => {
      setFondo((payload as { fondo: string | null }).fondo);
    });
    c.on("broadcast", { event: "borrado" }, ({ payload }) => {
      setMensajes((prev) => marcarBorrado(prev, (payload as { id: string }).id));
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
    borrado: !!m.borrado,
  }));

  const datosFondo = fondoChatDe(fondo);

  // Mientras haya un reto pendiente: cuenta regresiva cada segundo y el estado se
  // vuelve a pedir cada 8 s (por si se respondió desde el aviso o la sala se cansó).
  const pendiente = hayRetoPendiente(retos, ahora);
  useEffect(() => {
    if (!pendiente || !id) return;
    const tic = setInterval(() => setAhora(Date.now()), 1000);
    const consulta = setInterval(() => {
      cargarRetosChat(rpc, id).then((r) => {
        if (Object.keys(r).length) setRetos(r);
      });
    }, 8000);
    return () => {
      clearInterval(tic);
      clearInterval(consulta);
    };
  }, [pendiente, id]);

  // El duelo ya está creado (RetarAmigo): se deja el reto como mensaje del chat.
  async function retoCreado(duelId: string, mundo: string, opcion: string) {
    const msg = await mandarRetoAlChat(rpc, duelId);
    if (!msg) return;
    const esNumeria = mundo === "numeria";
    const reto: RetoChat = { mensajeId: msg.id, duelId, retadorId: miId, mundo, subTipo: esNumeria ? null : opcion, operationType: esNumeria ? opcion : null, estado: "pendiente", expiraAt: msg.expiraAt };
    const nuevo: MensajeConReto = {
      id: msg.id,
      remitente_id: miId,
      destinatario_id: id,
      texto: msg.texto,
      leido: false,
      created_at: msg.createdAt,
      responde_a: null,
      responde_a_texto: null,
      responde_a_remitente_id: null,
      reto,
    };
    setMensajes((prev) => [...prev, nuevo]);
    setRetos((prev) => ({ ...prev, [msg.id]: reto }));
    await canal.current?.send({ type: "broadcast", event: "mensaje", payload: nuevo });
    avisarEnVivo(`avisos-dm:${id}`, "dm", { mensajeId: msg.id, deId: miId, deNombre: placa?.nombre ?? null, deAvatarUrl: placa?.avatarUrl ?? null, texto: msg.texto });
  }

  async function responderReto(reto: RetoChat, accion: AccionReto) {
    setRetoOcupado(reto.mensajeId);
    try {
      const estado = await responderRetoChat(rpc, reto.mensajeId, accion);
      setRetos((prev) => ({ ...prev, [reto.mensajeId]: { ...reto, estado } }));
      await canal.current?.send({ type: "broadcast", event: "reto", payload: { mensajeId: reto.mensajeId, estado } });
      if (accion === "aceptar" && estado === "aceptada") router.push({ pathname: "/duelo/[id]", params: { id: reto.duelId } });
      else if (accion === "aceptar") mostrarAviso(estado === "vencida" ? "El reto ya venció." : "El reto ya no está disponible.", "error");
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    } finally {
      setRetoOcupado(null);
    }
  }

  async function borrar(m: MensajeChat) {
    try {
      await borrarMensajeDirecto(m.id);
      setMensajes((prev) => marcarBorrado(prev, m.id));
      canal.current?.send({ type: "broadcast", event: "borrado", payload: { id: m.id } });
    } catch (e) {
      mostrarAviso(mensajeError(e), "error");
    }
  }

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
      const amigable = errorDeChat(e);
      if (amigable?.includes("frases")) setFrasesPorAmigo(true);
      mostrarAviso(amigable ?? mensajeError(e), "error");
      throw e;
    }
  }

  return (
    <PantallaApilada
      titulo={nombre || "Mensajes"}
      subtitulo="Mantén apretado un mensaje para responderlo o borrarlo"
      sinScroll
      derecha={
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Pressable onPress={() => setRetando(true)} hitSlop={10} accessibilityLabel="Retar a duelo" style={{ padding: 6 }}>
          <IconoCompetir tam={22} c={color.texto2} />
        </Pressable>
        <Pressable onPress={() => setEligiendoFondo(true)} hitSlop={10} accessibilityLabel="Fondo del chat" style={{ padding: 6 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color.texto2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4z" />
            <Circle cx={7.5} cy={11} r={1} fill={color.texto2} />
            <Circle cx={10.5} cy={7} r={1} fill={color.texto2} />
            <Circle cx={15} cy={7.5} r={1} fill={color.texto2} />
          </Svg>
        </Pressable>
        </View>
      }
    >
      <View style={{ flex: 1 }}>
        {datosFondo && <FondoChat fondo={datosFondo} />}
        <Chat
          mensajes={lista}
          miId={miId}
          mostrarAutor={false}
          enviar={enviar}
          borrar={borrar}
          vacio="Todavía no hay mensajes. ¡Saluda!"
          soloFrases={!!edad?.esMenor || frasesPorAmigo}
          ocultarLibres={!!edad?.esMenor}
          pedirEdad={edad && !edad.tieneFecha ? () => setPidiendoEdad(true) : undefined}
          especial={(m, mio) => {
            const reto = retos[m.id];
            if (!reto) return null;
            return (
              <RetoChatTarjeta
                reto={reto}
                mio={mio}
                nombreAmigo={nombre || "tu amigo"}
                ahora={ahora}
                ocupado={retoOcupado === m.id}
                hora={hora(m.creado)}
                onAccion={(accion) => responderReto(reto, accion)}
                onIrASala={() => router.push({ pathname: "/duelo/[id]", params: { id: reto.duelId } })}
              />
            );
          }}
        />
      </View>
      {eligiendoFondo && (
        <ElegirFondoChat
          visible
          amigoId={id}
          nombreAmigo={nombre || "tu amigo"}
          actual={fondo}
          onCerrar={() => setEligiendoFondo(false)}
          onPuesto={(f) => {
            setFondo(f);
            canal.current?.send({ type: "broadcast", event: "fondo", payload: { fondo: f } });
          }}
        />
      )}
      {retando && <RetarAmigo visible amigo={placaBasica(id, nombre ?? null)} onCerrar={() => setRetando(false)} onCreado={retoCreado} />}
      <PreguntaEdad visible={pidiendoEdad} onCerrar={() => setPidiendoEdad(false)} />
    </PantallaApilada>
  );
}
