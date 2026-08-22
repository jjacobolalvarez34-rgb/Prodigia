import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModoAnatomia } from "@/lib/practica/anatomia";

export interface DatosPracticaAnatomia {
  nivelInicial: number;
  escudosExtra: number;
  boostActivo: boolean;
}

// Compartido por los 4 page.tsx de /anatomia/practica/* — mismo
// criterio que cargarPractica.ts de Quimia.
export async function cargarDatosPracticaAnatomia(
  supabase: SupabaseClient,
  userId: string,
  modo: ModoAnatomia
): Promise<DatosPracticaAnatomia> {
  const [{ data: nivelRow }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("nivel").eq("user_id", userId).eq("problem_type", `anatomia_${modo}`).maybeSingle(),
    supabase.from("profiles").select("escudos_extra_pendientes, boost_multiplicador_pendiente").eq("id", userId).single(),
  ]);

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return {
    nivelInicial: nivelRow?.nivel ?? 1,
    escudosExtra,
    boostActivo,
  };
}
