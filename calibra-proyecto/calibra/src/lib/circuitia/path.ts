import type { SupabaseClient } from "@supabase/supabase-js";
import type { NodoCaminoConClases, NodoEstado } from "@/lib/aprender/clases";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { GRUPOS_CIRCUITIA, grupoDeSlug, posicionDeGrupo, type PestanaCircuitia } from "./grupos";

export type { NodoEstado };

// Camino de Aprender de Circuitia: Técnicas | Clases (docs/PARIDAD_MUNDOS.md
// filas 22/23), sobre techniques/technique_progress (problem_type='circuitia').
// El estado completado/activo/bloqueado se arma ACÁ, en la fuente:
// [slug]/page.tsx vuelve a pedir este camino y redirige si el nodo está
// «bloqueado», así que el estado que ve el sidebar y el que valida la página
// tienen que ser el mismo (bug real de Numeria, commit 648f2b7).
//
// Las dos pestañas usan la MISMA regla, por TEMA (pedido del usuario para todos
// los mundos: poder hacer las Clases por tema, no solo empezando por la
// primera): cada tema (Serie y paralelo / Fundamentos, Circuitos mixtos,
// Razonamiento cualitativo) tiene su puntero «activo» independiente — la primera
// lección no dominada de CADA tema está abierta a la vez — y dentro de un tema el
// orden es lineal. Entre temas no se bloquea nada. CLASES (Pro): la primera del
// mundo es preview gratis; el resto exige plan Pro (bloqueadoPorPlan).

export type NodoCaminoCircuitia = NodoCaminoConClases & { grupo: string };

export interface FilaTechnique {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: unknown;
  orden: number;
  requiere_pro: boolean;
}

// Lo que la página de lección permite abrir: todo menos «bloqueado».
export function puedeAbrirNodoCircuitia(nodo: Pick<NodoCaminoCircuitia, "estado">): boolean {
  return nodo.estado !== "bloqueado";
}

// Orden de curso: (tema en el orden recomendado, orden dentro del tema).
export function ordenarPorGrupoYOrden(filas: FilaTechnique[], pestana: PestanaCircuitia): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = posicionDeGrupo(pestana, grupoDeSlug(pestana, a.slug));
    const pb = posicionDeGrupo(pestana, grupoDeSlug(pestana, b.slug));
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

function nodoDe(t: FilaTechnique, pestana: PestanaCircuitia, estado: NodoEstado, bloqueadoPorPlan: boolean): NodoCaminoCircuitia {
  return {
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoCircuitia["contenido"],
    estado,
    grupo: grupoDeSlug(pestana, t.slug),
    requierePro: pestana === "clases",
    bloqueadoPorPlan,
  };
}

// Técnicas (`filas` YA ordenadas por (tema, orden)): un puntero «activo» por
// tema. Nunca dependen del plan.
export function calcularNodosTecnicas(filas: FilaTechnique[], dominadas: Set<string>): NodoCaminoCircuitia[] {
  const activoPorGrupo = new Set<string>();
  return filas.map((t) => {
    const grupo = grupoDeSlug("tecnicas", t.slug);
    if (dominadas.has(t.id)) return nodoDe(t, "tecnicas", "completado", false);
    if (!activoPorGrupo.has(grupo)) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "tecnicas", "activo", false);
    }
    return nodoDe(t, "tecnicas", "bloqueado", false);
  });
}

// Clases (`filas` YA ordenadas por (tema, orden)):
// - completada: «completado».
// - la primera del mundo (preview gratis): «activo» siempre que no esté
//   completada, sin importar el plan.
// - el resto sin Pro: «bloqueado» con bloqueadoPorPlan (para mostrar el CTA
//   «Desbloquea con Pro» en vez de un bloqueo mudo).
// - el resto con Pro: la primera no completada de CADA tema queda «activo» y las
//   siguientes de ese tema «bloqueado» (orden lineal dentro del tema).
export function calcularNodosClases(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoCircuitia[] {
  const activoPorGrupo = new Set<string>();
  return filas.map((t, i) => {
    if (dominadas.has(t.id)) return nodoDe(t, "clases", "completado", false);
    const grupo = grupoDeSlug("clases", t.slug);
    if (i === 0) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "clases", "activo", false);
    }
    if (!esPro) return nodoDe(t, "clases", "bloqueado", true);
    if (!activoPorGrupo.has(grupo)) {
      activoPorGrupo.add(grupo);
      return nodoDe(t, "clases", "activo", false);
    }
    return nodoDe(t, "clases", "bloqueado", false);
  });
}

// Camino completo: [...Técnicas, ...Clases] (mismo orden que el resto de los
// mundos); partirCaminoPorClases (src/lib/aprender/clases.ts) separa las dos
// pestañas. `esPro` viene del PLAN (profiles.plan), no de ningún nivel de
// calibración.
export function calcularCaminoCircuitia(filas: FilaTechnique[], dominadas: Set<string>, esPro: boolean): NodoCaminoCircuitia[] {
  const rapidas = ordenarPorGrupoYOrden(
    filas.filter((t) => !t.requiere_pro),
    "tecnicas"
  );
  const clases = ordenarPorGrupoYOrden(
    filas.filter((t) => t.requiere_pro),
    "clases"
  );
  return [...calcularNodosTecnicas(rapidas, dominadas), ...calcularNodosClases(clases, dominadas, esPro)];
}

export async function obtenerCaminoCircuitia(supabase: SupabaseClient, userId: string, esPro: boolean): Promise<NodoCaminoCircuitia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "circuitia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id as string));
  return calcularCaminoCircuitia((tecnicas ?? []) as FilaTechnique[], dominadas, esPro);
}

// Arma las «unidades» del sidebar y del camino de una pestaña (una por tema con
// lecciones) leyendo el `grupo` y el `estado` que ya calculó este archivo: la
// página NO recalcula ningún estado, así que lo que muestra el sidebar es
// exactamente lo que después valida [slug]/page.tsx. `nodos` son los de UNA
// pestaña (partirCaminoPorClases).
export function construirUnidadesCircuitia(
  nodos: NodoCaminoCircuitia[],
  pestana: PestanaCircuitia,
  locale: string,
  ctaPro: { label: string; href: string }
): UnidadCaminoGenerico[] {
  const idioma = locale === "en" ? "en" : "es";
  return GRUPOS_CIRCUITIA[pestana]
    .map((g) => ({ g, nodos: nodos.filter((n) => n.grupo === g.id) }))
    .filter((x) => x.nodos.length > 0)
    .map(({ g, nodos: delGrupo }) => ({
      id: `${pestana}-${g.id}`,
      nombre: g.nombre[idioma],
      nodos: delGrupo.map((n) => ({
        id: n.id,
        slug: n.slug,
        nombre: n.nombre,
        estado: n.estado,
        ctaPro: n.bloqueadoPorPlan ? ctaPro : undefined,
      })),
    }));
}
