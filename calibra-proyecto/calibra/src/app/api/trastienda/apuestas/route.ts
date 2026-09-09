import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  accion: "apostar" | "preview";
  partida_id?: string;
  eleccion?: "a" | "b" | "empate";
  monto?: number;
}

const MONTOS = [25, 50, 100, 200];

// /api/trastienda/apuestas — Mecánica 1 (0123): la ruta devuelve el feed de
// partidas ajenas disponibles para apostar, mis apuestas y los límites del
// día (GET), y ejecuta la apuesta o el preview de odds (POST).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [disponibles, misApuestas, limites] = await Promise.all([
    supabase.rpc("fetch_apuestas_disponibles"),
    supabase
      .from("trastienda_apuestas")
      .select(
        "id, partida_id, partida_tipo, eleccion, monto, multiplier, ganancia_potencial, estado, resultado_final, payout, creado_at"
      )
      .eq("user_id", user.id)
      .order("creado_at", { ascending: false })
      .limit(20),
    supabase.from("trastienda_limites_diarios").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  for (const r of [disponibles, misApuestas, limites]) {
    if (r.error) return respuestaError("trastienda/apuestas", r.error);
  }

  return NextResponse.json({
    ok: true,
    disponibles: disponibles.data ?? [],
    misApuestas: misApuestas.data ?? [],
    limites: limites.data ?? { apuestas_realizadas: 0, monto_total_apostado: 0, perdida_total: 0 },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (!body.partida_id || !body.eleccion || typeof body.monto !== "number" || !MONTOS.includes(body.monto)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  let data: unknown;
  let error: { message: string; code?: string } | null = null;

  if (body.accion === "preview") {
    const r = await supabase.rpc("preview_apuesta_partida", {
      p_partida_id: body.partida_id,
      p_eleccion: body.eleccion,
      p_monto: body.monto,
    });
    data = r.data;
    error = r.error;
  } else if (body.accion === "apostar") {
    const r = await supabase.rpc("apostar_partida", {
      p_partida_id: body.partida_id,
      p_eleccion: body.eleccion,
      p_monto: body.monto,
    });
    data = r.data;
    error = r.error;
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  if (error) return respuestaError("trastienda/apuestas", error);

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}