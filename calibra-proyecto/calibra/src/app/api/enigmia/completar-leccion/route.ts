import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verificarLogros } from "@/lib/logros/verificar";

interface Body {
  technique_id: string;
}

// POST /api/enigmia/completar-leccion — equivalente de /api/aprender/completar
// para Enigmia. No hay modificadores que desbloquear (Enigmia no tiene ese
// sistema todavía), solo marca la técnica como dominada.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const { data: progresoActual } = await supabase
    .from("logic_technique_progress")
    .select("intentos")
    .eq("user_id", user.id)
    .eq("technique_id", body.technique_id)
    .maybeSingle();

  const { error } = await supabase.from("logic_technique_progress").upsert(
    {
      user_id: user.id,
      technique_id: body.technique_id,
      dominado: true,
      intentos: (progresoActual?.intentos ?? 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,technique_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const logrosNuevos = await verificarLogros(supabase, user.id);
  return NextResponse.json({ ok: true, logrosNuevos });
}
