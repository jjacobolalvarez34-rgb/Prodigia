import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  group_id: string;
}

// POST /api/profesor/borrar-grupo
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (!body.group_id) {
    return NextResponse.json({ error: "Grupo inválido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", body.group_id)
    .eq("profesor_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
