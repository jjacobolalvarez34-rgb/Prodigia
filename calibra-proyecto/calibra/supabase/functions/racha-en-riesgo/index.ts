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
import { MAX_RETENCION_POR_DIA, reservarEnvio, tokensDe } from "../_shared/avisos.ts";

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
  // Solo dispositivos con la categoría "racha" encendida (0243).
  const tokens = await tokensDe(supabase, ids, "racha");

  let enviados = 0;
  let totalDestinatarios = 0;

  for (const fila of filas) {
    const deUsuario = tokens.filter((t) => t.user_id === fila.user_id);
    if (deUsuario.length === 0) continue;
    // Cuenta para el tope de 2 avisos de retención por día (04-BUCLE-DE-ENGANCHE.md §5).
    if (!(await reservarEnvio(supabase, fila.user_id, "retencion", { maxPorDia: MAX_RETENCION_POR_DIA }))) continue;
    totalDestinatarios += 1;

    const n = await enviarPushATokens(supabase, deUsuario, {
      // Texto concreto y útil, sin culpa (04-BUCLE-DE-ENGANCHE.md §5).
      titulo: "🔥 Tu racha sigue viva",
      cuerpo:
        fila.racha_actual > 0
          ? `Llevas ${fila.racha_actual} día${fila.racha_actual === 1 ? "" : "s"} seguidos. Un sprint de 60 segundos hoy y suma otro.`
          : "Un sprint de 60 segundos hoy y arrancas tu racha.",
      prioridad: "high",
      canal: "racha",
      etiqueta: "racha",
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
