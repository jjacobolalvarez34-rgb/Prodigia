import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  friend_id: string;
}

// POST /api/amigos/eliminar — quita una amistad ya aceptada (en
// cualquiera de los dos sentidos). Mismo patrón que solicitar/responder:
// valida sesión, llama al RPC (eliminar_amistad, 0197), responde
// {ok:true}. Idempotente: si ya no eran amigos, no es un error.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (!body.friend_id) {
    return NextResponse.json({ error: "Amigo inválido" }, { status: 400 });
  }

  const { error } = await supabase.rpc("eliminar_amistad", { p_friend_id: body.friend_id });
  if (error) return respuestaError("amigos/eliminar", error);

  return NextResponse.json({ ok: true });
}
