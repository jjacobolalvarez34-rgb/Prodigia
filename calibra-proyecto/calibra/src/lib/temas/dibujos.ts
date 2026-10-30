import type { FormaIlustracion } from "@/lib/tienda/ilustracionesPaquetes";

// Dibujos de las festividades (docs/eventos/PLAN_FESTIVIDADES.md): partículas,
// accesorios del avatar, lo que cruza el cielo y los adornos de las cápsulas. Son
// datos (caminos SVG con su color) que dibujan igual la web y la app.

export interface Dibujo {
  ancho: number;
  alto: number;
  formas: FormaIlustracion[];
}

function estrella(x: number, y: number, r: number): string {
  const k = r * 0.28;
  return `M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}z`;
}

function circulo(x: number, y: number, r: number): string {
  return `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`;
}

function elipse(x: number, y: number, rx: number, ry: number): string {
  return `M${x - rx} ${y}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0z`;
}

const CORAZON = "M16 28C6 21 3 15 6 10c2-4 8-4 10 1 2-5 8-5 10-1 3 5 0 11-10 18z";

// ---------- Partículas (32 × 32) ----------
export type TipoParticula =
  | "nieve"
  | "hoja"
  | "murcielago"
  | "petalo"
  | "corazon"
  | "linterna"
  | "farol"
  | "confeti"
  | "chispa"
  | "polvo"
  | "nota"
  | "estrella"
  | "huevo"
  | "caramelo"
  | "dulce"
  // Fichas de las colecciones de las fiestas (colecciones.ts, 0309).
  | "cempasuchil"
  | "vela"
  | "diya"
  | "estrella_fugaz"
  | "regalo"
  | "campana"
  // Fichas de las fiestas de febrero a septiembre (0311).
  | "moneda"
  | "carta"
  | "mascara"
  | "luna"
  | "pi"
  | "gulal"
  | "semilla"
  | "lapiz";

// Flor de cempasúchil: dos coronas de pétalos redondos y el centro.
function flor(x: number, y: number, r: number, n: number): string {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    d += circulo(+(x + Math.cos(a) * r).toFixed(2), +(y + Math.sin(a) * r).toFixed(2), +(r * 0.62).toFixed(2));
  }
  return d;
}

