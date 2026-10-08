// Social: amigos, solicitudes, mensajes directos y presencia. Mismas tablas, RPC y
// canales en vivo que la web (social/, amigos/, mensajes/util.ts), así un mensaje
// mandado desde la app aparece al instante en la web y al revés.
import type { RealtimeChannel } from "@supabase/supabase-js";
import { placaDesdeFila, type PlacaDatos } from "./placa";
import { supabase } from "./supabase";

export async function misAmigos(): Promise<PlacaDatos[]> {
  const { data } = await supabase.rpc("mis_amigos");
  return (
    (data as {
      friend_id: string;
      display_name: string | null;
      elo_rating: number | null;
      avatar_url: string | null;
      marco_perfil: string | null;
      fondo_perfil: string | null;
      fondo_perfil_url: string | null;
      titulo_nombre: string | null;
      color_nombre: string | null;
      fuente_nombre: string | null;
      animacion_nombre: string | null;
      nivel_cuenta: number | null;
      puntos_total: number | null;
    }[] | null) ?? []
  ).map((f) => placaDesdeFila({ ...f, id: f.friend_id }));
}

export async function solicitudesPendientes(): Promise<{ user_id: string; display_name: string | null }[]> {
  const { data } = await supabase.rpc("mis_solicitudes_pendientes");
  return (data as { user_id: string; display_name: string | null }[] | null) ?? [];
}

export async function responderSolicitud(miId: string, deId: string, aceptar: boolean) {
  const consulta = aceptar
    ? supabase.from("friendships").update({ estado: "aceptada" }).eq("user_id", deId).eq("friend_id", miId)
    : supabase.from("friendships").delete().eq("user_id", deId).eq("friend_id", miId);
  const { error } = await consulta;
  if (error) throw error;
}

export async function pedirAmistad(miId: string, amigoId: string) {
  const { error } = await supabase.from("friendships").insert({ user_id: miId, friend_id: amigoId, estado: "pendiente" });
  if (error) {
    if (error.code === "23505") throw new Error("Ya le mandaste una solicitud.");
    throw error;
  }
}

export async function quitarAmigo(amigoId: string) {
  const { error } = await supabase.rpc("eliminar_amistad", { p_friend_id: amigoId });
  if (error) throw error;
}

export async function estadoAmistad(miId: string, otroId: string): Promise<"ninguna" | "amigos" | "enviada" | "recibida"> {
  const { data } = await supabase
    .from("friendships")
    .select("user_id, friend_id, estado")
    .or(`and(user_id.eq.${miId},friend_id.eq.${otroId}),and(user_id.eq.${otroId},friend_id.eq.${miId})`);
  const fila = (data as { user_id: string; friend_id: string; estado: string }[] | null)?.[0];
  if (!fila) return "ninguna";
  if (fila.estado === "aceptada") return "amigos";
  return fila.user_id === miId ? "enviada" : "recibida";
}

export async function buscarJugadores(texto: string): Promise<{ id: string; display_name: string | null }[]> {
  if (texto.trim().length < 2) return [];
  const { data } = await supabase.rpc("buscar_usuarios", { p_query: texto.trim() });
  return (data as { id: string; display_name: string | null }[] | null) ?? [];
}

// ---------- Mensajes ----------

export interface Conversacion {
  amigo_id: string;
  amigo_nombre: string | null;
  amigo_avatar_url: string | null;
  ultimo_texto: string | null;
  ultimo_remitente_id: string | null;
  ultimo_created_at: string | null;
  no_leidos: number;
}

export async function misConversaciones(): Promise<Conversacion[]> {
  const { data } = await supabase.rpc("mis_conversaciones");
  return ((data as Conversacion[] | null) ?? []).map((c) => ({ ...c, no_leidos: Number(c.no_leidos ?? 0) }));
}

export interface MensajeDirecto {
  id: string;
  remitente_id: string;
  destinatario_id: string;
  texto: string;
  leido: boolean;
  created_at: string;
  responde_a: string | null;
  responde_a_texto: string | null;
  responde_a_remitente_id: string | null;
  // 0256: borrado por quien lo mandó (el texto llega como «Mensaje eliminado»).
  borrado?: boolean;
}

