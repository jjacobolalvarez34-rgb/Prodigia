import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verificarLogros } from "@/lib/logros/verificar";
import { verificarTitulos } from "@/lib/titulos/verificar";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  clave: string; // lunes de la semana "YYYY-MM-DD"
  correctos: number;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;

  const { data, error } = await supabase.rpc("completar_reto_semanal", {
    p_semana: body.clave,
    p_correctos: body.correctos,
  });

  if (error) {
    return respuestaError("reto-semanal/completar", error);
  }

  const fila = (data as Array<Record<string, unknown>>)[0];
  const [logrosNuevos, { data: ranking }] = await Promise.all([
    verificarLogros(supabase, user.id),
    supabase.rpc("ranking_reto_semanal", { p_semana: body.clave }),
  ]);
  await verificarTitulos(supabase, user.id);

  return NextResponse.json({ ok: true, ...fila, logrosNuevos, ranking: ranking ?? [] });
}
