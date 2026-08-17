import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";

interface Body {
  operation_type: string;
  nivel: number;
  cantidad_problemas: number;
}

// POST /api/feed/crear-desafio
// El texto de la tarjeta se arma en el cliente a partir de estas 3
// opciones de dropdown — acá solo se valida y se guarda, nunca se
// acepta un campo de texto libre.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  if (!(ARITHMETIC_PROBLEM_TYPES as string[]).includes(body.operation_type)) {
    return NextResponse.json({ error: "Operación inválida" }, { status: 400 });
  }
  if (body.nivel < 1 || body.nivel > 10) {
    return NextResponse.json({ error: "Nivel inválido" }, { status: 400 });
  }
  if (body.cantidad_problemas < 5 || body.cantidad_problemas > 20) {
    return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
  }

  const { error } = await supabase.from("feed_posts").insert({
    user_id: user.id,
    tipo: "desafio",
    operation_type: body.operation_type,
    nivel: body.nivel,
    cantidad_problemas: body.cantidad_problemas,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
