// Supabase Edge Function programada — push de "racha en peligro".
//
// Envía un push a cada usuario que HOY está en riesgo de perder su racha
// diaria (ya cumplió ayer pero todavía no jugó hoy), con
// public.usuarios_con_racha_en_riesgo() (0064), solo con la service role.
//
// OJO con el día: la racha se cuenta por día UTC (daily_progress.fecha =
// current_date), así que el día se corta a la medianoche UTC (en Colombia, a las
// 19:00). Antes corría una vez al día «a las 19:00-20:00»: si eso era hora de
// Colombia, ya era el día siguiente en UTC y avisaba a quien SÍ había jugado.
//
// Ahora conviene programarla CADA HORA (cron `5 * * * *`). A cada persona le llega
// una sola vez por día, a su hora (zona del teléfono, 0308; sin ella, ZONA_HORARIA):
//   - nunca de 21:00 a 08:00 en su zona;
//   - cuando faltan 3 h o menos para el corte UTC, o desde las 19:00 de su zona si
//     el corte le cae de noche (Europa, Asia).

import { createSupabaseAdmin, enviarPushATokens } from "../_shared/fcm.ts";
import { enHorarioSilencioso, horaEn, MAX_RETENCION_POR_DIA, primerNombre, reservarEnvio, tokensDe } from "../_shared/avisos.ts";

interface RachaEnRiesgo {
  user_id: string;
  email: string;
  display_name: string | null;
  racha_actual: number;
}

interface Token {
  user_id: string;
  token: string;
  zona_horaria?: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status, headers: corsHeaders });
}

// Tokens con la categoría «racha» y su zona (0308). Sin la columna, sin zona.
async function tokensConZona(supabase: ReturnType<typeof createSupabaseAdmin>, ids: string[]): Promise<Token[]> {
  if (ids.length === 0) return [];
  const conZona = await supabase
    .from("device_push_tokens")
    .select("user_id, token, zona_horaria")
    .in("user_id", ids)
    .contains("categorias", ["racha"]);
  if (!conZona.error) return (conZona.data ?? []) as Token[];
  return await tokensDe(supabase, ids, "racha");
}

function dias(n: number): string {
  return `${n} ${n === 1 ? "día" : "días"}`;
}

// Textos que cambian de un día a otro (no siempre el mismo), sin culpa y con datos.
function texto(nombre: string | null, racha: number, horas: number, diaDelAnio: number): { titulo: string; cuerpo: string } {
  if (racha <= 0) return { titulo: "Hoy puedes empezar una racha", cuerpo: "Un sprint de 60 segundos y cuenta el primer día." };
  const quedan = `${horas} h`;
  const variantes = [
    { titulo: `Tu racha de ${dias(racha)} está en peligro`, cuerpo: `${nombre ? `${nombre}, te quedan` : "Te quedan"} ${quedan} para salvarla. Un sprint de 60 segundos basta.` },
    { titulo: `${dias(racha)} seguidos. ¿Hoy también?`, cuerpo: `Quedan ${quedan} de este día de racha. Una partida corta y queda a salvo.` },
    { titulo: nombre ? `${nombre}, no sueltes tu racha` : "No sueltes tu racha", cuerpo: `Llevas ${dias(racha)}. Te quedan ${quedan} y alcanza con un sprint.` },
  ];
  return variantes[diaDelAnio % variantes.length];
}

export default async function handler(_req: Request): Promise<Response> {
  const supabase = createSupabaseAdmin();

  const { data: enRiesgo, error } = await supabase.rpc("usuarios_con_racha_en_riesgo");
  if (error) {
    console.error("no se pudo consultar rachas en riesgo", error);
    return json({ ok: false, error: error.message }, 500);
  }

  const filas = (enRiesgo as RachaEnRiesgo[] | null) ?? [];
  if (filas.length === 0) return json({ ok: true, enviados: 0, total: 0 });

  const ahora = new Date();
  const corte = Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate() + 1);
  const horasAlCorte = (corte - ahora.getTime()) / 3_600_000;
  const diaDelAnio = Math.floor(ahora.getTime() / 86_400_000);
  const tokens = await tokensConZona(supabase, filas.map((f) => f.user_id));

  let enviados = 0;
  let destinatarios = 0;

  for (const fila of filas) {
    const deUsuario = tokens.filter((t) => t.user_id === fila.user_id);
    if (deUsuario.length === 0) continue;
    const zona = deUsuario.find((t) => t.zona_horaria)?.zona_horaria ?? null;
    if (enHorarioSilencioso(ahora, zona)) continue;
    // Todavía es temprano para esta persona: se le avisa en otra pasada de la hora.
    if (horasAlCorte > 3 && horaEn(zona, ahora) < 19) continue;
    // Una vez por día de racha, y cuenta para el tope de retención (2 por día).
    if (!(await reservarEnvio(supabase, fila.user_id, "racha", { maxPorDia: 1 }))) continue;
    if (!(await reservarEnvio(supabase, fila.user_id, "retencion", { maxPorDia: MAX_RETENCION_POR_DIA }))) continue;
    destinatarios += 1;

    const { titulo, cuerpo } = texto(primerNombre(fila.display_name), fila.racha_actual, Math.max(1, Math.floor(horasAlCorte)), diaDelAnio);
    enviados += await enviarPushATokens(supabase, deUsuario, {
      titulo,
      cuerpo,
      prioridad: "high",
      canal: "racha",
      etiqueta: "racha",
      data: { tipo: "racha_riesgo", url: "/" },
    });
  }

  return json({ ok: true, enviados, destinatarios, total: filas.length });
}
