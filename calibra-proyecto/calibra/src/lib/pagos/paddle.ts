import { createHmac, timingSafeEqual } from "node:crypto";
import type { AdaptadorPago } from "./adapter";
import type { EventoWebhookNormalizado, EstadoSuscripcion, IntervaloPlan, MotivoSuscripcion, ProductoComprable } from "./tipos";
import { definicionDe } from "./productos";

// Fase 3 del plan de pagos: Paddle Billing (no Paddle Classic — no usa
// vendor_id, se autentica con Bearer token). Cuenta sandbox del
// propietario, base URL elegida automáticamente según el prefijo de la
// API key (pdl_sdbx_... = sandbox, pdl_live_... = producción) para no
// necesitar una variable de entorno aparte que se pueda desincronizar
// de la key real.
function apiKey(): string {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("Falta PADDLE_API_KEY en las variables de entorno del servidor.");
  return key;
}

function baseUrl(): string {
  return apiKey().startsWith("pdl_sdbx_") ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";
}

// Cada producto de src/lib/pagos/productos.ts necesita un price_id real
// creado a mano en el Catalog del dashboard de Paddle (Paddle Billing no
// tiene forma de crear productos vía API de un solo paso pensada para
// esto) — se resuelve por variable de entorno, nunca hardcodeado.
const ENV_PRICE_ID: Record<ProductoComprable, string | undefined> = {
  pro_mensual: process.env.PADDLE_PRICE_PRO_MENSUAL,
  pro_anual: process.env.PADDLE_PRICE_PRO_ANUAL,
  chispas_1000: process.env.PADDLE_PRICE_CHISPAS_1000,
  chispas_2500: process.env.PADDLE_PRICE_CHISPAS_2500,
  chispas_6000: process.env.PADDLE_PRICE_CHISPAS_6000,
  chispas_15000: process.env.PADDLE_PRICE_CHISPAS_15000,
};

function priceIdDe(producto: ProductoComprable): string {
  const id = ENV_PRICE_ID[producto];
  if (!id) {
    throw new Error(
      `Falta el price_id de Paddle para "${producto}" — hay que crearlo en Catalog (dashboard de Paddle) y setear la variable de entorno correspondiente.`
    );
  }
  return id;
}

interface RespuestaTransaccion {
  data: { id: string };
}

