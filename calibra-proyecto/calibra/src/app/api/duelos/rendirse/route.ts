import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  duel_id: string;
}

// POST /api/duelos/rendirse
// Fase 3 de "Rankeds: Rendirse en vez de cancelar por click afuera" —
// el que llama se rinde, cuenta como derrota real con su ELO
// correspondiente. Ver rendirse_duelo (0088_rendirse_duelo.sql).
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const { data, error } = await supabase.rpc("rendirse_duelo", { p_duel_id: body.duel_id });

  if (error) {
    return respuestaError("duelos/rendirse", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