export const PARTICULAS: Record<TipoParticula, Dibujo> = {
  nieve: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M16 3v26M4.7 9.5l22.6 13M27.3 9.5L4.7 22.5", trazo: "#FFFFFF", ancho: 2.2 },
      { d: "M12.5 5.5L16 8l3.5-2.5M12.5 26.5L16 24l3.5 2.5M4.3 14.2l4.2-.8-1.6-4M27.7 14.2l-4.2-.8 1.6-4M4.3 17.8l4.2.8-1.6 4M27.7 17.8l-4.2.8 1.6 4", trazo: "#FFFFFF", ancho: 1.6 },
      { d: circulo(16, 16, 2.2), relleno: "#FFFFFF" },
    ],
  },
  hoja: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M16 3C8 9 6 18 14 28c1-6 3-11 10-17C22 7 19 4 16 3z", relleno: "#E07A2E" },
      { d: "M15 26C15 18 17 11 21 7", trazo: "#7A3A0E", ancho: 1.4 },
    ],
  },
  murcielago: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M16 13c-2-3-5-4-8-3 1 1 1 3 0 4-2-1-4 0-6 2 3 0 5 1 6 3 2-2 5-2 8 0 3-2 6-2 8 0 1-2 3-3 6-3-2-2-4-3-6-2-1-1-1-3 0-4-3-1-6 0-8 3z", relleno: "#4A2F7A", trazo: "#8A6BD1", ancho: 0.6 },
      { d: "M14.5 13l-1-3 2 1.8M17.5 13l1-3-2 1.8", relleno: "#4A2F7A" },
      { d: circulo(14.8, 15, 0.7) + circulo(17.2, 15, 0.7), relleno: "#FF9A3C" },
    ],
  },
  petalo: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: elipse(16, 16, 6, 11), relleno: "#FF9F1C" },
      { d: elipse(16, 18, 3.5, 7), relleno: "#FFBF47" },
    ],
  },
  corazon: { ancho: 32, alto: 32, formas: [{ d: CORAZON, relleno: "#FF5D8F" }, { d: "M9 11c1-2 3-2.5 4.5-1.5", trazo: "#FFFFFF", ancho: 1.6, opacidad: 0.7 }] },
  linterna: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M10 6h12l2.5 18h-17z", relleno: "#FFB347" },
      { d: "M11 8h10l1.8 14h-13.6z", relleno: "#FFD98A" },
      { d: circulo(16, 26.5, 1.6), relleno: "#FF7A1A" },
    ],
  },
  farol: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M16 2v3M16 27v3", trazo: "#FFC53D", ancho: 1.4 },
      { d: elipse(16, 16, 10, 11), relleno: "#E63946" },
      { d: "M9 6h14v2H9zM9 24h14v2H9z", relleno: "#FFC53D" },
      { d: "M16 5v22M10.5 9c-2 4-2 10 0 14M21.5 9c2 4 2 10 0 14", trazo: "#A4161A", ancho: 1 },
    ],
  },
  confeti: { ancho: 32, alto: 32, formas: [{ d: "M10 12h12v8H10z", relleno: "#FFFFFF" }] },
  chispa: { ancho: 32, alto: 32, formas: [{ d: estrella(16, 16, 12), relleno: "#FFD36B" }, { d: estrella(16, 16, 5), relleno: "#FFFFFF" }] },
  polvo: { ancho: 32, alto: 32, formas: [{ d: circulo(16, 16, 12), relleno: "#FF5D8F", opacidad: 0.55 }, { d: circulo(13, 13, 6), relleno: "#FFFFFF", opacidad: 0.25 }] },
  nota: { ancho: 32, alto: 32, formas: [{ d: "M13 24V7l12-3v16", trazo: "#FFFFFF", ancho: 2.4 }, { d: elipse(10, 24, 4, 3), relleno: "#FFFFFF" }, { d: elipse(22, 20, 4, 3), relleno: "#FFFFFF" }] },
  estrella: { ancho: 32, alto: 32, formas: [{ d: estrella(16, 16, 13), relleno: "#FFF3C4" }] },
  huevo: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M16 3c6 0 10 9 10 16a10 10 0 0 1-20 0C6 12 10 3 16 3z", relleno: "#9BE7FF" },
      { d: "M7 16c3 2 6-2 9 0s6 2 9 0", trazo: "#FF5D8F", ancho: 2.2 },
      { d: "M6.5 21c3 2 6-2 9.5 0s6.5 2 9.5 0", trazo: "#FFD36B", ancho: 2.2 },
    ],
  },
  // Caramelo envuelto (las fichas de Halloween).
  dulce: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M9 16L2.5 10.5c-.8 2-.8 8 0 11zM23 16l6.5-5.5c.8 2 .8 8 0 11z", relleno: "#FF8A1F" },
      { d: elipse(16, 16, 8.5, 7), relleno: "#FF8A1F" },
      { d: "M11 11.5c2-1.5 4-1 6 1.5s4 3 6 1.5M10.5 18c2-1.5 4-1 6 1.5s4 3 5.5 1.5", trazo: "#7C3AED", ancho: 2 },
      { d: elipse(13, 12.5, 3, 1.6), relleno: "#FFFFFF", opacidad: 0.45 },
    ],
  },
  caramelo: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M20 6a5 5 0 0 0-10 0v20", trazo: "#FFFFFF", ancho: 4.5 },
      { d: "M11 9l4-2.5M11 14l4-2.5M11 19l4-2.5M11 24l4-2.5M15.5 3.5l3 1.5", trazo: "#E63946", ancho: 2.2 },
    ],
  },
  // Flor de cempasúchil (las fichas de Día de Muertos).
  cempasuchil: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: flor(16, 16, 9, 10), relleno: "#FF8A00" },
      { d: flor(16, 16, 5.5, 8), relleno: "#FFB627" },
      { d: circulo(16, 16, 3.6), relleno: "#C2410C" },
      { d: circulo(14.8, 14.8, 1.2), relleno: "#FFE08A", opacidad: 0.8 },
    ],
  },
  // Vela encendida de la ofrenda.
  vela: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M11 14h10v15H11z", relleno: "#F4EAD5" },
      { d: "M11 14h10v3H11z", relleno: "#E3D3B0" },
      { d: "M16 3c3 4 4 6.5 2.6 8.6-.7 1-1.7 1.4-2.6 1.4s-1.9-.4-2.6-1.4C12 9.5 13 7 16 3z", relleno: "#FF9F1C" },
      { d: "M16 7c1.4 2 1.8 3.2 1.1 4.3-.3.4-.7.6-1.1.6s-.8-.2-1.1-.6c-.7-1.1-.3-2.3 1.1-4.3z", relleno: "#FFE08A" },
      { d: "M16 12.5v1.5", trazo: "#3B2A1A", ancho: 1 },
    ],
  },
  // Diya: lámpara de barro con su llama (las fichas de Diwali).
  diya: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M4 18c3 7 21 7 24 0z", relleno: "#C2410C" },
      { d: "M6 19.5c4 3.6 16 3.6 20 0", trazo: "#FFC53D", ancho: 1.4 },
      { d: "M11 26h10l-1.5 2.5h-7z", relleno: "#9A3412" },
      { d: "M16 5c3.2 4 4 7 2.4 9.6-.6.9-1.5 1.4-2.4 1.4s-1.8-.5-2.4-1.4C12 12 12.8 9 16 5z", relleno: "#FFB627" },
      { d: "M16 9.5c1.3 1.8 1.6 3 1 4-.2.4-.6.6-1 .6s-.8-.2-1-.6c-.6-1-.3-2.2 1-4z", relleno: "#FFF3B0" },
    ],
  },
  // Estrella fugaz con su estela (las fichas del Viernes Estelar).
  estrella_fugaz: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M3 27L17 13", trazo: "#5DE4FF", ancho: 2.6, opacidad: 0.55 },
      { d: "M7 28.5L18 17.5M2 23l11-11", trazo: "#5DE4FF", ancho: 1.2, opacidad: 0.4 },
      { d: estrella(21, 11, 9), relleno: "#FFC53D" },
      { d: estrella(21, 11, 3.6), relleno: "#FFFFFF" },
    ],
  },
  // Regalo con moño (las fichas de Navidad).
  regalo: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M5 14h22v14H5z", relleno: "#E63946" },
      { d: "M4 10h24v5H4z", relleno: "#C1121F" },
      { d: "M14 10h4v18h-4z", relleno: "#FFC53D" },
      { d: "M16 10c-3-5-9-6-9-2.5 0 2 4 2.5 9 2.5M16 10c3-5 9-6 9-2.5 0 2-4 2.5-9 2.5", trazo: "#FFC53D", ancho: 2 },
      { d: "M6 16h3v10H6z", relleno: "#FFFFFF", opacidad: 0.2 },
    ],
  },
  // Campana dorada de las doce (las fichas de Año Nuevo).
  campana: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M16 4c-5 0-8 4-8 9v6l-3 4h22l-3-4v-6c0-5-3-9-8-9z", relleno: "#FFC53D" },
      { d: "M11 9c1-2 2.5-3 4-3.2", trazo: "#FFF3B0", ancho: 1.6, opacidad: 0.8 },
      { d: "M5 23h22v2H5z", relleno: "#E8A317" },
      { d: circulo(16, 27, 2.6), relleno: "#A794FF" },
      { d: "M16 1.5v2.8", trazo: "#E8A317", ancho: 2 },
    ],
  },
  // Moneda de la suerte con el agujero cuadrado y su cordón rojo (Año Nuevo Lunar).
  moneda: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M16 2v4M16 26v4", trazo: "#E63946", ancho: 2 },
      { d: circulo(16, 16, 11), relleno: "#FFC53D" },
      { d: circulo(16, 16, 8.4), trazo: "#E8A317", ancho: 1.2 },
      { d: "M13 13h6v6h-6z", relleno: "#7A1010" },
      { d: "M9 11.5c1-2 2.4-3.2 4-3.8", trazo: "#FFF3B0", ancho: 1.4, opacidad: 0.8 },
    ],
  },
  // Carta cerrada con un corazón de lacre (Amor y amistad).
  carta: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M4 9h24v16H4z", relleno: "#FFF1F5" },
      { d: "M4 9l12 9 12-9", trazo: "#FFB3C7", ancho: 1.6 },
      { d: "M4 25l9-7.5M28 25l-9-7.5", trazo: "#FFB3C7", ancho: 1.2, opacidad: 0.8 },
      { d: "M16 22.5c-3.6-2.6-4.6-4.5-3.6-6 .8-1.1 2.6-1.1 3.6.4 1-1.5 2.8-1.5 3.6-.4 1 1.5 0 3.4-3.6 6z", relleno: "#FF5D8F" },
    ],
  },
  // Antifaz de carnaval con plumas (Carnaval).
  mascara: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M20 12c1-5 4-8 8-9-1 4-3 7-6 9.5z", relleno: "#3DDC97" },
      { d: "M22.5 13c2.5-3 5-4 7.5-4-2 3-4 4.5-6.5 5.5z", relleno: "#FFC53D" },
      { d: "M3 15c3-3 7-3.5 13-1.5 6-2 10-1.5 13 1.5-1 5-4 8-8 8-3 0-4-2-5-3-1 1-2 3-5 3-4 0-7-3-8-8z", relleno: "#7C5CFF" },
      { d: elipse(10.5, 17, 3, 2) + elipse(21.5, 17, 3, 2), relleno: "#1A0B2E" },
      { d: "M5 14.5c2-1.5 5-2 8-1", trazo: "#FFC53D", ancho: 1.2, opacidad: 0.9 },
    ],
  },
  // Luna creciente con una estrellita (Noches de linternas).
  luna: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M19 4a12 12 0 1 0 9 19.5A10 10 0 0 1 19 4z", relleno: "#FFF3C4" },
      { d: "M12 9c-2 2-3 4.5-3 7", trazo: "#FFFFFF", ancho: 1.4, opacidad: 0.6 },
      { d: estrella(24, 9, 3.2), relleno: "#3DDC97" },
    ],
  },
  // La letra π, gruesa (Día de π).
  pi: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: circulo(16, 16, 13), relleno: "#2A1F5C" },
      { d: "M8 11c1.5-1.6 3-2 5-2h12", trazo: "#9B85FF", ancho: 3, opacidad: 1 },
      { d: "M13 9.5c0 6-1 10.5-3.5 13.5M20 9.5v10c0 2.5 1 3.5 3.5 3", trazo: "#5DE4FF", ancho: 3 },
    ],
  },
  // Cuenco de gulal con polvo de color (Holi).
  gulal: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: circulo(11, 13, 5) + circulo(19, 11, 5.5), relleno: "#FF5D8F", opacidad: 0.9 },
      { d: circulo(23, 15, 4.5), relleno: "#3DDC97", opacidad: 0.9 },
      { d: circulo(15, 15, 4), relleno: "#FFC53D", opacidad: 0.95 },
      { d: "M3 16h26c-1 7-6 11-13 11S4 23 3 16z", relleno: "#C2410C" },
      { d: "M6 18.5h20", trazo: "#FFC53D", ancho: 1.2, opacidad: 0.8 },
    ],
  },
  // Brote con dos hojas saliendo de la tierra (Día de la Tierra).
  semilla: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M16 26V14", trazo: "#1F8A5B", ancho: 2.2 },
      { d: "M16 16c-1-5-5-8-11-8 0 6 4 9 11 8z", relleno: "#3DDC97" },
      { d: "M16 13c1-5 5-8 11-8 0 6-4 9-11 8z", relleno: "#7FF0C8" },
      { d: "M6 26c3-2.5 6.5-3 10-3s7 .5 10 3z", relleno: "#7A4A1E" },
    ],
  },
  // Lápiz amarillo con goma rosa (Vuelta a clases).
  lapiz: {
    ancho: 32,
    alto: 32,
    formas: [
      { d: "M21 4l7 7-14 14-7-7z", relleno: "#FFC53D" },
      { d: "M7 18l7 7-9 2z", relleno: "#F4D9A8" },
      { d: "M5 25.5l1.5-1.5 1.5 1.5-2.5.7z", relleno: "#3B2A1A" },
      { d: "M21 4l3-3 7 7-3 3z", relleno: "#FF5D8F" },
      { d: "M19 6l7 7", trazo: "#E8A317", ancho: 1.2 },
    ],
  },
};

