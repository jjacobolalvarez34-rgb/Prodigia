import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";
import { ORDEN_GRUPOS_MELODIA, type GrupoMelodia } from "@/lib/melodia/grupos";
import { TECNICAS_MELODIA, CLASES_MELODIA } from "@/lib/melodia/lecciones";

export type { NodoEstado, GrupoMelodia };
export { ORDEN_GRUPOS_MELODIA };

// Camino de Aprender de Melodía: Técnicas | Clases (docs/PARIDAD_MUNDOS.md
// filas 22/23). Reutiliza `techniques`/`technique_progress`
// (problem_type='melodia'), sin tablas nuevas.
//
// El estado completado/activo/bloqueado se calcula ACÁ, en la fuente:
// [slug]/page.tsx vuelve a pedir este camino y redirige a /aprender si el
// nodo está "bloqueado", así que el estado que ve el sidebar y el que valida
// la página son el mismo (bug real de Numeria, commit 648f2b7: el estado se
// calculaba solo en una capa de presentación y la primera técnica de un
// tema posterior redirigía sin abrir nada).
//
// Decisión de desbloqueo (documentada en PARIDAD_MUNDOS.md):
//   - TÉCNICAS (gratis): puntero "activo" independiente POR GRUPO (los 6
//     modos de práctica: fundamentos, lectura, alteraciones, escalas,
//     acordes y oído absoluto), lineal dentro de cada grupo.
//   - CLASES (Pro): también un curso independiente POR GRUPO, lineal dentro
//     del grupo. Hay dependencias naturales entre grupos (fundamentos ->
//     lectura -> alteraciones -> escalas -> acordes; el oído es
//     transversal), pero cada Clase re-explica lo que usa de los otros
//     (por ejemplo, la primera de escalas repasa tonos y semitonos), así que
//     no se bloquea a quien ya sabe leer y solo quiere acordes. El orden
//     recomendado es el del sidebar. Para un usuario NO Pro solo la primera
//     Clase de todas (orden global más bajo: el sonido y la nota) queda
//     abierta (preview gratis); las demás "primeras de su grupo" quedan
//     bloqueadas con bloqueadoPorPlan=true.
//
// El mapeo slug -> grupo sale del contenido tipado (una sola fuente de
// verdad, nunca una lista repetida a mano).
function construirMapaGrupos(): Map<string, GrupoMelodia> {
  const mapa = new Map<string, GrupoMelodia>();
  for (const t of TECNICAS_MELODIA) mapa.set(t.slug, t.grupo);
  for (const c of CLASES_MELODIA) mapa.set(c.slug, c.grupo);
  return mapa;
}
const GRUPO_POR_SLUG = construirMapaGrupos();

// Un slug de la base que el contenido tipado no conoce cae en el primer
// grupo (no se pierde ninguna fila del camino).
export function grupoDeSlug(slug: string): GrupoMelodia {
  return GRUPO_POR_SLUG.get(slug) ?? ORDEN_GRUPOS_MELODIA[0];
}

export interface NodoCaminoMelodia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoMelodia;
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
export function puedeAbrirNodoMelodia(nodo: Pick<NodoCaminoMelodia, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

// Orden del camino: (grupo en ORDEN_GRUPOS_MELODIA, `orden` dentro del
// grupo). Exportada para testear el desbloqueo sin mockear Supabase.
export function ordenarPorGrupoYOrden(filas: FilaTechnique[]): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = ORDEN_GRUPOS_MELODIA.indexOf(grupoDeSlug(a.slug));
    const pb = ORDEN_GRUPOS_MELODIA.indexOf(grupoDeSlug(b.slug));
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
): NodoCaminoMelodia[] {
  const activoPorGrupo = new Set<GrupoMelodia>();
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
      contenido: t.contenido as NodoCaminoMelodia["contenido"],
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
// calibración por modo (skill_levels `melodia_*`), que este archivo no toca.
export async function obtenerCaminoMelodia(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoMelodia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "melodia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const todas = (tecnicas ?? []) as FilaTechnique[];
  const rapidas = ordenarPorGrupoYOrden(todas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorGrupoYOrden(todas.filter((t) => t.requiere_pro));

  const previewGlobalId = clases[0]?.id;

  return [...calcularNodos(rapidas, dominadas, false, esPro, undefined), ...calcularNodos(clases, dominadas, true, esPro, previewGlobalId)];
}
