import type { Dibujo } from "./dibujos";
import type { FormaIlustracion } from "@/lib/tienda/ilustracionesPaquetes";

// Escenas de los minieventos de las fiestas de febrero a septiembre (0311, minieventos.ts).
// Mismo estilo que escenaOfrenda y escenaLamparas: formas planas, sin destellos.

function rect(x: number, y: number, w: number, h: number): string {
  return `M${x} ${y}h${w}v${h}h${-w}z`;
}

function circ(x: number, y: number, r: number): string {
  return `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`;
}

function elip(x: number, y: number, rx: number, ry: number): string {
  return `M${x - rx} ${y}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0z`;
}

const r2 = (n: number) => +n.toFixed(2);

// Año Nuevo Lunar: los 3 sobres rojos del día. Abierto: asoma la moneda; alcanzado y sin
// abrir: brilla el borde; todavía no: apagado. 180 × 80.
export function escenaSobres(estado: ("cerrado" | "listo" | "abierto")[]): Dibujo {
  const formas: FormaIlustracion[] = [];
  // Faroles colgando arriba.
  formas.push({ d: "M0 6Q90 16 180 6", trazo: "#FFC53D", ancho: 0.8, opacidad: 0.6 });
  for (const x of [20, 62, 104, 146]) {
    const y = 8 + Math.sin((x / 180) * Math.PI) * 4;
    formas.push({ d: elip(x, y + 6, 6, 6.5), relleno: "#E63946", opacidad: 0.85 });
    formas.push({ d: rect(x - 4, y - 1, 8, 1.8) + rect(x - 4, y + 11.5, 8, 1.8), relleno: "#FFC53D", opacidad: 0.85 });
  }
  estado.forEach((e, i) => {
    const x = 30 + i * 60;
    const y = 30;
    const apagado = e === "cerrado";
    if (e === "listo") formas.push({ d: rect(x - 18, y - 4, 36, 50), relleno: "#FFC53D", opacidad: 0.18 });
    if (e === "abierto") {
      // La solapa abierta y la moneda que asoma.
      formas.push({ d: `M${x - 14} ${y}l14 -10 14 10z`, relleno: "#C1121F" });
      formas.push({ d: circ(x, y - 1, 8.5), relleno: "#FFC53D" });
      formas.push({ d: rect(x - 2.5, y - 3.5, 5, 5), relleno: "#7A1010" });
    }
    formas.push({ d: rect(x - 14, y, 28, 42), relleno: apagado ? "#5C1A1F" : "#E63946" });
    if (e !== "abierto") formas.push({ d: `M${x - 14} ${y}l14 12 14 -12z`, relleno: apagado ? "#4A1418" : "#C1121F" });
    formas.push({ d: rect(x - 14, y + 30, 28, 3), relleno: apagado ? "#7A5A20" : "#FFC53D", opacidad: 0.9 });
    formas.push({ d: circ(x, y + 21, 4.5), relleno: apagado ? "#7A5A20" : "#FFC53D" });
    formas.push({ d: rect(x - 2, y + 19, 4, 4), relleno: apagado ? "#4A1418" : "#C1121F" });
  });
  return { ancho: 180, alto: 80, formas };
}

