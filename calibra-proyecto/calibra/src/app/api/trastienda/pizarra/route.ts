import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  accion: "iniciar" | "adivinar";
  pizarra_id?: string;
  numero?: number;
}

// POST /api/trastienda/pizarra — La Pizarra del Profesor (0121). El
// secreto vive en el server; el cliente solo recibe pistas mayor/menor.
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
    const r = await supabase.rpc("iniciar_la_pizarra");
    data = r.data;
    error = r.error;
  } else if (body.accion === "adivinar") {
    if (!body.pizarra_id || typeof body.numero !== "number") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const r = await supabase.rpc("adivinar_la_pizarra", {
      p_pizarra_id: body.pizarra_id,
      p_numero: body.numero,
    });
    data = r.data;
    error = r.error;
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  if (error) {
    return respuestaError("trastienda/pizarra", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}