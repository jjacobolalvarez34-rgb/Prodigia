import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARITHMETIC_PROBLEM_TYPES, type NewAttempt } from "@/types/database";
import { calcularXpDetallado, tiempoEsperadoMs } from "@/lib/practica/formulas";
import { actualizarSkillLevel } from "@/lib/practica/skillLevels";

// Piso de tiempo plausible: nadie resuelve de forma legítima un problema
// en una fracción ínfima del tiempo "esperado" para ese nivel. No
// rechazamos el intento (podría ser solo jitter de red) — lo marcamos
// como sospechoso: se guarda igual, pero no suma XP ni mueve la
// calibración, así ni el ranking ni los duelos se pueden inflar así.
function esTiempoSospechoso(nivel: number, timeMs: number): boolean {
  const piso = Math.max(150, tiempoEsperadoMs(nivel) * 0.12);
  return timeMs < piso;
}

// POST /api/attempts
// Guarda un intento del sprint de cálculo. El front manda el resultado
// (correcto/incorrecto, tiempo, nivel) y acá lo persistimos asociado
// al usuario autenticado — nunca confiamos en un user_id que mande el cliente.
// El XP y la calibración de skill_levels también se calculan acá, nunca
// confiando en valores que pueda mandar el cliente.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as NewAttempt & { protegido?: boolean };
  const sospechoso = esTiempoSospechoso(body.level, body.time_ms);
  const desglose = calcularXpDetallado(body.level, body.time_ms);

  const { data: profile } = await supabase
    .from("profiles")
    .select("boost_multiplicador_pendiente")
    .eq("id", user.id)
    .single();
  const boost = profile?.boost_multiplicador_pendiente ?? 1;

  const xp = body.correct && !sospechoso ? Math.round(desglose.total * boost) : 0;

  const { error } = await supabase.from("attempts").insert({
    user_id: user.id,
    problem_type: body.problem_type,
    level: body.level,
    correct: body.correct,
    time_ms: body.time_ms,
    xp,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Un intento sospechoso no mueve la calibración (ni para arriba ni para
  // abajo) — se descarta para ese propósito en vez de contaminarla.
  let skillLevel = null;
  const tiposCalibrables = [...ARITHMETIC_PROBLEM_TYPES, "fracciones", "geografia", "decimales", "potencias", "algebra"];
  if (!sospechoso && tiposCalibrables.includes(body.problem_type)) {
    skillLevel = await actualizarSkillLevel(
      supabase,
      user.id,
      body.problem_type as (typeof ARITHMETIC_PROBLEM_TYPES)[number] | "fracciones" | "geografia" | "decimales" | "potencias" | "algebra",
      body.correct,
      body.protegido ?? false
    );
  }

  return NextResponse.json({
    ok: true,
    xp,
    xpBreakdown: body.correct && !sospechoso ? desglose : null,
    skillLevel,
    sospechoso,
  });
}
