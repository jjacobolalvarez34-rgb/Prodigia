import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { precioConDescuento } from "@/lib/descuentoDiario";
import { respuestaError } from "@/lib/api/respuestaError";

// Fase 2 (mercado): precios revisados para que comprar algo se sienta
// alcanzable en un puñado de partidas — ver el razonamiento completo
// (Puntos típicos por partida) en 0054_tienda_rediseno.sql.
const COSTOS = {
  escudo: 40,
  congelamiento: 35,
  boost: 60,
  fuente_mono: 50,
  fuente_serif: 90,
  fuente_manuscrita: 150,
  marco_bronce: 50,
  marco_plata: 80,
  marco_oro: 120,
  marco_platino: 170,
  marco_diamante: 230,
  marco_prodigio: 300,
} as const;
type Item = keyof typeof COSTOS;

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
