import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { NodoEstado } from "@/lib/aprender/clases";
import type { TemaAprendible } from "@/lib/aprender/path";

// Numeria es el único mundo con VARIOS problem_type en un solo camino (los
// 9 temas de src/lib/aprender/path.ts), así que no calza en
// obtenerCaminoConClases (src/lib/aprender/clases.ts, un solo problem_type
// por llamada). Esta función generaliza el mismo criterio de "Técnicas |
// Clases" (fila 22 de docs/PARIDAD_MUNDOS.md) cruzando los 9 temas de una
// sola vez: dos progresiones secuenciales INDEPENDIENTES —
//
//   - Técnicas (requiere_pro = false): el comportamiento de siempre de
//     obtenerCamino(), sin cambios de UX.
//   - Clases (requiere_pro = true): la clase de orden más bajo (dentro de
//     TODOS los temas, no por tema) es preview gratis; el resto exige Pro
//     para quien no lo es. Mismo criterio exacto que obtenerCaminoConClases.
//
// El orden global de cada progresión es (tema en TEMAS_ORDEN, orden dentro
// del tema) — igual que obtenerCamino().

const TEMAS_ORDEN: TemaAprendible[] = [
  "suma",
  "resta",
  "multiplicacion",
  "division",
  "fracciones",
  "decimales",
  "potencias",
  "algebra",
  "geometria",
];

export interface NodoCaminoNumeria {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  problemType: TemaAprendible;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  requierePro: boolean;
  bloqueadoPorPlan: boolean;
}

export interface FilaTechnique {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: unknown;
  orden: number;
  problem_type: string;
  requiere_pro: boolean;
}

export function calcularEstadosSecuenciales(dominadas: Set<string>, ids: string[]): NodoEstado[] {
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

// BUG REAL reportado jugando (2026-09-23): con calcularEstadosSecuenciales
// (un solo puntero global recorriendo los 9 temas en orden), la primera
// técnica de Fracciones/Geometría/etc. quedaba "bloqueado" en el camino
// real mientras el usuario todavía estuviera a mitad de Multiplicación —
// pese a que el sidebar de /aprender (agruparNodos + recalcularActivoPorGrupo
// en src/lib/aprender/grupos.ts) SÍ la mostraba "activo" y clickeable. Esa
// recomputación por grupo solo maquillaba el array que arma el sidebar; el
// nodo real que devuelve obtenerCaminoConClasesNumeria (la fuente que
// vuelve a consultar /aprender/[slug]/page.tsx al entrar por URL) seguía
// "bloqueado", así que el usuario hacía click, entraba a
// /aprender/[slug], veía estado==="bloqueado" ahí y rebotaba de vuelta a
// /aprender sin abrir nada.
//
// Fix: calcular el desbloqueo POR TEMA ya acá, en la fuente de verdad —
// mismo patrón (Set de grupos ya con su "activo" asignado) que ya usa
// obtenerCaminoConClasesEnigmia (src/lib/enigmia/pathClases.ts,
// activoPorCategoria) y los path.ts de Quimia/Anatomía/Melodía/
// Trigonometría/Enigmia. `filas` YA viene ordenada por (tema, orden) —
// ordenarPorTemaYOrden corre antes de llamar a esta función.
export function calcularEstadosPorTema(dominadas: Set<string>, filas: FilaTechnique[]): NodoEstado[] {
  const activoPorTema = new Set<string>();
  return filas.map((f) => {
    if (dominadas.has(f.id)) return "completado";
    if (!activoPorTema.has(f.problem_type)) {
      activoPorTema.add(f.problem_type);
      return "activo";
    }
    return "bloqueado";
  });
}

export function ordenarPorTemaYOrden(filas: FilaTechnique[]): FilaTechnique[] {
  return filas.slice().sort((a, b) => {
    const pa = TEMAS_ORDEN.indexOf(a.problem_type as TemaAprendible);
    const pb = TEMAS_ORDEN.indexOf(b.problem_type as TemaAprendible);
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });
}

export async function obtenerCaminoConClasesNumeria(
  supabase: SupabaseClient,
  userId: string,
  esPro: boolean
): Promise<NodoCaminoNumeria[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, problem_type, requiere_pro")
      .in("problem_type", TEMAS_ORDEN)
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const todas = (tecnicas ?? []) as FilaTechnique[];
  const rapidas = ordenarPorTemaYOrden(todas.filter((t) => !t.requiere_pro));
  const clases = ordenarPorTemaYOrden(todas.filter((t) => t.requiere_pro));

  const estadosRapidas = calcularEstadosPorTema(dominadas, rapidas);
  const estadosClasesSecuencial = calcularEstadosSecuenciales(
    dominadas,
    clases.map((t) => t.id)
  );

  const nodosRapidas: NodoCaminoNumeria[] = rapidas.map((t, i) => ({
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    problemType: t.problem_type as TemaAprendible,
    contenido: t.contenido as NodoCaminoNumeria["contenido"],
    estado: estadosRapidas[i],
    requierePro: false,
    bloqueadoPorPlan: false,
  }));

  const nodosClases: NodoCaminoNumeria[] = clases.map((t, i) => {
    const completado = dominadas.has(t.id);
    const esClase1 = i === 0;
    let estado: NodoEstado;
    let bloqueadoPorPlan = false;
    if (completado) {
      estado = "completado";
    } else if (esClase1) {
      // Preview gratis: siempre "activo", sin importar el plan.
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
      problemType: t.problem_type as TemaAprendible,
      contenido: t.contenido as NodoCaminoNumeria["contenido"],
      estado,
      requierePro: true,
      bloqueadoPorPlan,
    };
  });

  return [...nodosRapidas, ...nodosClases];
}
