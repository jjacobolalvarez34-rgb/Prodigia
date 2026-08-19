import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  post_id: string;
  respuesta: string;
}

// POST /api/feed/responder-personalizado
// La respuesta correcta nunca viaja al cliente en el feed en sí (ver
// social/page.tsx) — recién se resuelve acá, server-side, comparando
// contra lo guardado en problemas_personalizados.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  if (!body.post_id || typeof body.respuesta !== "string") {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("responder_problema_personalizado", {
    p_post_id: body.post_id,
    p_respuesta: body.respuesta,
  });

  if (error) {
    return respuestaError("feed/responder-personalizado", error);
  }

  const fila = (data as Array<{ correcto: boolean; respuesta_correcta: string }> | null)?.[0];
  if (!fila) {
    return NextResponse.json({ error: "Problema no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, correcto: fila.correcto, respuesta_correcta: fila.respuesta_correcta });
}
