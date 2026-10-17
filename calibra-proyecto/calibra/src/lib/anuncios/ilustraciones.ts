import type { Ilustracion } from "@/lib/tienda/ilustracionesPaquetes";

// Dibujo de cada tipo de anuncio (2026-10-16, rediseño de las novedades): mismos datos
// para la web y la app, en vez de emojis.

function estrella(x: number, y: number, r: number): string {
  const k = r * 0.28;
  return `M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}z`;
}

export type TipoAnuncio = "actualizacion" | "arreglo" | "evento";

export const ILUSTRACION_ANUNCIO: Record<TipoAnuncio, Ilustracion> = {
  // Novedad: un cohete que despega entre estrellas.
  actualizacion: {
    fondo: ["#140F33", "#4A33B8"],
    halo: "#9B85FF",
    formas: [
      { d: "M32 8c7 5 9.5 15 8 26H24c-1.5-11 1-21 8-26z", relleno: "#FFFFFF" },
      { d: "M32 16a4.5 4.5 0 1 0 0.01 0z", relleno: "#5DE4FF" },
      { d: "M24 30l-7 9 8 1zM40 30l7 9-8 1z", relleno: "#FF5D8F" },
      { d: "M27 37c0 8 5 14 5 19 0-5 5-11 5-19z", relleno: "#FFC53D" },
      { d: estrella(12, 14, 3.5), relleno: "#FFFFFF" },
      { d: estrella(52, 22, 2.5), relleno: "#C9BDFF" },
      { d: estrella(50, 50, 3), relleno: "#FFD36B" },
    ],
  },
  // Arreglo: llave inglesa sobre un engranaje.
  arreglo: {
    fondo: ["#06231B", "#0E9F6E"],
    halo: "#3DDC97",
    formas: [
      { d: "M32 14l3 5 6-1 1 6 5 3-3 5 3 5-5 3-1 6-6-1-3 5-3-5-6 1-1-6-5-3 3-5-3-5 5-3 1-6 6 1z", relleno: "#0B4A35", trazo: "#7FF0C8", ancho: 1.5 },
      { d: "M32 26a6 6 0 1 0 0.01 0z", relleno: "#06231B" },
      { d: "M43 13a8 8 0 0 0-10 10L18 38a3.5 3.5 0 0 0 5 5l15-15a8 8 0 0 0 10-10l-5 5-4-1-1-4z", relleno: "#FFFFFF" },
    ],
  },
  // Evento: confeti y una estrella grande.
  evento: {
    fondo: ["#3A2606", "#E09A1A"],
    halo: "#FFD36B",
    formas: [
      { d: estrella(32, 30, 15), relleno: "#FFF3C4" },
      { d: "M12 14l5 2-2 5-5-2z", relleno: "#FF5D8F" },
      { d: "M50 12l4 3-3 4-4-3z", relleno: "#5DE4FF" },
      { d: "M10 46l5 1-1 5-5-1z", relleno: "#9B85FF" },
      { d: "M52 46l4 2-2 4-4-2z", relleno: "#3DDC97" },
      { d: "M22 54q10-6 20 0", trazo: "#FFFFFF", ancho: 2.5 },
    ],
  },
};
