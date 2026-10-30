import type { SupabaseClient } from "@supabase/supabase-js";

// Prueba gratis de Pro con tickets (migración 0310, docs/avance/TICKETS_PRO.md).
// Cada jugador empieza con 3 tickets (profiles.tickets_pro). Abrir una Clase Pro
// sin ser Pro gasta 1 ticket y la deja abierta para siempre (tabla
// clases_con_ticket); la base hace el descuento (usar_ticket_clase) y acepta esas
// clases al completarlas. Sin la migración aplicada todo se comporta como antes:
// las lecturas fallan, no hay clases con ticket y el bloqueo lleva a /pro.

export const TICKETS_PRO_INICIALES = 3;

interface NodoConPlan {
  id: string;
  estado: "completado" | "activo" | "bloqueado";
  bloqueadoPorPlan: boolean;
}

// Una clase bloqueada solo por plan que ya se abrió con ticket queda abierta.
export function aplicarTicketsPro<T extends NodoConPlan>(nodos: T[], desbloqueadas: ReadonlySet<string>): T[] {
  if (desbloqueadas.size === 0) return nodos;
  return nodos.map((n) => (n.bloqueadoPorPlan && desbloqueadas.has(n.id) ? { ...n, estado: "activo" as const, bloqueadoPorPlan: false } : n));
}

export async function clasesConTicket(supabase: SupabaseClient, userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from("clases_con_ticket").select("tecnica_id").eq("user_id", userId);
  if (error || !data) return new Set();
  return new Set(data.map((f) => f.tecnica_id as string));
}

// Paso final de cada obtenerCamino*: para quien no es Pro, abre las clases que
// desbloqueó con ticket. Solo consulta si hay alguna clase bloqueada por plan.
export async function conTicketsPro<T extends NodoConPlan>(supabase: SupabaseClient, userId: string, esPro: boolean, nodos: T[]): Promise<T[]> {
  if (esPro || !nodos.some((n) => n.bloqueadoPorPlan)) return nodos;
  return aplicarTicketsPro(nodos, await clasesConTicket(supabase, userId));
}

// Tickets que le quedan al jugador; null si la base todavía no los tiene (0310).
export async function leerTicketsPro(supabase: SupabaseClient, userId: string): Promise<number | null> {
  const { data, error } = await supabase.from("profiles").select("tickets_pro").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  const n = (data as { tickets_pro?: number | null }).tickets_pro;
  return typeof n === "number" ? n : null;
}

export interface ResultadoTicket {
  desbloqueada: boolean;
  restantes: number;
}

// Gasta 1 ticket en la clase (o no gasta nada si ya estaba abierta o si es Pro).
// null si la base no tiene la función (0310 sin aplicar) o hubo un error.
export async function usarTicketClase(supabase: SupabaseClient, tecnicaId: string): Promise<ResultadoTicket | null> {
  const { data, error } = await supabase.rpc("usar_ticket_clase", { p_tecnica: tecnicaId });
  if (error) return null;
  const fila = (Array.isArray(data) ? data[0] : data) as ResultadoTicket | null;
  return fila ? { desbloqueada: !!fila.desbloqueada, restantes: Number(fila.restantes) || 0 } : null;
}
