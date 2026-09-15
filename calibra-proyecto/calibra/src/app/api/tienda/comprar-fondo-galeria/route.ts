import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  slug: string;
}

// Compra un fondo de la galería (0152_fondos_galeria.sql) — el precio
// SIEMPRE se recalcula server-side desde fondos_galeria.costo dentro de
// la RPC, nunca se confía en nada que mande el cliente acá.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  if (!body.slug) return NextResponse.json({ error: "Fondo inválido" }, { status: 400 });

  const { data, error } = await supabase.rpc("comprar_fondo_galeria", { p_slug: body.slug });
  if (error) {
    return respuestaError("tienda/comprar-fondo-galeria", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  return NextResponse.json({ ok: true, ...fila });
}
