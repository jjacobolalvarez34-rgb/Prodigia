import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";
import { ORDEN_GRUPOS_ANATOMIA, type GrupoAnatomia } from "@/lib/anatomia/grupos";
import { TECNICAS_ANATOMIA, CLASES_ANATOMIA } from "@/lib/anatomia/lecciones";
import { localeServidor, localizarFilas } from "@/lib/i18n-lecciones/localizar";

export type { NodoEstado, GrupoAnatomia };
export { ORDEN_GRUPOS_ANATOMIA };

// Camino de Aprender de Anatomía: Técnicas | Clases (docs/PARIDAD_MUNDOS.md
// filas 22/23). Reutiliza `techniques`/`technique_progress`
// (problem_type='anatomia'), sin tablas nuevas.
//
// El estado completado/activo/bloqueado se calcula ACÁ, en la fuente:
// [slug]/page.tsx vuelve a pedir este camino y redirige a /aprender si el
// nodo está "bloqueado", así que el estado que ve el sidebar y el que valida
// la página son el mismo (bug real de Numeria, commit 648f2b7: el estado se
// calculaba solo en una capa de presentación y la primera técnica de un
// tema posterior redirigía sin abrir nada).
//
// Decisión de desbloqueo (documentada en PARIDAD_MUNDOS.md):
//   - TÉCNICAS (gratis): puntero "activo" independiente POR GRUPO (óseo,
//     muscular, órganos, nervioso), lineal dentro de cada grupo.
//   - CLASES (Pro): también un curso independiente POR SISTEMA (mismo
//     criterio que Geografía por continente), lineal dentro del sistema. Los
//     cuatro sistemas se pueden empezar en cualquier orden; lo que sí
//     depende de otra cosa está DENTRO del sistema (planos y posición →
//     tejido óseo → cráneo → columna → apendicular → articulaciones; tipos de
//     músculo → origen/inserción → cabeza y cuello → tronco → extremidades;
//     etc.). No se impone un orden entre sistemas (p. ej. óseo antes que
//     muscular) porque cada lección re-explica lo que usa. Para un usuario
//     NO Pro solo la primera Clase de todas (orden global más bajo) queda
//     abierta (preview gratis); las demás "primeras de su sistema" quedan
//     bloqueadas con bloqueadoPorPlan=true.
//
// El mapeo slug -> grupo sale del contenido tipado (una sola fuente de
// verdad, nunca una lista repetida a mano).
function construirMapaGrupos(): Map<string, GrupoAnatomia> {
  const mapa = new Map<string, GrupoAnatomia>();
  for (const t of TECNICAS_ANATOMIA) mapa.set(t.slug, t.grupo);
  for (const c of CLASES_ANATOMIA) mapa.set(c.slug, c.grupo);
  return mapa;
}
const GRUPO_POR_SLUG = construirMapaGrupos();

// Un slug de la base que el contenido tipado no conoce cae en el primer
// grupo (no se pierde ninguna fila del camino).
export function grupoDeSlug(slug: string): GrupoAnatomia {
  return GRUPO_POR_SLUG.get(slug) ?? ORDEN_GRUPOS_ANATOMIA[0];
}

export interface NodoCaminoAnatomia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoAnatomia;
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
export function puedeAbrirNodoAnatomia(nodo: Pick<NodoCaminoAnatomia, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

// Orden del camino: (grupo en ORDEN_GRUPOS_ANATOMIA, `orden` dentro del
// grupo). Exportada para testear el desbloqueo sin mockear Supabase.
export function ordenarPorGrupoYOrden(filas: FilaTechnique[]): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = ORDEN_GRUPOS_ANATOMIA.indexOf(grupoDeSlug(a.slug));
    const pb = ORDEN_GRUPOS_ANATOMIA.indexOf(grupoDeSlug(b.slug));
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

// Estado de un pool (Técnicas o Clases) YA ordenado por (grupo, orden), con
// desbloqueo POR GRUPO independiente: la primera fila no dominada de CADA
// grupo queda "activo" a la vez; dentro del grupo es estrictamente lineal.
// Para Clases, `previewGlobalId` es el único nodo que puede quedar "activo"
// para un usuario no-Pro.
export function calcularNodos(
  filas: FilaTechnique[],
  dominadas: Set<string>,
  requierePro: boolean,
  esPro: boolean,
  previewGlobalId: string | undefined
): NodoCaminoAnatomia[] {
  const activoPorGrupo = new Set<GrupoAnatomia>();
  return filas.map((t) => {
    const completado = dominadas.has(t.id);
    const grupo = grupoDeSlug(t.slug);
    let estado: NodoEstado;
    let bloqueadoPorPlan = false;

    if (completado) {
      estado = "completado";
    } else if (!activoPorGrupo.has(grupo)) {
      activoPorGrupo.add(grupo);
      if (!requierePro) {
        estado = "activo";
      } else if (t.id === previewGlobalId || esPro) {
        estado = "activo";
      } else {
        estado = "bloqueado";
        bloqueadoPorPlan = true;
      }
    } else {
      estado = "bloqueado";
    }

    return {
      id: t.id,
      slug: t.slug,
      nombre: t.nombre,
      descripcion: t.descripcion,
      contenido: t.contenido as NodoCaminoAnatomia["contenido"],
      estado,
      grupo,
      requierePro,
      bloqueadoPorPlan,
    };
  });
}

// Devuelve [...técnicas, ...clases] (mismo orden que el resto de los mundos
// con Clases) — partirCaminoPorClases (src/lib/aprender/clases.ts) separa las
// dos pestañas. `esPro` viene del PLAN (profiles.plan), nunca del nivel de
// calibración por modo (skill_levels `anatomia_*`), que este archivo no toca.
export async function obtenerCaminoAnatomia(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoAnatomia[]> {
  const locale = await localeServidor();
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, nombre_en, descripcion_en, contenido_en, orden, requiere_pro")
      .eq("problem_type", "anatomia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const todas = localizarFilas(tecnicas, locale) as FilaTechnique[];
  const rapidas = ordenarPorGrupoYOrden(todas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorGrupoYOrden(todas.filter((t) => t.requiere_pro));

  const previewGlobalId = clases[0]?.id;

  return [...calcularNodos(rapidas, dominadas, false, esPro, undefined), ...calcularNodos(clases, dominadas, true, esPro, previewGlobalId)];
}
