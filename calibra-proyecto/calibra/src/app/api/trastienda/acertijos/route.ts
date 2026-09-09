import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  accion: "iniciar" | "responder";
  acertijo_id?: string;
  secuencia?: number[];
}

// /api/trastienda/acertijos — Acertijos de Enigmia (0124). El server genera
// la secuencia (la muestra una vez) y valida el orden que responde el jugador.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;

  let data: unknown;
  let error: { message: string; code?: string } | null = null;

  if (body.accion === "iniciar") {
    const r = await supabase.rpc("iniciar_acertijos");
    data = r.data;
    error = r.error;
  } else if (body.accion === "responder") {
    if (typeof body.acertijo_id !== "string" || !Array.isArray(body.secuencia)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const r = await supabase.rpc("responder_acertijos", {
      p_acertijo_id: body.acertijo_id,
      p_secuencia: body.secuencia,
    });
    data = r.data;
    error = r.error;
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  if (error) return respuestaError("trastienda/acertijos", error);

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}