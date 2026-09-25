import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";

// Infraestructura compartida de la pestaña "Clases" de Aprender (fila 22
// de docs/PARIDAD_MUNDOS.md). Cada mundo tiene, dentro de la misma tabla
// `techniques` (mismo problem_type), dos recorridos independientes:
//
//   - "Técnicas" (requiere_pro = false): gratis, progresión secuencial.
//   - "Clases"   (requiere_pro = true): lecciones progresivas y
//     dependientes con ejemplos resueltos y quiz. La PRIMERA clase (orden
//     más bajo) es preview gratis; el resto exige plan Pro.
//
// Este módulo generaliza lo que antes estaba duplicado en
// src/lib/calculia/path.ts y src/lib/circuitia/path.ts, para que
// cualquier mundo lo enchufe con una sola llamada:
//
//   obtenerCaminoConClases(supabase, userId, "<problem_type>", esPro)
//   → partirCaminoPorClases(nodos) → { tecnicas, clases, hayClases }
//   → <AprenderTabs tecnicas={…} clases={hayClases ? … : null} />
//
// (ver src/components/AprenderTabs.tsx).

export type NodoEstado = "completado" | "activo" | "bloqueado";

export interface NodoCaminoConClases {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  // true para las filas de la pestaña "Clases" (techniques.requiere_pro).
  requierePro: boolean;
  // true SOLO para clases bloqueadas porque el usuario no es Pro (no por
  // progresión normal). La clase 1 nunca lo tiene en true (preview
  // gratis). Lo usa la página para mostrar el CTA "Desbloquea con Pro" en
  // vez del bloqueo mudo de progresión secuencial.
  bloqueadoPorPlan: boolean;
}

export type PestanaAprender = "tecnicas" | "clases";

function calcularEstadosSecuenciales(dominadas: Set<string>, ids: string[]): NodoEstado[] {
  let activoAsignado = false;
  return ids.map((id) => {
    if (dominadas.has(id)) return "completado";
    if (!activoAsignado) {
      activoAsignado = true;
      return "activo";
    }
    return "bloqueado";
  });
}

// Camino de Aprender de un mundo con las dos pestañas. Cada recorrido
// tiene su PROPIA secuencia de desbloqueo independiente (completar la
// última técnica no desbloquea las clases ni viceversa). `esPro`
// determina el gating de las clases: la clase 1 es SIEMPRE accesible
// (preview gratis); para un usuario no-Pro las clases 2+ quedan
// "bloqueado" con bloqueadoPorPlan=true sin importar el progreso real;
// para un usuario Pro se aplica la progresión secuencial normal.
// Devuelve [...técnicas, ...clases] (mismo orden que devolvían los
// obtenerCamino* originales).
export async function obtenerCaminoConClases(
  supabase: SupabaseClient,
  userId: string,
  problemType: string,
  esPro: boolean
): Promise<NodoCaminoConClases[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", problemType)
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const todas = tecnicas ?? [];
  const rapidas = todas.filter((t) => !t.requiere_pro);
  const clases = todas.filter((t) => t.requiere_pro);

  const estadosRapidas = calcularEstadosSecuenciales(
    dominadas,
    rapidas.map((t) => t.id)
  );
  const estadosClasesSecuencial = calcularEstadosSecuenciales(
    dominadas,
    clases.map((t) => t.id)
  );

  const nodosRapidas: NodoCaminoConClases[] = rapidas.map((t, i) => ({
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as NodoCaminoConClases["contenido"],
    estado: estadosRapidas[i],
    requierePro: false,
    bloqueadoPorPlan: false,
  }));

  const nodosClases: NodoCaminoConClases[] = clases.map((t, i) => {
    const completado = dominadas.has(t.id);
    const esClase1 = i === 0;
    let estado: NodoEstado;
    let bloqueadoPorPlan = false;
    if (completado) {
      estado = "completado";
    } else if (esClase1) {
      // Preview gratis: siempre "activo" (nunca bloqueado), sin importar el plan.
      estado = "activo";
    } else if (!esPro) {
      estado = "bloqueado";
      bloqueadoPorPlan = true;
    } else {
      estado = estadosClasesSecuencial[i];
    }
    return {
      id: t.id,
      slug: t.slug,
      nombre: t.nombre,
      descripcion: t.descripcion,
      contenido: t.contenido as NodoCaminoConClases["contenido"],
      estado,
      requierePro: true,
      bloqueadoPorPlan,
    };
  });

  return [...nodosRapidas, ...nodosClases];
}

// Parte un camino ya resuelto en las dos pestañas. `hayClases` es false
// para un mundo sin filas requiere_pro=true (ej. los mundos que todavía
// no tienen Clases): AprenderTabs no muestra la pestaña en ese caso.
export function partirCaminoPorClases<T extends { requierePro: boolean }>(
  nodos: readonly T[]
): { tecnicas: T[]; clases: T[]; hayClases: boolean } {
  const tecnicas = nodos.filter((n) => !n.requierePro);
  const clases = nodos.filter((n) => n.requierePro);
  return { tecnicas, clases, hayClases: clases.length > 0 };
}

// Pestaña inicial desde el query param `?tab=`. Solo acepta "clases" si
// el mundo realmente tiene clases; cualquier otro valor → "tecnicas".
export function resolverPestanaInicial(tab: string | string[] | undefined, hayClases: boolean): PestanaAprender {
  const valor = Array.isArray(tab) ? tab[0] : tab;
  return hayClases && valor === "clases" ? "clases" : "tecnicas";
}

// Ruta de "volver a Aprender" que regresa a la pestaña de la que vino la
// lección (las Clases vuelven con ?tab=clases; las Técnicas, sin query).
export function hrefVolverAAprender(basePath: string, requierePro: boolean): string {
  return requierePro ? `${basePath}?tab=clases` : basePath;
}
