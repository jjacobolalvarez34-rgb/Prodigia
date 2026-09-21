import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { crearCheckout } from "@/lib/pagos/servicio";
import { PRODUCTOS } from "@/lib/pagos/productos";
import type { Proveedor, ProductoComprable } from "@/lib/pagos/tipos";

interface Body {
  producto: string;
  proveedor: string;
}

const PROVEEDORES_VALIDOS: Proveedor[] = ["mercadopago", "paddle"];

// Única ruta que arranca un checkout real — nunca decide nada de
// entitlements por sí misma (eso pasa solo en los webhooks, ver
// src/lib/pagos/servicio.ts#aplicarEventoWebhook). Si el proveedor
// todavía no está conectado (Fase 2/3 del plan de pagos pendientes),
// el adapter tira un Error claro que acá se traduce en un 503 legible
// en vez de un 500 genérico.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  // Un invitado (signInAnonymously) no puede comprar Pro ni nada con plata
  // real: no hay cuenta a la que atar el entitlement. La UI ya lo bloquea
  // (/pro está en rutasInvitado.ts); esto cubre pegarle directo a la API.
  if (user.is_anonymous) return NextResponse.json({ error: "Necesitas una cuenta real para comprar" }, { status: 403 });

  const body = (await request.json()) as Body;
  const producto = body.producto as ProductoComprable;
  const proveedor = body.proveedor as Proveedor;

  if (!(producto in PRODUCTOS)) {
    return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
  }
  if (!PROVEEDORES_VALIDOS.includes(proveedor)) {
    return NextResponse.json({ error: "Proveedor inválido" }, { status: 400 });
  }

  try {
    const resultado = await crearCheckout(user.id, producto, proveedor);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("[api:pagos/checkout]", error);
    const mensaje = error instanceof Error ? error.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: mensaje }, { status: 503 });
  }
}
