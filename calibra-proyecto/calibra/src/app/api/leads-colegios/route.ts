import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Body {
  nombreColegio?: string;
  nombreContacto?: string;
  email?: string;
  telefono?: string;
  numEstudiantesAprox?: number;
  mensaje?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Formulario público de la página de venta a colegios (/docentes) — sin
// autenticación (un colegio interesado no tiene por qué crear una
// cuenta de Prodigia solo para dejar sus datos). Guarda el lead en
// leads_colegios (0150), de solo-escritura desde el cliente — el dueño
// hace seguimiento a mano, no hay flujo de venta automático todavía.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;

  const nombreColegio = body.nombreColegio?.trim() ?? "";
  const nombreContacto = body.nombreContacto?.trim() ?? "";
  const email = body.email?.trim() ?? "";

  if (nombreColegio.length < 2 || nombreContacto.length < 2 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Revisa los campos obligatorios." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads_colegios").insert({
    nombre_colegio: nombreColegio,
    nombre_contacto: nombreContacto,
    email,
    telefono: body.telefono?.trim() || null,
    num_estudiantes_aprox: typeof body.numEstudiantesAprox === "number" ? body.numEstudiantesAprox : null,
    mensaje: body.mensaje?.trim() || null,
  });

  if (error) {
    console.error("[api:leads-colegios]", error.code, error.message);
    return NextResponse.json({ error: "No se pudo enviar. Prueba de nuevo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
