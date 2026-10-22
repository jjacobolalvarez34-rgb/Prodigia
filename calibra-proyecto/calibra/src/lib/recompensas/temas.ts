// Temas de la app (pedido 2026-10-12; a la venta desde 0297): cambian la piel de toda
// Prodigia (fondo, tarjetas, bordes, textos y botones), nunca el contenido ni las
// pantallas. Se compran con Cometas (precio según su rareza) o salen en las cápsulas
// más poderosas (prisma, supernova, Alineación y Pro). Las maquetas de cada uno están
// en docs/rediseno (esteticas.html).
//
// Dos juegos de colores por tema:
//   - `colores`: los de la maqueta, para contar de dónde viene (inspiración).
//   - `paleta`: lo que de verdad se aplica en la web y en la app. Está ajustada para
//     que TODO texto se lea (temas.test.ts mide el contraste): texto y texto
//     secundario contra el fondo y las tres superficies, texto blanco sobre el botón
//     principal y texto oscuro sobre el dorado de logro. En los temas de tarjetas
//     claras sobre una mesa oscura (Mesa de cartas, Huerto) el fondo se aclaró para
//     que el mismo texto oscuro se lea en las dos.
// La miniatura de la tienda se dibuja con la paleta: lo que ves es lo que te pones.
//
// Este archivo es la fuente de 0297_temas_app.sql (catálogo y precios; temas.test.ts
// compara las filas).

export type RarezaTema = "comun" | "raro" | "epico" | "legendario";

export interface PaletaTema {
  // Fondo claro (texto oscuro) u oscuro (texto claro). Decide la barra de estado de la
  // app, el `color-scheme` de la web y cómo se ajustan los colores de acento al usarlos
  // como texto.
  claro: boolean;
  fondo: string;
  fondoHondo: string;
  superficie: string;
  superficie2: string;
  superficie3: string;
  borde: string;
  texto: string;
  texto2: string;
  // Rellenos: el botón principal lleva texto blanco y el de logro texto oscuro.
  primario: string;
  logro: string;
  correcto: string;
  error: string;
  racha: string;
}

export interface TemaApp {
  slug: string;
  nombre: string;
  inspiracion: string;
  descripcion: string;
  rareza: RarezaTema;
  colores: { fondo: string; tarjeta: string; borde: string; acento: string; detalle: string; texto: string };
  radio: number;
  borde: number;
  sombra: "dura" | "suave" | "ninguna";
  paleta: PaletaTema;
}

// El tema de siempre (Noche de Prodigia): gratis, es el que se tiene sin comprar nada.
export const TEMA_CLASICO = "clasico";

// Precio en Cometas según la rareza. Un tema cambia toda la app, así que cuesta más que
// un cosmético suelto de su misma rareza (un legendario suelto cuesta 600).
export const PRECIO_TEMA_COMETAS: Record<RarezaTema, number> = { comun: 200, raro: 350, epico: 500, legendario: 750 };

// Precio en Chispas de su rareza (precio_chispas_rareza, 0280): la base lo guarda en el
// catálogo para convertir en Chispas un tema que sale repetido en una cápsula (÷ 3).
export const PRECIO_CHISPAS_RAREZA_TEMA: Record<RarezaTema, number> = { comun: 400, raro: 1200, epico: 3000, legendario: 6000 };

