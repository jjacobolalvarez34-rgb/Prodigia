import type { SupabaseClient } from "@supabase/supabase-js";

// Si ayer no se cumplió la meta (o directamente no hay fila) y el usuario
// tiene congelamientos comprados en la tienda, consume uno automáticamente
// para que la racha no se corte. Solo cubre el día inmediato anterior —
// si hay un hueco de varios días, no los cubre todos de una.
// Fase de auditoría pre-lanzamiento: esto vivía acá como dos updates
// directos a "profiles" (uno de ellos a una columna que ya no es
// escribible directo desde el cliente) — ahora es una sola función
// security definer atómica, mismo patrón que el resto del proyecto.
export async function aplicarCongelamientoSiHaceFalta(supabase: SupabaseClient): Promise<void> {
  await supabase.rpc("aplicar_congelamiento_si_hace_falta");
}
