import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { crearCheckout } from "@/lib/pagos/servicio";
import { PRODUCTOS } from "@/lib/pagos/productos";
import type { DetalleCheckout, Proveedor, ProductoComprable } from "@/lib/pagos/tipos";
import { esMundoPago } from "@/lib/mundos/precios";
import { PAQUETES } from "@/lib/recompensas/catalogo";
import { precioUsdPaquete, precioUsdParcial } from "@/lib/pagos/vitrina";

interface Body {
  producto: string;
  proveedor: string;
  // Mundo suelto y paquetes (0287): qué mundo o qué paquete.
  mundo?: string;
  paquete?: string;
}

// Solo Paddle (2026-10-12). Mercado Pago se dejó de lado: su adaptador sigue en lib/pagos sin uso.
const PROVEEDORES_VALIDOS: Proveedor[] = ["paddle"];

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

  // Mundo suelto y paquetes: el precio se calcula acá, con lo que la cuenta ya tiene.
  let detalle: DetalleCheckout | undefined;
  if (producto === "mundo_suelto") {
    const mundo = body.mundo ?? "";
    if (!esMundoPago(mundo)) return NextResponse.json({ error: "Mundo inválido" }, { status: 400 });
    const { data: perfil } = await supabase.from("profiles").select("mundos_desbloqueados").eq("id", user.id).single();
    if ((perfil?.mundos_desbloqueados as string[] | null)?.includes(mundo)) return NextResponse.json({ error: "Ya tienes ese mundo" }, { status: 400 });
    detalle = { mundo, precioUsd: PRODUCTOS.mundo_suelto.precioUsd, descripcion: `Mundo ${mundo.charAt(0).toUpperCase()}${mundo.slice(1)}` };
  } else if (producto === "paquete_cosmetico") {
    const paquete = PAQUETES.find((p) => p.item === body.paquete);
    if (!paquete) return NextResponse.json({ error: "Paquete inválido" }, { status: 400 });
    const { data: precios, error } = await supabase.rpc("precios_paquetes_para_mi");
    if (error) return NextResponse.json({ error: "No se pudo calcular el precio" }, { status: 503 });
    const fila = (precios as { slug: string; precio: number; fraccion: number | null }[] | null)?.find((f) => f.slug === paquete.item);
    if (!fila || fila.fraccion == null) return NextResponse.json({ error: "Paquete inválido" }, { status: 400 });
    const usd = precioUsdParcial(precioUsdPaquete(fila.precio), Number(fila.fraccion));
    if (usd <= 0) return NextResponse.json({ error: "Ya tienes todo lo de este paquete" }, { status: 400 });
    detalle = { paquete: paquete.item, precioUsd: usd, descripcion: paquete.nombre };
  }

  try {
    const resultado = await crearCheckout(user.id, producto, proveedor, detalle);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("[api:pagos/checkout]", error);
    const mensaje = error instanceof Error ? error.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: mensaje }, { status: 503 });
  }
}
