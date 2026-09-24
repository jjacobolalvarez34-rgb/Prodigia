import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";
import { TECNICAS_QUIMIA, CLASES_QUIMIA } from "@/lib/quimia/lecciones";
import { ORDEN_GRUPOS_QUIMIA, type GrupoQuimia } from "@/lib/quimia/grupos";

export type { NodoEstado, GrupoQuimia };
export { ORDEN_GRUPOS_QUIMIA };

// Camino de Aprender de Quimia: Técnicas | Clases (docs/PARIDAD_MUNDOS.md
// filas 22/23). Reutiliza `techniques`/`technique_progress`
// (problem_type='quimia'), sin tablas nuevas, y arma el estado
// completado/activo/bloqueado ACÁ, en la fuente: [slug]/page.tsx vuelve a
// pedir este camino y redirige si el nodo está "bloqueado", así que el
// estado que ve el sidebar y el que valida la página tienen que ser el mismo
// (ver el bug de Numeria corregido en src/lib/aprender/pathClases.ts).
//
// Las dos pestañas usan la MISMA regla de desbloqueo, por tema (pedido del
// usuario: poder hacer las Clases por tema, no solo desde la primera):
//   - Cada grupo (tabla, símbolos, fórmulas, nomenclatura, redox, orgánica)
//     tiene su propio puntero "activo" independiente: la primera Técnica y la
//     primera Clase no dominadas de CADA grupo están abiertas a la vez;
//     dentro de un grupo el orden es lineal.
//   - Entre grupos NO se bloquea nada: el orden de curso (tabla → símbolos →
//     fórmulas → nomenclatura → redox → orgánica) es solo el recomendado y el
//     del menú lateral. Las Clases que dependen de otras (los números de
//     oxidación de la nomenclatura, la tabla de todo) re-explican lo que usan.
//   - Clases (Pro): la primera del curso es preview gratis; el resto exige
//     plan Pro (bloqueadoPorPlan).

// El mapeo slug -> grupo sale del contenido tipado (una sola fuente de
// verdad, nunca una lista repetida a mano).
function construirMapaGrupos(): Map<string, GrupoQuimia> {
  const mapa = new Map<string, GrupoQuimia>();
  for (const t of TECNICAS_QUIMIA) mapa.set(t.slug, t.grupo);
  for (const c of CLASES_QUIMIA) mapa.set(c.slug, c.grupo);
  return mapa;
}
const GRUPO_POR_SLUG = construirMapaGrupos();

// Un slug de la base que el contenido tipado no conoce cae en el primer grupo
// (no se pierde ninguna fila del camino).
export function grupoDeSlug(slug: string): GrupoQuimia {
  return GRUPO_POR_SLUG.get(slug) ?? ORDEN_GRUPOS_QUIMIA[0];
}

export interface NodoCaminoQuimia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoQuimia;
  // true para las filas de la pestaña "Clases" (techniques.requiere_pro).
  requierePro: boolean;
  // true SOLO para Clases bloqueadas porque el usuario no es Pro (no por
  // progresión normal) — mismo criterio que src/lib/aprender/clases.ts.
  bloqueadoPorPlan: boolean;
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

// Lo que la página de lección permite abrir: todo menos "bloqueado". Lo
// comparten [slug]/page.tsx y los tests de coherencia con el sidebar.
export function puedeAbrirNodoQuimia(nodo: Pick<NodoCaminoQuimia, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

// Orden recomendado: (grupo en ORDEN_GRUPOS_QUIMIA, orden dentro del grupo).
export function ordenarPorGrupoYOrden(filas: FilaTechnique[]): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = ORDEN_GRUPOS_QUIMIA.indexOf(grupoDeSlug(a.slug));
    const pb = ORDEN_GRUPOS_QUIMIA.indexOf(grupoDeSlug(b.slug));
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

function nodoDe(t: FilaTechnique, estado: NodoEstado, requierePro: boolean, bloqueadoPorPlan: boolean): NodoCaminoQuimia {
  return {
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoQuimia["contenido"],
    estado,
    grupo: grupoDeSlug(t.slug),
    requierePro,
    bloqueadoPorPlan,
  };
}

// Técnicas (`filas` YA ordenadas por (grupo, orden)): un puntero "activo" por
// grupo. Nunca dependen del plan.
export function calcularNodosTecnicas(filas: FilaTechnique[], dominadas: Set<string>): NodoCaminoQuimia[] {
  const activoPorGrupo = new Set<GrupoQuimia>();
  return filas.map((t) => {
    const grupo = grupoDeSlug(t.slug);
    if (dominadas.has(t.id)) return nodoDe(t, "completado", false, false);
    if (!activoPorGrupo.has(grupo)) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "activo", false, false);
    }
    return nodoDe(t, "bloqueado", false, false);
  });
}

// Clases (`filas` YA ordenadas por (grupo, orden)): un puntero "activo" por
// grupo, igual que las Técnicas.
// - completada: "completado".
// - la primera del curso (preview gratis): "activo" siempre que no esté
//   completada, sin importar el plan.
// - el resto sin Pro: "bloqueado" con bloqueadoPorPlan (para mostrar el CTA
//   "Desbloquea con Pro" en vez de un bloqueo mudo).
// - el resto con Pro: la primera no completada de CADA grupo queda "activo" y
//   las siguientes de ese grupo "bloqueado" (orden lineal dentro del grupo).
export function calcularNodosClases(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoQuimia[] {
  const activoPorGrupo = new Set<GrupoQuimia>();
  return filas.map((t, i) => {
    if (dominadas.has(t.id)) return nodoDe(t, "completado", true, false);
    const grupo = grupoDeSlug(t.slug);
    if (i === 0) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "activo", true, false);
    }
    if (!esPro) return nodoDe(t, "bloqueado", true, true);
    if (!activoPorGrupo.has(grupo)) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "activo", true, false);
    }
    return nodoDe(t, "bloqueado", true, false);
  });
}

// Camino completo: [...Técnicas, ...Clases] (mismo orden que el resto de los
// mundos); partirCaminoPorClases (src/lib/aprender/clases.ts) separa las dos
// pestañas. `esPro` viene del PLAN (profiles.plan), no de ningún nivel de
// calibración.
export function calcularCaminoQuimia(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoQuimia[] {
  const rapidas = ordenarPorGrupoYOrden(filas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorGrupoYOrden(filas.filter((t) => t.requiere_pro));
  return [...calcularNodosTecnicas(rapidas, dominadas), ...calcularNodosClases(clases, dominadas, esPro)];
}

export async function obtenerCaminoQuimia(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoQuimia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "quimia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id as string));
  return calcularCaminoQuimia((tecnicas ?? []) as FilaTechnique[], dominadas, esPro);
}
