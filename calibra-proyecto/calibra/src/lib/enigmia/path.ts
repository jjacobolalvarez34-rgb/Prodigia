import type { SupabaseClient } from "@supabase/supabase-js";
import { NOMBRE_CATEGORIA_ENIGMIA, type CategoriaEnigmia } from "@/types/database";

export type NodoEstado = "completado" | "activo" | "bloqueado";

export interface NodoCaminoEnigmia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; ejemplo: { enunciado: string; opciones: string[]; respuesta: string } };
  categoria: CategoriaEnigmia;
  estado: NodoEstado;
}

export interface UnidadCaminoEnigmia {
  categoria: CategoriaEnigmia;
  nombre: string;
  nodos: NodoCaminoEnigmia[];
}

const ORDEN_CATEGORIAS: CategoriaEnigmia[] = ["patrones", "deduccion", "memoria", "computacional"];

// Mismo criterio que obtenerCamino (Numeria, Fase GG): un solo nodo
// "activo" en todo el camino, agrupado por categoría para el sidebar +
// camino continuo (Fase KK).
export async function obtenerCaminoEnigmia(
  supabase: SupabaseClient,
  userId: string
): Promise<UnidadCaminoEnigmia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("logic_techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, categoria")
      .order("orden", { ascending: true }),
    supabase.from("logic_technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const ordenadas = (tecnicas ?? []).slice().sort((a, b) => {
    const pa = ORDEN_CATEGORIAS.indexOf(a.categoria as CategoriaEnigmia);
    const pb = ORDEN_CATEGORIAS.indexOf(b.categoria as CategoriaEnigmia);
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });

  let activoAsignado = false;
  const nodos: NodoCaminoEnigmia[] = ordenadas.map((t) => {
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
      contenido: t.contenido,
      categoria: t.categoria as CategoriaEnigmia,
      estado,
    };
  });

  return ORDEN_CATEGORIAS.map((cat) => ({
    categoria: cat,
    nombre: NOMBRE_CATEGORIA_ENIGMIA[cat],
    nodos: nodos.filter((n) => n.categoria === cat),
  }));
}
