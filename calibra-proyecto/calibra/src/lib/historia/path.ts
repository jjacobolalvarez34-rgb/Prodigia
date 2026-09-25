import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { TECNICAS_HISTORIA, CLASES_HISTORIA } from "@/lib/historia/lecciones";
import { ORDEN_GRUPOS_HISTORIA, type GrupoHistoria } from "@/lib/historia/bloques";
import { localeServidor, localizarFilas } from "@/lib/i18n-lecciones/localizar";

export type { NodoEstado, GrupoHistoria };
export { ORDEN_GRUPOS_HISTORIA };

// Camino de Aprender de Historia: Técnicas | Clases (docs/PARIDAD_MUNDOS.md filas
// 22/23). Reutiliza `techniques`/`technique_progress` (problem_type='historia'),
// sin tablas nuevas, y arma el estado completado/activo/bloqueado ACÁ, en la
// fuente: [slug]/page.tsx vuelve a pedir este camino y redirige si el nodo está
// «bloqueado», así que el estado que ve el sidebar y el que valida la página tienen
// que ser el mismo (bug real de Numeria, commit 648f2b7: el estado se calculaba solo
// en una capa de presentación y la primera técnica de un tema posterior rebotaba
// sin abrir).
//
// Las dos pestañas usan la MISMA regla de desbloqueo, por ÉPOCA (pedido del usuario
// para todos los mundos: poder hacer las Clases por tema, no solo empezando por la
// primera):
//   - Cada ÉPOCA (Prehistoria, Antigüedad, Edad Media, Edad Moderna y Edad
//     Contemporánea) tiene su puntero «activo» independiente: la primera Técnica y
//     la primera Clase no dominadas de CADA época están abiertas a la vez; dentro
//     de una época el orden es lineal (la historia de una época es acumulativa: lo
//     que pasa en el segundo tema se apoya en el primero).
//   - Entre épocas NO se bloquea nada: el orden cronológico es el RECOMENDADO y el
//     del menú lateral. Como una lección no puede suponer que se hizo la de otra
//     época, cada Clase repasa en un paso «Contexto:» lo que usa de épocas
//     anteriores y lecciones.test.ts verifica las dependencias dentro de la misma
//     época (entre épocas basta con que la lección lo re-introduzca).
//   - CLASES (Pro): la primera del mundo (Prehistoria) es preview gratis; el resto
//     exige plan Pro (bloqueadoPorPlan).

// El mapeo slug -> época sale del contenido tipado (una sola fuente de verdad,
// nunca una lista repetida a mano).
function construirMapaGrupos(): Map<string, GrupoHistoria> {
  const mapa = new Map<string, GrupoHistoria>();
  for (const t of TECNICAS_HISTORIA) mapa.set(t.slug, t.grupo);
  for (const c of CLASES_HISTORIA) mapa.set(c.slug, c.grupo);
  return mapa;
}
const GRUPO_POR_SLUG = construirMapaGrupos();

// Un slug de la base que el contenido tipado no conoce cae en la primera época
// (no se pierde ninguna fila del camino).
export function grupoDeSlug(slug: string): GrupoHistoria {
  return GRUPO_POR_SLUG.get(slug) ?? ORDEN_GRUPOS_HISTORIA[0];
}

export interface NodoCaminoHistoria {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoHistoria;
  // true para las filas de la pestaña «Clases» (techniques.requiere_pro).
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

// Lo que la página de lección permite abrir: todo menos «bloqueado». Lo comparten
// [slug]/page.tsx y los tests de coherencia con el sidebar.
export function puedeAbrirNodoHistoria(nodo: Pick<NodoCaminoHistoria, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

// Orden de curso: (época en ORDEN_GRUPOS_HISTORIA, orden dentro de la época).
export function ordenarPorGrupoYOrden(filas: FilaTechnique[]): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = ORDEN_GRUPOS_HISTORIA.indexOf(grupoDeSlug(a.slug));
    const pb = ORDEN_GRUPOS_HISTORIA.indexOf(grupoDeSlug(b.slug));
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

function nodoDe(t: FilaTechnique, estado: NodoEstado, requierePro: boolean, bloqueadoPorPlan: boolean): NodoCaminoHistoria {
  return {
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoHistoria["contenido"],
    estado,
    grupo: grupoDeSlug(t.slug),
    requierePro,
    bloqueadoPorPlan,
  };
}

// Técnicas (`filas` YA ordenadas por (época, orden)): un puntero «activo» por
// época. Nunca dependen del plan.
export function calcularNodosTecnicas(filas: FilaTechnique[], dominadas: Set<string>): NodoCaminoHistoria[] {
  const activoPorGrupo = new Set<GrupoHistoria>();
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

// Clases (`filas` YA ordenadas por (época, orden)):
// - completada: «completado».
// - la primera del mundo (preview gratis): «activo» siempre que no esté
//   completada, sin importar el plan.
// - el resto sin Pro: «bloqueado» con bloqueadoPorPlan (para mostrar el CTA
//   «Desbloquea con Pro» en vez de un bloqueo mudo).
// - el resto con Pro: la primera no completada de CADA época queda «activo» y las
//   siguientes de esa época «bloqueado» (orden lineal dentro de la época).
export function calcularNodosClases(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoHistoria[] {
  const activoPorGrupo = new Set<GrupoHistoria>();
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
// calibración (skill_levels `historia_*`, que este archivo no toca).
export function calcularCaminoHistoria(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoHistoria[] {
  const rapidas = ordenarPorGrupoYOrden(filas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorGrupoYOrden(filas.filter((t) => t.requiere_pro));
  return [...calcularNodosTecnicas(rapidas, dominadas), ...calcularNodosClases(clases, dominadas, esPro)];
}

export async function obtenerCaminoHistoria(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoHistoria[]> {
  const locale = await localeServidor();
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, nombre_en, descripcion_en, contenido_en, orden, requiere_pro")
      .eq("problem_type", "historia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id as string));
  return calcularCaminoHistoria(localizarFilas(tecnicas, locale) as FilaTechnique[], dominadas, esPro);
}

// Arma las «unidades» del sidebar y del camino de Aprender (una por época con
// lecciones) leyendo el `grupo` y el `estado` que ya calculó este archivo: la
// página NO recalcula ningún estado, así que lo que muestra el sidebar es
// exactamente lo que después valida [slug]/page.tsx.
export function construirUnidadesHistoria(
  nodos: NodoCaminoHistoria[],
  nombreGrupo: Record<GrupoHistoria, string>,
  ctaPro: { label: string; href: string }
): UnidadCaminoGenerico[] {
  return ORDEN_GRUPOS_HISTORIA.map((grupo) => ({ grupo, nodos: nodos.filter((n) => n.grupo === grupo) }))
    .filter((g) => g.nodos.length > 0)
    .map((g) => ({
      id: `historia-${g.grupo}`,
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
