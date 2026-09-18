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
    .select("id, contenido")
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
