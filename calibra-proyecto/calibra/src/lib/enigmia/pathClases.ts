import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta, CategoriaEnigmia } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";

// Enigmia tiene 4 categorías en un solo camino (como los 9 temas de
// Numeria) — no calza en obtenerCaminoConClases (src/lib/aprender/clases.ts,
// un solo problem_type por llamada, sobre `techniques`): acá la tabla es
// `logic_techniques`, con `categoria` en vez de `problem_type`. Esta
// función generaliza el mismo criterio de "Técnicas | Clases" (fila 22 de
// docs/PARIDAD_MUNDOS.md) cruzando las 4 categorías de una sola vez, con
// una diferencia deliberada respecto de obtenerCaminoConClasesNumeria
// (pedido explícito del usuario 2026-09-22): acá el desbloqueo es POR
// CATEGORÍA independiente en las DOS pestañas (Técnicas y Clases), no solo
// en Técnicas — mismo criterio que YA tiene obtenerCaminoEnigmia (path.ts)
// para las técnicas, extendido a Clases: la primera Clase no completada de
// CADA categoría queda "activo" a la vez, en vez de un único puntero
// global recorriendo las 4 categorías en secuencia.
//
// Gating de Pro: entre las 4 (hasta 4) Clases que quedarían "activo" por
// categoría, SOLO la de orden más bajo del recorrido global (categoría en
// ORDEN_CATEGORIAS, después orden dentro de la categoría) es preview
// gratis de verdad. El resto de las "activo por categoría" quedan
// "bloqueado" con bloqueadoPorPlan=true para un usuario no-Pro (mismo
// criterio de "una sola clase gratis en todo el mundo" que
// obtenerCaminoConClases/obtenerCaminoConClasesNumeria) — un usuario Pro
// sí las ve "activo" de verdad, cada categoría avanzando en paralelo.

const ORDEN_CATEGORIAS: CategoriaEnigmia[] = ["patrones", "deduccion", "memoria", "computacional"];

export interface NodoCaminoEnigmiaClases {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  categoria: CategoriaEnigmia;
  estado: NodoEstado;
  requierePro: boolean;
  bloqueadoPorPlan: boolean;
}

interface FilaLogicTechnique {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: unknown;
  orden: number;
  categoria: CategoriaEnigmia;
  requiere_pro: boolean;
}

function ordenarPorCategoriaYOrden(filas: FilaLogicTechnique[]): FilaLogicTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = ORDEN_CATEGORIAS.indexOf(a.categoria);
    const pb = ORDEN_CATEGORIAS.indexOf(b.categoria);
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

// Calcula el estado de un pool (rápidas o clases) YA ordenado por
// (categoría, orden), con desbloqueo independiente por categoría. Para el
// pool de clases, `previewGlobalId` es el único nodo que puede quedar
// "activo" para un usuario no-Pro (el resto de las "primeras de su
// categoría" quedan bloqueadas con bloqueadoPorPlan=true).
function calcularNodos(
  filas: FilaLogicTechnique[],
  dominadas: Set<string>,
  requierePro: boolean,
  esPro: boolean,
  previewGlobalId: string | undefined
): NodoCaminoEnigmiaClases[] {
  const activoPorCategoria = new Set<CategoriaEnigmia>();
  return filas.map((t) => {
    const completado = dominadas.has(t.id);
    const categoria = t.categoria;
    let estado: NodoEstado;
    let bloqueadoPorPlan = false;

    if (completado) {
      estado = "completado";
    } else if (!activoPorCategoria.has(categoria)) {
      activoPorCategoria.add(categoria);
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
      contenido: t.contenido as NodoCaminoEnigmiaClases["contenido"],
      categoria,
      estado,
      requierePro,
      bloqueadoPorPlan,
    };
  });
}

export async function obtenerCaminoConClasesEnigmia(
  supabase: SupabaseClient,
  userId: string,
  esPro: boolean
): Promise<NodoCaminoEnigmiaClases[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("logic_techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, categoria, requiere_pro")
      .order("orden", { ascending: true }),
    supabase.from("logic_technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const todas = (tecnicas ?? []) as FilaLogicTechnique[];
  const rapidas = ordenarPorCategoriaYOrden(todas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorCategoriaYOrden(todas.filter((t) => t.requiere_pro));

  const previewGlobalId = clases[0]?.id;

  const nodosRapidas = calcularNodos(rapidas, dominadas, false, esPro, undefined);
  const nodosClases = calcularNodos(clases, dominadas, true, esPro, previewGlobalId);

  return [...nodosRapidas, ...nodosClases];
}
