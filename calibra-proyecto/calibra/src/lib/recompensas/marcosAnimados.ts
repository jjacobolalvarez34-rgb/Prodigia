// Marcos animados (aprobados el 2026-11-05, docs/rediseno/marcos-animados.html): una
// imagen WebP animada con transparencia que va encima del avatar y lo rodea (1,6 veces
// su tamaño). Se fabrican con scripts/marcos (marcos.js + render.mjs) y viven en
// public/marcos/<archivo>.webp (animado) y .png (quieto: listas chicas y
// «Animaciones livianas»). Web y app usan los mismos archivos.

export type RarezaMarcoAnimado = "raro" | "epico" | "legendario";

export interface MarcoAnimado {
  slug: string;
  archivo: string;
  nombre: string;
  rareza: RarezaMarcoAnimado;
  precio: number;
  color: string;
}

export const MARCOS_ANIMADOS: MarcoAnimado[] = [
  { slug: "animado_fenix", archivo: "fenix", nombre: "Fénix vivo", rareza: "legendario", precio: 6500, color: "#FF7A1F" },
  { slug: "animado_corona", archivo: "corona", nombre: "Corona", rareza: "legendario", precio: 6500, color: "#FFC53D" },
  { slug: "animado_escarcha", archivo: "escarcha", nombre: "Escarcha", rareza: "epico", precio: 3400, color: "#9BE3FF" },
  { slug: "animado_tormenta", archivo: "tormenta", nombre: "Tormenta", rareza: "epico", precio: 3400, color: "#6FB8FF" },
  { slug: "animado_orbita", archivo: "orbita", nombre: "Órbita", rareza: "epico", precio: 3400, color: "#9C7CFF" },
  { slug: "animado_glitch", archivo: "glitch", nombre: "Glitch", rareza: "epico", precio: 3400, color: "#FF2E8C" },
  { slug: "animado_enredadera", archivo: "enredadera", nombre: "Enredadera", rareza: "raro", precio: 2000, color: "#5FBF4A" },
  { slug: "animado_marea", archivo: "marea", nombre: "Marea", rareza: "raro", precio: 2000, color: "#2E9BE0" },
];

// El marco mide esto respecto del avatar (el lienzo es de 512 con el avatar de 320).
export const ESCALA_MARCO_ANIMADO = 1.6;

// Debajo de este tamaño de avatar (px) se usa la imagen quieta: en filas de amigos, chat
// o rankings no tiene sentido tener decenas de animaciones a la vez.
export const TAM_MIN_ANIMADO = 44;

export function marcoAnimadoDe(slug: string | null | undefined): MarcoAnimado | null {
  if (!slug) return null;
  return MARCOS_ANIMADOS.find((m) => m.slug === slug) ?? null;
}

// Ruta de la imagen (relativa a la web; la app le antepone el origen).
export function rutaMarcoAnimado(m: MarcoAnimado, animado: boolean): string {
  return `/marcos/${m.archivo}.${animado ? "webp" : "png"}`;
}
