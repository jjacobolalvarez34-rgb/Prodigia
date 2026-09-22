import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";

export type NodoEstado = "completado" | "activo" | "bloqueado";

// Grupos de "Aprender" (presentación, sin columna nueva en DB — ver
// docs/PARIDAD_MUNDOS.md footnote ⁹): coinciden con los modos reales
// de práctica (mismos slugs que modo_trigonometria_aleatorio_por_rango
// en 0108_mundo_trigonometria.sql y las claves Trigonometria.modos.* de
// i18n), en el mismo orden de dificultad con que se van desbloqueando
// en duelos. "identidades" no tiene técnica de Aprender todavía, así
// que no aparece acá.
export type GrupoTrigonometria = "razones" | "circulo" | "leyes";
export const ORDEN_GRUPOS_TRIGONOMETRIA: GrupoTrigonometria[] = ["razones", "circulo", "leyes"];

// Mapeo por slug — juicio de contenido: SOHCAHTOA son las razones
// básicas; el truco de la mano y la simetría por cuadrante son ambos
// círculo unitario; grados-radianes también cae en "círculo" porque es
// la conversión que se necesita justo para leer esos mismos valores
// notables del círculo unitario; "cuándo usar cada ley" es,
// literalmente, leyes de seno/coseno.
const GRUPO_POR_SLUG: Record<string, GrupoTrigonometria> = {
  "trigonometria-sohcahtoa": "razones",
  "trigonometria-truco-mano-circulo": "circulo",
  "trigonometria-simetria-cuadrantes": "circulo",
  "trigonometria-grados-radianes": "circulo",
  "trigonometria-cuando-usar-cada-ley": "leyes",
};

export interface NodoCaminoTrigonometria {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoTrigonometria | null;
}

// Camino de Aprender de Trigonometría — mismo patrón que
// src/lib/melodia/path.ts: reutiliza techniques/technique_progress
// (problem_type='trigonometria'), no una tabla nueva. La progresión
// secuencial ("activo" único) ahora ordena primero por grupo
// (ORDEN_GRUPOS_TRIGONOMETRIA) y dentro de cada grupo por `orden` —
// mismo criterio que src/lib/aprender/path.ts (Numeria, por tema) y
// src/lib/enigmia/path.ts (por categoría). En este mundo el `orden`
// original de seed ya coincide 1 a 1 con el orden agrupado (razones,
// círculo×3, leyes), así que no cambia la secuencia real — solo la
// hace explícita.
export async function obtenerCaminoTrigonometria(supabase: SupabaseClient, userId: string): Promise<NodoCaminoTrigonometria[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden")
      .eq("problem_type", "trigonometria")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const ordenadas = (tecnicas ?? []).slice().sort((a, b) => {
    const ga = GRUPO_POR_SLUG[a.slug];
    const gb = GRUPO_POR_SLUG[b.slug];
    const pa = ga ? ORDEN_GRUPOS_TRIGONOMETRIA.indexOf(ga) : ORDEN_GRUPOS_TRIGONOMETRIA.length;
    const pb = gb ? ORDEN_GRUPOS_TRIGONOMETRIA.indexOf(gb) : ORDEN_GRUPOS_TRIGONOMETRIA.length;
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });

  // Desbloqueo por grupo (pedido del usuario 2026-09-22): puntero "activo"
  // independiente por grupo, no uno global para todo el camino — ver el
  // mismo cambio en src/lib/quimia/path.ts para el detalle completo.
  const activoPorGrupo = new Set<GrupoTrigonometria | null>();
  return ordenadas.map((t) => {
    const completado = dominadas.has(t.id);
    const grupo = GRUPO_POR_SLUG[t.slug] ?? null;
    let estado: NodoEstado;
    if (completado) {
      estado = "completado";
    } else if (!activoPorGrupo.has(grupo)) {
      estado = "activo";
      activoPorGrupo.add(grupo);
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
      grupo,
    };
  });
}
