// Dibujos compartidos entre la web (SVG) y la app (react-native-svg): una lista
// de formas simples que cada plataforma pinta tal cual. La geometría vive en un
// solo lugar y se ve igual en las dos.
//
// Colores: un hex, o un token del tema que pinta cada plataforma:
//   "texto" (letra principal), "texto2" (secundaria), "borde", "acento".

export type ColorDibujo = string;

export type Primitiva =
  | { t: "elipse"; cx: number; cy: number; rx: number; ry: number; rot?: number; fill?: ColorDibujo; stroke?: ColorDibujo; sw?: number; op?: number; dash?: string }
  | { t: "circulo"; cx: number; cy: number; r: number; fill?: ColorDibujo; stroke?: ColorDibujo; sw?: number; op?: number }
  | { t: "camino"; d: string; fill?: ColorDibujo; stroke?: ColorDibujo; sw?: number; op?: number; dash?: string }
  | { t: "linea"; x1: number; y1: number; x2: number; y2: number; stroke: ColorDibujo; sw?: number; op?: number; dash?: string }
  | { t: "rect"; x: number; y: number; w: number; h: number; r?: number; fill?: ColorDibujo; stroke?: ColorDibujo; sw?: number; op?: number }
  | { t: "texto"; x: number; y: number; s: string; size: number; fill: ColorDibujo; anchor?: "start" | "middle" | "end"; bold?: boolean };

export interface Dibujo {
  ancho: number;
  alto: number;
  prims: Primitiva[];
}

// Punta de flecha (triángulo) en (x2, y2) mirando desde (x1, y1).
export function puntaFlecha(x1: number, y1: number, x2: number, y2: number, largo = 8, ancho = 5): string {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - largo * Math.cos(ang);
  const by = y2 - largo * Math.sin(ang);
  const px = ancho * Math.sin(ang);
  const py = -ancho * Math.cos(ang);
  return `M${r(x2)} ${r(y2)} L${r(bx + px)} ${r(by + py)} L${r(bx - px)} ${r(by - py)} Z`;
}

export function r(n: number): number {
  return Math.round(n * 100) / 100;
}

// Paso "lindo" para marcas de un eje (1, 2, 5, 10, 20, 50…).
export function pasoLindo(rango: number, marcas = 5): number {
  const bruto = rango / marcas;
  const pot = 10 ** Math.floor(Math.log10(Math.max(bruto, 1e-9)));
  for (const m of [1, 2, 5, 10]) if (m * pot >= bruto) return m * pot;
  return 10 * pot;
}
