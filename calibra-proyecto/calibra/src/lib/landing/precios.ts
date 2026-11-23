import { PRODUCTOS } from "@/lib/pagos/productos";

// Precios que muestra la presentación (LandingPublica), sacados del catálogo real.
export function preciosPresentacion(locale = "es") {
  const f = (n: number) => n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const mensual = PRODUCTOS.pro_mensual.precioUsd;
  const anual = PRODUCTOS.pro_anual.precioUsd;
  const sueltos = Object.values(PRODUCTOS)
    .filter((p) => (p.tipo === "chispas" || p.tipo === "cometas") && p.precioUsd > 0)
    .map((p) => p.precioUsd);
  return {
    mensual: f(mensual),
    anual: f(anual),
    ahorro: Math.round((1 - anual / (mensual * 12)) * 100),
    mundo: f(PRODUCTOS.mundo_suelto.precioUsd),
    minimo: f(Math.min(...sueltos)),
  };
}
