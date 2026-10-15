import { createHmac, timingSafeEqual } from "node:crypto";
import type { AdaptadorPago } from "./adapter";
import type { DetalleCheckout, EventoWebhookNormalizado, EstadoSuscripcion, IntervaloPlan, MotivoSuscripcion, ProductoComprable } from "./tipos";
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
const ENV_PRICE_ID: Partial<Record<ProductoComprable, string | undefined>> = {
  pro_mensual: process.env.PADDLE_PRICE_PRO_MENSUAL,
  pro_anual: process.env.PADDLE_PRICE_PRO_ANUAL,
  chispas_1000: process.env.PADDLE_PRICE_CHISPAS_1000,
  chispas_2500: process.env.PADDLE_PRICE_CHISPAS_2500,
  chispas_6000: process.env.PADDLE_PRICE_CHISPAS_6000,
  chispas_15000: process.env.PADDLE_PRICE_CHISPAS_15000,
  cometas_100: process.env.PADDLE_PRICE_COMETAS_100,
  cometas_550: process.env.PADDLE_PRICE_COMETAS_550,
  cometas_1200: process.env.PADDLE_PRICE_COMETAS_1200,
  cometas_2600: process.env.PADDLE_PRICE_COMETAS_2600,
  cometas_7000: process.env.PADDLE_PRICE_COMETAS_7000,
};

// Mundo suelto y paquetes (0287): un solo producto «Contenido de Prodigia» creado en el
// Catalog de Paddle (sin precio); cada compra lleva su precio calculado acá.
function productoContenido(): string | null {
  return process.env.PADDLE_PRODUCT_CONTENIDO?.trim() || null;
}
const PRECIO_CALCULADO: ProductoComprable[] = ["mundo_suelto", "paquete_cosmetico"];

// Productos que se pueden comprar ya: los de precio fijo con price_id cargado, y los de
// precio calculado si existe el producto de contenido.
export function productosConPrecio(): ProductoComprable[] {
  const fijos = (Object.keys(ENV_PRICE_ID) as ProductoComprable[]).filter((p) => !!ENV_PRICE_ID[p]?.trim());
  return productoContenido() ? [...fijos, ...PRECIO_CALCULADO] : fijos;
}

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

