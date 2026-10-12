import { RANGOS_ELO, rangoDeElo } from "@/types/database";

// Insignia de rango «Torres» (elegida el 2026-10-12, maqueta en
// docs/rediseno/insignias.html): tu rango es una ciudad que crece dentro de un arco.
// Bronce es una casa; Plata, un edificio; Oro, dos con antena; Platino, tres;
// Diamante, un rascacielos de cristal, y Prodigio, el horizonte con luna sobre
// violeta. Cada división enciende más pisos: III un tercio, II dos tercios, I todos.
//
// Esto es solo geometría (viewBox 0 0 100 100): la web la dibuja con <svg> y la app
// con react-native-svg, así las dos se ven idénticas.

export type Pieza =
  | { t: "path"; d: string; fill?: string; stroke?: string; ancho?: number; opacidad?: number }
  | { t: "rect"; x: number; y: number; w: number; h: number; fill: string }
  | { t: "circle"; cx: number; cy: number; r: number; fill: string; opacidad?: number }
  | { t: "polygon"; puntos: string; fill: string }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; ancho: number };

interface PaletaRango {
  claro: string;
  base: string;
  oscuro: string;
  cielo: string;
  suelo: string;
  cuerpo: string;
}

export const PALETA_TORRES: Record<string, PaletaRango> = {
  bronce: { claro: "#E9B886", base: "#B47A44", oscuro: "#6B4220", cielo: "#0E1228", suelo: "#6B4220", cuerpo: "#6B4220" },
  plata: { claro: "#F3F6FB", base: "#B7C3D8", oscuro: "#68768F", cielo: "#0E1228", suelo: "#68768F", cuerpo: "#68768F" },
  oro: { claro: "#FFE6A0", base: "#E8B34D", oscuro: "#9A6612", cielo: "#0E1228", suelo: "#9A6612", cuerpo: "#9A6612" },
  platino: { claro: "#C4F3E6", base: "#5FBFA8", oscuro: "#2A7262", cielo: "#0B1A22", suelo: "#2A7262", cuerpo: "#2A7262" },
  diamante: { claro: "#D8F5FF", base: "#5DC8F5", oscuro: "#2277A6", cielo: "#0A1630", suelo: "#2277A6", cuerpo: "#2277A6" },
  prodigio: { claro: "#FFE9A8", base: "#FFC53D", oscuro: "#B07A00", cielo: "#160F38", suelo: "#7C5CFF", cuerpo: "#3B2A8F" },
};

interface Edificio {
  x: number;
  w: number;
  h: number;
  columnas: number;
  techo?: "pico" | "antena" | "cristal";
}

const EDIFICIOS: Record<string, Edificio[]> = {
  bronce: [{ x: 36, w: 28, h: 24, columnas: 2, techo: "pico" }],
  plata: [{ x: 34, w: 32, h: 38, columnas: 3 }],
  oro: [
    { x: 26, w: 18, h: 26, columnas: 2 },
    { x: 46, w: 26, h: 50, columnas: 3, techo: "antena" },
  ],
  platino: [
    { x: 22, w: 22, h: 40, columnas: 2 },
    { x: 47, w: 22, h: 54, columnas: 2, techo: "antena" },
    { x: 71, w: 10, h: 24, columnas: 1 },
  ],
  diamante: [
    { x: 20, w: 18, h: 32, columnas: 2 },
    { x: 40, w: 22, h: 58, columnas: 2, techo: "cristal" },
    { x: 64, w: 17, h: 40, columnas: 2 },
  ],
  prodigio: [
    { x: 19, w: 16, h: 36, columnas: 2 },
    { x: 37, w: 26, h: 64, columnas: 3, techo: "cristal" },
    { x: 65, w: 16, h: 46, columnas: 2, techo: "antena" },
  ],
};

