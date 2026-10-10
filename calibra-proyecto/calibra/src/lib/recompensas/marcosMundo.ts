// Marcos de ciudad (se desbloquean con la ciudad en nivel 40): un SVG por ciudad,
// generado acá y compartido por la web (public/marcos/marco_<ciudad>.svg, que
// escribe y comprueba marcosMundo.test.ts) y la app (lo dibuja con SvgXml, sin
// descargar nada).
//
// Remaster del 2026-10-10 (pedido: «se ven toscos y feos»). Cada marco tiene:
//  - un halo suave del color de la ciudad por fuera;
//  - un aro metálico biselado (degradé claro → base → oscuro) con filetes finos;
//  - el motivo de la ciudad grabado en el aro (pentagrama, onda, ADN, laureles…);
//  - un medallón arriba con su símbolo y adornos a los costados;
//  - un brillo especular arriba a la izquierda.
// Geometría: el lienzo mide 200 y el anillo se dibuja a 1,32× el avatar, así que la
// foto llega hasta un radio de ~76. Nada se dibuja por dentro de r = 77: el marco
// nunca tapa la cara.
import { tono, type MundoCiudad } from "./catalogo";

const C = 100;
const R_FOTO = 77; // filete que abraza la foto
const R_ARO = 89; // centro del aro
const ANCHO_ARO = 14;

interface Paleta {
  base: string;
  acento: string;
}

const PALETA: Record<MundoCiudad, Paleta> = {
  numeria: { base: "#6C4CF1", acento: "#FFD166" },
  enigmia: { base: "#0E9F6E", acento: "#C4F1E0" },
  geografia: { base: "#1E7A8C", acento: "#F2C14E" },
  quimia: { base: "#C026D3", acento: "#7DF9FF" },
  anatomia: { base: "#8B2942", acento: "#FFB3C1" },
  melodia: { base: "#B8860B", acento: "#FFF1B8" },
  trigonometria: { base: "#65A30D", acento: "#E9FFB0" },
  historia: { base: "#A0522D", acento: "#F6D58E" },
  calculia: { base: "#4338CA", acento: "#B9C2FF" },
  circuitia: { base: "#D97706", acento: "#FFF3A3" },
  estadistica: { base: "#0D9488", acento: "#A7FFF1" },
  naipia: { base: "#B91C1C", acento: "#FFE08A" },
  codia: { base: "#0891B2", acento: "#B2F7FF" },
  dinamia: { base: "#2563EB", acento: "#BFE0FF" },
  vitalia: { base: "#16A34A", acento: "#D9FFB3" },
};

const f = (n: number) => Math.round(n * 100) / 100;

// Punto a radio r y ángulo a (grados, 0 = arriba, sentido horario).
function punto(r: number, a: number): [number, number] {
  const rad = ((a - 90) * Math.PI) / 180;
  return [f(C + r * Math.cos(rad)), f(C + r * Math.sin(rad))];
}

function arco(r: number, a0: number, a1: number): string {
  const [x0, y0] = punto(r, a0);
  const [x1, y1] = punto(r, a1);
  const grande = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${grande} ${a1 > a0 ? 1 : 0} ${x1} ${y1}`;
}

// Curva cerrada alrededor del centro: r(a) para a de 0 a 360.
function curvaPolar(r: (a: number) => number, pasos = 240): string {
  let d = "";
  for (let i = 0; i <= pasos; i++) {
    const a = (360 * i) / pasos;
    const [x, y] = punto(r(a), a);
    d += `${i === 0 ? "M" : "L"}${x} ${y} `;
  }
  return d.trim();
}

function texto(x: number, y: number, s: string, tam: number, relleno: string, peso = 700): string {
  // Sin dominant-baseline (no todos los motores lo respetan): se baja a mano un tercio del tamaño.
  return `<text x="${f(x)}" y="${f(y + tam * 0.35)}" font-family="Georgia, 'Times New Roman', serif" font-size="${tam}" font-weight="${peso}" text-anchor="middle" fill="${relleno}">${s}</text>`;
}

function medallon(id: string, x: number, y: number, r: number, p: Paleta, interior: string): string {
  return [
    `<circle cx="${x}" cy="${y}" r="${r + 2.2}" fill="url(#${id}-metal)"/>`,
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-gema)" stroke="${tono(p.acento, 0.2)}" stroke-width="1"/>`,
    `<circle cx="${f(x - r * 0.35)}" cy="${f(y - r * 0.4)}" r="${f(r * 0.35)}" fill="#FFFFFF" opacity="0.22"/>`,
    interior,
  ].join("");
}

