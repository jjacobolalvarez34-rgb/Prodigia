import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  duel_id: string;
  precision: number;
  tiempo_promedio: number;
  puntaje: number;
  respuestas?: { correct: boolean; timeMs: number }[];
}

// POST /api/duelos/resultado
// Registra el resultado de un participante en un duelo y, si el rival
// ya había jugado el suyo, resuelve el duelo y devuelve el nuevo ELO.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const { data, error } = await supabase.rpc("registrar_resultado_duelo", {
    p_duel_id: body.duel_id,
    p_precision: body.precision,
    p_tiempo_promedio: body.tiempo_promedio,
    p_puntaje: body.puntaje,
    p_respuestas: body.respuestas ?? null,
  });

  if (error) {
    return respuestaError("duelos/resultado", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
