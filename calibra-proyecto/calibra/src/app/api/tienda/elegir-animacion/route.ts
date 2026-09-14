import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  animacion: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  const { error } = await supabase.rpc("elegir_animacion_nombre", { p_animacion: body.animacion });

  if (error) {
    return respuestaError("tienda/elegir-animacion", error);
  }
  return NextResponse.json({ ok: true });
}
