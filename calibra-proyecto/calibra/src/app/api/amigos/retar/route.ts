import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";

interface Body {
  friend_id: string;
  operation_type: string;
}

// POST /api/amigos/retar — reta directamente a un amigo (sin pasar por
// una tarjeta del feed): crea el duelo y el cliente redirige a
// /practica?operacion=X&duelo=<id>, igual que el reto desde el feed.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (!(ARITHMETIC_PROBLEM_TYPES as string[]).includes(body.operation_type)) {
    return NextResponse.json({ error: "Operación inválida" }, { status: 400 });
  }
  if (!body.friend_id || body.friend_id === user.id) {
    return NextResponse.json({ error: "Rival inválido" }, { status: 400 });
  }

  const semilla = Math.floor(Math.random() * 1_000_000_000_000);

  const { data: duel, error } = await supabase
    .from("duels")
    .insert({
      retador_id: user.id,
      retado_id: body.friend_id,
      semilla_problemas: semilla,
      operation_type: body.operation_type,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error || !duel) {
    return NextResponse.json({ error: error?.message ?? "No se pudo crear el duelo" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, duel_id: duel.id });
}
