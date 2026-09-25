import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { TECNICAS_CALCULIA, CLASES_CALCULIA } from "@/lib/calculia/lecciones";
import { ORDEN_GRUPOS_CALCULIA, type GrupoCalculia } from "@/lib/calculia/bloques";

export type { NodoEstado, GrupoCalculia };
export { ORDEN_GRUPOS_CALCULIA };

// Camino de Aprender de Calculia: Técnicas | Clases (docs/PARIDAD_MUNDOS.md
// filas 22/23). Reutiliza `techniques`/`technique_progress`
// (problem_type='calculia'), sin tablas nuevas, y arma el estado
// completado/activo/bloqueado ACÁ, en la fuente: [slug]/page.tsx vuelve a pedir
// este camino y redirige si el nodo está "bloqueado", así que el estado que ve
// el sidebar y el que valida la página tienen que ser el mismo (bug real de
// Numeria, commit 648f2b7: el estado se calculaba solo en una capa de
// presentación y la primera técnica de un tema posterior rebotaba sin abrir).
//
// Antes este archivo delegaba en obtenerCaminoConClases (src/lib/aprender/
// clases.ts), que es UN solo puntero lineal por pestaña: las Clases eran un
// curso único (solo se podía empezar por la primera) y las Técnicas solo se
// veían "por tema" en el sidebar mientras la página seguía rechazando la
// primera Técnica de un tema posterior. Ahora las dos pestañas usan la MISMA
// regla, por tema (pedido del usuario para todos los mundos: poder empezar por
// el tema que se quiera, en Técnicas y en Clases):
//   - Cada TEMA del currículo (derivadas, integrales, series, multivariable y
//     EDOs) tiene su puntero "activo" independiente: la primera Técnica y la
//     primera Clase no dominadas de CADA tema están abiertas a la vez; dentro
//     de un tema el orden es lineal.
//   - Entre temas NO se bloquea nada (el orden derivadas → integrales → series
//     → multivariable es solo el recomendado y el del menú lateral).
//   - CLASES (Pro): la primera del currículo es preview gratis; el resto exige
//     plan Pro (bloqueadoPorPlan).

// El mapeo slug -> tema sale del contenido tipado (una sola fuente de verdad,
// nunca una lista repetida a mano).
function construirMapaGrupos(): Map<string, GrupoCalculia> {
  const mapa = new Map<string, GrupoCalculia>();
  for (const t of TECNICAS_CALCULIA) mapa.set(t.slug, t.grupo);
  for (const c of CLASES_CALCULIA) mapa.set(c.slug, c.grupo);
  return mapa;
}
const GRUPO_POR_SLUG = construirMapaGrupos();

// Un slug de la base que el contenido tipado no conoce cae en el primer tema
// (no se pierde ninguna fila del camino).
export function grupoDeSlug(slug: string): GrupoCalculia {
  return GRUPO_POR_SLUG.get(slug) ?? ORDEN_GRUPOS_CALCULIA[0];
}

export interface NodoCaminoCalculia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoCalculia;
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
export function puedeAbrirNodoCalculia(nodo: Pick<NodoCaminoCalculia, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

// Orden de currículo: (tema en ORDEN_GRUPOS_CALCULIA, orden dentro de la tabla).
export function ordenarPorGrupoYOrden(filas: FilaTechnique[]): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = ORDEN_GRUPOS_CALCULIA.indexOf(grupoDeSlug(a.slug));
    const pb = ORDEN_GRUPOS_CALCULIA.indexOf(grupoDeSlug(b.slug));
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

function nodoDe(t: FilaTechnique, estado: NodoEstado, requierePro: boolean, bloqueadoPorPlan: boolean): NodoCaminoCalculia {
  return {
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoCalculia["contenido"],
    estado,
    grupo: grupoDeSlug(t.slug),
    requierePro,
    bloqueadoPorPlan,
  };
}

// Técnicas (`filas` YA ordenadas por (tema, orden)): un puntero "activo" por
// tema. Nunca dependen del plan.
export function calcularNodosTecnicas(filas: FilaTechnique[], dominadas: Set<string>): NodoCaminoCalculia[] {
  const activoPorGrupo = new Set<GrupoCalculia>();
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

// Clases (`filas` YA ordenadas por (tema, orden)): un puntero "activo" por tema,
// igual que las Técnicas.
// - completada: "completado".
// - la primera del curso (preview gratis): "activo" siempre que no esté
//   completada, sin importar el plan.
// - el resto sin Pro: "bloqueado" con bloqueadoPorPlan (para mostrar el CTA
//   "Desbloquea con Pro" en vez de un bloqueo mudo).
// - el resto con Pro: la primera no completada de CADA tema queda "activo" y las
//   siguientes de ese tema "bloqueado" (orden lineal dentro del tema).
export function calcularNodosClases(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoCalculia[] {
  const activoPorGrupo = new Set<GrupoCalculia>();
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
// calibración (skill_levels `calculia_*`, que este archivo no toca).
export function calcularCaminoCalculia(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoCalculia[] {
  const rapidas = ordenarPorGrupoYOrden(filas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorGrupoYOrden(filas.filter((t) => t.requiere_pro));
  return [...calcularNodosTecnicas(rapidas, dominadas), ...calcularNodosClases(clases, dominadas, esPro)];
}

export async function obtenerCaminoCalculia(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoCalculia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "calculia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id as string));
  return calcularCaminoCalculia((tecnicas ?? []) as FilaTechnique[], dominadas, esPro);
}

// Arma las "unidades" del sidebar y del camino de Aprender (una por tema con
// lecciones) leyendo el `grupo` y el `estado` que ya calculó este archivo: la
// página NO recalcula ningún estado, así que lo que muestra el sidebar es
// exactamente lo que después valida [slug]/page.tsx.
export function construirUnidadesCalculia(
  nodos: NodoCaminoCalculia[],
  nombreGrupo: Record<GrupoCalculia, string>,
  ctaPro: { label: string; href: string }
): UnidadCaminoGenerico[] {
  return ORDEN_GRUPOS_CALCULIA.map((grupo) => ({ grupo, nodos: nodos.filter((n) => n.grupo === grupo) }))
    .filter((g) => g.nodos.length > 0)
    .map((g) => ({
      id: `calculia-${g.grupo}`,
      nombre: nombreGrupo[g.grupo],
      nodos: g.nodos.map((n) => ({
        id: n.id,
        slug: n.slug,
        nombre: n.nombre,
        estado: n.estado,
        ctaPro: n.bloqueadoPorPlan ? ctaPro : undefined,
      })),
    }));
}
