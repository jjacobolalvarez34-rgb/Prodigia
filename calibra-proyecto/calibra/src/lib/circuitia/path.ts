import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerCaminoConClases, type NodoCaminoConClases, type NodoEstado } from "@/lib/aprender/clases";

export type { NodoEstado };

// Camino de Aprender de Circuitia. La lógica (Técnicas gratis + pestaña
// Clases Pro con clase 1 de preview) vive en src/lib/aprender/clases.ts,
// compartida por todos los mundos con Clases — reutiliza
// techniques/technique_progress (problem_type='circuitia').
export type NodoCaminoCircuitia = NodoCaminoConClases;

export function obtenerCaminoCircuitia(
  supabase: SupabaseClient,
  userId: string,
  esPro: boolean
): Promise<NodoCaminoCircuitia[]> {
  return obtenerCaminoConClases(supabase, userId, "circuitia", esPro);
}