// ---------- Accesorios sobre el avatar (32 × 32; se ponen arriba a la izquierda o sobre la cara) ----------
export type TipoAccesorio = "gorro_navidad" | "sombrero_bruja" | "corona_flores" | "orejas_conejo" | "antifaz" | "gafas_fiesta" | "lapiz" | "diadema_corazones";

export const ACCESORIOS: Record<TipoAccesorio, Dibujo & { lugar: "cabeza" | "cara" }> = {
  gorro_navidad: {
    ancho: 32,
    alto: 32,
    lugar: "cabeza",
    formas: [
      { d: "M5 23C8 13 15 5 25 4c-2 4-3 7-3 11l2 8z", relleno: "#E63946" },
      { d: "M9 6c2-1 5-2 8-2", trazo: "#FFFFFF", ancho: 1, opacidad: 0.35 },
      { d: "M3 22c6-3 15-3 23 1v5c-8-4-17-4-23-1z", relleno: "#F4F1EA" },
      { d: circulo(26, 4.5, 3.4), relleno: "#F4F1EA" },
    ],
  },
  sombrero_bruja: {
    ancho: 32,
    alto: 32,
    lugar: "cabeza",
    formas: [
      { d: "M2 25c8-4 20-4 28 0-8 3-20 3-28 0z", relleno: "#2A1640" },
      { d: "M9 24l6-17c2-4 6-5 9-3-3 0-5 2-5 5l1 15z", relleno: "#3B1F5C" },
      { d: "M9.5 21.5c4-1.3 7.5-1.3 11 0l.3 2.6c-4-1.3-7.5-1.3-11.6 0z", relleno: "#FF8A1F" },
      { d: estrella(17, 13, 2.2), relleno: "#FFD36B" },
    ],
  },
  corona_flores: {
    ancho: 32,
    alto: 32,
    lugar: "cabeza",
    formas: [
      { d: "M3 22c8-5 18-5 26 0", trazo: "#3A7D44", ancho: 2.4 },
      { d: circulo(6, 19.5, 3.4) + circulo(16, 16.5, 4) + circulo(26, 19.5, 3.4), relleno: "#FF9F1C" },
      { d: circulo(11, 17.5, 3) + circulo(21, 17.5, 3), relleno: "#FF5D8F" },
      { d: circulo(6, 19.5, 1.3) + circulo(16, 16.5, 1.5) + circulo(26, 19.5, 1.3) + circulo(11, 17.5, 1.1) + circulo(21, 17.5, 1.1), relleno: "#FFE08A" },
    ],
  },
  orejas_conejo: {
    ancho: 32,
    alto: 32,
    lugar: "cabeza",
    formas: [
      { d: "M9 26C6 18 5 9 8 4c3 1 5 9 5 21zM23 26c3-8 4-17 1-22-3 1-5 9-5 21z", relleno: "#F4F1EA" },
      { d: "M9.5 22C8 16 7.5 10 8.6 7c1.6 1.4 2.6 7 2.6 15zM22.5 22c1.5-6 2-12 .9-15-1.6 1.4-2.6 7-2.6 15z", relleno: "#FFB3C7" },
      { d: "M5 26h22v2.5H5z", relleno: "#FF5D8F" },
    ],
  },
  antifaz: {
    ancho: 32,
    alto: 32,
    lugar: "cara",
    formas: [
      { d: "M2 13c4-3 9-3 14 0 5-3 10-3 14 0 0 5-3 8-7 8-3 0-5-2-7-4-2 2-4 4-7 4-4 0-7-3-7-8z", relleno: "#7C5CFF" },
      { d: elipse(9, 15, 3.2, 2.3) + elipse(23, 15, 3.2, 2.3), relleno: "#0B1022" },
      { d: "M2 13c-1-5 1-9 4-10 0 4 0 7 2 9", relleno: "#FFC53D" },
      { d: "M30 13c1-5-1-9-4-10 0 4 0 7-2 9", relleno: "#3DDC97" },
    ],
  },
  gafas_fiesta: {
    ancho: 32,
    alto: 32,
    lugar: "cara",
    formas: [
      { d: "M2 12h12l-1 7H4zM18 12h12l-2 7h-9z", relleno: "#FFC53D" },
      { d: "M4.5 13.5h7.6l-.6 4.2H5.2zM19.8 13.5h8l-1.4 4.2h-6z", relleno: "#2A1F5C" },
      { d: "M14 14h4", trazo: "#FFC53D", ancho: 2 },
      { d: estrella(8, 9, 2.2) + estrella(24, 9, 2.2), relleno: "#FFFFFF" },
    ],
  },
  lapiz: {
    ancho: 32,
    alto: 32,
    lugar: "cabeza",
    formas: [
      { d: "M6 22L22 6l4 4-16 16z", relleno: "#FFC53D" },
      { d: "M22 6l2.5-2.5 4 4L26 10z", relleno: "#FF8FA3" },
      { d: "M6 22l-2 6 6-2z", relleno: "#F4E4C1" },
      { d: "M4.6 26.2L4 28l1.8-.6z", relleno: "#2A1F5C" },
    ],
  },
  diadema_corazones: {
    ancho: 32,
    alto: 32,
    lugar: "cabeza",
    formas: [
      { d: "M3 24c8-6 18-6 26 0", trazo: "#FF5D8F", ancho: 2 },
      { d: "M8 21c-4-3-5-5-4-7 1-1.5 3-1.5 4 .5 1-2 3-2 4-.5 1 2 0 4-4 7zM24 21c-4-3-5-5-4-7 1-1.5 3-1.5 4 .5 1-2 3-2 4-.5 1 2 0 4-4 7z", relleno: "#FF5D8F" },
    ],
  },
};