async function crearCheckout(userId: string, producto: ProductoComprable) {
  const priceId = priceIdDe(producto);
  const res = await fetch(`${baseUrl()}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      custom_data: { userId, producto },
    }),
  });

  if (!res.ok) {
    const cuerpo = await res.text().catch(() => "");
    console.error("[paddle] error creando transacción", res.status, cuerpo);
    throw new Error("No se pudo crear el checkout de Paddle.");
  }

  const data = (await res.json()) as RespuestaTransaccion;
  return { tipo: "overlay" as const, transactionId: data.data.id };
}

// Paddle-Signature: "ts=<segundos>;h1=<hmac>". El hash es
// HMAC-SHA256(secret, `${ts}:${rawBody}`) — se recalcula y se compara
// con timingSafeEqual (nunca con ===, para no filtrar el secreto por
// tiempos de respuesta).
function verificarFirma(headers: Headers, rawBody: string): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[paddle] falta PADDLE_WEBHOOK_SECRET — rechazando webhook");
    return false;
  }
  const firma = headers.get("paddle-signature");
  if (!firma) return false;

  const partes = Object.fromEntries(firma.split(";").map((p) => p.split("=") as [string, string]));
  const ts = partes.ts;
  const h1 = partes.h1;
  if (!ts || !h1) return false;

  const esperado = createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  const bufEsperado = Buffer.from(esperado, "hex");
  const bufRecibido = Buffer.from(h1, "hex");
  if (bufEsperado.length !== bufRecibido.length) return false;
  return timingSafeEqual(bufEsperado, bufRecibido);
}

const ESTADO_PADDLE_A_PROPIO: Record<string, EstadoSuscripcion | undefined> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  paused: "canceled",
  canceled: "canceled",
};

interface EventoPaddle {
  event_id: string;
  event_type: string;
  data: {
    id: string;
    customer_id?: string;
    status?: string;
    custom_data?: { userId?: string; producto?: string } | null;
    billing_cycle?: { interval?: string } | null;
    current_billing_period?: { ends_at?: string } | null;
    scheduled_change?: { action?: string } | null;
    currency_code?: string;
    details?: { totals?: { total?: string } };
  };
}

async function normalizarEvento(_rawBody: string, parsedBody: unknown): Promise<EventoWebhookNormalizado | null> {
  const body = parsedBody as EventoPaddle;
  const tipo = body.event_type;
  const d = body.data;
  const userId = d.custom_data?.userId;

  if (tipo === "subscription.created" || tipo === "subscription.updated") {
    if (!userId) {
      console.error("[paddle] evento de suscripción sin custom_data.userId — se ignora", body.event_id);
      return null;
    }
    const estado = ESTADO_PADDLE_A_PROPIO[d.status ?? ""];
    if (!estado) {
      console.error("[paddle] estado de suscripción desconocido", d.status);
      return null;
    }
    const intervalo: IntervaloPlan = d.billing_cycle?.interval === "year" ? "anual" : "mensual";
    const cancelaAlFinDePeriodo = d.scheduled_change?.action === "cancel";
    const motivo: MotivoSuscripcion =
      tipo === "subscription.created" ? "activacion" : cancelaAlFinDePeriodo ? "cancelacion" : "actualizacion";

    return {
      tipo: "suscripcion",
      motivo,
      userId,
      providerSubscriptionId: d.id,
      providerCustomerId: d.customer_id ?? null,
      estado,
      intervalo,
      periodoFin: d.current_billing_period?.ends_at ?? null,
      cancelaAlFinDePeriodo,
    };
  }

  // subscription.updated cubre renovaciones (Paddle no manda un evento
  // "renewed" separado — cada ciclo nuevo llega como subscription.updated
  // con current_billing_period.ends_at movido hacia adelante). Como
  // aplicar_suscripcion() ya distingue 'activacion'/'renovacion' de
  // 'actualizacion' solo para decidir si acredita Chispas, y acá no hay
  // forma 100% confiable de diferenciar "cambié de tarjeta" de "se
  // renovó" solo con este evento, se usa transaction.completed (abajo)
  // como la señal real de "se cobró de verdad" para acreditar Chispas
  // de Pro en renovaciones — subscription.updated nunca acredita.
  if (tipo === "transaction.completed") {
    if (!userId || !d.custom_data?.producto) return null;
    const producto = d.custom_data.producto as ProductoComprable;
    const def = definicionDe(producto);

    if (def.tipo === "chispas") {
      const centavos = Math.round(parseFloat(d.details?.totals?.total ?? "0") * 1);
      return {
        tipo: "compra_chispas",
        userId,
        providerTransactionId: d.id,
        montoChispas: def.montoChispas ?? 0,
        montoPagadoCentavos: centavos,
        moneda: d.currency_code ?? "USD",
      };
    }

    // Transacción de una suscripción (alta o renovación) — esta es la
    // señal real de "se cobró", así que ACÁ se acredita la Chispas
    // mensual/anual de Pro, no en subscription.updated.
    return {
      tipo: "suscripcion",
      motivo: "renovacion",
      userId,
      providerSubscriptionId: d.id,
      providerCustomerId: d.customer_id ?? null,
      estado: "active",
      intervalo: def.intervalo === "anual" ? "anual" : "mensual",
      periodoFin: null,
      cancelaAlFinDePeriodo: false,
    };
  }

  return null;
}

export const paddleAdapter: AdaptadorPago = {
  crearCheckout,
  verificarFirma,
  normalizarEvento,
};
