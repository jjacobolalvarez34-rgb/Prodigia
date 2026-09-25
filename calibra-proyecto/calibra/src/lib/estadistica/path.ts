import type { SupabaseClient } from "@supabase/supabase-js";
import type { NodoCaminoConClases, NodoEstado } from "@/lib/aprender/clases";
import { GRUPOS_APRENDER } from "@/lib/aprender/grupos";

export type { NodoEstado };

// Camino de Aprender de Estadística: Técnicas | Clases (docs/PARIDAD_MUNDOS.md
// filas 22/23). Reutiliza `techniques`/`technique_progress`
// (problem_type='estadistica'), sin tablas nuevas, y arma el estado
// completado/activo/bloqueado ACÁ, en la fuente: [slug]/page.tsx vuelve a pedir
// este camino y redirige si el nodo está "bloqueado", así que el estado que ve
// el sidebar y el que valida la página tienen que ser el mismo (bug real de
// Numeria, commit 648f2b7: el estado se calculaba solo en una capa de
// presentación y la primera técnica de un tema posterior rebotaba sin abrir).
//
// Las dos pestañas usan la MISMA regla de desbloqueo, por tema (pedido del
// usuario para todos los mundos: poder hacer las Técnicas y las Clases por
// tema, no solo empezando por la primera; commit f238e2a):
//   - Cada TEMA (los grupos de GRUPOS_APRENDER.estadistica en
//     src/lib/aprender/grupos.ts, el mismo que muestra el sidebar) tiene su
//     puntero "activo" independiente: la primera Técnica y la primera Clase no
//     dominadas de CADA tema están abiertas a la vez; dentro de un tema el
//     orden es lineal (por `orden`).
//   - Entre temas NO se bloquea nada: el orden de currículo (datos y tendencia
//     central → dispersión → probabilidad → análisis) es el recomendado.
//   - CLASES (Pro): la primera del curso es preview gratis; el resto exige plan
//     Pro (bloqueadoPorPlan).
// Antes de este cambio las Clases eran un único curso lineal (solo se podía
// empezar por la primera) y las Técnicas, un único puntero global en la fuente
// que el sidebar corregía por tema: la página rebotaba las Técnicas "activas"
// de los temas 2 y 3 (mismo bug que Numeria).

export interface NodoCaminoEstadistica extends NodoCaminoConClases {
  // Id del tema (GRUPOS_APRENDER.estadistica[pestaña][i].id).
  grupo: string;
}

export interface FilaTechnique {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: unknown;
  orden: number;
  requiere_pro: boolean;
}

type Pestana = "tecnicas" | "clases";

// Un slug que ningún tema conoce cae en un tema propio "otras" (no se pierde
// ninguna fila del camino: mismo criterio que agruparNodos).
export function grupoDeSlug(slug: string, pestana: Pestana): string {
  const def = GRUPOS_APRENDER.estadistica[pestana].find((g) => g.slugs.includes(slug));
  return def ? def.id : "otras";
}

// Lo que la página de lección permite abrir: todo menos "bloqueado".
export function puedeAbrirNodoEstadistica(nodo: Pick<NodoCaminoEstadistica, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

function nodoDe(t: FilaTechnique, estado: NodoEstado, pestana: Pestana, bloqueadoPorPlan: boolean): NodoCaminoEstadistica {
  return {
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoEstadistica["contenido"],
    estado,
    grupo: grupoDeSlug(t.slug, pestana),
    requierePro: pestana === "clases",
    bloqueadoPorPlan,
  };
}

// Técnicas (`filas` ya ordenadas por `orden`): un puntero "activo" por tema.
// Nunca dependen del plan.
export function calcularNodosTecnicas(filas: FilaTechnique[], dominadas: Set<string>): NodoCaminoEstadistica[] {
  const activoPorGrupo = new Set<string>();
  return filas.map((t) => {
    if (dominadas.has(t.id)) return nodoDe(t, "completado", "tecnicas", false);
    const grupo = grupoDeSlug(t.slug, "tecnicas");
    if (!activoPorGrupo.has(grupo)) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "activo", "tecnicas", false);
    }
    return nodoDe(t, "bloqueado", "tecnicas", false);
  });
}

// Clases (`filas` ya ordenadas por `orden`): un puntero "activo" por tema.
// - completada: "completado".
// - la primera del curso (preview gratis): "activo" siempre que no esté
//   completada, sin importar el plan.
// - el resto sin Pro: "bloqueado" con bloqueadoPorPlan (para mostrar el CTA
//   "Desbloquea con Pro" en vez de un bloqueo mudo).
// - el resto con Pro: la primera no completada de CADA tema queda "activo" y
//   las siguientes de ese tema "bloqueado" (orden lineal dentro del tema).
export function calcularNodosClases(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoEstadistica[] {
  const activoPorGrupo = new Set<string>();
  return filas.map((t, i) => {
    if (dominadas.has(t.id)) return nodoDe(t, "completado", "clases", false);
    const grupo = grupoDeSlug(t.slug, "clases");
    if (i === 0) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "activo", "clases", false);
    }
    if (!esPro) return nodoDe(t, "bloqueado", "clases", true);
    if (!activoPorGrupo.has(grupo)) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "activo", "clases", false);
    }
    return nodoDe(t, "bloqueado", "clases", false);
  });
}

// Camino completo: [...Técnicas, ...Clases] (mismo orden que el resto de los
// mundos); partirCaminoPorClases (src/lib/aprender/clases.ts) separa las dos
// pestañas. `esPro` viene del PLAN (profiles.plan), no de ningún nivel de
// calibración (skill_levels `estadistica_*`, que este archivo no toca).
export function calcularCaminoEstadistica(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoEstadistica[] {
  const porOrden = (a: FilaTechnique, b: FilaTechnique) => a.orden - b.orden;
  const rapidas = filas.filter((t) => !t.requiere_pro).sort(porOrden);
  const clases = filas.filter((t) => t.requiere_pro).sort(porOrden);
  return [...calcularNodosTecnicas(rapidas, dominadas), ...calcularNodosClases(clases, dominadas, esPro)];
}

export async function obtenerCaminoEstadistica(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoEstadistica[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "estadistica")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id as string));
  return calcularCaminoEstadistica((tecnicas ?? []) as FilaTechnique[], dominadas, esPro);
}