// ---------- Lo que cruza el cielo (se dibuja mirando a la derecha) ----------
export type TipoPasante = "trineo" | "bruja" | "dragon" | "globo_corazon" | "conejo" | "murcielagos" | "linternas";

const RENO = (x: number) =>
  `M${x} 14c2-2 6-2 8 0l1-4 2 1-1 3c1 0 2 1 2 2l-2 1-1 4h-1.5l-.5-3h-5l-1 3h-1.5l.5-4c-1 0-1.5-1-1-2z`;
const CUERNOS = (x: number) => `M${x + 9} 10l-1-3M${x + 9} 10l2-3M${x + 9} 8l-2-1`;

export const PASANTES: Record<TipoPasante, Dibujo> = {
  trineo: {
    ancho: 120,
    alto: 32,
    formas: [
      { d: "M2 26c10-4 20-4 26-8", trazo: "#C9A227", ancho: 0.8, opacidad: 0.8 },
      { d: RENO(46) + RENO(64), relleno: "#8B5A2B" },
      { d: CUERNOS(46) + CUERNOS(64), trazo: "#C9A227", ancho: 1 },
      { d: circulo(77.2, 14.6, 1.2), relleno: "#FF3B3B" },
      { d: "M44 17L30 17M62 17L52 17", trazo: "#C9A227", ancho: 0.8 },
      { d: "M4 18h22c2 0 3 2 2 5l-1 2H8c-3 0-5-3-4-7z", relleno: "#C1121F" },
      { d: "M3 27h24c2 0 3-1 3-2", trazo: "#C9A227", ancho: 1.4 },
      { d: "M14 11c3 0 5 2 5 5v2h-9v-2c0-3 2-5 4-5z", relleno: "#E63946" },
      { d: circulo(14.5, 9.5, 2.6), relleno: "#F4D7B5" },
      { d: "M12 10.5c1 3 4 3 5 0", relleno: "#F4F1EA" },
      { d: "M11.5 8c1-3 5-4 7-1l-1 1z", relleno: "#E63946" },
      { d: "M6 17l3-4h3l-1 4z", relleno: "#7A4A1A" },
    ],
  },
  bruja: {
    ancho: 60,
    alto: 32,
    formas: [
      { d: "M2 22L46 18", trazo: "#7A4A1A", ancho: 2 },
      { d: "M2 22l-2 -4 2 2 -2 2 2 -1 -1 4z", relleno: "#C9A227" },
      { d: "M44 18c3-1 6 0 8 3-3 1-6 1-8-1z", relleno: "#D9A441" },
      { d: "M15 21c0-9 4-14 10-14s9 6 8 13z", relleno: "#5B2F8C" },
      { d: "M17 21l-12 8 5-9", relleno: "#3B1F5C" },
      { d: circulo(25, 6, 4.4), relleno: "#9BD88A" },
      { d: "M17 3c5-1.5 11-1.5 16 0-5 1.6-11 1.6-16 0zM21.5 3l4-7 3 7", relleno: "#2A1640" },
      { d: "M26 14l6 3", trazo: "#9BD88A", ancho: 2 },
    ],
  },
  dragon: {
    ancho: 160,
    alto: 40,
    formas: [
      { d: "M8 22c14-14 24 10 40 0s24-14 40 0 24 12 40 0", trazo: "#E63946", ancho: 9 },
      { d: "M8 22c14-14 24 10 40 0s24-14 40 0 24 12 40 0", trazo: "#FFC53D", ancho: 2.5 },
      { d: "M20 12l3-6 2 5M44 26l3 6 2-6M68 13l3-6 2 5M92 26l3 6 2-6M116 13l3-6 2 5", relleno: "#FFC53D" },
      { d: "M128 22c4-6 14-8 22-4l6 3-6 2c-2 4-6 6-12 6-5 0-8-3-10-7z", relleno: "#E63946" },
      { d: circulo(144, 19, 1.6), relleno: "#FFFFFF" },
      { d: "M150 16c3-4 6-5 9-4M148 15c1-4 3-6 6-7", trazo: "#FFC53D", ancho: 1.2 },
      { d: "M134 27c4 2 8 3 12 2", trazo: "#FFC53D", ancho: 1.2 },
    ],
  },
  globo_corazon: {
    ancho: 32,
    alto: 48,
    formas: [
      { d: CORAZON, relleno: "#FF5D8F" },
      { d: "M9 11c1-2 3-2.5 4.5-1.5", trazo: "#FFFFFF", ancho: 1.6, opacidad: 0.7 },
      { d: "M16 28c-2 6 2 10-1 18", trazo: "#F4F1EA", ancho: 0.8 },
    ],
  },
  conejo: {
    ancho: 40,
    alto: 32,
    formas: [
      { d: "M6 24c0-7 6-11 14-10 6 1 10 5 10 10v2H6z", relleno: "#F4F1EA" },
      { d: circulo(31, 15, 5), relleno: "#F4F1EA" },
      { d: "M29 11c-1-6 0-10 2-11 2 2 1 6 0 11zM32 11c1-6 4-9 6-9 0 3-2 7-4 10z", relleno: "#F4F1EA" },
      { d: "M30 9c-.5-4 0-7 1-8M33 9c1-4 3-6 4-6", trazo: "#FFB3C7", ancho: 1.2 },
      { d: circulo(33, 14.5, 0.9), relleno: "#2A1F5C" },
      { d: circulo(6, 20, 2.6), relleno: "#FFFFFF" },
    ],
  },
  murcielagos: {
    ancho: 64,
    alto: 32,
    formas: [
      { d: "M14 10c-1.5-2-3.5-2.6-5.5-2 .7.7.7 2 0 2.7-1.5-.7-2.7 0-4 1.3 2 0 3.3.7 4 2 1.3-1.3 3.3-1.3 5.5 0 2-1.3 4-1.3 5.5 0 .7-1.3 2-2 4-2-1.3-1.3-2.7-2-4-1.3-.7-.7-.7-2 0-2.7-2-.6-4 0-5.5 2z", relleno: "#4A2F7A" },
      { d: "M38 20c-2-2.6-4.6-3.5-7.3-2.6 1 1 1 2.6 0 3.5-2-1-3.5 0-5.3 1.7 2.6 0 4.4 1 5.3 2.6 1.8-1.7 4.4-1.7 7.3 0 2.6-1.7 5.3-1.7 7.3 0 1-1.7 2.6-2.6 5.3-2.6-1.8-1.7-3.5-2.6-5.3-1.7-1-1-1-2.6 0-3.5-2.6-1-5.3 0-7.3 2.6z", relleno: "#4A2F7A" },
      { d: "M56 8c-1-1.4-2.4-1.9-3.8-1.4.5.5.5 1.4 0 1.9-1-.5-1.9 0-2.8.9 1.4 0 2.3.5 2.8 1.4 1-.9 2.3-.9 3.8 0 1.4-.9 2.8-.9 3.8 0 .5-.9 1.4-1.4 2.8-1.4-.9-.9-1.9-1.4-2.8-.9-.5-.5-.5-1.4 0-1.9-1.4-.5-2.8 0-3.8 1.4z", relleno: "#4A2F7A" },
    ],
  },
  linternas: {
    ancho: 48,
    alto: 40,
    formas: [
      { d: "M6 14h10l2 14H4z", relleno: "#FFB347" },
      { d: "M7 16h8l1.4 10H5.6z", relleno: "#FFD98A" },
      { d: "M30 4h10l2 14H28z", relleno: "#FFB347" },
      { d: "M31 6h8l1.4 10H29.6z", relleno: "#FFD98A" },
    ],
  },
};

