import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  friend_id: string;
}

// POST /api/social/seguir
// "Seguir" simple, no pedido de amistad mutuo: se acepta directo. Toggle
// — si ya lo seguís, deja de seguirlo.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  if (body.friend_id === user.id) {
    return NextResponse.json({ error: "No podés seguirte a vos mismo" }, { status: 400 });
  }

  const { data: existente } = await supabase
    .from("friendships")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("friend_id", body.friend_id)
    .maybeSingle();

  if (existente) {
    await supabase.from("friendships").delete().eq("user_id", user.id).eq("friend_id", body.friend_id);
    return NextResponse.json({ ok: true, siguiendo: false });
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ user_id: user.id, friend_id: body.friend_id, estado: "aceptada" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, siguiendo: true });
}
