import { NextResponse } from "next/server";
import { buscarCuenta, hashPermiso } from "@/lib/auth/recuperacionServidor";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/recuperar/cambiar { usuario, permiso, password }: cambia la contraseña con el
// permiso que dio /verificar (un solo uso, vence a los 10 minutos).
export async function POST(request: Request) {
  const b = (await request.json().catch(() => ({}))) as { usuario?: string; permiso?: string; password?: string };
  if (!b.password || b.password.length < 6) return NextResponse.json({ error: "La contraseña tiene que tener al menos 6 caracteres." }, { status: 400 });
  const cuenta = b.usuario ? await buscarCuenta(b.usuario) : null;
  if (!cuenta || !b.permiso) return NextResponse.json({ error: "El permiso no es válido. Vuelve a responder las preguntas." }, { status: 403 });

  const admin = createAdminClient();
  const { data: fila } = await admin.from("recuperacion_cuentas").select("permiso_hash, permiso_vence_at").eq("user_id", cuenta.userId).maybeSingle();
  const vigente = fila?.permiso_hash && fila.permiso_hash === hashPermiso(b.permiso) && fila.permiso_vence_at && Date.parse(fila.permiso_vence_at) > Date.now();
  if (!vigente) return NextResponse.json({ error: "El permiso venció o no es válido. Vuelve a responder las preguntas." }, { status: 403 });

  const { error } = await admin.auth.admin.updateUserById(cuenta.userId, { password: b.password });
  if (error) return NextResponse.json({ error: "No se pudo cambiar la contraseña. Prueba de nuevo." }, { status: 500 });
  await admin.from("recuperacion_cuentas").update({ permiso_hash: null, permiso_vence_at: null, actualizado_at: new Date().toISOString() }).eq("user_id", cuenta.userId);
  return NextResponse.json({ ok: true });
}
