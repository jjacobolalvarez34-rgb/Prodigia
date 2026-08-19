import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { respuestaError } from "@/lib/api/respuestaError";
import { verificarLogros } from "@/lib/logros/verificar";

interface Body {
  serie_id: string;
}

// POST /api/duelos/finalizar-serie
// Fase 5: cierra un duelo "todas las ciudades" (mejor de 3) apenas está
// decidido — aplica el ELO una sola vez (finalizar_serie_si_corresponde
// tiene su propio guard atómico contra llamarse dos veces). El cliente
// llama esto cada vez que entra a /rankeds/serie/[serieId], sea que la
// serie ya esté decidida o no — si no lo está, devuelve
// finalizada:false sin tocar nada.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const { data, error } = await supabase.rpc("finalizar_serie_si_corresponde", { p_serie_id: body.serie_id });

  if (error) {
    return respuestaError("duelos/finalizar-serie", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  const logrosNuevos = fila.finalizada ? await verificarLogros(supabase, user.id) : [];

  return NextResponse.json({ ok: true, ...fila, logrosNuevos });
}
