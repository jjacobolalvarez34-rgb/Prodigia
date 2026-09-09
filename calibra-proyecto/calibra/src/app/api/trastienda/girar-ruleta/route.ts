import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

// POST /api/trastienda/girar-ruleta — la rueda del Trastiendista
// (0121 girar_ruleta). Server decide el segmento y paga.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data, error } = await supabase.rpc("girar_ruleta");

  if (error) {
    return respuestaError("trastienda/girar-ruleta", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}