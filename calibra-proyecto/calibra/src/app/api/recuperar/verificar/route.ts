import { NextResponse } from "next/server";
import { CORREO_SOPORTE, enmascararCorreo, MAX_INTENTOS_POR_HORA_IP, MAX_INTENTOS_RECUPERACION, mundosCoinciden } from "@/lib/auth/recuperacion";
import { buscarCuenta, hashPermiso, nuevoPermiso } from "@/lib/auth/recuperacionServidor";
import { createAdminClient } from "@/lib/supabase/admin";

interface Body {
  usuario?: string;
  google?: boolean;
  mundos?: string[];
  correo?: string;
}

const NO_DISPONIBLE = NextResponse.json({ error: "La recuperación con preguntas todavía no está disponible. Escríbenos a " + CORREO_SOPORTE + "." }, { status: 503 });

// POST /api/recuperar/verificar: revisa las 3 respuestas. Bien → un permiso de un solo
// uso (10 min) para cambiar la contraseña. Mal → suma un intento a ese nombre de
// usuario (exista o no, así la respuesta no delata qué cuentas existen); al tercero,
// la recuperación de ese nombre se bloquea. Además, límite de intentos por conexión.
export async function POST(request: Request) {
  const b = (await request.json().catch(() => ({}))) as Body;
  const usuario = b.usuario?.trim().toLowerCase() ?? "";
  if (!usuario) return NextResponse.json({ error: "Escribe tu nombre de usuario." }, { status: 400 });
  const admin = createAdminClient();

  // Límite por conexión.
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "sin-ip";
  const ipHash = hashPermiso(`ip:${ip}`);
  const { data: filaIp, error: errIp } = await admin.from("recuperacion_ips").select("intentos, ventana_desde").eq("ip_hash", ipHash).maybeSingle();
  if (errIp) return NO_DISPONIBLE;
  const ventanaVieja = !filaIp || Date.parse(filaIp.ventana_desde) < Date.now() - 3600_000;
  const intentosIp = ventanaVieja ? 0 : filaIp.intentos;
  if (intentosIp >= MAX_INTENTOS_POR_HORA_IP) {
    return NextResponse.json({ error: "Demasiados intentos desde esta conexión. Prueba de nuevo en una hora." }, { status: 429 });
  }
  await admin.from("recuperacion_ips").upsert({ ip_hash: ipHash, intentos: intentosIp + 1, ventana_desde: ventanaVieja ? new Date().toISOString() : filaIp.ventana_desde });

  // Intentos por nombre de usuario (exista o no).
  const clave = hashPermiso(`usuario:${usuario}`);
  const { data: fila, error: errFila } = await admin.from("recuperacion_intentos").select("intentos, bloqueada_at").eq("clave", clave).maybeSingle();
  if (errFila) return NO_DISPONIBLE;
  if (fila?.bloqueada_at) return NextResponse.json({ ok: false, bloqueada: true, soporte: CORREO_SOPORTE });

  const cuenta = await buscarCuenta(usuario);
  const acierta =
    !!cuenta &&
    b.google === cuenta.conGoogle &&
    mundosCoinciden(b.mundos ?? [], cuenta.primerosMundos) &&
    !!cuenta.correo &&
    b.correo === enmascararCorreo(cuenta.correo);

  if (!acierta || !cuenta) {
    const intentos = (fila?.intentos ?? 0) + 1;
    const bloqueada = intentos >= MAX_INTENTOS_RECUPERACION;
    const { error } = await admin.from("recuperacion_intentos").upsert({
      clave,
      intentos,
      bloqueada_at: bloqueada ? new Date().toISOString() : null,
      actualizado_at: new Date().toISOString(),
    });
    if (error) return NO_DISPONIBLE;
    return bloqueada
      ? NextResponse.json({ ok: false, bloqueada: true, soporte: CORREO_SOPORTE })
      : NextResponse.json({ ok: false, quedan: MAX_INTENTOS_RECUPERACION - intentos });
  }

  const permiso = nuevoPermiso();
  const { error: errPermiso } = await admin.from("recuperacion_cuentas").upsert({
    user_id: cuenta.userId,
    permiso_hash: hashPermiso(permiso),
    permiso_vence_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    actualizado_at: new Date().toISOString(),
  });
  if (errPermiso) return NO_DISPONIBLE;
  await admin.from("recuperacion_intentos").upsert({ clave, intentos: 0, bloqueada_at: null, actualizado_at: new Date().toISOString() });
  return NextResponse.json({ ok: true, permiso });
}