// Medallón principal arriba (bajado 2,5 para que el borde no lo corte).
function arriba(id: string, p: Paleta, interior: string): string {
  return `<g transform="translate(0 2.5)">${medallon(id, C, 11, 11, p, interior)}</g>`;
}

// Medallones chicos a los costados (a 120° y 240°) con un símbolo.
function costados(id: string, p: Paleta, izq: string, der: string, tam = 9): string {
  const [x1, y1] = punto(R_ARO, 240);
  const [x2, y2] = punto(R_ARO, 120);
  return (
    medallon(id, x1, y1, 7.5, p, texto(x1, y1, izq, tam, p.acento)) + medallon(id, x2, y2, 7.5, p, texto(x2, y2, der, tam, p.acento))
  );
}

// Motivos que se repiten a lo largo del aro.
function marcasRadiales(n: number, r0: number, r1: number, color: string, ancho: number, saltar: (a: number) => boolean = () => false, opacidad = 0.55): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (360 * i) / n;
    if (saltar(a)) continue;
    const [x0, y0] = punto(r0, a);
    const [x1, y1] = punto(r1, a);
    s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round" opacity="${opacidad}"/>`;
  }
  return s;
}

function puntos(n: number, r: number, radio: number, color: string, saltar: (a: number) => boolean = () => false, opacidad = 0.7): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (360 * i) / n + 180 / n;
    if (saltar(a)) continue;
    const [x, y] = punto(r, a);
    s += `<circle cx="${x}" cy="${y}" r="${radio}" fill="${color}" opacity="${opacidad}"/>`;
  }
  return s;
}

// Zonas del aro ocupadas por medallones (arriba, costados y abajo).
const libre = (a: number) => Math.min(Math.abs(a - 0), Math.abs(a - 360)) < 16 || Math.abs(a - 120) < 9 || Math.abs(a - 240) < 9 || Math.abs(a - 180) < 9;

// Hojas a lo largo de un arco (laureles, enredaderas).
function hojas(desde: number, hasta: number, n: number, color: string, borde: string): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = desde + ((hasta - desde) * (i + 0.5)) / n;
    for (const lado of [-1, 1]) {
      const [x, y] = punto(R_ARO + lado * 3.2, a);
      const giro = a + (desde < hasta ? 1 : -1) * 35 * lado + 90;
      s += `<ellipse cx="${x}" cy="${y}" rx="4.6" ry="1.9" transform="rotate(${f(giro - 90)} ${x} ${y})" fill="${color}" stroke="${borde}" stroke-width="0.5"/>`;
    }
  }
  return s;
}

type Motivo = (id: string, p: Paleta) => string;

