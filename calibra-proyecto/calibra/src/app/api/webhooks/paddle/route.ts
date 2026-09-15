import { NextResponse } from "next/server";
import { paddleAdapter } from "@/lib/pagos/paddle";
import { aplicarEventoWebhook } from "@/lib/pagos/servicio";

// Webhook server-to-server de Paddle — nunca lo llama el navegador del
// usuario. Body crudo (request.text(), NUNCA request.json() primero):
// la firma se calcula sobre los bytes exactos que mandó Paddle, un
// JSON.parse + JSON.stringify de ida y vuelta puede reordenar/reformatear
// y romper la verificación.
export async function POST(request: Request) {
  const rawBody = await request.text();

  const firmaValida = await paddleAdapter.verificarFirma(request.headers, rawBody);
  if (!firmaValida) {
    console.error("[webhook:paddle] firma inválida — se rechaza");
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let body: { event_id: string; event_type: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const evento = await paddleAdapter.normalizarEvento(rawBody, body);
    await aplicarEventoWebhook("paddle", body.event_id, body.event_type, body, evento);
  } catch (error) {
    // Error real de nuestro lado (DB caída, RPC que falló) — 500 a
    // propósito, así Paddle reintenta más tarde. Nunca 200 acá: eso
    // haría que Paddle piense que ya lo procesamos cuando en realidad
    // no se acreditó nada.
    console.error("[webhook:paddle] error procesando evento", body.event_id, error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  // 200 siempre que la firma sea válida y no haya reventado el
  // procesamiento — incluso para tipos de evento que normalizarEvento
  // decide ignorar (devuelve null), para que Paddle no reintente algo
  // que a propósito no nos interesa.
  return NextResponse.json({ ok: true });
}
