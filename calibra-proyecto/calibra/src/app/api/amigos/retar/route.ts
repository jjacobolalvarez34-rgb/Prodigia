import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";
import { respuestaError } from "@/lib/api/respuestaError";

const MUNDOS_VALIDOS = ["numeria", "geografia", "enigmia", "quimia"];
const SUB_TIPOS_VALIDOS: Record<string, string[]> = {
  geografia: ["america", "europa", "africa", "asia_oceania"],
  enigmia: ["memoria", "patrones", "deduccion", "computacional"],
  quimia: ["simbolos", "formulas", "tabla"],
};

interface Body {
  friend_id: string;
  mundo?: string;
  operation_type?: string | null;
  sub_tipo?: string | null;
}

// POST /api/amigos/retar — reta directamente a un amigo (sin pasar por
// una tarjeta del feed): crea el duelo y el cliente redirige a la
// práctica del mundo correspondiente + ?duelo=<id>. A diferencia del
// matchmaking (que sortea sub_tipo/nivel por rango), acá quien reta
// elige la operación/continente/categoría/modo a mano — es un desafío
// directo a una persona puntual, no un emparejamiento anónimo.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await request.json()) as Body;
  const mundo = body.mundo ?? "numeria";
  if (!MUNDOS_VALIDOS.includes(mundo)) {
    return NextResponse.json({ error: "Mundo inválido" }, { status: 400 });
  }
  if (!body.friend_id || body.friend_id === user.id) {
    return NextResponse.json({ error: "Rival inválido" }, { status: 400 });
  }

  if (mundo === "numeria") {
    if (!body.operation_type || !(ARITHMETIC_PROBLEM_TYPES as string[]).includes(body.operation_type)) {
      return NextResponse.json({ error: "Operación inválida" }, { status: 400 });
    }
  } else if (!body.sub_tipo || !SUB_TIPOS_VALIDOS[mundo].includes(body.sub_tipo)) {
    return NextResponse.json({ error: "Opción inválida" }, { status: 400 });
  }

  const semilla = Math.floor(Math.random() * 1_000_000_000_000);

  const { data: duel, error } = await supabase
    .from("duels")
    .insert({
      retador_id: user.id,
      retado_id: body.friend_id,
      semilla_problemas: semilla,
      mundo,
      operation_type: mundo === "numeria" ? body.operation_type : null,
      sub_tipo: mundo === "numeria" ? null : body.sub_tipo,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error) {
    return respuestaError("amigos/retar", error);
  }
  if (!duel) {
    return NextResponse.json({ error: "No se pudo crear el duelo" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, duel_id: duel.id });
}
