// Ilustraciones de los paquetes de la tienda (2026-10-14): cada paquete tiene su
// dibujo propio en vez del emoji de regalo. Son datos (viewBox 64 × 64) que dibujan
// igual la web (components/tienda/IlustracionPaquete.tsx) y la app
// (mobile/src/ui/recompensas/IlustracionPaquete.tsx).

export interface FormaIlustracion {
  d: string;
  relleno?: string;
  trazo?: string;
  ancho?: number;
  opacidad?: number;
}

export interface Ilustracion {
  // Degradé del fondo, de arriba a la izquierda hacia abajo a la derecha.
  fondo: [string, string];
  // Brillo detrás del motivo principal.
  halo: string;
  formas: FormaIlustracion[];
}

// Estrella de 4 puntas centrada en (x, y).
function estrella(x: number, y: number, r: number): string {
  const k = r * 0.28;
  return `M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}z`;
}

function circulo(x: number, y: number, r: number): string {
  return `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`;
}

const BLANCO = "#FFFFFF";

export const ILUSTRACIONES: Record<string, Ilustracion> = {
  pack_noche: {
    fondo: ["#120B38", "#3B2C8F"],
    halo: "#9B85FF",
    formas: [
      { d: "M0 50Q14 42 30 48T64 45V64H0z", relleno: "#0B0726" },
      { d: "M38 12a15 15 0 1 0 12 26 12 12 0 1 1-12-26z", relleno: "#F4E4C1" },
      { d: estrella(14, 16, 4), relleno: BLANCO },
      { d: estrella(22, 34, 2.5), relleno: BLANCO, opacidad: 0.8 },
      { d: estrella(54, 10, 2.5), relleno: "#C9BDFF" },
      { d: circulo(9, 28, 1), relleno: BLANCO, opacidad: 0.7 },
      { d: circulo(30, 8, 1), relleno: BLANCO, opacidad: 0.7 },
    ],
  },
  pack_fuego: {
    fondo: ["#5A1A06", "#E2622A"],
    halo: "#FFC53D",
    formas: [
      { d: "M32 6c3 9 15 13 15 28a15 15 0 0 1-30 0c0-8 4-12 7.5-15 .6 5.5 3 8.5 6.5 9.5-2-7.5-2-15 1-22.5z", relleno: "#FFC53D" },
      { d: "M32 29c1.5 4.2 6.5 6.5 6.5 12a6.5 6.5 0 0 1-13 0c0-3.4 2.2-5.4 3.8-7 .3 1.8 1.1 2.9 2.6 3.3-.6-2.7-.6-5.5.1-8.3z", relleno: "#FFF3C4" },
      { d: circulo(14, 18, 1.6), relleno: "#FFD36B" },
      { d: circulo(50, 14, 1.2), relleno: "#FFD36B" },
      { d: circulo(52, 30, 1.8), relleno: "#FFB627", opacidad: 0.8 },
      { d: estrella(12, 40, 3), relleno: "#FFF3C4" },
    ],
  },
  pack_sonidos: {
    fondo: ["#08201E", "#0E9F8E"],
    halo: "#2DD4BF",
    formas: [
      { d: "M27 44V15l20-5v29", trazo: BLANCO, ancho: 3.5 },
      { d: "M27 15l20-5v7l-20 5z", relleno: BLANCO },
      { d: circulo(21.5, 44, 6), relleno: BLANCO },
      { d: circulo(41.5, 39, 6), relleno: BLANCO },
      { d: "M10 22a12 12 0 0 0 0 18M5 17a19 19 0 0 0 0 28", trazo: "#7FF0E0", ancho: 2.5 },
      { d: "M55 48a8 8 0 0 0 0-12", trazo: "#7FF0E0", ancho: 2.5 },
    ],
  },
  pack_emotes: {
    fondo: ["#3A0F16", "#D9434E"],
    halo: "#FF8A8A",
    formas: [
      { d: "M10 10h30a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H22l-8 7v-7h-4a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z", relleno: BLANCO },
      { d: circulo(18, 21, 2.2), relleno: "#3A0F16" },
      { d: circulo(32, 21, 2.2), relleno: "#3A0F16" },
      { d: "M17 27q8 6 16 0", trazo: "#3A0F16", ancho: 2.5 },
      { d: "M40 36h14a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-2v5l-6-5h-6a5 5 0 0 1-5-5v-8a5 5 0 0 1 5-5z", relleno: "#FFC53D" },
      { d: "M42 45h10M47 40v10", trazo: "#5A3A06", ancho: 2.5 },
    ],
  },
  pack_galaxia: {
    fondo: ["#05061A", "#3B2C8F"],
    halo: "#9B85FF",
    formas: [
      { d: "M32 32c0-5 7-7 10.5-3s1 12.5-7 13.5-16-5-15-14.5 9-15.5 18-13.5", trazo: "#C9BDFF", ancho: 3 },
      { d: "M32 32c0 5-7 7-10.5 3s-1-12.5 7-13.5 16 5 15 14.5-9 15.5-18 13.5", trazo: "#7FD8FF", ancho: 3 },
      { d: circulo(32, 32, 4.5), relleno: BLANCO },
      { d: estrella(10, 12, 3), relleno: BLANCO },
      { d: estrella(54, 52, 3), relleno: "#FFD36B" },
      { d: circulo(52, 12, 1.2), relleno: BLANCO },
      { d: circulo(12, 52, 1.2), relleno: BLANCO },
    ],
  },
  pack_volcan: {
    fondo: ["#1F0805", "#7A1F2B"],
    halo: "#FF6A2B",
    formas: [
      { d: "M4 60L23 27h18l19 33z", relleno: "#3D1A10" },
      { d: "M23 27h18l-3.5 9-4-3.5-3 6.5-3-6.5-3 3z", relleno: "#FF6A2B" },
      { d: "M29 22c-3-4 0-9 3-11 3 2 6 7 3 11", relleno: "#FFC53D" },
      { d: circulo(20, 14, 2.4), relleno: "#FFB627" },
      { d: circulo(45, 10, 2), relleno: "#FF8A3D" },
      { d: circulo(40, 18, 1.4), relleno: "#FFD36B" },
      { d: "M14 44l6-3M48 46l-5-3", trazo: "#FF6A2B", ancho: 2 },
    ],
  },
  pack_invierno: {
    fondo: ["#0B2A4A", "#3FA7D6"],
    halo: "#BDEBFF",
    formas: [
      { d: "M0 58L18 30l12 15 12-21 22 34z", relleno: "#E8F6FF" },
      { d: "M18 30l5 6.5-4 1.5-5-2zM42 24l6 9-5 1-4-4z", relleno: "#9FD6F0" },
      { d: "M48 6v16M41 10l14 8M55 10l-14 8", trazo: BLANCO, ancho: 2.2 },
      { d: circulo(12, 14, 1.4), relleno: BLANCO },
      { d: circulo(24, 8, 1), relleno: BLANCO },
      { d: circulo(30, 18, 1.2), relleno: BLANCO, opacidad: 0.8 },
    ],
  },
  pack_sonidos_2: {
    fondo: ["#140F33", "#2B6CB0"],
    halo: "#2DD4BF",
    formas: [
      { d: "M8 48v-8M17 48V28M26 48V18M35 48V24M44 48V14M53 48v-14", trazo: BLANCO, ancho: 5 },
      { d: "M6 54h52", trazo: "#7FF0E0", ancho: 2 },
      { d: estrella(54, 10, 3.5), relleno: "#FFD36B" },
    ],
  },
  pack_emotes_2: {
    fondo: ["#3A2606", "#E09A1A"],
    halo: "#FFD36B",
    formas: [
      { d: "M32 6c8 6 10.5 18 8.5 30h-17C21.5 24 24 12 32 6z", relleno: BLANCO },
      { d: circulo(32, 20, 4), relleno: "#3B2C8F" },
      { d: "M23.5 30L17 40l7 1zM40.5 30L47 40l-7 1z", relleno: "#FF5D5D" },
      { d: "M27 38c0 7 5 12 5 16 0-4 5-9 5-16z", relleno: "#FF8A3D" },
      { d: estrella(12, 14, 3), relleno: BLANCO },
      { d: estrella(52, 48, 3.5), relleno: "#FFF3C4" },
    ],
  },
  pack_neon_total: {
    fondo: ["#0A0418", "#4A0E5C"],
    halo: "#FF3DD6",
    formas: [
      { d: "M0 50h64M8 64l10-14M24 64l4-14M40 64l-4-14M56 64L46 50", trazo: "#7A2BFF", ancho: 1.5, opacidad: 0.8 },
      { d: "M6 50V30h9v20M18 50V18h10v32M31 50V26h8v24M42 50V12h11v38M55 50V32h6v18", trazo: "#FF3DD6", ancho: 2.2 },
      { d: "M21 24h4M21 30h4M45 18h5M45 24h5M45 30h5M33 32h4", trazo: "#5DE4FF", ancho: 2 },
      { d: circulo(54, 8, 3), relleno: "#5DE4FF" },
    ],
  },
};

// Paquetes nuevos que todavía no tengan dibujo: una caja con moño.
export const ILUSTRACION_GENERICA: Ilustracion = {
  fondo: ["#1B1440", "#6C4CF1"],
  halo: "#FFC53D",
  formas: [
    { d: "M12 28h40v28H12z", relleno: "#FFC53D" },
    { d: "M9 20h46v9H9z", relleno: "#FFD36B" },
    { d: "M28 20h8v36h-8z", relleno: "#FF5D5D" },
    { d: "M32 20c-4-9-13-8-11-3 1.5 3 11 3 11 3zM32 20c4-9 13-8 11-3-1.5 3-11 3-11 3z", trazo: "#FF5D5D", ancho: 3 },
  ],
};

export function ilustracionPaquete(item: string): Ilustracion {
  return ILUSTRACIONES[item] ?? ILUSTRACION_GENERICA;
}
