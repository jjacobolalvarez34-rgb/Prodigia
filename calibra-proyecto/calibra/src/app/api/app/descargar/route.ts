import { NextResponse, type NextRequest } from "next/server";
import { URL_APK } from "@/lib/appAndroid";

// Descarga del APK: redirige al archivo (el navegador lo baja solo, sin abrir otra
// página). Sin APK publicado, manda a la página /descargar.
export function GET(request: NextRequest) {
  if (!URL_APK) return NextResponse.redirect(new URL("/descargar", request.url));
  return NextResponse.redirect(URL_APK, 302);
}
