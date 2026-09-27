// Supabase Edge Function — push de "te llegó un duelo".
//
// Se dispara con un Database Webhook de Supabase sobre INSERT en la
// tabla `duels` (ver instrucciones de setup en docs de despliegue). El
// webhook manda el JSON del evento con la fila nueva en `record`.
//
// Solo notifica al `retado_id` (el que recibe el reto) y cuando el duelo
// nace en estado pendiente — no molesta con updates posteriores
// (resultados, series, etc.).

import { createSupabaseAdmin, enviarPushATokens } from "../_shared/fcm.ts";
import { tokensDe, webhookAutorizado } from "../_shared/avisos.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-event",
};

interface WebhookDuel {
  retador_id: string;
  retado_id: string;
  operation_type?: string | null;
  mundo?: string | null;
  id: string;
  estado?: string | null;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!webhookAutorizado(req)) {
    return new Response(JSON.stringify({ ok: false, error: "no autorizado" }), { status: 401, headers: corsHeaders });
  }

  const event = req.headers.get("x-supabase-event");
  if (event !== "INSERT") {
    return new Response(JSON.stringify({ ok: false, error: "solo acepta eventos INSERT" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  let body: { record?: WebhookDuel };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "json invalido" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const duelo = body.record;
  if (!duelo || !duelo.retado_id || !duelo.retador_id) {
    return new Response(JSON.stringify({ ok: false, error: "fila invalida" }), {
      status: 400,
      headers: corsHeaders,
    });
  }
  if (duelo.retador_id === duelo.retado_id) {
    return new Response(JSON.stringify({ ok: true, ignorado: "autoduelo" }), {
      headers: corsHeaders,
    });
  }
  if (duelo.estado && duelo.estado !== "pendiente") {
    return new Response(JSON.stringify({ ok: true, ignorado: "no pendiente" }), {
      headers: corsHeaders,
    });
  }

  const supabase = createSupabaseAdmin();

  const [{ data: rival }, tokens] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", duelo.retador_id).maybeSingle(),
    tokensDe(supabase, [duelo.retado_id], "duelos"),
  ]);

  if (tokens.length === 0) {
    return new Response(JSON.stringify({ ok: true, ignorado: "sin dispositivos" }), {
      headers: corsHeaders,
    });
  }

  const nombreRival = (rival as { display_name?: string } | undefined)?.display_name ?? "Un rival";

  const enviados = await enviarPushATokens(supabase, tokens, {
    titulo: "⚔️ Te retaron a un duelo",
    cuerpo: `${nombreRival} te desafió. ¿Aceptas?`,
    prioridad: "high",
    canal: "duelos",
    etiqueta: `duelo-${duelo.id}`,
    data: {
      tipo: "duelo",
      duelId: duelo.id,
      url: `/practica?duelo=${duelo.id}`,
    },
  });

  return new Response(JSON.stringify({ ok: true, enviados }), { headers: corsHeaders });
}
