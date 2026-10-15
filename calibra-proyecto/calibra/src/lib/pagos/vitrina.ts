import { PRODUCTOS } from "./productos";
import type { ProductoComprable } from "./tipos";

// Cómo se presentan los productos con dinero real (2026-10-14, rediseño de pagos):
// cuánto extra trae cada paquete frente al más chico de su tipo, cuál es el más
// elegido y cuál el de mejor valor, y el ahorro del plan anual. Lo usan la web y la app
// para mostrar lo mismo. Los números salen de PRODUCTOS: nunca se inventan.

export const PAQUETES_CHISPAS: ProductoComprable[] = ["chispas_1000", "chispas_2500", "chispas_6000", "chispas_15000"];
export const PAQUETES_COMETAS: ProductoComprable[] = ["cometas_100", "cometas_550", "cometas_1200", "cometas_2600", "cometas_7000"];

export const MAS_ELEGIDO: ReadonlySet<ProductoComprable> = new Set(["chispas_6000", "cometas_1200"]);

function monto(p: ProductoComprable): number {
  const d = PRODUCTOS[p];
  return d.montoCometas ?? d.montoChispas ?? 0;
}

function porDolar(p: ProductoComprable): number {
  return monto(p) / PRODUCTOS[p].precioUsd;
}

// % de moneda extra por dólar frente al paquete más chico del mismo tipo, redondeado
// hacia abajo (nunca se promete de más). 0 para el paquete base.
export function bonoPorcentaje(p: ProductoComprable): number {
  const lista = PRODUCTOS[p].tipo === "cometas" ? PAQUETES_COMETAS : PRODUCTOS[p].tipo === "chispas" ? PAQUETES_CHISPAS : null;
  if (!lista) return 0;
  const base = porDolar(lista[0]);
  return Math.max(0, Math.floor((porDolar(p) / base - 1) * 100));
}

// El paquete que más da por dólar dentro de la lista.
export function mejorValor(lista: ProductoComprable[]): ProductoComprable | null {
  let mejor: ProductoComprable | null = null;
  for (const p of lista) if (!mejor || porDolar(p) > porDolar(mejor)) mejor = p;
  return mejor;
}

// Plan anual frente a 12 meses del mensual.
export function ahorroAnual(): { usd: number; porcentaje: number; porMes: number } {
  const mensual = PRODUCTOS.pro_mensual.precioUsd;
  const anual = PRODUCTOS.pro_anual.precioUsd;
  const usd = Math.round((mensual * 12 - anual) * 100) / 100;
  return { usd, porcentaje: Math.floor((usd / (mensual * 12)) * 100), porMes: Math.floor((anual / 12) * 100) / 100 };
}

export function precioTexto(usd: number): string {
  return `US$${usd.toFixed(2)}`;
}

// ---------- Paquetes de cosméticos con dinero (0287) ----------
// Precio en dólares de un paquete según su precio en Chispas (PLAN_ECONOMIA.md §4.3:
// US$1,99–6,99).
export function precioUsdPaquete(precioChispas: number): number {
  if (precioChispas <= 3000) return 1.99;
  if (precioChispas <= 4500) return 2.99;
  if (precioChispas <= 6000) return 3.99;
  if (precioChispas <= 8000) return 4.99;
  if (precioChispas <= 10000) return 5.99;
  return 6.99;
}

// Si ya tienes parte del paquete pagas la fracción (en valor) de lo que te falta,
// redondeada hacia arriba a ,99 y nunca menos de US$0,99. La fracción la da la base
// (precios_paquetes_para_mi), igual que para el precio en Chispas.
export function precioUsdParcial(completo: number, fraccion: number): number {
  if (fraccion >= 1) return completo;
  if (fraccion <= 0) return 0;
  const crudo = completo * fraccion;
  return Math.min(completo, Math.max(0.99, Math.ceil(crudo) - 0.01));
}
