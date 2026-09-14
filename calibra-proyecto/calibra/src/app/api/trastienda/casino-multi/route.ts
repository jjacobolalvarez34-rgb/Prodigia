import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";
import { FICHAS_CASINO, MAX_ZONAS_CASINO, esZonaCasinoValida } from "@/lib/trastienda/casino";

// POST /api/trastienda/casino-multi — Ruleta Elemental con varias fichas
// en el mismo giro (0137 apostar_casino_elementos_multi).
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const apuestas = Array.isArray(body.apuestas) ? body.apuestas : null;

  if (!apuestas || apuestas.length < 1 || apuestas.length > MAX_ZONAS_CASINO) {
    return NextResponse.json({ error: `Elegí entre 1 y ${MAX_ZONAS_CASINO} zonas` }, { status: 400 });
  }

  const zonas: string[] = [];
  const montos: number[] = [];
  for (const a of apuestas) {
    if (typeof a?.zona !== "string" || !esZonaCasinoValida(a.zona)) {
      return NextResponse.json({ error: "Zona inválida" }, { status: 400 });
    }
    if (typeof a?.monto !== "number" || !(FICHAS_CASINO as readonly number[]).includes(a.monto)) {
      return NextResponse.json({ error: "Ficha inválida" }, { status: 400 });
    }
    zonas.push(a.zona);
    montos.push(a.monto);
  }

  const { data, error } = await supabase.rpc("apostar_casino_elementos_multi", {
    p_zonas: zonas,
    p_montos: montos,
  });

  if (error) {
    return respuestaError("trastienda/casino-multi", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
