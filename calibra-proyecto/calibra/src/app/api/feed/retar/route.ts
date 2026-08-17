import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  post_id: string;
}

// POST /api/feed/retar
// Crea el duelo (retador = quien clickea, retado = autor de la tarjeta
// de desafío) y manda derecho al sprint con esa operación. El motor de
// sprint todavía no consume semilla_problemas ni escribe duel_results —
// eso queda para cuando se construya la pantalla de duelo en sí sobre
// esta misma base (Fase N dejó la tabla lista a propósito para eso).
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const { data: post, error: postError } = await supabase
    .from("feed_posts")
    .select("user_id, operation_type, tipo")
    .eq("id", body.post_id)
    .single();

  if (postError || !post || post.tipo !== "desafio") {
    return NextResponse.json({ error: "Desafío no encontrado" }, { status: 404 });
  }
  if (post.user_id === user.id) {
    return NextResponse.json({ error: "No podés retarte a vos mismo" }, { status: 400 });
  }

  const semilla = Math.floor(Math.random() * 1_000_000_000_000);

  const { data: duel, error: duelError } = await supabase
    .from("duels")
    .insert({
      retador_id: user.id,
      retado_id: post.user_id,
      semilla_problemas: semilla,
      operation_type: post.operation_type,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (duelError || !duel) {
    return NextResponse.json({ error: duelError?.message ?? "No se pudo crear el duelo" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, operation_type: post.operation_type, duel_id: duel.id });
}
