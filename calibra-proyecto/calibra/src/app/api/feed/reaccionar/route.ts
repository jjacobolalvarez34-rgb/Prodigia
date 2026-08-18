import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  post_id: string;
}

// POST /api/feed/reaccionar
// Única reacción posible (🔥), toggle: si ya reaccionaste, la saca.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const { data: existente } = await supabase
    .from("feed_reactions")
    .select("post_id")
    .eq("post_id", body.post_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existente) {
    await supabase.from("feed_reactions").delete().eq("post_id", body.post_id).eq("user_id", user.id);
    return NextResponse.json({ ok: true, reaccionaste: false });
  }

  const { error } = await supabase
    .from("feed_reactions")
    .insert({ post_id: body.post_id, user_id: user.id });

  if (error) {
    return respuestaError("feed/reaccionar", error);
  }

  return NextResponse.json({ ok: true, reaccionaste: true });
}
