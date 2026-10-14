import { NextResponse } from "next/server";
import { CORREO_SOPORTE, enmascararCorreo, MAX_INTENTOS_RECUPERACION, mundosCoinciden } from "@/lib/auth/recuperacion";
import { buscarCuenta, hashPermiso, nuevoPermiso } from "@/lib/auth/recuperacionServidor";
import { createAdminClient } from "@/lib/supabase/admin";

interface Body {
  usuario?: string;
  google?: boolean;
  mundos?: string[];
  correo?: string;
}

// POST /api/recuperar/verificar: revisa las 3 respuestas. Bien → un permiso de un solo
// uso (10 min) para cambiar la contraseña. Mal → suma un intento; al tercero, bloquea
// la recuperación de esa cuenta (hay que escribir a soporte).
export async function POST(request: Request) {
  const b = (await request.json().catch(() => ({}))) as Body;
  const cuenta = b.usuario ? await buscarCuenta(b.usuario) : null;
  // Cuenta inexistente: mismo mensaje que una respuesta equivocada.
  if (!cuenta) return NextResponse.json({ ok: false, quedan: null });

  const admin = createAdminClient();
  const { data: fila } = await admin.from("recuperacion_cuentas").select("intentos, bloqueada_at").eq("user_id", cuenta.userId).maybeSingle();
  if (fila?.bloqueada_at) return NextResponse.json({ ok: false, bloqueada: true, soporte: CORREO_SOPORTE });

  const acierta =
    b.google === cuenta.conGoogle &&
    mundosCoinciden(b.mundos ?? [], cuenta.primerosMundos) &&
    !!cuenta.correo &&
    b.correo === enmascararCorreo(cuenta.correo);

  if (!acierta) {
    const intentos = (fila?.intentos ?? 0) + 1;
    const bloqueada = intentos >= MAX_INTENTOS_RECUPERACION;
    await admin.from("recuperacion_cuentas").upsert({
      user_id: cuenta.userId,
      intentos,
      bloqueada_at: bloqueada ? new Date().toISOString() : null,
      actualizado_at: new Date().toISOString(),
    });
    return bloqueada
      ? NextResponse.json({ ok: false, bloqueada: true, soporte: CORREO_SOPORTE })
      : NextResponse.json({ ok: false, quedan: MAX_INTENTOS_RECUPERACION - intentos });
  }

  const permiso = nuevoPermiso();
  await admin.from("recuperacion_cuentas").upsert({
    user_id: cuenta.userId,
    intentos: 0,
    bloqueada_at: null,
    permiso_hash: hashPermiso(permiso),
    permiso_vence_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    actualizado_at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true, permiso });
}
