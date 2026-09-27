// Supabase Edge Function — push de "novedad o evento" (tabla `anuncios`, 0065).
//
// Se dispara con un Database Webhook sobre INSERT en `anuncios`: cada anuncio
// nuevo (mundo nuevo, evento, actualización) llega como aviso a quienes tienen la
// categoría "novedades" encendida (0243). Los arreglos de bugs (tipo 'arreglo')
// no se mandan como push: quedan solo en el centro de avisos de la app.
//
// Reglas de docs/app-nativa/04-BUCLE-DE-ENGANCHE.md §5 (público de 8-15 años):
//   - Cuenta para el tope de 2 avisos de retención por día por persona.
//   - Nunca en horario silencioso (21:00-08:00): si el anuncio se crea de noche,
//     no se manda push (se ve igual en la app, en Avisos).

import { createSupabaseAdmin, enviarPushATokens } from "../_shared/fcm.ts";
import {
  corsHeaders,
  enHorarioSilencioso,
  MAX_RETENCION_POR_DIA,
  reservarEnvio,
  respuesta,
  webhookAutorizado,
} from "../_shared/avisos.ts";

interface WebhookAnuncio {
  id: string;
  tipo: "actualizacion" | "arreglo" | "evento";
  titulo: string;
  descripcion: string;
  activo?: boolean;
}

const ICONO: Record<WebhookAnuncio["tipo"], string> = { evento: "🎉", actualizacion: "✨", arreglo: "🔧" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!webhookAutorizado(req)) return respuesta({ ok: false, error: "no autorizado" }, 401);
  if (req.headers.get("x-supabase-event") !== "INSERT") return respuesta({ ok: false, error: "solo acepta eventos INSERT" }, 400);

  let body: { record?: WebhookAnuncio };
  try {
    body = await req.json();
  } catch {
    return respuesta({ ok: false, error: "json invalido" }, 400);
  }
  const a = body.record;
  if (!a?.id || !a.titulo) return respuesta({ ok: false, error: "fila invalida" }, 400);
  if (a.activo === false) return respuesta({ ok: true, ignorado: "anuncio inactivo" });
  if (a.tipo === "arreglo") return respuesta({ ok: true, ignorado: "los arreglos no se avisan por push" });
  if (enHorarioSilencioso()) return respuesta({ ok: true, ignorado: "horario silencioso" });

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("device_push_tokens")
    .select("user_id, token")
    .contains("categorias", ["novedades"]);
  if (error) return respuesta({ ok: false, error: error.message }, 500);

  const porUsuario = new Map<string, { token: string }[]>();
  for (const fila of (data ?? []) as { user_id: string; token: string }[]) {
    porUsuario.set(fila.user_id, [...(porUsuario.get(fila.user_id) ?? []), { token: fila.token }]);
  }

  const descripcion = a.descripcion.length > 110 ? `${a.descripcion.slice(0, 110)}…` : a.descripcion;
  let enviados = 0;
  for (const [userId, tokens] of porUsuario) {
    const puede = await reservarEnvio(supabase, userId, "retencion", { maxPorDia: MAX_RETENCION_POR_DIA });
    if (!puede) continue;
    enviados += await enviarPushATokens(supabase, tokens, {
      titulo: `${ICONO[a.tipo]} ${a.titulo}`,
      cuerpo: descripcion,
      prioridad: "normal",
      canal: "novedades",
      etiqueta: `anuncio-${a.id}`,
      data: { tipo: "anuncio", anuncioId: a.id, url: "/" },
    });
  }
  return respuesta({ ok: true, enviados, usuarios: porUsuario.size });
}
