import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

const MONTOS = [25, 50, 100, 200];
const PUESTOS = ["1", "2", "3", "4-5", "6-10", "11-20", "21+"];

// /api/trastienda/predicciones — Mecánica 2 (0123): el GET cosecha
// predicciones pendientes de semanas cerradas (self-heal) y devuelve la
// predicción de la semana actual + la ventana de apuesta. El POST apuesta.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const cobro = await supabase.rpc("cobrar_predicciones_pendientes");
  if (cobro.error) return respuestaError("trastienda/predicciones", cobro.error);

  const { data: fila, error } = await supabase
    .from("trastienda_predicciones_ranking")
    .select(
      "id, semana_inicio, puesto_predicho, monto, multiplier, ganancia_potencial, estado, payout, puesto_real, creado_at"
    )
    .eq("user_id", user.id)
    .order("creado_at", { ascending: false })
    .limit(8);
  if (error) return respuestaError("trastienda/predicciones", error);

  // Ventana de apuesta: la resuelve el server con current_date (0126), la
  // misma fuente que valida el POST — no depende del reloj del cliente.
  const ventana = await supabase.rpc("ventana_predicciones");
  let semana = "";
  let ventanaAbierta = false;
  if (!ventana.error) {
    const v = (ventana.data as Array<Record<string, unknown>>)[0];
    semana = v?.semana ? String(v.semana) : "";
    ventanaAbierta = v?.ventana_abierta === true;
  } else {
    // Fallback pre-0126 (mismo cálculo que el server, lunes UTC): solo para
    // no dejar muerto el oráculo antes de aplicar 0126.
    const hoy = new Date();
    const dia = (hoy.getUTCDay() + 6) % 7; // 0 = lunes
    const lunes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - dia));
    semana = lunes.toISOString().slice(0, 10);
    ventanaAbierta = dia <= 2;
  }

  return NextResponse.json({
    ok: true,
    predicciones: fila ?? [],
    semana,
    ventanaAbierta,
    montos: MONTOS,
    puestos: PUESTOS,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as { puesto?: string; monto?: number };
  if (!body.puesto || !PUESTOS.includes(body.puesto) || typeof body.monto !== "number" || !MONTOS.includes(body.monto)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("apostar_prediccion_ranking", {
    p_puesto: body.puesto,
    p_monto: body.monto,
  });
  if (error) return respuestaError("trastienda/predicciones", error);

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}