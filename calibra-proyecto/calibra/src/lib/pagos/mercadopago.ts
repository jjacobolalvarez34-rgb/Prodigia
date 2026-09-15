import type { AdaptadorPago } from "./adapter";

// Fase 2 del plan de pagos (pendiente): todavía no hay credenciales de
// Mercado Pago (access token de sandbox). Los 3 métodos ya están
// definidos con la forma final para que servicio.ts y las rutas de
// checkout/webhook compilen contra el contrato completo — implementar
// el cuerpo real es la Fase 2:
//   - crearCheckout: Orders API (recomendada por Mercado Pago para
//     integraciones nuevas de Checkout Pro, no las APIs viejas).
//   - verificarFirma: header `x-signature` (HMAC-SHA256 con el
//     webhook secret del dashboard de Mercado Pago).
//   - normalizarEvento: el webhook de MP típicamente solo trae un ID —
//     hay que reconsultar el pago server-to-server contra la API de
//     Mercado Pago antes de confiar en su estado (nunca confiar en el
//     body del webhook a ciegas).
const NO_IMPLEMENTADO = "Mercado Pago todavía no está conectado (Fase 2 del plan de pagos) — falta MERCADOPAGO_ACCESS_TOKEN.";

export const mercadoPagoAdapter: AdaptadorPago = {
  async crearCheckout() {
    throw new Error(NO_IMPLEMENTADO);
  },
  verificarFirma() {
    throw new Error(NO_IMPLEMENTADO);
  },
  async normalizarEvento() {
    throw new Error(NO_IMPLEMENTADO);
  },
};
