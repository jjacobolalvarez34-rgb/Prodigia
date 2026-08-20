import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";
import { verificarLogros } from "@/lib/logros/verificar";
import { verificarTitulos } from "@/lib/titulos/verificar";

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

  // El rango (y por lo tanto "elo_minimo"/racha de victorias) recién
  // queda al día una vez que esta llamada termina de actualizar el ELO
  // — se chequea acá, no solo en /api/practica/finish (que corre ANTES
  // y todavía vería el ELO viejo), para que un logro de rango se
  // desbloquee en el mismo duelo que lo cruza, no en la próxima partida.
  const logrosNuevos = fila.resuelto ? await verificarLogros(supabase, user.id) : [];
  if (fila.resuelto) await verificarTitulos(supabase, user.id);

  return NextResponse.json({ ok: true, ...fila, logrosNuevos });
}
