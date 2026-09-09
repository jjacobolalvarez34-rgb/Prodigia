import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

// GET /api/trastienda/historial — últimas 8 interacciones (0121).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data, error } = await supabase.rpc("fetch_trastienda_historial");

  if (error) {
    return respuestaError("trastienda/historial", error);
  }

  return NextResponse.json({ ok: true, items: data ?? [] });
}