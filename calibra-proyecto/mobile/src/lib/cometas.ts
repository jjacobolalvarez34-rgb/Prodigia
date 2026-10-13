import { supabase } from "./supabase";

// Cometas, la moneda premium (0279; PLAN_ECONOMIA.md §3). Se cambian por Chispas a
// 1 Cometa = 10 Chispas, en un solo sentido; lo hace la base (canjear_cometas).
export const CHISPAS_POR_COMETA = 10;

// Paquetes de canje que se ofrecen en la tienda.
export const CANJES_COMETAS = [10, 50, 100, 500];

export async function canjearCometas(cometas: number): Promise<{ cometas: number; chispas: number }> {
  const { data, error } = await supabase.rpc("canjear_cometas", { p_cometas: cometas });
  if (error) throw error;
  const fila = (data as { cometas: number; puntos_total: number }[] | null)?.[0];
  return { cometas: fila?.cometas ?? 0, chispas: fila?.puntos_total ?? 0 };
}
