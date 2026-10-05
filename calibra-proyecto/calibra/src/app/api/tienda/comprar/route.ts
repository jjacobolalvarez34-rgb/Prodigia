import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { precioConDescuento } from "@/lib/descuentoDiario";
import { respuestaError } from "@/lib/api/respuestaError";
import { COSTOS, type ItemComprable as Item } from "@/lib/tienda/costos";
import { CATALOGO_NUEVO, PAQUETES, UTILIDADES_NUEVAS } from "@/lib/recompensas/catalogo";

interface Body {
  item: Item | string;
}

// Tienda ampliada (0248): precio de lo nuevo (catálogo, paquetes y utilidades). La
// base vuelve a validar el precio, la temporada y si ya lo tienes.
function precioNuevo(item: string): number | null {
  return (
    CATALOGO_NUEVO.find((x) => x.vendible && x.item === item)?.precio ??
    PAQUETES.find((x) => x.item === item)?.precio ??
    UTILIDADES_NUEVAS.find((x) => x.item === item)?.precio ??
    null
  );
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
  const nuevo = body.item in COSTOS ? null : precioNuevo(body.item);
  if (!(body.item in COSTOS) && nuevo == null) {
    return NextResponse.json({ error: "Item inválido" }, { status: 400 });
  }

  // El descuento del día se recalcula acá, server-side, con la fecha de
  // hoy — nunca se confía en un precio que mande el cliente.
  const hoyIso = new Date().toISOString().slice(0, 10);
  const costoFinal = nuevo ?? precioConDescuento(COSTOS[body.item as Item], body.item as Item, hoyIso);

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
