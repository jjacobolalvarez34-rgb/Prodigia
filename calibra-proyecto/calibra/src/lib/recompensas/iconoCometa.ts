// El Cometa, moneda premium (2026-10-13): dibujo propio, sin emoji. Cabeza celeste
// brillante y una cola curva que va del celeste al violeta de Prodigia y se
// desvanece. Se distingue a primera vista de la Chispa (rayo dorado). Solo
// geometría y colores (viewBox 0 0 32 32): la web lo dibuja con <svg> y la app con
// react-native-svg, igual que las insignias de rango.

export const COLOR_COMETA = "#5DE4FF";
export const COLOR_COMETA_PROFUNDO = "#2AA8D8";

export const COMETA = {
  colaGrande: "M21.5 6.2C14.5 9.5 8 17 3 29C10 23 17.5 18.5 26.2 13.6Z",
  colaChica: "M26.5 9.5C22 14.5 17.5 21.5 13.5 29C18 24.5 23 19 27.8 12.6Z",
  cabeza: { cx: 24.5, cy: 9.5, r: 4.7 },
  halo: { cx: 24.5, cy: 9.5, r: 7 },
  reflejo: { cx: 22.9, cy: 7.9, r: 1.4 },
  destello: "M29 1.2L29.7 3.3L31.8 4L29.7 4.7L29 6.8L28.3 4.7L26.2 4L28.3 3.3Z",
  // Degradé de la cola: desde la cabeza hacia la punta.
  cola: [
    { offset: 0, color: COLOR_COMETA, opacidad: 1 },
    { offset: 0.5, color: "#7C5CFF", opacidad: 0.85 },
    { offset: 1, color: "#7C5CFF", opacidad: 0 },
  ],
  // Degradé radial de la cabeza: centro blanco, borde celeste profundo.
  nucleo: [
    { offset: 0, color: "#FFFFFF" },
    { offset: 0.45, color: "#BFF6FF" },
    { offset: 1, color: COLOR_COMETA_PROFUNDO },
  ],
} as const;
