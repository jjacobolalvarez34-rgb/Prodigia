import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  friend_id: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (!body.friend_id || body.friend_id === user.id) {
    return NextResponse.json({ error: "Destinatario inválido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ user_id: user.id, friend_id: body.friend_id, estado: "pendiente" });

  if (error) {
    return NextResponse.json(
      { error: error.code === "23505" ? "Ya le mandaste una solicitud." : error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
