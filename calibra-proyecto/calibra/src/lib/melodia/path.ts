import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";

export type NodoEstado = "completado" | "activo" | "bloqueado";

// Grupos de "Aprender" (presentación, sin columna nueva en DB — ver
// docs/PARIDAD_MUNDOS.md footnote ⁹): usan los mismos slugs que
// modo_melodia_aleatorio_por_rango (0090/0096) y las claves
// Melodia.home.modos.* de i18n, en el mismo orden de dificultad con que
// se van desbloqueando en duelos. "fundamentos"/"escalas"/"oido_absoluto"
// no tienen técnica de Aprender todavía, así que no aparecen acá.
export type GrupoMelodia = "lectura" | "alteraciones" | "acordes";
export const ORDEN_GRUPOS_MELODIA: GrupoMelodia[] = ["lectura", "alteraciones", "acordes"];

// Mapeo por slug — juicio de contenido, no un dato de la fila: los
// títulos ya lo dicen ("Leé el pentagrama..." / "...9 posiciones" =
// lectura; "Sostenidos y bemoles" = alteraciones, literalmente el
// término técnico; "tríada"/"séptima" = acordes).
const GRUPO_POR_SLUG: Record<string, GrupoMelodia> = {
  "melodia-lineas-y-espacios": "lectura",
  "melodia-truco-lineas-espacios": "lectura",
  "melodia-triada-fundamental-3-5": "acordes",
  "melodia-de-triada-a-septima": "acordes",
  "melodia-sostenidos-bemoles": "alteraciones",
};

export interface NodoCaminoMelodia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoMelodia | null;
}

// Camino de Aprender de Melodía — mismo patrón que src/lib/quimia/path.ts:
// reutiliza `techniques`/`technique_progress` (problem_type='melodia'),
// no una tabla nueva. La progresión secuencial ("activo" único) ahora
// ordena primero por grupo (ORDEN_GRUPOS_MELODIA) y dentro de cada
// grupo por `orden` — mismo criterio que src/lib/aprender/path.ts
// (Numeria, por tema) y src/lib/enigmia/path.ts (por categoría).
export async function obtenerCaminoMelodia(supabase: SupabaseClient, userId: string): Promise<NodoCaminoMelodia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden")
      .eq("problem_type", "melodia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const ordenadas = (tecnicas ?? []).slice().sort((a, b) => {
    const ga = GRUPO_POR_SLUG[a.slug];
    const gb = GRUPO_POR_SLUG[b.slug];
    const pa = ga ? ORDEN_GRUPOS_MELODIA.indexOf(ga) : ORDEN_GRUPOS_MELODIA.length;
    const pb = gb ? ORDEN_GRUPOS_MELODIA.indexOf(gb) : ORDEN_GRUPOS_MELODIA.length;
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
      contenido: t.contenido as { pasos: string[]; quiz?: TechniqueQuizPregunta[] },
      estado,
      grupo: GRUPO_POR_SLUG[t.slug] ?? null,
    };
  });
}
