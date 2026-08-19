import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verificarLogros } from "@/lib/logros/verificar";
import { respuestaError } from "@/lib/api/respuestaError";

interface FinishBody {
  started_at: string;
  // Ver el mismo comentario en /api/practica/finish — mismo bug, mismo fix.
  total_problemas: number;
}

interface RegistrarXpDiarioResult {
  xp_total: number;
  xp_ganado_hoy: number;
  meta_alcanzada: boolean;
  meta_xp_diaria: number;
}

interface RegistrarPuntosMundoResult {
  world: string;
  puntos_mundo: number;
  nivel_mundo: number;
  nivel_anterior: number;
}

function precision(total: number, correctos: number): number | null {
  return total > 0 ? correctos / total : null;
}

function promedio(values: number[]): number | null {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

// POST /api/enigmia/finish — equivalente de /api/practica/finish para
// una partida de Enigmia. Puntos y Experiencia son de cuenta (Fase V),
// así que suma exactamente por el mismo camino (registrar_xp_diario)
// que una partida de Numeria — no hay una "moneda de Enigmia" aparte.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as FinishBody;
  const startedAt = new Date(body.started_at);
  if (Number.isNaN(startedAt.getTime())) {
    return NextResponse.json({ error: "started_at inválido" }, { status: 400 });
  }
  const startedAtIso = startedAt.toISOString();

  const { data: partidaRows, error: partidaError } = await supabase
    .from("logic_attempts")
    .select("correct, time_ms, xp")
    .eq("user_id", user.id)
    .gte("created_at", startedAtIso);

  if (partidaError) {
    return respuestaError("enigmia/finish:partida", partidaError);
  }

  const total = Math.max(partidaRows.length, body.total_problemas || 0);
  const correctos = partidaRows.filter((r) => r.correct).length;
  const xpGanado = partidaRows.reduce((acc, r) => acc + r.xp, 0);
  const avgTimeMs = promedio(partidaRows.map((r) => r.time_ms));

  const { data: histRows } = await supabase
    .from("logic_attempts")
    .select("correct, time_ms")
    .eq("user_id", user.id)
    .lt("created_at", startedAtIso)
    .limit(5000);

  const histTotal = histRows?.length ?? 0;
  const histCorrectos = (histRows ?? []).filter((r) => r.correct).length;
  const histAvgTimeMs = promedio((histRows ?? []).map((r) => r.time_ms));

  const { data: registroRows, error: registroError } = await supabase.rpc("registrar_xp_diario", {
    p_xp: xpGanado,
  });

  if (registroError) {
    return respuestaError("enigmia/finish:registro", registroError);
  }

  await supabase.rpc("consumir_boost_pendiente");

  const registro = (registroRows as RegistrarXpDiarioResult[])[0];

  // Fase DD2: nivel de mundo, siempre "enigmia" acá — a diferencia de
  // /api/practica/finish no hace falta derivar el mundo del problem_type.
  let nivelMundo: RegistrarPuntosMundoResult | null = null;
  if (xpGanado > 0) {
    const { data: mundoRows } = await supabase.rpc("registrar_puntos_mundo", { p_world: "enigmia", p_puntos: xpGanado });
    nivelMundo = (mundoRows as RegistrarPuntosMundoResult[] | null)?.[0] ?? null;
  }

  const logrosNuevos = await verificarLogros(supabase, user.id);

  const partidaPrecision = precision(total, correctos);
  let apuesta = null;
  if (partidaPrecision !== null) {
    const { data: apuestaRows } = await supabase.rpc("resolver_apuesta_si_activa", {
      p_precision: partidaPrecision,
    });
    const filaApuesta = (apuestaRows as Array<Record<string, unknown>> | null)?.[0];
    if (filaApuesta?.resuelta) apuesta = filaApuesta;
  }

  return NextResponse.json({
    partida: {
      total,
      correctos,
      precision: partidaPrecision,
      xpGanado,
      avgTimeMs,
    },
    historico: {
      total: histTotal,
      correctos: histCorrectos,
      precision: precision(histTotal, histCorrectos),
      avgTimeMs: histAvgTimeMs,
    },
    puntosTotal: registro.xp_total,
    xpGanadoHoy: registro.xp_ganado_hoy,
    metaAlcanzada: registro.meta_alcanzada,
    metaXpDiaria: registro.meta_xp_diaria,
    logrosNuevos,
    apuesta,
    nivelMundo: nivelMundo && {
      world: nivelMundo.world,
      nivel_mundo: nivelMundo.nivel_mundo,
      subio: nivelMundo.nivel_mundo > nivelMundo.nivel_anterior,
    },
  });
}
