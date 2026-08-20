import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { precioConDescuento } from "@/lib/descuentoDiario";
import { respuestaError } from "@/lib/api/respuestaError";
import { COSTOS, type ItemComprable as Item } from "@/lib/tienda/costos";

interface Body {
  item: Item;
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
  if (!(body.item in COSTOS)) {
    return NextResponse.json({ error: "Item inválido" }, { status: 400 });
  }

  // El descuento del día se recalcula acá, server-side, con la fecha de
  // hoy — nunca se confía en un precio que mande el cliente.
  const hoyIso = new Date().toISOString().slice(0, 10);
  const costoFinal = precioConDescuento(COSTOS[body.item], body.item, hoyIso);

  const { data, error } = await supabase.rpc("comprar_item_tienda", {
    p_item: body.item,
    p_costo: costoFinal,
  });

  if (error) {
    return respuestaError("tienda/comprar", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