// Abrir la conversación ya la marca como leída en el servidor.
export async function cargarConversacion(amigoId: string): Promise<MensajeDirecto[]> {
  const { data, error } = await supabase.rpc("mi_conversacion", { p_amigo_id: amigoId });
  if (error) throw error;
  return (data as MensajeDirecto[] | null) ?? [];
}

// ---------- Fondo del chat (0262) ----------
export async function fondoDeChat(amigoId: string): Promise<string | null> {
  const { data } = await supabase.rpc("fondo_chat", { p_amigo: amigoId });
  return (data as string | null) ?? null;
}

export async function misFondosChat(userId: string): Promise<string[]> {
  const { data } = await supabase.from("profiles").select("fondos_chat_desbloqueados").eq("id", userId).maybeSingle();
  return (data as { fondos_chat_desbloqueados: string[] } | null)?.fondos_chat_desbloqueados ?? [];
}

// Devuelve las Chispas que quedan.
export async function comprarFondoChat(slug: string): Promise<number> {
  const { data, error } = await supabase.rpc("comprar_fondo_chat", { p_fondo: slug });
  if (error) throw error;
  return data as number;
}

export async function ponerFondoChat(amigoId: string, slug: string) {
  const { error } = await supabase.rpc("poner_fondo_chat", { p_amigo: amigoId, p_fondo: slug });
  if (error) throw error;
}

export function canalConversacion(a: string, b: string): string {
  return `dm:${[a, b].sort().join(":")}`;
}

export async function enviarMensajeDirecto(destinatarioId: string, texto: string, respondeA: string | null) {
  const { data, error } = await supabase.rpc("enviar_mensaje_directo", { p_destinatario_id: destinatarioId, p_texto: texto, p_responde_a: respondeA });
  if (error) {
    if (error.message.includes("muy rápido")) throw new Error("Vas muy rápido. Espera un momento.");
    if (error.message.includes("término no permitido")) throw new Error("Tu mensaje tiene una palabra que no está permitida.");
    throw error;
  }
  return (data as { id: string; created_at: string }[])[0];
}

// Aviso en vivo para quien no tiene el chat abierto (mismo canal que la web).
export function avisarEnVivo(canal: string, evento: string, payload: Record<string, unknown>) {
  const c = supabase.channel(canal);
  c.subscribe((estado) => {
    if (estado !== "SUBSCRIBED") return;
    c.send({ type: "broadcast", event: evento, payload }).finally(() => supabase.removeChannel(c));
  });
}

// Borra un mensaje propio para los dos (0256): en la base queda guardado como
// respaldo; el chat muestra «Mensaje eliminado».
export const TEXTO_ELIMINADO = "Mensaje eliminado";

export async function borrarMensajeDirecto(mensajeId: string) {
  const { error } = await supabase.rpc("borrar_mensaje_directo", { p_mensaje_id: mensajeId });
  if (error) throw error;
}

export function marcarConversacionLeida(amigoId: string) {
  supabase.rpc("marcar_conversacion_leida", { p_amigo_id: amigoId });
}

// ---------- Presencia ----------

// Quién está conectado ahora (canal "presencia:global", el mismo que la web).
let canalPresencia: RealtimeChannel | null = null;
let enLinea = new Set<string>();
const oyentesPresencia = new Set<(ids: Set<string>) => void>();

export function conectarPresencia(userId: string) {
  if (canalPresencia) return;
  const canal = supabase.channel("presencia:global", { config: { presence: { key: userId } } });
  canalPresencia = canal;
  canal.on("presence", { event: "sync" }, () => {
    enLinea = new Set(Object.keys(canal.presenceState()));
    oyentesPresencia.forEach((o) => o(enLinea));
  });
  canal.subscribe(async (estado) => {
    if (estado === "SUBSCRIBED") await canal.track({ online_at: new Date().toISOString() });
  });
}

export function desconectarPresencia() {
  if (canalPresencia) supabase.removeChannel(canalPresencia);
  canalPresencia = null;
  enLinea = new Set();
}

export function escucharPresencia(oyente: (ids: Set<string>) => void) {
  oyentesPresencia.add(oyente);
  oyente(enLinea);
  return () => {
    oyentesPresencia.delete(oyente);
  };
}
