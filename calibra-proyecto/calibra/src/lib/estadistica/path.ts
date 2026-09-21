import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerCaminoConClases, type NodoCaminoConClases, type NodoEstado } from "@/lib/aprender/clases";

export type { NodoEstado };

// Camino de Aprender de Estadistica. La lógica (Técnicas gratis + pestaña
// Clases Pro con clase 1 de preview) vive en src/lib/aprender/clases.ts,
// compartida por todos los mundos con Clases — reutiliza
// techniques/technique_progress (problem_type='estadistica').
export type NodoCaminoEstadistica = NodoCaminoConClases;

export function obtenerCaminoEstadistica(
  supabase: SupabaseClient,
  userId: string,
  esPro: boolean
): Promise<NodoCaminoEstadistica[]> {
  return obtenerCaminoConClases(supabase, userId, "estadistica", esPro);
}