export const TEMAS_APP: TemaApp[] = [
  {
    slug: "roguelike",
    nombre: "Mesa de cartas",
    inspiracion: "Roguelikes indie",
    descripcion: "Cada tarjeta es una carta color hueso con contorno negro, sobre una mesa lila. Botones azul de cobalto y detalles en rojo.",
    rareza: "epico",
    colores: { fondo: "#3A2470", tarjeta: "#F4EDE0", borde: "#0D0A14", acento: "#3B7BFF", detalle: "#FF4D3D", texto: "#1A1426" },
    radio: 5,
    borde: 2,
    sombra: "dura",
    paleta: { claro: true, fondo: "#D3C8EE", fondoHondo: "#C2B4E6", superficie: "#F4EDE0", superficie2: "#EAE0CD", superficie3: "#DED1B9", borde: "#0D0A14", texto: "#1A1426", texto2: "#463B5A", primario: "#2F6BEB", logro: "#F2B33D", correcto: "#1F8F5C", error: "#D63A2B", racha: "#E0651A" },
  },
  {
    slug: "rpg",
    nombre: "Reino",
    inspiracion: "Fantasía RPG",
    descripcion: "Paneles azul noche con marco dorado sobre un cielo azul de cuento. Todo con el brillo de un juego de aventuras.",
    rareza: "epico",
    colores: { fondo: "#4A6FE8", tarjeta: "#1D2B6B", borde: "#FFB627", acento: "#3A86FF", detalle: "#3DDC97", texto: "#FFFFFF" },
    radio: 7,
    borde: 2,
    sombra: "suave",
    paleta: { claro: false, fondo: "#3555C8", fondoHondo: "#2A47B0", superficie: "#1D2B6B", superficie2: "#243478", superficie3: "#2C3E88", borde: "#C9922A", texto: "#FFFFFF", texto2: "#D5DEFF", primario: "#2A5FD6", logro: "#FFB627", correcto: "#3DDC97", error: "#FF7A7A", racha: "#FF9A52" },
  },
  {
    slug: "cozy",
    nombre: "Huerto",
    inspiracion: "Pixel art acogedor",
    descripcion: "Papel cálido con marcos de madera sobre el pasto. Verde de huerta en los botones y todo amable.",
    rareza: "raro",
    colores: { fondo: "#5F9E3A", tarjeta: "#FBE2A8", borde: "#8A3F0A", acento: "#7ED957", detalle: "#FFB627", texto: "#3B1D07" },
    radio: 0,
    borde: 2,
    sombra: "ninguna",
    paleta: { claro: true, fondo: "#A8D186", fondoHondo: "#95C470", superficie: "#FBE2A8", superficie2: "#F5D592", superficie3: "#EDC77C", borde: "#8A3F0A", texto: "#3B1D07", texto2: "#5A3612", primario: "#2E7A1E", logro: "#F2B33D", correcto: "#2E7A1E", error: "#B8321F", racha: "#C2540E" },
  },
  {
    slug: "portatil",
    nombre: "Portátil",
    inspiracion: "Consolas de bolsillo de los 90",
    descripcion: "La pantalla de cuatro verdes de las consolas de bolsillo: todo en verde, con bordes de verde oscuro.",
    rareza: "comun",
    colores: { fondo: "#9BBC0F", tarjeta: "#9BBC0F", borde: "#0F380F", acento: "#0F380F", detalle: "#306230", texto: "#0F380F" },
    radio: 0,
    borde: 2,
    sombra: "ninguna",
    paleta: { claro: true, fondo: "#9BBC0F", fondoHondo: "#8BAC0F", superficie: "#B5CF3C", superficie2: "#A6C426", superficie3: "#8BAC0F", borde: "#0F380F", texto: "#0F380F", texto2: "#173F17", primario: "#0F380F", logro: "#D4E36A", correcto: "#306230", error: "#6B1F0F", racha: "#5A3A05" },
  },
  {
    slug: "academia",
    nombre: "Biblioteca",
    inspiracion: "Dark academia",
    descripcion: "Cuero oscuro, letras color pergamino y filetes de bronce. El violeta de Prodigia como tinta en los botones.",
    rareza: "epico",
    colores: { fondo: "#21160F", tarjeta: "#DCCDAB", borde: "#A07D42", acento: "#5B3FC4", detalle: "#8A1F2B", texto: "#2A1A12" },
    radio: 2,
    borde: 1,
    sombra: "suave",
    paleta: { claro: false, fondo: "#21160F", fondoHondo: "#170F0A", superficie: "#33241A", superficie2: "#3D2C20", superficie3: "#4A3527", borde: "#A07D42", texto: "#EFE3C8", texto2: "#C8B48E", primario: "#5B3FC4", logro: "#E0B95A", correcto: "#7FC98A", error: "#E0727A", racha: "#E39A55" },
  },
  {
    slug: "mitologia",
    nombre: "Olimpo",
    inspiracion: "Mitología ilustrada",
    descripcion: "Negro profundo, fuego y oro. Filetes dorados y botones color brasa.",
    rareza: "legendario",
    colores: { fondo: "#0C0606", tarjeta: "#1D0F0B", borde: "#B8862C", acento: "#E0482C", detalle: "#F2C14E", texto: "#F6E8CC" },
    radio: 0,
    borde: 1,
    sombra: "ninguna",
    paleta: { claro: false, fondo: "#0C0606", fondoHondo: "#060303", superficie: "#1D0F0B", superficie2: "#26140E", superficie3: "#331B12", borde: "#B8862C", texto: "#F6E8CC", texto2: "#C9AE86", primario: "#C23A22", logro: "#F2C14E", correcto: "#6FD39A", error: "#FF6F5A", racha: "#FF8A3D" },
  },
  {
    slug: "suizo",
    nombre: "Imprenta",
    inspiracion: "Diseño editorial suizo",
    descripcion: "Blanco, negro y un solo color fuerte. Bordes negros y nada que sobre.",
    rareza: "comun",
    colores: { fondo: "#FFFFFF", tarjeta: "#FFFFFF", borde: "#0A0A0A", acento: "#5B3CF5", detalle: "#FFB000", texto: "#0A0A0A" },
    radio: 0,
    borde: 2,
    sombra: "dura",
    paleta: { claro: true, fondo: "#FFFFFF", fondoHondo: "#F2F2F2", superficie: "#FFFFFF", superficie2: "#F2F2F2", superficie3: "#E6E6E6", borde: "#0A0A0A", texto: "#0A0A0A", texto2: "#4A4A4A", primario: "#5B3CF5", logro: "#FFB000", correcto: "#13804F", error: "#D0312D", racha: "#C2540E" },
  },
  {
    slug: "papeleria",
    nombre: "Cuaderno",
    inspiracion: "Papelería japonesa",
    descripcion: "Papel blanco, tinta azul pizarra, lila de resaltador y amarillo de nota adhesiva.",
    rareza: "comun",
    colores: { fondo: "#FBFAF5", tarjeta: "#FFFFFF", borde: "#36314D", acento: "#B3A6FF", detalle: "#FFF07A", texto: "#36314D" },
    radio: 6,
    borde: 1,
    sombra: "dura",
    paleta: { claro: true, fondo: "#FBFAF5", fondoHondo: "#F1EFE6", superficie: "#FFFFFF", superficie2: "#F4F1FF", superficie3: "#ECE7FF", borde: "#36314D", texto: "#36314D", texto2: "#5E5875", primario: "#6A55D9", logro: "#FFE25A", correcto: "#1E8A5A", error: "#D0405A", racha: "#C2540E" },
  },
  {
    slug: "espacial",
    nombre: "Misión",
    inspiracion: "Carrera espacial retro",
    descripcion: "Consolas de control azul marino, letras color crema y naranja de cohete en los botones.",
    rareza: "raro",
    colores: { fondo: "#0A1020", tarjeta: "#152140", borde: "#2C3B62", acento: "#FF8A3D", detalle: "#3AC7C0", texto: "#F1E6CF" },
    radio: 7,
    borde: 1,
    sombra: "ninguna",
    paleta: { claro: false, fondo: "#0A1020", fondoHondo: "#060A15", superficie: "#152140", superficie2: "#1B2A4E", superficie3: "#22335C", borde: "#2C3B62", texto: "#F1E6CF", texto2: "#A9B3C9", primario: "#B84E14", logro: "#FFB45A", correcto: "#3AC7C0", error: "#FF6B5D", racha: "#FF8A3D" },
  },
  {
    slug: "geometria",
    nombre: "Atardecer",
    inspiracion: "Geometría imposible",
    descripcion: "Cielo pastel de atardecer, tarjetas color melocotón y lavanda en los botones.",
    rareza: "raro",
    colores: { fondo: "#F7DCCF", tarjeta: "#FFF6EF", borde: "#E0BFD8", acento: "#9D8DF1", detalle: "#EF8B78", texto: "#3D3358" },
    radio: 3,
    borde: 0,
    sombra: "dura",
    paleta: { claro: true, fondo: "#F7DCCF", fondoHondo: "#F0CDBD", superficie: "#FFF6EF", superficie2: "#FBEBE1", superficie3: "#F3DDD2", borde: "#E0BFD8", texto: "#3D3358", texto2: "#5A5073", primario: "#6F5ED6", logro: "#F5B860", correcto: "#1E8A5A", error: "#C8483A", racha: "#C2540E" },
  },
  {
    slug: "arcade",
    nombre: "Recreativa",
    inspiracion: "Salones arcade de los 90",
    descripcion: "Negro de pantalla de tubo, bordes de neón cian, botones magenta y el amarillo de los marcadores.",
    rareza: "legendario",
    colores: { fondo: "#07020F", tarjeta: "#0D0520", borde: "#2FF3FF", acento: "#FFE14D", detalle: "#FF2FD6", texto: "#F6F2FF" },
    radio: 0,
    borde: 1,
    sombra: "ninguna",
    paleta: { claro: false, fondo: "#07020F", fondoHondo: "#030108", superficie: "#0D0520", superficie2: "#140A2C", superficie3: "#1C0F3A", borde: "#2FF3FF", texto: "#F6F2FF", texto2: "#B7AED6", primario: "#C214A3", logro: "#FFE14D", correcto: "#3DFFB0", error: "#FF4D6D", racha: "#FF9A3D" },
  },
  {
    slug: "atlas",
    nombre: "Atlas",
    inspiracion: "Mapas antiguos",
    descripcion: "Papel de mapa, tinta azul de imprenta, filetes oscuros y el ocre de las rutas.",
    rareza: "raro",
    colores: { fondo: "#EFE3C6", tarjeta: "#F6EDD6", borde: "#3A3324", acento: "#1F2C45", detalle: "#C4502A", texto: "#1F2C45" },
    radio: 2,
    borde: 1,
    sombra: "ninguna",
    paleta: { claro: true, fondo: "#EFE3C6", fondoHondo: "#E5D6B4", superficie: "#F6EDD6", superficie2: "#ECE0C2", superficie3: "#E2D4B2", borde: "#3A3324", texto: "#1F2C45", texto2: "#474232", primario: "#1F2C45", logro: "#E8A93A", correcto: "#2E6E3A", error: "#B23E1E", racha: "#A84A1A" },
  },
];

