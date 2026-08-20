import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Modifier } from "@/types/database";
import { verificarLogros } from "@/lib/logros/verificar";
import { verificarTitulos } from "@/lib/titulos/verificar";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  technique_id: string;
}

// POST /api/aprender/completar
// Marca una técnica como dominada y desbloquea los modificadores que
// tenga asociados en technique_modifiers. Idempotente: completar de nuevo
// una técnica ya dominada no rompe nada ni duplica desbloqueos.
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
    .from("technique_progress")
    .select("intentos")
    .eq("user_id", user.id)
    .eq("technique_id", body.technique_id)
    .maybeSingle();

  const { error: progresoError } = await supabase.from("technique_progress").upsert(
    {
      user_id: user.id,
      technique_id: body.technique_id,
      dominado: true,
      intentos: (progresoActual?.intentos ?? 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,technique_id" }
  );

  if (progresoError) {
    return respuestaError("aprender/completar:progreso", progresoError);
  }

  const { data: relaciones, error: relacionesError } = await supabase
    .from("technique_modifiers")
    .select("modifier_id, modifiers(id, problem_type, slug, nombre, descripcion)")
    .eq("technique_id", body.technique_id);

  if (relacionesError) {
    return respuestaError("aprender/completar:relaciones", relacionesError);
  }

  const modificadoresDesbloqueados: Modifier[] = [];
  for (const rel of relaciones ?? []) {
    await supabase
      .from("unlocked_modifiers")
      .upsert(
        { user_id: user.id, modifier_id: rel.modifier_id },
        { onConflict: "user_id,modifier_id", ignoreDuplicates: true }
      );
    const modifier = rel.modifiers as unknown as Modifier | null;
    if (modifier) modificadoresDesbloqueados.push(modifier);
  }

  const logrosNuevos = await verificarLogros(supabase, user.id);
  await verificarTitulos(supabase, user.id);

  return NextResponse.json({ ok: true, modificadoresDesbloqueados, logrosNuevos });
}
