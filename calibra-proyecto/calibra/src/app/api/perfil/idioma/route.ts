import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  idioma: "es" | "en";
}

// Persiste la preferencia de idioma en el perfil (además de la cookie
// NEXT_LOCALE que next-intl ya setea sola al navegar) — así viaja entre
// dispositivos, no solo en el navegador donde se eligió.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  if (body.idioma !== "es" && body.idioma !== "en") {
    return NextResponse.json({ error: "Idioma inválido" }, { status: 400 });
  }

  const { error } = await supabase.rpc("elegir_idioma", { p_idioma: body.idioma });

  if (error) {
    return respuestaError("perfil/idioma", error);
  }

  return NextResponse.json({ ok: true });
}
