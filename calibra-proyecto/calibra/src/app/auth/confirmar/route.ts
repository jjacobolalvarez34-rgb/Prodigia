import { NextResponse } from "next/server";

// GET /auth/confirmar → /auth/confirm (misma consulta). Revisión 2026-10-14: esta ruta
// verificaba el token apenas se abría el enlace, y Gmail abre los enlaces solo para
// revisarlos, así que lo gastaba antes que la persona. /auth/confirm (que ya existía)
// muestra un botón y verifica recién al tocarlo. Se deja esta ruta por los correos
// que ya salieron con este enlace.
export function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/auth/confirm${url.search}`);
}
