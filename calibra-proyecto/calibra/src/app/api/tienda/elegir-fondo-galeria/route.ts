import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  slug: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (!body.slug) return NextResponse.json({ error: "Fondo inválido" }, { status: 400 });

  const { error } = await supabase.rpc("elegir_fondo_galeria", { p_slug: body.slug });
  if (error) {
    return respuestaError("tienda/elegir-fondo-galeria", error);
  }
  return NextResponse.json({ ok: true });
}
