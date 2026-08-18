import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  monto: number;
}

// POST /api/tienda/apostar — "doble o nada" (Fase G2): apostás Puntos a
// que tu próxima partida supera tu precisión histórica. Si ganás se
// duplica lo apostado; se resuelve solo al cerrar la próxima partida
// (ver resolver_apuesta_si_activa, llamado desde /api/practica/finish y
// /api/enigmia/finish).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (!body.monto || body.monto <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("apostar_doble_o_nada", { p_monto: body.monto });

  if (error) {
    return respuestaError("tienda/apostar", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
