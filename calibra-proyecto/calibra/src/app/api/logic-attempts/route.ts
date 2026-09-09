import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calcularXpDetallado, tiempoEsperadoMs } from "@/lib/practica/formulas";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  puzzle_id: string;
  dificultad: number;
  correct: boolean;
  time_ms: number;
  protegido?: boolean;
}

// Mismo piso anti-apuro que /api/attempts, aplicado a acertijos.
// Espejo local del cálculo que decide el RPC insertar_intento_logica
// (0120) — acá solo para elegir qué desglose copiar al front.
function esTiempoSospechoso(dificultad: number, timeMs: number): boolean {
  const piso = Math.max(150, tiempoEsperadoMs(dificultad) * 0.12);
  return timeMs < piso;
}

// POST /api/logic-attempts — equivalente de /api/attempts para Enigmia.
// El alta se hace por el RPC security definer insertar_intento_logica
// (0120): calcula XP y anti-apuro dentro de la base, inserta el intento
// y actualiza logic_skill_levels. El cliente no puede escribir
// logic_attempts directo ni inventar el xp.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  const sospechoso = esTiempoSospechoso(body.dificultad, body.time_ms);
  const desglose = calcularXpDetallado(body.dificultad, body.time_ms);

  const { data: rpcRows, error } = await supabase.rpc("insertar_intento_logica", {
    p_puzzle_id: body.puzzle_id,
    p_dificultad: body.dificultad,
    p_correct: body.correct,
    p_time_ms: body.time_ms,
    p_protegido: body.protegido ?? false,
  });

  if (error) {
    return respuestaError("logic-attempts", error);
  }

  const fila = (rpcRows ?? [])[0];

  return NextResponse.json({
    ok: true,
    xp: fila?.xp ?? 0,
    xpBreakdown: body.correct && !sospechoso ? desglose : null,
    skillLevel: fila?.nivel != null ? { nivel: fila.nivel, racha_actual: fila.racha_actual } : null,
    sospechoso: fila?.sospechoso ?? sospechoso,
  });
}