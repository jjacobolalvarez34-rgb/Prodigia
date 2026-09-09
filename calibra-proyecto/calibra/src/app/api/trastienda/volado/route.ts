import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  ronda: number;
  eleccion: boolean;
}

// POST /api/trastienda/volado — cara o cruz (0121 tirar_volado). La
// tirada la decide el server; la elección de cara/cruz es cosmética.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (![1, 2, 3].includes(body.ronda) || typeof body.eleccion !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("tirar_volado", {
    p_ronda: body.ronda,
    p_eleccion: body.eleccion,
  });

  if (error) {
    return respuestaError("trastienda/volado", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}