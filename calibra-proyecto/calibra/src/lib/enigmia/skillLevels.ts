import type { SupabaseClient } from "@supabase/supabase-js";
import type { LogicSkillLevel } from "@/types/database";

// Mismo criterio que actualizarSkillLevel (practica/skillLevels.ts) pero
// para el nivel único de Enigmia: sube con 3 aciertos seguidos, baja con
// un error, respeta el escudo si está protegido.
export async function actualizarLogicSkillLevel(
  supabase: SupabaseClient,
  userId: string,
  correct: boolean,
  protegido = false
): Promise<Pick<LogicSkillLevel, "nivel" | "racha_actual">> {
  const { data: actual } = await supabase
    .from("logic_skill_levels")
    .select("nivel, racha_actual")
    .eq("user_id", userId)
    .maybeSingle();

  let nivel = actual?.nivel ?? 1;
  let racha_actual = actual?.racha_actual ?? 0;

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

  await supabase.from("logic_skill_levels").upsert(
    { user_id: userId, nivel, racha_actual, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );

  return { nivel, racha_actual };
}
