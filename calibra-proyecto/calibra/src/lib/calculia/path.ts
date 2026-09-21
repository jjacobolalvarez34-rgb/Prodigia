import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerCaminoConClases, type NodoCaminoConClases, type NodoEstado } from "@/lib/aprender/clases";

export type { NodoEstado };

// Camino de Aprender de Calculia. La lógica (Técnicas gratis + pestaña
// Clases Pro con clase 1 de preview) vive en src/lib/aprender/clases.ts,
// compartida por todos los mundos con Clases — reutiliza
// techniques/technique_progress (problem_type='calculia').
export type NodoCaminoCalculia = NodoCaminoConClases;

export function obtenerCaminoCalculia(
  supabase: SupabaseClient,
  userId: string,
  esPro: boolean
): Promise<NodoCaminoCalculia[]> {
  return obtenerCaminoConClases(supabase, userId, "calculia", esPro);
}
