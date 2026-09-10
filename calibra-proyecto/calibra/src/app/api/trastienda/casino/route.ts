import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";
import { FICHAS_CASINO, esZonaCasinoValida } from "@/lib/trastienda/casino";

// POST /api/trastienda/casino — la mesa del casino (0127 apostar_casino_elementos).
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const zona = typeof body.zona === "string" ? body.zona : null;
  const monto = body.monto;

  if (!zona || !esZonaCasinoValida(zona)) {
    return NextResponse.json({ error: "Zona inválida" }, { status: 400 });
  }
  if (typeof monto !== "number" || !(FICHAS_CASINO as readonly number[]).includes(monto)) {
    return NextResponse.json({ error: "Ficha inválida" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("apostar_casino_elementos", { p_zona: zona, p_monto: monto });

  if (error) {
    return respuestaError("trastienda/casino", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}