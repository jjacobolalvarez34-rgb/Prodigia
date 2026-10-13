// Interruptor de la UI de pagos reales (Comprar Chispas en la Tienda, suscribirse en
// /pro). Historia: apagado a mano desde 2026-09-14 (los proveedores no estaban
// conectados); el 2026-10-12 pasó a una variable de entorno para probar el sandbox
// de Paddle.
//
// Se lee en el servidor en cada visita, NO al compilar: así prender o apagar los
// cobros en Vercel funciona con solo cambiar la variable (sin depender de la caché
// de la compilación). Por eso el acceso es con una clave dinámica: Next reemplaza
// `process.env.NEXT_PUBLIC_…` escrito literal por su valor al compilar.
// Valor "1" = se ven los botones. Acepta PAGOS_HABILITADOS o NEXT_PUBLIC_PAGOS_HABILITADOS.
export function pagosHabilitados(): boolean {
  const env: Record<string, string | undefined> = process.env;
  const valor = env["PAGOS_HABILITADOS"] ?? env["NEXT_PUBLIC_PAGOS_HABILITADOS"];
  return (valor ?? "").trim() === "1";
}
