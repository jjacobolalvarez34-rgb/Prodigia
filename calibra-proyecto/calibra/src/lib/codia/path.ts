import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerCaminoConClases, type NodoCaminoConClases, type NodoEstado } from "@/lib/aprender/clases";

export type { NodoEstado };

// Camino de Aprender de Codia. La lógica (Técnicas gratis + pestaña
// Clases Pro con clase 1 de preview) vive en src/lib/aprender/clases.ts,
// compartida por todos los mundos con Clases — reutiliza
// techniques/technique_progress (problem_type='codia').
export type NodoCaminoCodia = NodoCaminoConClases;

export function obtenerCaminoCodia(
  supabase: SupabaseClient,
  userId: string,
  esPro: boolean
): Promise<NodoCaminoCodia[]> {
  return obtenerCaminoConClases(supabase, userId, "codia", esPro);
}
