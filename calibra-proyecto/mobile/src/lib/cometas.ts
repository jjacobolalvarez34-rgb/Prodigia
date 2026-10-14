import { supabase } from "./supabase";

// Cometas, la moneda premium: las constantes son las de la web (src/lib/cometas.ts).
export { CANJES_COMETAS, CHISPAS_POR_COMETA } from "@/lib/cometas";

export async function canjearCometas(cometas: number): Promise<{ cometas: number; chispas: number }> {
  const { data, error } = await supabase.rpc("canjear_cometas", { p_cometas: cometas });
  if (error) throw error;
  const fila = (data as { cometas: number; puntos_total: number }[] | null)?.[0];
  return { cometas: fila?.cometas ?? 0, chispas: fila?.puntos_total ?? 0 };
}
