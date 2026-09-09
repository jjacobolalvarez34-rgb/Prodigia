import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  accion: "iniciar" | "resolver";
  calcu_id?: string;
  expresion?: unknown;
}

// /api/trastienda/la-calcu — La Calcu (0124). El puzzle nace en el server
// (generar_puzzle_calcu) y la resolución valida la expresión como AST JSON;
// el cliente jamás recibe la solución escondida.
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
    const r = await supabase.rpc("iniciar_la_calcu");
    data = r.data;
    error = r.error;
  } else if (body.accion === "resolver") {
    if (typeof body.calcu_id !== "string" || body.expresion == null) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const r = await supabase.rpc("resolver_la_calcu", {
      p_calcu_id: body.calcu_id,
      p_expresion: body.expresion,
    });
    data = r.data;
    error = r.error;
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  if (error) return respuestaError("trastienda/la-calcu", error);

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}