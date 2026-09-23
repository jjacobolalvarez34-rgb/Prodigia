import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";
import type { Continente } from "@/lib/practica/geografia";
import { TECNICAS_GEOGRAFIA, TECNICAS_GENERALES_GEOGRAFIA, CLASES_GEOGRAFIA } from "@/lib/geografia/lecciones";

export type { NodoEstado };

// Retrofit completo de Geografía a Técnicas | Clases POR CONTINENTE (ver
// docs/PARIDAD_MUNDOS.md fila 1 — "Aprender tiene solo 3 lecciones
// totales — 3 lecciones genéricas para 4 regiones, ninguna por
// continente" — y fila 22/23). Antes este archivo tenía un único puntero
// "activo" para TODO el camino (una sola unidad, sin grupos). Ahora sigue
// el mismo patrón que src/lib/quimia/path.ts (grupo calculado en el
// cargador del camino, no en una capa de presentación aparte) extendido
// con Pro-gating de Clases al estilo src/lib/enigmia/pathClases.ts — pero
// en un solo archivo en vez de dos (path.ts + pathClases.ts): acá no hace
// falta la variante "solo Técnicas, sin Pro" porque nada más la usa (a
// diferencia de Enigmia, donde obtenerCaminoEnigmia quedó de una fase
// anterior).
//
// `Continente` se reusa tal cual de src/lib/practica/geografia.ts (no se
// inventa un GrupoGeografia nuevo) — las 3 Técnicas históricas
// (0027_geografia_lecciones.sql: dividir-en-subregiones, anclar-por-vecinos,
// forma-caracteristica) son estrategias genéricas que no mapean a un
// continente específico (ver docs/PARIDAD_MUNDOS.md línea 82) y quedan en
// un quinto grupo aparte, "general", sin continente.
export type GrupoGeografia = Continente | "general";
export const ORDEN_GRUPOS_GEOGRAFIA: GrupoGeografia[] = ["general", "america", "europa", "africa", "asia_oceania"];

// Las 3 Técnicas genéricas históricas van al grupo "general" — el resto
// del mapeo slug→grupo sale directo del contenido tipado
// (src/lib/geografia/lecciones/), nunca repetido a mano acá: una sola
// fuente de verdad para qué continente le toca a cada slug.
const SLUGS_GENERAL = new Set(TECNICAS_GENERALES_GEOGRAFIA.map((t) => t.slug));

function construirMapaGrupos(): Map<string, GrupoGeografia> {
  const mapa = new Map<string, GrupoGeografia>();
  for (const slug of SLUGS_GENERAL) mapa.set(slug, "general");
  for (const t of TECNICAS_GEOGRAFIA) mapa.set(t.slug, t.continente);
  for (const c of CLASES_GEOGRAFIA) mapa.set(c.slug, c.continente);
  return mapa;
}
const GRUPO_POR_SLUG = construirMapaGrupos();

export interface NodoCaminoGeografia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  grupo: GrupoGeografia;
  // true para las filas de la pestaña "Clases" (techniques.requiere_pro).
  requierePro: boolean;
  // true SOLO para clases bloqueadas porque el usuario no es Pro (no por
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

// Exportadas para poder testear el desbloqueo por continente sin mockear
// Supabase — mismo criterio que src/lib/aprender/grupos.test.ts testea
// recalcularActivoPorGrupo de forma directa. Ver src/lib/geografia/path.test.ts.
export function ordenarPorGrupoYOrden(filas: FilaTechnique[]): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const ga = GRUPO_POR_SLUG.get(a.slug) ?? "general";
    const gb = GRUPO_POR_SLUG.get(b.slug) ?? "general";
    const pa = ORDEN_GRUPOS_GEOGRAFIA.indexOf(ga);
    const pb = ORDEN_GRUPOS_GEOGRAFIA.indexOf(gb);
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

// Calcula el estado de un pool (Técnicas o Clases) YA ordenado por
// (grupo, orden), con desbloqueo POR GRUPO independiente: la primera fila
// no dominada de CADA continente (o "general") queda "activo" a la vez,
// en vez de un único puntero recorriendo todos los grupos en secuencia —
// mismo criterio que src/lib/quimia/path.ts y src/lib/enigmia/path.ts.
// Para el pool de Clases, `previewGlobalId` es el único nodo que puede
// quedar "activo" para un usuario no-Pro (el resto de las "primeras de su
// grupo" quedan bloqueadas con bloqueadoPorPlan=true) — mismo criterio
// que src/lib/enigmia/pathClases.ts.
export function calcularNodos(
  filas: FilaTechnique[],
  dominadas: Set<string>,
  requierePro: boolean,
  esPro: boolean,
  previewGlobalId: string | undefined
): NodoCaminoGeografia[] {
  const activoPorGrupo = new Set<GrupoGeografia>();
  return filas.map((t) => {
    const completado = dominadas.has(t.id);
    const grupo = GRUPO_POR_SLUG.get(t.slug) ?? "general";
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
      contenido: t.contenido as NodoCaminoGeografia["contenido"],
      estado,
      grupo,
      requierePro,
      bloqueadoPorPlan,
    };
  });
}

// Camino de Aprender de Geografía: reutiliza la misma tabla `techniques`
// que Numeria/Quimia (filtrando por problem_type='geografia') y el mismo
// `technique_progress`. Devuelve [...técnicas, ...clases] (mismo orden
// que el resto de los mundos con obtenerCaminoConClases*) — partirCaminoPorClases
// (src/lib/aprender/clases.ts) separa las dos pestañas.
//
// `esPro` viene del PLAN del usuario (profiles.plan), nunca de
// skill_levels/nivel de calibración por continente — Técnicas se
// desbloquea por PROGRESO DE LECCIONES (technique_progress.dominado), el
// mismo mecanismo que ya usa Quimia; el nivel de calibración de
// /geografia/practica es un sistema totalmente aparte que este archivo no
// toca (ver el bloque "No toques" del pedido original).
export async function obtenerCaminoGeografia(
  supabase: SupabaseClient,
  userId: string,
  esPro: boolean
): Promise<NodoCaminoGeografia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "geografia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const todas = (tecnicas ?? []) as FilaTechnique[];
  const rapidas = ordenarPorGrupoYOrden(todas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorGrupoYOrden(todas.filter((t) => t.requiere_pro));

  const previewGlobalId = clases[0]?.id;

  const nodosRapidas = calcularNodos(rapidas, dominadas, false, esPro, undefined);
  const nodosClases = calcularNodos(clases, dominadas, true, esPro, previewGlobalId);

  return [...nodosRapidas, ...nodosClases];
}