// ---------- Adornos de las cápsulas (en el espacio de la cápsula: x 20–80, y 20–120, unión en y = 70) ----------
export type AdornoCapsula = "mono" | "calabaza" | "papel_picado" | "sobre_rojo" | "huevo" | "corazon" | "diya" | "estrellas";

export const ADORNOS_CAPSULA: Record<AdornoCapsula, FormaIlustracion[]> = {
  // Cinta y moño de regalo.
  mono: [
    { d: "M46 20h8v100h-8z", relleno: "#E63946", opacidad: 0.95 },
    { d: "M50 22c-6-12-20-10-16-3 3 4 16 3 16 3zM50 22c6-12 20-10 16-3-3 4-16 3-16 3z", relleno: "#E63946" },
    { d: "M50 22c-4-8-13-7-11-2 2 3 11 2 11 2z", relleno: "#FF6B6B", opacidad: 0.6 },
    { d: circulo(50, 22, 3), relleno: "#C1121F" },
  ],
  // Tallo y cara de calabaza.
  calabaza: [
    { d: "M48 22c0-5 2-8 6-9-1 3-2 6-2 9z", relleno: "#3A7D44" },
    { d: "M34 48l7-9 7 9zM52 48l7-9 7 9z", relleno: "#2A1205" },
    { d: "M32 86c5 9 31 9 36 0l-5 3-4-4-4 4-5-4-5 4-4-4-4 4z", relleno: "#2A1205" },
    { d: "M30 40c0 20 0 50 0 60M70 40c0 20 0 50 0 60", trazo: "#B35400", ancho: 1.2, opacidad: 0.6 },
  ],
  // Banda de papel picado en la unión.
  papel_picado: [
    { d: "M20 62h60v6l-5 4-5-4-5 4-5-4-5 4-5-4-5 4-5-4-5 4-5-4-5 4-5-4z", relleno: "#FF5D8F" },
    { d: "M20 74h60v6l-5 4-5-4-5 4-5-4-5 4-5-4-5 4-5-4-5 4-5-4-5 4-5-4z", relleno: "#3DDC97" },
    { d: circulo(32, 65, 1.5) + circulo(50, 65, 1.5) + circulo(68, 65, 1.5), relleno: "#FFFFFF" },
  ],
  // Sobre rojo con sello dorado.
  sobre_rojo: [
    { d: "M20 50l30 20 30-20", trazo: "#FFC53D", ancho: 2 },
    { d: circulo(50, 70, 7), relleno: "#FFC53D" },
    { d: "M47 67h6v6h-6z", relleno: "#E63946" },
  ],
  // Rayas de huevo pintado.
  huevo: [
    { d: "M20 52c10 6 20-6 30 0s20 6 30 0", trazo: "#FFD36B", ancho: 4 },
    { d: "M20 92c10 6 20-6 30 0s20 6 30 0", trazo: "#FF5D8F", ancho: 4 },
    { d: circulo(35, 104, 2.5) + circulo(50, 108, 2.5) + circulo(65, 104, 2.5), relleno: "#FFFFFF" },
  ],
  corazon: [{ d: "M50 60c-10-7-13-12-10-16 2-3 7-3 10 1 3-4 8-4 10-1 3 4 0 9-10 16z", relleno: "#FFFFFF", opacidad: 0.9 }],
  // Llama de lámpara diya arriba.
  diya: [
    { d: "M50 6c5 6 6 11 0 15-6-4-5-9 0-15z", relleno: "#FFB347" },
    { d: "M50 11c2.5 3 3 6 0 8-3-2-2.5-5 0-8z", relleno: "#FFF3C4" },
    { d: "M22 66c8 4 48 4 56 0", trazo: "#FFC53D", ancho: 2 },
  ],
  estrellas: [{ d: estrella(36, 40, 4) + estrella(64, 50, 3) + estrella(40, 100, 3) + estrella(62, 96, 4), relleno: "#FFFFFF", opacidad: 0.9 }],
};
