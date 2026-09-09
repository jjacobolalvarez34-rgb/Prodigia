// Supabase Edge Function — push de "mensaje nuevo en el chat del clan".
//
// Se dispara con un Database Webhook de Supabase sobre INSERT en la
// tabla `clan_mensajes` (ver instrucciones de setup en docs de
// despliegue). Lee `clan_id` y `autor_id` de la fila nueva y manda el
// push a todos los miembros del clan excepto el autor.
//
// Se consulta `clan_membresias` con el cliente admin (service role) —
// no se puede usar `miembros_de_clan()` porque es security definer y
// exige un auth.uid() (que una Edge Function no tiene).

import { createSupabaseAdmin, enviarPushATokens } from "../_shared/fcm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-event",
};

interface WebhookMensaje {
  clan_id: string;
  autor_id: string;
  texto?: string | null;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const event = req.headers.get("x-supabase-event");
  if (event !== "INSERT") {
    return new Response(JSON.stringify({ ok: false, error: "solo acepta eventos INSERT" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  let body: { record?: WebhookMensaje };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "json invalido" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const mensaje = body.record;
  if (!mensaje || !mensaje.clan_id || !mensaje.autor_id) {
    return new Response(JSON.stringify({ ok: false, error: "fila invalida" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const supabase = createSupabaseAdmin();

  const [{ data: autor }, { data: miembros }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", mensaje.autor_id).maybeSingle(),
    supabase.from("clan_membresias").select("user_id").eq("clan_id", mensaje.clan_id),
  ]);

  const nombreAutor = (autor as { display_name?: string } | undefined)?.display_name ?? "Alguien";

  const destinatarios = (miembros as { user_id: string }[] | null ?? [])
    .filter((m) => m.user_id !== mensaje.autor_id)
    .map((m) => m.user_id);

  if (destinatarios.length === 0) {
    return new Response(JSON.stringify({ ok: true, ignorado: "sin destinatarios" }), {
      headers: corsHeaders,
    });
  }

  const { data: tokens } = await supabase
    .from("device_push_tokens")
    .select("token")
    .in("user_id", destinatarios);

  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ ok: true, ignorado: "sin dispositivos" }), {
      headers: corsHeaders,
    });
  }

  const cuerpo = (mensaje.texto ?? "").trim();
  const preview = cuerpo.length > 80 ? `${cuerpo.slice(0, 80)}…` : cuerpo;

  const enviados = await enviarPushATokens(supabase, tokens as { token: string }[], {
    titulo: `${nombreAutor} en el clan`,
    cuerpo: preview || "Hay un mensaje nuevo en el chat del clan.",
    prioridad: "normal",
    data: {
      tipo: "clan_mensaje",
      clanId: mensaje.clan_id,
      url: "/clanes",
    },
  });

  return new Response(JSON.stringify({ ok: true, enviados }), { headers: corsHeaders });
}
