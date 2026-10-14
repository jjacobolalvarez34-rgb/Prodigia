import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /auth/confirmar?token_hash=...&type=recovery&next=/auth/actualizar-password
// Enlaces de correo de Supabase con token_hash (pedido 2026-10-13: «olvidé mi
// contraseña» no funcionaba). El enlace viejo (/auth/callback?code=) usa PKCE y solo
// sirve en el MISMO navegador donde se pidió: pedirlo desde la app o la compu y
// abrir el correo en el celular fallaba. Con token_hash funciona en cualquier
// dispositivo. Requiere cambiar las plantillas de correo en Supabase (ver
// docs/PENDIENTES_2026-10-13.md, punto 2).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/";
  // Solo rutas internas: nunca redirigir a otro dominio.
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
