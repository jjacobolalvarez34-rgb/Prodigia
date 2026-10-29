// Reglas comunes de los avisos push (docs/app-nativa/04-BUCLE-DE-ENGANCHE.md §5):
// categorías que cada dispositivo acepta, límite anti-spam, horario silencioso y
// secreto del webhook. Las usan todas las Edge Functions que mandan push.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type Categoria = "mensajes" | "duelos" | "racha" | "novedades";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-event, x-webhook-secret",
};

export function respuesta(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status, headers: corsHeaders });
}

// SEG-04 (docs/audits/REVISION-GENERAL-2026-09-26.md): cualquiera podía llamar
// estas funciones mandando el header x-supabase-event. Si el secret
// WEBHOOK_SECRET está definido en el proyecto, se exige el header
// x-webhook-secret con el mismo valor (configurarlo también en cada Database
// Webhook). Sin el secret definido se comporta como antes, para no cortar los
// avisos mientras no se configure.
export function webhookAutorizado(req: Request): boolean {
  const secreto = Deno.env.get("WEBHOOK_SECRET");
  if (!secreto) return true;
  const recibido = req.headers.get("x-webhook-secret") ?? "";
  if (recibido.length !== secreto.length) return false;
  let diff = 0;
  for (let i = 0; i < secreto.length; i++) diff |= recibido.charCodeAt(i) ^ secreto.charCodeAt(i);
  return diff === 0;
}

// Tokens de estos usuarios que aceptan la categoría. Si la migración 0243 todavía
// no se aplicó (no existe la columna `categorias`), se manda a todos sus tokens:
// mejor que dejar de avisar.
export async function tokensDe(
  supabase: SupabaseClient,
  userIds: string[],
  categoria: Categoria
): Promise<{ user_id: string; token: string }[]> {
  if (userIds.length === 0) return [];
  const filtrado = await supabase
    .from("device_push_tokens")
    .select("user_id, token")
    .in("user_id", userIds)
    .contains("categorias", [categoria]);
  if (!filtrado.error) return (filtrado.data ?? []) as { user_id: string; token: string }[];
  const todos = await supabase.from("device_push_tokens").select("user_id, token").in("user_id", userIds);
  return (todos.data ?? []) as { user_id: string; token: string }[];
}

// Límite anti-spam por (usuario, clave). `minutos`: separación mínima entre dos
// envíos con la misma clave; `maxPorDia`: tope diario de esa clave. Devuelve si se
// puede enviar y, si sí, lo registra. Sin la tabla (0243 sin aplicar) no limita.
export async function reservarEnvio(
  supabase: SupabaseClient,
  userId: string,
  clave: string,
  { minutos = 0, maxPorDia = Infinity }: { minutos?: number; maxPorDia?: number }
): Promise<boolean> {
  const hoy = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("push_throttle")
    .select("ultimo_envio, envios_hoy, fecha")
    .eq("user_id", userId)
    .eq("clave", clave)
    .maybeSingle();
  if (error) return true;
  const fila = data as { ultimo_envio: string; envios_hoy: number; fecha: string } | null;
  const enviosHoy = fila && fila.fecha === hoy ? fila.envios_hoy : 0;
  if (fila && minutos > 0 && Date.now() - new Date(fila.ultimo_envio).getTime() < minutos * 60_000) return false;
  if (enviosHoy >= maxPorDia) return false;
  await supabase
    .from("push_throttle")
    .upsert({ user_id: userId, clave, ultimo_envio: new Date().toISOString(), envios_hoy: enviosHoy + 1, fecha: hoy });
  return true;
}

// Zona por defecto: el secret ZONA_HORARIA (por defecto la de Colombia, donde está
// la mayoría de usuarios hoy). Cada dispositivo puede tener la suya (0308).
export function zonaPorDefecto(): string {
  return Deno.env.get("ZONA_HORARIA") ?? "America/Bogota";
}

// Hora (0-23) en esa zona; si la zona no es válida, la de por defecto.
export function horaEn(zona: string | null | undefined, fecha = new Date()): number {
  const formato = (z: string) => Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: z }).format(fecha));
  try {
    return formato(zona || zonaPorDefecto());
  } catch {
    return formato(zonaPorDefecto());
  }
}

// Horario silencioso por defecto 21:00-08:00 (§5).
export function enHorarioSilencioso(fecha = new Date(), zona?: string | null): boolean {
  const hora = horaEn(zona, fecha);
  return hora >= 21 || hora < 8;
}

// Nombre de cada ciudad para los textos (mismos de mobile/src/tema.ts).
export const NOMBRE_MUNDO: Record<string, string> = {
  numeria: "Numeria",
  enigmia: "Enigmia",
  geografia: "Geografía",
  quimia: "Quimia",
  anatomia: "Anatomía",
  melodia: "Melodía",
  trigonometria: "Trigonometría",
  historia: "Historia",
  calculia: "Calculia",
  circuitia: "Circuitia",
  estadistica: "Estadística",
  naipia: "Naipia",
  codia: "Codia",
  dinamia: "Dinamia",
  vitalia: "Vitalia",
};

// Primer nombre corto para personalizar (sin nombres larguísimos en el título).
export function primerNombre(nombre: string | null | undefined): string | null {
  const n = (nombre ?? "").trim().split(/\s+/)[0];
  return n && n.length <= 18 ? n : null;
}

// Tope global de 2 avisos de retención por día (racha + novedades).
export const MAX_RETENCION_POR_DIA = 2;
