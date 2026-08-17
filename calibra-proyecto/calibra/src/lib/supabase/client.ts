import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para usar en Client Components ("use client").
// Lee las credenciales públicas desde las variables de entorno.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
