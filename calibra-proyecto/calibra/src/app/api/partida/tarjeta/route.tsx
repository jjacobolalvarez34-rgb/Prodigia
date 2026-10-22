import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { decodificarTarjeta, esUuid } from "@/lib/partidas/compartir";
import { leerPartidaPublica, textosTarjeta } from "@/lib/partidas/servidor";
import { MEDIDAS_TARJETA, TarjetaImagen } from "@/lib/partidas/TarjetaImagen";

// GET /api/partida/tarjeta — la imagen del resultado de una partida (PNG).
//   ?id=<uuid>  partida compartida (0300): los números salen de la base.
//   ?d=<datos>  sin enlace (la migración no corrió): los datos de la pantalla
//               del resultado, codificados en la URL. Solo dibuja la imagen
//               para quien la pidió; no se guarda ni se publica nada.
//   ?l=es|en    idioma · ?f=og para la vista previa de enlaces (1200×630).
export async function GET(request: Request) {
  const u = new URL(request.url);
  const locale = u.searchParams.get("l") === "en" ? "en" : "es";
  const formato = u.searchParams.get("f") === "og" ? "og" : "post";
  const id = u.searchParams.get("id");
  const tarjeta = esUuid(id) ? await leerPartidaPublica(id) : decodificarTarjeta(u.searchParams.get("d"));
  if (!tarjeta) {
    return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });
  }
  const textos = await textosTarjeta(tarjeta, locale);
  return new ImageResponse(<TarjetaImagen t={tarjeta} textos={textos} formato={formato} />, {
    ...MEDIDAS_TARJETA[formato],
    headers: { "Cache-Control": esUuid(id) ? "public, max-age=300, s-maxage=300" : "private, max-age=3600" },
  });
}
