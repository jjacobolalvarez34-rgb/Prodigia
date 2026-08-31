import type { SupabaseClient } from "@supabase/supabase-js";

export type NodoEstado = "completado" | "activo" | "bloqueado";

export interface NodoCaminoHistoria {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[] };
  estado: NodoEstado;
}

// Camino de Aprender de Historia — mismo patrón que
// src/lib/melodia/path.ts: reutiliza techniques/technique_progress
// (problem_type='historia'), no una tabla nueva.
export async function obtenerCaminoHistoria(supabase: SupabaseClient, userId: string): Promise<NodoCaminoHistoria[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden")
      .eq("problem_type", "historia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  let activoAsignado = false;
  return (tecnicas ?? []).map((t) => {
    const completado = dominadas.has(t.id);
    let estado: NodoEstado;
    if (completado) {
      estado = "completado";
    } else if (!activoAsignado) {
      estado = "activo";
      activoAsignado = true;
    } else {
      estado = "bloqueado";
    }
    return {
      id: t.id,
      slug: t.slug,
      nombre: t.nombre,
      descripcion: t.descripcion,
      contenido: t.contenido as { pasos: string[] },
      estado,
    };
  });
}
