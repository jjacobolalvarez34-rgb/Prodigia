// Mismo criterio determinístico que el reto diario: un item con
// descuento distinto cada día, igual para todos, sin guardar nada en
// la base — se deriva de la fecha tanto en el cliente (para mostrarlo)
// como en el servidor (para cobrar el precio correcto).
const ITEMS_CON_DESCUENTO = [
  "escudo",
  "congelamiento",
  "boost",
  "fuente_mono",
  "fuente_serif",
  "fuente_manuscrita",
  "marco_bronce",
  "marco_plata",
  "marco_oro",
  "marco_platino",
  "marco_diamante",
  "marco_prodigio",
] as const;

function hashFecha(fecha: string): number {
  let h = 0;
  for (let i = 0; i < fecha.length; i++) {
    h = (Math.imul(31, h) + fecha.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export interface DescuentoDelDia {
  item: (typeof ITEMS_CON_DESCUENTO)[number];
  porcentaje: 20 | 30 | 40 | 50;
}

export function obtenerDescuentoDelDia(fechaIso: string): DescuentoDelDia {
  const h = hashFecha(fechaIso);
  const item = ITEMS_CON_DESCUENTO[h % ITEMS_CON_DESCUENTO.length];
  const porcentajes = [20, 30, 40, 50] as const;
  const porcentaje = porcentajes[Math.floor(h / ITEMS_CON_DESCUENTO.length) % porcentajes.length];
  return { item, porcentaje };
}

export function precioConDescuento(costoBase: number, item: string, fechaIso: string): number {
  const { item: itemDelDia, porcentaje } = obtenerDescuentoDelDia(fechaIso);
  if (item !== itemDelDia) return costoBase;
  return Math.round(costoBase * (1 - porcentaje / 100));
}