// Carnaval: la comparsa. Un bailarín por cada 10 aciertos de Melodía (hasta 10), con su
// tocado de plumas; delante, dos tambores. 200 × 80.
export function escenaComparsa(bailarines: number): Dibujo {
  const formas: FormaIlustracion[] = [];
  formas.push({ d: rect(0, 66, 200, 14), relleno: "#0B2A1F" });
  formas.push({ d: "M0 66h200", trazo: "#FFC53D", ancho: 0.8, opacidad: 0.5 });
  // Banderines.
  const colores = ["#3DDC97", "#FFC53D", "#FF5D8F", "#7C5CFF", "#4FE0F5"];
  formas.push({ d: "M0 5Q100 15 200 5", trazo: "#F4EAD5", ancho: 0.7, opacidad: 0.6 });
  for (let i = 0; i < 12; i++) {
    const x = 6 + i * 16.5;
    const y = 6 + Math.sin((i / 11) * Math.PI) * 4.4;
    formas.push({ d: `M${r2(x)} ${r2(y)}h10l-5 8z`, relleno: colores[i % colores.length], opacidad: 0.9 });
  }
  const n = Math.max(0, Math.min(10, bailarines));
  for (let i = 0; i < 10; i++) {
    const x = 14 + i * 19;
    const y = 64 - (i % 2) * 3;
    const activo = i < n;
    const c = colores[i % colores.length];
    if (!activo) {
      formas.push({ d: circ(x, y - 24, 3.6) + `M${x - 4} ${y - 19}h8l2 19h-12z`, relleno: "#ffffff", opacidad: 0.07 });
      continue;
    }
    // Plumas del tocado.
    formas.push({ d: `M${x} ${y - 28}c-5-6-9-8-12-7 2 3 6 6 12 7zM${x} ${y - 28}c5-6 9-8 12-7-2 3-6 6-12 7zM${x} ${y - 28}c-1-7 0-11 0-13 1 2 2 6 0 13z`, relleno: c });
    formas.push({ d: circ(x, y - 24, 3.6), relleno: "#E8B48A" });
    formas.push({ d: `M${x - 4} ${y - 19}h8l3 13h-14z`, relleno: c });
    formas.push({ d: `M${x - 7} ${y - 6}h14l-2 6h-10z`, relleno: "#FFFFFF", opacidad: 0.85 });
    formas.push({ d: `M${x - 4} ${y - 17}l-5 -6M${x + 4} ${y - 17}l5 -6`, trazo: "#E8B48A", ancho: 1.6 });
  }
  // Tambores.
  for (const x of [8, 192]) {
    formas.push({ d: rect(x - 7, 62, 14, 12), relleno: "#C2410C" });
    formas.push({ d: elip(x, 62, 7, 2.2), relleno: "#F4EAD5" });
    formas.push({ d: `M${x - 7} 64l14 8M${x + 7} 64l-14 8`, trazo: "#FFC53D", ancho: 0.8 });
  }
  return { ancho: 200, alto: 80, formas };
}

// Noches de linternas: luna creciente y una linterna por noche del evento (las de las
// preguntas acertadas suben encendidas). 160 × 90.
export function escenaLinternas(encendidas: boolean[]): Dibujo {
  const formas: FormaIlustracion[] = [];
  // Estrellas quietas.
  formas.push({ d: [circ(14, 12, 0.8), circ(40, 26, 0.6), circ(70, 8, 0.7), circ(132, 30, 0.6), circ(150, 10, 0.8), circ(100, 18, 0.5)].join(""), relleno: "#FFFFFF", opacidad: 0.6 });
  // Luna creciente.
  formas.push({ d: "M128 6a16 16 0 1 0 14 26a13 13 0 0 1-14-26z", relleno: "#FFF3C4" });
  // Ciudad dormida.
  const casas = [
    [0, 70, 26],
    [26, 62, 22],
    [48, 74, 30],
    [78, 60, 20],
    [98, 68, 34],
    [132, 64, 28],
  ] as const;
  for (const [x, y, w] of casas) formas.push({ d: `M${x} 90V${y + 6}l${w / 2} -6 ${w / 2} 6V90z`, relleno: "#0F2A2A" });
  const n = Math.max(1, encendidas.length);
  encendidas.forEach((on, i) => {
    const x = 30 + (i - (n - 1) / 2) * 32 + 50;
    const y = on ? 26 + (i % 2) * 8 : 66;
    if (on) formas.push({ d: circ(x, y + 5, 11), relleno: "#FFC53D", opacidad: 0.15 });
    formas.push({ d: `M${x - 6} ${y}h12l2.5 13h-17z`, relleno: on ? "#FFB347" : "#3A3A2A" });
    formas.push({ d: `M${x - 4.5} ${y + 2}h9l1.6 9h-12.2z`, relleno: on ? "#FFD98A" : "#4A4A36" });
    formas.push({ d: rect(x - 6.5, y - 1.6, 13, 1.8), relleno: on ? "#3DDC97" : "#2A3A30" });
  });
  return { ancho: 160, alto: 90, formas };
}

