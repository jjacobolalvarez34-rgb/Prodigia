import type { SupabaseClient } from "@supabase/supabase-js";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";

export type NodoEstado = "completado" | "activo" | "bloqueado";

// Fracciones (Fase OO) y Decimales/Potencias (Fase ZZ) reutilizan el
// mismo camino de Aprender que las 4 operaciones — ninguno es parte de
// ArithmeticProblemType (ese tipo sigue siendo específicamente "las 4
// operaciones de /practica"), así que se amplía localmente acá nada más.
export type TemaAprendible = ArithmeticProblemType | "fracciones" | "decimales" | "potencias" | "algebra" | "geometria";

export interface NodoCamino {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  problemType: TemaAprendible;
  contenido: { pasos: string[] };
  estado: NodoEstado;
}

export interface UnidadCamino {
  problemType: TemaAprendible;
  nombre: string;
  nodos: NodoCamino[]; // vacío = todavía no hay técnicas para este tema
}

const TEMAS_ORDEN: TemaAprendible[] = [...ARITHMETIC_PROBLEM_TYPES, "fracciones", "decimales", "potencias", "algebra", "geometria"];

const NOMBRE_TEMA: Record<TemaAprendible, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
  fracciones: "Fracciones",
  decimales: "Decimales y porcentajes",
  potencias: "Potencias y raíces",
  algebra: "Álgebra básica",
  geometria: "Geometría básica",
};

// El orden global del camino es: primero por tema (suma, resta,
// multiplicación, división, fracciones), y dentro de cada uno por su
// columna `orden`. Solo hay UN nodo "activo" (el próximo a hacer) en
// todo el camino — no es independiente por unidad, es una sola fila
// serpenteante.
export async function obtenerCamino(
  supabase: SupabaseClient,
  userId: string
): Promise<UnidadCamino[]> {
  const [{ data: tecnicas }, { data: progreso }] = await Promise.all([
    supabase
      .from("techniques")
      .select("id, slug, nombre, descripcion, contenido, orden, problem_type")
      .order("orden", { ascending: true }),
    supabase.from("technique_progress").select("technique_id, dominado").eq("user_id", userId),
  ]);

  const dominadas = new Set((progreso ?? []).filter((p) => p.dominado).map((p) => p.technique_id));

  const ordenadas = (tecnicas ?? []).slice().sort((a, b) => {
    const pa = TEMAS_ORDEN.indexOf(a.problem_type as TemaAprendible);
    const pb = TEMAS_ORDEN.indexOf(b.problem_type as TemaAprendible);
    if (pa !== pb) return pa - pb;
    return a.orden - b.orden;
  });

  let activoAsignado = false;
  const nodos: NodoCamino[] = ordenadas.map((t) => {
    const completado = dominadas.has(t.id);
    let estado: NodoEstado;
    if (completado) {
      estado = "completado";
    } else if (!activoAsignado) {
      estado = "activo";
      activoAsignado = true;
    } else {
      estado = "bloqueado";
    }
    return {
      id: t.id,
      slug: t.slug,
      nombre: t.nombre,
      descripcion: t.descripcion,
      problemType: t.problem_type as TemaAprendible,
      contenido: t.contenido as { pasos: string[] },
      estado,
    };
  });

  // Fase 8 (auditoría de estabilización, 2026-08-30): tramo "avanzado"
  // — técnicas nuevas para números grandes (0101_lecciones_avanzadas_
  // numeria.sql), sembradas con orden >= 100 a propósito. Esa marca es
  // lo único que las distingue: cuando una operación tiene alguna,
  // se parte en 2 unidades visuales separadas (básico primero, avanzado
  // después) en vez de mezclarlas en una sola lista continua — el orden
  // global ya las deja después de las básicas de todos modos (el
  // "activo" único del camino nunca salta a un avanzado antes de
  // terminar los básicos de esa operación, ni de otras anteriores).
  const UMBRAL_AVANZADO = 100;
  const unidades: UnidadCamino[] = [];
  for (const tema of TEMAS_ORDEN) {
    const nodosDelTema = nodos.filter((n) => n.problemType === tema);
    const basicos = nodosDelTema.filter((n) => temaOrdenOriginal(ordenadas, n.id) < UMBRAL_AVANZADO);
    const avanzados = nodosDelTema.filter((n) => temaOrdenOriginal(ordenadas, n.id) >= UMBRAL_AVANZADO);
    unidades.push({ problemType: tema, nombre: NOMBRE_TEMA[tema], nodos: basicos });
    if (avanzados.length > 0) {
      unidades.push({ problemType: tema, nombre: `${NOMBRE_TEMA[tema]} · Avanzado`, nodos: avanzados });
    }
  }
  return unidades;
}

function temaOrdenOriginal(ordenadas: { id: string; orden: number }[], id: string): number {
  return ordenadas.find((t) => t.id === id)?.orden ?? 0;
}
