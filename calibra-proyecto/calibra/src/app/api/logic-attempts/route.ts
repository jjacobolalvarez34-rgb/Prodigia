import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calcularXpDetallado, tiempoEsperadoMs } from "@/lib/practica/formulas";
import { actualizarLogicSkillLevel } from "@/lib/enigmia/skillLevels";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  puzzle_id: string;
  dificultad: number;
  correct: boolean;
  time_ms: number;
  protegido?: boolean;
}

// Mismo piso anti-apuro que /api/attempts, aplicado a acertijos.
function esTiempoSospechoso(dificultad: number, timeMs: number): boolean {
  const piso = Math.max(150, tiempoEsperadoMs(dificultad) * 0.12);
  return timeMs < piso;
}

// POST /api/logic-attempts — equivalente de /api/attempts para Enigmia.
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("boost_multiplicador_pendiente")
    .eq("id", user.id)
    .single();
  const boost = profile?.boost_multiplicador_pendiente ?? 1;

  const xp = body.correct && !sospechoso ? Math.round(desglose.total * boost) : 0;

  const { error } = await supabase.from("logic_attempts").insert({
    user_id: user.id,
    puzzle_id: body.puzzle_id,
    correct: body.correct,
    time_ms: body.time_ms,
    xp,
  });

  if (error) {
    return respuestaError("logic-attempts", error);
  }

  let skillLevel = null;
  if (!sospechoso) {
    skillLevel = await actualizarLogicSkillLevel(supabase, user.id, body.correct, body.protegido ?? false);
  }

  return NextResponse.json({ ok: true, xp, xpBreakdown: body.correct && !sospechoso ? desglose : null, skillLevel, sospechoso });
}
