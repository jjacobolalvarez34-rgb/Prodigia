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
};

export function definicionDe(producto: ProductoComprable): DefinicionProducto {
  return PRODUCTOS[producto];
}
