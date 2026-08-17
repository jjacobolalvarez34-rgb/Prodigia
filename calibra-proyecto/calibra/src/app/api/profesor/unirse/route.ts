import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  codigo: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  const { data, error } = await supabase.rpc("unirse_a_grupo", {
    p_codigo: body.codigo.trim().toUpperCase(),
  });

  if (error) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  const fila = (data as Array<{ group_id: string; nombre: string }>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
