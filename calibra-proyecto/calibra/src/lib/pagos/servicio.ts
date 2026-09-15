import { createAdminClient } from "@/lib/supabase/admin";
import { mercadoPagoAdapter } from "./mercadopago";
import { paddleAdapter } from "./paddle";
import type { AdaptadorPago } from "./adapter";
import type { EventoWebhookNormalizado, Proveedor, ProductoComprable, ResultadoCheckout } from "./tipos";

// Payment Service — única puerta de entrada del resto de la app hacia
// los proveedores de pago. Nada fuera de src/lib/pagos/ debería
// importar mercadopago.ts/paddle.ts directamente (con la única
// excepción de las rutas de webhook, que necesitan el adapter
// específico para verificar la firma con SU mecanismo — ver
// src/app/api/webhooks/<proveedor>/route.ts).
const ADAPTERS: Record<Proveedor, AdaptadorPago> = {
  mercadopago: mercadoPagoAdapter,
  paddle: paddleAdapter,
};

export function adaptadorDe(proveedor: Proveedor): AdaptadorPago {
  return ADAPTERS[proveedor];
}

export async function crearCheckout(userId: string, producto: ProductoComprable, proveedor: Proveedor): Promise<ResultadoCheckout> {
  return ADAPTERS[proveedor].crearCheckout(userId, producto);
}

// Único lugar que toca la base de datos para pagos — las rutas de
// webhook llaman esto DESPUÉS de que su adapter ya verificó la firma y
// normalizó el evento (nunca antes). Hace 2 cosas en orden:
//   1) registrar_evento_pago: si el evento ya se procesó antes (mismo
//      provider+event_id), corta ahí — así reintentar el mismo webhook
//      nunca duplica un otorgamiento.
//   2) si es la primera vez, aplica el efecto real (suscripción o
//      Chispas compradas) vía las RPCs security definer de
//      supabase/migrations/0145_infraestructura_pagos.sql.
export async function aplicarEventoWebhook(
  proveedor: Proveedor,
  eventId: string,
  eventType: string,
  rawPayload: unknown,
  evento: EventoWebhookNormalizado | null
): Promise<{ yaProcesado: boolean }> {
  const admin = createAdminClient();

  const { data: esNuevo, error: errorRegistro } = await admin.rpc("registrar_evento_pago", {
    p_provider: proveedor,
    p_event_id: eventId,
    p_event_type: eventType,
    p_raw_payload: rawPayload as object,
  });
  if (errorRegistro) throw errorRegistro;
  if (!esNuevo) return { yaProcesado: true };

  // Evento válido (firma verificada) pero de un tipo que no manejamos
  // todavía (ej. un evento informativo de Paddle) — igual queda
  // registrado en payment_events, pero no hay nada más que aplicar.
  if (!evento) return { yaProcesado: false };

  if (evento.tipo === "suscripcion") {
    const { error } = await admin.rpc("aplicar_suscripcion", {
      p_user_id: evento.userId,
      p_provider: proveedor,
      p_provider_subscription_id: evento.providerSubscriptionId,
      p_provider_customer_id: evento.providerCustomerId,
      p_status: evento.estado,
      p_plan_interval: evento.intervalo,
      p_current_period_end: evento.periodoFin,
      p_cancel_at_period_end: evento.cancelaAlFinDePeriodo,
      p_motivo: evento.motivo,
    });
    if (error) throw error;
  } else {
    const { error } = await admin.rpc("acreditar_chispas_compradas", {
      p_user_id: evento.userId,
      p_provider: proveedor,
      p_provider_transaction_id: evento.providerTransactionId,
      p_monto_chispas: evento.montoChispas,
      p_monto_pagado_centavos: evento.montoPagadoCentavos,
      p_moneda: evento.moneda,
    });
    if (error) throw error;
  }

  return { yaProcesado: false };
}
