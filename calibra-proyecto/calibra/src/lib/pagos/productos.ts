import type { DefinicionProducto, ProductoComprable } from "./tipos";

// Catálogo único de productos comprables con dinero real — fuente de
// verdad para precio y forma de cada producto, igual que
// src/lib/tienda/costos.ts lo es para el catálogo de Chispas
// (gameplay). Los precios son una hipótesis inicial de prueba (mismo
// criterio que docs/plan_negocio_prodigia_v1.md: "no es una promesa ni
// un precio definitivo"), no un compromiso final.
//
// Precios de Pro: los del plan de negocio (US$4.99/mes, US$39.99/año).
// Precios de Chispas: descuento por volumen creciente, calibrado para
// quedar SIEMPRE por encima del costo implícito de las 10.000 Chispas
// mensuales de Pro (~US$0.0005/Chispa) — comprar Chispas sueltas nunca
// debería salir más barato que suscribirse a Pro, o Pro deja de tener
// sentido económico.
export const PRODUCTOS: Record<ProductoComprable, DefinicionProducto> = {
  pro_mensual: { id: "pro_mensual", tipo: "suscripcion", intervalo: "mensual", precioUsd: 4.99 },
  pro_anual: { id: "pro_anual", tipo: "suscripcion", intervalo: "anual", precioUsd: 39.99 },
  chispas_1000: { id: "chispas_1000", tipo: "chispas", montoChispas: 1000, precioUsd: 1.99 },
  chispas_2500: { id: "chispas_2500", tipo: "chispas", montoChispas: 2500, precioUsd: 3.99 },
  chispas_6000: { id: "chispas_6000", tipo: "chispas", montoChispas: 6000, precioUsd: 7.99 },
  chispas_15000: { id: "chispas_15000", tipo: "chispas", montoChispas: 15000, precioUsd: 14.99 },
  // Cometas (2026-10-13, PLAN_ECONOMIA.md §4.3): más volumen, más bonus.
  cometas_100: { id: "cometas_100", tipo: "cometas", montoCometas: 100, precioUsd: 0.99 },
  cometas_550: { id: "cometas_550", tipo: "cometas", montoCometas: 550, precioUsd: 4.99 },
  cometas_1200: { id: "cometas_1200", tipo: "cometas", montoCometas: 1200, precioUsd: 9.99 },
  cometas_2600: { id: "cometas_2600", tipo: "cometas", montoCometas: 2600, precioUsd: 19.99 },
  cometas_7000: { id: "cometas_7000", tipo: "cometas", montoCometas: 7000, precioUsd: 49.99 },
  // 0287 (PLAN_ECONOMIA.md §4.3): un mundo a US$2,99 (o 300 Cometas) y los paquetes de
  // cosméticos con dinero; el precio de cada paquete sale de precioUsdPaquete (vitrina.ts).
  mundo_suelto: { id: "mundo_suelto", tipo: "mundo", precioUsd: 2.99 },
  paquete_cosmetico: { id: "paquete_cosmetico", tipo: "paquete", precioUsd: 0 },
};

export function definicionDe(producto: ProductoComprable): DefinicionProducto {
  return PRODUCTOS[producto];
}
