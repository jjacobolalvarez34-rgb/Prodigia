import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { TECNICAS_TRIGONOMETRIA, CLASES_TRIGONOMETRIA } from "@/lib/trigonometria/lecciones";
import { ORDEN_GRUPOS_TRIGONOMETRIA, type GrupoTrigonometria } from "@/lib/trigonometria/bloques";

export type { NodoEstado, GrupoTrigonometria };
export { ORDEN_GRUPOS_TRIGONOMETRIA };

// Camino de Aprender de Trigonometría: Técnicas | Clases (docs/PARIDAD_MUNDOS.md
// filas 22/23). Reutiliza `techniques`/`technique_progress`
// (problem_type='trigonometria'), sin tablas nuevas, y arma el estado
// completado/activo/bloqueado ACÁ, en la fuente: [slug]/page.tsx vuelve a pedir
// este camino y redirige si el nodo está "bloqueado", así que el estado que ve
// el sidebar y el que valida la página tienen que ser el mismo (bug real de
// Numeria, commit 648f2b7: el estado se calculaba solo en una capa de
// presentación y la primera técnica de un tema posterior rebotaba sin abrir).
//
// Dos progresiones con criterio DISTINTO, a propósito:
//   - TÉCNICAS (gratis): atajos sueltos. Cada BLOQUE del currículo (razones,
//     círculo, gráficas, leyes, identidades, ecuaciones) tiene su puntero
//     "activo" independiente: la primera Técnica no dominada de CADA bloque
//     está abierta a la vez; dentro de un bloque es estrictamente lineal (regla
//     del usuario para todos los mundos).
//   - CLASES (Pro): UN curso lineal único, en orden de currículo (bloque y
//     después `orden`), con una sola Clase "activa" a la vez. DECISIÓN
//     (recomendada por el diseño y documentada en PARIDAD_MUNDOS.md): el temario
//     es ACUMULATIVO y cada Clase usa conceptos de las anteriores (las razones
//     se generalizan en el círculo unitario, las gráficas usan los radianes y
//     los valores exactos, las ecuaciones usan las identidades y las inversas);
//     lecciones.test.ts verifica ese grafo de dependencias. Dejar abrir, por
//     ejemplo, «Ecuaciones» antes de «Círculo unitario» produciría una Clase
//     que usa conceptos aún no enseñados. La primera Clase es preview gratis;
//     el resto exige plan Pro.

// El mapeo slug -> bloque sale del contenido tipado (una sola fuente de verdad,
// nunca una lista repetida a mano).
function construirMapaGrupos(): Map<string, GrupoTrigonometria> {
  const mapa = new Map<string, GrupoTrigonometria>();
  for (const t of TECNICAS_TRIGONOMETRIA) mapa.set(t.slug, t.grupo);
  for (const c of CLASES_TRIGONOMETRIA) mapa.set(c.slug, c.grupo);
  return mapa;
}
const GRUPO_POR_SLUG = construirMapaGrupos();

// Un slug de la base que el contenido tipado no conoce cae en el primer bloque
// (no se pierde ninguna fila del camino).
export function grupoDeSlug(slug: string): GrupoTrigonometria {
  return GRUPO_POR_SLUG.get(slug) ?? ORDEN_GRUPOS_TRIGONOMETRIA[0];
}

export interface NodoCaminoTrigonometria {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoTrigonometria;
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
export function puedeAbrirNodoTrigonometria(nodo: Pick<NodoCaminoTrigonometria, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

// Orden de curso: (bloque en ORDEN_GRUPOS_TRIGONOMETRIA, orden dentro del bloque).
export function ordenarPorGrupoYOrden(filas: FilaTechnique[]): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = ORDEN_GRUPOS_TRIGONOMETRIA.indexOf(grupoDeSlug(a.slug));
    const pb = ORDEN_GRUPOS_TRIGONOMETRIA.indexOf(grupoDeSlug(b.slug));
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

function nodoDe(t: FilaTechnique, estado: NodoEstado, requierePro: boolean, bloqueadoPorPlan: boolean): NodoCaminoTrigonometria {
  return {
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoTrigonometria["contenido"],
    estado,
    grupo: grupoDeSlug(t.slug),
    requierePro,
    bloqueadoPorPlan,
  };
}

// Técnicas (`filas` YA ordenadas por (bloque, orden)): un puntero "activo" por
// bloque. Nunca dependen del plan.
export function calcularNodosTecnicas(filas: FilaTechnique[], dominadas: Set<string>): NodoCaminoTrigonometria[] {
  const activoPorGrupo = new Set<GrupoTrigonometria>();
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

// Clases (`filas` YA ordenadas en orden de curso): UNA sola progresión.
// - completada: "completado".
// - la primera del curso (preview gratis): "activo" siempre que no esté
//   completada, sin importar el plan.
// - el resto sin Pro: "bloqueado" con bloqueadoPorPlan (para mostrar el CTA
//   "Desbloquea con Pro" en vez de un bloqueo mudo).
// - el resto con Pro: la primera no completada del curso queda "activo" y las
//   siguientes "bloqueado" (dependencia real entre clases).
export function calcularNodosClases(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoTrigonometria[] {
  let punteroAsignado = false;
  return filas.map((t, i) => {
    if (dominadas.has(t.id)) return nodoDe(t, "completado", true, false);
    if (i === 0) {
      punteroAsignado = true;
      return nodoDe(t, "activo", true, false);
    }
    if (!esPro) return nodoDe(t, "bloqueado", true, true);
    if (!punteroAsignado) {
      punteroAsignado = true;
      return nodoDe(t, "activo", true, false);
    }
    return nodoDe(t, "bloqueado", true, false);
  });
}

// Camino completo: [...Técnicas, ...Clases] (mismo orden que el resto de los
// mundos); partirCaminoPorClases (src/lib/aprender/clases.ts) separa las dos
// pestañas. `esPro` viene del PLAN (profiles.plan), no de ningún nivel de
// calibración (skill_levels `trigonometria_*`, que este archivo no toca).
export function calcularCaminoTrigonometria(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoTrigonometria[] {
  const rapidas = ordenarPorGrupoYOrden(filas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorGrupoYOrden(filas.filter((t) => t.requiere_pro));
  return [...calcularNodosTecnicas(rapidas, dominadas), ...calcularNodosClases(clases, dominadas, esPro)];
}

export async function obtenerCaminoTrigonometria(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoTrigonometria[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "trigonometria")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id as string));
  return calcularCaminoTrigonometria((tecnicas ?? []) as FilaTechnique[], dominadas, esPro);
}

// Arma las "unidades" del sidebar y del camino de Aprender (una por bloque con
// lecciones) leyendo el `grupo` y el `estado` que ya calculó este archivo: la
// página NO recalcula ningún estado, así que lo que muestra el sidebar es
// exactamente lo que después valida [slug]/page.tsx.
export function construirUnidadesTrigonometria(
  nodos: NodoCaminoTrigonometria[],
  nombreGrupo: Record<GrupoTrigonometria, string>,
  ctaPro: { label: string; href: string }
): UnidadCaminoGenerico[] {
  return ORDEN_GRUPOS_TRIGONOMETRIA.map((grupo) => ({ grupo, nodos: nodos.filter((n) => n.grupo === grupo) }))
    .filter((g) => g.nodos.length > 0)
    .map((g) => ({
      id: `trigonometria-${g.grupo}`,
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
