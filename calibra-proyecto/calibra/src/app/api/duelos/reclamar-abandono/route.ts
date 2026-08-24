import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  duel_id: string;
}

// POST /api/duelos/reclamar-abandono
// Fase 3: el que llama reclama la victoria porque el rival dejó de
// responder al Presence de Realtime por más de 1 minuto (ver
// useDeteccionAbandono.ts, quien dispara esto automáticamente). Ver
// reclamar_victoria_por_abandono (0088_rendirse_duelo.sql).
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const { data, error } = await supabase.rpc("reclamar_victoria_por_abandono", { p_duel_id: body.duel_id });

  if (error) {
    return respuestaError("duelos/reclamar-abandono", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
