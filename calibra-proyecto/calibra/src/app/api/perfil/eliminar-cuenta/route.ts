import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// POST /api/perfil/eliminar-cuenta
// Borra la cuenta de verdad: auth.users, y todo lo demás cae en cascada
// por las FK on delete cascade (profiles, attempts, skill_levels, etc.).
// Borrar un usuario de auth.users solo se puede con la service role key
// — ningún usuario puede borrarse a sí mismo con su propio JWT.
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo borrar la cuenta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
