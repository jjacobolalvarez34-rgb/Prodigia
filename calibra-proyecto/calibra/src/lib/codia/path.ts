import type { SupabaseClient } from "@supabase/supabase-js";
import { GRUPOS_APRENDER, type PestanaGrupos } from "@/lib/aprender/grupos";
import type { NodoCaminoConClases, NodoEstado } from "@/lib/aprender/clases";

export type { NodoEstado };

// Camino de Aprender de Codia (Técnicas | Clases, fila 22 de
// docs/PARIDAD_MUNDOS.md). Reutiliza `techniques`/`technique_progress`
// (problem_type='codia'), sin tablas nuevas, y arma el estado
// completado/activo/bloqueado ACÁ, en la fuente: [slug]/page.tsx vuelve a
// pedir este camino y redirige si el nodo está "bloqueado", así que el
// estado que ve el sidebar y el que valida la página tienen que ser el
// mismo (bug real de Numeria, commit 648f2b7).
//
// Las dos pestañas usan la MISMA regla de desbloqueo, por tema (pedido del
// usuario: poder hacer las Técnicas y las Clases por tema, no solo desde la
// primera; mismo criterio que Quimia y Trigonometría, commit f238e2a):
//   - Cada tema (los grupos de GRUPOS_APRENDER.codia en src/lib/aprender/
//     grupos.ts, la única definición de los temas) tiene su propio puntero
//     "activo" independiente: la primera Técnica y la primera Clase no
//     dominadas de CADA tema están abiertas a la vez; dentro de un tema el
//     orden es lineal.
//   - Entre temas NO se bloquea nada: el orden (lo básico -> estructuras ->
//     complejidad y depuración) es solo el recomendado y el del menú lateral.
//   - Clases (Pro): la primera del curso (Clase 1) es preview gratis; el
//     resto exige plan Pro (bloqueadoPorPlan).
export type NodoCaminoCodia = NodoCaminoConClases;

export interface FilaTechnique {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: unknown;
  orden: number;
  requiere_pro: boolean;
}

const OTRAS = "otras";

// slug -> (posición del tema, id del tema) por pestaña, sacado de la ÚNICA
// definición de temas. Un slug de la base que no figure cae en "otras" (al
// final), igual que agruparNodos: no se pierde ninguna fila del camino.
function mapaTemas(pestana: PestanaGrupos): Map<string, { posicion: number; id: string }> {
  const mapa = new Map<string, { posicion: number; id: string }>();
  (GRUPOS_APRENDER.codia?.[pestana] ?? []).forEach((g, posicion) => g.slugs.forEach((slug) => mapa.set(slug, { posicion, id: g.id })));
  return mapa;
}
const TEMAS: Record<PestanaGrupos, Map<string, { posicion: number; id: string }>> = {
  tecnicas: mapaTemas("tecnicas"),
  clases: mapaTemas("clases"),
};

export function temaDeSlug(pestana: PestanaGrupos, slug: string): string {
  return TEMAS[pestana].get(slug)?.id ?? OTRAS;
}

// Lo que la página de lección permite abrir: todo menos "bloqueado". Lo
// comparten [slug]/page.tsx y los tests de coherencia con el sidebar.
export function puedeAbrirNodoCodia(nodo: Pick<NodoCaminoCodia, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

// Orden recomendado: (tema en el orden de grupos.ts, orden dentro del tema).
export function ordenarPorTemaYOrden(pestana: PestanaGrupos, filas: FilaTechnique[]): FilaTechnique[] {
  const posicion = (slug: string) => TEMAS[pestana].get(slug)?.posicion ?? Number.MAX_SAFE_INTEGER;
  return filas.slice().sort((a, b) => posicion(a.slug) - posicion(b.slug) || a.orden - b.orden);
}

function nodoDe(t: FilaTechnique, estado: NodoEstado, requierePro: boolean, bloqueadoPorPlan: boolean): NodoCaminoCodia {
  return {
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoCodia["contenido"],
    estado,
    requierePro,
    bloqueadoPorPlan,
  };
}

// Técnicas (`filas` YA ordenadas por (tema, orden)): un puntero "activo" por
// tema. Nunca dependen del plan.
export function calcularNodosTecnicas(filas: FilaTechnique[], dominadas: Set<string>): NodoCaminoCodia[] {
  const activoPorTema = new Set<string>();
  return filas.map((t) => {
    if (dominadas.has(t.id)) return nodoDe(t, "completado", false, false);
    const tema = temaDeSlug("tecnicas", t.slug);
    if (!activoPorTema.has(tema)) {
      activoPorTema.add(tema);
      return nodoDe(t, "activo", false, false);
    }
    return nodoDe(t, "bloqueado", false, false);
  });
}

// Clases (`filas` YA ordenadas por (tema, orden)): un puntero "activo" por
// tema, igual que las Técnicas.
// - completada: "completado".
// - la primera del curso (preview gratis): "activo" siempre que no esté
//   completada, sin importar el plan.
// - el resto sin Pro: "bloqueado" con bloqueadoPorPlan (para mostrar el CTA
//   "Desbloquea con Pro" en vez de un bloqueo mudo).
// - el resto con Pro: la primera no completada de CADA tema queda "activo" y
//   las siguientes de ese tema "bloqueado" (orden lineal dentro del tema).
export function calcularNodosClases(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoCodia[] {
  const activoPorTema = new Set<string>();
  return filas.map((t, i) => {
    if (dominadas.has(t.id)) return nodoDe(t, "completado", true, false);
    const tema = temaDeSlug("clases", t.slug);
    if (i === 0) {
      activoPorTema.add(tema);
      return nodoDe(t, "activo", true, false);
    }
    if (!esPro) return nodoDe(t, "bloqueado", true, true);
    if (!activoPorTema.has(tema)) {
      activoPorTema.add(tema);
      return nodoDe(t, "activo", true, false);
    }
    return nodoDe(t, "bloqueado", true, false);
  });
}

// Camino completo: [...Técnicas, ...Clases] (mismo orden que el resto de los
// mundos); partirCaminoPorClases (src/lib/aprender/clases.ts) separa las dos
// pestañas. `esPro` viene del PLAN (profiles.plan), no de ningún nivel de
// calibración.
export function calcularCaminoCodia(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoCodia[] {
  const rapidas = ordenarPorTemaYOrden(
    "tecnicas",
    filas.filter((t) => !t.requiere_pro)
  );
  const clases = ordenarPorTemaYOrden(
    "clases",
    filas.filter((t) => t.requiere_pro)
  );
  return [...calcularNodosTecnicas(rapidas, dominadas), ...calcularNodosClases(clases, dominadas, esPro)];
}

export async function obtenerCaminoCodia(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoCodia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "codia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id as string));
  return calcularCaminoCodia((tecnicas ?? []) as FilaTechnique[], dominadas, esPro);
}