const MOTIVOS: Record<MundoCiudad, Motivo> = {
  // Operaciones: + − × ÷ grabados alrededor y Σ arriba.
  numeria: (id, p) => {
    let s = "";
    const simbolos = ["+", "−", "×", "÷"];
    for (let i = 0; i < 16; i++) {
      const a = 11.25 + i * 22.5;
      if (libre(a)) continue;
      const [x, y] = punto(R_ARO, a);
      s += texto(x, y, simbolos[i % 4], 8, p.acento, 700).replace("<text ", `<text opacity="0.8" `);
    }
    return s + arriba(id, p, texto(C, 11, "Σ", 14, p.acento)) + costados(id, p, "7", "π", 9);
  },
  // Signos de pregunta y piezas encastradas.
  enigmia: (id, p) => {
    let s = marcasRadiales(48, R_ARO - 4.5, R_ARO + 4.5, tono(p.base, -0.5), 1.2, libre, 0.5);
    s += puntos(24, R_ARO, 1.6, p.acento, libre, 0.85);
    return s + arriba(id, p, texto(C, 11, "?", 16, p.acento)) + costados(id, p, "!", "∴", 9);
  },
  // Paralelos y meridianos del globo dentro del aro, rosa de los vientos arriba.
  geografia: (id, p) => {
    let s = `<circle cx="${C}" cy="${C}" r="${R_ARO}" fill="none" stroke="${p.acento}" stroke-width="0.6" stroke-dasharray="2 2.6" opacity="0.7"/>`;
    s += marcasRadiales(36, R_ARO - 6, R_ARO + 6, tono(p.acento, 0.2), 0.7, libre, 0.45);
    const estrella = (() => {
      let d = "";
      for (let i = 0; i < 16; i++) {
        const r = i % 4 === 0 ? 9.5 : i % 2 === 0 ? 5.5 : 2.6;
        const [x, y] = [C + r * Math.sin((i * Math.PI) / 8), 11 - r * Math.cos((i * Math.PI) / 8)];
        d += `${i === 0 ? "M" : "L"}${f(x)} ${f(y)} `;
      }
      return `<path d="${d}Z" fill="${p.acento}" stroke="${tono(p.base, -0.5)}" stroke-width="0.5"/>`;
    })();
    return s + arriba(id, p, estrella) + costados(id, p, "N", "S", 8);
  },
  // Hexágonos (anillos de benceno) y un frasco arriba.
  quimia: (id, p) => {
    let s = "";
    for (let i = 0; i < 14; i++) {
      const a = (360 * i) / 14 + 360 / 28;
      if (libre(a)) continue;
      const [x, y] = punto(R_ARO, a);
      let d = "";
      for (let k = 0; k < 6; k++) {
        const ang = (k * Math.PI) / 3 + Math.PI / 6;
        d += `${k === 0 ? "M" : "L"}${f(x + 3.6 * Math.cos(ang))} ${f(y + 3.6 * Math.sin(ang))} `;
      }
      s += `<path d="${d}Z" fill="none" stroke="${p.acento}" stroke-width="0.9" opacity="0.85"/>`;
    }
    const frasco = `<path d="M96.5 4.5 h7 v4.5 l5 9 a2 2 0 0 1 -1.8 3 h-13.4 a2 2 0 0 1 -1.8 -3 l5 -9 Z" fill="${tono(p.acento, -0.1)}" stroke="${tono(p.base, -0.5)}" stroke-width="0.6"/><path d="M93.5 16 h13" stroke="${p.base}" stroke-width="1.4"/>`;
    return s + arriba(id, p, frasco) + costados(id, p, "H", "O", 9);
  },
  // Latido (electrocardiograma) en el aro y un corazón arriba.
  anatomia: (id, p) => {
    const ecg = curvaPolar((a) => {
      const fase = (a * 8) % 360;
      if (fase > 150 && fase < 165) return R_ARO + 4.5;
      if (fase >= 165 && fase < 175) return R_ARO - 4.5;
      if (fase >= 175 && fase < 185) return R_ARO + 2;
      return R_ARO;
    }, 960);
    const s = `<path d="${ecg}" fill="none" stroke="${p.acento}" stroke-width="1" stroke-linejoin="round" opacity="0.85"/>`;
    const corazon = `<path d="M100 18 C92 12.5 90.5 7.5 94 5.2 C96.6 3.6 99 5 100 7.3 C101 5 103.4 3.6 106 5.2 C109.5 7.5 108 12.5 100 18 Z" fill="${p.acento}" stroke="${tono(p.base, -0.5)}" stroke-width="0.6"/>`;
    return s + arriba(id, p, corazon) + costados(id, p, "♥", "✚", 8);
  },
  // Pentagrama: cinco líneas finas en el aro y notas.
  melodia: (id, p) => {
    let s = "";
    for (let k = -2; k <= 2; k++) s += `<circle cx="${C}" cy="${C}" r="${R_ARO + k * 2.3}" fill="none" stroke="${tono(p.acento, -0.1)}" stroke-width="0.45" opacity="0.75"/>`;
    const notas = ["♪", "♫", "♩", "♬"];
    for (let i = 0; i < 10; i++) {
      const a = 18 + i * 36;
      if (libre(a)) continue;
      const [x, y] = punto(R_ARO, a);
      s += texto(x, y, notas[i % 4], 9, p.acento);
    }
    return s + arriba(id, p, texto(C, 11, "𝄞", 17, p.acento, 400)) + costados(id, p, "♯", "♭", 9);
  },
  // Onda senoidal alrededor y un triángulo arriba.
  trigonometria: (id, p) => {
    const onda = curvaPolar((a) => R_ARO + 3.6 * Math.sin((a * 18 * Math.PI) / 180), 720);
    const s = `<path d="${onda}" fill="none" stroke="${p.acento}" stroke-width="1.1" opacity="0.9"/>` + puntos(18, R_ARO, 0.9, tono(p.base, -0.55), libre, 0.6);
    const triangulo = `<path d="M100 3.5 L109 17.5 H91 Z" fill="none" stroke="${p.acento}" stroke-width="1.6" stroke-linejoin="round"/><path d="M91 17.5 h3 v-3" fill="none" stroke="${p.acento}" stroke-width="0.9"/>`;
    return s + arriba(id, p, triangulo) + costados(id, p, "θ", "π", 9);
  },
  // Corona de laureles y un escudo arriba.
  historia: (id, p) => {
    const s = hojas(196, 344, 9, p.acento, tono(p.base, -0.5)) + hojas(164, 16, 9, p.acento, tono(p.base, -0.5));
    const escudo = `<path d="M93.5 4.5 H106.5 V11 C106.5 15 103.5 17.5 100 19 C96.5 17.5 93.5 15 93.5 11 Z" fill="${tono(p.acento, -0.05)}" stroke="${tono(p.base, -0.5)}" stroke-width="0.7"/>` + texto(C, 10.5, "Ⅹ", 7.5, tono(p.base, -0.4));
    return s + arriba(id, p, escudo);
  },
  // Integrales, infinito y diferenciales.
  calculia: (id, p) => {
    let s = marcasRadiales(72, R_ARO - 3.5, R_ARO + 3.5, tono(p.acento, -0.1), 0.6, libre, 0.4);
    const simbolos = ["∫", "∂", "∞", "Δ", "√", "∑"];
    for (let i = 0; i < 12; i++) {
      const a = 15 + i * 30;
      if (libre(a)) continue;
      const [x, y] = punto(R_ARO, a);
      s += `<circle cx="${x}" cy="${y}" r="5.2" fill="${tono(p.base, -0.45)}" opacity="0.9"/>` + texto(x, y, simbolos[i % 6], 7.5, p.acento);
    }
    return s + arriba(id, p, texto(C, 11, "∫", 16, p.acento, 400)) + costados(id, p, "∞", "∂", 9);
  },
  // Pistas de circuito con soldaduras y un rayo.
  circuitia: (id, p) => {
    let s = "";
    for (let i = 0; i < 20; i++) {
      const a = 9 + i * 18;
      if (libre(a)) continue;
      const lado = i % 2 === 0 ? 1 : -1;
      const [x0, y0] = punto(R_ARO + lado * 4.5, a - 4);
      const [x1, y1] = punto(R_ARO + lado * 4.5, a + 2);
      const [x2, y2] = punto(R_ARO - lado * 2, a + 6);
      s += `<path d="M${x0} ${y0} L${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${p.acento}" stroke-width="0.9" opacity="0.85"/><circle cx="${x2}" cy="${y2}" r="1.4" fill="${p.acento}"/><circle cx="${x0}" cy="${y0}" r="1" fill="none" stroke="${p.acento}" stroke-width="0.6"/>`;
    }
    const rayo = `<path d="M102.5 3.5 L94.5 12.5 H99.5 L97 19 L106 9.5 H100.8 Z" fill="${p.acento}" stroke="${tono(p.base, -0.5)}" stroke-width="0.5" stroke-linejoin="round"/>`;
    return s + arriba(id, p, rayo) + costados(id, p, "Ω", "+", 9);
  },
  // Histograma en campana sobre el aro y barras arriba.
  estadistica: (id, p) => {
    let s = "";
    for (let i = 0; i < 64; i++) {
      const a = (360 * i) / 64;
      if (libre(a)) continue;
      const campana = Math.exp(-(((((a + 180) % 360) - 180) / 70) ** 2)); // más altas cerca de arriba
      const [x0, y0] = punto(R_ARO - 4.5, a);
      const [x1, y1] = punto(R_ARO - 4.5 + 2.5 + 7 * campana, a);
      s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${p.acento}" stroke-width="1.6" stroke-linecap="round" opacity="0.75"/>`;
    }
    const barras = `<rect x="93" y="11" width="3.6" height="7" rx="0.6" fill="${p.acento}"/><rect x="98.2" y="5" width="3.6" height="13" rx="0.6" fill="${p.acento}"/><rect x="103.4" y="8.5" width="3.6" height="9.5" rx="0.6" fill="${p.acento}"/>`;
    return s + arriba(id, p, barras) + costados(id, p, "σ", "μ", 9);
  },
  // Los cuatro palos y una corona.
  naipia: (id, p) => {
    let s = marcasRadiales(48, R_ARO - 2, R_ARO + 2, tono(p.acento, -0.2), 0.8, libre, 0.45);
    const palos = ["♠", "♥", "♣", "♦"];
    for (let i = 0; i < 12; i++) {
      const a = 15 + i * 30;
      if (libre(a)) continue;
      const [x, y] = punto(R_ARO, a);
      const rojo = palos[i % 4] === "♥" || palos[i % 4] === "♦";
      s += `<circle cx="${x}" cy="${y}" r="5" fill="#FFF8E7"/>` + texto(x, y, palos[i % 4], 7.5, rojo ? "#C81E1E" : "#1F1F1F");
    }
    const corona = `<path d="M92 16.5 L93 7 L97 11.5 L100 4.5 L103 11.5 L107 7 L108 16.5 Z" fill="${p.acento}" stroke="${tono(p.base, -0.5)}" stroke-width="0.6" stroke-linejoin="round"/>`;
    return s + arriba(id, p, corona) + costados(id, p, "A", "K", 9);
  },
  // Código binario en bloques y las llaves.
  codia: (id, p) => {
    let s = "";
    const bits = "1011001110100101";
    for (let i = 0; i < 48; i++) {
      const a = (360 * i) / 48 + 3.75;
      if (libre(a)) continue;
      const [x, y] = punto(R_ARO, a);
      const uno = bits[i % bits.length] === "1";
      s += `<rect x="${f(x - 1.6)}" y="${f(y - (uno ? 3 : 1.6))}" width="3.2" height="${uno ? 6 : 3.2}" rx="0.5" transform="rotate(${f(a)} ${x} ${y})" fill="${p.acento}" opacity="${uno ? 0.9 : 0.45}"/>`;
    }
    return s + arriba(id, p, texto(C, 11, "‹/›", 10, p.acento)) + costados(id, p, "{", "}", 10);
  },
  // Órbitas y flechas que giran.
  dinamia: (id, p) => {
    let s = "";
    for (let i = 0; i < 18; i++) {
      const a = 10 + i * 20;
      if (libre(a)) continue;
      const [x0, y0] = punto(R_ARO + 3, a - 3);
      const [x1, y1] = punto(R_ARO, a + 2);
      const [x2, y2] = punto(R_ARO - 3, a - 3);
      s += `<path d="M${x0} ${y0} L${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${p.acento}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
    }
    const atomo =
      `<ellipse cx="100" cy="11" rx="9" ry="3.4" fill="none" stroke="${p.acento}" stroke-width="0.9"/>` +
      `<ellipse cx="100" cy="11" rx="9" ry="3.4" transform="rotate(60 100 11)" fill="none" stroke="${p.acento}" stroke-width="0.9"/>` +
      `<ellipse cx="100" cy="11" rx="9" ry="3.4" transform="rotate(-60 100 11)" fill="none" stroke="${p.acento}" stroke-width="0.9"/>` +
      `<circle cx="100" cy="11" r="2" fill="${p.acento}"/>`;
    return s + arriba(id, p, atomo) + costados(id, p, "F", "v", 9);
  },
  // Doble hélice de ADN con peldaños y una hoja.
  vitalia: (id, p) => {
    const n = 14;
    const h1 = curvaPolar((a) => R_ARO + 4.2 * Math.sin((a * n * Math.PI) / 180), 720);
    const h2 = curvaPolar((a) => R_ARO - 4.2 * Math.sin((a * n * Math.PI) / 180), 720);
    let s = `<path d="${h1}" fill="none" stroke="${p.acento}" stroke-width="1.2" opacity="0.9"/><path d="${h2}" fill="none" stroke="${tono(p.acento, -0.25)}" stroke-width="1.2" opacity="0.8"/>`;
    for (let i = 0; i < n * 4; i++) {
      const a = (360 * i) / (n * 4) + 360 / (n * 8);
      const amp = 4.2 * Math.sin((a * n * Math.PI) / 180);
      if (Math.abs(amp) < 1.2) continue;
      const [x0, y0] = punto(R_ARO + amp, a);
      const [x1, y1] = punto(R_ARO - amp, a);
      s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${tono(p.acento, -0.1)}" stroke-width="0.6" opacity="0.6"/>`;
    }
    const hoja = `<path d="M100 19 C92 15 92 7 100 3.5 C108 7 108 15 100 19 Z" fill="${p.acento}" stroke="${tono(p.base, -0.5)}" stroke-width="0.6"/><path d="M100 18 V6" stroke="${p.base}" stroke-width="0.8"/>`;
    return s + arriba(id, p, hoja) + costados(id, p, "✿", "❦", 9);
  },
};

