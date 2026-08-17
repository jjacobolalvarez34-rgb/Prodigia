import type { SupabaseClient } from "@supabase/supabase-js";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";

export type NodoEstado = "completado" | "activo" | "bloqueado";

// Fracciones (Fase OO) y Decimales/Potencias (Fase ZZ) reutilizan el
// mismo camino de Aprender que las 4 operaciones — ninguno es parte de
// ArithmeticProblemType (ese tipo sigue siendo específicamente "las 4
// operaciones de /practica"), así que se amplía localmente acá nada más.
export type TemaAprendible = ArithmeticProblemType | "fracciones" | "decimales" | "potencias" | "algebra";

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

const TEMAS_ORDEN: TemaAprendible[] = [...ARITHMETIC_PROBLEM_TYPES, "fracciones", "decimales", "potencias", "algebra"];

const NOMBRE_TEMA: Record<TemaAprendible, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
  fracciones: "Fracciones",
  decimales: "Decimales y porcentajes",
  potencias: "Potencias y raíces",
  algebra: "Álgebra básica",
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

  return TEMAS_ORDEN.map((tema) => ({
    problemType: tema,
    nombre: NOMBRE_TEMA[tema],
    nodos: nodos.filter((n) => n.problemType === tema),
  }));
}