export function temaAppDe(slug: string | null | undefined): TemaApp | null {
  return (slug && TEMAS_APP.find((t) => t.slug === slug)) || null;
}

// Slug del tema en el catálogo de la base (catalogo_cosmeticos, categoría 'tema').
export function itemTema(slug: string): string {
  return `tema_${slug}`;
}

export function precioTemaCometas(t: TemaApp): number {
  return PRECIO_TEMA_COMETAS[t.rareza];
}

// ---------- Contraste (WCAG 2) ----------
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const largo = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(largo, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hex([r, g, b]: [number, number, number]): string {
  return `#${((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1).toUpperCase()}`;
}

export function luminancia(color: string): number {
  const [r, g, b] = rgb(color).map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const x = luminancia(a);
  const y = luminancia(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function mezclar(a: string, b: string, t: number): string {
  const x = rgb(a);
  const y = rgb(b);
  return hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

// Un color de acento convertido en "tinta": el mismo tono, oscurecido (sobre fondos
// claros) o aclarado (sobre oscuros) lo justo para leerse sobre todos los fondos dados.
export function tintaLegible(color: string, fondos: string[], minimo = 4.5): string {
  if (fondos.every((f) => contraste(color, f) >= minimo)) return color;
  const claros = fondos.reduce((a, f) => a + luminancia(f), 0) / fondos.length > 0.18;
  const hacia = claros ? "#000000" : "#FFFFFF";
  for (let i = 1; i <= 20; i++) {
    const c = mezclar(color, hacia, i / 20);
    if (fondos.every((f) => contraste(c, f) >= minimo)) return c;
  }
  return hacia;
}

// ---------- Lo que se aplica ----------
// Todos los colores que usan la web (variables CSS de globals.css) y la app (`color`
// de mobile/src/tema.ts) para un tema. Las "tintas" son los acentos usados como texto.
export interface TokensTema {
  slug: string;
  claro: boolean;
  fondo: string;
  fondoHondo: string;
  superficie: string;
  superficie2: string;
  superficie3: string;
  borde: string;
  texto: string;
  texto2: string;
  primario: string;
  primarioNeon: string;
  primarioClaro: string;
  primarioLabio: string;
  logro: string;
  logroLabio: string;
  correcto: string;
  error: string;
  racha: string;
  tintaPrimario: string;
  tintaLogro: string;
  tintaCorrecto: string;
  tintaError: string;
  tintaRacha: string;
}

export function tokensTema(slug: string | null | undefined): TokensTema | null {
  const t = temaAppDe(slug);
  if (!t) return null;
  const p = t.paleta;
  const superficies = [p.superficie, p.superficie2];
  const tinta = (c: string) => tintaLegible(c, superficies);
  return {
    slug: t.slug,
    claro: p.claro,
    fondo: p.fondo,
    fondoHondo: p.fondoHondo,
    superficie: p.superficie,
    superficie2: p.superficie2,
    superficie3: p.superficie3,
    borde: p.borde,
    texto: p.texto,
    texto2: p.texto2,
    primario: p.primario,
    // En la app el "neón" y el "claro" del primario se usan como texto y bordes de acento.
    primarioNeon: p.claro ? tinta(p.primario) : tintaLegible(mezclar(p.primario, "#FFFFFF", 0.25), superficies, 3),
    primarioClaro: p.claro ? tinta(p.primario) : tinta(mezclar(p.primario, "#FFFFFF", 0.55)),
    primarioLabio: mezclar(p.primario, "#000000", 0.38),
    logro: p.logro,
    logroLabio: mezclar(p.logro, "#000000", 0.35),
    correcto: p.correcto,
    error: p.error,
    racha: p.racha,
    tintaPrimario: tinta(p.primario),
    tintaLogro: tinta(p.logro),
    tintaCorrecto: tinta(p.correcto),
    tintaError: tinta(p.error),
    tintaRacha: tinta(p.racha),
  };
}

// Variables CSS de la web (globals.css) para un tema. AplicarTemaApp las pone en <html>
// (y el script de arranque del layout, antes de pintar, desde localStorage).
export function variablesCssTema(slug: string | null | undefined): Record<string, string> | null {
  const k = tokensTema(slug);
  if (!k) return null;
  return {
    "--background": k.fondo,
    "--foreground": k.texto,
    "--texto-secundario": k.texto2,
    "--surface": k.superficie,
    "--surface-2": k.superficie2,
    "--border": k.borde,
    "--primario": k.primario,
    "--correcto": k.correcto,
    "--racha": k.racha,
    "--error": k.error,
    "--logro": k.logro,
    "--tinta-primario": k.tintaPrimario,
    "--tinta-logro": k.tintaLogro,
    "--tinta-correcto": k.tintaCorrecto,
    "--tinta-error": k.tintaError,
    "--tinta-racha": k.tintaRacha,
    // Copias fijas para volver a la tinta del tema dentro de una tarjeta (globals.css).
    "--tema-texto": k.texto,
    "--tema-texto2": k.texto2,
    "--tema-tinta-logro": k.tintaLogro,
    "--tema-tinta-primario": k.tintaPrimario,
    "--tema-tinta-correcto": k.tintaCorrecto,
    "--tema-tinta-error": k.tintaError,
    "--tema-tinta-racha": k.tintaRacha,
  };
}
