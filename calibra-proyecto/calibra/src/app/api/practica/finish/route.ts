import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verificarLogros } from "@/lib/logros/verificar";
import { verificarTitulos } from "@/lib/titulos/verificar";
import { respuestaError } from "@/lib/api/respuestaError";

interface FinishBody {
  started_at: string; // ISO timestamp de cuando arrancó el sprint
  // Fase 8 (bug de Rankeds): el total de la partida tiene que ser el
  // tamaño real del set (10 problemas), no la cantidad de filas de
  // `attempts` — si el usuario dejó alguno sin responder por tiempo,
  // esa fila nunca se inserta, y contar attempts.length como "total"
  // mostraba "5/7" en vez de "5/10". El total real lo sabe el cliente
  // (TOTAL_PROBLEMAS/TOTAL_PREGUNTAS de cada runner), no la base.
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

// Fase DD2: el nivel de mundo es un tercer eje de progreso, separado de
// puntos_total y del ranking — sube con los Puntos ganados DENTRO de
// cada mundo específicamente. Esta ruta es compartida por Aritmética,
// Fracciones, Decimales, Potencias, Álgebra (todos "numeria") y
// Geografía — se determina el mundo a partir del problem_type real de
// los intentos del sprint, no de la ruta que llamó a este endpoint.
const TIPOS_NUMERIA = new Set(["suma", "resta", "multiplicacion", "division", "fracciones", "decimales", "potencias", "algebra"]);
const TIPOS_QUIMIA = new Set(["quimia_simbolos", "quimia_formulas", "quimia_tabla"]);

function mundoDeProblemType(problemType: string | undefined): "numeria" | "geografia" | "quimia" | null {
  if (!problemType) return null;
  if (problemType === "geografia") return "geografia";
  if (TIPOS_QUIMIA.has(problemType)) return "quimia";
  if (TIPOS_NUMERIA.has(problemType)) return "numeria";
  return null;
}

function precision(total: number, correctos: number): number | null {
  return total > 0 ? correctos / total : null;
}

function promedio(values: number[]): number | null {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

// POST /api/practica/finish
// Cierra un sprint: suma el XP ganado (ya calculado y guardado por
// attempt en /api/attempts) a profiles.puntos_total y a daily_progress del
// día, de forma atómica, y arma la comparación con el promedio histórico
// del propio usuario (nunca con otros usuarios).
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

  const { data: sprintRows, error: sprintError } = await supabase
    .from("attempts")
    .select("correct, time_ms, xp, problem_type")
    .eq("user_id", user.id)
    .gte("created_at", startedAtIso);

  if (sprintError) {
    return respuestaError("practica/finish:sprint", sprintError);
  }

  // max(...) por las dudas de que total_problemas venga mal formado o
  // más chico que lo realmente respondido — nunca debería recortar
  // aciertos reales ya guardados.
  const sprintTotal = Math.max(sprintRows.length, body.total_problemas || 0);
  const sprintCorrectos = sprintRows.filter((r) => r.correct).length;
  const sprintXp = sprintRows.reduce((acc, r) => acc + r.xp, 0);
  const sprintAvgTimeMs = promedio(sprintRows.map((r) => r.time_ms));

  // Historial previo a este sprint. Cap defensivo: no hace falta traer
  // millones de filas para calcular un promedio en una app de práctica.
  const { data: histRows, error: histError } = await supabase
    .from("attempts")
    .select("correct, time_ms")
    .eq("user_id", user.id)
    .lt("created_at", startedAtIso)
    .limit(5000);

  if (histError) {
    return respuestaError("practica/finish:hist", histError);
  }

  const histTotal = histRows.length;
  const histCorrectos = histRows.filter((r) => r.correct).length;
  const histAvgTimeMs = promedio(histRows.map((r) => r.time_ms));

  const { data: histDaily, error: histDailyError } = await supabase
    .from("daily_progress")
    .select("xp_ganado")
    .eq("user_id", user.id)
    .lt("fecha", startedAtIso.slice(0, 10));

  if (histDailyError) {
    return respuestaError("practica/finish:histDaily", histDailyError);
  }

  const avgXpDiarioHistorico = promedio(histDaily.map((d) => d.xp_ganado));

  const { data: registroRows, error: registroError } = await supabase.rpc(
    "registrar_xp_diario",
    { p_xp: sprintXp }
  );

  if (registroError) {
    return respuestaError("practica/finish:registro", registroError);
  }

  // El boost comprado en la tienda (si estaba activo) ya se aplicó
  // partida por partida en /api/attempts — recién ahora que la partida
  // terminó lo apagamos.
  await supabase.rpc("consumir_boost_pendiente");

  const registro = (registroRows as RegistrarXpDiarioResult[])[0];

  let nivelMundo: RegistrarPuntosMundoResult | null = null;
  const mundo = mundoDeProblemType(sprintRows[0]?.problem_type);
  if (mundo && sprintXp > 0) {
    const { data: mundoRows } = await supabase.rpc("registrar_puntos_mundo", { p_world: mundo, p_puntos: sprintXp });
    nivelMundo = (mundoRows as RegistrarPuntosMundoResult[] | null)?.[0] ?? null;

    // Fase 5 del feed: hito de nivel de mundo, no cada nivel — cada 5
    // (1→5 no cuenta como hito, recién cruzar a un múltiplo de 5 sí).
    // El "cruzar" (no solo "es múltiplo de 5") importa por si algún día
    // el nivel pudiera saltar más de uno de una vez.
    if (
      nivelMundo &&
      nivelMundo.nivel_mundo > nivelMundo.nivel_anterior &&
      Math.floor(nivelMundo.nivel_mundo / 5) > Math.floor(nivelMundo.nivel_anterior / 5)
    ) {
      await supabase.from("feed_posts").insert({
        user_id: user.id,
        tipo: "nivel_mundo",
        mundo,
        nivel_mundo_valor: nivelMundo.nivel_mundo,
      });
    }
  }

  const logrosNuevos = await verificarLogros(supabase, user.id);
  await verificarTitulos(supabase, user.id);

  const sprintPrecision = precision(sprintTotal, sprintCorrectos);
  let apuesta = null;
  if (sprintPrecision !== null) {
    const { data: apuestaRows } = await supabase.rpc("resolver_apuesta_si_activa", {
      p_precision: sprintPrecision,
    });
    const filaApuesta = (apuestaRows as Array<Record<string, unknown>> | null)?.[0];
    if (filaApuesta?.resuelta) apuesta = filaApuesta;
  }

  return NextResponse.json({
    sprint: {
      total: sprintTotal,
      correctos: sprintCorrectos,
      precision: sprintPrecision,
      xpGanado: sprintXp,
      avgTimeMs: sprintAvgTimeMs,
    },
    historico: {
      total: histTotal,
      correctos: histCorrectos,
      precision: precision(histTotal, histCorrectos),
      avgTimeMs: histAvgTimeMs,
      avgXpDiario: avgXpDiarioHistorico,
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