const ARCO = "M14 96 V42 A36 36 0 0 1 86 42 V96 Z";
const ARCO_INTERIOR = "M19 96 V42 A31 31 0 0 1 81 42 V96";
const SUELO = 86;
const APAGADA = "rgba(255,255,255,0.1)";

function estrella4(cx: number, cy: number, r: number): string {
  const p: string[] = [];
  for (let k = 0; k < 8; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 4;
    const rr = k % 2 ? r * 0.35 : r;
    p.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return p.join(" ");
}

// División dentro del rango: 0 = III, 1 = II, 2 = I. Prodigio no tiene divisiones
// y se dibuja con todo encendido (mismos tramos que divisionDeElo de la app).
export function indiceDivision(elo: number): 0 | 1 | 2 {
  const rango = rangoDeElo(elo);
  const i = RANGOS_ELO.findIndex((r) => r.slug === rango.slug);
  const siguiente = RANGOS_ELO[i + 1];
  if (!siguiente) return 2;
  const tramo = (siguiente.min - rango.min) / 3;
  return Math.max(0, Math.min(2, Math.floor((elo - rango.min) / tramo))) as 0 | 1 | 2;
}

export function piezasInsigniaTorres(slug: string, division: 0 | 1 | 2): Pieza[] {
  const p = PALETA_TORRES[slug] ?? PALETA_TORRES.bronce;
  const piezas: Pieza[] = [{ t: "path", d: ARCO, fill: p.cielo }];
  if (slug === "prodigio") {
    piezas.push({ t: "circle", cx: 72, cy: 30, r: 6, fill: p.claro }, { t: "circle", cx: 75, cy: 28, r: 5.5, fill: p.cielo }, { t: "polygon", puntos: estrella4(28, 26, 3.4), fill: p.claro });
  } else {
    piezas.push({ t: "circle", cx: 70, cy: 30, r: 1.2, fill: p.claro, opacidad: 0.7 }, { t: "circle", cx: 30, cy: 36, r: 1, fill: p.claro, opacidad: 0.5 });
  }
  for (const e of EDIFICIOS[slug] ?? EDIFICIOS.bronce) {
    const y = SUELO - e.h;
    const medio = e.x + e.w / 2;
    if (e.techo === "pico") piezas.push({ t: "polygon", puntos: `${e.x - 3},${y} ${medio},${y - 14} ${e.x + e.w + 3},${y}`, fill: p.base });
    if (e.techo === "antena") piezas.push({ t: "line", x1: medio, y1: y, x2: medio, y2: y - 11, stroke: p.base, ancho: 2 }, { t: "circle", cx: medio, cy: y - 12, r: 2, fill: p.claro });
    if (e.techo === "cristal") piezas.push({ t: "polygon", puntos: `${e.x},${y} ${medio},${y - 14} ${e.x + e.w},${y}`, fill: p.claro }, { t: "polygon", puntos: `${medio},${y - 14} ${e.x + e.w},${y} ${medio},${y}`, fill: p.base });
    piezas.push({ t: "rect", x: e.x, y, w: e.w, h: e.h, fill: p.cuerpo });
    const pisos = Math.floor((e.h - 6) / 7);
    const encendidos = Math.ceil((pisos * (division + 1)) / 3);
    const paso = e.w / e.columnas;
    for (let piso = 0; piso < pisos; piso++) {
      for (let c = 0; c < e.columnas; c++) {
        piezas.push({ t: "rect", x: Number((e.x + c * paso + paso / 2 - 2).toFixed(1)), y: SUELO - 7 - piso * 7, w: 4, h: 4.2, fill: piso < encendidos ? p.claro : APAGADA });
      }
    }
  }
  piezas.push(
    { t: "rect", x: 16.5, y: SUELO, w: 67, h: 10, fill: p.suelo },
    { t: "path", d: ARCO, stroke: p.base, ancho: 5 },
    { t: "path", d: ARCO_INTERIOR, stroke: p.claro, ancho: 1, opacidad: 0.55 },
  );
  return piezas;
}
