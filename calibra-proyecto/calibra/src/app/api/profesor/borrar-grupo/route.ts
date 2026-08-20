import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

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

  // .delete() de supabase-js NO devuelve error si RLS filtra las 0 filas
  // que matchean (una policy de delete faltante o mal configurada se ve
  // exactamente igual a "borrado con éxito" del lado del cliente) — se
  // encadena .select("id") para poder ver cuántas filas se borraron de
  // verdad y devolver un error explícito si fueron 0, en vez de reportar
  // éxito silenciosamente cuando en realidad no pasó nada.
  const { data, error } = await supabase
    .from("groups")
    .delete()
    .eq("id", body.group_id)
    .eq("profesor_id", user.id)
    .select("id");

  if (error) {
    return respuestaError("profesor/borrar-grupo", error);
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "No se pudo borrar el grupo — no existe o no sos su profesor." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