// Holi: la ciudad se va pintando; una mancha de color por acierto (hasta `meta`). 200 × 80.
export function escenaHoli(manchas: number, meta: number): Dibujo {
  const formas: FormaIlustracion[] = [];
  const casas = [
    [0, 30, 34],
    [34, 22, 30],
    [64, 34, 36],
    [100, 18, 34],
    [134, 28, 32],
    [166, 24, 34],
  ] as const;
  for (const [x, y, w] of casas) {
    formas.push({ d: `M${x} 80V${y + 8}l${w / 2} -8 ${w / 2} 8V80z`, relleno: "#F4EAD5", opacidad: 0.92 });
    formas.push({ d: rect(x + w / 2 - 4, 66, 8, 14), relleno: "#7A4A1E", opacidad: 0.7 });
  }
  const colores = ["#FF5D8F", "#3DDC97", "#FFC53D", "#4FE0F5", "#A794FF", "#FF8A1F"];
  const porColor: string[][] = colores.map(() => []);
  const total = Math.min(manchas, meta);
  for (let i = 0; i < total; i++) {
    // Posición pseudoaleatoria fija por índice, para que no salten al recargar.
    const x = (i * 37.3 + 11) % 196 + 2;
    const y = 26 + ((i * 53.7 + 7) % 50);
    const r = 3 + ((i * 13) % 4);
    porColor[i % colores.length].push(circ(r2(x), r2(y), r) + circ(r2(x + r * 0.9), r2(y - r * 0.6), r2(r * 0.45)));
  }
  porColor.forEach((ds, i) => {
    if (ds.length) formas.push({ d: ds.join(""), relleno: colores[i], opacidad: 0.78 });
  });
  formas.push({ d: rect(0, 78, 200, 2), relleno: "#3B0B2E" });
  return { ancho: 200, alto: 80, formas };
}

// Pascua: los huevos del evento sobre el pasto (los encontrados, pintados). 160 × 56.
export function escenaHuevos(encontrados: boolean[]): Dibujo {
  const formas: FormaIlustracion[] = [];
  formas.push({ d: "M0 40c20-6 40-6 60-2s50 6 100-4V56H0z", relleno: "#1F8A5B" });
  formas.push({ d: "M6 40l2-5 2 5M30 37l2-6 2 6M128 36l2-5 2 5M150 34l2-6 2 6", trazo: "#3DDC97", ancho: 1.2 });
  const pinturas = [
    ["#9BE7FF", "#FF5D8F"],
    ["#FFB3C7", "#FFD36B"],
    ["#FFD36B", "#3DDC97"],
    ["#B8F5D0", "#A794FF"],
  ];
  const n = Math.max(1, encontrados.length);
  encontrados.forEach((ok, i) => {
    const x = 160 / (n + 1) * (i + 1);
    const y = 34;
    const d = `M${r2(x)} ${y - 15}c6 0 10 8 10 14a10 10 0 0 1-20 0c0-6 4-14 10-14z`;
    if (!ok) {
      formas.push({ d, trazo: "#FFFFFF", ancho: 1.2, opacidad: 0.35 });
      return;
    }
    const [a, b] = pinturas[i % pinturas.length];
    formas.push({ d, relleno: a });
    formas.push({ d: `M${r2(x - 9.5)} ${y - 4}c3 2 6-2 9.5 0s6.5 2 9.5 0`, trazo: b, ancho: 2.2 });
    formas.push({ d: `M${r2(x - 9)} ${y + 2}c3 2 6-2 9 0s6 2 9 0`, trazo: "#FFFFFF", ancho: 1.6, opacidad: 0.7 });
  });
  return { ancho: 160, alto: 56, formas };
}

