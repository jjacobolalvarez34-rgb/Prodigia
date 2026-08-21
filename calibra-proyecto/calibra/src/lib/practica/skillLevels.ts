import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArithmeticProblemType, SkillLevel } from "@/types/database";

// Lógica pura de calibración (docs/MECANICA.md), separada del acceso a
// datos a propósito para poder testearla sin mockear Supabase (Fase RR):
// sube con 3 aciertos seguidos, baja con un error, nunca sale del rango
// 1-10. `protegido` es el escudo de calibración de un sprint: si está
// activo, un error resetea la racha igual, pero no baja el nivel.
export function calcularNuevoNivel(
  nivelActual: number,
  rachaActual: number,
  correct: boolean,
  protegido = false
): { nivel: number; racha_actual: number } {
  let nivel = nivelActual;
  let racha_actual = rachaActual;

  if (correct) {
    racha_actual += 1;
    if (racha_actual >= 3) {
      nivel = Math.min(10, nivel + 1);
      racha_actual = 0;
    }
  } else {
    racha_actual = 0;
    if (!protegido) {
      nivel = Math.max(1, nivel - 1);
    }
  }

  return { nivel, racha_actual };
}

export async function actualizarSkillLevel(
  supabase: SupabaseClient,
  userId: string,
  problemType:
    | ArithmeticProblemType
    | "fracciones"
    | "geografia"
    | "decimales"
    | "potencias"
    | "algebra"
    | "quimia_simbolos"
    | "quimia_formulas"
    | "quimia_tabla"
    | "quimia_nomenclatura"
    | "quimia_organica",
  correct: boolean,
  protegido = false
): Promise<Pick<SkillLevel, "nivel" | "racha_actual">> {
  const { data: actual } = await supabase
    .from("skill_levels")
    .select("nivel, racha_actual")
    .eq("user_id", userId)
    .eq("problem_type", problemType)
    .maybeSingle();

  const { nivel, racha_actual } = calcularNuevoNivel(actual?.nivel ?? 1, actual?.racha_actual ?? 0, correct, protegido);

  await supabase.from("skill_levels").upsert(
    {
      user_id: userId,
      problem_type: problemType,
      nivel,
      racha_actual,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,problem_type" }
  );

  return { nivel, racha_actual };
}
