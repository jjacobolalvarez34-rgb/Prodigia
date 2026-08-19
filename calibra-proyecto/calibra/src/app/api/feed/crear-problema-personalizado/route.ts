import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  pregunta: string;
  respuesta: string;
}

// POST /api/feed/crear-problema-personalizado
// Fase 6: única excepción de todo el feed a "nunca texto libre" — las 3
// redes de seguridad (filtro de palabras, límite de 1/día, desbloqueo
// por nivel) las aplica crear_problema_personalizado del lado del
// servidor (security definer) — acá solo se pasa el mensaje de error
// real que devuelva esa función, nunca uno genérico, para que el
// usuario entienda por qué lo rechazó (nivel insuficiente, límite
// diario, término prohibido).
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  if (typeof body.pregunta !== "string" || typeof body.respuesta !== "string") {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { error } = await supabase.rpc("crear_problema_personalizado", {
    p_pregunta: body.pregunta,
    p_respuesta: body.respuesta,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
