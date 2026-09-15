// Interruptor único para la UI de pagos reales (Comprar Chispas en la
// Tienda, suscribirse en /pro). Apagado a propósito (2026-09-14, pedido
// explícito del propietario: "ya que ninguno de los métodos de pago
// está sirviendo, desactiva eso, que no se vea aún") — Mercado Pago no
// está conectado y Paddle todavía no tiene los price_id configurados,
// así que mostrar los botones reales a usuarios de verdad los manda a
// un checkout que no funciona. Cuando los dos proveedores estén
// probados de punta a punta, este flag es el único lugar que hay que
// tocar para volver a mostrar la UI real (no hay que deshacer nada más
// — el resto del código de Fundación/Fase 4/5 queda intacto).
export const PAGOS_REALES_HABILITADOS = false;
