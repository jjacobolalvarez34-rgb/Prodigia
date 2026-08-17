import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  user_id: string;
  aceptar: boolean;
}

// POST /api/amigos/responder — acepta o rechaza una solicitud pendiente
// que ME mandó body.user_id.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;

  if (body.aceptar) {
    const { error } = await supabase
      .from("friendships")
      .update({ estado: "aceptada" })
      .eq("user_id", body.user_id)
      .eq("friend_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("user_id", body.user_id)
      .eq("friend_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
