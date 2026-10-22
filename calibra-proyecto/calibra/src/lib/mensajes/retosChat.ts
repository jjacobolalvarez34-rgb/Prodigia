// Retos a duelo dentro del chat entre amigos (0298_chat_duelos.sql). Lógica pura,
// compartida por la web y la app: cada lado pasa su propia llamada a la base.
//
// El duelo se crea con el flujo de siempre (/api/amigos/retar o retarAmigo) y
// después enviar_reto_chat deja el mensaje especial en la conversación. Si la
// migración 0298 todavía no se corrió, todo esto devuelve vacío/null y el chat
// sigue igual (el reto se crea y se juega como antes, sin el mensaje).

export type EstadoReto = "pendiente" | "aceptada" | "rechazada" | "cancelada" | "vencida";
export type AccionReto = "aceptar" | "rechazar" | "cancelar";

export interface RetoChat {
  mensajeId: string;
  duelId: string;
  retadorId: string;
  mundo: string;
  subTipo: string | null;
  operationType: string | null;
  estado: EstadoReto;
  expiraAt: string;
}

// Texto fijo con el que se guarda el mensaje (vista previa y versiones viejas).
export const TEXTO_RETO_CHAT = "Te reto a un duelo";

type RespuestaRpc = { data: unknown; error: { message: string } | null };
export type LlamarRpc = (fn: string, args: Record<string, unknown>) => PromiseLike<RespuestaRpc>;

const ESTADOS: EstadoReto[] = ["pendiente", "aceptada", "rechazada", "cancelada", "vencida"];

interface FilaReto {
  mensaje_id: string;
  duel_id: string;
  retador_id: string;
  mundo: string;
  sub_tipo: string | null;
  operation_type: string | null;
  estado: string;
  expira_at: string;
}

function desdeFila(f: FilaReto): RetoChat {
  return {
    mensajeId: f.mensaje_id,
    duelId: f.duel_id,
    retadorId: f.retador_id,
    mundo: f.mundo,
    subTipo: f.sub_tipo,
    operationType: f.operation_type,
    estado: (ESTADOS as string[]).includes(f.estado) ? (f.estado as EstadoReto) : "pendiente",
    expiraAt: f.expira_at,
  };
}

// Retos de la conversación, por id de mensaje. Sin la migración: {}.
export async function cargarRetosChat(rpc: LlamarRpc, amigoId: string): Promise<Record<string, RetoChat>> {
  try {
    const { data, error } = await rpc("retos_de_conversacion", { p_amigo: amigoId });
    if (error || !Array.isArray(data)) return {};
    return Object.fromEntries((data as FilaReto[]).map((f) => [f.mensaje_id, desdeFila(f)]));
  } catch {
    return {};
  }
}

// Deja el reto en el chat. Devuelve el mensaje creado, o null si no se pudo (por
// ejemplo, sin la migración): el duelo igual existe y se juega como siempre.
export async function mandarRetoAlChat(rpc: LlamarRpc, duelId: string): Promise<{ id: string; createdAt: string; texto: string; expiraAt: string } | null> {
  try {
    const { data, error } = await rpc("enviar_reto_chat", { p_duel_id: duelId });
    const fila = Array.isArray(data) ? (data[0] as { id: string; created_at: string; texto: string; expira_at: string } | undefined) : undefined;
    if (error || !fila) return null;
    return { id: fila.id, createdAt: fila.created_at, texto: fila.texto, expiraAt: fila.expira_at };
  } catch {
    return null;
  }
}

// Aceptar, rechazar o cancelar. Devuelve el estado que quedó (si el reto ya no
// estaba pendiente, el real: por ejemplo «vencida»). Tira error si la base falla.
export async function responderRetoChat(rpc: LlamarRpc, mensajeId: string, accion: AccionReto): Promise<EstadoReto> {
  const { data, error } = await rpc("responder_reto_chat", { p_mensaje_id: mensajeId, p_accion: accion });
  if (error) throw new Error(error.message);
  return (ESTADOS as string[]).includes(data as string) ? (data as EstadoReto) : "pendiente";
}

// Estado que se muestra ahora: un reto pendiente cuyo plazo pasó ya está vencido
// aunque la base todavía no lo haya anotado.
export function estadoVisible(reto: RetoChat, ahoraMs: number): EstadoReto {
  if (reto.estado === "pendiente" && Date.parse(reto.expiraAt) <= ahoraMs) return "vencida";
  return reto.estado;
}

// «1:42» para la cuenta regresiva del reto.
export function textoRestante(reto: RetoChat, ahoraMs: number): string {
  const s = Math.max(0, Math.ceil((Date.parse(reto.expiraAt) - ahoraMs) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function hayRetoPendiente(retos: Record<string, RetoChat>, ahoraMs: number): boolean {
  return Object.values(retos).some((r) => estadoVisible(r, ahoraMs) === "pendiente");
}