async function crearCheckout(userId: string, producto: ProductoComprable, detalle?: DetalleCheckout) {
  let items: unknown[];
  if (PRECIO_CALCULADO.includes(producto)) {
    // Precio fuera del catálogo de Paddle («non-catalog price») sobre el producto de
    // contenido. Lo calcula la ruta de checkout en el servidor, nunca el navegador.
    const productId = productoContenido();
    if (!productId) throw new Error("Falta PADDLE_PRODUCT_CONTENIDO: hay que crear el producto «Contenido de Prodigia» en el Catalog de Paddle.");
    if (!detalle?.precioUsd || detalle.precioUsd <= 0) throw new Error("Falta el precio de la compra.");
    const nombre = detalle.descripcion ?? producto;
    items = [
      {
        quantity: 1,
        price: {
          description: nombre,
          name: nombre,
          product_id: productId,
          unit_price: { amount: String(Math.round(detalle.precioUsd * 100)), currency_code: "USD" },
        },
      },
    ];
  } else {
    items = [{ price_id: priceIdDe(producto), quantity: 1 }];
  }
  const res = await fetch(`${baseUrl()}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
      custom_data: { userId, producto, mundo: detalle?.mundo, paquete: detalle?.paquete },
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
    custom_data?: { userId?: string; producto?: string; mundo?: string; paquete?: string } | null;
    billing_cycle?: { interval?: string } | null;
    current_billing_period?: { ends_at?: string } | null;
    scheduled_change?: { action?: string } | null;
    currency_code?: string;
    details?: { totals?: { total?: string } };
    // transaction.*: a qué suscripción pertenece, el período que cubre y de dónde vino
    // ("subscription_recurring" = renovación automática).
    subscription_id?: string | null;
    billing_period?: { ends_at?: string } | null;
    origin?: string;
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

    if (def.tipo === "mundo") {
      if (!d.custom_data.mundo) return null;
      return { tipo: "compra_mundo", userId, providerTransactionId: d.id, mundo: d.custom_data.mundo };
    }
    if (def.tipo === "paquete") {
      if (!d.custom_data.paquete) return null;
      return { tipo: "compra_paquete", userId, providerTransactionId: d.id, paquete: d.custom_data.paquete };
    }

    if (def.tipo === "cometas") {
      return {
        tipo: "compra_cometas",
        userId,
        providerTransactionId: d.id,
        montoCometas: def.montoCometas ?? 0,
      };
    }

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

    // Transacción de una suscripción. Bug encontrado en la revisión del 2026-10-14: se
    // mandaba el id de la TRANSACCIÓN como si fuera el de la suscripción y sin fecha de
    // fin, así que se creaba una segunda suscripción que nunca vencía, y el primer pago
    // acreditaba las Chispas de Pro dos veces (también subscription.created). Ahora:
    // - el primer cobro no hace nada acá (lo activa subscription.created);
    // - solo las renovaciones automáticas acreditan, sobre la suscripción real y con
    //   el período nuevo.
    if (d.origin !== "subscription_recurring" || !d.subscription_id) return null;
    return {
      tipo: "suscripcion",
      motivo: "renovacion",
      userId,
      providerSubscriptionId: d.subscription_id,
      providerCustomerId: d.customer_id ?? null,
      estado: "active",
      intervalo: def.intervalo === "anual" ? "anual" : "mensual",
      periodoFin: d.billing_period?.ends_at ?? null,
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

// Diagnóstico (2026-10-13, claves cruzadas): pregunta a Paddle por cada price_id y
// dice si corresponde al producto. Pro tiene que ser una suscripción del intervalo
// correcto; Chispas y Cometas, un pago único. También compara el precio en US$.
// Nunca devuelve claves, solo el id del precio y qué está mal.
export async function revisarPrecios(): Promise<Record<string, { priceId: string | null; ok: boolean; problema: string | null }>> {
  const salida: Record<string, { priceId: string | null; ok: boolean; problema: string | null }> = {};
  for (const producto of Object.keys(ENV_PRICE_ID) as ProductoComprable[]) {
    const priceId = ENV_PRICE_ID[producto]?.trim() || null;
    if (!priceId) {
      salida[producto] = { priceId: null, ok: false, problema: "sin configurar" };
      continue;
    }
    const def = definicionDe(producto);
    try {
      const res = await fetch(`${baseUrl()}/prices/${priceId}`, { headers: { Authorization: `Bearer ${apiKey()}` }, cache: "no-store" });
      if (!res.ok) {
        salida[producto] = { priceId, ok: false, problema: `Paddle respondió ${res.status} (¿el precio es de otra cuenta o de producción?)` };
        continue;
      }
      const p = ((await res.json()) as { data: { billing_cycle: { interval: string } | null; unit_price: { amount: string; currency_code: string } } }).data;
      const problemas: string[] = [];
      if (def.tipo === "suscripcion") {
        const esperado = def.intervalo === "anual" ? "year" : "month";
        if (!p.billing_cycle) problemas.push("es un pago único y debería ser una suscripción");
        else if (p.billing_cycle.interval !== esperado) problemas.push(`se cobra cada ${p.billing_cycle.interval} y debería ser cada ${esperado}`);
      } else if (p.billing_cycle) {
        problemas.push("es una suscripción y debería ser un pago único (One-time)");
      }
      const usd = Number(p.unit_price.amount) / 100;
      if (p.unit_price.currency_code === "USD" && Math.abs(usd - def.precioUsd) > 0.005) problemas.push(`cuesta US$${usd.toFixed(2)} y debería costar US$${def.precioUsd.toFixed(2)}`);
      salida[producto] = { priceId, ok: problemas.length === 0, problema: problemas.join("; ") || null };
    } catch {
      salida[producto] = { priceId, ok: false, problema: "no se pudo consultar a Paddle" };
    }
  }
  return salida;
}
