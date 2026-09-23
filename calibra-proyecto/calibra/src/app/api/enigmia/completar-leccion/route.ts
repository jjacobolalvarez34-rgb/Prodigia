import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { TechniqueQuizPregunta } from "@/types/database";
import { verificarLogros } from "@/lib/logros/verificar";
import { verificarTitulos } from "@/lib/titulos/verificar";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  technique_id: string;
  // Migración 0186: bug real corregido — antes este endpoint marcaba
  // dominado=true sin recibir ni mirar ninguna respuesta (ver el
  // comentario de esa migración). Ahora valida contra
  // logic_techniques.contenido.quiz, mismo criterio que
  // /api/aprender/completar.
  respuestas?: string[];
}

// POST /api/enigmia/completar-leccion — equivalente de /api/aprender/completar
// para Enigmia. No hay modificadores que desbloquear (Enigmia no tiene ese
// sistema todavía), solo marca la técnica como dominada.
//
// Bug de seguridad real, cerrado en esta tanda (2026-09-22, retrofit de
// Clases — docs/PARIDAD_MUNDOS.md fila 22): a diferencia de
// /api/aprender/completar (que sí valida `requiere_pro`/plan desde la
// Fase C de Calculia), este endpoint NUNCA chequeaba si la técnica
// requería Pro — antes de esta tanda `logic_techniques` ni siquiera tenía
// la columna, así que no había nada que explotar todavía, pero apenas se
// agregaron las Clases Pro (0203) un usuario free hubiera podido marcar
// cualquiera como dominada pegándole directo a este endpoint, saltándose
// la UI. Réplica exacta del mismo criterio de /api/aprender/completar: si
// `requiere_pro=true` en la técnica, 403 si `profile.plan !== "pro"` —
// este chequeo corre ANTES de cualquier upsert de logic_technique_progress.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const { data: tecnica, error: tecnicaError } = await supabase
    .from("logic_techniques")
    .select("id, requiere_pro, contenido")
    .eq("id", body.technique_id)
    .maybeSingle();

  if (tecnicaError) {
    return respuestaError("enigmia/completar-leccion:tecnica", tecnicaError);
  }
  if (!tecnica) {
    return NextResponse.json({ error: "Técnica no encontrada" }, { status: 404 });
  }

  const quiz = ((tecnica.contenido as { quiz?: TechniqueQuizPregunta[] } | null)?.quiz ?? []) as TechniqueQuizPregunta[];

  if (quiz.length > 0) {
    if (tecnica.requiere_pro) {
      const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();

      if (profile?.plan !== "pro") {
        return NextResponse.json({ error: "Esta lección requiere plan Pro" }, { status: 403 });
      }
    }

    const respuestas = body.respuestas;
    const todasCorrectas =
      Array.isArray(respuestas) &&
      respuestas.length === quiz.length &&
      quiz.every((pregunta, i) => respuestas[i] === pregunta.respuesta);

    if (!todasCorrectas) {
      const incorrectas = quiz
        .map((pregunta, i) => (Array.isArray(respuestas) && respuestas[i] === pregunta.respuesta ? -1 : i))
        .filter((i) => i >= 0);
      return NextResponse.json({ ok: false, aprobado: false, incorrectas });
    }
  }

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
    return respuestaError("enigmia/completar-leccion", error);
  }

  const logrosNuevos = await verificarLogros(supabase, user.id);
  await verificarTitulos(supabase, user.id);
  return NextResponse.json({ ok: true, logrosNuevos });
}
