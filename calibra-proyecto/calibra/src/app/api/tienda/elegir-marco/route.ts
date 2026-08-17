import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  marco: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  const { error } = await supabase.rpc("elegir_marco_perfil", { p_marco: body.marco });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
