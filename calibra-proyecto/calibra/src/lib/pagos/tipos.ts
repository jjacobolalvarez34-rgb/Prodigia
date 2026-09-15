// Payment Service — tipos compartidos entre proveedores (Mercado Pago,
// Paddle y, a futuro, Google Play Billing — ver Fase 7 del plan). El
// resto de la app SOLO debería importar de src/lib/pagos/servicio.ts;
// estos tipos son el contrato interno entre la fachada y cada adapter
// (mercadopago.ts/paddle.ts), nunca se exponen tal cual al cliente.

export type Proveedor = "mercadopago" | "paddle";

export type IntervaloPlan = "mensual" | "anual";

export type EstadoSuscripcion = "active" | "trialing" | "past_due" | "canceled" | "expired";

// Motivo de una actualización de suscripción — decide si
// aplicar_suscripcion() acredita las Chispas mensuales de Pro
// ('activacion'/'renovacion' sí, 'actualizacion'/'cancelacion' no).
export type MotivoSuscripcion = "activacion" | "renovacion" | "actualizacion" | "cancelacion";

// Catálogo de productos comprables — ver productos.ts para los valores
// reales. "chispas_*" son packs de Chispas con dinero real, separados
// del catálogo de gameplay (src/lib/tienda/costos.ts).
export type ProductoComprable = "pro_mensual" | "pro_anual" | "chispas_1000" | "chispas_2500" | "chispas_6000" | "chispas_15000";

export interface DefinicionProducto {
  id: ProductoComprable;
  tipo: "suscripcion" | "chispas";
  intervalo?: IntervaloPlan; // solo si tipo === "suscripcion"
  montoChispas?: number; // solo si tipo === "chispas"
  precioUsd: number; // referencia para mostrar en la UI antes del checkout
}

// Resultado de crear un checkout — las dos formas reales que puede
// tomar: un link al que redirigir (Mercado Pago) o un token corto para
// abrir el overlay de Paddle.js en el cliente (Paddle Billing no usa
// links de redirect simples).
export type ResultadoCheckout = { tipo: "redirect"; url: string } | { tipo: "overlay"; transactionId: string };

// Evento de webhook ya normalizado, después de que cada adapter
// entiende el payload crudo de SU proveedor — esto es lo único que le
// llega a la capa que aplica los cambios en la base de datos, así esa
// capa nunca necesita saber si vino de Mercado Pago o de Paddle.
export type EventoWebhookNormalizado =
  | {
      tipo: "suscripcion";
      motivo: MotivoSuscripcion;
      userId: string;
      providerSubscriptionId: string;
      providerCustomerId: string | null;
      estado: EstadoSuscripcion;
      intervalo: IntervaloPlan;
      periodoFin: string | null; // ISO timestamp
      cancelaAlFinDePeriodo: boolean;
    }
  | {
      tipo: "compra_chispas";
      userId: string;
      providerTransactionId: string;
      montoChispas: number;
      montoPagadoCentavos: number;
      moneda: string;
    };
