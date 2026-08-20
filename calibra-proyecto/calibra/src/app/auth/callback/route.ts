import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /auth/callback?code=...
// A donde vuelven los enlaces de Supabase Auth que necesitan intercambiar
// un code por sesión: confirmación de email al registrarse, y el enlace
// de "recuperar contraseña" (con next=/auth/actualizar-password).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // Sección 10.2: link de invitación de amigo — ver RegistroForm.tsx.
  // emailRedirectTo lleva este param a través de todo el viaje de
  // confirmación de email; recién acá, con sesión real ya
  // intercambiada, se puede conectar la amistad server-side.
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (ref) {
        await supabase.rpc("conectar_por_invitacion", { p_inviter_id: ref });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
