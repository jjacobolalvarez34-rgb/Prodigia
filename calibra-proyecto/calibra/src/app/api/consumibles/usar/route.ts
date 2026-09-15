import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  item: "hielo" | "tiempo_extra";
}

// Gasta 1 unidad de un consumible de partida ya comprado (hielo o
// tiempo_extra, ver 0148_consumibles_partida_y_cosmeticos_extra.sql).
// La RPC re-deriva auth.uid() y decrementa server-side — acá solo se
// valida la forma del body, nunca el saldo (eso lo hace la RPC).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  if (body.item !== "hielo" && body.item !== "tiempo_extra") {
    return NextResponse.json({ error: "Item inválido" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("usar_consumible_partida", { p_item: body.item });
  if (error) {
    return respuestaError("consumibles/usar", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
