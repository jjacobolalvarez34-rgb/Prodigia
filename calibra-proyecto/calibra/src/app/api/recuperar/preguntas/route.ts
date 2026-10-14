import { NextResponse } from "next/server";
import { opcionesDeCorreo } from "@/lib/auth/recuperacion";
import { buscarCuenta } from "@/lib/auth/recuperacionServidor";

// POST /api/recuperar/preguntas { usuario } → las 4 opciones de correo (enmascaradas).
// Responde igual exista o no la cuenta, para no revelar qué nombres existen.
export async function POST(request: Request) {
  const { usuario } = (await request.json().catch(() => ({}))) as { usuario?: string };
  if (!usuario?.trim()) return NextResponse.json({ error: "Escribe tu nombre de usuario." }, { status: 400 });
  const cuenta = await buscarCuenta(usuario);
  return NextResponse.json({ opciones: opcionesDeCorreo(usuario.trim(), cuenta?.correo ?? null) });
}
