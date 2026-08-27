import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";
import { esMundoPago } from "@/lib/mundos/precios";

interface Body {
  mundo: string;
}

// Fase 12 ("Mundos por Chispas"): a diferencia de /api/tienda/comprar,
// acá ni siquiera se calcula un precio server-side para mandárselo a la
// RPC — desbloquear_mundo (0097_mundos_por_chispas.sql) tiene el precio
// hardcodeado adentro, p_mundo es solo un string opaco. Este endpoint
// solo valida sesión y forma del body antes de llamarla.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  if (!esMundoPago(body.mundo)) {
    return NextResponse.json({ error: "Mundo inválido" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("desbloquear_mundo", { p_mundo: body.mundo });

  if (error) {
    return respuestaError("mundos/desbloquear", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
