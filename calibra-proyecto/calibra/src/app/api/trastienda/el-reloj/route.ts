import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  accion: "iniciar" | "finalizar";
  reloj_id?: string;
  respuestas?: number[];
}

// /api/trastienda/el-reloj — El Reloj del sótano (0124). El server genera
// los 15 problemas (las respuestas no salen de ahí: la tabla no se grantea)
// y compara las 15 respuestas al finalizar, con el reloj total de 85s.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;

  let data: unknown;
  let error: { message: string; code?: string } | null = null;

  if (body.accion === "iniciar") {
    const r = await supabase.rpc("iniciar_el_reloj");
    data = r.data;
    error = r.error;
  } else if (body.accion === "finalizar") {
    if (typeof body.reloj_id !== "string" || !Array.isArray(body.respuestas)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const r = await supabase.rpc("finalizar_el_reloj", {
      p_reloj_id: body.reloj_id,
      p_respuestas: body.respuestas,
    });
    data = r.data;
    error = r.error;
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  if (error) return respuestaError("trastienda/el-reloj", error);

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}