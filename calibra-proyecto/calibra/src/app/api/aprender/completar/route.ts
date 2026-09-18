import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Modifier, TechniqueQuizPregunta } from "@/types/database";
import { verificarLogros } from "@/lib/logros/verificar";
import { verificarTitulos } from "@/lib/titulos/verificar";
import { respuestaError } from "@/lib/api/respuestaError";

interface Body {
  technique_id: string;
  // Fase C (Calculia — Curso estructurado Pro): array paralelo a
  // contenido.quiz[], una respuesta enviada por pregunta. Opcional y
  // sin efecto para técnicas rápidas (requiere_pro=false, sin quiz).
  respuestas?: string[];
}

// POST /api/aprender/completar
// Marca una técnica como dominada y desbloquea los modificadores que
// tenga asociados en technique_modifiers. Idempotente: completar de nuevo
// una técnica ya dominada no rompe nada ni duplica desbloqueos.
//
// Fase C (Calculia): si la técnica tiene contenido.quiz con preguntas
// — sea Pro o técnica rápida gratuita, ver docs/PLAN_REVISION_CONTENIDO.md
// Proceso 1 — esto deja de ser incondicional:
//   1) si además requiere_pro=true, confirmar que quien llama es
//      realmente Pro (defensa en profundidad — la UI ya no debería
//      dejar que un usuario free llegue hasta acá, pero el server
//      nunca puede confiar solo en eso: cualquiera puede pegarle
//      directo a este endpoint);
//   2) validar cada respuesta enviada contra quiz[i].respuesta — si
//      alguna está mal (o falta `respuestas`/tiene longitud distinta),
//      se devuelve { ok:false, aprobado:false } SIN tocar
//      technique_progress (no se marca dominado, no hay reintentos
//      gratis del lado del servidor).
// Una técnica SIN quiz (contenido.quiz vacío o ausente) sigue el camino
// incondicional de siempre, sin cambios — la mayoría de las técnicas
// rápidas viejas todavía están en ese estado mientras se les va
// agregando quiz mundo por mundo.
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
    .from("techniques")
    .select("id, requiere_pro, contenido")
    .eq("id", body.technique_id)
    .maybeSingle();

  if (tecnicaError) {
    return respuestaError("aprender/completar:tecnica", tecnicaError);
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
