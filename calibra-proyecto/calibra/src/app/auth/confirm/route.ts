import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /auth/confirm?token_hash=...&type=...
//
// Bug real (2026-09-15): el flujo viejo (/auth/callback?code=...) usa
// PKCE — exchangeCodeForSession necesita una cookie "code_verifier" que
// Supabase guardó en el navegador que llamó signUp()/resend(). Si el
// enlace del correo se abre en OTRO navegador (el celular en vez de la
// compu donde te registraste, o la app de Gmail que abre los links en
// su propio WebView), esa cookie no existe ahí y la confirmación falla
// SIEMPRE con "no pudimos confirmar el enlace" — sin importar que el
// Site URL/Redirect URLs del dashboard estén bien configurados. Esto no
// es intermitente ni un bug de config: es una limitación estructural
// del flujo PKCE para links que viajan por email.
//
// La alternativa que Supabase recomienda para links de email es
// verifyOtp con token_hash: no depende de ninguna cookie del navegador
// que lo generó, así que confirma sin importar dónde se abra el link.
// Para que esto entre en juego hace falta que las plantillas de email
// del dashboard (Authentication → Email Templates) usen
// "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=...&next=..."
// en vez de "{{ .ConfirmationURL }}" — ver docs/PROGRESO.md.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const ref = searchParams.get("ref");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (ref) {
        await supabase.rpc("conectar_por_invitacion", { p_token: ref });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
