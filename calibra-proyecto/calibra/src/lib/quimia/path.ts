import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";

export type NodoEstado = "completado" | "activo" | "bloqueado";

// Los 4 grupos de "Aprender" (presentación, sin columna nueva en DB —
// ver docs/PARIDAD_MUNDOS.md footnote ⁹): coinciden 1 a 1 con los modos
// reales de práctica de Quimia (mismos slugs que usa
// modo_quimia_aleatorio_por_rango en 0090_duelos_anatomia_melodia.sql
// y las claves Quimia.modos.* de i18n), en el mismo orden de dificultad
// con que se van desbloqueando en duelos. "nomenclatura"/"organica" no
// tienen técnica de Aprender todavía, así que no aparecen acá.
export type GrupoQuimia = "simbolos" | "formulas" | "tabla";
export const ORDEN_GRUPOS_QUIMIA: GrupoQuimia[] = ["simbolos", "formulas", "tabla"];

// Mapeo por slug — juicio de contenido, no un dato de la fila: cada
// técnica ya dice explícitamente de qué se trata ("Au es oro, pensá en
// el brillo dorado" = símbolos; "leer la tabla como un mapa" = tabla
// periódica; "cómo se nombran los compuestos" = fórmulas).
// agrupar-por-familia también cae en "tabla" porque agrupar por familia
// química ES agrupar por columna/grupo de la tabla periódica (mismo
// truco que explica tabla-como-mapa).
const GRUPO_POR_SLUG: Record<string, GrupoQuimia> = {
  "agrupar-por-familia": "tabla",
  "asociacion-color-uso": "simbolos",
  "tabla-como-mapa": "tabla",
  "patrones-en-formulas": "formulas",
};

export interface NodoCaminoQuimia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoQuimia | null;
}

// Camino de Aprender de Quimia — mismo patrón que src/lib/geografia/path.ts:
// reutiliza `techniques`/`technique_progress` (problem_type='quimia'),
// no una tabla nueva. La progresión secuencial ("activo" único) ahora
// ordena primero por grupo (ORDEN_GRUPOS) y dentro de cada grupo por
// `orden` — mismo criterio que ya usan src/lib/aprender/path.ts
// (Numeria, por tema) y src/lib/enigmia/path.ts (por categoría), para
// que el nodo "activo" siempre aparezca dentro del grupo que se
// renderiza primero, nunca "salteado" visualmente.
export async function obtenerCaminoQuimia(supabase: SupabaseClient, userId: string): Promise<NodoCaminoQuimia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden")
      .eq("problem_type", "quimia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const ordenadas = (tecnicas ?? []).slice().sort((a, b) => {
    const ga = GRUPO_POR_SLUG[a.slug];
    const gb = GRUPO_POR_SLUG[b.slug];
    const pa = ga ? ORDEN_GRUPOS_QUIMIA.indexOf(ga) : ORDEN_GRUPOS_QUIMIA.length;
    const pb = gb ? ORDEN_GRUPOS_QUIMIA.indexOf(gb) : ORDEN_GRUPOS_QUIMIA.length;
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
