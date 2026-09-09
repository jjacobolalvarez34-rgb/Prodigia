// Supabase Edge Function programada — push de "racha en riesgo".
//
// Envía un push a cada usuario que HOY está en riesgo de perder su racha
// diaria (ya cumplió ayer pero todavía no jugó hoy). Reusa la función
// existente public.usuarios_con_racha_en_riesgo() (migración 0064), que
// legitivamente se puede invocar con la service role key desde acá.
//
// Se ejecuta una vez por día con un trigger programado ("Scheduled") en
// Supabase (ver instrucciones de setup). Elegir una hora temprana a la
// noche — p. ej. 19:00 o 20:00 — para dar margen de jugar antes de que
// termine el día.

import { createSupabaseAdmin, enviarPushATokens } from "../_shared/fcm.ts";

interface RachaEnRiesgo {
  user_id: string;
  email: string;
  display_name: string | null;
  racha_actual: number;
}

export default async function handler(_req: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  const supabase = createSupabaseAdmin();

  const { data: enRiesgo, error } = await supabase.rpc("usuarios_con_racha_en_riesgo");
  if (error) {
    console.error("no se pudo consultar rachas en riesgo", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const filas = (enRiesgo as RachaEnRiesgo[] | null) ?? [];
  if (filas.length === 0) {
    return new Response(JSON.stringify({ ok: true, enviados: 0, total: 0 }), {
      headers: corsHeaders,
    });
  }

  const ids = filas.map((f) => f.user_id);
  const { data: tokens } = await supabase
    .from("device_push_tokens")
    .select("user_id, token")
    .in("user_id", ids);

  let enviados = 0;
  let totalDestinatarios = 0;

  for (const fila of filas) {
    const deUsuario = (tokens as { user_id: string; token: string }[] | null ?? []).filter(
      (t) => t.user_id === fila.user_id
    );
    if (deUsuario.length === 0) continue;
    totalDestinatarios += 1;

    const n = await enviarPushATokens(supabase, deUsuario, {
      titulo: "🔥 Tu racha está en riesgo",
      cuerpo:
        fila.racha_actual > 0
          ? `Llevás ${fila.racha_actual} día${fila.racha_actual === 1 ? "" : "s"} seguidos. ¡Jugá hoy para no perderla!`
          : "Todavía no cumpliste tu meta de hoy. ¡No dejes que tu racha se corte!",
      prioridad: "high",
      data: {
        tipo: "racha_riesgo",
        url: "/",
      },
    });
    enviados += n;
  }

  return new Response(
    JSON.stringify({ ok: true, enviados, destinatarios: totalDestinatarios }),
    { headers: corsHeaders }
  );
}