export const CIUDADES_CON_MARCO = Object.keys(PALETA) as MundoCiudad[];

// SVG completo del marco de una ciudad (null si no existe).
export function svgMarcoMundo(ciudad: string): string | null {
  const p = PALETA[ciudad as MundoCiudad];
  if (!p) return null;
  const id = `m-${ciudad}`;
  const claro = tono(p.base, 0.55);
  const oscuro = tono(p.base, -0.55);
  const r0 = R_ARO - ANCHO_ARO / 2;
  const r1 = R_ARO + ANCHO_ARO / 2;
  const defs = `<defs>
<linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${claro}"/><stop offset="0.3" stop-color="${p.base}"/><stop offset="0.55" stop-color="${oscuro}"/><stop offset="0.8" stop-color="${p.base}"/><stop offset="1" stop-color="${tono(p.base, 0.3)}"/></linearGradient>
<radialGradient id="${id}-bisel" gradientUnits="userSpaceOnUse" cx="100" cy="100" r="100"><stop offset="${f(r0 / 100)}" stop-color="${oscuro}"/><stop offset="${f((R_ARO - 2) / 100)}" stop-color="${p.base}" stop-opacity="0"/><stop offset="${f((R_ARO + 2) / 100)}" stop-color="${p.base}" stop-opacity="0"/><stop offset="${f(r1 / 100)}" stop-color="${oscuro}"/></radialGradient>
<radialGradient id="${id}-halo" gradientUnits="userSpaceOnUse" cx="100" cy="100" r="100"><stop offset="0.8" stop-color="${p.base}" stop-opacity="0"/><stop offset="0.9" stop-color="${tono(p.base, 0.2)}" stop-opacity="0.45"/><stop offset="1" stop-color="${p.base}" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}-gema" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="${tono(p.base, 0.25)}"/><stop offset="0.6" stop-color="${tono(p.base, -0.35)}"/><stop offset="1" stop-color="${tono(p.base, -0.7)}"/></radialGradient>
</defs>`;
  const aro = [
    `<circle cx="${C}" cy="${C}" r="99" fill="url(#${id}-halo)"/>`,
    // Filete oscuro que abraza la foto y separa el marco del fondo.
    `<circle cx="${C}" cy="${C}" r="${R_FOTO + 1.2}" fill="none" stroke="${oscuro}" stroke-width="2.4"/>`,
    `<circle cx="${C}" cy="${C}" r="${R_FOTO + 2.6}" fill="none" stroke="${p.acento}" stroke-width="0.8" opacity="0.8"/>`,
    // Aro metálico con bisel.
    `<circle cx="${C}" cy="${C}" r="${R_ARO}" fill="none" stroke="url(#${id}-metal)" stroke-width="${ANCHO_ARO}"/>`,
    `<circle cx="${C}" cy="${C}" r="${R_ARO}" fill="none" stroke="url(#${id}-bisel)" stroke-width="${ANCHO_ARO}" opacity="0.7"/>`,
    `<circle cx="${C}" cy="${C}" r="${f(r0 + 0.4)}" fill="none" stroke="${p.acento}" stroke-width="0.7" opacity="0.9"/>`,
    `<circle cx="${C}" cy="${C}" r="${f(r1 - 0.4)}" fill="none" stroke="${tono(p.acento, -0.15)}" stroke-width="0.7" opacity="0.8"/>`,
    `<circle cx="${C}" cy="${C}" r="${f(r1 + 0.6)}" fill="none" stroke="${oscuro}" stroke-width="1.2"/>`,
  ].join("");
  // Brillo especular arriba a la izquierda y reflejo tenue abajo a la derecha.
  const brillo = `<path d="${arco(R_ARO + 2.5, 285, 335)}" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity="0.55"/><path d="${arco(R_ARO - 1.5, 290, 320)}" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" opacity="0.35"/><path d="${arco(R_ARO + 2, 115, 150)}" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.18"/>`;
  // Gema chica abajo.
  const abajo = medallon(id, C, 189, 5.5, p, `<circle cx="${C}" cy="189" r="2" fill="${p.acento}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">${defs}${aro}${MOTIVOS[ciudad as MundoCiudad](id, p)}${abajo}${brillo}</svg>`;
}
