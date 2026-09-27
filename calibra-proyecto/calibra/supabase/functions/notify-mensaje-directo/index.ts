// Supabase Edge Function — push de "mensaje directo nuevo".
//
// Se dispara con un Database Webhook sobre INSERT en `mensajes_directos` (0198).
// Avisa al destinatario, agrupado: como máximo 1 aviso cada 30 min por
// conversación (docs/app-nativa/04-BUCLE-DE-ENGANCHE.md §5), y con la misma
// etiqueta para que un mensaje nuevo reemplace al anterior en la bandeja en vez
// de apilarse. Respeta la categoría "mensajes" de cada dispositivo (0243).

import { createSupabaseAdmin, enviarPushATokens } from "../_shared/fcm.ts";
import { corsHeaders, respuesta, reservarEnvio, tokensDe, webhookAutorizado } from "../_shared/avisos.ts";

interface WebhookMensajeDirecto {
  id: string;
  remitente_id: string;
  destinatario_id: string;
  texto?: string | null;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!webhookAutorizado(req)) return respuesta({ ok: false, error: "no autorizado" }, 401);
  if (req.headers.get("x-supabase-event") !== "INSERT") return respuesta({ ok: false, error: "solo acepta eventos INSERT" }, 400);

  let body: { record?: WebhookMensajeDirecto };
  try {
    body = await req.json();
  } catch {
    return respuesta({ ok: false, error: "json invalido" }, 400);
  }
  const m = body.record;
  if (!m?.remitente_id || !m?.destinatario_id) return respuesta({ ok: false, error: "fila invalida" }, 400);

  const supabase = createSupabaseAdmin();
  const tokens = await tokensDe(supabase, [m.destinatario_id], "mensajes");
  if (tokens.length === 0) return respuesta({ ok: true, ignorado: "sin dispositivos" });

  const puede = await reservarEnvio(supabase, m.destinatario_id, `dm:${m.remitente_id}`, { minutos: 30 });
  if (!puede) return respuesta({ ok: true, ignorado: "agrupado (menos de 30 min del aviso anterior)" });

  const { data: autor } = await supabase.from("profiles").select("display_name").eq("id", m.remitente_id).maybeSingle();
  const nombre = (autor as { display_name?: string } | null)?.display_name ?? "Un amigo";
  const texto = (m.texto ?? "").trim();
  const preview = texto.length > 80 ? `${texto.slice(0, 80)}…` : texto;

  const enviados = await enviarPushATokens(supabase, tokens, {
    titulo: `💬 ${nombre}`,
    cuerpo: preview || "Te mandó un mensaje.",
    prioridad: "high",
    canal: "mensajes",
    etiqueta: `dm-${m.remitente_id}`,
    data: { tipo: "mensaje_directo", remitenteId: m.remitente_id, url: `/social/mensajes/${m.remitente_id}` },
  });
  return respuesta({ ok: true, enviados });
}
