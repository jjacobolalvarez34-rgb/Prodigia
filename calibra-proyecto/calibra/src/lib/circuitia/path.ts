import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechniqueQuizPregunta } from "@/types/database";

export type NodoEstado = "completado" | "activo" | "bloqueado";

export interface NodoCaminoCircuitia {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; quiz?: TechniqueQuizPregunta[] };
  estado: NodoEstado;
  // Mismo patrón que src/lib/calculia/path.ts (Fase C): distingue las 5
  // técnicas rápidas originales (independientes, sin requiere_pro) del
  // "Curso estructurado (Pro)" nuevo — ambos conviven en la misma tabla
  // techniques/problem_type='circuitia'.
  requierePro: boolean;
  // true SOLO para nodos del curso Pro bloqueados específicamente
  // porque el usuario no es Pro (no por progresión normal) — el módulo
  // 1 del curso Pro nunca lo tiene en true (preview gratis siempre
  // accesible). Lo usa la página para mostrar el CTA "Desbloqueá con
  // Pro" en vez del bloqueo silencioso normal de progresión secuencial.
  bloqueadoPorPlan: boolean;
}

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

// Camino de Aprender de Circuitia — mismo patrón que
// src/lib/calculia/path.ts: reutiliza techniques/technique_progress
// (problem_type='circuitia'), no una tabla nueva.
//
// Igual que Calculia, la tabla tiene dos "recorridos" independientes
// dentro del mismo problem_type='circuitia' — las 5 técnicas rápidas
// originales de 0167_mundo_circuitia.sql (requiere_pro=false,
// progresión secuencial de siempre) y el "Curso estructurado (Pro)"
// nuevo de 0171_circuitia_curso_pro.sql (requiere_pro=true). Cada uno
// tiene su PROPIA secuencia de desbloqueo independiente (completar la
// última técnica rápida no desbloquea el curso Pro ni viceversa).
// `esPro` determina el gating del curso Pro: el módulo 1 (orden más
// bajo entre las filas requiere_pro=true) es SIEMPRE accesible como
// preview gratuito: para un usuario no-Pro, los módulos 2+ quedan
// bloqueados con bloqueadoPorPlan=true sin importar el progreso real;
// para un usuario Pro, se aplica la misma progresión secuencial de
// siempre.
export async function obtenerCaminoCircuitia(
  supabase: SupabaseClient,
  userId: string,
  esPro: boolean
): Promise<NodoCaminoCircuitia[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, requiere_pro")
      .eq("problem_type", "circuitia")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const todas = tecnicas ?? [];
  const rapidas = todas.filter((t) => !t.requiere_pro);
  const cursoPro = todas.filter((t) => t.requiere_pro);

  const estadosRapidas = calcularEstadosSecuenciales(
    dominadas,
    rapidas.map((t) => t.id)
  );
  const estadosCursoProSecuencial = calcularEstadosSecuenciales(
    dominadas,
    cursoPro.map((t) => t.id)
  );

  const nodosRapidas: NodoCaminoCircuitia[] = rapidas.map((t, i) => ({
    id: t.id,
    slug: t.slug,
    nombre: t.nombre,
    descripcion: t.descripcion,
    contenido: t.contenido as { pasos: string[]; quiz?: TechniqueQuizPregunta[] },
    estado: estadosRapidas[i],
    requierePro: false,
    bloqueadoPorPlan: false,
  }));

  const nodosCursoPro: NodoCaminoCircuitia[] = cursoPro.map((t, i) => {
    const completado = dominadas.has(t.id);
    const esModulo1 = i === 0;
    let estado: NodoEstado;
    let bloqueadoPorPlan = false;
    if (completado) {
      estado = "completado";
    } else if (esModulo1) {
      // Preview gratis: siempre "activo" (nunca bloqueado), sin importar el plan.
      estado = "activo";
    } else if (!esPro) {
      estado = "bloqueado";
      bloqueadoPorPlan = true;
    } else {
      estado = estadosCursoProSecuencial[i];
    }
    return {
      id: t.id,
      slug: t.slug,
      nombre: t.nombre,
      descripcion: t.descripcion,
      contenido: t.contenido as { pasos: string[]; quiz?: TechniqueQuizPregunta[] },
      estado,
      requierePro: true,
      bloqueadoPorPlan,
    };
  });

  return [...nodosRapidas, ...nodosCursoPro];
}
