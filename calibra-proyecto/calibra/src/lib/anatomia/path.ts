import type { SupabaseClient } from "@supabase/supabase-js";

export type NodoEstado = "completado" | "activo" | "bloqueado";

// Los 4 grupos de "Aprender" (presentación, sin columna nueva en DB —
// ver docs/PARIDAD_MUNDOS.md footnote ⁹): coinciden 1 a 1 con los 4
// sistemas/modos reales de práctica de Anatomía (mismos slugs que usa
// modo_anatomia_aleatorio_por_rango en 0090_duelos_anatomia_melodia.sql
// y las claves Anatomia.elegir.modos.* de i18n), en el mismo orden de
// dificultad con que se van desbloqueando en duelos.
export type GrupoAnatomia = "oseo" | "muscular" | "organos" | "nervioso";
export const ORDEN_GRUPOS_ANATOMIA: GrupoAnatomia[] = ["oseo", "muscular", "organos", "nervioso"];

// Mapeo por slug — juicio de contenido, no un dato de la fila: cada
// título ya nombra el sistema ("Huesos del cráneo" = óseo, "El nombre
// del músculo..." = muscular, "Pares craneales... nervios" = nervioso,
// "Los órganos, por cavidad" = órganos).
const GRUPO_POR_SLUG: Record<string, GrupoAnatomia> = {
  "anatomia-craneo-por-zona": "oseo",
  "anatomia-nombre-del-musculo": "muscular",
  "anatomia-nervios-por-funcion": "nervioso",
  "anatomia-simple-a-compuesto": "muscular",
  "anatomia-organos-por-cavidad": "organos",
};

export interface NodoCaminoAnatomia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[] };
  estado: NodoEstado;
  grupo: GrupoAnatomia | null;
}

// Camino de Aprender de Anatomía — mismo patrón que geografia/path.ts y
// quimia/path.ts: reutiliza techniques/technique_progress
// (problem_type='anatomia'), no una tabla nueva. La progresión
// secuencial ("activo" único) ahora ordena primero por grupo
// (ORDEN_GRUPOS_ANATOMIA) y dentro de cada grupo por `orden` — mismo
// criterio que src/lib/aprender/path.ts (Numeria, por tema) y
// src/lib/enigmia/path.ts (por categoría).
export async function obtenerCaminoAnatomia(supabase: SupabaseClient, userId: string): Promise<NodoCaminoAnatomia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden")
      .eq("problem_type", "anatomia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const ordenadas = (tecnicas ?? []).slice().sort((a, b) => {
    const ga = GRUPO_POR_SLUG[a.slug];
    const gb = GRUPO_POR_SLUG[b.slug];
    const pa = ga ? ORDEN_GRUPOS_ANATOMIA.indexOf(ga) : ORDEN_GRUPOS_ANATOMIA.length;
    const pb = gb ? ORDEN_GRUPOS_ANATOMIA.indexOf(gb) : ORDEN_GRUPOS_ANATOMIA.length;
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });

  let activoAsignado = false;
  return ordenadas.map((t) => {
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
      grupo: GRUPO_POR_SLUG[t.slug] ?? null,
    };
  });
}
