// Íconos de trazo compartidos por la web y la app (2026-10-14): viewBox 24, trazo 2,
// sin relleno. Reemplazan a los emojis de los beneficios Pro y de las ayudas, así las
// dos plataformas dibujan exactamente lo mismo. La web los pinta con <IconoTrazo/> y la
// app con <IconoTrazo/> de mobile/src/ui/Iconos.tsx.

export interface FormaTrazo {
  d?: string;
  circulos?: [cx: number, cy: number, r: number][];
}

export const TRAZOS = {
  rayo: { d: "M13 2L4 14h7l-1 8 9-12h-7z" },
  mundos: { d: "M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18", circulos: [[12, 12, 9]] },
  cometa: { d: "M13.5 10.5L3 21M10.5 7.5L5 13M16.5 13.5L11 19", circulos: [[16, 8, 4]] },
  capsula: { d: "M6 12V9a6 6 0 0 1 12 0v3M6 12v3a6 6 0 0 0 12 0v-3M4 12h16" },
  sinAnuncios: { d: "M5.6 5.6l12.8 12.8", circulos: [[12, 12, 9]] },
  pincel: { d: "M18.4 2.6a2 2 0 0 1 2.9 2.9L12 14.8 9.2 12zM9 12.2c-2.3 0-4 1.8-4 4 0 1.5-1 2.8-3 3.3 1.3 1.3 3 2 5 2 3 0 5-2.2 5-5z" },
  grafico: { d: "M4 4v16h16M8 16v-4M12 16V8M16 16v-6" },
  cohete: { d: "M12 2c4 3 5.5 8 4.5 13h-9C6.5 10 8 5 12 2zM7.5 15L5 18.5l3 .5M16.5 15l2.5 3.5-3 .5M10 19.5l2 2.5 2-2.5", circulos: [[12, 9, 1.8]] },
  birrete: { d: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6" },
  bombilla: { d: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" },
  repetir: { d: "M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" },
  copo: { d: "M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M9 4l3 2 3-2M9 20l3-2 3 2" },
  escudo: { d: "M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" },
  reloj: { d: "M12 9v4l2.5 2.5M9 2h6", circulos: [[12, 13, 8]] },
  mochila: { d: "M6 9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6M6 13h12M10 13v3h4v-3" },
  tienda: { d: "M4 9h16l-1.2 10.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8zM8 9V7a4 4 0 0 1 8 0v2" },
  check: { d: "M5 12.5l4.5 4.5L19 7.5" },
  candado: { d: "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z" },
  regalo: { d: "M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7C10 3 6.5 4 7.5 6.5 8.2 7.5 12 7 12 7zM12 7c2-4 5.5-3 4.5-.5-.7 1-4.5.5-4.5.5z" },
  corona: { d: "M3 8l4 4 5-7 5 7 4-4-2 11H5z" },
  destello: { d: "M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" },
} satisfies Record<string, FormaTrazo>;

export type NombreTrazo = keyof typeof TRAZOS;

export function trazo(nombre: NombreTrazo): FormaTrazo {
  return TRAZOS[nombre];
}
