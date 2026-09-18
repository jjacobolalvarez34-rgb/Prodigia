import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con la service_role key — bypassea RLS por completo. Server-only,
// nunca importar desde un Client Component. Requiere la variable de
// entorno SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role en el
// dashboard de Supabase). Ya está en .env.local (confirmado 2026-09-15/17,
// probado en vivo con admin.auth.admin.deleteUser real) — lo que hay que
// revisar es que Vercel (Project Settings → Environment Variables) tenga
// la MISMA variable cargada en producción, porque .env.local nunca se
// despliega solo. Sin eso, esta función explota en el server real con el
// mismo error de "falta la variable" aunque acá localmente funcione.
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
