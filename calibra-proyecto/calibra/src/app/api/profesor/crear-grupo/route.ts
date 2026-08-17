import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Body {
  nombre: string;
}

function generarCodigo(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0/I/1 para que no se confundan
  let codigo = "";
  for (let i = 0; i < 6; i++) codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  return codigo;
}

// POST /api/profesor/crear-grupo
// Crea el grupo y, si todavía no tenía el rol, promueve al usuario a
// profesor en el mismo paso — no hay flujo de aprobación de admin en el
// MVP, crear un grupo es la señal de que alguien es docente.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  if (!body.nombre || body.nombre.trim().length < 2) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const { error: profesorError } = await supabase
    .from("profiles")
    .update({ es_profesor: true })
    .eq("id", user.id);

  if (profesorError) {
    return NextResponse.json({ error: `No se pudo marcar la cuenta como profesor: ${profesorError.message}` }, { status: 400 });
  }

  // El id lo generamos acá en vez de dejar que lo ponga la DB (default
  // gen_random_uuid()) y leerlo de vuelta con .select().single(): pedir
  // la fila de vuelta depende de que también pase la policy de SELECT
  // de "groups", una capa extra que no hace falta — ya sabemos el id y
  // el código porque los generamos nosotros.
  let codigo = generarCodigo();
  let ultimoError: string | null = null;
  for (let intento = 0; intento < 5; intento++) {
    const id = randomUUID();
    const { error } = await supabase
      .from("groups")
      .insert({ id, profesor_id: user.id, nombre: body.nombre.trim(), codigo_invitacion: codigo });
    if (!error) {
      return NextResponse.json({ ok: true, id, codigo });
    }
    ultimoError = error.message;
    codigo = generarCodigo(); // colisión de código único, reintenta
  }

  return NextResponse.json(
    { error: `No se pudo crear el grupo${ultimoError ? `: ${ultimoError}` : ", probá de nuevo."}` },
    { status: 500 }
  );
}