// Día de la Tierra: un bosque que crece. `fraccion` (0 a 1) del camino a la meta: hasta
// 30 árboles. 200 × 80.
export function escenaBosque(fraccion: number): Dibujo {
  const formas: FormaIlustracion[] = [];
  formas.push({ d: circ(170, 18, 9), relleno: "#FFD36B", opacidad: 0.9 });
  formas.push({ d: "M0 64c40-8 80-8 120-3s60 2 80-2V80H0z", relleno: "#7A4A1E" });
  formas.push({ d: "M0 66c40-8 80-8 120-3s60 2 80-2", trazo: "#3DDC97", ancho: 2 });
  const total = 30;
  const n = Math.round(Math.max(0, Math.min(1, fraccion)) * total);
  const copas: string[] = [];
  const copasClaras: string[] = [];
  const troncos: string[] = [];
  const brotes: string[] = [];
  for (let i = 0; i < total; i++) {
    const x = 6 + ((i * 67) % total) * (188 / total);
    const base = 64 - Math.sin((x / 200) * Math.PI) * 3;
    if (i < n) {
      const alto = 14 + ((i * 7) % 9);
      troncos.push(rect(r2(x - 1.2), r2(base - alto * 0.4), 2.4, r2(alto * 0.4)));
      (i % 3 === 0 ? copasClaras : copas).push(`M${r2(x)} ${r2(base - alto)}l${r2(alto * 0.32)} ${r2(alto * 0.62)}h${r2(-alto * 0.64)}z`);
    } else if (i < n + 4) brotes.push(`M${r2(x)} ${r2(base)}v-3`);
  }
  if (troncos.length) formas.push({ d: troncos.join(""), relleno: "#5A3414" });
  if (copas.length) formas.push({ d: copas.join(""), relleno: "#1F8A5B" });
  if (copasClaras.length) formas.push({ d: copasClaras.join(""), relleno: "#3DDC97" });
  if (brotes.length) formas.push({ d: brotes.join(""), trazo: "#7FF0C8", ancho: 1.2 });
  return { ancho: 200, alto: 80, formas };
}

// Día de la Música: un pentagrama con 16 notas; las tocadas, encendidas. 200 × 60.
export function escenaPentagrama(tocadas: number, total = 16): Dibujo {
  const formas: FormaIlustracion[] = [];
  const lineas = [14, 22, 30, 38, 46].map((y) => `M6 ${y}h188`).join("");
  formas.push({ d: lineas, trazo: "#FFFFFF", ancho: 0.8, opacidad: 0.35 });
  // Clave (una espiral simple).
  formas.push({ d: "M18 52c-6-2-4-10 2-10s6 10-2 12c-8 2-12-10-4-18 5-5 8-12 6-22-3 2-5 8-2 16l6 22", trazo: "#FFC53D", ancho: 1.6 });
  const altura = [34, 30, 26, 30, 34, 38, 34, 26, 22, 26, 30, 34, 30, 26, 30, 34];
  const on: string[] = [];
  const onPalo: string[] = [];
  const off: string[] = [];
  for (let i = 0; i < total; i++) {
    const x = 38 + i * 9.6;
    const y = altura[i % altura.length];
    const cabeza = elip(r2(x), y, 3.2, 2.4);
    if (i < tocadas) {
      on.push(cabeza);
      onPalo.push(`M${r2(x + 3)} ${y}v-14`);
    } else off.push(cabeza);
  }
  if (off.length) formas.push({ d: off.join(""), trazo: "#FFFFFF", ancho: 0.9, opacidad: 0.3 });
  if (on.length) {
    formas.push({ d: onPalo.join(""), trazo: "#A794FF", ancho: 1.2 });
    formas.push({ d: on.join(""), relleno: "#FFC53D" });
  }
  return { ancho: 200, alto: 60, formas };
}

// Vuelta a clases: el cuaderno de la semana, una página por día (las llenas, con su
// visto bueno). 210 × 60.
export function escenaCuaderno(paginas: ("vacia" | "hoy" | "llena")[]): Dibujo {
  const formas: FormaIlustracion[] = [];
  paginas.forEach((p, i) => {
    const x = 4 + i * 29.5;
    formas.push({ d: rect(x, 8, 25, 44), relleno: p === "llena" ? "#FFFFFF" : "#E8F4FF", opacidad: p === "vacia" ? 0.25 : 0.95 });
    if (p === "hoy") formas.push({ d: rect(x - 1, 7, 27, 46), trazo: "#FFC53D", ancho: 1.4 });
    formas.push({ d: [16, 24, 32, 40, 48].map((y) => `M${r2(x + 3)} ${y}h19`).join(""), trazo: "#5DE4FF", ancho: 0.6, opacidad: p === "vacia" ? 0.3 : 0.7 });
    formas.push({ d: `M${r2(x + 6)} 8v44`, trazo: "#FF5D8F", ancho: 0.6, opacidad: 0.6 });
    // Anillas.
    formas.push({ d: circ(r2(x + 12.5), 6, 1.6), trazo: "#A6B4C8", ancho: 0.9 });
    if (p === "llena") formas.push({ d: `M${r2(x + 7)} 30l4 5 8-11`, trazo: "#3DDC97", ancho: 2.4 });
  });
  return { ancho: 210, alto: 60, formas };
}
