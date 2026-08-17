import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la service_role key — bypassea RLS por completo. Server-only,
// nunca importar desde un Client Component. Requiere la variable de
// entorno SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role en el
// dashboard de Supabase), que NO está en .env.local todavía — hay que
// agregarla a mano para que /api/perfil/eliminar-cuenta funcione.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
