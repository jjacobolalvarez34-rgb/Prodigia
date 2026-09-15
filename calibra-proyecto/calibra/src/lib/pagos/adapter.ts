import type { EventoWebhookNormalizado, ProductoComprable, ResultadoCheckout } from "./tipos";

// Contrato que cada proveedor (Mercado Pago, Paddle, a futuro Google
// Play Billing) tiene que cumplir — servicio.ts solo habla con esto,
// nunca con el SDK de un proveedor directamente. Agregar un proveedor
// nuevo es escribir un archivo que implemente esta interfaz, nunca
// tocar servicio.ts ni las rutas de checkout/webhook.
export interface AdaptadorPago {
  // Crea el checkout para un producto del catálogo (productos.ts) y
  // devuelve dónde/cómo continuar — un link de redirect o un token de
  // overlay, según lo que use el proveedor.
  crearCheckout(userId: string, producto: ProductoComprable): Promise<ResultadoCheckout>;

  // Verifica que el POST del webhook realmente vino del proveedor
  // (HMAC u otro mecanismo de firma) ANTES de leer una sola línea del
  // body como si fuera confiable.
  verificarFirma(headers: Headers, rawBody: string): Promise<boolean> | boolean;

  // Traduce el payload crudo del proveedor a la forma común que
  // aplicarEventoWebhook() sabe procesar. Devuelve null si es un tipo
  // de evento que no nos interesa (la ruta debe igual responder 200).
  normalizarEvento(rawBody: string, parsedBody: unknown): Promise<EventoWebhookNormalizado | null>;
}
